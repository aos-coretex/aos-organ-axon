import { Link } from 'react-router-dom';
import styles from './ProductPage.module.css';

export default function NnetcastPage() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <Link to="/products" className={styles.backLink}>
            &larr; Products
          </Link>
          <p className={styles.eyebrow}>nnetcast</p>
          <h1 className={styles.title}>Coming Soon</h1>
          <p className={styles.subtitle}>
            nnetcast is currently in development as part of the Coretex foundry.
          </p>
        </div>
      </section>

      <section className={styles.ctaSection}>
        <div className={styles.ctaInner}>
          <Link to="/products" className={styles.ctaButton}>
            &larr; Back to Products
          </Link>
        </div>
      </section>
    </div>
  );
}
