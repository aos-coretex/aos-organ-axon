import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import EnvironmentBanner from './EnvironmentBanner';
import styles from './Layout.module.css';

export default function Layout() {
  return (
    <div className={styles.layout}>
      <EnvironmentBanner />
      <Header />
      <main className={styles.main}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
