import { useState, useEffect } from 'react';

export default function EnvironmentBanner() {
  const [tier, setTier] = useState(null);
  const port = window.location.port || (window.location.protocol === 'https:' ? '443' : '80');

  useEffect(() => {
    fetch('/api/config')
      .then(res => res.json())
      .then(data => {
        setTier(data.tier);
      })
      .catch(() => {
        // If API unreachable but port indicates dev, show banner anyway
        const p = window.location.port;
        if (p === '4050' || p === '4051') setTier('aos-src');
      });
  }, []);

  if (!tier || tier === 'saas') return null;

  return (
    <div style={{
      background: '#c0392b',
      color: '#fff',
      textAlign: 'center',
      padding: '6px 0',
      fontSize: '13px',
      fontWeight: 600,
      letterSpacing: '0.5px',
      fontFamily: 'Inter, system-ui, sans-serif',
      zIndex: 9999,
    }}>
      DEVELOPMENT — {tier === 'aos-rtime' ? 'AOS Runtime' : tier === 'aos-src' ? 'AOS Source' : 'AOS'} (port {port})
    </div>
  );
}
