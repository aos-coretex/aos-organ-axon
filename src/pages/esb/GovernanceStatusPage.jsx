import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSpineEvents } from '../../hooks/useSpineEvents';

export default function GovernanceStatusPage() {
  const [governance, setGovernance] = useState(null);
  const [error, setError] = useState(null);
  const { subscribe } = useSpineEvents();

  const load = async () => {
    try {
      const res = await fetch('/api/esb/governance/status');
      const data = await res.json();
      setGovernance(data.governance || null);
      setError(data.error || null);
    } catch (e) { setError(e.message); }
  };

  useEffect(() => { load(); }, []);
  useEffect(() => subscribe('governance_version_activated', load), [subscribe]);

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <Link to="/esb" style={{ color: '#8b7355' }}>Back to ESB</Link>
      <h1>Governance Status</h1>
      {error && <p style={{ color: '#ff9800' }}>Graph query: {error}</p>}

      {governance ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
          <div style={{ background: '#1a1a1a', borderRadius: 8, padding: 16 }}>
            <h3 style={{ margin: '0 0 8px', color: '#8b7355' }}>MSP (Mission Statement Protocol)</h3>
            <div><strong>Version:</strong> {governance.msp_version || 'unknown'}</div>
            <div><strong>Hash:</strong> <code style={{ fontSize: 11 }}>{governance.governance_hash?.substring(0, 16) || '-'}...</code></div>
            <div><strong>Last Updated:</strong> {governance.last_amendment || 'never'}</div>
          </div>
          <div style={{ background: '#1a1a1a', borderRadius: 8, padding: 16 }}>
            <h3 style={{ margin: '0 0 8px', color: '#8b7355' }}>BoR (Bill of Rights)</h3>
            <div><strong>Version:</strong> {governance.bor_version || 'unknown'}</div>
            <div><strong>Status:</strong> <span style={{ color: governance.amending ? '#ff9800' : '#4caf50' }}>{governance.amending ? 'AMENDING' : 'STABLE'}</span></div>
          </div>
        </div>
      ) : (
        <p style={{ color: '#666', marginTop: 16 }}>No governance data — Graph may be unreachable via Spine.</p>
      )}

      {governance?.amendment_history?.length > 0 && (
        <section style={{ marginTop: 24 }}>
          <h2>Amendment History</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead><tr style={{ borderBottom: '1px solid #333' }}>
              <th style={{ textAlign: 'left', padding: 6 }}>Version</th>
              <th style={{ textAlign: 'left', padding: 6 }}>Document</th>
              <th style={{ textAlign: 'left', padding: 6 }}>Date</th>
              <th style={{ textAlign: 'left', padding: 6 }}>PER Ref</th>
            </tr></thead>
            <tbody>
              {governance.amendment_history.map((a, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #222' }}>
                  <td style={{ padding: 6 }}>{a.version}</td>
                  <td style={{ padding: 6 }}>{a.document || 'msp'}</td>
                  <td style={{ padding: 6, color: '#666' }}>{a.date || '-'}</td>
                  <td style={{ padding: 6, fontFamily: 'monospace', fontSize: 11 }}>{a.per_ref || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}
