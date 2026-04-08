import { Link } from 'react-router-dom';
import styles from './ProductPage.module.css';

const legs = [
  {
    id: 'Leg 1',
    name: 'Radiant',
    classification: 'Abstraction Memory',
    description:
      'Enterprise and platform memory — context blocks, memory blocks, and knowledge fragments stored in PostgreSQL with pgvector embeddings. Autonomous dream cycle consolidates and prunes. Strict, precise, factual.',
  },
  {
    id: 'Leg 2',
    name: 'Graphheight',
    classification: 'Structural Truth',
    description:
      'The universal graph — typed URNs, class bindings, composition edges, and blockchain-anchored identity. Ground truth that cannot be overridden by inference. The skeleton the other legs hang from.',
  },
  {
    id: 'Leg 3',
    name: 'Minder',
    classification: 'Person Memory',
    description:
      'Models humans and AI personas through an observer/observed paradigm. A three-stage pipeline — Deriver, Dreamer, Dialectic — builds layered understanding of people over time. Opinionated, interpretive.',
  },
];

const features = [
  {
    title: 'Embedding-Powered Similarity',
    text: 'Every memory and context block is embedded on insert via all-MiniLM-L6-v2. Semantic similarity drives dream consolidation, deduplication, and retrieval.',
  },
  {
    title: 'Auto-Dream Cycle',
    text: 'Daily autonomous two-phase cycle: context freshness (triage, promote, prune) followed by memory consolidation (deduplicate, merge). Prevents memory rot without human intervention.',
  },
  {
    title: 'Lifecycle Separation',
    text: 'Context blocks expire (7-day default TTL). Memory blocks persist indefinitely. Promotion bridges the gap — significant context becomes permanent memory.',
  },
  {
    title: 'MCP Interface',
    text: 'Ten tools exposed via stdio MCP server: store, query, promote, prune, dream stats, merge, find similar, update TTL. Central persistence layer for all agent operations.',
  },
];

export default function RadiantPage() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <Link to="/projects" className={styles.backLink}>
            &larr; All Projects
          </Link>
          <p className={styles.eyebrow}>Monad — Leg 1</p>
          <h1 className={styles.title}>
            Abstraction &amp; Enterprise Memory
          </h1>
          <p className={styles.subtitle}>
            Radiant is the abstraction and enterprise memory system — the first
            leg of the Monad. It stores context, memories, and knowledge blocks
            for corporations and the platform itself, with embedding-powered
            semantic similarity and autonomous dream consolidation.
          </p>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <h2 className={styles.sectionTitle}>The Monad</h2>
          <p className={styles.sectionText}>
            The Monad is the Coretex platform&apos;s unified cognitive system —
            three structurally distinct memory legs bridged by the Y Combinator,
            a unidirectional correction path where Graphheight structural facts
            correct Minder inferences (never the reverse).
          </p>
          <div className={styles.nodeGrid}>
            {legs.map((leg) => (
              <div key={leg.id} className={styles.nodeCard}>
                <div className={styles.nodeHeader}>
                  <span className={styles.nodeId}>{leg.id}</span>
                  <span className={styles.nodeClassification}>
                    {leg.classification}
                  </span>
                </div>
                <h3 className={styles.nodeName}>{leg.name}</h3>
                <p className={styles.nodeDescription}>{leg.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionAlt}`}>
        <div className={styles.sectionInner}>
          <h2 className={styles.sectionTitle}>Capabilities</h2>
          <div className={styles.featureList}>
            {features.map((feature) => (
              <div key={feature.title} className={styles.feature}>
                <h4 className={styles.featureTitle}>{feature.title}</h4>
                <p className={styles.featureText}>{feature.text}</p>
              </div>
            ))}
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
