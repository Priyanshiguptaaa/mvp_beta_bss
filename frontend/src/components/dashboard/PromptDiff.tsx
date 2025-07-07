"use client"

import React from 'react';
import { diff_match_patch } from 'diff-match-patch';

interface PromptDiffProps {
  oldVersion: string;
  newVersion: string;
  oldSettings?: Record<string, string>;
  newSettings?: Record<string, string>;
}

type DiffType = -1 | 0 | 1;
type Diff = [DiffType, string];

export const PromptDiff: React.FC<PromptDiffProps> = ({ oldVersion, newVersion, oldSettings, newSettings }) => {
  const dmp = new diff_match_patch();
  const diffs = dmp.diff_main(oldVersion, newVersion) as Diff[];
  dmp.diff_cleanupSemantic(diffs);

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 my-6 text-base font-mono whitespace-pre-wrap max-w-5xl mx-auto">
      <div className="mb-4">
        <div className="font-bold text-purple-800 mb-2">Prompt Diff</div>
        {diffs.map(([type, text], index: number) => {
          if (type === 0) {
            // No change
            return <span key={index}>{text}</span>;
          } else if (type === -1) {
            // Deletion
            return (
              <span key={index} className="bg-red-100 text-red-800 line-through">
                {text}
              </span>
            );
          } else {
            // Addition
            return (
              <span key={index} className="bg-green-100 text-green-800">
                {text}
              </span>
            );
          }
        })}
      </div>
      {(oldSettings || newSettings) && (
        <div className="mt-4">
          <div className="font-bold text-purple-800 mb-2">Settings Diff</div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="font-semibold mb-1">Before</div>
              <div className="bg-gray-50 rounded p-2 text-sm">
                {oldSettings && Object.entries(oldSettings).map(([k, v]) => (
                  <div key={k}><span className="font-mono text-gray-700">{k}:</span> {v}</div>
                ))}
              </div>
            </div>
            <div>
              <div className="font-semibold mb-1">After</div>
              <div className="bg-gray-50 rounded p-2 text-sm">
                {newSettings && Object.entries(newSettings).map(([k, v]) => (
                  <div key={k}><span className="font-mono text-gray-700">{k}:</span> {v}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 