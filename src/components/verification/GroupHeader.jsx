import HealthBar from './HealthBar';
import styles from './GroupHeader.module.css';

export default function GroupHeader({ group, onRunGroup }) {
  return (
    <div className={styles.header}>
      <div className={styles.left}>
        <span className={styles.icon}>{getIcon(group.icon)}</span>
        <span className={styles.name}>{group.name}</span>
        <span className={styles.count}>{group.total}</span>
      </div>
      <div className={styles.right}>
        <HealthBar
          passing={group.passing}
          failing={group.failing}
          blocked={group.blocked}
          stale={group.stale}
        />
        <button className={styles.runBtn} onClick={() => onRunGroup(group.id)} title="Run group">
          Run
        </button>
      </div>
    </div>
  );
}

function getIcon(type) {
  const icons = {
    db: '\u{1F4BE}',
    memory: '\u{1F9E0}',
    person: '\u{1F464}',
    event: '\u{26A1}',
    graph: '\u{1F578}',
    auth: '\u{1F512}',
    web: '\u{1F310}',
    link: '\u{1F517}',
    schedule: '\u{23F0}',
    git: '\u{1F500}',
    backup: '\u{1F4E6}',
    server: '\u{2699}',
    platform: '\u{1F3D7}',
  };
  return icons[type] || '\u{25CF}';
}
