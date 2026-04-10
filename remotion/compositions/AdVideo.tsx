import React from 'react';
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Img,
} from 'remotion';

interface Scene {
  type: 'hook' | 'problem' | 'product' | 'benefit' | 'cta';
  text: string;
  visual?: string;
  duration: number;
  transition?: string;
  animation?: string;
  backgroundColor?: string;
}

interface AdVideoProps {
  style: string;
  scenes: Scene[];
  clientName: string;
  procedure: string;
  primaryColor: string;
  accentColor: string;
  logoUrl?: string;
}

const SceneComponent: React.FC<{
  scene: Scene;
  primaryColor: string;
  accentColor: string;
  clientName: string;
}> = ({ scene, primaryColor, accentColor, clientName }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [durationInFrames - 15, durationInFrames], [1, 0], { extrapolateLeft: 'clamp' });
  const opacity = Math.min(fadeIn, fadeOut);

  const slideUp = interpolate(frame, [0, 20], [60, 0], { extrapolateRight: 'clamp' });
  const scale = spring({ frame, fps, config: { damping: 12, stiffness: 200 } });

  const bgColors: Record<string, string> = {
    hook: primaryColor,
    problem: '#1A1A1A',
    product: '#FFFFFF',
    benefit: accentColor,
    cta: primaryColor,
  };

  const textColors: Record<string, string> = {
    hook: '#FFFFFF',
    problem: '#FFFFFF',
    product: '#1A1A1A',
    benefit: '#FFFFFF',
    cta: '#FFFFFF',
  };

  const bg = scene.backgroundColor || bgColors[scene.type] || '#1A1A1A';
  const textColor = textColors[scene.type] || '#FFFFFF';

  return (
    <AbsoluteFill
      style={{
        backgroundColor: bg,
        opacity,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 80,
      }}
    >
      {scene.type === 'hook' && (
        <div style={{ transform: `scale(${scale})`, textAlign: 'center' }}>
          <div style={{
            fontSize: 72,
            fontWeight: 'bold',
            color: textColor,
            lineHeight: 1.2,
            textShadow: '0 4px 20px rgba(0,0,0,0.3)',
          }}>
            {scene.text}
          </div>
        </div>
      )}

      {scene.type === 'problem' && (
        <div style={{ transform: `translateY(${slideUp}px)`, textAlign: 'center' }}>
          <div style={{ fontSize: 28, color: accentColor, marginBottom: 20, letterSpacing: 3, textTransform: 'uppercase' }}>
            O problema
          </div>
          <div style={{ fontSize: 56, fontWeight: 'bold', color: textColor, lineHeight: 1.3 }}>
            {scene.text}
          </div>
        </div>
      )}

      {scene.type === 'product' && (
        <div style={{ transform: `translateY(${slideUp}px)`, textAlign: 'center' }}>
          <div style={{ fontSize: 28, color: primaryColor, marginBottom: 20, letterSpacing: 3, textTransform: 'uppercase' }}>
            A solução
          </div>
          <div style={{ fontSize: 52, fontWeight: 'bold', color: textColor, lineHeight: 1.3 }}>
            {scene.text}
          </div>
          <div style={{
            width: 120, height: 4, backgroundColor: accentColor,
            margin: '30px auto', borderRadius: 2
          }} />
        </div>
      )}

      {scene.type === 'benefit' && (
        <div style={{ transform: `scale(${scale})`, textAlign: 'center' }}>
          <div style={{ fontSize: 60, fontWeight: 'bold', color: textColor, lineHeight: 1.2 }}>
            {scene.text}
          </div>
          <div style={{ fontSize: 80, marginTop: 20 }}>✨</div>
        </div>
      )}

      {scene.type === 'cta' && (
        <div style={{ transform: `translateY(${slideUp}px)`, textAlign: 'center' }}>
          <div style={{ fontSize: 48, fontWeight: 'bold', color: textColor, marginBottom: 40, lineHeight: 1.3 }}>
            {scene.text}
          </div>
          <div style={{
            backgroundColor: accentColor,
            color: '#FFFFFF',
            fontSize: 32,
            fontWeight: 'bold',
            padding: '20px 60px',
            borderRadius: 50,
            display: 'inline-block',
            transform: `scale(${scale})`,
          }}>
            Agende agora
          </div>
          <div style={{ fontSize: 24, color: 'rgba(255,255,255,0.7)', marginTop: 30 }}>
            {clientName}
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};

export const AdVideo: React.FC<AdVideoProps> = ({
  scenes,
  clientName,
  primaryColor,
  accentColor,
}) => {
  const { fps } = useVideoConfig();

  // If no scenes provided, use demo scenes
  const activeScenes = scenes.length > 0 ? scenes : [
    { type: 'hook' as const, text: 'Seu sorriso pode ser 8 tons mais claro.', duration: 2 },
    { type: 'problem' as const, text: 'Manchas no dente afetam muito mais do que a estética.', duration: 3 },
    { type: 'product' as const, text: 'Clareamento a laser. Resultado desde a 1ª sessão.', duration: 4 },
    { type: 'benefit' as const, text: 'Sorria com confiança.', duration: 2 },
    { type: 'cta' as const, text: 'Agende sua avaliação gratuita.', duration: 2 },
  ];

  let currentFrame = 0;

  return (
    <AbsoluteFill style={{ backgroundColor: '#000000' }}>
      {activeScenes.map((scene, index) => {
        const startFrame = currentFrame;
        const durationFrames = scene.duration * fps;
        currentFrame += durationFrames;

        return (
          <Sequence
            key={index}
            from={startFrame}
            durationInFrames={durationFrames}
            name={`${scene.type}-${index}`}
          >
            <SceneComponent
              scene={scene}
              primaryColor={primaryColor}
              accentColor={accentColor}
              clientName={clientName}
            />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
