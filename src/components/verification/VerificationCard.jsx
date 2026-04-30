import FreshnessIndicator from './FreshnessIndicator';
import styles from './VerificationCard.module.css';

const TIER_LABELS = { unit: 'Unit', integration: 'Int' };

export default function VerificationCard({ test, onTrigger, onClick }) {
  const statusClass = styles[`status_${test.status}`] || styles.status_unknown;
  const freshnessClass = styles[`fresh_${test.freshness}`] || styles.fresh_dead;

  function handleTrigger(e) {
    e.stopPropagation();
    onTrigger(test.id);
  }

  return (
    <div className={styles.card} onClick={() => onClick(test.id)}>
      <div className={styles.topRow}>
        <div className={styles.nameRow}>
          <span className={`${styles.dot} ${statusClass}`} />
          <span className={styles.name}>{test.name}</span>
        </div>
        <button
          className={styles.triggerBtn}
          onClick={handleTrigger}
          disabled={test.status === 'running'}
          title="Run test"
        >
          {test.status === 'running' ? (
            <span className={styles.spinner} />
          ) : (
            '\u25B6'
          )}
        </button>
      </div>
      <div className={styles.meta}>
        <span className={styles.tierBadge}>{TIER_LABELS[test.tier] || test.tier}</span>
        <span className={styles.sep}>&middot;</span>
        <span className={styles.group}>{test.group}</span>
        {test.duration_ms > 0 && (
          <>
            <span className={styles.sep}>&middot;</span>
            <span className={styles.duration}>{test.duration_ms}ms</span>
          </>
        )}
      </div>
      <div className={styles.bottom}>
        <FreshnessIndicator lastRun={test.last_run} freshness={test.freshness} />
        {test.triggered_by && (
          <>
            <span className={styles.sep}>&middot;</span>
            <span className={styles.trigger}>{test.triggered_by}</span>
          </>
        )}
      </div>
      <div className={`${styles.freshnessBar} ${freshnessClass}`} />
    </div>
  );
}
