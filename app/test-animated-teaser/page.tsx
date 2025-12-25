'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

export default function TestAnimatedTeaserPage() {
  const [jobId, setJobId] = useState('');
  const [photo1, setPhoto1] = useState('');
  const [photo2, setPhoto2] = useState('');
  const [photo1File, setPhoto1File] = useState<File | null>(null);
  const [photo2File, setPhoto2File] = useState<File | null>(null);
  const [photo1Preview, setPhoto1Preview] = useState('');
  const [photo2Preview, setPhoto2Preview] = useState('');
  const [uploadMode, setUploadMode] = useState<'url' | 'file'>('file');
  const [isUploading, setIsUploading] = useState(false);
  const [partner1, setPartner1] = useState('');
  const [partner2, setPartner2] = useState('');
  const [howWeMet, setHowWeMet] = useState('');
  const [status, setStatus] = useState('');
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [teaserUrl, setTeaserUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  // Handle file upload
  const handleFileUpload = async (file: File, photoNumber: 1 | 2) => {
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    // Set file and preview
    const reader = new FileReader();
    reader.onloadend = () => {
      const preview = reader.result as string;
      if (photoNumber === 1) {
        setPhoto1File(file);
        setPhoto1Preview(preview);
      } else {
        setPhoto2File(file);
        setPhoto2Preview(preview);
      }
    };
    reader.readAsDataURL(file);
  };

  // Upload photos to Supabase
  const uploadPhotosToSupabase = async (): Promise<[string, string]> => {
    if (!photo1File || !photo2File) {
      throw new Error('Please upload both photos');
    }

    setIsUploading(true);
    setStatus('Uploading photos...');

    try {
      const uploadPhoto = async (file: File, index: number): Promise<string> => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('jobId', `test-${Date.now()}`);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Failed to upload photo ${index}`);
        }

        const data = await response.json();
        return data.url;
      };

      const [url1, url2] = await Promise.all([
        uploadPhoto(photo1File, 1),
        uploadPhoto(photo2File, 2),
      ]);

      setIsUploading(false);
      return [url1, url2];
    } catch (err) {
      setIsUploading(false);
      throw err;
    }
  };

  const generateTeaser = async () => {
    if (!partner1 || !partner2 || !howWeMet) {
      setError('Please fill in all fields');
      return;
    }

    setIsGenerating(true);
    setError('');
    setStatus('Starting...');

    const newJobId = `test-${Date.now()}`;
    setJobId(newJobId);

    try {
      let photoUrls: string[];

      // Upload files if in file mode, otherwise use URLs
      if (uploadMode === 'file') {
        if (!photo1File || !photo2File) {
          throw new Error('Please upload both photos');
        }
        photoUrls = await uploadPhotosToSupabase();
      } else {
        if (!photo1 || !photo2) {
          throw new Error('Please provide both photo URLs');
        }
        photoUrls = [photo1, photo2];
      }

      // Call animated teaser API
      const response = await fetch('/api/generate-animated-teaser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: newJobId,
          photoUrls,
          storyData: {
            partner1Name: partner1,
            partner2Name: partner2,
            howWeMet: howWeMet,
            styleId: 'ghibli_cherry_blossoms',
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to start generation');
      }

      // Start polling for status
      pollStatus(newJobId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed');
      setIsGenerating(false);
    }
  };

  const pollStatus = async (jId: string) => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/generate-animated-teaser?jobId=${jId}`);
        const data = await response.json();

        if (data.success) {
          setStatus(data.status);
          setProgress(data.progress || 0);
          setCurrentStep(data.currentStep || '');

          if (data.isComplete && data.teaserUrl) {
            setTeaserUrl(data.teaserUrl);
            setIsGenerating(false);
            clearInterval(interval);
          }

          if (data.status === 'failed') {
            setError('Generation failed. Check console logs.');
            setIsGenerating(false);
            clearInterval(interval);
          }
        }
      } catch (err) {
        console.error('Poll error:', err);
      }
    }, 3000); // Poll every 3 seconds
  };

  return (
    <div className="container mx-auto max-w-4xl py-12 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">🎬 Test Animated Teaser Generator</CardTitle>
          <CardDescription>
            Generate a 15-second REAL ANIMATED teaser using AI (Kling AI or Runway Gen-3)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Instructions */}
          <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">📋 Setup Instructions:</h3>
            <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-decimal list-inside">
              <li>Add <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">KLING_AI_API_KEY</code> to .env.local (Get from <a href="https://klingai.com" target="_blank" rel="noopener" className="underline">klingai.com</a>)</li>
              <li>Add <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">KLING_AI_API_SECRET</code> to .env.local</li>
              <li>Or use <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">RUNWAY_API_KEY</code> from <a href="https://runwayml.com" target="_blank" rel="noopener" className="underline">runwayml.com</a></li>
              <li>Upload 2 photos (couple photos work best)</li>
              <li>Fill in the form below and click Generate</li>
            </ol>
          </div>

          {/* Upload Mode Toggle */}
          <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-900 rounded-lg">
            <button
              onClick={() => setUploadMode('file')}
              disabled={isGenerating}
              className={`flex-1 px-4 py-2 rounded-md transition-all ${
                uploadMode === 'file'
                  ? 'bg-white dark:bg-gray-800 shadow-sm font-medium'
                  : 'hover:bg-gray-200 dark:hover:bg-gray-800'
              }`}
            >
              <Upload className="inline-block w-4 h-4 mr-2" />
              Upload Photos
            </button>
            <button
              onClick={() => setUploadMode('url')}
              disabled={isGenerating}
              className={`flex-1 px-4 py-2 rounded-md transition-all ${
                uploadMode === 'url'
                  ? 'bg-white dark:bg-gray-800 shadow-sm font-medium'
                  : 'hover:bg-gray-200 dark:hover:bg-gray-800'
              }`}
            >
              <ImageIcon className="inline-block w-4 h-4 mr-2" />
              Use URLs
            </button>
          </div>

          {/* Form */}
          <div className="space-y-4">
            {uploadMode === 'file' ? (
              // File Upload Mode
              <>
                <div>
                  <Label className="mb-2">Photo 1 (Partner 1)</Label>
                  <div className="mt-2">
                    {photo1Preview ? (
                      <div className="relative">
                        <img
                          src={photo1Preview}
                          alt="Photo 1 Preview"
                          className="w-full h-48 object-cover rounded-lg border-2 border-gray-200 dark:border-gray-700"
                        />
                        <button
                          onClick={() => {
                            setPhoto1File(null);
                            setPhoto1Preview('');
                          }}
                          disabled={isGenerating}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-10 h-10 mb-3 text-gray-400" />
                          <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            PNG, JPG, JPEG (MAX. 10MB)
                          </p>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload(file, 1);
                          }}
                          disabled={isGenerating}
                        />
                      </label>
                    )}
                  </div>
                </div>

                <div>
                  <Label className="mb-2">Photo 2 (Partner 2)</Label>
                  <div className="mt-2">
                    {photo2Preview ? (
                      <div className="relative">
                        <img
                          src={photo2Preview}
                          alt="Photo 2 Preview"
                          className="w-full h-48 object-cover rounded-lg border-2 border-gray-200 dark:border-gray-700"
                        />
                        <button
                          onClick={() => {
                            setPhoto2File(null);
                            setPhoto2Preview('');
                          }}
                          disabled={isGenerating}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-10 h-10 mb-3 text-gray-400" />
                          <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            PNG, JPG, JPEG (MAX. 10MB)
                          </p>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload(file, 2);
                          }}
                          disabled={isGenerating}
                        />
                      </label>
                    )}
                  </div>
                </div>
              </>
            ) : (
              // URL Mode
              <>
                <div>
                  <label className="block text-sm font-medium mb-2">Photo 1 URL</label>
                  <Input
                    placeholder="https://example.com/photo1.jpg"
                    value={photo1}
                    onChange={(e) => setPhoto1(e.target.value)}
                    disabled={isGenerating}
                  />
                  <p className="text-xs text-gray-500 mt-1">Use a publicly accessible image URL</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Photo 2 URL</label>
                  <Input
                    placeholder="https://example.com/photo2.jpg"
                    value={photo2}
                    onChange={(e) => setPhoto2(e.target.value)}
                    disabled={isGenerating}
                  />
                </div>
              </>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Partner 1 Name</label>
                <Input
                  placeholder="Sarah"
                  value={partner1}
                  onChange={(e) => setPartner1(e.target.value)}
                  disabled={isGenerating}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Partner 2 Name</label>
                <Input
                  placeholder="Alex"
                  value={partner2}
                  onChange={(e) => setPartner2(e.target.value)}
                  disabled={isGenerating}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">How We Met</label>
              <Input
                placeholder="We met at a coffee shop on a rainy day..."
                value={howWeMet}
                onChange={(e) => setHowWeMet(e.target.value)}
                disabled={isGenerating}
              />
            </div>
          </div>

          {/* Generate Button */}
          <Button
            onClick={generateTeaser}
            disabled={isGenerating || isUploading}
            className="w-full h-12 text-lg"
            size="lg"
          >
            {isGenerating || isUploading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {isUploading ? 'Uploading Photos...' : 'Generating Animated Teaser...'}
              </>
            ) : (
              '🎬 Generate 15-Second Animated Teaser'
            )}
          </Button>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-red-800 dark:text-red-200 font-medium">❌ Error: {error}</p>
            </div>
          )}

          {/* Progress Display */}
          {isGenerating && (
            <div className="space-y-3">
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Progress</span>
                  <span className="text-sm font-bold">{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{currentStep}</p>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                  ⏱️ <strong>Note:</strong> Animation generation takes 3-5 minutes per scene. Total time: ~10-15 minutes for 3 scenes.
                </p>
              </div>
            </div>
          )}

          {/* Result Display */}
          {teaserUrl && (
            <div className="space-y-4">
              <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <p className="text-green-800 dark:text-green-200 font-medium mb-2">✅ Animated Teaser Generated!</p>
                <p className="text-sm text-green-700 dark:text-green-300">Job ID: {jobId}</p>
              </div>

              <div className="bg-black rounded-lg overflow-hidden">
                <video
                  src={teaserUrl}
                  controls
                  autoPlay
                  loop
                  className="w-full"
                />
              </div>

              <div className="flex gap-2">
                <Button asChild className="flex-1">
                  <a href={teaserUrl} download target="_blank" rel="noopener noreferrer">
                    📥 Download Video
                  </a>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(teaserUrl);
                    alert('URL copied to clipboard!');
                  }}
                >
                  📋 Copy URL
                </Button>
              </div>
            </div>
          )}

          {/* Example Photos */}
          <details className="border border-gray-200 dark:border-gray-800 rounded-lg p-4">
            <summary className="cursor-pointer font-medium">
              📸 Need test photos? Click here for example URLs
            </summary>
            <div className="mt-3 space-y-2 text-sm">
              <p className="text-gray-600 dark:text-gray-400">You can use these public image URLs for testing:</p>
              <ul className="space-y-1 text-xs font-mono bg-gray-100 dark:bg-gray-900 p-3 rounded">
                <li>https://images.unsplash.com/photo-1522673607200-164d1b6ce486</li>
                <li>https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2</li>
                <li>https://images.unsplash.com/photo-1518199266791-5375a83190b7</li>
              </ul>
            </div>
          </details>
        </CardContent>
      </Card>
    </div>
  );
}
