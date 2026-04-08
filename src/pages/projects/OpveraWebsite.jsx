import { Link } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import styles from './OpveraWebsite.module.css';

const valueProps = [
  {
    title: 'One-Step Incorporation',
    text: 'Opvera orchestrates a compliant workflow — minting graph-native legal primitives, share classes, cap table entries, and officer registrations. Your corporation exists in minutes, not months. Incorporation is optional — if your company already exists, it can be integrated.',
  },
  {
    title: 'Hire a Workforce That Never Sleeps',
    text: 'Staff your corporation with Vivans — persistent, identified AI employees. Each hire carries a permanent identity, a monthly salary, and full accountability. Your assistant routes work, your librarian manages documents, your accountant files returns.',
  },
  {
    title: 'Governance by Construction',
    text: 'Intelligence and execution authority are mechanically separated — the component that reasons cannot write, and the component that writes cannot reason. Governance is enforced by architecture, not by policy.',
  },
  {
    title: 'Powered by Graphheight\u2122',
    text: 'Opvera runs on Graphheight — the universal graph where every corporation, actor, and asset is connected. Agents reason over live relationships, not flat documents. Transactions flow natively across corporate boundaries because every entity shares the same graph.',
  },
];

const howItWorks = [
  {
    step: '01',
    title: 'Incorporate',
    text: 'Opvera provisions your corporation — cap table, officer registry, share ledger — on the Graphheight\u2122 graph. Already incorporated? Integrate your existing company instead.',
  },
  {
    step: '02',
    title: 'Hire',
    text: 'Staff by role. Each hire becomes a Vivan with a permanent V-SSN. Pay salaries, not API tokens.',
  },
  {
    step: '03',
    title: 'Delegate',
    text: 'Assign real work. Your Vivans handle documents, compliance, communications, and transactions — governed and auditable.',
  },
  {
    step: '04',
    title: 'Scale',
    text: 'Add departments, hire specialists, plug into external systems. Your corporation grows as you do.',
  },
];

