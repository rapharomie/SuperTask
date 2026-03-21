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

  // Determine score level class for visual feedback
  const getScoreLevelClass = (score: number): string => {
    if (score >= 80) return 'text-red-500';
    if (score >= 60) return 'text-orange-500';
    if (score >= 40) return 'text-yellow-500';
    if (score >= 20) return 'text-green-500';
    return 'text-slate-500';
  };

  // Get dimension percentage fill (0-100)
  const getDimensionPercentage = (value: number): number => {
    return Math.round((value / 10) * 100);
  };

  // Get color for dimension bar based on value
  const getDimensionBarColor = (value: number): string => {
    const percentage = getDimensionPercentage(value);
    if (percentage >= 80) return '#ef4444'; // red
    if (percentage >= 60) return '#f97316'; // orange
    if (percentage >= 40) return '#eab308'; // yellow
    if (percentage >= 20) return '#22c55e'; // green
    return '#cbd5e1'; // gray
  };

  if (compact) {
    // Compact version for cards
    return (
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">
          <div
            className={`text-xl font-bold ${getScoreLevelClass(priorityScore)}`}
            style={{ color: scoreColor }}
          >
            {priorityScore}
          </div>
        </div>
        <div className="flex-1">
          <div
            className="h-1 rounded-full"
            style={{
              background: `linear-gradient(to right, #cbd5e1 0%, ${scoreColor} ${priorityScore}%)`,
            }}
          />
        </div>
      </div>
    );
  }

  // Full version with dimension breakdown
  return (
    <div className="space-y-6 rounded-lg border p-6" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-card)' }}>
      {/* Total Score Section */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>
          Score de Prioridade
        </h2>
        <div className="flex items-baseline gap-4">
          <div
            className={`text-5xl font-bold ${getScoreLevelClass(priorityScore)}`}
            style={{ color: scoreColor }}
          >
            {priorityScore}
          </div>
          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            de 100
          </div>
        </div>
        <div className="h-3 overflow-hidden rounded-full" style={{ backgroundColor: '#1f2937' }}>
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${priorityScore}%`,
              background: `linear-gradient(to right, #cbd5e1, ${scoreColor})`,
            }}
          />
        </div>
      </div>

      {/* Dimensions Breakdown */}
      {activeDimensions.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>
            Dimensões ({activeDimensions.length})
          </h3>
          <div className="space-y-3">
            {activeDimensions.map((dimensionKey) => {
              const config = DIMENSION_MAP[dimensionKey];
              const value = dimensions[dimensionKey] || 0;
              const percentage = getDimensionPercentage(value);
              const barColor = getDimensionBarColor(value);

              return (
                <div key={dimensionKey} className="space-y-1">
                  {/* Label row */}
                  <div className="flex items-center justify-between gap-2">
                    <label className="flex-1 text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
                      {config.label}
                      {config.inverted && (
                        <span
                          className="ml-1 inline-block text-xs"
                          title="Dimensão invertida: valor maior = melhor"
                        >
                          ↓
                        </span>
                      )}
                    </label>
                    <span
                      className="text-xs font-semibold tabular-nums"
                      style={{ color: barColor, minWidth: '2rem', textAlign: 'right' }}
                    >
                      {value}/10
                    </span>
                  </div>

                  {/* Bar */}
                  <div className="h-2 overflow-hidden rounded-full" style={{ backgroundColor: '#374151' }}>
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: barColor,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty state */}
      {activeDimensions.length === 0 && (
        <div className="rounded-md p-4" style={{ backgroundColor: '#1f2937' }}>
          <p className="text-xs text-center" style={{ color: 'var(--text-secondary)' }}>
            Nenhuma dimensão ativa. Configure as dimensões nas preferências.
          </p>
        </div>
      )}
    </div>
  );
}
