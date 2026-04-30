import { useState } from 'react';
import styles from './DegradedRatioCard.module.css';

/**
 * C2A-04: Cortex degraded-iteration ratio card.
 *
 * Displays the ratio of degraded assessment iterations over a rolling window.
 * Color-coded: green (0-5%), yellow (5-25%), red (>25%).
 *
 * @param {{ data: object|null, error: string|null }} props
 *   data: response from /api/control/platform-health/cortex/degraded-ratio
 *   error: fetch error message or null
 */
export default function DegradedRatioCard({ data, error }) {
  const [window, setWindow] = useState('1h');

  function toggleWindow() {
    setWindow((w) => (w === '1h' ? '24h' : '1h'));
  }

  // Unreachable or unavailable
  if (error || !data || !data.available) {
    return (
      <div className={styles.card}>
        <div className={styles.header}>
          <span className={styles.label}>Cortex Degraded Ratio</span>
        </div>
        <div className={styles.errorState}>
          <span className={styles.errorDot} />
          <span>{error || data?.reason || 'Cortex unreachable'}</span>
        </div>
        <div className={`${styles.statusBar} ${styles.statusInert}`} />
      </div>
    );
  }

  const slice = data[window];
  if (!slice) {
    return (
      <div className={styles.card}>
        <div className={styles.header}>
          <span className={styles.label}>Cortex Degraded Ratio</span>
        </div>
        <div className={styles.errorState}>
          <span className={styles.errorDot} />
          <span>No data for {window} window</span>
        </div>
        <div className={`${styles.statusBar} ${styles.statusInert}`} />
      </div>
    );
  }

  const pct = Math.round(slice.ratio * 1000) / 10; // one decimal
  const status = slice.status; // green | yellow | red

  const ratioClass = status === 'green' ? styles.ratioGreen
    : status === 'yellow' ? styles.ratioYellow
    : status === 'red' ? styles.ratioRed
    : styles.ratioInert;

  const barClass = status === 'green' ? styles.statusGreen
    : status === 'yellow' ? styles.statusYellow
    : status === 'red' ? styles.statusRed
    : styles.statusInert;

  // Sort flags by count descending
  const flags = Object.entries(slice.flag_breakdown || {})
    .sort((a, b) => b[1] - a[1]);

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.label}>Cortex Degraded Ratio</span>
        <button className={styles.windowToggle} onClick={toggleWindow} title="Toggle time window">
          {window}
        </button>
      </div>

      <div className={styles.ratioRow}>
        <span className={`${styles.ratio} ${ratioClass}`}>
          {slice.total_iterations === 0 ? '--' : pct.toFixed(1)}
        </span>
        <span className={styles.ratioSuffix}>
          {slice.total_iterations === 0 ? '' : '%'}
        </span>
      </div>

      <div className={styles.iterationRow}>
        {slice.degraded_iterations} / {slice.total_iterations} degraded ({window === '1h' ? 'last hour' : 'last 24h'})
      </div>

      {flags.length > 0 && (
        <div className={styles.breakdown}>
          <div className={styles.breakdownTitle}>Flag breakdown</div>
          {flags.map(([flag, count]) => (
            <div key={flag} className={styles.flagRow}>
              <span className={styles.flagName}>{flag}</span>
              <span className={styles.flagCount}>{count}</span>
            </div>
          ))}
        </div>
      )}

      <div className={`${styles.statusBar} ${barClass}`} />
    </div>
  );
}
