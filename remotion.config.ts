// ========================================
// Remotion Configuration
// Optimized for fast rendering on Vercel/Lambda
// ========================================

import { Config } from '@remotion/cli/config';

// ----------------------------------------
// Video Output Settings
// ----------------------------------------

// Use H.264 codec for maximum compatibility
Config.setCodec('h264');

// Use JPEG for frames (faster than PNG)
Config.setVideoImageFormat('jpeg');

// Quality settings (balance between quality and speed)
// CRF 23 is a good balance, lower = better quality but larger files
Config.setQuality(80);

// Pixel format for H.264 compatibility
Config.setPixelFormat('yuv420p');

// ----------------------------------------
// Performance Optimization
// ----------------------------------------

// Enable multi-threading for faster rendering
// Adjust based on available CPU cores (4 is good for Lambda)
Config.setConcurrency(4);

// Timeout for individual frames (5 minutes for complex scenes)
Config.setDelayRenderTimeoutInMilliseconds(300000);

// Maximum timeline tracks (for audio + video layers)
Config.setMaxTimelineTracks(20);

// ----------------------------------------
// Chromium Settings (for serverless)
// ----------------------------------------

// Use ANGLE for GPU rendering in serverless environments
Config.setChromiumOpenGlRenderer('angle');

// Disable unnecessary Chromium features for speed
Config.setChromiumDisableWebSecurity(true);

// ----------------------------------------
// Output Settings
// ----------------------------------------

// Don't loop GIFs (we're making videos)
Config.setNumberOfGifLoops(0);

// ----------------------------------------
// Logging
// ----------------------------------------

// Set to 'verbose' for debugging, 'warn' for production
Config.setLogLevel('warn');

// ----------------------------------------
// Browser Executable (for local development)
// ----------------------------------------

// Uncomment if you have a specific Chrome/Chromium path
// Config.setBrowserExecutable('/path/to/chrome');

export default Config;
