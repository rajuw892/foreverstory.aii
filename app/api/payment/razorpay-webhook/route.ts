// ========================================
// Razorpay Webhook Handler
// Processes Razorpay payment events
// ========================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ========================================
// Webhook Signature Verification
// ========================================

function verifyWebhookSignature(
  body: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');

  return expectedSignature === signature;
}

// ========================================
// POST Handler (Webhook Endpoint)
// ========================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-razorpay-signature');

    if (!signature) {
      console.error('[Razorpay Webhook] Missing signature');
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET!;
    if (!webhookSecret) {
      console.error('[Razorpay Webhook] Webhook secret not configured');
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      );
    }

    const isValid = verifyWebhookSignature(body, signature, webhookSecret);

    if (!isValid) {
      console.error('[Razorpay Webhook] Invalid signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Parse event
    const event = JSON.parse(body);
    console.log('[Razorpay Webhook] Event received:', event.event);

    // Handle different event types
    switch (event.event) {
      case 'payment.captured':
        await handlePaymentCaptured(event);
        break;

      case 'payment.failed':
        await handlePaymentFailed(event);
        break;

      case 'order.paid':
        await handleOrderPaid(event);
        break;

      default:
        console.log('[Razorpay Webhook] Unhandled event:', event.event);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('[Razorpay Webhook] Error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

// ========================================
// Event Handlers
// ========================================

async function handlePaymentCaptured(event: any) {
  try {
    const payment = event.payload.payment.entity;
    const orderId = payment.order_id;
    const paymentId = payment.id;
    const amount = payment.amount;

    console.log('[Razorpay Webhook] Payment captured:', paymentId);

    // Find payment record
    const { data: paymentRecord, error: paymentError } = await supabase
      .from('payments')
      .select('*')
      .eq('razorpay_order_id', orderId)
      .single();

    if (paymentError || !paymentRecord) {
      console.error('[Razorpay Webhook] Payment record not found:', orderId);
      return;
    }

    // Update payment status
    await supabase
      .from('payments')
      .update({
        razorpay_payment_id: paymentId,
        status: 'completed',
        updated_at: new Date().toISOString(),
      })
      .eq('razorpay_order_id', orderId);

    // Update story as paid
    await supabase
      .from('stories')
      .update({
        paid: true,
        payment_tier: paymentRecord.tier,
        payment_amount: amount,
        payment_currency: 'inr',
        updated_at: new Date().toISOString(),
      })
      .eq('id', paymentRecord.story_id);

    console.log('[Razorpay Webhook] Story unlocked:', paymentRecord.story_id);

    // If Deluxe tier, trigger animation generation
    if (paymentRecord.tier === 'deluxe') {
      console.log('[Razorpay Webhook] Triggering Deluxe generation');

      // Trigger deluxe generation in background
      fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/generate-deluxe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId: paymentRecord.story_id }),
      }).catch(err => console.error('[Razorpay Webhook] Deluxe trigger failed:', err));
    }

  } catch (error) {
    console.error('[Razorpay Webhook] handlePaymentCaptured error:', error);
  }
}

async function handlePaymentFailed(event: any) {
  try {
    const payment = event.payload.payment.entity;
    const orderId = payment.order_id;

    console.log('[Razorpay Webhook] Payment failed:', payment.id);

    // Update payment status
    await supabase
      .from('payments')
      .update({
        status: 'failed',
        updated_at: new Date().toISOString(),
      })
      .eq('razorpay_order_id', orderId);

  } catch (error) {
    console.error('[Razorpay Webhook] handlePaymentFailed error:', error);
  }
}

async function handleOrderPaid(event: any) {
  try {
    const order = event.payload.order.entity;
    console.log('[Razorpay Webhook] Order paid:', order.id);

    // Additional handling if needed
  } catch (error) {
    console.error('[Razorpay Webhook] handleOrderPaid error:', error);
  }
}
