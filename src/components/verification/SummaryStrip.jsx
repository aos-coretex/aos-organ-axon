import styles from './SummaryStrip.module.css';

function relativeTime(isoStr) {
  if (!isoStr) return 'never';
  const ms = Date.now() - new Date(isoStr).getTime();
  const minutes = Math.floor(ms / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function SummaryStrip({ summary, statusFilter, onStatusFilter }) {
  if (!summary) return null;

  const badges = [
    { label: 'Total', value: summary.total, cls: styles.neutral, filterKey: null },
    { label: 'Passing', value: `${summary.passing} (${summary.total > 0 ? Math.round((summary.passing / summary.total) * 100) : 0}%)`, cls: styles.pass, filterKey: 'pass' },
    { label: 'Failing', value: summary.failing, cls: styles.fail, filterKey: 'fail' },
    { label: 'Blocked', value: summary.blocked, cls: styles.blocked, filterKey: 'blocked' },
    { label: 'Stale', value: summary.stale, cls: styles.stale, filterKey: 'stale' },
    { label: 'Last Run', value: relativeTime(summary.last_full_run), cls: styles.neutral, filterKey: null },
  ];

  return (
    <div className={styles.strip}>
      {badges.map((b) => {
        if (b.filterKey) {
          const isActive = statusFilter === b.filterKey;
          return (
            <button
              key={b.label}
              className={`${styles.badge} ${b.cls} ${styles.clickable} ${isActive ? styles.active : ''}`}
              onClick={() => onStatusFilter(isActive ? null : b.filterKey)}
              title={isActive ? 'Show all' : `Filter: ${b.label}`}
            >
              <span className={styles.badgeValue}>{b.value}</span>
              <span className={styles.badgeLabel}>{b.label}</span>
            </button>
          );
        }
        return (
          <div key={b.label} className={`${styles.badge} ${b.cls}`}>
            <span className={styles.badgeValue}>{b.value}</span>
            <span className={styles.badgeLabel}>{b.label}</span>
          </div>
        );
      })}
    </div>
  );
}
