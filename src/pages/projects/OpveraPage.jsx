import { Link } from 'react-router-dom';
import styles from './ProductPage.module.css';

const nodes = [
  {
    id: 'Node A',
    name: 'Gateway',
    classification: 'Deterministic',
    description:
      'Classifies user intent before retrieval or routing (intent-first, not RAG-first). Normalizes and forwards to the Orchestrator. No write credentials, no orchestration, no lateral movement.',
  },
  {
    id: 'Node B',
    name: 'Orchestrator / ModelBroker',
    classification: 'Intelligent',
    description:
      'The coordination brain. Plans, drafts Action Proposals, routes LLM inference. Read-only access to the graph for structurally relevant context — replacing flat-document RAG with live relationship queries.',
  },
  {
    id: 'Node G',
    name: 'Judicial / Enforcer',
    classification: 'Deterministic',
    description:
      'The authorization monopoly. Issues scoped, time-bound tokens for write-lane actions. Validates tokens at execution time. The only node with governance-scoped write access to Graphheight.',
  },
  {
    id: 'Node S',
    name: 'Collective Memory',
    classification: 'Deterministic',
    description:
      'System of record. Jobs, append-only ledger, evidence index, and policy bundle distribution. All writes require URN proofs from Graphheight before the operational store accepts them.',
  },
  {
    id: 'Node BOR',
    name: 'Bill of Rights Guardian',
    classification: 'Deterministic / Intelligent',
    description:
      'Enterprise perimeter oracle. Answers exactly one question: "Is this action permitted under the Bill of Rights?" Three determinations: in-scope, out-of-scope, or ambiguous.',
  },
  {
    id: 'Node C / D',
    name: 'Local Inference Pools',
    classification: 'Infrastructure',
    description:
      'OpenAI-compatible inference endpoints. Pool A runs on Apple Silicon (M4 Max). Pool B targets high-capacity GPU (3x RTX 6000). Called only by the ModelBroker — passive sinks with no outbound.',
  },
];

