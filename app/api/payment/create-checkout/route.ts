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

export async function POST(request: NextRequest) {
  try {
    const { jobId, currency = 'usd' } = await request.json();

    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID is required' },
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

    // Determine price based on currency
    const priceAmount = currency === 'inr' ? 79900 : 999; // in cents/paise
    const currencyCode = currency === 'inr' ? 'inr' : 'usd';

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: currencyCode,
            product_data: {
              name: 'ForeverStory Premium Video',
              description: `HD video without watermark - ${story.story_data?.coupleNames || 'Your Love Story'}`,
              images: ['https://foreverstory.ai/og-image.jpg'],
            },
            unit_amount: priceAmount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/download/${jobId}?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/result/${jobId}?cancelled=true`,
      metadata: {
        jobId,
        storyId: story.id,
      },
    });

    // Create payment record
    await supabase.from('payments').insert({
      story_id: jobId,
      amount: priceAmount,
      currency: currencyCode,
      stripe_session_id: session.id,
      status: 'pending',
    });

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error('Checkout API error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
