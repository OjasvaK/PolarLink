"use client";

// Scroll-linked reveal progress, shared by every <Reveal>/<RevealImage> on the
// page. Each registered element gets two CSS variables, eased toward targets
// derived from its position so motion is smooth and fully reversible:
//   --e: 0 while below the viewport, 1 once it has risen into the lower half
//   --x: 0 while on screen, rising to 1 as it scrolls out through the top
// The element measured is never the one transformed (see .reveal-inner in
// globals.css), so transforms can't feed back into the measurement.

type Progress = { e: number; x: number };

const items = new Map<HTMLElement, Progress>();
let frame = 0;
let lastTime = 0;

const clamp = (v: number) => Math.min(1, Math.max(0, v));

function target(el: HTMLElement): Progress {
  const rect = el.getBoundingClientRect();
  const vh = window.innerHeight;
  const enter = clamp((vh - rect.top) / (vh * 0.55));
  const exit = clamp((vh * 0.45 - rect.bottom) / (vh * 0.45));
  return { e: 1 - Math.pow(1 - enter, 3), x: exit * exit };
}

function apply(el: HTMLElement, p: Progress) {
  el.style.setProperty("--e", p.e.toFixed(4));
  el.style.setProperty("--x", p.x.toFixed(4));
}

function tick(time: number) {
  frame = 0;
  const dt = lastTime ? Math.min(64, time - lastTime) : 16.7;
  lastTime = time;
  const alpha = 1 - Math.pow(1 - 0.14, dt / 16.7);
  let moving = false;

  for (const [el, p] of items) {
    const t = target(el);
    const de = t.e - p.e;
    const dx = t.x - p.x;
    if (Math.abs(de) < 0.0005 && Math.abs(dx) < 0.0005) {
      p.e = t.e;
      p.x = t.x;
    } else {
      p.e += de * alpha;
      p.x += dx * alpha;
      moving = true;
    }
    apply(el, p);
  }

  if (moving) frame = requestAnimationFrame(tick);
  else lastTime = 0;
}

function schedule() {
  if (!frame) frame = requestAnimationFrame(tick);
}

export function registerReveal(el: HTMLElement) {
  if (items.size === 0) {
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
  }
  const initial = target(el);
  items.set(el, initial);
  apply(el, initial);

  return () => {
    items.delete(el);
    if (items.size === 0) {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      lastTime = 0;
    }
  };
}
