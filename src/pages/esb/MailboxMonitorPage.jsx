import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function MailboxMonitorPage() {
  const [mailboxes, setMailboxes] = useState([]);
  const [totalDepth, setTotalDepth] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/esb/spine/mailboxes');
        const data = await res.json();
        setMailboxes(data.mailboxes || []);
        setTotalDepth(data.total_depth || 0);
      } catch { /* degrade gracefully */ }
      setLoading(false);
    };
    load();
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, []);

  const maxDepth = Math.max(1, ...mailboxes.map(m => m.depth));

  if (loading) return <div style={{ padding: 24 }}>Loading mailbox data...</div>;

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <Link to="/esb" style={{ color: '#8b7355' }}>Back to ESB</Link>
      <h1>Spine Mailbox Monitor</h1>
      <p>Total depth: {totalDepth} | {mailboxes.length} mailboxes</p>

      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 16 }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #333' }}>
            <th style={{ textAlign: 'left', padding: 8 }}>Organ</th>
            <th style={{ textAlign: 'left', padding: 8 }}>Depth</th>
            <th style={{ textAlign: 'left', padding: 8, width: '50%' }}>Bar</th>
            <th style={{ textAlign: 'left', padding: 8 }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {mailboxes.sort((a, b) => b.depth - a.depth).map((m) => (
            <tr key={m.organ_name} style={{ borderBottom: '1px solid #222' }}>
              <td style={{ padding: 8 }}>{m.organ_name}</td>
              <td style={{ padding: 8, fontFamily: 'monospace', color: m.depth > 0 ? '#ff9800' : '#4caf50' }}>{m.depth}</td>
              <td style={{ padding: 8 }}>
                <div style={{ background: '#222', borderRadius: 4, height: 16, width: '100%' }}>
                  <div style={{ background: m.depth > 0 ? '#ff9800' : '#4caf50', borderRadius: 4, height: 16, width: `${(m.depth / maxDepth) * 100}%`, minWidth: m.depth > 0 ? 4 : 0 }} />
                </div>
              </td>
              <td style={{ padding: 8, color: '#888', fontSize: 12 }}>{m.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
