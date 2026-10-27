'use client';

import { useEffect, useState } from 'react';

const STAGES = ['Searching GitHub…', 'Filtering open issues…', 'Ranking for you…'];

export function PipelineStages() {
  const [stage, setStage] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setStage((current) => Math.min(2, current + 1)), 1500);
    return () => clearInterval(timer);
  }, []);
  return (
    <div aria-live="polite" className="flex items-center gap-2 font-mono text-[11px] text-fg-muted">
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
      {STAGES[stage]}
    </div>
  );
}
