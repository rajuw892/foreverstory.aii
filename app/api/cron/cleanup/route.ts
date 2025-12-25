import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Vercel Cron job to clean up old videos after 7 days
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Find old completed stories that haven't been paid for
    const { data: oldStories, error: fetchError } = await supabase
      .from('stories')
      .select('id, video_url, watermarked_video_url')
      .eq('paid', false)
      .lt('created_at', sevenDaysAgo.toISOString())
      .in('status', ['completed', 'failed']);

    if (fetchError) {
      console.error('Error fetching old stories:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch stories' }, { status: 500 });
    }

    if (!oldStories || oldStories.length === 0) {
      return NextResponse.json({ message: 'No old stories to clean up', count: 0 });
    }

    let deletedCount = 0;
    const errors: string[] = [];

    for (const story of oldStories) {
      try {
        // Delete video files from storage
        const filesToDelete: string[] = [];

        if (story.video_url) {
          const videoPath = extractPathFromUrl(story.video_url);
          if (videoPath) filesToDelete.push(videoPath);
        }

        if (story.watermarked_video_url) {
          const watermarkedPath = extractPathFromUrl(story.watermarked_video_url);
          if (watermarkedPath) filesToDelete.push(watermarkedPath);
        }

        if (filesToDelete.length > 0) {
          const { error: deleteError } = await supabase.storage
            .from('videos')
            .remove(filesToDelete);

          if (deleteError) {
            errors.push(`Failed to delete files for story ${story.id}: ${deleteError.message}`);
            continue;
          }
        }

        // Update the story to mark videos as deleted
        await supabase
          .from('stories')
          .update({
            video_url: null,
            watermarked_video_url: null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', story.id);

        deletedCount++;
      } catch (error) {
        errors.push(`Error processing story ${story.id}: ${error}`);
      }
    }

    console.log(`Cleanup complete: ${deletedCount} videos deleted`);

    return NextResponse.json({
      message: 'Cleanup complete',
      deletedCount,
      totalProcessed: oldStories.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Cleanup cron error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function extractPathFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    // Find the path after 'videos' bucket
    const videosIndex = pathParts.indexOf('videos');
    if (videosIndex !== -1 && videosIndex < pathParts.length - 1) {
      return pathParts.slice(videosIndex + 1).join('/');
    }
    return null;
  } catch {
    return null;
  }
}
