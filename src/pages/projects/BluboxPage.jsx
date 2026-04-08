import { Link } from 'react-router-dom';
import styles from './ProductPage.module.css';

const coreFunctions = [
  {
    title: 'The Local Librarian',
    description:
      'Scans local assets — a store\'s inventory, a business\'s files — and translates them into a localized, multidimensional graph format optimized strictly for agent parsing.',
  },
  {
    title: 'Hardware-Enforced Air Gapping',
    description:
      'The agent\'s file system and operating space are physically isolated from the human user\'s personal or business data. No shared filesystem, no cross-contamination.',
  },
  {
    title: 'Local Network Authority',
    description:
      'Placed physically on the LAN, the appliance interfaces with local hardware — credit card readers, IoT devices — bypassing the complexities of external cloud NAT/firewall traversal.',
  },
  {
    title: 'Agent-to-Agent Bridge',
    description:
      'Exposes a secure, standardized protocol for external agents to query the internal graph and execute transactions. The local gateway to machine-to-machine commerce.',
  },
];

export default function BluboxPage() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <Link to="/projects" className={styles.backLink}>
            &larr; All Projects
          </Link>
          <p className={styles.eyebrow}>blubox.ai</p>
          <h1 className={styles.title}>Edge Agent Appliance</h1>
          <p className={styles.subtitle}>
            The current paradigm of treating AI agents as stateless, ephemeral
            scripts dropped into human-optimized environments is fundamentally
            flawed. blubox is a Hardware-as-a-Service edge node that provides
            a hardware-secured, curated enclave — bridging the chaotic human
            internet and the deterministic agent protocol.
          </p>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <h2 className={styles.sectionTitle}>The Problem</h2>
          <div className={styles.featureList}>
            <div className={styles.feature}>
              <h4 className={styles.featureTitle}>Unstructured Environments</h4>
              <p className={styles.featureText}>
                Agents perform poorly when relying on vector search in
                uncurated, human-readable directories. Without a
                machine-readable, schema-driven environment, agents expend their
                compute budget on disambiguation.
              </p>
            </div>
            <div className={styles.feature}>
              <h4 className={styles.featureTitle}>No Knowledge Graph</h4>
              <p className={styles.featureText}>
                Context window memory and standard RAG provide fragments, not
                relationships. Without an interconnected knowledge graph, an
                agent lacks a functional world model.
              </p>
            </div>
            <div className={styles.feature}>
              <h4 className={styles.featureTitle}>Agents as Sub-Processes</h4>
              <p className={styles.featureText}>
                Current agents evaporate when their underlying process dies.
                They must be persistent identities with cryptographic anchoring,
                cross-process continuity, and absolute auditability.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionAlt}`}>
        <div className={styles.sectionInner}>
          <h2 className={styles.sectionTitle}>Core Functions</h2>
          <p className={styles.sectionText}>
            The Edge Agent Appliance is a localized, secure node operating
            alongside the user's primary environment — a dedicated
            ingress/egress controller for agentic operations.
          </p>
          <div className={styles.nodeGrid}>
            {coreFunctions.map((fn) => (
              <div key={fn.title} className={styles.nodeCard}>
                <h3 className={styles.nodeName}>{fn.title}</h3>
                <p className={styles.nodeDescription}>{fn.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <h2 className={styles.sectionTitle}>Zero-Touch Provisioning</h2>
          <p className={styles.sectionText}>
            To achieve mass-market viability, blubox adopts a strict consumer
            appliance abstraction. No localized system administration, no
            monitor outputs, no OS configuration. Plug it in, scan the QR
            code, and the appliance is live.
          </p>
          <div className={styles.featureList}>
            <div className={styles.feature}>
              <h4 className={styles.featureTitle}>Headless Architecture</h4>
              <p className={styles.featureText}>
                No local user interface. A companion mobile app interfaces with
                the cloud control plane, which establishes a secure reverse
                tunnel to the local node.
              </p>
            </div>
            <div className={styles.feature}>
              <h4 className={styles.featureTitle}>Immutable Infrastructure</h4>
              <p className={styles.featureText}>
                A/B boot partitions with automatic rollback. OTA updates write
                to an inactive partition — if the update fails, the appliance
                reboots into the previous stable partition automatically.
              </p>
            </div>
            <div className={styles.feature}>
              <h4 className={styles.featureTitle}>Commodity Replacement</h4>
              <p className={styles.featureText}>
                Hardware is disposable compute. If a unit fails, a replacement
                is overnighted. Scan the new QR code and the cloud control
                plane re-syncs encrypted state within minutes.
              </p>
            </div>
            <div className={styles.feature}>
              <h4 className={styles.featureTitle}>Local Trust Anchor</h4>
              <p className={styles.featureText}>
                A closed physical appliance model ensures external agents can
                trust the provenance of data. Hosted inventory, legal files,
                and transaction ledgers are pristine and cryptographically
                signed.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionAlt}`}>
        <div className={styles.sectionInner}>
          <h2 className={styles.sectionTitle}>
            The Square Reader of Agentic Commerce
          </h2>
          <p className={styles.sectionText}>
            Just as Square abstracted the complexity of legacy merchant banking
            into a simple piece of plastic, blubox abstracts localized graph
            databases, Zero-Trust network routing, and cryptographic identity
            generation into a plug-and-play node.
          </p>
          <p className={styles.sectionText}>
            The end user — the baker, the attorney, the storefront owner — does
            not need to understand multidimensional token spaces or Erlang
            concurrency. They only need to understand the proposition: plugging
            in this box allows external AI agents to safely transact with their
            business, with verifiable accuracy, without compromising their
            private network.
          </p>
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
