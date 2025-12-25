'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

// Animation styles
const ANIMATION_STYLES = [
  {
    id: 'ghibli',
    name: 'Studio Ghibli',
    description: 'Soft watercolor, dreamy atmosphere',
    emoji: '🎨',
    color: 'from-green-400 to-teal-500',
    preview: '/icons/ghibli-style.jpg',
  },
  {
    id: 'disney',
    name: 'Disney',
    description: 'Classic fairy tale magic',
    emoji: '✨',
    color: 'from-purple-400 to-pink-500',
    preview: '/icons/disney-style.jpg',
  },
  {
    id: 'pixar',
    name: 'Pixar',
    description: '3D expressive characters',
    emoji: '🎬',
    color: 'from-blue-400 to-indigo-500',
    preview: '/icons/pixar-style.jpg',
  },
  {
    id: 'anime',
    name: 'Anime',
    description: 'Makoto Shinkai style',
    emoji: '🌸',
    color: 'from-pink-400 to-rose-500',
    preview: '/icons/anime-style.jpg',
  },
  {
    id: 'realistic',
    name: 'Romantic',
    description: 'Semi-realistic cinematic',
    emoji: '💕',
    color: 'from-amber-400 to-orange-500',
    preview: '/icons/realistic-style.jpg',
  },
];

