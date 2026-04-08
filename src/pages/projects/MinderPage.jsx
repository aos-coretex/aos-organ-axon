import { Link } from 'react-router-dom';
import styles from './ProductPage.module.css';

const pipeline = [
  {
    id: 'Stage 1',
    name: 'Deriver',
    classification: 'Real-time',
    description:
      'Processes raw session data as it arrives. Extracts observations about the person — preferences, patterns, stated facts — and writes them to the observation store. No interpretation, just extraction.',
  },
  {
    id: 'Stage 2',
    name: 'Dreamer',
    classification: 'Background',
    description:
      'Runs offline on accumulated observations. Builds layered person models through synthesis — connecting dots across sessions, identifying evolving patterns, resolving contradictions. The interpretive engine.',
  },
  {
    id: 'Stage 3',
    name: 'Dialectic',
    classification: 'Correction',
    description:
      'The Y Combinator in action. Graphheight structural facts challenge and correct Minder inferences. A person model that contradicts ground truth is revised — never the reverse. Ensures interpretive memory stays grounded.',
  },
];

const features = [
  {
    title: 'Observer / Observed Paradigm',
    text: 'Every person model is scoped to an observer. What Radiant knows about Leon is different from what Minder-persona-X knows. Context is always relational, never absolute.',
  },
  {
    title: 'Humans & Personas',
    text: 'Models both real humans and AI personas with the same data structures. A persona can remember a human, and a human can be remembered differently by different observers.',
  },
  {
    title: 'Python End-to-End',
    text: 'Clean-room Python implementation — MCP server, database migrations, pipeline stages, and embedding integration. Separate PostgreSQL database on the same engine as Radiant.',
  },
  {
    title: 'MCP Interface',
    text: 'Fourteen tools exposed via stdio MCP server: session management, message capture, observation storage, person model queries, collection management, and pipeline control.',
  },
];

export default function MinderPage() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <Link to="/projects" className={styles.backLink}>
            &larr; All Projects
          </Link>
          <p className={styles.eyebrow}>Monad — Leg 3</p>
          <h1 className={styles.title}>
            Person Memory for Humans &amp; Personas
          </h1>
          <p className={styles.subtitle}>
            Minder is the person memory system — the third leg of the Monad. It
            models humans and AI personas through an observer/observed paradigm,
            building layered understanding over time through a three-stage
            pipeline.
          </p>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <h2 className={styles.sectionTitle}>Three-Stage Pipeline</h2>
          <p className={styles.sectionText}>
            Minder processes person data through three distinct stages — each
            with a different temporal character and a different relationship to
            truth. Raw observations flow in real-time, synthesis happens in the
            background, and correction is structurally enforced.
          </p>
          <div className={styles.nodeGrid}>
            {pipeline.map((stage) => (
              <div key={stage.id} className={styles.nodeCard}>
                <div className={styles.nodeHeader}>
                  <span className={styles.nodeId}>{stage.id}</span>
                  <span className={styles.nodeClassification}>
                    {stage.classification}
                  </span>
                </div>
                <h3 className={styles.nodeName}>{stage.name}</h3>
                <p className={styles.nodeDescription}>{stage.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionAlt}`}>
        <div className={styles.sectionInner}>
          <h2 className={styles.sectionTitle}>Architecture</h2>
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
