import { Link } from 'react-router-dom';
import styles from './ComponentsPage.module.css';

const components = [
  {
    name: 'Graphheight',
    to: '/components/graphheight',
    description:
      'The universal graph \u2014 typed URNs, class bindings, composition edges, and blockchain-anchored identity. Ground truth that cannot be overridden by inference. The structural substrate the entire platform hangs from.',
    badge: 'Leg 2',
  },
  {
    name: 'Monad',
    to: '/components/monad',
    description:
      'The triad \u2014 Radiant, Graphheight, and Minder bound into a single coherent substrate. Platform memory, structural truth, and person understanding operating as one system.',
    badge: 'Triad',
  },
  {
    name: 'Radiant',
    to: '/components/radiant',
    description:
      'Platform memory and context. Knowledge blocks, dream cycles, and boot cache generation. The single source of truth for what the platform knows and remembers.',
    badge: 'Leg 1',
  },
  {
    name: 'Minder',
    to: '/components/minder',
    description:
      'Person memory. Observations, deductions, inductions, contradiction detection, and biographical person cards. The system that understands people.',
    badge: 'Leg 3',
  },
  {
    name: 'Syntra',
    to: '/components/syntra',
    description:
      'The intelligent merge between retrieval-augmented generation and the Graphheight\u2122 universal graph. UUID-embedded documents unify structured and unstructured knowledge in a single retrieval path.',
    badge: 'New',
  },
  {
    name: 'Spine',
    to: '/components/spine',
    description:
      'Coretex Agentic Event Bus \u2014 the global event routing primitive. All platform events flow through Spine; consumers like the Memory Capture Bus and Autoheal subscribe to filtered event streams.',
    badge: 'Bus',
  },
  {
    name: 'Autoheal',
    to: '/components/autoheal',
    description:
      'Intelligent self-repair pipeline. Three layers \u2014 strict-dispatcher, smart-dispatcher, and auto-heal executor \u2014 process CV failures as tickets with human escalation for architectural issues.',
    badge: 'Ops',
  },
];

export default function ComponentsPage() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <h1 className={styles.title}>Coretex Agentic Platform Components</h1>
          <p className={styles.subtitle}>
            The foundry infrastructure that powers agent intelligence,
            memory, and structural truth.
          </p>
        </div>
      </section>

      <section className={styles.grid}>
        <div className={styles.gridInner}>
          {components.map((component) => (
            <Link
              key={component.name}
              to={component.to}
              className={styles.card}
            >
              <h2 className={styles.cardName}>{component.name}</h2>
              <p className={styles.cardDescription}>{component.description}</p>
              <span className={styles.cardButton}>Open</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
