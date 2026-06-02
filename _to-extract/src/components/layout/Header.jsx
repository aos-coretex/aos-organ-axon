import { NavLink, useLocation } from 'react-router-dom';
import styles from './Header.module.css';

export default function Header() {
  const location = useLocation();
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <NavLink to="/" className={styles.brand}>
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
        </NavLink>

        <nav className={styles.nav}>
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/projects"
            className={({ isActive }) =>
              `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
            }
          >
            Products
          </NavLink>
          <NavLink
            to="/components"
            className={() => {
              const isActive = location.pathname.startsWith('/components');
              return `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`;
            }}
          >
            Components
          </NavLink>
          <NavLink
            to="/control"
            className={() => {
              const isActive = location.pathname.startsWith('/control');
              return `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`;
            }}
          >
            Control
          </NavLink>

          {/* Login page removed — session auth is handled by coretex-agentic-session */}
        </nav>
      </div>
    </header>
  );
}
