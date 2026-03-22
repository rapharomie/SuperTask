import type { DimensionKey } from '../types';
import { DIMENSION_MAP } from '../utils/constants';
import { getScoreColor } from '../utils/scoring';

interface ScoreBreakdownProps {
  dimensions: Record<DimensionKey, number>;
  priorityScore: number;
  activeDimensions?: DimensionKey[];
  compact?: boolean;
}

export default function ScoreBreakdown({
  dimensions,
  priorityScore,
  activeDimensions = [],
  compact = false,
}: ScoreBreakdownProps) {
  const scoreColor = getScoreColor(priorityScore);

  const getDimensionBarColor = (value: number): string => {
    const pct = (value / 10) * 100;
    if (pct >= 80) return '#ef4444';
    if (pct >= 60) return '#f97316';
    if (pct >= 40) return '#eab308';
    if (pct >= 20) return '#22c55e';
    return '#94a3b8';
  };

  if (compact) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">
          <div className="text-xl font-bold" style={{ color: scoreColor }}>
            {priorityScore}
          </div>
        </div>
        <div className="flex-1">
          <div
            className="h-1.5 rounded-full overflow-hidden"
            style={{ backgroundColor: 'var(--bg-hover)' }}
          >
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${priorityScore}%`,
                background: `linear-gradient(to right, var(--bg-hover), ${scoreColor})`,
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="space-y-5 rounded-xl border p-5"
      style={{
        borderColor: 'var(--border-color)',
        backgroundColor: 'var(--bg-card)',
      }}
    >
      {/* Total Score */}
      <div className="space-y-2">
        <h2 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
          Score de Prioridade
        </h2>
        <div className="flex items-baseline gap-3">
          <div className="text-4xl font-bold" style={{ color: scoreColor }}>
            {priorityScore}
          </div>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>de 100</span>
        </div>
        <div
          className="h-2.5 overflow-hidden rounded-full"
          style={{ backgroundColor: 'var(--bg-hover)' }}
        >
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${priorityScore}%`,
              background: `linear-gradient(to right, var(--bg-hover), ${scoreColor})`,
            }}
          />
        </div>
      </div>

      {/* Dimensions */}
      {activeDimensions.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            Dimensões ({activeDimensions.length})
          </h3>
          <div className="space-y-2.5">
            {activeDimensions.map((dk) => {
              const config = DIMENSION_MAP[dk];
              const value = dimensions[dk] || 0;
              const pct = (value / 10) * 100;
              const barColor = getDimensionBarColor(value);

              return (
                <div key={dk} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
                      {config.label}
                      {config.inverted && (
                        <span className="ml-1 text-[10px]" style={{ color: 'var(--text-muted)' }}>↓</span>
                      )}
                    </label>
                    <span className="text-xs font-bold tabular-nums" style={{ color: barColor }}>
                      {value}/10
                    </span>
                  </div>
                  <div
                    className="h-1.5 overflow-hidden rounded-full"
                    style={{ backgroundColor: 'var(--bg-hover)' }}
                  >
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, backgroundColor: barColor }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeDimensions.length === 0 && (
        <div className="rounded-lg p-4" style={{ backgroundColor: 'var(--bg-hover)' }}>
          <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
            Nenhuma dimensão ativa. Configure nas preferências.
          </p>
        </div>
      )}
    </div>
  );
}
