import { Link } from 'react-router-dom';
import styles from './ControlPage.module.css';

const surfaces = [
  {
    slug: 'commands',
    name: 'Command Surface',
    description:
      'Browse, search, and dispatch skills, commands, and personas. The operational console for everything the platform can do.',
  },
  {
    slug: 'vigil',
    name: 'Vigil Monitoring',
    description:
      'Platform health at a glance — Vigil verification across all component groups, freshness tracking, and on-demand test execution.',
  },
];

const tools = [
  {
    slug: 'lobe',
    name: 'Lobe',
    to: '/components/monad/lobe',
    description: 'Event-driven interpretation pipeline — operational, security, and memory events routed to Radiant, Minder, and the graph.',
  },
  {
    slug: 'spine-activity',
    name: 'Spine Activity',
    to: '/activity/spine',
    description: 'Live consumer connections and event traffic through Spine. Visual topology with real-time flow indicators.',
  },
];

export default function ControlPage() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <h1 className={styles.title}>Coretex Agentic Platform Control</h1>
          <p className={styles.subtitle}>
            Command and observability surfaces for the Coretex platform.
          </p>
        </div>
      </section>

      <section className={styles.grid}>
        <div className={styles.gridInner}>
          {surfaces.map((surface) => (
            <Link
              key={surface.slug}
              to={`/control/${surface.slug}`}
              className={styles.card}
            >
              <h2 className={styles.cardName}>{surface.name}</h2>
              <p className={styles.cardDescription}>{surface.description}</p>
              <span className={styles.cardButton}>Open</span>
            </Link>
          ))}
          {tools.map((tool) => (
            <Link
              key={tool.slug}
              to={tool.to}
              className={styles.card}
            >
              <h2 className={styles.cardName}>{tool.name}</h2>
              <p className={styles.cardDescription}>{tool.description}</p>
              <span className={styles.cardButton}>Open</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
