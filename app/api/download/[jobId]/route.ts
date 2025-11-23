import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;
    const { searchParams } = new URL(request.url);
    const quality = searchParams.get('quality') || 'hd';

    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      );
    }

    // Fetch story from Supabase
    const { data: story, error } = await supabase
      .from('stories')
      .select('*')
      .eq('id', jobId)
      .single();

    if (error || !story) {
      return NextResponse.json(
        { error: 'Story not found' },
        { status: 404 }
      );
    }

    // Check if story is paid (for HD/4K without watermark)
    if (!story.paid) {
      return NextResponse.json(
        { error: 'Purchase required for HD download' },
        { status: 403 }
      );
    }

    // Get the appropriate video URL
    const videoUrl = story.video_url;

    if (!videoUrl) {
      return NextResponse.json(
        { error: 'Video not available yet' },
        { status: 404 }
      );
    }

    // If it's a Supabase storage URL, fetch the file
    if (videoUrl.includes('supabase')) {
      const path = videoUrl.split('/videos/')[1];

      const { data, error: downloadError } = await supabase.storage
        .from('videos')
        .download(path);

      if (downloadError || !data) {
        console.error('Download error:', downloadError);
        return NextResponse.json(
          { error: 'Failed to download video' },
          { status: 500 }
        );
      }

      const buffer = await data.arrayBuffer();

      return new NextResponse(buffer, {
        headers: {
          'Content-Type': 'video/mp4',
          'Content-Disposition': `attachment; filename="foreverstory-${jobId}-${quality}.mp4"`,
          'Content-Length': buffer.byteLength.toString(),
        },
      });
    }

    // For external URLs, redirect
    return NextResponse.redirect(videoUrl);
  } catch (error) {
    console.error('Download API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
