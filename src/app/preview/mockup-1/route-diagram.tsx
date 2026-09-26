"use client";

import { useState } from "react";
import { Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { stations } from "@/lib/mock-landing-data";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";

const pathD = `M ${stations[0].position.x} ${stations[0].position.y} L ${stations[2].position.x} ${stations[2].position.y} L ${stations[1].position.x} ${stations[1].position.y}`;

export function RouteDiagram() {
  const reducedMotion = usePrefersReducedMotion();
  const [playing, setPlaying] = useState(true);

  return (
    <div className="relative">
      <svg
        viewBox="0 0 100 100"
        role="img"
        aria-label="Schematic route connecting India's Antarctic, Arctic, and Himalayan research stations"
        className="h-64 w-full text-primary"
      >
        <path
          d={pathD}
          fill="none"
          stroke="currentColor"
          strokeOpacity={0.25}
          strokeWidth={0.6}
        />
        <path
          d={pathD}
          fill="none"
          stroke="currentColor"
          strokeWidth={0.6}
          strokeDasharray={140}
          className={
            reducedMotion
              ? ""
              : "route-diagram-draw"
          }
          style={{
            animationPlayState: playing ? "running" : "paused",
            strokeDashoffset: reducedMotion ? 0 : undefined,
          }}
        />
        {stations.map((station) => (
          <g key={station.id}>
            <circle
              cx={station.position.x}
              cy={station.position.y}
              r={1.8}
              fill="currentColor"
            />
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
          onClick={() => setPlaying((value) => !value)}
        >
          {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
        </Button>
      )}
      <style>{`
        @keyframes route-diagram-draw {
          0% { stroke-dashoffset: 140; }
          60% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: 0; }
        }
        .route-diagram-draw {
          animation: route-diagram-draw 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
