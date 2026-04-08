import { Link } from 'react-router-dom';
import styles from './MonadPage.module.css';

const legs = [
  {
    id: 'Leg 1',
    name: 'Radiant',
    classification: 'Abstraction Memory',
    description:
      'Enterprise and platform memory — context blocks, memory blocks, and knowledge fragments stored in PostgreSQL with pgvector embeddings. Autonomous dream cycle consolidates and prunes. Strict, precise, factual.',
    to: '/components/radiant',
    status: 'Active',
  },
  {
    id: 'Leg 2',
    name: 'Graphheight',
    classification: 'Structural Truth',
    description:
      'The universal graph — typed URNs, class bindings, composition edges, and blockchain-anchored identity. Ground truth that cannot be overridden by inference. The skeleton the other legs hang from.',
    to: '/components/graphheight',
    status: 'In Development',
  },
  {
    id: 'Leg 3',
    name: 'Minder',
    classification: 'Person Memory',
    description:
      'Models humans and AI personas through an observer/observed paradigm. A three-stage pipeline — Deriver, Dreamer, Dialectic — builds layered understanding of people over time. Opinionated, interpretive.',
    to: '/components/minder',
    status: 'Active',
  },
];

const principles = [
  {
    title: 'Never Merge Legs',
    text: 'Enterprise abstractions, structural truth, and person understanding are categorically different. The industry\'s structural error is treating AI memory as a single block. The Monad keeps them permanently separated.',
  },
  {
    title: 'Y Combinator',
    text: 'Unidirectional correction bridge — Graphheight structural facts correct Minder inferences, never the reverse. Opinions cannot override facts. The graph is the arbiter.',
  },
  {
    title: 'Independent Dream Systems',
    text: 'Radiant dreams are strict and factual (daily 4:27 AM). Minder dreams are interpretive and opinionated (daily 6:30 AM). Each leg consolidates memory according to its own character — no shared dreamer.',
  },
  {
    title: 'Graph-Native Throughout',
    text: 'URN primary keys, binding edges, and concept vertices — from Minder\'s person models to Radiant\'s knowledge blocks. Every leg is built for Graphheight migration from day one.',
  },
];

const yCombinatorLayers = [
  {
    label: 'Source',
    title: 'Graphheight',
    text: 'Structural facts — what things are, how they connect, what is provably true. The universal graph.',
  },
  {
    label: 'Direction',
    title: 'One-Way Correction',
    text: 'Facts correct inferences. Inferences never modify facts. Ambiguity triggers review, not silent override.',
  },
  {
    label: 'Target',
    title: 'Minder',
    text: 'Person models — interpretive, opinionated, built from observations. Grounded by structural truth.',
  },
];

export default function MonadPage() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <Link to="/components" className={styles.backLink}>&larr; Components</Link>
          <h1 className={styles.title}>Monad</h1>
          <p className={styles.subtitle}>
            Three memory systems, one correction path. Facts override inference, never the reverse.
          </p>
        </div>
      </section>

      {/* Leg cards */}
      <section className={styles.grid}>
        <div className={styles.gridInner}>
          {legs.map((leg) => (
            <Link key={leg.id} to={leg.to} className={styles.card}>
              <div className={styles.cardHeader}>
                <span className={styles.cardLabel}>{leg.id}</span>
                <span className={styles.cardStatus}>{leg.status}</span>
              </div>
              <h2 className={styles.cardName}>{leg.name}</h2>
              <p className={styles.cardClassification}>{leg.classification}</p>
              <p className={styles.cardDescription}>{leg.description}</p>
              <span className={styles.cardButton}>Open</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Cross-cutting tools */}
      <section className={styles.toolStrip}>
        <div className={styles.toolStripInner}>
          <Link to="/components/monad/lobe" className={styles.toolLink}>
            <span className={styles.toolName}>Lobe</span>
            <span className={styles.toolDescription}>Event-driven interpretation pipeline routing events to all three Monad legs.</span>
            <span className={styles.cardButton}>Open</span>
          </Link>
        </div>
      </section>

      {/* The Triad */}
      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <h2 className={styles.sectionTitle}>The Triad</h2>
          <p className={styles.sectionText}>
            Memory without structural truth is unanchored. The Monad separates
            what agents know (Radiant), what things are (Graphheight), and who
            people are (Minder) — then enforces a directional correction path
            so inference never overrides fact.
          </p>
        </div>
      </section>

      {/* Design Principles */}
      <section className={`${styles.section} ${styles.sectionAlt}`}>
        <div className={styles.sectionInner}>
          <h2 className={styles.sectionTitle}>Design Principles</h2>
          <div className={styles.principleGrid}>
            {principles.map((p) => (
              <div key={p.title} className={styles.principleCard}>
                <h4 className={styles.principleTitle}>{p.title}</h4>
                <p className={styles.principleText}>{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Y Combinator */}
      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <h2 className={styles.sectionTitle}>The Y Combinator</h2>
          <p className={styles.sectionText}>
            The Y Combinator is the Monad&apos;s structural guarantee. When
            Minder infers something about a person that contradicts what
            Graphheight knows to be structurally true, the inference is revised.
            The correction is always unidirectional: facts flow from Graphheight
            to Minder, never the reverse.
          </p>
          <div className={styles.layerStack}>
            {yCombinatorLayers.map((layer, i) => (
              <div key={layer.label}>
                <div className={styles.layerCard}>
                  <span className={styles.layerLabel}>{layer.label}</span>
                  <h3 className={styles.layerTitle}>{layer.title}</h3>
                  <p className={styles.layerText}>{layer.text}</p>
                </div>
                {i < yCombinatorLayers.length - 1 && (
                  <div className={styles.layerArrow}>&darr;</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
