"use client";

import { useEffect, useRef } from "react";
import { POLAR_PALETTE } from "@/lib/polar-palette";

type PolarGlacierSceneProps = {
  paused: boolean;
  reducedMotion: boolean;
  className?: string;
};

type LightMote = {
  x: number;
  y: number;
  radius: number;
  speed: number;
  swayAmp: number;
  swayFreq: number;
  swayPhase: number;
  opacity: number;
};

function createMotes(width: number, height: number, count: number): LightMote[] {
  const motes: LightMote[] = [];
  for (let i = 0; i < count; i++) {
    const depth = Math.random();
    motes.push({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: 1.1 + depth * 3.2,
      speed: 12 + depth * 34,
      swayAmp: 10 + depth * 26,
      swayFreq: 0.25 + Math.random() * 0.5,
      swayPhase: Math.random() * Math.PI * 2,
      opacity: 0.3 + depth * 0.55,
    });
  }
  return motes;
}

/**
 * A cooler, deeper sibling of the aurora scene: rising light motes drifting
 * up through a teal-blue gradient, plus a slow diagonal light sweep — for
 * full-bleed dark sections (the Stations block, the program galleries, the
 * sign-in panel) that want the same family of motion without repeating the
 * aurora ribbons.
 */
export function PolarGlacierScene({ paused, reducedMotion, className }: PolarGlacierSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pausedRef = useRef(paused);

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
    let motes: LightMote[] = [];

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      motes = createMotes(width, height, Math.round(Math.min(160, Math.max(50, width / 9))));
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    resize();

    const drawFrame = (elapsed: number, deltaSeconds: number) => {
      const sky = ctx.createLinearGradient(0, 0, 0, height);
      sky.addColorStop(0, POLAR_PALETTE.glacierTop);
      sky.addColorStop(1, POLAR_PALETTE.glacierBottom);
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, width, height);

      // A slow diagonal light sweep, like sun refracting through ice.
      const sweepPhase = reducedMotion ? 0.5 : (elapsed * 0.00004) % 1;
      const sweepX = -width * 0.4 + sweepPhase * width * 1.8;
      ctx.globalCompositeOperation = "screen";
      const sweep = ctx.createLinearGradient(sweepX - 160, 0, sweepX + 160, height);
      sweep.addColorStop(0, "hsla(190, 75%, 68%, 0)");
      sweep.addColorStop(0.5, "hsla(190, 75%, 72%, 0.14)");
      sweep.addColorStop(1, "hsla(190, 75%, 68%, 0)");
      ctx.fillStyle = sweep;
      ctx.fillRect(0, 0, width, height);
      ctx.globalCompositeOperation = "source-over";

      ctx.fillStyle = POLAR_PALETTE.frost;
      for (const mote of motes) {
        if (deltaSeconds > 0) {
          mote.y -= mote.speed * deltaSeconds;
          mote.x += Math.sin(elapsed * 0.001 * mote.swayFreq + mote.swayPhase) * mote.swayAmp * deltaSeconds * 0.4;
          if (mote.y < -mote.radius) {
            mote.y = height + mote.radius;
            mote.x = Math.random() * width;
          }
        }
        ctx.globalAlpha = mote.opacity;
        ctx.beginPath();
        ctx.arc(mote.x, mote.y, mote.radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    let rafId = 0;
    let lastTime = performance.now();
    let elapsed = 0;

    const loop = (now: number) => {
      const running = !pausedRef.current && !reducedMotion;
      const deltaSeconds = running ? Math.min((now - lastTime) / 1000, 0.1) : 0;
      if (running) elapsed += Math.min(now - lastTime, 100);
      lastTime = now;

      drawFrame(elapsed, deltaSeconds);
      if (!reducedMotion) rafId = requestAnimationFrame(loop);
    };

    if (reducedMotion) {
      drawFrame(0, 0);
    } else {
      rafId = requestAnimationFrame(loop);
    }

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
    };
  }, [reducedMotion]);

  return <canvas ref={canvasRef} aria-hidden className={className} />;
}
