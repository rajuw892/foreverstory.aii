import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-11-17.clover',
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing Stripe signature' },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const { jobId, storyId, tier } = session.metadata || {};

        if (jobId || storyId) {
          const targetId = storyId || jobId;

          // Get payment record to know the tier and amount
          const { data: payment } = await supabase
            .from('payments')
            .select('*')
            .eq('stripe_session_id', session.id)
            .single();

          // Update story as paid
          await supabase
            .from('stories')
            .update({
              paid: true,
              payment_tier: tier || payment?.tier || 'basic',
              payment_amount: session.amount_total || payment?.amount,
              payment_currency: session.currency || payment?.currency,
              updated_at: new Date().toISOString(),
            })
            .eq('id', targetId);

          // Update payment record
          await supabase
            .from('payments')
            .update({
              status: 'completed',
              stripe_payment_id: session.payment_intent as string,
              updated_at: new Date().toISOString(),
            })
            .eq('stripe_session_id', session.id);

          console.log(`[Stripe Webhook] Payment completed for story: ${targetId}, tier: ${tier || 'basic'}`);

          // If Deluxe tier, trigger animation generation
          if (tier === 'deluxe') {
            console.log('[Stripe Webhook] Triggering Deluxe generation');

            // Trigger deluxe generation in background
            fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/generate-deluxe`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ jobId: targetId }),
            }).catch(err => console.error('[Stripe Webhook] Deluxe trigger failed:', err));
          }
        }
        break;
      }

      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session;

        // Update payment as failed
        await supabase
          .from('payments')
          .update({ status: 'failed' })
          .eq('stripe_session_id', session.id);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.error('Payment failed:', paymentIntent.last_payment_error?.message);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
