// ========================================
// Remotion Root Component
// Entry point for all video compositions
// ========================================

import React from 'react';
import { Composition, registerRoot } from 'remotion';
import { ForeverStoryVideo, ForeverStoryVideoProps } from './ForeverStoryVideo';
import { CinematicStyleId, CINEMATIC_STYLES } from './styles';

// ========================================
// Video Configuration
// ========================================

const VIDEO_CONFIG = {
  fps: 24, // Reduced from 30 (20% faster rendering, still cinematic)
  durationSeconds: 90, // Reduced from 150 (60% faster - 1.5 minutes is perfect for love story)
  teaserSeconds: 30,
};

// ========================================
// Default Props for Preview
// ========================================

const defaultProps: ForeverStoryVideoProps = {
  partner1Name: 'Sarah',
  partner2Name: 'James',
  anniversaryDate: '2022-06-15',

  howWeMet: 'They met at a coffee shop on a rainy afternoon. She was reading her favorite book, and he asked what she was reading.',
  firstDate: 'Their first date was a walk in the park followed by ice cream. They talked for hours and lost track of time.',
  funniestMoment: 'They got completely lost on a road trip and ended up having a picnic in the most unexpected beautiful meadow.',
  whenIKnew: 'It was 3am, she was asleep on his shoulder during a road trip, and he just knew she was the one.',
  favoriteThing: 'The way she laughs with her whole body, even at his terrible jokes.',
  futureDream: 'Growing old in a cottage by the sea, with a garden full of flowers and Sunday morning pancakes.',

  photoUrls: [
    'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=800',
    'https://images.unsplash.com/photo-1529634597503-139d3726fed5?w=800',
    'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800',
    'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=800',
    'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=800',
    'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800',
  ],
  narrationAudioUrl: '',
  musicUrl: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_2d1e3c47e1.mp3',
  styleId: 'ghibli_cherry_blossoms',
};

// ========================================
// Composition Dimensions
// ========================================

// 16:9 Horizontal (Desktop/YouTube)
// Using 720p for faster rendering - most users watch on mobile anyway
const HORIZONTAL = { width: 1280, height: 720 };

// 9:16 Vertical (Mobile/TikTok/Reels)
const VERTICAL = { width: 1080, height: 1920 };

// 1:1 Square (Instagram)
const SQUARE = { width: 1080, height: 1080 };

// ========================================
// Main Remotion Root
// ========================================

export const RemotionRoot: React.FC = () => {
  const fullDuration = VIDEO_CONFIG.fps * VIDEO_CONFIG.durationSeconds;
  const teaserDuration = VIDEO_CONFIG.fps * VIDEO_CONFIG.teaserSeconds;

  return (
    <>
      {/* ================================== */}
      {/* MAIN HORIZONTAL COMPOSITIONS */}
      {/* ================================== */}

      {/* Full 2.5-minute video (1080p Horizontal) */}
      <Composition
        id="ForeverStoryVideo"
        component={ForeverStoryVideo}
        durationInFrames={fullDuration}
        fps={VIDEO_CONFIG.fps}
        width={HORIZONTAL.width}
        height={HORIZONTAL.height}
        defaultProps={defaultProps}
      />

      {/* 30-second teaser preview */}
      <Composition
        id="ForeverStoryTeaser"
        component={ForeverStoryVideo}
        durationInFrames={teaserDuration}
        fps={VIDEO_CONFIG.fps}
        width={HORIZONTAL.width}
        height={HORIZONTAL.height}
        defaultProps={defaultProps}
      />

      {/* ================================== */}
      {/* VERTICAL COMPOSITIONS (Mobile) */}
      {/* ================================== */}

      {/* Full video - Vertical for TikTok/Reels */}
      <Composition
        id="ForeverStoryVertical"
        component={ForeverStoryVideo}
        durationInFrames={fullDuration}
        fps={VIDEO_CONFIG.fps}
        width={VERTICAL.width}
        height={VERTICAL.height}
        defaultProps={defaultProps}
      />

      {/* Teaser - Vertical */}
      <Composition
        id="ForeverStoryTeaserVertical"
        component={ForeverStoryVideo}
        durationInFrames={teaserDuration}
        fps={VIDEO_CONFIG.fps}
        width={VERTICAL.width}
        height={VERTICAL.height}
        defaultProps={defaultProps}
      />

      {/* ================================== */}
      {/* SQUARE COMPOSITION (Instagram) */}
      {/* ================================== */}

      <Composition
        id="ForeverStorySquare"
        component={ForeverStoryVideo}
        durationInFrames={fullDuration}
        fps={VIDEO_CONFIG.fps}
        width={SQUARE.width}
        height={SQUARE.height}
        defaultProps={defaultProps}
      />

      {/* ================================== */}
      {/* STYLE PREVIEW COMPOSITIONS */}
      {/* Short previews for each of the 24 styles */}
      {/* ================================== */}

      {(Object.keys(CINEMATIC_STYLES) as CinematicStyleId[]).map((styleId) => {
        const safeId = styleId.replace(/[^a-zA-Z0-9-]/g, '-');
        return (
          <Composition
            key={`preview-${styleId}`}
            id={`StylePreview-${safeId}`}
            component={ForeverStoryVideo}
            durationInFrames={VIDEO_CONFIG.fps * 10} // 10 second preview
            fps={VIDEO_CONFIG.fps}
            width={640}
            height={360}
            defaultProps={{
              ...defaultProps,
              styleId,
            }}
          />
        );
      })}

      {/* ================================== */}
      {/* 4K COMPOSITION (Premium) */}
      {/* ================================== */}

      <Composition
        id="ForeverStory4K"
        component={ForeverStoryVideo}
        durationInFrames={fullDuration}
        fps={VIDEO_CONFIG.fps}
        width={3840}
        height={2160}
        defaultProps={defaultProps}
      />

      {/* ================================== */}
      {/* HD COMPOSITIONS (720p for fast preview) */}
      {/* ================================== */}

      <Composition
        id="ForeverStoryHD"
        component={ForeverStoryVideo}
        durationInFrames={fullDuration}
        fps={VIDEO_CONFIG.fps}
        width={1280}
        height={720}
        defaultProps={defaultProps}
      />

      <Composition
        id="ForeverStoryTeaserHD"
        component={ForeverStoryVideo}
        durationInFrames={teaserDuration}
        fps={VIDEO_CONFIG.fps}
        width={1280}
        height={720}
        defaultProps={defaultProps}
      />
    </>
  );
};

export default RemotionRoot;

// Required for Remotion bundling: registers the root component
registerRoot(RemotionRoot);
