import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  Video,
  Img,
  interpolate,
} from 'remotion';

export interface MovieCompositionProps {
  partner1Name: string;
  partner2Name: string;
  anniversaryDate: string;
  howWeMet: string;
  firstDate: string;
  funniestMoment: string;
  whenIKnew: string;
  favoriteThing: string;
  futureDream: string;
  photoUrls: string[]; // These will be animated video clips
  narrationAudioUrl: string;
  musicUrl: string;
  styleId: string;
}

export const MovieComposition: React.FC<MovieCompositionProps> = ({
  partner1Name,
  partner2Name,
  photoUrls,
  narrationAudioUrl,
  musicUrl,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Calculate duration per clip
  const clipsCount = photoUrls.length || 1;
  const durationPerClip = Math.floor(durationInFrames / clipsCount);

  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      {/* Background Music */}
      {musicUrl && (
        <Audio src={musicUrl} volume={0.3} />
      )}

      {/* Narration Audio */}
      {narrationAudioUrl && (
        <Audio src={narrationAudioUrl} volume={1.0} />
      )}

      {/* Animated Scene Clips */}
      {photoUrls.map((url, index) => {
        const startFrame = index * durationPerClip;
        const clipDuration = durationPerClip;

        return (
          <Sequence
            key={index}
            from={startFrame}
            durationInFrames={clipDuration}
          >
            <SceneClip
              videoUrl={url}
              durationInFrames={clipDuration}
              fps={fps}
            />
          </Sequence>
        );
      })}

      {/* Fallback: If no clips, show title */}
      {photoUrls.length === 0 && (
        <AbsoluteFill
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: 80,
            color: 'white',
            textAlign: 'center',
            fontFamily: 'Arial, sans-serif',
          }}
        >
          <div>
            {partner1Name} & {partner2Name}
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

const SceneClip: React.FC<{
  videoUrl: string;
  durationInFrames: number;
  fps: number;
}> = ({ videoUrl, durationInFrames, fps }) => {
  const frame = useCurrentFrame();

  // Fade in/out effect
  const fadeInDuration = fps * 0.5; // 0.5 seconds
  const fadeOutDuration = fps * 0.5;
  const fadeOutStart = durationInFrames - fadeOutDuration;

  const opacity = interpolate(
    frame,
    [0, fadeInDuration, fadeOutStart, durationInFrames],
    [0, 1, 1, 0],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );

  // Check if it's a video or image
  const isVideo = videoUrl.includes('.mp4') || videoUrl.includes('.webm');

  return (
    <AbsoluteFill style={{ opacity }}>
      {isVideo ? (
        <Video
          src={videoUrl}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      ) : (
        <Img
          src={videoUrl}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      )}
    </AbsoluteFill>
  );
};
