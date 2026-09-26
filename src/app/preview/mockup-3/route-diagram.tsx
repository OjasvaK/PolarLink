"use client";

import { useEffect, useRef, useState } from "react";
import { animate, type JSAnimation } from "animejs";
import { Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { stations } from "@/lib/mock-landing-data";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";

const pathD = `M ${stations[0].position.x} ${stations[0].position.y} L ${stations[2].position.x} ${stations[2].position.y} L ${stations[1].position.x} ${stations[1].position.y}`;

export function RouteDiagram() {
  const pathRef = useRef<SVGPathElement | null>(null);
  const animationRef = useRef<JSAnimation | null>(null);
  const reducedMotion = usePrefersReducedMotion();
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    if (reducedMotion || !pathRef.current) return;

    animationRef.current = animate(pathRef.current, {
      strokeDashoffset: [140, 0],
      duration: 2200,
      ease: "inOutQuad",
      loop: true,
      alternate: true,
    });

    return () => {
      animationRef.current?.revert();
    };
  }, [reducedMotion]);

  const togglePlay = () => {
    const instance = animationRef.current;
    if (!instance) return;
    if (playing) {
      instance.pause();
    } else {
      instance.play();
    }
    setPlaying((value) => !value);
  };

  return (
    <div className="relative">
      <svg
        viewBox="0 0 100 100"
        role="img"
        aria-label="Animated route connecting India's Antarctic, Arctic, and Himalayan research stations"
        className="h-64 w-full text-primary"
      >
        <path d={pathD} fill="none" stroke="currentColor" strokeOpacity={0.2} strokeWidth={0.6} />
        <path
          ref={pathRef}
          d={pathD}
          fill="none"
          stroke="currentColor"
          strokeWidth={0.6}
          strokeDasharray={140}
          strokeDashoffset={reducedMotion ? 0 : 140}
        />
        {stations.map((station) => (
          <g key={station.id}>
            <circle cx={station.position.x} cy={station.position.y} r={1.8} fill="currentColor" />
            <text
              x={station.position.x}
              y={station.position.y - 4}
              fontSize={3.2}
              textAnchor="middle"
              className="fill-foreground"
            >
              {station.name}
            </text>
          </g>
        ))}
      </svg>
      {!reducedMotion && (
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="absolute bottom-2 right-2"
          aria-label={playing ? "Pause route animation" : "Play route animation"}
          onClick={togglePlay}
        >
          {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
        </Button>
      )}
    </div>
  );
}
