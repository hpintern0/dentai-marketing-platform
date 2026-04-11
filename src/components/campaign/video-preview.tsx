'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Play, Square, Download, Film } from 'lucide-react';

interface Scene {
  type: string;
  text: string;
  duration: number;
  visual?: string;
  transition?: string;
  animation?: string;
}

interface VideoPreviewProps {
  scenes: Scene[];
  clientName?: string;
  procedure?: string;
  primaryColor?: string;
  accentColor?: string;
  style?: string;
}

export function VideoPreview({
  scenes,
  clientName = '',
  procedure = '',
  primaryColor = '#1A2744',
  accentColor = '#C9A84C',
}: VideoPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [currentSceneIndex, setCurrentSceneIndex] = useState(-1);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const cancelledRef = useRef(false);

  const totalDuration = scenes.reduce((sum, s) => sum + (s.duration || 3), 0);

  // Scene styles
  const getSceneStyle = (scene: Scene) => {
    const styles: Record<string, { bg: string; text: string; labelColor: string; label: string }> = {
      hook: { bg: primaryColor, text: '#FFFFFF', labelColor: accentColor, label: '' },
      problem: { bg: '#1A1A1A', text: '#FFFFFF', labelColor: accentColor, label: 'O PROBLEMA' },
      product: { bg: '#FFFFFF', text: '#1A1A1A', labelColor: primaryColor, label: 'A SOLUÇÃO' },
      benefit: { bg: accentColor, text: '#FFFFFF', labelColor: '#FFFFFF', label: '' },
      cta: { bg: primaryColor, text: '#FFFFFF', labelColor: accentColor, label: '' },
    };
    return styles[scene.type] || styles.hook;
  };

  // Play animation
  const playAnimation = useCallback(async () => {
    setIsPlaying(true);
    setCurrentSceneIndex(-1);
    setProgress(0);
    cancelledRef.current = false;

    let elapsed = 0;

    for (let i = 0; i < scenes.length; i++) {
      if (cancelledRef.current) break;
      setCurrentSceneIndex(i);
      const duration = (scenes[i].duration || 3) * 1000;

      const startElapsed = elapsed;
      const progressInterval = setInterval(() => {
        elapsed += 50;
        setProgress(Math.min((elapsed / (totalDuration * 1000)) * 100, 100));
      }, 50);

      await new Promise<void>(resolve => {
        animationTimeoutRef.current = setTimeout(resolve, duration);
      });

      clearInterval(progressInterval);
      elapsed = startElapsed + duration;
    }

    setProgress(100);
    setIsPlaying(false);
    setCurrentSceneIndex(-1);
  }, [scenes, totalDuration]);

  // Stop animation
  const stopAnimation = useCallback(() => {
    cancelledRef.current = true;
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
    }
    setIsPlaying(false);
    setIsRecording(false);
    setCurrentSceneIndex(-1);
    setProgress(0);

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  }, []);

  // Record video
  const recordVideo = useCallback(async () => {
    if (!containerRef.current) return;

    setRecordedUrl(null);
    chunksRef.current = [];
    cancelledRef.current = false;

    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1080;
      canvas.height = 1920;
      const ctx = canvas.getContext('2d')!;

      const stream = canvas.captureStream(30);
      const recorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
          ? 'video/webm;codecs=vp9'
          : 'video/webm',
        videoBitsPerSecond: 5000000,
      });

      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setRecordedUrl(url);
        setIsRecording(false);
      };

      recorder.start(100);
      setIsRecording(true);
      setIsPlaying(true);
      setProgress(0);

      let elapsed = 0;

      for (let i = 0; i < scenes.length; i++) {
        if (cancelledRef.current) break;
        setCurrentSceneIndex(i);
        const scene = scenes[i];
        const duration = (scene.duration || 3) * 1000;
        const style = getSceneStyle(scene);
        const fps = 30;
        const frames = Math.ceil((duration / 1000) * fps);

        for (let frame = 0; frame < frames; frame++) {
          if (cancelledRef.current) break;
          const t = frame / frames;

          // Clear canvas
          ctx.fillStyle = style.bg;
          ctx.fillRect(0, 0, 1080, 1920);

          // Fade in/out effect
          const fadeIn = Math.min(t * 4, 1);
          const fadeOut = Math.min((1 - t) * 4, 1);
          const alpha = Math.min(fadeIn, fadeOut);

          ctx.globalAlpha = alpha;

          // Label
          if (style.label) {
            ctx.fillStyle = style.labelColor;
            ctx.font = '600 28px Inter, system-ui, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(style.label.toUpperCase(), 540, 750);
          }

          // Main text
          ctx.fillStyle = style.text;
          ctx.font = '800 64px Inter, system-ui, sans-serif';
          ctx.textAlign = 'center';

          // Word wrap
          const words = scene.text.split(' ');
          const lines: string[] = [];
          let currentLine = '';
          const maxWidth = 900;

          for (const word of words) {
            const testLine = currentLine + (currentLine ? ' ' : '') + word;
            const metrics = ctx.measureText(testLine);
            if (metrics.width > maxWidth && currentLine) {
              lines.push(currentLine);
              currentLine = word;
            } else {
              currentLine = testLine;
            }
          }
          if (currentLine) lines.push(currentLine);

          const lineHeight = 80;
          const startY = 960 - (lines.length * lineHeight) / 2 + (style.label ? 40 : 0);

          lines.forEach((line, idx) => {
            const slideOffset = (1 - Math.min(t * 3, 1)) * 40;
            ctx.fillText(line, 540, startY + idx * lineHeight + slideOffset);
          });

          // CTA button
          if (scene.type === 'cta') {
            ctx.globalAlpha = Math.min(t * 2, 1);
            const btnY = startY + lines.length * lineHeight + 60;
            ctx.fillStyle = accentColor;
            const btnWidth = 400;
            const btnHeight = 70;
            const btnX = (1080 - btnWidth) / 2;

            const r = 35;
            ctx.beginPath();
            ctx.moveTo(btnX + r, btnY);
            ctx.lineTo(btnX + btnWidth - r, btnY);
            ctx.quadraticCurveTo(btnX + btnWidth, btnY, btnX + btnWidth, btnY + r);
            ctx.lineTo(btnX + btnWidth, btnY + btnHeight - r);
            ctx.quadraticCurveTo(btnX + btnWidth, btnY + btnHeight, btnX + btnWidth - r, btnY + btnHeight);
            ctx.lineTo(btnX + r, btnY + btnHeight);
            ctx.quadraticCurveTo(btnX, btnY + btnHeight, btnX, btnY + btnHeight - r);
            ctx.lineTo(btnX, btnY + r);
            ctx.quadraticCurveTo(btnX, btnY, btnX + r, btnY);
            ctx.fill();

            ctx.fillStyle = primaryColor;
            ctx.font = '700 28px Inter, system-ui, sans-serif';
            ctx.fillText('Agende agora', 540, btnY + 45);

            ctx.fillStyle = 'rgba(255,255,255,0.5)';
            ctx.font = '400 22px Inter, system-ui, sans-serif';
            ctx.fillText(clientName, 540, btnY + btnHeight + 50);
          }

          ctx.globalAlpha = 1;

          await new Promise(r => setTimeout(r, 1000 / fps));
        }

        elapsed += duration;
        setProgress((elapsed / (totalDuration * 1000)) * 100);
      }

      // Hold last frame for 0.5s
      await new Promise(r => setTimeout(r, 500));

      if (recorder.state !== 'inactive') {
        recorder.stop();
      }
      setIsPlaying(false);
      setCurrentSceneIndex(-1);
      setProgress(100);
    } catch (err) {
      console.error('Recording failed:', err);
      setIsRecording(false);
      setIsPlaying(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scenes, clientName, primaryColor, accentColor, totalDuration]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) clearTimeout(animationTimeoutRef.current);
      if (recordedUrl) URL.revokeObjectURL(recordedUrl);
    };
  }, [recordedUrl]);

  if (!scenes || scenes.length === 0) {
    return (
      <div className="py-12 text-center">
        <Film className="mx-auto h-8 w-8 text-gray-300 mb-3" />
        <p className="text-sm text-gray-500">Nenhuma cena de v&iacute;deo gerada.</p>
      </div>
    );
  }

  const currentScene = currentSceneIndex >= 0 ? scenes[currentSceneIndex] : null;
  const currentStyle = currentScene ? getSceneStyle(currentScene) : null;

  return (
    <div className="space-y-4">
      {/* Video Preview Area */}
      <div
        ref={containerRef}
        className="relative mx-auto overflow-hidden rounded-2xl shadow-xl"
        style={{ width: '100%', maxWidth: '360px', aspectRatio: '9/16' }}
      >
        {/* Scene Display */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center p-8 transition-all duration-500"
          style={{
            backgroundColor: currentStyle?.bg || '#1A1A1A',
            color: currentStyle?.text || '#FFFFFF',
          }}
        >
          {currentScene ? (
            <>
              {currentStyle?.label && (
                <p
                  className="text-xs font-semibold tracking-[0.2em] uppercase mb-4 animate-fade-in"
                  style={{ color: currentStyle.labelColor }}
                >
                  {currentStyle.label}
                </p>
              )}
              <p className="text-xl font-extrabold text-center leading-tight animate-slide-up">
                {currentScene.text}
              </p>
              {currentScene.type === 'cta' && (
                <div className="mt-6 space-y-3 text-center animate-fade-in">
                  <div
                    className="rounded-full px-6 py-2.5 text-sm font-bold"
                    style={{ backgroundColor: accentColor, color: primaryColor }}
                  >
                    Agende agora
                  </div>
                  <p className="text-xs opacity-50">{clientName}</p>
                </div>
              )}
            </>
          ) : (
            <div className="text-center space-y-3">
              <Film className="mx-auto h-12 w-12 opacity-30" />
              <p className="text-sm font-medium opacity-60">
                {scenes.length} cenas &middot; {totalDuration}s
              </p>
              <p className="text-xs opacity-40">{procedure}</p>
            </div>
          )}
        </div>

        {/* Progress bar */}
        {(isPlaying || progress > 0) && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
            <div
              className="h-full transition-all duration-100"
              style={{ width: `${progress}%`, backgroundColor: accentColor }}
            />
          </div>
        )}

        {/* Scene indicator dots */}
        {isPlaying && (
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
            {scenes.map((_, i) => (
              <div
                key={i}
                className="h-1.5 w-1.5 rounded-full transition-all"
                style={{
                  backgroundColor: i === currentSceneIndex ? accentColor : 'rgba(255,255,255,0.3)',
                  transform: i === currentSceneIndex ? 'scale(1.3)' : 'scale(1)',
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3">
        {!isPlaying && !isRecording ? (
          <>
            <button
              onClick={playAnimation}
              className="inline-flex items-center gap-2 rounded-lg bg-hp-purple px-4 py-2 text-sm font-medium text-white hover:bg-hp-purple-700 transition-colors"
            >
              <Play className="h-4 w-4" />
              Preview
            </button>
            <button
              onClick={recordVideo}
              className="inline-flex items-center gap-2 rounded-lg bg-hp-accent px-4 py-2 text-sm font-medium text-white hover:bg-hp-accent-600 transition-colors"
            >
              <Film className="h-4 w-4" />
              Gravar MP4
            </button>
          </>
        ) : (
          <button
            onClick={stopAnimation}
            className="inline-flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 transition-colors"
          >
            <Square className="h-4 w-4" />
            Parar
          </button>
        )}
      </div>

      {/* Recording status */}
      {isRecording && (
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
            <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            Gravando... {Math.round(progress)}%
          </div>
        </div>
      )}

      {/* Download recorded video */}
      {recordedUrl && (
        <div className="text-center space-y-3">
          <video
            src={recordedUrl}
            controls
            className="mx-auto rounded-xl shadow-lg"
            style={{ maxWidth: '360px' }}
          />
          <a
            href={recordedUrl}
            download={`${procedure || 'video'}_reels.webm`}
            className="inline-flex items-center gap-2 rounded-lg bg-hp-purple px-4 py-2 text-sm font-medium text-white hover:bg-hp-purple-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            Download V&iacute;deo
          </a>
        </div>
      )}

      {/* Scene list */}
      <div className="mt-4 space-y-2">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Roteiro ({scenes.length} cenas)</p>
        {scenes.map((scene, i) => (
          <div
            key={i}
            className={`flex items-start gap-3 rounded-lg p-3 border transition-colors ${
              i === currentSceneIndex
                ? 'border-hp-purple bg-hp-purple-50'
                : 'border-gray-100 bg-gray-50'
            }`}
          >
            <span className="flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-hp-purple text-white text-xs font-bold">
              {i + 1}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-medium text-gray-400">{scene.duration}s</span>
                <span className="text-xs font-semibold text-gray-700 capitalize">{scene.type}</span>
              </div>
              <p className="text-sm text-gray-600 mt-0.5">{scene.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
