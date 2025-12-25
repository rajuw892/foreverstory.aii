// ========================================
// ForeverStory Remotion Video Composition
// Complete 2.5-minute emotionally powerful video
// Supports all 24 cinematic styles
// ========================================

import React, { useMemo } from 'react';
import {
  AbsoluteFill,
  Audio,
  Img,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from 'remotion';
import {
  CinematicStyleId,
  CinematicStyle,
  CINEMATIC_STYLES,
  getMusicUrlForStyle,
  ParticleType,
} from './styles';

// ========================================
// Video Props Interface
// ========================================

export interface ForeverStoryVideoProps {
  // Couple information
  partner1Name: string;
  partner2Name: string;
  anniversaryDate: string;

  // Story answers
  howWeMet: string;
  firstDate: string;
  funniestMoment: string;
  whenIKnew: string;
  favoriteThing: string;
  futureDream: string;

  // Media
  photoUrls: string[];
  narrationAudioUrl: string;
  musicUrl?: string;

  // Style
  styleId: CinematicStyleId;

  // Narration text for subtitles (optional)
  narrationText?: string;
}

// ========================================
// Ken Burns Effect Component
// Creates cinematic photo movement
// ========================================

interface KenBurnsConfig {
  startScale: number;
  endScale: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  duration: number;
}

const KEN_BURNS_PATTERNS: KenBurnsConfig[] = [
  { startScale: 1.0, endScale: 1.15, startX: -5, startY: -3, endX: 5, endY: 3, duration: 0 },
  { startScale: 1.2, endScale: 1.0, startX: 5, startY: 3, endX: -5, endY: -3, duration: 0 },
  { startScale: 1.1, endScale: 1.18, startX: -8, startY: 0, endX: 8, endY: 0, duration: 0 },
  { startScale: 1.15, endScale: 1.05, startX: 0, startY: -5, endX: 0, endY: 5, duration: 0 },
  { startScale: 1.0, endScale: 1.25, startX: -3, startY: -5, endX: 3, endY: 5, duration: 0 },
  { startScale: 1.25, endScale: 1.0, startX: 5, startY: 5, endX: -5, endY: -5, duration: 0 },
];

interface PhotoSlideProps {
  src: string;
  patternIndex: number;
  style: CinematicStyle;
}

const PhotoSlide: React.FC<PhotoSlideProps> = ({ src, patternIndex, style }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const pattern = KEN_BURNS_PATTERNS[patternIndex % KEN_BURNS_PATTERNS.length];
  const progress = Math.min(frame / durationInFrames, 1);

  const scale = interpolate(progress, [0, 1], [pattern.startScale, pattern.endScale], {
    easing: Easing.inOut(Easing.ease),
  });

  const x = interpolate(progress, [0, 1], [pattern.startX, pattern.endX], {
    easing: Easing.inOut(Easing.ease),
  });

  const y = interpolate(progress, [0, 1], [pattern.startY, pattern.endY], {
    easing: Easing.inOut(Easing.ease),
  });

  // Frame styles based on style configuration
  const getFrameStyles = (): React.CSSProperties => {
    const base: React.CSSProperties = {
      position: 'absolute',
      width: '75%',
      aspectRatio: '16/9',
      left: '50%',
      top: '50%',
      transform: 'translate(-50%, -50%)',
      overflow: 'hidden',
    };

    switch (style.frameStyle) {
      case 'polaroid':
        return {
          ...base,
          padding: '20px 20px 60px 20px',
          backgroundColor: '#FFFEF9',
          boxShadow: '0 15px 50px rgba(0,0,0,0.4)',
          borderRadius: '4px',
        };
      case 'vignette':
        return {
          ...base,
          borderRadius: '12px',
          boxShadow: `inset 0 0 120px 50px rgba(0,0,0,0.6), 0 15px 50px rgba(0,0,0,0.5)`,
        };
      case 'vintage':
        return {
          ...base,
          border: `8px solid ${style.accentColor}40`,
          borderRadius: '8px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
        };
      case 'film':
        return {
          ...base,
          border: '12px solid #1a1a1a',
          borderRadius: '0',
          boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
        };
      case 'ornate':
        return {
          ...base,
          border: `6px solid ${style.accentColor}`,
          borderRadius: '4px',
          boxShadow: `0 0 30px ${style.accentColor}40, 0 15px 50px rgba(0,0,0,0.4)`,
        };
      case 'soft_edges':
      default:
        return {
          ...base,
          borderRadius: '20px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
        };
    }
  };

  // Color grading filter
  const colorFilter = `
    saturate(${style.colorGrading.saturation})
    brightness(${style.colorGrading.brightness})
    contrast(${style.colorGrading.contrast})
    hue-rotate(${style.colorGrading.hue}deg)
    sepia(${style.colorGrading.sepia})
    blur(${style.colorGrading.blur}px)
  `;

  // Crossfade animation
  const fadeIn = interpolate(frame, [0, fps * 0.8], [0, 1], { extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [durationInFrames - fps * 0.8, durationInFrames], [1, 0], {
    extrapolateLeft: 'clamp',
  });
  const opacity = Math.min(fadeIn, fadeOut);

  return (
    <div style={{ ...getFrameStyles(), opacity }}>
      <div
        style={{
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          borderRadius: style.frameStyle === 'polaroid' ? '0' : '12px',
        }}
      >
        <Img
          src={src}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: `scale(${scale}) translate(${x}%, ${y}%)`,
            filter: colorFilter,
          }}
        />
      </div>
      {/* Vignette overlay */}
      {style.colorGrading.vignette > 0 && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(circle at center, transparent 40%, rgba(0,0,0,${style.colorGrading.vignette}) 100%)`,
            pointerEvents: 'none',
          }}
        />
      )}
    </div>
  );
};

// ========================================
// Gradient Background Component
// ========================================

interface GradientBackgroundProps {
  style: CinematicStyle;
}

const GradientBackground: React.FC<GradientBackgroundProps> = ({ style }) => {
  const gradientColors = style.gradient.colors.join(', ');
  const direction = style.gradient.direction;

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(${direction}deg, ${gradientColors})`,
      }}
    />
  );
};

