#!/usr/bin/env tsx
// ========================================
// Full Flow Test for ForeverStory.ai
// Tests: Upload → Generate → Process → Download
// ========================================

const BASE_URL = 'http://localhost:3000';

interface TestResult {
  step: string;
  success: boolean;
  data?: any;
  error?: string;
  duration?: number;
}

const results: TestResult[] = [];

function logResult(result: TestResult) {
  results.push(result);
  const icon = result.success ? '✅' : '❌';
  const time = result.duration ? ` (${result.duration}ms)` : '';
  console.log(`${icon} ${result.step}${time}`);
  if (result.error) {
    console.log(`   Error: ${result.error}`);
  }
  if (result.data && Object.keys(result.data).length > 0) {
    console.log(`   Data:`, result.data);
  }
}

async function testFullFlow() {
  console.log('\n========================================');
  console.log('🎬 ForeverStory.ai - Full Flow Test');
  console.log('========================================\n');

  let jobId: string | null = null;

  // Step 1: Test health/API availability
  try {
    const start = Date.now();
    const response = await fetch(`${BASE_URL}/api/status?jobId=test-health`);
    const duration = Date.now() - start;

    logResult({
      step: 'API Health Check',
      success: response.status === 404, // Expected for non-existent job
      duration,
    });
  } catch (error: any) {
    logResult({
      step: 'API Health Check',
      success: false,
      error: error.message,
    });
    return;
  }

  // Step 2: Create a test story
  console.log('\n📝 Creating test story...\n');

  const testStory = {
    anonymousId: `test-${Date.now()}`,
    coupleNames: 'Alice and Bob',
    howMet: 'We met at a coffee shop on a rainy afternoon',
    firstDate: 'We went to the park and talked for hours',
    iLoveYou: 'I knew I loved you when you smiled at my terrible jokes',
    insideJoke: 'We always say "pineapple" when things get awkward',
    adventure: 'We went hiking and got lost but found a beautiful waterfall',
    futureDream: 'Growing old together in a house by the sea',
    photos: [
      'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=800',
      'https://images.unsplash.com/photo-1529634597503-139d3726fed5?w=800',
    ],
    voiceId: 'aria',
    musicId: 'romantic_piano',
    cinematicStyleId: 'ghibli_cherry_blossoms',
  };

  try {
    const start = Date.now();
    const response = await fetch(`${BASE_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testStory),
    });
    const duration = Date.now() - start;
    const data = await response.json();

    if (response.ok && data.jobId) {
      jobId = data.jobId;
      logResult({
        step: 'Story Creation',
        success: true,
        data: { jobId },
        duration,
      });
    } else {
      logResult({
        step: 'Story Creation',
        success: false,
        error: data.error || 'Failed to create story',
        duration,
      });
      return;
    }
  } catch (error: any) {
    logResult({
      step: 'Story Creation',
      success: false,
      error: error.message,
    });
    return;
  }

  // Step 3: Monitor processing
  console.log('\n🎥 Monitoring video generation...\n');
  console.log(`Job ID: ${jobId}`);
  console.log('─'.repeat(60));

  let lastProgress = 0;
  let lastStatus = '';
  const maxPolls = 600; // 10 minutes max (1 second intervals)
  let pollCount = 0;

  while (pollCount < maxPolls) {
    try {
      const response = await fetch(`${BASE_URL}/api/status?jobId=${jobId}`);
      const status = await response.json();

      if (status.status !== lastStatus || status.progress !== lastProgress) {
        const progressBar = '█'.repeat(Math.floor(status.progress / 5)) +
                           '░'.repeat(20 - Math.floor(status.progress / 5));
        console.log(`[${progressBar}] ${status.progress}% - ${status.currentStep}`);
        lastProgress = status.progress;
        lastStatus = status.status;
      }

      if (status.status === 'completed') {
        console.log('\n✅ Video generation completed!');
        logResult({
          step: 'Video Generation',
          success: true,
          data: {
            videoUrl: status.videoUrl,
            teaserUrl: status.teaserUrl,
            deluxeVideoUrl: status.deluxeVideoUrl,
            tier: status.paymentTier,
          },
        });

        // Verify URLs are accessible
        if (status.videoUrl) {
          try {
            const videoCheck = await fetch(status.videoUrl, { method: 'HEAD' });
            logResult({
              step: 'Video URL Accessibility',
              success: videoCheck.ok,
              data: {
                url: status.videoUrl,
                contentType: videoCheck.headers.get('content-type'),
                size: videoCheck.headers.get('content-length'),
              },
            });
          } catch (error: any) {
            logResult({
              step: 'Video URL Accessibility',
              success: false,
              error: error.message,
            });
          }
        }

        break;
      }

      if (status.status === 'failed') {
        console.log('\n❌ Video generation failed!');
        logResult({
          step: 'Video Generation',
          success: false,
          error: status.error || 'Generation failed',
        });
        break;
      }

      // Wait 1 second before next poll
      await new Promise(resolve => setTimeout(resolve, 1000));
      pollCount++;

    } catch (error: any) {
      logResult({
        step: 'Status Polling',
        success: false,
        error: error.message,
      });
      break;
    }
  }

  if (pollCount >= maxPolls) {
    logResult({
      step: 'Video Generation',
      success: false,
      error: 'Timeout after 10 minutes',
    });
  }

  // Final Summary
  console.log('\n========================================');
  console.log('📊 Test Summary');
  console.log('========================================\n');

  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  const total = results.length;

  console.log(`Total Tests: ${total}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${Math.round((passed / total) * 100)}%\n`);

  if (failed > 0) {
    console.log('Failed Tests:');
    results
      .filter(r => !r.success)
      .forEach(r => console.log(`  - ${r.step}: ${r.error}`));
    console.log('');
  }

  process.exit(failed > 0 ? 1 : 0);
}

testFullFlow().catch(console.error);
