# 🎬 ForeverStory.ai - Testing Guide

## ✅ Pre-Flight Checklist

All systems verified and ready:

- ✅ **FFmpeg** - v8.0.1 installed
- ✅ **Node.js** - v24.12.0
- ✅ **Remotion** - Packages installed (@remotion/bundler + @remotion/renderer)
- ✅ **Supabase** - Connected and schema migrated
- ✅ **Environment** - All required variables set
- ✅ **Public Directory** - Created and ready

---

## 🚀 How to Test the Full Flow

### Option 1: Manual Test via UI (Recommended)

1. **Start the dev server** (if not already running):
   ```bash
   npm run dev
   ```

2. **Open the app**:
   ```
   http://localhost:3000/create
   ```

3. **Fill out the form**:
   - Enter couple names (e.g., "Alice and Bob")
   - Answer the 7 story questions (or skip for AI generation)
   - Upload 2-8 photos (or use sample URLs)
   - Select voice (e.g., "Aria")
   - Select music (e.g., "Romantic Piano")
   - Select cinematic style (e.g., "Studio Ghibli Cherry Blossoms")

4. **Monitor the logs** in your terminal:
   - Watch for each phase:
     - `[Movie] Phase 1: Generating avatars...`
     - `[Movie] Phase 2: Generating scene backgrounds...`
     - `[Movie] Phase 3: Animating scenes...`
     - `[Movie] Phase 4: Composing final movie...`
     - `[Movie] Phase 5: Creating teaser...`
     - `[Movie] Movie creation complete!`

5. **Check the result**:
   - The video should appear on the result page
   - Video URL will be: `https://...supabase.co/storage/v1/object/public/videos/movies/{jobId}/final.mp4`

---

### Option 2: Automated API Test

Run the full flow test script:

```bash
npx tsx scripts/test-full-flow.ts
```

This will:
1. Create a test story via API
2. Poll for status updates
3. Display real-time progress
4. Verify video accessibility
5. Show success/failure summary

---

## 📊 What to Watch For

### Expected Flow Timeline

```
0-5s    : Story created, job queued
5-30s   : AI script generation (Claude)
30-60s  : Avatar generation (Replicate)
60-120s : Scene image generation
120-180s: Scene animation (Kling/Runway) - SLOWEST STEP
180-240s: Remotion video composition
240-260s: Teaser creation (FFmpeg)
260-280s: Upload to Supabase
280-300s: Database update
COMPLETE: ~5 minutes total
```

### Key Log Messages to Look For

✅ **Success Indicators:**
```
[Movie] Starting animated movie creation for story {id}
[Movie] Avatars ready: 2
[Movie] Scenes ready: 6
[Movie] Animated clips ready: 6
[Movie] Using Remotion for composition
[Movie] Teaser created successfully
[Movie] Movie creation complete!
✓ Animated movie complete!
```

❌ **Error Indicators:**
```
❌ Video generation FAILED
[Movie] Creation failed: Error...
Failed to save final results
```

---

## 🔍 Component Tests

Run quick component checks:

```bash
./scripts/quick-test.sh
```

Checks:
- FFmpeg installation
- Node.js version
- Remotion packages
- Supabase connection
- Dev server status
- Directory structure
- Environment variables

---

## 🐛 Troubleshooting

### If Video Generation Fails

1. **Check API Keys**:
   ```bash
   grep -E "GROQ_API_KEY|REPLICATE_API_TOKEN" .env.local
   ```

2. **Check Supabase**:
   ```bash
   node scripts/check-migration.js
   ```

3. **Check Logs**:
   - Look for the specific error message
   - Check which phase failed
   - Verify all external API calls succeeded

4. **Common Issues**:
   - **FFmpeg not found**: Run `brew install ffmpeg`
   - **Remotion bundle error**: Check `@remotion/bundler` is installed
   - **Database error**: Run migration SQL in Supabase dashboard
   - **Music URL error**: Music now uses CDN (fixed)
   - **Composition not found**: Should use `ForeverStoryVideo` (fixed)

---

## 📁 Where to Find Generated Files

### Local (Development)
- Temp videos: `/var/folders/.../movie_{jobId}/`
- Remotion bundle: `./.webpack-cache/`
- Final video: `./public/videos/movie_{jobId}.mp4` (temporary)

### Supabase Storage
- Full video: `videos/movies/{jobId}/final.mp4`
- Teaser: `videos/movies/{jobId}/teaser.mp4` (if created)
- Photos: `photos/{filename}.{ext}`

### Database
- Story record: `stories` table
- Job ID: UUID in stories.id
- Status: stories.status
- URLs: stories.video_url, stories.teaser_url

---

## ✨ Expected Output

After successful generation, you should have:

1. **Database Record**:
   - Status: `completed`
   - video_url: Public Supabase URL
   - teaser_url: Public Supabase URL (if teaser created)
   - Duration: 90 seconds
   - Progress: 100%

2. **Supabase Storage**:
   - Final video (~10-50MB MP4 file)
   - Teaser video (~2-10MB MP4 file)
   - All uploaded photos

3. **Accessible URLs**:
   - Full video can be played in browser
   - Teaser can be previewed
   - No CORS errors

---

## 🎯 Success Criteria

- ✅ Story created in database
- ✅ All AI phases complete without errors
- ✅ Video renders successfully with Remotion
- ✅ Teaser created with FFmpeg
- ✅ Files uploaded to Supabase
- ✅ Database updated with URLs
- ✅ Video is playable
- ✅ Process completes in <10 minutes

---

## 📞 Need Help?

If tests fail:
1. Check the error messages in terminal
2. Verify all components passed in quick-test.sh
3. Ensure dev server is running
4. Check API keys are valid
5. Review the specific phase that failed

All systems are configured and ready to test! 🚀
