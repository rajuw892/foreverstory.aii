import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-11-17.clover',
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Pricing configuration
const PRICING = {
  india: {
    basic: 19900,    // ₹199
    premium: 29900,  // ₹299
    deluxe: 79900,   // ₹799
  },
  global: {
    basic: 1900,     // $19
    premium: 2900,   // $29
    deluxe: 9900,    // $99
  },
};

// Tier descriptions
const TIER_DESCRIPTIONS: Record<string, { name: string; description: string }> = {
  basic: {
    name: 'Basic - Full HD Video',
    description: 'Full 2.5-minute cinematic HD video with Ken Burns effect',
  },
  premium: {
    name: 'Premium - 4K Cinematic',
    description: 'Cinematic 4K video + all 24 styles + custom music selection',
  },
  deluxe: {
    name: 'Deluxe - Animated Cartoon',
    description: 'Full 2.5-minute REAL animated cartoon video with your faces',
  },
};

export async function POST(request: NextRequest) {
  try {
    const { jobId, tier = 'basic', currency = 'usd' } = await request.json();

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

    // Determine price based on tier and currency
    const isIndia = currency === 'inr';
    const priceAmount = isIndia ? PRICING.india[tier as keyof typeof PRICING.india] : PRICING.global[tier as keyof typeof PRICING.global];
    const currencyCode = isIndia ? 'inr' : 'usd';
    const tierInfo = TIER_DESCRIPTIONS[tier];

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: currencyCode,
            product_data: {
              name: `ForeverStory.ai - ${tierInfo.name}`,
              description: `${tierInfo.description} - ${story.story_data?.partner1Name && story.story_data?.partner2Name ? `${story.story_data.partner1Name} & ${story.story_data.partner2Name}` : 'Your Love Story'}`,
              images: ['https://foreverstory.ai/og-image.jpg'],
            },
            unit_amount: priceAmount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/result/${jobId}?success=true&tier=${tier}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/result/${jobId}?cancelled=true`,
      metadata: {
        jobId,
        storyId: story.id,
        tier,
      },
    });

    // Create payment record
    await supabase.from('payments').insert({
      story_id: jobId,
      amount: priceAmount,
      currency: currencyCode,
      tier,
      gateway: 'stripe',
      stripe_session_id: session.id,
      status: 'pending',
    });

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      url: session.url,
      tier,
      amount: priceAmount,
      currency: currencyCode,
    });
  } catch (error) {
    console.error('Checkout API error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
