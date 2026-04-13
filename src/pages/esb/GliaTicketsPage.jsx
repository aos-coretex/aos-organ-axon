import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSpineEvents } from '../../hooks/useSpineEvents';

export default function GliaTicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [error, setError] = useState(null);
  const { subscribe } = useSpineEvents();

  const load = async () => {
    try {
      const res = await fetch('/api/esb/glia/tickets');
      const data = await res.json();
      setTickets(data.tickets || []);
      setError(data.error || null);
    } catch (e) { setError(e.message); }
  };

  useEffect(() => { load(); }, []);
  useEffect(() => subscribe('autoheal_ticket_update', load), [subscribe]);

  const statusColor = { open: '#ff9800', resolved: '#4caf50', failed: '#f44336', investigating: '#2196f3' };

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <Link to="/esb" style={{ color: '#8b7355' }}>Back to ESB</Link>
      <h1>Glia Tickets</h1>
      {error && <p style={{ color: '#ff9800' }}>Glia query: {error}</p>}

      <div style={{ display: 'flex', gap: 16, marginTop: 16, marginBottom: 16 }}>
        {['open', 'investigating', 'resolved', 'failed'].map(s => (
          <div key={s} style={{ background: '#1a1a1a', borderRadius: 8, padding: '8px 16px' }}>
            <span style={{ color: statusColor[s], fontWeight: 'bold' }}>{tickets.filter(t => t.status === s).length}</span>
            <span style={{ color: '#888', marginLeft: 6, fontSize: 12 }}>{s}</span>
          </div>
        ))}
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead><tr style={{ borderBottom: '1px solid #333' }}>
          <th style={{ textAlign: 'left', padding: 6 }}>Status</th>
          <th style={{ textAlign: 'left', padding: 6 }}>Type</th>
          <th style={{ textAlign: 'left', padding: 6 }}>Organ</th>
          <th style={{ textAlign: 'left', padding: 6 }}>Description</th>
          <th style={{ textAlign: 'left', padding: 6 }}>Attempts</th>
          <th style={{ textAlign: 'left', padding: 6 }}>Created</th>
        </tr></thead>
        <tbody>
          {tickets.map((t, i) => (
            <tr key={i} style={{ borderBottom: '1px solid #222' }}>
              <td style={{ padding: 6, color: statusColor[t.status] || '#888' }}>{t.status}</td>
              <td style={{ padding: 6 }}>{t.type || '-'}</td>
              <td style={{ padding: 6 }}>{t.organ || '-'}</td>
              <td style={{ padding: 6, maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.description || '-'}</td>
              <td style={{ padding: 6, fontFamily: 'monospace' }}>{t.attempts ?? '-'}</td>
              <td style={{ padding: 6, color: '#666', fontSize: 11 }}>{t.created || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {tickets.length === 0 && <p style={{ color: '#666' }}>No tickets — Glia may be unreachable via Spine.</p>}
    </div>
  );
}
