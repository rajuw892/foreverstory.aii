'use client';

import { useState, useRef } from 'react';

// Animation styles
const STYLES = [
  { id: 'ghibli', name: 'Ghibli', emoji: '🌸', desc: 'Soft watercolor anime' },
  { id: 'disney', name: 'Disney', emoji: '✨', desc: 'Fairy tale magic' },
  { id: 'pixar', name: 'Pixar', emoji: '🎬', desc: '3D expressive' },
  { id: 'anime', name: 'Anime', emoji: '🌌', desc: 'Your Name style' },
];

export default function TestTeaserPage() {
  // Form state
  const [name1, setName1] = useState('');
  const [name2, setName2] = useState('');
  const [howMet, setHowMet] = useState('');
  const [firstDate, setFirstDate] = useState('');
  const [favoriteMemory, setFavoriteMemory] = useState('');
  const [whatILove, setWhatILove] = useState('');
  const [futureDream, setFutureDream] = useState('');
  const [style, setStyle] = useState('ghibli');

  // Photo state
  const [photo1, setPhoto1] = useState<{ file: File; preview: string } | null>(null);
  const [photo2, setPhoto2] = useState<{ file: File; preview: string } | null>(null);
  const fileRef1 = useRef<HTMLInputElement>(null);
  const fileRef2 = useRef<HTMLInputElement>(null);

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState('');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const log = (msg: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const handlePhoto = (num: 1 | 2, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const preview = URL.createObjectURL(file);
    if (num === 1) setPhoto1({ file, preview });
    else setPhoto2({ file, preview });
  };

  const handleGenerate = async () => {
    // Validation
    if (!name1 || !name2) {
      setError('Please enter both names');
      return;
    }
    if (!howMet) {
      setError('Please tell us how you met');
      return;
    }
    if (!photo1 || !photo2) {
      setError('Please upload both photos');
      return;
    }

    setError(null);
    setIsGenerating(true);
    setProgress(0);
    setVideoUrl(null);
    setLogs([]);

    try {
      // Step 1: Upload photos
      log('Uploading photos...');
      setStep('Uploading photos...');
      setProgress(5);

      const formData = new FormData();
      formData.append('photo1', photo1.file);
      formData.append('photo2', photo2.file);
      formData.append('name1', name1);
      formData.append('name2', name2);
      formData.append('howMet', howMet);
      formData.append('firstDate', firstDate);
      formData.append('favoriteMemory', favoriteMemory);
      formData.append('whatILove', whatILove);
      formData.append('futureDream', futureDream);
      formData.append('style', style);

      log('Starting teaser generation...');
      setStep('Starting generation...');
      setProgress(10);

      const response = await fetch('/api/generate-teaser', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Generation failed');
      }

      // Handle streaming response or poll for status
      const data = await response.json();

      if (data.jobId) {
        // Poll for status
        log(`Job started: ${data.jobId}`);
        await pollStatus(data.jobId);
      } else if (data.videoUrl) {
        // Direct response
        setVideoUrl(data.videoUrl);
        setProgress(100);
        log('Video ready!');
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      log(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const pollStatus = async (jobId: string) => {
    const maxAttempts = 120; // 10 minutes max

    for (let i = 0; i < maxAttempts; i++) {
      try {
        const res = await fetch(`/api/generate-teaser?jobId=${jobId}`);
        const data = await res.json();

        if (data.progress) setProgress(data.progress);
        if (data.step) {
          setStep(data.step);
          log(data.step);
        }

        if (data.status === 'completed' && data.videoUrl) {
          setVideoUrl(data.videoUrl);
          setProgress(100);
          log('Video ready!');
          return;
        }

        if (data.status === 'failed') {
          throw new Error(data.error || 'Generation failed');
        }

        await new Promise(r => setTimeout(r, 5000));
      } catch (err) {
        console.error('Poll error:', err);
      }
    }

    throw new Error('Generation timed out');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
            Love Story Teaser
          </h1>
          <p className="text-gray-600 mt-2">15-Second Animated Preview</p>
          <span className="inline-block mt-2 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm">
            🧪 Proof of Concept
          </span>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 space-y-6">
          {/* Names */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Your Names</label>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                value={name1}
                onChange={e => setName1(e.target.value)}
                placeholder="Partner 1"
                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
              <input
                type="text"
                value={name2}
                onChange={e => setName2(e.target.value)}
                placeholder="Partner 2"
                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Photos */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Your Photos</label>
            <div className="grid grid-cols-2 gap-3">
              {[1, 2].map(num => {
                const photo = num === 1 ? photo1 : photo2;
                const ref = num === 1 ? fileRef1 : fileRef2;
                return (
                  <div key={num}>
                    <input
                      ref={ref}
                      type="file"
                      accept="image/*"
                      onChange={e => handlePhoto(num as 1 | 2, e)}
                      className="hidden"
                    />
                    <div
                      onClick={() => ref.current?.click()}
                      className={`aspect-square rounded-xl border-2 border-dashed cursor-pointer flex items-center justify-center overflow-hidden transition-all hover:border-pink-400 ${
                        photo ? 'border-pink-500 bg-pink-50' : 'border-gray-300 bg-gray-50'
                      }`}
                    >
                      {photo ? (
                        <img src={photo.preview} alt={`Photo ${num}`} className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-center p-4">
                          <div className="text-3xl mb-1">📷</div>
                          <div className="text-sm text-gray-500">Photo {num}</div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-gray-400 mt-2">Upload clear face photos for best results</p>
          </div>

          {/* Style Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Animation Style</label>
            <div className="grid grid-cols-4 gap-2">
              {STYLES.map(s => (
                <button
                  key={s.id}
                  onClick={() => setStyle(s.id)}
                  className={`p-3 rounded-xl border-2 transition-all text-center ${
                    style === s.id
                      ? 'border-pink-500 bg-pink-50 scale-105'
                      : 'border-gray-200 hover:border-pink-300'
                  }`}
                >
                  <div className="text-2xl">{s.emoji}</div>
                  <div className="text-xs font-medium mt-1">{s.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Story Questions */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">Tell Your Story</label>

            <div>
              <label className="block text-xs text-gray-500 mb-1">
                How did you meet? <span className="text-red-500">*</span>
              </label>
              <textarea
                value={howMet}
                onChange={e => setHowMet(e.target.value)}
                placeholder="We met at a coffee shop on a rainy Sunday..."
                rows={2}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none text-sm"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">
                What was your first date like?
              </label>
              <textarea
                value={firstDate}
                onChange={e => setFirstDate(e.target.value)}
                placeholder="We went to a little Italian restaurant..."
                rows={2}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none text-sm"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Your favorite memory together
              </label>
              <textarea
                value={favoriteMemory}
                onChange={e => setFavoriteMemory(e.target.value)}
                placeholder="That time we got lost in Paris and found the best bakery..."
                rows={2}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none text-sm"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">
                What do you love most about them?
              </label>
              <textarea
                value={whatILove}
                onChange={e => setWhatILove(e.target.value)}
                placeholder="The way they laugh, their kindness, how they always..."
                rows={2}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none text-sm"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Your dream for the future together
              </label>
              <textarea
                value={futureDream}
                onChange={e => setFutureDream(e.target.value)}
                placeholder="A cozy home with a garden, traveling the world together..."
                rows={2}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none text-sm"
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className={`w-full py-4 rounded-xl font-semibold text-lg transition-all ${
              isGenerating
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:shadow-lg hover:scale-[1.02]'
            }`}
          >
            {isGenerating ? '⏳ Generating...' : '✨ Generate 15-Sec Teaser'}
          </button>

          {/* Progress */}
          {isGenerating && (
            <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-700">{step || 'Starting...'}</span>
                <span className="font-bold text-pink-600">{progress}%</span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-pink-500 to-purple-600 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* Logs */}
              <div className="mt-3 max-h-32 overflow-y-auto bg-white/50 rounded-lg p-2 font-mono text-xs text-gray-600">
                {logs.map((l, i) => <div key={i}>{l}</div>)}
              </div>
            </div>
          )}

          {/* Video Result */}
          {videoUrl && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-green-800 mb-3 text-center">
                🎉 Your Teaser is Ready!
              </h3>
              <video
                src={videoUrl}
                controls
                autoPlay
                className="w-full rounded-xl shadow-lg"
              />
              <div className="flex gap-2 mt-3">
                <a
                  href={videoUrl}
                  download={`love-story-${name1}-${name2}.mp4`}
                  className="flex-1 py-2 bg-green-600 text-white rounded-lg text-center text-sm font-medium hover:bg-green-700"
                >
                  ⬇️ Download
                </a>
                <button
                  onClick={() => {
                    setVideoUrl(null);
                    setProgress(0);
                    setLogs([]);
                  }}
                  className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg text-center text-sm font-medium hover:bg-gray-300"
                >
                  🔄 Try Again
                </button>
              </div>
            </div>
          )}
        </div>

        {/* API Info */}
        <div className="mt-4 text-center text-xs text-gray-500">
          <p>Uses: Replicate (style) + fal.ai/Kling (animation) + Edge-TTS (voice)</p>
          <p>Estimated cost: ~$2-4 per teaser | Time: 3-5 minutes</p>
        </div>
      </div>
    </div>
  );
}
