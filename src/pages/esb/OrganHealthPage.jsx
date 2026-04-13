import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useSpineEvents } from '../../hooks/useSpineEvents';

export default function OrganHealthPage() {
  const [organs, setOrgans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { subscribe } = useSpineEvents();

  const fetchHealth = useCallback(async () => {
    try {
      const res = await fetch('/api/esb/organs/health');
      const data = await res.json();
      setOrgans(data.organs || []);
      setError(data.error || null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchHealth(); }, [fetchHealth]);
  useEffect(() => {
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, [fetchHealth]);
  useEffect(() => subscribe('organ_health', fetchHealth), [subscribe, fetchHealth]);

  const statusColor = (s) => ({ ok: '#4caf50', alive: '#4caf50', degraded: '#ff9800', disconnected: '#f44336', unreachable: '#9e9e9e', error: '#f44336' }[s] || '#9e9e9e');

  if (loading) return <div style={{ padding: 24 }}>Loading organ health...</div>;

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <Link to="/esb" style={{ color: '#8b7355' }}>Back to ESB</Link>
      <h1>Organ Health Dashboard</h1>
      <p>{organs.length} organs | {organs.filter(o => o.status === 'ok' || o.status === 'alive').length} healthy</p>
      {error && <p style={{ color: '#f44336' }}>Warning: {error}</p>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12, marginTop: 16 }}>
        {organs.map((o) => (
          <div key={o.name} style={{ border: '1px solid #333', borderRadius: 8, padding: 12, background: '#1a1a1a' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong>{o.name}</strong>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: statusColor(o.status), display: 'inline-block' }} />
            </div>
            <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>{o.status}{o.connected ? ' (connected)' : ''}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
