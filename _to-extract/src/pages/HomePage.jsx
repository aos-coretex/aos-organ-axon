import { Link } from 'react-router-dom';
import styles from './HomePage.module.css';

const pillars = [
  {
    code: 'A2A',
    title: 'Agentic Autonomous',
    description:
      'Agents that operate independently — creating corporations, governing assets, and closing transactions without a human in the loop. Autonomy backed by structural guarantees, not trust.',
    products: [
      { name: 'Opvera', to: '/projects/opvera' },
      { name: 'Sentience', to: '/projects/sentience' },
    ],
  },
  {
    code: 'A2H',
    title: 'Agentic Social',
    description:
      'Agents you know by role, talk to by name, and trust with the day-to-day. Persistent virtual employees with identity, history, and accountability — the interface disappears, the relationship remains.',
    products: [
      { name: 'Vivan', to: '/projects/vivan' },
    ],
  },
  {
    code: 'A2B',
    title: 'Agentic Infra',
    description:
      'The hardware, software, and network layer for agentic commerce. Secure edge nodes, local graph engines, and zero-trust routing that let agents transact with businesses on the physical network.',
    products: [
      { name: 'blubox', to: '/projects/blubox' },
      { name: 'nnetcast', to: '/projects/nnetcast' },
    ],
  },
];

export default function HomePage() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <video
          className={styles.heroBgVideo}
          src="/assets/hero-bg.mp4"
          autoPlay
          loop
          muted
          playsInline
        />
        <div className={styles.heroBgOverlay} />
        <div className={styles.heroInner}>
          <h1 className={styles.title}>
            Systems built <em>for</em> agents.
          </h1>
          <p className={styles.subtitle}>
            Coretex is an agentic foundry<br />
            It builds systems designed to be operated by agents, not humans.
          </p>
        </div>
      </section>

      <section className={styles.moat}>
        <div className={styles.sectionInner}>
          <h2 className={styles.sectionTitle}>Three Surfaces of Operation</h2>
          <p className={styles.sectionDescription}>
            Every system produced by the foundry operates across three
            interaction surfaces — autonomous, infrastructure, and social —
            each designed for the entity on the other side
            of the transaction.
          </p>
          <div className={styles.pillars}>
            {pillars.map((pillar) => (
              <div key={pillar.code} className={styles.pillar}>
                <span className={styles.pillarTag}>{pillar.code}</span>
                <h3 className={styles.pillarTitle}>{pillar.title}</h3>
                <p className={styles.pillarDescription}>
                  {pillar.description}
                </p>
                <div className={styles.pillarProducts}>
                  {pillar.products.map((p) => (
                    <Link
                      key={p.name}
                      to={p.to}
                      className={styles.productPill}
                    >
                      {p.name}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.goat}>
        <div className={styles.sectionInner}>
          <p className={styles.goatLead}>
            The foundry is not just <em>for</em> agents — it is operated{' '}
            <em>by</em> agents. Interconnected knowledge bases, deep
            situational awareness, and structured memory ensure
            production-grade output from the outset.
          </p>
          <div className={styles.capabilities}>
            <div className={styles.capability}>
              <h4 className={styles.capabilityTitle}>Powered by Graphheight&#8482;</h4>
              <p className={styles.capabilityText}>
                All structural data lives in Graphheight, a graph-native
                multidimensional token space — concepts and bindings that
                agents query, traverse, and extend autonomously. The same
                secure token environment lets agents close real
                transactions — payments, contracts, procurement, licensing,
                and settlement — with verifiable, tamper-proof integrity
                end to end.
              </p>
              <div className={styles.capabilityProducts}>
                <Link to="/components/graphheight" className={styles.productPill}>Graphheight</Link>
              </div>
            </div>
            <div className={styles.capability}>
              <h4 className={styles.capabilityTitle}>Powered by Monad</h4>
              <p className={styles.capabilityText}>
                Three systems, one substrate. Radiant holds platform
                memory and context, Minder holds person understanding,
                and Graphheight binds them into a universal graph.
                Nightly dream cycles consolidate what matters and let
                stale knowledge fade — agents wake sharp, contextual,
                and free of drift.
              </p>
              <div className={styles.capabilityProducts}>
                <Link to="/components/monad" className={styles.productPill}>Monad</Link>
              </div>
            </div>
            <div className={styles.capability}>
              <h4 className={styles.capabilityTitle}>Powered by Syntra</h4>
              <p className={styles.capabilityText}>
                An intelligent merge between retrieval-augmented generation
                and the Graphheight&#8482; universal graph. Graphheight UUIDs
                embedded in every document unify structured and unstructured
                knowledge — agents retrieve content and traverse the graph
                in a single operation.
              </p>
              <div className={styles.capabilityProducts}>
                <Link to="/components/syntra" className={styles.productPill}>Syntra</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
