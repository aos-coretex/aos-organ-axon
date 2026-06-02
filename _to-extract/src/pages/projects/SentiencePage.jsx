import { Link } from 'react-router-dom';
import styles from './ProductPage.module.css';

const pillars = [
  {
    title: 'Hash DNA',
    description:
      'A cryptographic hash — a unique digital fingerprint — is generated from a high-fidelity scan of the physical artifact. This hash becomes the token\'s DNA, permanently anchoring it to the specific real-world object it represents. Deterministic, collision-resistant, and one-way.',
  },
  {
    title: 'Blockchain Persistence',
    description:
      'The token containing the Hash DNA is recorded on an immutable, time-stamped, decentralized ledger. Every subsequent transaction is permanent, transparent to authorized parties, and resistant to tampering. The result is a shared, single source of truth.',
  },
  {
    title: 'The Asset Graph',
    description:
      'An asset\'s entire legal lifecycle — from initial issuance to subsequent encumbrances like mortgages, liens, and insurance — is represented by a graph of distinct but cryptographically linked tokens. A title search becomes an instantaneous, automated query.',
  },
];

export default function SentiencePage() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <Link to="/projects" className={styles.backLink}>
            &larr; All Projects
          </Link>
          <p className={styles.eyebrow}>Sentience</p>
          <h1 className={styles.title}>The Digital Alter-Ego</h1>
          <p className={styles.subtitle}>
            A legal abstraction — a corporate share, a deed to real property, a
            contractual obligation — when tokenized according to a specific
            architecture, is not a mere representation of the underlying right.
            It becomes the most secure, reliable, and legally cognizable
            embodiment of that right.
          </p>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <h2 className={styles.sectionTitle}>Three Pillars of Veracity</h2>
          <p className={styles.sectionText}>
            The system is built on three integrated technological guarantees
            that, together, create a system of unimpeachable veracity —
            replacing trust in fallible intermediaries with verifiable,
            mathematical proof.
          </p>
          <div className={styles.nodeGrid}>
            {pillars.map((pillar) => (
              <div key={pillar.title} className={styles.nodeCard}>
                <h3 className={styles.nodeName}>{pillar.title}</h3>
                <p className={styles.nodeDescription}>{pillar.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionAlt}`}>
        <div className={styles.sectionInner}>
          <h2 className={styles.sectionTitle}>Legal Foundation</h2>
          <p className={styles.sectionText}>
            The argument does not require novel legal theories. The E-SIGN Act
            and UETA have established technology-neutral principles for over
            two decades: a record may not be denied legal effect solely because
            it is electronic. A signature may not be denied validity solely
            because it is electronic.
          </p>
          <div className={styles.featureList}>
            <div className={styles.feature}>
              <h4 className={styles.featureTitle}>Functional Equivalence</h4>
              <p className={styles.featureText}>
                Legal rules should focus on the underlying purpose of
                traditional requirements, not the specific form. If an
                electronic process reliably performs the same functions, it
                merits the same legal status.
              </p>
            </div>
            <div className={styles.feature}>
              <h4 className={styles.featureTitle}>
                Cryptographic Signatures as Legal Acts
              </h4>
              <p className={styles.featureText}>
                The affirmative act of employing a private key to sign and
                broadcast a transaction constitutes a clear, deliberate
                demonstration of intent to be bound — the digital equivalent of
                putting pen to paper.
              </p>
            </div>
            <div className={styles.feature}>
              <h4 className={styles.featureTitle}>
                Automated Chain of Custody
              </h4>
              <p className={styles.featureText}>
                Every transfer is permanently recorded in a time-stamped block.
                Each transaction must be cryptographically signed. The chain of
                custody becomes an intrinsic property of the evidence itself.
              </p>
            </div>
            <div className={styles.feature}>
              <h4 className={styles.featureTitle}>The Secure Bearer Instrument</h4>
              <p className={styles.featureText}>
                A digital token controlled by a cryptographic private key is the
                modern, superior bearer instrument — combining the directness
                of physical possession with the traceability and security of
                strong cryptography.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <h2 className={styles.sectionTitle}>Legislative Precedent</h2>
          <p className={styles.sectionText}>
            The path toward recognition is already underway. Wyoming has created
            a comprehensive legal framework classifying digital assets as
            intangible personal property under the UCC. Delaware has authorized
            blockchain technology for maintaining core corporate records,
            including the official stock ledger — a direct response to the
            systemic failures of intermediated "street name" ownership.
          </p>
          <div className={styles.layers}>
            <div className={styles.layer}>
              <span className={styles.layerLabel}>Wyoming</span>
              <h3 className={styles.layerTitle}>
                Digital Asset Property Framework
              </h3>
              <p className={styles.layerText}>
                Classifies digital assets as property. Integrates into the UCC.
                Allows perfection of security interests through cryptographic
                control. Authorizes DAO LLCs.
              </p>
            </div>
            <div className={styles.layer}>
              <span className={styles.layerLabel}>Delaware</span>
              <h3 className={styles.layerTitle}>
                Blockchain Corporate Records
              </h3>
              <p className={styles.layerText}>
                Permits distributed ledger technology for corporate records and
                stock ledgers. Redefines statutory language to accommodate
                decentralized networks.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionAlt}`}>
        <div className={styles.sectionInner}>
          <h2 className={styles.sectionTitle}>The Alter-Ego Argument</h2>
          <p className={styles.sectionText}>
            The token is not merely a record of an asset — it is the most
            secure, efficient, and legally sound manifestation of the asset's
            legal status. A graph of interconnected tokens represents the
            complete legal reality: deed, mortgage, lien, easement, insurance
            — each independently enforceable, cryptographically linked, and
            instantly verifiable.
          </p>
          <p className={styles.sectionText}>
            This is not a request to create new law. It is a demonstration
            that existing law, when applied to this superior technology, leads
            to an inescapable and beneficial conclusion: the digital token is
            the legal alter-ego of the asset it represents.
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