// ========================================
// Particle Effects Component
// Renders style-specific floating particles
// ========================================

interface ParticleProps {
  type: ParticleType;
  color: string;
  count: number;
}

const Particles: React.FC<ParticleProps> = ({ type, color, count }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  // Generate stable particles with useMemo
  const particles = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 15 + 5,
      speed: Math.random() * 2 + 0.5,
      delay: Math.random() * 200,
      rotation: Math.random() * 360,
      opacity: Math.random() * 0.5 + 0.5,
    }));
  }, [count]);

  if (type === 'none') return null;

  const getParticleStyle = (particle: typeof particles[0]): React.CSSProperties => {
    const baseY = ((frame * particle.speed + particle.delay) % 130) - 15;
    const swayX = Math.sin((frame + particle.delay) * 0.04) * 15;
    const rotationSpeed = (frame + particle.rotation) * 2;

    switch (type) {
      case 'sakura':
      case 'petals':
        return {
          left: `${particle.x + swayX * 0.5}%`,
          top: `${baseY}%`,
          width: particle.size,
          height: particle.size,
          backgroundColor: color,
          borderRadius: '50% 0 50% 50%',
          transform: `rotate(${rotationSpeed}deg)`,
          opacity: particle.opacity * 0.8,
        };

      case 'embers':
        const emberPulse = Math.sin((frame + particle.delay) * 0.15) * 0.3 + 0.7;
        const riseY = 100 - ((frame * particle.speed * 0.3 + particle.delay) % 120);
        return {
          left: `${particle.x + swayX * 0.3}%`,
          top: `${riseY}%`,
          width: particle.size * 0.4,
          height: particle.size * 0.4,
          backgroundColor: color,
          borderRadius: '50%',
          boxShadow: `0 0 ${15 * emberPulse}px ${8 * emberPulse}px ${color}80`,
          opacity: emberPulse,
        };

      case 'fireworks':
        const burstPhase = ((frame + particle.delay * 3) % 180) / 180;
        const burstScale = burstPhase < 0.5 ? burstPhase * 2 : (1 - burstPhase) * 2;
        const burstOpacity = burstPhase < 0.7 ? 1 : (1 - burstPhase) / 0.3;
        return {
          left: `${particle.x}%`,
          top: `${30 + particle.y * 0.4}%`,
          width: particle.size * burstScale * 3,
          height: particle.size * burstScale * 3,
          backgroundColor: 'transparent',
          border: `2px solid ${color}`,
          borderRadius: '50%',
          boxShadow: `0 0 20px ${color}`,
          opacity: burstOpacity * particle.opacity,
        };

      case 'lanterns':
        const floatY = 100 - ((frame * particle.speed * 0.15 + particle.delay) % 130);
        const gentleSway = Math.sin((frame + particle.delay) * 0.02) * 8;
        const glowPulse = Math.sin((frame + particle.delay) * 0.1) * 0.2 + 0.8;
        return {
          left: `${particle.x + gentleSway}%`,
          top: `${floatY}%`,
          width: particle.size * 1.5,
          height: particle.size * 2,
          backgroundColor: color,
          borderRadius: '50% 50% 45% 45%',
          boxShadow: `0 0 ${25 * glowPulse}px ${12 * glowPulse}px ${color}60`,
          opacity: glowPulse,
        };

      case 'balloons':
        const balloonY = 100 - ((frame * particle.speed * 0.2 + particle.delay) % 140);
        const balloonSway = Math.sin((frame + particle.delay) * 0.03) * 10;
        const balloonColors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181'];
        return {
          left: `${particle.x + balloonSway}%`,
          top: `${balloonY}%`,
          width: particle.size * 1.2,
          height: particle.size * 1.5,
          backgroundColor: balloonColors[particle.id % balloonColors.length],
          borderRadius: '50% 50% 45% 45%',
          boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
          opacity: 0.9,
        };

      case 'snowflakes':
        const snowSway = Math.sin((frame + particle.delay) * 0.05) * 20;
        const snowY = ((frame * particle.speed * 0.4 + particle.delay) % 120) - 10;
        return {
          left: `${particle.x + snowSway}%`,
          top: `${snowY}%`,
          width: particle.size * 0.5,
          height: particle.size * 0.5,
          backgroundColor: '#FFFFFF',
          borderRadius: '50%',
          boxShadow: '0 0 5px rgba(255,255,255,0.8)',
          opacity: particle.opacity * 0.9,
        };

      case 'stars':
        const twinkle = Math.sin((frame + particle.delay) * 0.12) * 0.4 + 0.6;
        return {
          left: `${particle.x}%`,
          top: `${particle.y}%`,
          width: particle.size * 0.25,
          height: particle.size * 0.25,
          backgroundColor: '#FFFFFF',
          borderRadius: '50%',
          boxShadow: `0 0 ${particle.size}px ${particle.size * 0.4}px rgba(255,255,255,${twinkle})`,
          opacity: twinkle,
        };

      case 'fireflies':
        const fireflyPulse = Math.sin((frame + particle.delay) * 0.2) * 0.5 + 0.5;
        const fireflyX = particle.x + Math.sin((frame * 0.02 + particle.delay) * 0.5) * 15;
        const fireflyY = particle.y + Math.sin((frame * 0.03 + particle.delay) * 0.7) * 10;
        return {
          left: `${fireflyX}%`,
          top: `${fireflyY}%`,
          width: particle.size * 0.3,
          height: particle.size * 0.3,
          backgroundColor: color,
          borderRadius: '50%',
          boxShadow: `0 0 ${12 * fireflyPulse}px ${6 * fireflyPulse}px ${color}`,
          opacity: fireflyPulse > 0.3 ? fireflyPulse : 0,
        };

      case 'inkdrops':
        const inkScale = ((frame + particle.delay) % 200) / 200;
        const inkOpacity = inkScale < 0.5 ? inkScale * 2 : 1 - (inkScale - 0.5) * 2;
        return {
          left: `${particle.x}%`,
          top: `${particle.y}%`,
          width: particle.size * inkScale * 2,
          height: particle.size * inkScale * 2,
          backgroundColor: color,
          borderRadius: '50%',
          filter: 'blur(2px)',
          opacity: inkOpacity * 0.3,
        };

      case 'filmgrain':
        const grainOpacity = Math.random() * 0.15;
        return {
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          width: 2,
          height: 2,
          backgroundColor: Math.random() > 0.5 ? '#FFFFFF' : '#000000',
          borderRadius: '50%',
          opacity: grainOpacity,
        };

      case 'rain':
        const rainY = ((frame * particle.speed * 3 + particle.delay) % 130) - 15;
        return {
          left: `${particle.x}%`,
          top: `${rainY}%`,
          width: 2,
          height: particle.size * 2,
          backgroundColor: `${color}60`,
          borderRadius: '2px',
          opacity: 0.6,
        };

      case 'hyperspace':
        const streakLength = 50 + particle.speed * 30;
        const streakProgress = ((frame * 2 + particle.delay) % 60) / 60;
        return {
          left: `${50 + (particle.x - 50) * streakProgress * 3}%`,
          top: `${50 + (particle.y - 50) * streakProgress * 3}%`,
          width: 2,
          height: streakLength * streakProgress,
          backgroundColor: color,
          transform: `rotate(${Math.atan2(particle.y - 50, particle.x - 50) * 180 / Math.PI + 90}deg)`,
          opacity: streakProgress,
        };

      case 'digital':
        const digitalPulse = Math.sin((frame + particle.delay) * 0.15) * 0.5 + 0.5;
        return {
          left: `${particle.x}%`,
          top: `${particle.y}%`,
          width: particle.size * 0.3,
          height: particle.size * 0.3,
          backgroundColor: color,
          borderRadius: '2px',
          boxShadow: `0 0 10px ${color}`,
          opacity: digitalPulse > 0.4 ? digitalPulse : 0,
          transform: `scale(${digitalPulse})`,
        };

      case 'bokeh':
        const bokehPulse = Math.sin((frame + particle.delay) * 0.08) * 0.3 + 0.7;
        return {
          left: `${particle.x}%`,
          top: `${particle.y}%`,
          width: particle.size * 2,
          height: particle.size * 2,
          backgroundColor: `${color}30`,
          border: `1px solid ${color}50`,
          borderRadius: '50%',
          opacity: bokehPulse * particle.opacity,
          filter: 'blur(1px)',
        };

      case 'sparkles':
        const sparklePulse = Math.sin((frame + particle.delay) * 0.25) * 0.5 + 0.5;
        return {
          left: `${particle.x}%`,
          top: `${particle.y}%`,
          width: particle.size * 0.35,
          height: particle.size * 0.35,
          backgroundColor: color,
          borderRadius: '50%',
          boxShadow: `0 0 ${10 * sparklePulse}px ${5 * sparklePulse}px ${color}`,
          opacity: sparklePulse > 0.35 ? sparklePulse : 0,
        };

      case 'dandelions':
        const dandelionY = ((frame * particle.speed * 0.15 + particle.delay) % 120);
        const dandelionSway = Math.sin((frame + particle.delay) * 0.03) * 25;
        return {
          left: `${particle.x + dandelionSway}%`,
          top: `${dandelionY}%`,
          width: particle.size * 0.4,
          height: particle.size * 0.4,
          backgroundColor: color,
          borderRadius: '50%',
          boxShadow: `0 0 8px ${color}`,
          opacity: particle.opacity * 0.7,
        };

      case 'cosmic':
        const cosmicPulse = Math.sin((frame + particle.delay) * 0.1) * 0.4 + 0.6;
        return {
          left: `${particle.x}%`,
          top: `${particle.y}%`,
          width: particle.size * 0.5,
          height: particle.size * 0.5,
          backgroundColor: color,
          borderRadius: '50%',
          boxShadow: `0 0 ${20 * cosmicPulse}px ${10 * cosmicPulse}px ${color}`,
          opacity: cosmicPulse,
        };

      case 'neon':
        const neonPulse = Math.sin((frame + particle.delay) * 0.2) * 0.3 + 0.7;
        return {
          left: `${particle.x}%`,
          top: `${particle.y}%`,
          width: particle.size * 0.25,
          height: particle.size * 0.25,
          backgroundColor: color,
          borderRadius: '50%',
          boxShadow: `0 0 15px ${color}, 0 0 30px ${color}`,
          opacity: neonPulse,
        };

      case 'steam':
        const steamY = 100 - ((frame * particle.speed * 0.3 + particle.delay) % 100);
        const steamScale = 1 + (100 - steamY) / 100;
        const steamOpacity = Math.max(0, 1 - (100 - steamY) / 80);
        return {
          left: `${particle.x + Math.sin((frame + particle.delay) * 0.05) * 10}%`,
          top: `${steamY}%`,
          width: particle.size * steamScale,
          height: particle.size * steamScale,
          backgroundColor: color,
          borderRadius: '50%',
          filter: 'blur(5px)',
          opacity: steamOpacity * 0.4,
        };

      case 'marigolds':
        const marigoldY = ((frame * particle.speed * 0.5 + particle.delay) % 120) - 10;
        const marigoldSway = Math.sin((frame + particle.delay) * 0.05) * 15;
        return {
          left: `${particle.x + marigoldSway}%`,
          top: `${marigoldY}%`,
          width: particle.size,
          height: particle.size,
          backgroundColor: color,
          borderRadius: '50%',
          boxShadow: `0 0 10px ${color}50`,
          opacity: particle.opacity * 0.85,
        };

      case 'roses':
        const roseY = ((frame * particle.speed * 0.4 + particle.delay) % 125) - 12;
        const roseSway = Math.sin((frame + particle.delay) * 0.04) * 20;
        const roseRotate = (frame + particle.rotation) * 1.5;
        return {
          left: `${particle.x + roseSway}%`,
          top: `${roseY}%`,
          width: particle.size * 0.8,
          height: particle.size * 0.8,
          backgroundColor: color,
          borderRadius: '50% 0 50% 50%',
          transform: `rotate(${roseRotate}deg)`,
          opacity: particle.opacity * 0.8,
        };

      default:
        return {
          left: `${particle.x}%`,
          top: `${particle.y}%`,
          width: particle.size,
          height: particle.size,
          backgroundColor: color,
          borderRadius: '50%',
          opacity: particle.opacity,
        };
    }
  };

  return (
    <AbsoluteFill style={{ pointerEvents: 'none', overflow: 'hidden' }}>
      {particles.map((particle) => (
        <div
          key={particle.id}
          style={{
            position: 'absolute',
            ...getParticleStyle(particle),
          }}
        />
      ))}
    </AbsoluteFill>
  );
};