export default function OpveraWebsite() {
  const pageRef = useRef(null);

  useEffect(() => {
    const els = pageRef.current?.querySelectorAll('[data-reveal]');
    if (!els) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add(styles.revealed);
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <div className={styles.page} ref={pageRef}>
      {/* Site header */}
      <header className={styles.siteHeader}>
        <div className={styles.siteBrand}>
          <svg className={styles.siteLogo} viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="28" height="28" rx="6" fill="#191919" />
            <path d="M8 14 L14 8 L20 14 L14 20 Z" fill="none" stroke="#ffffff" strokeWidth="1.8" />
            <circle cx="14" cy="14" r="2.5" fill="#22c55e" />
          </svg>
          <span>opvera.io</span>
        </div>
        <nav className={styles.siteNav}>
          <Link to="/projects/opvera/coming-soon" className={styles.navLink}>Pricing</Link>
          <Link to="/projects/opvera/coming-soon" className={styles.navLink}>Docs</Link>
          <Link to="/projects/opvera/coming-soon" className={styles.navLink}>About</Link>
          <Link to="/projects/opvera/coming-soon" className={styles.navLogin}>Log in</Link>
        </nav>
      </header>

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={`${styles.heroTitle} ${styles.reveal} ${styles.revealD1}`} data-reveal>
            <em>autonomous.</em>
          </h1>
          <p className={`${styles.heroBaseline} ${styles.reveal} ${styles.revealD2}`} data-reveal>
            Build it. Staff it. Your company runs itself.
          </p>
          <p className={`${styles.heroText} ${styles.reveal} ${styles.revealD3}`} data-reveal>
            Incorporate, hire, and delegate to a virtual workforce that carries
            identity, accountability, and a permanent record.
          </p>
          <div className={`${styles.heroActions} ${styles.reveal} ${styles.revealD4}`} data-reveal>
            <Link to="/projects/opvera/coming-soon" className={styles.heroCta}>
              Go Autonomous
            </Link>
          </div>
        </div>
      </section>

      {/* Value proposition — image backdrop with overlay cards */}
      <section className={`${styles.valueSection} ${styles.reveal}`} data-reveal>
        <div className={styles.valueBackdrop}>
          <img
            src="https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=1600"
            alt="Professional at ease — the company runs itself"
            className={styles.valueBackdropImg}
          />
          <div className={styles.valueOverlay}>
            <h2 className={styles.valueOverlayTitle}>
              Let go.<br />Your company knows what to do.
            </h2>
            <div className={styles.valueStack}>
              {valueProps.map((v) => (
                <div key={v.title} className={styles.valueCard}>
                  <h3 className={styles.valueTitle}>{v.title}</h3>
                  <p className={styles.valueText}>{v.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className={`${styles.howSection} ${styles.reveal}`} data-reveal>
        <div className={styles.sectionInner}>
          <h2 className={styles.sectionTitle}>How it works</h2>
          <div className={styles.stepsGrid}>
            {howItWorks.map((s) => (
              <div key={s.step} className={styles.stepCard}>
                <span className={styles.stepNumber}>{s.step}</span>
                <h3 className={styles.stepTitle}>{s.title}</h3>
                <p className={styles.stepText}>{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust / identity */}
      <section className={`${styles.trustSection} ${styles.reveal}`} data-reveal>
        <div className={styles.sectionInner}>
          <div className={styles.trustSplit}>
            <div className={styles.trustContent}>
              <h2 className={styles.sectionTitle}>
                Every employee gets a V-SSN<br />a Virtual Social Security Number.
              </h2>
              <p className={styles.sectionText}>
                When you hire through Opvera, your employee becomes a Vivan —
                a persistent AI actor with a V-SSN minted on the Graphheight
                blockchain. A Vivan is a named, traceable
                identity with history, accountability, and a permanent record.
                Every action is cryptographically attributed to a Vivan. Terminated employees
                are retired, never deleted. The full history is preserved.
              </p>
              <div className={styles.trustGridInline}>
                <div className={styles.trustItem}>
                  <h4 className={styles.trustLabel}>Identity</h4>
                  <p className={styles.trustValue}>
                    Permanent V-SSN per Vivan — not a session token
                  </p>
                </div>
                <div className={styles.trustItem}>
                  <h4 className={styles.trustLabel}>Auditability</h4>
                  <p className={styles.trustValue}>
                    Every action is a graph edge — fully traceable
                  </p>
                </div>
                <div className={styles.trustItem}>
                  <h4 className={styles.trustLabel}>Governance</h4>
                  <p className={styles.trustValue}>
                    DIO separates intelligence from authority — structurally
                  </p>
                </div>
                <div className={styles.trustItem}>
                  <h4 className={styles.trustLabel}>Regulatory</h4>
                  <p className={styles.trustValue}>
                    Pre-built for AI liability, taxation, and identification
                  </p>
                </div>
              </div>
            </div>
            <div className={styles.vivanCard}>
              <div className={styles.vivanPhoto}>
                <img
                  src="https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=600"
                  alt="Susie — Vivan Administrative Assistant"
                  className={styles.vivanImg}
                />
              </div>
              <div className={styles.vivanInfo}>
                <span className={styles.vivanRole}>Administrative Assistant</span>
                <h3 className={styles.vivanName}>Susie</h3>
                <span className={styles.vivanBadge}>Vivan</span>
              </div>
              <div className={styles.vivanMeta}>
                <div className={styles.vivanMetaRow}>
                  <span className={styles.vivanMetaLabel}>V-SSN</span>
                  <span className={styles.vivanMetaValue}>VA-7291-0384-SUSIE</span>
                </div>
                <div className={styles.vivanMetaRow}>
                  <span className={styles.vivanMetaLabel}>Status</span>
                  <span className={styles.vivanStatusActive}>Active</span>
                </div>
                <div className={styles.vivanMetaRow}>
                  <span className={styles.vivanMetaLabel}>Hired</span>
                  <span className={styles.vivanMetaValue}>2026-03-15</span>
                </div>
              </div>
              <p className={styles.vivanQuote}>"Hi, I'm Susie. I manage calendars, route correspondence, and keep your filings on schedule. Every action I take is on the graph."</p>
            </div>
          </div>
        </div>
      </section>

      {/* Corporate footer */}
      <footer className={styles.siteFooter}>
        <div className={styles.footerInner}>
          <div className={styles.footerBrand}>
            <div className={styles.footerLogo}>
              <svg width="24" height="24" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="28" height="28" rx="6" fill="#191919" />
                <path d="M8 14 L14 8 L20 14 L14 20 Z" fill="none" stroke="#ffffff" strokeWidth="1.8" />
                <circle cx="14" cy="14" r="2.5" fill="#22c55e" />
              </svg>
              <span>opvera.io</span>
            </div>
            <p className={styles.footerTagline}>Autonomous corporations, powered by Graphheight&#8482;</p>
          </div>
          <div className={styles.footerLinks}>
            <div className={styles.footerCol}>
              <h4 className={styles.footerColTitle}>Product</h4>
              <Link to="/projects/opvera/coming-soon" className={styles.footerLink}>Pricing</Link>
              <Link to="/projects/opvera/coming-soon" className={styles.footerLink}>Docs</Link>
              <Link to="/projects/opvera/coming-soon" className={styles.footerLink}>Changelog</Link>
            </div>
            <div className={styles.footerCol}>
              <h4 className={styles.footerColTitle}>Company</h4>
              <Link to="/projects/opvera/coming-soon" className={styles.footerLink}>About</Link>
              <Link to="/projects/opvera/coming-soon" className={styles.footerLink}>Careers</Link>
              <Link to="/projects/opvera/coming-soon" className={styles.footerLink}>Contact</Link>
            </div>
            <div className={styles.footerCol}>
              <h4 className={styles.footerColTitle}>Legal</h4>
              <Link to="/projects/opvera/coming-soon" className={styles.footerLink}>Privacy</Link>
              <Link to="/projects/opvera/coming-soon" className={styles.footerLink}>Terms</Link>
            </div>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <span>&copy; 2026 Opvera. All rights reserved.</span>
        </div>
      </footer>

    </div>
  );
}
