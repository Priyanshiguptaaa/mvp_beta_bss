import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ReplayTimelineEvent {
  time: string;
  label: string;
  status: string;
}

interface HealthStats {
  retrievalSimilarity: number;
  semanticDrift: number;
  threshold: number;
  outliers: number;
}

interface ReplayViewerProps {
  replay: ReplayTimelineEvent[];
  health: HealthStats;
}

export function ReplayViewer({ replay, health }: ReplayViewerProps) {
  const [revealed, setRevealed] = useState(1);
  const [playing, setPlaying] = useState(false);

  const handlePlay = () => {
    if (playing) return;
    setRevealed(1); // Reset to only the first step
    setPlaying(true);
    let i = 1;
    function step() {
      if (i < replay.length) {
        setTimeout(() => {
          setRevealed(i + 1);
          i++;
          step();
        }, 700);
      } else {
        setPlaying(false);
      }
    }
    step();
  };

  // Progress bar width
  const progress = Math.max(1, Math.round((revealed / replay.length) * 100));

  return (
    <Card className="bg-white border border-gray-200">
      <CardHeader>
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          Incident Replay
          <span className="ml-auto">
            <button
              className={`bg-gray-100 border rounded-full px-2 py-1 text-xs transition ${playing ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200'}`}
              onClick={handlePlay}
              disabled={playing}
              aria-label="Play incident replay"
            >
              ▶
            </button>
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Timeline */}
        <div className="mb-4">
          <div className="h-2 w-full bg-gray-100 rounded-full relative mb-2 overflow-hidden">
            <div
              className="absolute left-0 top-0 h-2 bg-purple-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="flex flex-col gap-2">
            {replay.slice(0, revealed).map((event, idx) => {
              let bg = '';
              if (event.status === 'success') bg = 'bg-green-50';
              else if (event.status === 'error' || event.status === 'fail') bg = 'bg-red-50';
              else if (event.status === 'warning') bg = 'bg-yellow-50';
              else bg = 'bg-gray-50';
              return (
                <div
                  className={`flex items-center gap-2 px-2 py-2 rounded ${bg}`}
                  key={idx}
                >
                  <span className={`w-2 h-2 rounded-full inline-block mr-1 ${
                    event.status === 'success' ? 'bg-green-500' :
                    event.status === 'warning' ? 'bg-yellow-400' :
                    event.status === 'error' ? 'bg-red-400' :
                    event.status === 'fail' ? 'bg-red-500' : 'bg-gray-300'
                  }`}></span>
                  <span className="text-xs font-medium text-gray-800">{event.label}</span>
                  <span className="ml-auto text-xs text-gray-400 font-mono">{event.time}</span>
                </div>
              );
            })}
          </div>
        </div>
        {/* Health stats */}
        <div className="mt-4">
          <div className="font-semibold text-xs text-gray-500 mb-2">Embedding Health:</div>
          <div className="flex flex-wrap gap-3 text-xs">
            <span>Retrieval Similarity: <span className="text-red-500 font-bold">{health.retrievalSimilarity}%</span></span>
            <span>Threshold: <span className="font-bold">{health.threshold}%</span></span>
            <span>Semantic Drift: <span className="text-orange-500 font-bold">{health.semanticDrift}%</span></span>
            <span>Outliers: <span className="font-bold">{health.outliers} terms</span></span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 