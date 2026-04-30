import styles from './TestDetailDrawer.module.css';

const STATUS_COLORS = {
  pass: 'var(--cv-pass)',
  fail: 'var(--cv-fail)',
  blocked: 'var(--cv-blocked)',
  running: 'var(--cv-running)',
  unknown: 'var(--cv-unknown)',
};

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

export default function TestDetailDrawer({ testDetail, onClose, onRun }) {
  if (!testDetail) return null;

  const { test, results } = testDetail;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3 className={styles.title}>{test.name}</h3>
          <button className={styles.closeBtn} onClick={onClose}>&times;</button>
        </div>

        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>Definition</h4>
          <div className={styles.defGrid}>
            <span className={styles.defLabel}>ID</span>
            <span className={styles.defValue}>{test.id}</span>
            <span className={styles.defLabel}>Tier</span>
            <span className={styles.defValue}>{test.tier}</span>
            <span className={styles.defLabel}>Group</span>
            <span className={styles.defValue}>{test.group}</span>
            <span className={styles.defLabel}>Schedule</span>
            <span className={styles.defValue}>{test.schedule}</span>
            <span className={styles.defLabel}>Timeout</span>
            <span className={styles.defValue}>{test.timeout_ms}ms</span>
          </div>

          {test.dependencies?.length > 0 && (
            <div className={styles.listSection}>
              <span className={styles.defLabel}>Dependencies</span>
              <ul className={styles.depList}>
                {test.dependencies.map((d) => <li key={d}>{d}</li>)}
              </ul>
            </div>
          )}

          {test.deterministic_triggers?.length > 0 && (
            <div className={styles.listSection}>
              <span className={styles.defLabel}>Deterministic Triggers</span>
              <ul className={styles.depList}>
                {test.deterministic_triggers.map((t, i) => (
                  <li key={i}>{t.event}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h4 className={styles.sectionTitle}>History</h4>
            <button className={styles.runBtn} onClick={() => onRun(test.id)}>Run Now</button>
          </div>

          {results.length > 0 ? (
            <>
              <div className={styles.timeline}>
                {results.map((r, i) => (
                  <div
                    key={i}
                    className={styles.timelineDot}
                    style={{ background: STATUS_COLORS[r.status] || STATUS_COLORS.unknown }}
                    title={`${r.status} — ${relativeTime(r.timestamp)}`}
                  />
                ))}
              </div>
              <div className={styles.historyList}>
                {results.map((r, i) => (
                  <div key={i} className={styles.historyRow}>
                    <span
                      className={styles.historyDot}
                      style={{ background: STATUS_COLORS[r.status] || STATUS_COLORS.unknown }}
                    />
                    <span className={styles.historyStatus}>{r.status}</span>
                    <span className={styles.historyTime}>{relativeTime(r.timestamp)}</span>
                    <span className={styles.historyDuration}>{r.duration_ms}ms</span>
                    <span className={styles.historyTrigger}>{r.triggered_by}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className={styles.empty}>No history available</p>
          )}
        </div>

        {results.length > 0 && results[0].detail && (
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Last Output</h4>
            <pre className={styles.output}>{results[0].detail}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
