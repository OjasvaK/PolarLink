"use client";

import { useEffect, useRef } from "react";

type PolarAuroraSceneProps = {
  paused: boolean;
  reducedMotion: boolean;
  className?: string;
};

type Snowflake = {
  x: number;
  y: number;
  radius: number;
  speed: number;
  swayAmp: number;
  swayFreq: number;
  swayPhase: number;
  opacity: number;
};

type AuroraBand = {
  baseY: number;
  amplitude: number;
  wavelength: number;
  speed: number;
  phase: number;
  hue: number;
  width: number;
};

const SKY_TOP = "#050f1f";
const SKY_BOTTOM = "#00030a";

function createSnowflakes(width: number, height: number, count: number): Snowflake[] {
  const flakes: Snowflake[] = [];
  for (let i = 0; i < count; i++) {
    const layer = Math.random();
    flakes.push({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: 0.9 + layer * 2.6,
      speed: 16 + layer * 46,
      swayAmp: 8 + layer * 26,
      swayFreq: 0.3 + Math.random() * 0.6,
      swayPhase: Math.random() * Math.PI * 2,
      opacity: 0.4 + layer * 0.55,
    });
  }
  return flakes;
}

function createAuroraBands(height: number): AuroraBand[] {
  return [
    { baseY: height * 0.22, amplitude: 70, wavelength: 560, speed: 0.00026, phase: 0, hue: 158, width: 190 },
    { baseY: height * 0.38, amplitude: 92, wavelength: 460, speed: -0.00034, phase: 2.1, hue: 190, width: 160 },
    { baseY: height * 0.52, amplitude: 58, wavelength: 680, speed: 0.00021, phase: 4.4, hue: 268, width: 130 },
    { baseY: height * 0.3, amplitude: 50, wavelength: 340, speed: 0.0004, phase: 1.3, hue: 128, width: 90 },
  ];
}

/**
 * A dark polar-night sky with drifting aurora ribbons and falling snow,
 * drawn on a single canvas. No WebGL, no external assets — a lightweight
 * stand-in for a photo hero that still reads as "alive" behind the copy.
 */
export function PolarAuroraScene({ paused, reducedMotion, className }: PolarAuroraSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pausedRef = useRef(paused);
  const pointerRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let flakes: Snowflake[] = [];
    let bands: AuroraBand[] = [];
    const stars = { positions: [] as { x: number; y: number; r: number; twinkle: number }[] };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const flakeCount = Math.round(Math.min(220, Math.max(80, width / 6)));
      flakes = createSnowflakes(width, height, flakeCount);
      bands = createAuroraBands(height);
      stars.positions = Array.from({ length: 150 }, () => ({
        x: Math.random() * width,
        y: Math.random() * height * 0.65,
        r: Math.random() * 1.3 + 0.3,
        twinkle: Math.random() * Math.PI * 2,
      }));
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    resize();

    const onPointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointerRef.current = {
        x: ((event.clientX - rect.left) / rect.width - 0.5) * 2,
        y: ((event.clientY - rect.top) / rect.height - 0.5) * 2,
      };
    };
    if (!reducedMotion) {
      window.addEventListener("pointermove", onPointerMove, { passive: true });
    }

    const drawSky = () => {
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, SKY_TOP);
      gradient.addColorStop(1, SKY_BOTTOM);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
    };

    const drawStars = (elapsed: number) => {
      for (const star of stars.positions) {
        const flicker = reducedMotion ? 0.7 : 0.5 + 0.5 * Math.sin(elapsed * 0.0012 + star.twinkle);
        ctx.globalAlpha = 0.65 * flicker;
        ctx.fillStyle = "#eef6ff";
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    const drawAurora = (elapsed: number, parallaxX: number) => {
      ctx.globalCompositeOperation = "screen";
      for (const band of bands) {
        const phase = band.phase + elapsed * band.speed;
        const points: [number, number][] = [];
        for (let x = 0; x <= width; x += 10) {
          const y =
            band.baseY +
            Math.sin(x / band.wavelength + phase) * band.amplitude +
            parallaxX * 22;
          points.push([x, y]);
        }

        // Two passes: a wide, dim glow, then a tighter, brighter core — a
        // cheap stand-in for bloom that reads as much more vivid.
        for (const [widthMul, alpha] of [[1, 0.16], [0.42, 0.34]] as const) {
          ctx.beginPath();
          points.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
          const ribbon = ctx.createLinearGradient(0, band.baseY - band.width, 0, band.baseY + band.width);
          ribbon.addColorStop(0, `hsla(${band.hue}, 92%, 68%, 0)`);
          ribbon.addColorStop(0.5, `hsla(${band.hue}, 88%, 62%, ${alpha})`);
          ribbon.addColorStop(1, `hsla(${band.hue}, 92%, 68%, 0)`);
          ctx.strokeStyle = ribbon;
          ctx.lineWidth = band.width * widthMul;
          ctx.lineCap = "round";
          ctx.stroke();
        }
      }
      ctx.globalCompositeOperation = "source-over";
    };

    const drawSnow = (elapsed: number, deltaSeconds: number) => {
      ctx.fillStyle = "#ffffff";
      for (const flake of flakes) {
        if (deltaSeconds > 0) {
          flake.y += flake.speed * deltaSeconds;
          flake.x += Math.sin(elapsed * 0.001 * flake.swayFreq + flake.swayPhase) * flake.swayAmp * deltaSeconds * 0.2;
          if (flake.y > height + flake.radius) {
            flake.y = -flake.radius;
            flake.x = Math.random() * width;
          }
          if (flake.x > width + flake.radius) flake.x = -flake.radius;
          if (flake.x < -flake.radius) flake.x = width + flake.radius;
        }
        ctx.globalAlpha = flake.opacity;
        ctx.beginPath();
        ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    let rafId = 0;
    let lastTime = performance.now();
    let elapsed = 0;

    const renderFrame = (now: number) => {
      const running = !pausedRef.current && !reducedMotion;
      const deltaSeconds = running ? Math.min((now - lastTime) / 1000, 0.1) : 0;
      if (running) elapsed += (now - lastTime > 0 ? Math.min(now - lastTime, 100) : 0);
      lastTime = now;

      drawSky();
      drawStars(elapsed);
      drawAurora(elapsed, pointerRef.current.x);
      drawSnow(elapsed, deltaSeconds);

      if (!reducedMotion) {
        rafId = requestAnimationFrame(renderFrame);
      }
    };

    if (reducedMotion) {
      renderFrame(performance.now());
    } else {
      rafId = requestAnimationFrame(renderFrame);
    }

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
    };
  }, [reducedMotion]);

  return <canvas ref={canvasRef} aria-hidden className={className} />;
}
