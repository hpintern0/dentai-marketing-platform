import React from 'react';
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from 'remotion';

interface Slide {
  title: string;
  body: string;
  slideNumber: number;
  totalSlides: number;
  iscover?: boolean;
  isCta?: boolean;
}

interface CarouselVideoProps {
  slides: Slide[];
  clientName: string;
  primaryColor: string;
  accentColor?: string;
}

const SlideComponent: React.FC<{
  slide: Slide;
  primaryColor: string;
  accentColor: string;
  clientName: string;
}> = ({ slide, primaryColor, accentColor, clientName }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [durationInFrames - 12, durationInFrames], [1, 0], { extrapolateLeft: 'clamp' });
  const slideIn = interpolate(frame, [0, 15], [40, 0], { extrapolateRight: 'clamp' });
  const scale = spring({ frame, fps, config: { damping: 15 } });

  if (slide.iscover) {
    return (
      <AbsoluteFill style={{ backgroundColor: primaryColor, opacity: Math.min(fadeIn, fadeOut), padding: 80, justifyContent: 'center' }}>
        <div style={{ transform: `scale(${scale})`, textAlign: 'center' }}>
          <div style={{ fontSize: 64, fontWeight: 'bold', color: '#FFFFFF', lineHeight: 1.2, marginBottom: 30 }}>
            {slide.title}
          </div>
          <div style={{ width: 80, height: 4, backgroundColor: accentColor, margin: '0 auto 30px', borderRadius: 2 }} />
          <div style={{ fontSize: 28, color: 'rgba(255,255,255,0.8)' }}>{clientName}</div>
        </div>
      </AbsoluteFill>
    );
  }

  if (slide.isCta) {
    return (
      <AbsoluteFill style={{ backgroundColor: primaryColor, opacity: Math.min(fadeIn, fadeOut), padding: 80, justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ transform: `translateY(${slideIn}px)`, textAlign: 'center' }}>
          <div style={{ fontSize: 48, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 40, lineHeight: 1.3 }}>{slide.title}</div>
          <div style={{ backgroundColor: accentColor, color: '#FFF', fontSize: 28, fontWeight: 'bold', padding: '16px 48px', borderRadius: 40, display: 'inline-block', transform: `scale(${scale})` }}>
            {slide.body}
          </div>
        </div>
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill style={{ backgroundColor: '#FFFFFF', opacity: Math.min(fadeIn, fadeOut), padding: 80 }}>
      <div style={{ transform: `translateY(${slideIn}px)` }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 30 }}>
          <div style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: primaryColor, color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 'bold' }}>
            {slide.slideNumber}
          </div>
          <div style={{ fontSize: 16, color: '#999', marginLeft: 16 }}>{slide.slideNumber}/{slide.totalSlides}</div>
        </div>
        <div style={{ fontSize: 44, fontWeight: 'bold', color: '#1A1A1A', lineHeight: 1.3, marginBottom: 30 }}>{slide.title}</div>
        <div style={{ width: 60, height: 3, backgroundColor: accentColor, marginBottom: 30, borderRadius: 2 }} />
        <div style={{ fontSize: 28, color: '#555555', lineHeight: 1.6 }}>{slide.body}</div>
      </div>
    </AbsoluteFill>
  );
};

export const CarouselVideo: React.FC<CarouselVideoProps> = ({
  slides,
  clientName,
  primaryColor,
  accentColor = '#08c4b0',
}) => {
  const { fps } = useVideoConfig();
  const SECONDS_PER_SLIDE = 4;
  const framesPerSlide = SECONDS_PER_SLIDE * fps;

  const activeSlides = slides.length > 0 ? slides : [
    { title: '5 sinais de que você precisa de implante', body: '', slideNumber: 1, totalSlides: 5, iscover: true },
    { title: 'Dificuldade para mastigar', body: 'Se você evita certos alimentos por causa da falta de dentes, o implante devolve a função mastigatória completa.', slideNumber: 1, totalSlides: 5 },
    { title: 'Dentes vizinhos se movendo', body: 'A ausência de um dente faz os vizinhos se deslocarem, alterando a mordida e causando novos problemas.', slideNumber: 2, totalSlides: 5 },
    { title: 'Perda óssea na mandíbula', body: 'Sem a raiz do dente, o osso perde estímulo e começa a reabsorver. O implante preserva o osso.', slideNumber: 3, totalSlides: 5 },
    { title: 'Agende sua avaliação', body: 'Link na bio', slideNumber: 5, totalSlides: 5, isCta: true },
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      {activeSlides.map((slide, index) => (
        <Sequence
          key={index}
          from={index * framesPerSlide}
          durationInFrames={framesPerSlide}
          name={`slide-${index}`}
        >
          <SlideComponent
            slide={slide}
            primaryColor={primaryColor}
            accentColor={accentColor}
            clientName={clientName}
          />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
