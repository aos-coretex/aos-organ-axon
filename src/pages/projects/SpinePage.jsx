import { Link } from 'react-router-dom';
import styles from './SpinePage.module.css';

const consumers = [
  {
    label: 'MCB',
    title: 'Memory Capture Bus',
    text: 'Routes platform events to Radiant (memory/context), Minder (person observations), and the graph (bindings). 44 deterministic triggers across 8 domains.',
  },
  {
    label: 'Autoheal',
    title: 'Autoheal Self-Repair',
    text: 'Consumes CV failure events to create repair tickets. Three-layer intelligent pipeline with human escalation for architectural issues.',
  },
  {
    label: 'Future',
    title: 'Extensible',
    text: 'Alerting, external integrations, dashboards, and cross-service coordination. New consumers plug into Spine without restructuring existing subscribers.',
  },
];

const currentImpl = [
  {
    title: 'SQLite Event Store',
    text: 'Events are graph concepts in ai-kb.db with type "event". Each event carries a URN-encoded timestamp, event type, and processing state. The store is the shared substrate all consumers read from.',
  },
  {
    title: 'Library Abstraction',
    text: 'A thin JavaScript module exposes emit(), subscribe(), and poll() over the SQLite store. Consumers import the library directly. No network protocol, no serialization overhead \u2014 just function calls against the shared database.',
  },
  {
    title: 'Deterministic Routing',
    text: 'Event-to-consumer routing is filter-based. Each consumer declares the event types it cares about. The library matches events to subscriptions and dispatches. No broker, no message queue \u2014 the database is the queue.',
  },
];

const futureImpl = [
  {
    title: 'Live Server',
    text: 'A standalone Node.js service accepting events over HTTP and WebSocket. Producers emit events to the server; consumers subscribe to filtered streams. Real-time push replaces polling.',
  },
  {
    title: 'Event Schema Registry',
    text: 'Formal event type definitions with versioning. Producers declare event schemas; consumers validate against them. Breaking changes are caught at registration time, not at runtime.',
  },
  {
    title: 'Cross-Machine Routing',
    text: 'Events flow between machines in the cluster. A Spine server on each node forms a mesh. Platform events on Machine A are visible to consumers on Machine B. Foundation for distributed Graphheight deployment.',
  },
];

export default function SpinePage() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <Link to="/components" className={styles.backLink}>&larr; Components</Link>
          <h1 className={styles.title}>Spine</h1>
          <p className={styles.subtitle}>
            Coretex Agentic Event Bus &mdash; the single, global event routing primitive.
          </p>
          <p className={styles.description}>
            Every platform event &mdash; CV test results, session lifecycle, backup
            completion, remediation outcomes, dream cycles &mdash; flows through Spine.
            Consumers subscribe to the events they care about and process them
            independently. The Memory Capture Bus (MCB) is a consumer of Spine, not
            the event system itself.
          </p>
        </div>
      </section>

      {/* Status strip */}
      <div className={styles.statusStrip}>
        <div className={styles.statusInner}>
          <div className={styles.statusItem}>
            <span className={styles.statusLabel}>Implementation</span>
            <span>HTTP + WebSocket server</span>
          </div>
          <div className={styles.statusItem}>
            <Link to="/activity/spine" className={styles.activityLink}>
              View Live Activity &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* Consumers */}
      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <h2 className={styles.sectionTitle}>Consumers</h2>
          <div className={styles.cardGrid}>
            {consumers.map((c) => (
              <div key={c.label} className={styles.card}>
                <span className={styles.cardLabel}>{c.label}</span>
                <h3 className={styles.cardTitle}>{c.title}</h3>
                <p className={styles.cardText}>{c.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Current Implementation */}
      <section className={`${styles.section} ${styles.sectionAlt}`}>
        <div className={styles.sectionInner}>
          <h2 className={styles.sectionTitle}>Current Implementation</h2>
          <p className={styles.sectionNote}>Library module over SQLite &mdash; zero infrastructure overhead</p>
          <div className={styles.featureList}>
            {currentImpl.map((c) => (
              <div key={c.title} className={styles.feature}>
                <h3 className={styles.featureTitle}>{c.title}</h3>
                <p className={styles.featureText}>{c.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Future Implementation */}
      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <h2 className={styles.sectionTitle}>Future Implementation</h2>
          <p className={styles.sectionNote}>Live server with real-time push and cross-machine routing</p>
          <div className={styles.featureList}>
            {futureImpl.map((c) => (
              <div key={c.title} className={styles.feature}>
                <h3 className={styles.featureTitle}>{c.title}</h3>
                <p className={styles.featureText}>{c.text}</p>
              </div>
            ))}
          </div>
          <span className={styles.statusBadge}>Server elevation planned</span>
        </div>
      </section>
    </div>
  );
}