export default function OpveraPage() {
  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <div className={styles.topBarInner}>
          <Link to="/projects" className={styles.backLink}>
            &larr; Projects
          </Link>
        </div>
      </div>

      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.eyebrow} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', letterSpacing: '0', textTransform: 'none', fontSize: '22px', fontWeight: 700, fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", color: '#191919' }}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="28" height="28" rx="6" fill="#191919" />
              <path d="M8 14 L14 8 L20 14 L14 20 Z" fill="none" stroke="#ffffff" strokeWidth="1.8" />
              <circle cx="14" cy="14" r="2.5" fill="#22c55e" />
            </svg>
            <span>opvera.io</span>
          </div>
          <h1 className={styles.title}>Autonomous Corporations</h1>
          <p className={styles.subtitle}>
            Opvera is a governance-first platform for creating and operating
            autonomous corporations — one-step incorporation, graph-locked cap
            tables, vertical plugins, and VA-SSN identity for every actor. All
            orchestrated by a Distributed Intelligence Organism that mechanically
            separates intelligence from authority.
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-md)' }}>
            <Link to="/projects/opvera/website" className={styles.quickNavBtn} style={{ borderRadius: '9999px', fontSize: 'var(--text-xs)' }}>
              Website →
            </Link>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <h2 className={styles.sectionTitle}>Three-Layer Architecture</h2>
          <p className={styles.sectionText}>
            Opvera is a strict three-layer stack. The user interface sits at the
            top, the DIO middleware controls the middle, and Graphheight — a
            distributed graph database — forms the spine. Intelligence is
            mechanically separated from authority: nodes that think cannot
            execute writes, and nodes that execute writes cannot think.
          </p>
          <div className={styles.layers}>
            <div className={styles.layer}>
              <span className={styles.layerLabel}>Top</span>
              <h3 className={styles.layerTitle}>Opvera.io</h3>
              <p className={styles.layerText}>
                User-facing platform. Onboard, create companies, hire agents,
                install plugins, attach listeners.
              </p>
            </div>
            <div className={styles.layer}>
              <span className={styles.layerLabel}>Middle</span>
              <h3 className={styles.layerTitle}>DIO Middleware</h3>
              <p className={styles.layerText}>
                Orchestration, governance enforcement, state management, and
                inference. The control plane that separates intelligence from
                authority.
              </p>
            </div>
            <div className={styles.layer}>
              <span className={styles.layerLabel}>Bottom</span>
              <h3 className={styles.layerTitle}>Graphheight</h3>
              <p className={styles.layerText}>
                Distributed graph database providing typed URNs, SPENT
                semantics, proxy-constrained edges, and Class-Prototype-Instance
                grammar.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionAlt}`}>
        <div className={styles.sectionInner}>
          <h2 className={styles.sectionTitle}>
            The DIO — Distributed Intelligence Organism
          </h2>
          <p className={styles.sectionText}>
            The DIO is the middleware control plane. Every node has a strict
            classification — deterministic or intelligent — and a precisely
            bounded set of permissions. No lateral network movement is allowed
            unless explicitly defined. Ambiguity triggers denial, not permissive
            fallback.
          </p>
          <div className={styles.nodeGrid}>
            {nodes.map((node) => (
              <div key={node.id} className={styles.nodeCard}>
                <div className={styles.nodeHeader}>
                  <span className={styles.nodeId}>{node.id}</span>
                  <span className={styles.nodeClassification}>
                    {node.classification}
                  </span>
                </div>
                <h3 className={styles.nodeName}>{node.name}</h3>
                <p className={styles.nodeDescription}>{node.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <h2 className={styles.sectionTitle}>The Universal Graph</h2>
          <p className={styles.sectionText}>
            At the base of every DIO sits Graphheight and its universal graph —
            uGraph. It connects all components of the system: nodes, governance
            artifacts, tenants, policies, authorization tokens, and
            human-facing content in a single, verifiable structure. Every
            artifact is a URN — a 256-character token instantiated and persisted
            in Graphheight's blockchain.
          </p>
          <div className={styles.featureList}>
            <div className={styles.feature}>
              <h4 className={styles.featureTitle}>Typed URNs</h4>
              <p className={styles.featureText}>
                Every artifact is a 256-character token with canonical payload,
                signature, and nonce/timestamp.
              </p>
            </div>
            <div className={styles.feature}>
              <h4 className={styles.featureTitle}>SPENT Semantics</h4>
              <p className={styles.featureText}>
                One-time-use authorization URNs with on-chain replay protection.
                Once spent, a token can never be reused.
              </p>
            </div>
            <div className={styles.feature}>
              <h4 className={styles.featureTitle}>Symbolic Text Layer</h4>
              <p className={styles.featureText}>
                Human language mapped to URNs — words, sentences, paragraphs
                inherently connected to the graph.
              </p>
            </div>
            <div className={styles.feature}>
              <h4 className={styles.featureTitle}>Constrained Edges</h4>
              <p className={styles.featureText}>
                Edges cannot be created manually. They must satisfy proxy
                constraints enforced by binding services.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionAlt}`}>
        <div className={styles.sectionInner}>
          <h2 className={styles.sectionTitle}>Agent Identity</h2>
          <p className={styles.sectionText}>
            Every agent in Opvera carries a permanent, blockchain-anchored
            identity — an Anchored Persona Token (APT) minted once on
            Graphheight and never changed. The agent's specification evolves
            through a hash-chained version history, but its identity remains
            fixed: a single URN that traces every action, authorization, and
            state transition back to the moment the agent was created.
          </p>
          <div className={styles.nodeGrid}>
            <div className={styles.nodeCard}>
              <h3 className={styles.nodeName}>
                Anchored Persona Tokens (APT)
              </h3>
              <p className={styles.nodeDescription}>
                Identity is separated from state. The Persona URN is minted
                once on Graphheight's blockchain — immutable, globally unique,
                and legally auditable. The agent's specification (skills,
                personality, domain) evolves through a SHA-256 version chain,
                but the URN never changes. John is not a file. John is a token.
              </p>
            </div>
            <div className={styles.nodeCard}>
              <h3 className={styles.nodeName}>
                Human-Embodied Identity Layer
              </h3>
              <p className={styles.nodeDescription}>
                Agents present as embodied employees — a stable name, a rolling
                age, a portrait that evolves over time — built on top of the
                immutable APT. The user experiences a person; the system retains
                a token. Dual age (presented age plus tenure), versioned
                portraits, and strict boundaries ensure trust without deceptive
                anthropomorphism.
              </p>
            </div>
            <div className={styles.nodeCard}>
              <h3 className={styles.nodeName}>
                Tamper-Evident Audit Trail
              </h3>
              <p className={styles.nodeDescription}>
                Every action an agent takes creates an edge from its URN vertex
                in the universal graph — signed, timestamped, and immutable. The
                genesis hash proves today's agent is the same entity created on
                day one. The version chain proves the evolution was continuous.
                No gap in the chain means no disputed identity.
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
