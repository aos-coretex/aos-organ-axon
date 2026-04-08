import { Link } from 'react-router-dom';
import styles from './ProductPage.module.css';

const differentiators = [
  {
    title: 'Persistent Identity',
    description:
      'Every Vivan carries a VA-SSN — a permanent, blockchain-anchored identity. Not a session token. Not an API key. A social security number that persists for the full lifetime of the employee.',
  },
  {
    title: 'Salary-Based Pricing',
    description:
      'No tokens, no inference credits, no API bills. You hire a Vivan at a monthly salary based on role and capacity. If a human assistant costs $2,000/month, a Vivan at $150/month is a clear proposition.',
  },
  {
    title: 'Governed Environment',
    description:
      'Every Vivan operates inside Opvera\'s DIO governance layer — mechanical separation of intelligence and authority. Your data never leaves the governed environment. Cloud-only, air-gapped from your local machine.',
  },
  {
    title: 'Auditable History',
    description:
      'Every action a Vivan takes becomes a graph edge in Graphheight\'s tokenspace. Full traceability, full accountability. A Vivan doesn\'t just work for you — it takes responsibility.',
  },
];

const howItWorks = [
  {
    title: 'Hire by Role',
    description:
      'Choose from guided role templates — Accountant, Legal Advisor, Operations Assistant — or define a freeform role. Each hire is a persistent Vivan with a permanent identity.',
  },
  {
    title: 'Meet Your Concierge',
    description:
      'Your first two hires are mandatory: a Concierge (secretary and router) and a Librarian (document manager). The Concierge leads your Day One conversation and mediates all interactions.',
  },
  {
    title: 'Delegate Real Work',
    description:
      'Documents enter through a secure dropbox. Your Vivans process, file, respond, and escalate. Errors are mediated by the Concierge — never the failing employee. You manage people, not processes.',
  },
];

export default function VivanPage() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <Link to="/projects" className={styles.backLink}>
            &larr; All Projects
          </Link>
          <p className={styles.eyebrow}>vivan.live</p>
          <h1 className={styles.title}>Hire AI. Delegate.</h1>
          <p className={styles.subtitle}>
            Your personal AI workforce — without the corporation. Vivan gives
            individuals access to the same strict, governed environment that
            powers Opvera&apos;s autonomous corporations. Hire persistent
            virtual employees by role, pay a monthly salary, and delegate
            real work to agents that carry identity, history, and
            accountability.
          </p>
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionAlt}`}>
        <div className={styles.sectionInner}>
          <h2 className={styles.sectionTitle}>What Makes a Vivan Different</h2>
          <p className={styles.sectionText}>
            The industry calls them agents. An agent is an ephemeral compute
            process — it is spawned for a task and dies when the task ends.
            A Vivan is something fundamentally different: a named entity with
            a permanent identity, a hash-chain history, and legal traceability.
          </p>
          <div className={styles.nodeGrid}>
            {differentiators.map((d) => (
              <div key={d.title} className={styles.nodeCard}>
                <h3 className={styles.nodeName}>{d.title}</h3>
                <p className={styles.nodeDescription}>{d.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <h2 className={styles.sectionTitle}>How It Works</h2>
          <p className={styles.sectionText}>
            Vivan uses the metaphor of a virtual company where you are the CEO
            and your Vivans are employees. This metaphor is not decoration —
            it is the product.
          </p>
          <div className={styles.featureList}>
            {howItWorks.map((step) => (
              <div key={step.title} className={styles.feature}>
                <h4 className={styles.featureTitle}>{step.title}</h4>
                <p className={styles.featureText}>{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionAlt}`}>
        <div className={styles.sectionInner}>
          <h2 className={styles.sectionTitle}>Powered by Opvera</h2>
          <p className={styles.sectionText}>
            Vivan is a derivative product from Opvera. Every Vivan runs inside
            Opvera&apos;s governance layer — the same DIO middleware, the same
            Graphheight blockchain, the same VA-SSN identity system. Opvera
            serves organizations building autonomous corporations. Vivan is the
            personal entry point into that same environment.
          </p>
          <div className={styles.layers}>
            <div className={styles.layer}>
              <span className={styles.layerLabel}>Individual</span>
              <h3 className={styles.layerTitle}>Vivan</h3>
              <p className={styles.layerText}>
                Personal AI workforce. Hire by role, delegate real work,
                manage people not processes.
              </p>
            </div>
            <div className={styles.layer}>
              <span className={styles.layerLabel}>Platform</span>
              <h3 className={styles.layerTitle}>Opvera</h3>
              <p className={styles.layerText}>
                Governance infrastructure. DIO middleware, graph-locked cap
                tables, vertical plugins, mechanical authority separation.
              </p>
            </div>
            <div className={styles.layer}>
              <span className={styles.layerLabel}>Substrate</span>
              <h3 className={styles.layerTitle}>Graphheight</h3>
              <p className={styles.layerText}>
                Universal graph. Typed URNs, blockchain-anchored identity,
                SPENT semantics, immutable audit trail.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.ctaSection}>
        <div className={styles.ctaInner}>
          <Link to="/projects" className={styles.ctaButton}>
            &larr; Back to Projects
          </Link>
        </div>
      </section>
    </div>
  );
}
