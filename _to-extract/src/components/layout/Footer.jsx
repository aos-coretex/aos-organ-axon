import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.row}>
          <Link to="/" className={styles.brand}>
            <span className={styles.wordmark}>
              <span className={styles.wordmarkCore}>core</span>
              <span className={styles.wordmarkTex}>tex</span>
              {' '}
              <span className={styles.wordmarkAgentic}>agentic</span>
            </span>
            <svg className={styles.brandLogo} viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="13" cy="13" r="12" stroke="#8a8580" strokeWidth="1.5" fill="none" />
              <circle cx="13" cy="7" r="2" fill="#c4704b" />
              <circle cx="7.8" cy="17" r="2" fill="#c4704b" />
              <circle cx="18.2" cy="17" r="2" fill="#c4704b" />
              <line x1="13" y1="9" x2="9" y2="15.5" stroke="#8a8580" strokeWidth="1" />
              <line x1="13" y1="9" x2="17" y2="15.5" stroke="#8a8580" strokeWidth="1" />
              <line x1="9.8" y1="17" x2="16.2" y2="17" stroke="#8a8580" strokeWidth="1" />
            </svg>
          </Link>

          <div className={styles.sep} />

          <div className={styles.group}>
            <span className={styles.groupLabel}>Products</span>
            <Link to="/projects/opvera" className={styles.footerLink}>Opvera</Link>
            <Link to="/projects/vivan" className={styles.footerLink}>Vivan</Link>
            <Link to="/projects/blubox" className={styles.footerLink}>blubox</Link>
            <Link to="/projects/sentience" className={styles.footerLink}>Sentience</Link>
          </div>

          <div className={styles.group}>
            <span className={styles.groupLabel}>Platform</span>
            <Link to="/components/monad" className={styles.footerLink}>Monad</Link>
            <Link to="/components/graphheight" className={styles.footerLink}>Graphheight</Link>
            <Link to="/components/radiant" className={styles.footerLink}>Radiant</Link>
            <Link to="/components/minder" className={styles.footerLink}>Minder</Link>
            <Link to="/components/syntra" className={styles.footerLink}>Syntra</Link>
          </div>

          <span className={styles.copy}>&copy; 2026 Coretex</span>
        </div>
      </div>
    </footer>
  );
}
