import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');

    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      );
    }

    // Get the current job status
    const { data: story, error: fetchError } = await supabase
      .from('stories')
      .select('status, paid')
      .eq('id', jobId)
      .single();

    if (fetchError || !story) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    // Don't allow cancellation of completed jobs
    if (story.status === 'completed') {
      return NextResponse.json(
        { error: 'Cannot cancel a completed job' },
        { status: 400 }
      );
    }

    // Update the job status to cancelled
    const { error: updateError } = await supabase
      .from('stories')
      .update({
        status: 'failed',
        error_message: 'Cancelled by user',
        updated_at: new Date().toISOString(),
      })
      .eq('id', jobId);

    if (updateError) {
      console.error('Error cancelling job:', updateError);
      return NextResponse.json(
        { error: 'Failed to cancel job' },
        { status: 500 }
      );
    }

    // If the user has paid, we should initiate a refund
    // This would be handled by your payment system
    if (story.paid) {
      // TODO: Implement Stripe refund logic
      console.log(`Refund needed for job ${jobId}`);
    }

    return NextResponse.json({ success: true, message: 'Job cancelled successfully' });
  } catch (error) {
    console.error('Cancel error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
