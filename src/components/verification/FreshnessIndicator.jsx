import styles from './FreshnessIndicator.module.css';

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

export default function FreshnessIndicator({ lastRun, freshness }) {
  return (
    <span className={`${styles.indicator} ${styles[freshness] || styles.dead}`}>
      {relativeTime(lastRun)}
    </span>
  );
}
