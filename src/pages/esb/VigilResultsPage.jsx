import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSpineEvents } from '../../hooks/useSpineEvents';

export default function VigilResultsPage() {
  const [results, setResults] = useState([]);
  const [healthLog, setHealthLog] = useState([]);
  const [error, setError] = useState(null);
  const { subscribe } = useSpineEvents();

  useEffect(() => {
    fetch('/api/esb/vigil/results').then(r => r.json()).then(d => { setResults(d.results || []); setError(d.error || null); }).catch(e => setError(e.message));
    fetch('/api/esb/vigil/health-log').then(r => r.json()).then(d => setHealthLog(d.log || [])).catch(() => {});
  }, []);

  useEffect(() => subscribe('verification_result', () => {
    fetch('/api/esb/vigil/results').then(r => r.json()).then(d => setResults(d.results || [])).catch(() => {});
  }), [subscribe]);

  const statusIcon = (s) => ({ pass: '#4caf50', fail: '#f44336' }[s] || '#9e9e9e');

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <Link to="/esb" style={{ color: '#8b7355' }}>Back to ESB</Link>
      <h1>Vigil Results</h1>
      {error && <p style={{ color: '#ff9800' }}>Vigil query: {error}</p>}

      <section>
        <h2>Test Results ({results.length})</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead><tr style={{ borderBottom: '1px solid #333' }}>
            <th style={{ textAlign: 'left', padding: 6 }}>Status</th>
            <th style={{ textAlign: 'left', padding: 6 }}>Name</th>
            <th style={{ textAlign: 'left', padding: 6 }}>Group</th>
            <th style={{ textAlign: 'left', padding: 6 }}>Last Run</th>
            <th style={{ textAlign: 'left', padding: 6 }}>Duration</th>
          </tr></thead>
          <tbody>
            {results.map((r, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #222' }}>
                <td style={{ padding: 6 }}><span style={{ color: statusIcon(r.status) }}>{r.status || '-'}</span></td>
                <td style={{ padding: 6 }}>{r.name || r.id}</td>
                <td style={{ padding: 6, color: '#888' }}>{r.group || '-'}</td>
                <td style={{ padding: 6, color: '#666', fontSize: 11 }}>{r.last_run || '-'}</td>
                <td style={{ padding: 6, fontFamily: 'monospace' }}>{r.duration_ms ? `${r.duration_ms}ms` : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {results.length === 0 && <p style={{ color: '#666' }}>No results — Vigil may be unreachable via Spine.</p>}
      </section>

      <section style={{ marginTop: 24 }}>
        <h2>Health Log ({healthLog.length})</h2>
        <div style={{ maxHeight: 300, overflow: 'auto', background: '#111', borderRadius: 8, padding: 12 }}>
          {healthLog.map((e, i) => (
            <div key={i} style={{ padding: '3px 0', borderBottom: '1px solid #1a1a1a', fontSize: 12 }}>
              <span style={{ color: '#666' }}>{e.timestamp}</span>{' '}
              <span style={{ color: e.type === 'organ_disconnected' ? '#f44336' : '#4caf50' }}>{e.type}</span>{' '}
              {e.organ || e.detail || ''}
            </div>
          ))}
          {healthLog.length === 0 && <p style={{ color: '#666' }}>No health log entries.</p>}
        </div>
      </section>
    </div>
  );
}
