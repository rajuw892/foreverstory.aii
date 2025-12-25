// ========================================
// Razorpay Payment Creation (India)
// Creates Razorpay order for India-based payments
// ========================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Pricing configuration (in paise)
const PRICING = {
  basic: 19900,    // ₹199
  premium: 29900,  // ₹299
  deluxe: 79900,   // ₹799
};

// Tier descriptions
const TIER_DESCRIPTIONS: Record<string, { name: string; description: string }> = {
  basic: {
    name: 'Basic - Full HD Video',
    description: 'Full 2.5-minute cinematic HD video',
  },
  premium: {
    name: 'Premium - 4K Cinematic',
    description: '4K video + all 24 styles + custom music',
  },
  deluxe: {
    name: 'Deluxe - Animated Cartoon',
    description: 'Full animated cartoon video with your faces',
  },
};

// ========================================
// Razorpay Configuration
// ========================================

interface RazorpayOrderResponse {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  status: string;
  attempts: number;
  created_at: number;
}

async function createRazorpayOrder(
  amount: number,
  receipt: string,
  notes: Record<string, string>
): Promise<RazorpayOrderResponse> {
  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!;
  const keySecret = process.env.RAZORPAY_KEY_SECRET!;

  if (!keyId || !keySecret) {
    throw new Error('Razorpay credentials not configured');
  }

  const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');

  const response = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${auth}`,
    },
    body: JSON.stringify({
      amount, // in paise
      currency: 'INR',
      receipt,
      notes,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Razorpay API error: ${error}`);
  }

  return await response.json();
}

// ========================================
// POST Handler
// ========================================

export async function POST(request: NextRequest) {
  try {
    const { jobId, tier = 'basic' } = await request.json();

    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      );
    }

    // Validate tier
    if (!['basic', 'premium', 'deluxe'].includes(tier)) {
      return NextResponse.json(
        { error: 'Invalid tier. Must be basic, premium, or deluxe' },
        { status: 400 }
      );
    }

    // Verify story exists
    const { data: story, error: storyError } = await supabase
      .from('stories')
      .select('id, story_data, paid')
      .eq('id', jobId)
      .single();

    if (storyError || !story) {
      return NextResponse.json(
        { error: 'Story not found' },
        { status: 404 }
      );
    }

    // Check if already paid
    if (story.paid) {
      return NextResponse.json(
        { error: 'Story already purchased' },
        { status: 400 }
      );
    }

    // Get pricing for tier
    const priceAmount = PRICING[tier as keyof typeof PRICING];
    const tierInfo = TIER_DESCRIPTIONS[tier];

    // Create Razorpay order
    const receipt = `fs_${jobId}_${Date.now()}`;
    const order = await createRazorpayOrder(
      priceAmount,
      receipt,
      {
        jobId,
        tier,
        description: tierInfo.description,
      }
    );

    console.log('[Razorpay] Order created:', order.id);

    // Create payment record
    await supabase.from('payments').insert({
      story_id: jobId,
      amount: priceAmount,
      currency: 'inr',
      tier,
      gateway: 'razorpay',
      razorpay_order_id: order.id,
      status: 'pending',
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: priceAmount,
      currency: 'INR',
      tier,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      name: tierInfo.name,
      description: tierInfo.description,
      prefill: {
        name: story.story_data?.partner1Name || '',
      },
    });

  } catch (error) {
    console.error('[Razorpay Create] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create Razorpay order' },
      { status: 500 }
    );
  }
}

// ========================================
// Verify Razorpay Payment Signature
// Called from frontend after payment
// ========================================

interface VerifyPaymentRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  jobId: string;
}

function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  const keySecret = process.env.RAZORPAY_KEY_SECRET!;
  const body = orderId + '|' + paymentId;
  const expectedSignature = crypto
    .createHmac('sha256', keySecret)
    .update(body)
    .digest('hex');

  return expectedSignature === signature;
}

export async function PUT(request: NextRequest) {
  try {
    const body: VerifyPaymentRequest = await request.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, jobId } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !jobId) {
      return NextResponse.json(
        { error: 'Missing payment verification data' },
        { status: 400 }
      );
    }

    // Verify signature
    const isValid = verifyRazorpaySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValid) {
      console.error('[Razorpay Verify] Invalid signature');
      return NextResponse.json(
        { error: 'Invalid payment signature' },
        { status: 400 }
      );
    }

    console.log('[Razorpay Verify] Payment verified:', razorpay_payment_id);

    // Update payment record
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('*')
      .eq('razorpay_order_id', razorpay_order_id)
      .single();

    if (paymentError || !payment) {
      return NextResponse.json(
        { error: 'Payment record not found' },
        { status: 404 }
      );
    }

    // Update payment status
    await supabase
      .from('payments')
      .update({
        razorpay_payment_id,
        status: 'completed',
        updated_at: new Date().toISOString(),
      })
      .eq('razorpay_order_id', razorpay_order_id);

    // Update story as paid
    await supabase
      .from('stories')
      .update({
        paid: true,
        payment_tier: payment.tier,
        payment_amount: payment.amount,
        payment_currency: payment.currency,
        updated_at: new Date().toISOString(),
      })
      .eq('id', jobId);

    console.log('[Razorpay Verify] Story unlocked:', jobId);

    // If Deluxe tier, trigger animation generation
    if (payment.tier === 'deluxe') {
      console.log('[Razorpay Verify] Triggering Deluxe generation');

      // Trigger deluxe generation in background
      fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/generate-deluxe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId }),
      }).catch(err => console.error('[Razorpay Verify] Deluxe trigger failed:', err));
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully',
      tier: payment.tier,
    });

  } catch (error) {
    console.error('[Razorpay Verify] Error:', error);
    return NextResponse.json(
      { error: 'Payment verification failed' },
      { status: 500 }
    );
  }
}