export default function TestLoveStoryPage() {
  // Form state
  const [partner1Name, setPartner1Name] = useState('');
  const [partner2Name, setPartner2Name] = useState('');
  const [howWeMet, setHowWeMet] = useState('');
  const [firstDate, setFirstDate] = useState('');
  const [funniestMoment, setFunniestMoment] = useState('');
  const [whenIKnew, setWhenIKnew] = useState('');
  const [futureDream, setFutureDream] = useState('');

  // Style selection
  const [selectedStyle, setSelectedStyle] = useState('ghibli');

  // Photo upload state
  const [photos, setPhotos] = useState<{ file: File | null; preview: string }[]>([
    { file: null, preview: '' },
    { file: null, preview: '' },
  ]);
  const fileInputRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  // Add log message
  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, `[${timestamp}] ${message}`]);
  };

  // Handle photo selection
  const handlePhotoChange = (index: number, e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (JPG, PNG)');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    const preview = URL.createObjectURL(file);
    setPhotos((prev) => {
      const newPhotos = [...prev];
      newPhotos[index] = { file, preview };
      return newPhotos;
    });
    setError(null);
  };

  // Upload photo to Supabase
  const uploadPhoto = async (file: File, index: number): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `test-${Date.now()}-${index}.${fileExt}`;
    const filePath = `love-story-test/${fileName}`;

    const { error } = await supabase.storage.from('photos').upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
    });

    if (error) {
      throw new Error(`Failed to upload photo: ${error.message}`);
    }

    const { data } = supabase.storage.from('photos').getPublicUrl(filePath);
    return data.publicUrl;
  };

  // Poll for job status
  const pollJobStatus = async (id: string) => {
    const maxAttempts = 300; // 25 minutes max
    let attempts = 0;

    while (attempts < maxAttempts) {
      try {
        const response = await fetch(`/api/generate-love-story?jobId=${id}`);
        const data = await response.json();

        if (data.progress !== undefined) {
          setProgress(data.progress);
        }
        if (data.current_step) {
          setCurrentStep(data.current_step);
          addLog(data.current_step);
        }

        if (data.status === 'completed' && data.video_url) {
          setVideoUrl(data.video_url);
          setIsGenerating(false);
          addLog('Video generation complete!');
          return;
        }

        if (data.status === 'failed') {
          throw new Error(data.error_message || 'Generation failed');
        }

        await new Promise((resolve) => setTimeout(resolve, 5000));
        attempts++;
      } catch (err) {
        console.error('Polling error:', err);
        await new Promise((resolve) => setTimeout(resolve, 5000));
        attempts++;
      }
    }

    throw new Error('Generation timed out after 25 minutes');
  };

  // Generate love story
  const handleGenerate = async () => {
    // Validation
    if (!partner1Name || !partner2Name) {
      setError('Please enter both partner names');
      return;
    }

    if (!howWeMet) {
      setError('Please tell us how you met');
      return;
    }

    const validPhotos = photos.filter((p) => p.file);
    if (validPhotos.length < 2) {
      setError('Please upload at least 2 photos');
      return;
    }

    setError(null);
    setIsGenerating(true);
    setProgress(0);
    setVideoUrl(null);
    setLogs([]);

    try {
      // Step 1: Upload photos
      addLog('Uploading photos to cloud storage...');
      setCurrentStep('Uploading photos...');

      const photoUrls: string[] = [];
      for (let i = 0; i < validPhotos.length; i++) {
        addLog(`Uploading photo ${i + 1}/${validPhotos.length}...`);
        const url = await uploadPhoto(validPhotos[i].file!, i);
        photoUrls.push(url);
        setProgress(Math.round(((i + 1) / validPhotos.length) * 10));
      }

      addLog(`${photoUrls.length} photos uploaded successfully`);

      // Step 2: Generate love story
      addLog('Starting love story generation...');
      addLog(`Style: ${ANIMATION_STYLES.find((s) => s.id === selectedStyle)?.name}`);

      const newJobId = `love-${Date.now()}`;
      setJobId(newJobId);

      const response = await fetch('/api/generate-love-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: newJobId,
          photoUrls,
          storyData: {
            partner1Name,
            partner2Name,
            howWeMet,
            firstDate: firstDate || undefined,
            funniestMoment: funniestMoment || undefined,
            whenIKnew: whenIKnew || undefined,
            futureDream: futureDream || undefined,
          },
          style: selectedStyle,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to start generation');
      }

      addLog('Generation started successfully');
      addLog('This will take 15-20 minutes...');

      // If API returns video directly (synchronous)
      if (data.videoUrl) {
        setVideoUrl(data.videoUrl);
        setProgress(100);
        setIsGenerating(false);
        addLog('Video ready!');
        return;
      }

      // Otherwise poll for status
      await pollJobStatus(newJobId);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMsg);
      addLog(`Error: ${errorMsg}`);
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 dark:from-gray-900 dark:via-purple-900 dark:to-pink-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent mb-2">
            Love Story Generator
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Transform your photos into an animated love story
          </p>
          <div className="mt-2 inline-block bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-3 py-1 rounded-full text-sm">
            Proof of Concept Test Page
          </div>
        </div>

        {/* Style Selection */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span>1.</span> Choose Your Animation Style
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {ANIMATION_STYLES.map((style) => (
              <button
                key={style.id}
                onClick={() => setSelectedStyle(style.id)}
                className={`relative p-4 rounded-xl border-2 transition-all ${
                  selectedStyle === style.id
                    ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20 scale-105'
                    : 'border-gray-200 dark:border-gray-600 hover:border-pink-300'
                }`}
              >
                <div
                  className={`w-12 h-12 mx-auto mb-2 rounded-full bg-gradient-to-r ${style.color} flex items-center justify-center text-2xl`}
                >
                  {style.emoji}
                </div>
                <div className="text-sm font-medium">{style.name}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{style.description}</div>
                {selectedStyle === style.id && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Photo Upload */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span>2.</span> Upload Your Photos
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Upload 2 clear photos of you and your partner together. Best: high resolution, good
            lighting, clear faces.
          </p>
          <div className="grid grid-cols-2 gap-4">
            {photos.map((photo, index) => (
              <div key={index}>
                <input
                  ref={fileInputRefs[index]}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handlePhotoChange(index, e)}
                  className="hidden"
                />
                <div
                  onClick={() => fileInputRefs[index].current?.click()}
                  className={`aspect-square rounded-xl border-2 border-dashed cursor-pointer transition-all hover:border-pink-400 flex items-center justify-center overflow-hidden ${
                    photo.preview
                      ? 'border-pink-500'
                      : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700'
                  }`}
                >
                  {photo.preview ? (
                    <img
                      src={photo.preview}
                      alt={`Photo ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center p-4">
                      <div className="text-4xl mb-2">📷</div>
                      <div className="text-sm text-gray-500">Photo {index + 1}</div>
                      <div className="text-xs text-gray-400">Click to upload</div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Story Questions */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span>3.</span> Tell Your Story
          </h2>

          <div className="space-y-4">
            {/* Names (Required) */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="partner1" className="text-sm font-medium">
                  Partner 1 Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="partner1"
                  value={partner1Name}
                  onChange={(e) => setPartner1Name(e.target.value)}
                  placeholder="Your name"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="partner2" className="text-sm font-medium">
                  Partner 2 Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="partner2"
                  value={partner2Name}
                  onChange={(e) => setPartner2Name(e.target.value)}
                  placeholder="Their name"
                  className="mt-1"
                />
              </div>
            </div>

            {/* How We Met (Required) */}
            <div>
              <Label htmlFor="howWeMet" className="text-sm font-medium">
                How did you meet? <span className="text-red-500">*</span>
              </Label>
              <textarea
                id="howWeMet"
                value={howWeMet}
                onChange={(e) => setHowWeMet(e.target.value)}
                placeholder="e.g., We met at a coffee shop on a rainy Sunday morning..."
                className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm resize-none"
                rows={2}
              />
            </div>

            {/* Optional Questions */}
            <details className="group">
              <summary className="cursor-pointer text-sm text-pink-600 dark:text-pink-400 hover:underline">
                + Add more story details (optional)
              </summary>
              <div className="mt-4 space-y-4 border-l-2 border-pink-200 pl-4">
                <div>
                  <Label htmlFor="firstDate" className="text-sm font-medium">
                    Your first date
                  </Label>
                  <textarea
                    id="firstDate"
                    value={firstDate}
                    onChange={(e) => setFirstDate(e.target.value)}
                    placeholder="Where did you go? What did you do?"
                    className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm resize-none"
                    rows={2}
                  />
                </div>

                <div>
                  <Label htmlFor="funniestMoment" className="text-sm font-medium">
                    Funniest moment together
                  </Label>
                  <textarea
                    id="funniestMoment"
                    value={funniestMoment}
                    onChange={(e) => setFunniestMoment(e.target.value)}
                    placeholder="What makes you both laugh?"
                    className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm resize-none"
                    rows={2}
                  />
                </div>

                <div>
                  <Label htmlFor="whenIKnew" className="text-sm font-medium">
                    When you knew it was love
                  </Label>
                  <textarea
                    id="whenIKnew"
                    value={whenIKnew}
                    onChange={(e) => setWhenIKnew(e.target.value)}
                    placeholder="That special moment of realization..."
                    className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm resize-none"
                    rows={2}
                  />
                </div>

                <div>
                  <Label htmlFor="futureDream" className="text-sm font-medium">
                    Dreams for the future
                  </Label>
                  <textarea
                    id="futureDream"
                    value={futureDream}
                    onChange={(e) => setFutureDream(e.target.value)}
                    placeholder="What do you dream of together?"
                    className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm resize-none"
                    rows={2}
                  />
                </div>
              </div>
            </details>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* Generate Button */}
        <div className="text-center mb-6">
          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="px-8 py-6 text-lg bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-xl shadow-lg"
          >
            {isGenerating ? (
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Generating Your Love Story...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Generate 15-Second Animated Teaser
              </span>
            )}
          </Button>
          <p className="mt-2 text-sm text-gray-500">Takes 15-20 minutes | Uses AI video generation</p>
        </div>

        {/* Progress & Logs */}
        {isGenerating && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6">
            <h3 className="font-semibold mb-4">Generation Progress</h3>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span>{currentStep}</span>
                <span>{progress}%</span>
              </div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-pink-500 to-purple-600 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Logs */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 max-h-48 overflow-y-auto font-mono text-xs">
              {logs.map((log, i) => (
                <div key={i} className="text-gray-600 dark:text-gray-400">
                  {log}
                </div>
              ))}
              {logs.length === 0 && (
                <div className="text-gray-400">Waiting for updates...</div>
              )}
            </div>
          </div>
        )}

        {/* Video Result */}
        {videoUrl && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6">
            <h3 className="font-semibold mb-4 text-center text-green-600 dark:text-green-400">
              Your Love Story is Ready!
            </h3>
            <div className="aspect-video bg-black rounded-xl overflow-hidden mb-4">
              <video
                src={videoUrl}
                controls
                autoPlay
                className="w-full h-full"
                poster="/icons/video-poster.jpg"
              />
            </div>
            <div className="flex justify-center gap-4">
              <a
                href={videoUrl}
                download={`love-story-${partner1Name}-${partner2Name}.mp4`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                Download Video
              </a>
              <button
                onClick={() => {
                  setVideoUrl(null);
                  setProgress(0);
                  setLogs([]);
                }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Generate Another
              </button>
            </div>
          </div>
        )}

        {/* Cost Information */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 text-sm">
          <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
            Cost Estimate (per generation):
          </h4>
          <ul className="text-blue-700 dark:text-blue-300 space-y-1">
            <li>Style conversion: ~$0.02/photo (Replicate)</li>
            <li>Video animation: ~$1-2/clip (fal.ai/PiAPI)</li>
            <li>Voice narration: FREE (Edge-TTS)</li>
            <li className="font-medium pt-1 border-t border-blue-200 dark:border-blue-800">
              Total: ~$3-6 per 15-second teaser
            </li>
          </ul>
          <p className="mt-2 text-xs text-blue-600 dark:text-blue-400">
            Replicate offers $5 free credits. Configure your API keys in .env.local
          </p>
        </div>

        {/* Setup Guide */}
        <details className="mt-6">
          <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            Setup Instructions
          </summary>
          <div className="mt-4 bg-gray-50 dark:bg-gray-900 rounded-xl p-4 font-mono text-xs">
            <p className="mb-2 font-sans text-sm font-medium">Add to your .env.local:</p>
            <pre className="overflow-x-auto">
{`# Replicate (easiest - $5 free credits)
REPLICATE_API_TOKEN=r8_xxx

# OR fal.ai (Kling without $4200 upfront)
FAL_API_KEY=xxx

# OR PiAPI (alternative Kling access)
PIAPI_KEY=xxx

# Supabase (required for storage)
NEXT_PUBLIC_SUPABASE_URL=xxx
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx`}
            </pre>
          </div>
        </details>
      </div>
    </div>
  );
}
