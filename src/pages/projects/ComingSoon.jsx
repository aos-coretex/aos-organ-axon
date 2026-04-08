import { Link } from 'react-router-dom';
import styles from './ComingSoon.module.css';

export default function ComingSoon() {
  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <h1 className={styles.title}>Coming soon.</h1>
        <p className={styles.text}>
          Opvera is in active development. This experience is not yet available.
        </p>
        <Link to="/projects/opvera/website" className={styles.back}>
          &larr; Back
        </Link>
      </div>
    </div>
  );
}
