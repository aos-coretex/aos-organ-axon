import { Link } from 'react-router-dom';
import styles from './ProjectsPage.module.css';

function OpveraLogo() {
  return (
    <div className={styles.logoRow}>
      <svg className={styles.logoIcon} viewBox="0 0 28 28" fill="none">
        <rect width="28" height="28" rx="6" fill="#191919" />
        <path d="M8 14 L14 8 L20 14 L14 20 Z" fill="none" stroke="#ffffff" strokeWidth="1.8" />
        <circle cx="14" cy="14" r="2.5" fill="#22c55e" />
      </svg>
      <span className={styles.logoOpvera}>Opvera</span>
    </div>
  );
}

function VivanLogo() {
  return (
    <div className={styles.logoRow}>
      <svg className={styles.logoIcon} viewBox="0 0 28 28" fill="none">
        <rect width="28" height="28" rx="7" fill="#ff6b00" />
        {/* Raised hand/wave — warm, human, welcoming */}
        <circle cx="12" cy="10" r="3.2" fill="#ffffff" />
        <path d="M8 22 C8 17.5 9.5 15 12 15 C13.5 15 14.5 16 15 17.5" fill="#ffffff" />
        {/* Waving arm */}
        <path d="M15 17.5 C16 15 17.5 13 19 11.5" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
        {/* Hand fingers spread */}
        <path d="M19 11.5 L20.5 9.5" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M19 11.5 L21.5 11" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M19 11.5 L21 12.5" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <span className={styles.logoVivan}>Vivan</span>
    </div>
  );
}

function BluboxLogo() {
  return (
    <div className={styles.logoRow}>
      <svg className={styles.logoIcon} viewBox="0 0 28 28" fill="none">
        <rect x="2" y="2" width="24" height="24" rx="4" fill="#1e3a5f" />
        <rect x="7" y="7" width="14" height="14" rx="2" fill="none" stroke="#60a5fa" strokeWidth="1.5" />
        <circle cx="14" cy="14" r="3" fill="#60a5fa" opacity="0.6" />
      </svg>
      <span className={styles.logoBlubox}>blubox</span>
    </div>
  );
}

function SentienceLogo() {
  return (
    <div className={styles.logoRow}>
      <svg className={styles.logoIcon} viewBox="0 0 28 28" fill="none">
        <rect width="28" height="28" rx="7" fill="#1a1815" />
        {/* Minimal chain — two linked hexagons */}
        <path d="M7.5 11.5 L10.5 9.5 L13.5 11.5 L13.5 15 L10.5 17 L7.5 15 Z" fill="none" stroke="#9a9590" strokeWidth="0.9" />
        <path d="M14.5 11.5 L17.5 9.5 L20.5 11.5 L20.5 15 L17.5 17 L14.5 15 Z" fill="none" stroke="#9a9590" strokeWidth="0.9" />
        {/* Shared edge glow */}
        <line x1="14" y1="11.5" x2="14" y2="15" stroke="#c4c0bb" strokeWidth="0.8" />
        {/* Center dot — the token */}
        <circle cx="14" cy="20" r="1.2" fill="#c4c0bb" />
      </svg>
      <span className={styles.logoSentience}>sentience</span>
    </div>
  );
}

const logoMap = {
  opvera: OpveraLogo,
  vivan: VivanLogo,
  blubox: BluboxLogo,
  sentience: SentienceLogo,
};

const projects = [
  {
    slug: 'opvera',
    tagline: 'Autonomous Corporations',
    description:
      'A governance-first platform for creating and operating autonomous corporations. DIO middleware enforces mechanical separation of intelligence and authority. Graph-locked cap tables, one-step incorporation, vertical plugins, and VA-SSN identity for every actor — the corporate OS for the autonomous economy.',
    status: 'In Development',
    website: '/projects/opvera/website',
  },
  {
    slug: 'vivan',
    tagline: 'Hire AI. Delegate.',
    description:
      'Your personal AI workforce — without the corporation. Hire persistent virtual employees by role, pay a monthly salary, and delegate real work. Every Vivan carries a permanent identity, an auditable history, and accountability. Same strict governance as Opvera, built for individuals.',
    status: 'In Development',
  },
  {
    slug: 'blubox',
    tagline: 'Edge Agent Appliance',
    description:
      'A plug-and-play hardware appliance that gives any business a secure, local gateway for agentic commerce. Zero-touch provisioning, hardware-enforced isolation, and a local graph engine — the Square Reader of the autonomous economy.',
    status: 'In Development',
  },
  {
    slug: 'sentience',
    tagline: 'The Digital Alter-Ego',
    description:
      'A legal and technological framework for establishing the equivalence of tokenized assets under U.S. law. Hash DNA, blockchain persistence, and interconnected asset graphs turn digital tokens into the most secure embodiment of legal rights.',
    status: 'Research',
  },
];

export default function ProjectsPage() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <h1 className={styles.title}>Products</h1>
          <p className={styles.subtitle}>
            Products designed for a world where agents transact,
            govern, and operate alongside humans.
          </p>
        </div>
      </section>

      <section className={styles.grid}>
        <div className={styles.gridInner}>
          {projects.map((project) => {
            const Logo = logoMap[project.slug];
            return (
              <div key={project.slug} className={styles.card}>
                <span className={styles.cardStatus}>{project.status}</span>
                <Logo />
                <p className={styles.cardTagline}>{project.tagline}</p>
                <p className={styles.cardDescription}>{project.description}</p>
                <div className={styles.cardActions}>
                  <Link
                    to={`/projects/${project.slug}`}
                    className={styles.cardLink}
                  >
                    Learn more
                  </Link>
                  {project.website && (
                    <Link
                      to={project.website}
                      className={styles.cardWebsite}
                    >
                      Website
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