// ========================================
// Title Card Component
// Opening sequence with names
// ========================================

interface TitleCardProps {
  partner1Name: string;
  partner2Name: string;
  styleName: string;
  style: CinematicStyle;
}

const TitleCard: React.FC<TitleCardProps> = ({ partner1Name, partner2Name, styleName, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Animation springs
  const namesFadeIn = spring({
    frame,
    fps,
    config: { damping: 100, stiffness: 150, mass: 0.5 },
  });

  const namesScale = spring({
    frame: frame - 10,
    fps,
    config: { damping: 80, stiffness: 120 },
  });

  const lineDraw = interpolate(frame, [fps * 2, fps * 3.5], [0, 100], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const taglineOpacity = interpolate(frame, [fps * 3.5, fps * 5], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const styleNameOpacity = interpolate(frame, [fps * 5, fps * 6.5], [0, 0.7], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        padding: 60,
      }}
    >
      <div
        style={{
          textAlign: 'center',
          opacity: namesFadeIn,
          transform: `scale(${0.8 + namesScale * 0.2})`,
        }}
      >
        {/* Couple Names */}
        <h1
          style={{
            fontFamily: `"${style.titleFont}", serif`,
            fontSize: 90,
            fontWeight: 400,
            color: '#FFFFFF',
            textShadow: style.textShadow + ', 0 4px 30px rgba(0,0,0,0.5)',
            margin: 0,
            letterSpacing: '0.05em',
          }}
        >
          {partner1Name} & {partner2Name}
        </h1>

        {/* Decorative Line */}
        <div
          style={{
            width: `${lineDraw}%`,
            maxWidth: 400,
            height: 2,
            background: `linear-gradient(90deg, transparent, ${style.accentColor}, transparent)`,
            margin: '30px auto',
          }}
        />

        {/* Tagline */}
        <p
          style={{
            fontFamily: `"${style.bodyFont}", serif`,
            fontSize: 32,
            color: style.accentColor,
            fontStyle: 'italic',
            margin: 0,
            opacity: taglineOpacity,
            textShadow: '0 2px 15px rgba(0,0,0,0.3)',
          }}
        >
          Our Forever Story
        </p>

        {/* Style Name */}
        <p
          style={{
            fontFamily: 'sans-serif',
            fontSize: 16,
            color: 'rgba(255,255,255,0.7)',
            marginTop: 50,
            opacity: styleNameOpacity,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
          }}
        >
          {styleName}
        </p>
      </div>
    </AbsoluteFill>
  );
};

// ========================================
// Text Overlay Component
// Elegant text captions on photos
// ========================================

interface TextOverlayProps {
  text: string;
  position: 'bottom' | 'center' | 'top';
  style: CinematicStyle;
}

const TextOverlay: React.FC<TextOverlayProps> = ({ text, position, style }) => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, fps * 0.8], [0, 1], { extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [durationInFrames - fps * 0.8, durationInFrames], [1, 0], {
    extrapolateLeft: 'clamp',
  });
  const opacity = Math.min(fadeIn, fadeOut);

  const slideUp = interpolate(frame, [0, fps * 0.8], [20, 0], {
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  const getPositionStyles = (): React.CSSProperties => {
    switch (position) {
      case 'top':
        return { top: 80, left: '50%', transform: `translateX(-50%) translateY(${slideUp}px)` };
      case 'center':
        return { top: '50%', left: '50%', transform: `translate(-50%, -50%) translateY(${slideUp}px)` };
      case 'bottom':
      default:
        return { bottom: 100, left: '50%', transform: `translateX(-50%) translateY(${-slideUp}px)` };
    }
  };

  return (
    <div
      style={{
        position: 'absolute',
        ...getPositionStyles(),
        backgroundColor: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(10px)',
        padding: '24px 48px',
        borderRadius: 16,
        maxWidth: '75%',
        opacity,
        borderLeft: `4px solid ${style.accentColor}`,
      }}
    >
      <p
        style={{
          fontFamily: `"${style.bodyFont}", serif`,
          fontSize: 26,
          color: '#FFFFFF',
          textAlign: 'center',
          lineHeight: 1.7,
          margin: 0,
          fontStyle: 'italic',
        }}
      >
        "{text}"
      </p>
    </div>
  );
};

// ========================================
// End Card Component
// Closing sequence
// ========================================

interface EndCardProps {
  partner1Name: string;
  partner2Name: string;
  anniversaryDate: string;
  style: CinematicStyle;
}

const EndCard: React.FC<EndCardProps> = ({ partner1Name, partner2Name, anniversaryDate, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fadeIn = spring({
    frame,
    fps,
    config: { damping: 100, stiffness: 150 },
  });

  const heartBeat = Math.sin(frame * 0.15) * 0.1 + 1;

  const taglineOpacity = interpolate(frame, [fps * 2, fps * 3], [0, 1], {
    extrapolateLeft: 'clamp',
  });

  const creditsOpacity = interpolate(frame, [fps * 4, fps * 5], [0, 0.6], {
    extrapolateLeft: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        padding: 60,
      }}
    >
      <div
        style={{
          textAlign: 'center',
          opacity: fadeIn,
        }}
      >
        {/* Tagline */}
        <p
          style={{
            fontFamily: `"${style.bodyFont}", serif`,
            fontSize: 42,
            color: '#FFFFFF',
            fontStyle: 'italic',
            margin: 0,
            marginBottom: 40,
            textShadow: style.textShadow + ', 0 4px 20px rgba(0,0,0,0.4)',
            opacity: taglineOpacity,
          }}
        >
          Forever begins with us
        </p>

        {/* Heart */}
        <div
          style={{
            fontSize: 60,
            transform: `scale(${heartBeat})`,
            marginBottom: 30,
          }}
        >
          <span style={{ color: style.accentColor }}>&#10084;</span>
        </div>

        {/* Names */}
        <h2
          style={{
            fontFamily: `"${style.titleFont}", serif`,
            fontSize: 54,
            color: style.accentColor,
            margin: 0,
            textShadow: '0 4px 20px rgba(0,0,0,0.4)',
          }}
        >
          {partner1Name} & {partner2Name}
        </h2>

        {/* Anniversary Date */}
        {anniversaryDate && (
          <p
            style={{
              fontFamily: `"${style.bodyFont}", serif`,
              fontSize: 22,
              color: 'rgba(255,255,255,0.8)',
              marginTop: 20,
              opacity: taglineOpacity,
            }}
          >
            Since {new Date(anniversaryDate).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
        )}

        {/* Credits */}
        <p
          style={{
            fontFamily: 'sans-serif',
            fontSize: 14,
            color: 'rgba(255,255,255,0.5)',
            marginTop: 60,
            opacity: creditsOpacity,
            letterSpacing: '0.15em',
          }}
        >
          Created with love at ForeverStory.ai
        </p>
      </div>
    </AbsoluteFill>
  );
};

// ========================================
// Scene Text Labels
// Section headers during the video
// ========================================

const SCENE_LABELS = [
  { start: 15, text: 'How we met...' },
  { start: 40, text: 'Our first date' },
  { start: 60, text: 'The moment we laughed' },
  { start: 75, text: 'When I knew...' },
  { start: 100, text: 'What I love most' },
  { start: 120, text: 'Our dream together' },
];

// ========================================
// Main Video Composition
// ========================================

export const ForeverStoryVideo: React.FC<ForeverStoryVideoProps> = ({
  partner1Name,
  partner2Name,
  anniversaryDate,
  howWeMet,
  firstDate,
  funniestMoment,
  whenIKnew,
  favoriteThing,
  futureDream,
  photoUrls,
  narrationAudioUrl,
  musicUrl,
  styleId,
  narrationText,
}) => {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();

  // Get style configuration
  const style = CINEMATIC_STYLES[styleId] || CINEMATIC_STYLES.ghibli_cherry_blossoms;

  // Video structure timing (150 seconds = 4500 frames at 30fps)
  const TITLE_DURATION = 10 * fps; // 0-10s
  const PHOTOS_START = TITLE_DURATION; // 10s
  const PHOTOS_END = 130 * fps; // 130s
  const END_CARD_START = 140 * fps; // 140s
  const TOTAL_DURATION = 150 * fps; // 150s

  // Calculate photo timing (120 seconds for photos)
  const photoCount = Math.min(photoUrls.length, 12);
  const photoDuration = Math.floor((PHOTOS_END - PHOTOS_START) / photoCount);

  // Get music URL based on style if not provided
  const finalMusicUrl = musicUrl || getMusicUrlForStyle(styleId);

  // Story texts for overlays (shortened)
  const storyTexts = [
    howWeMet?.substring(0, 120) || '',
    firstDate?.substring(0, 120) || '',
    funniestMoment?.substring(0, 120) || '',
    whenIKnew?.substring(0, 120) || '',
    favoriteThing?.substring(0, 120) || '',
    futureDream?.substring(0, 120) || '',
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: '#000000' }}>
      {/* Layer 1: Gradient Background */}
      <GradientBackground style={style} />

      {/* Layer 2: Particle Effects */}
      <Particles
        type={style.particleType}
        color={style.particleColor}
        count={style.particleCount}
      />

      {/* Layer 3: Title Card (0-10s) */}
      <Sequence from={0} durationInFrames={TITLE_DURATION}>
        <TitleCard
          partner1Name={partner1Name}
          partner2Name={partner2Name}
          styleName={style.name}
          style={style}
        />
      </Sequence>

      {/* Layer 4: Photo Montage (10-130s) */}
      {photoUrls.slice(0, photoCount).map((photoUrl, index) => {
        const photoStart = PHOTOS_START + index * photoDuration;
        return (
          <Sequence key={index} from={photoStart} durationInFrames={photoDuration}>
            <PhotoSlide
              src={photoUrl}
              patternIndex={index}
              style={style}
            />
            {/* Show story text for first 6 photos */}
            {index < storyTexts.length && storyTexts[index] && (
              <TextOverlay
                text={storyTexts[index]}
                position="bottom"
                style={style}
              />
            )}
          </Sequence>
        );
      })}

      {/* Layer 5: Scene Labels */}
      {SCENE_LABELS.map((label, index) => (
        <Sequence
          key={`label-${index}`}
          from={label.start * fps}
          durationInFrames={4 * fps}
        >
          <div
            style={{
              position: 'absolute',
              top: 60,
              left: '50%',
              transform: 'translateX(-50%)',
              opacity: interpolate(
                frame - label.start * fps,
                [0, fps * 0.5, fps * 3, fps * 4],
                [0, 1, 1, 0],
                { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
              ),
            }}
          >
            <p
              style={{
                fontFamily: `"${style.titleFont}", serif`,
                fontSize: 36,
                color: style.accentColor,
                fontStyle: 'italic',
                textShadow: '0 2px 20px rgba(0,0,0,0.5)',
                margin: 0,
              }}
            >
              {label.text}
            </p>
          </div>
        </Sequence>
      ))}

      {/* Layer 6: End Card (140-150s) */}
      <Sequence from={END_CARD_START} durationInFrames={TOTAL_DURATION - END_CARD_START}>
        <EndCard
          partner1Name={partner1Name}
          partner2Name={partner2Name}
          anniversaryDate={anniversaryDate}
          style={style}
        />
      </Sequence>

      {/* Layer 7: Final Fade Out */}
      {frame > TOTAL_DURATION - fps * 2 && (
        <AbsoluteFill
          style={{
            backgroundColor: '#000000',
            opacity: interpolate(
              frame,
              [TOTAL_DURATION - fps * 2, TOTAL_DURATION],
              [0, 1],
              { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
            ),
          }}
        />
      )}

      {/* Audio: Background Music */}
      {finalMusicUrl && (
        <Audio
          src={finalMusicUrl}
          volume={(f) => {
            // Fade in over first 2 seconds
            if (f < fps * 2) return interpolate(f, [0, fps * 2], [0, 0.3]);
            // Fade out over last 5 seconds
            if (f > TOTAL_DURATION - fps * 5) {
              return interpolate(f, [TOTAL_DURATION - fps * 5, TOTAL_DURATION], [0.3, 0]);
            }
            return 0.3;
          }}
        />
      )}

      {/* Audio: Narration Voice-over */}
      {narrationAudioUrl && (
        <Audio
          src={narrationAudioUrl}
          volume={1.0}
          startFrom={TITLE_DURATION} // Start after title card
        />
      )}
    </AbsoluteFill>
  );
};

export default ForeverStoryVideo;
