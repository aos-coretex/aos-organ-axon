import { Link } from 'react-router-dom';
import styles from './Dashboard.module.css';

export default function GraphheightDashboard() {
  return (
    <div className={styles.graphheightPage}>
      <div className={styles.graphheightTopBar}>
        <Link to="/components" className={styles.graphheightTopBarLink}>&larr; Components</Link>
      </div>
      {/* Coming Soon */}
      <div className={styles.comingSoon}>
        <div className={styles.comingSoonInner}>
          <div className={styles.logoContainer}>
            <div className={styles.graphheightWordmark}>
              <span className={styles.graphheightWordBold}>Graph</span>
              <span className={styles.graphheightWordLight}>height</span>
              <span className={styles.graphheightSM}>SM</span>
            </div>
            <div className={styles.graphheightTagline}>Data becomes Intelligence.</div>
          </div>
          <div className={styles.graphheightDivider} />
          <p className={styles.graphheightLabel}>LEG 2 — STRUCTURAL TRUTH</p>
          <h2 className={styles.graphheightTitle}>Coming Soon</h2>
          <p className={styles.graphheightText}>
            The universal graph — typed URNs, class bindings, composition edges,
            and blockchain-anchored identity. Ground truth that cannot be overridden
            by inference. The skeleton the other legs hang from.
          </p>
          <div className={styles.graphheightMeta}>
            <span>Erlang/OTP</span>
            <span className={styles.graphheightMetaDot} />
            <span>Mnesia</span>
            <span className={styles.graphheightMetaDot} />
            <span>Distributed</span>
          </div>
        </div>
      </div>

    </div>
  );
}
