import styles from './HealthBar.module.css';

export default function HealthBar({ passing = 0, failing = 0, blocked = 0, stale = 0 }) {
  const total = passing + failing + blocked + stale;
  if (total === 0) return <div className={styles.bar}><div className={styles.empty} /></div>;

  return (
    <div className={styles.bar}>
      {passing > 0 && (
        <div className={styles.pass} style={{ width: `${(passing / total) * 100}%` }} />
      )}
      {failing > 0 && (
        <div className={styles.fail} style={{ width: `${(failing / total) * 100}%` }} />
      )}
      {blocked > 0 && (
        <div className={styles.blocked} style={{ width: `${(blocked / total) * 100}%` }} />
      )}
      {stale > 0 && (
        <div className={styles.stale} style={{ width: `${(stale / total) * 100}%` }} />
      )}
    </div>
  );
}
