import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSpineEvents } from '../../hooks/useSpineEvents';

export default function JobLifecyclePage() {
  const [stats, setStats] = useState(null);
  const [activeJobs, setActiveJobs] = useState([]);
  const [recentJobs, setRecentJobs] = useState([]);
  const { subscribe } = useSpineEvents();

  const load = async () => {
    try {
      const [statsRes, jobsRes] = await Promise.all([
        fetch('/api/esb/spine/jobs').then(r => r.json()),
        fetch('/api/esb/spine/jobs/active').then(r => r.json()),
      ]);
      setStats(statsRes.stats || null);
      setActiveJobs(jobsRes.active || []);
      setRecentJobs(jobsRes.recent || []);
    } catch { /* degrade */ }
  };

  useEffect(() => { load(); }, []);
  useEffect(() => {
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, []);
  useEffect(() => subscribe('state_transition', load), [subscribe]);

  const stateColor = {
    CREATED: '#2196f3', PLANNING: '#2196f3', AWAITING_AUTH: '#ff9800',
    DISPATCHED: '#8b7355', EXECUTING: '#ff9800',
    SUCCEEDED: '#4caf50', FAILED: '#f44336', DENIED: '#f44336',
  };

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <Link to="/esb" style={{ color: '#8b7355' }}>Back to ESB</Link>
      <h1>Job Lifecycle</h1>

      {stats && (
        <div style={{ display: 'flex', gap: 16, marginTop: 16, flexWrap: 'wrap' }}>
          <div style={{ background: '#1a1a1a', borderRadius: 8, padding: '8px 16px' }}>
            <div style={{ fontSize: 24, fontWeight: 'bold' }}>{stats.total_events ?? '-'}</div>
            <div style={{ color: '#888', fontSize: 12 }}>total events</div>
          </div>
          <div style={{ background: '#1a1a1a', borderRadius: 8, padding: '8px 16px' }}>
            <div style={{ fontSize: 24, fontWeight: 'bold' }}>{stats.unprocessed ?? '-'}</div>
            <div style={{ color: '#888', fontSize: 12 }}>unprocessed</div>
          </div>
          <div style={{ background: '#1a1a1a', borderRadius: 8, padding: '8px 16px' }}>
            <div style={{ fontSize: 24, fontWeight: 'bold', color: '#4caf50' }}>{activeJobs.length}</div>
            <div style={{ color: '#888', fontSize: 12 }}>active jobs</div>
          </div>
          <div style={{ background: '#1a1a1a', borderRadius: 8, padding: '8px 16px' }}>
            <div style={{ fontSize: 24, fontWeight: 'bold' }}>{recentJobs.length}</div>
            <div style={{ color: '#888', fontSize: 12 }}>tracked jobs</div>
          </div>
        </div>
      )}

      <section style={{ marginTop: 24 }}>
        <h2>Active Jobs</h2>
        {activeJobs.length === 0 ? <p style={{ color: '#666' }}>No active jobs.</p> : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead><tr style={{ borderBottom: '1px solid #333' }}>
              <th style={{ textAlign: 'left', padding: 6 }}>Job</th>
              <th style={{ textAlign: 'left', padding: 6 }}>State</th>
              <th style={{ textAlign: 'left', padding: 6 }}>Actor</th>
              <th style={{ textAlign: 'left', padding: 6 }}>Time</th>
            </tr></thead>
            <tbody>
              {activeJobs.map((j, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #222' }}>
                  <td style={{ padding: 6, fontFamily: 'monospace', fontSize: 11 }}>{j.job_urn?.split(':').pop()}</td>
                  <td style={{ padding: 6, color: stateColor[j.state] || '#888' }}>{j.state}</td>
                  <td style={{ padding: 6, color: '#888' }}>{j.actor}</td>
                  <td style={{ padding: 6, color: '#666', fontSize: 11 }}>{j.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section style={{ marginTop: 24 }}>
        <h2>Recent Jobs (last 20)</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead><tr style={{ borderBottom: '1px solid #333' }}>
            <th style={{ textAlign: 'left', padding: 6 }}>Job</th>
            <th style={{ textAlign: 'left', padding: 6 }}>State</th>
            <th style={{ textAlign: 'left', padding: 6 }}>Lane</th>
            <th style={{ textAlign: 'left', padding: 6 }}>Time</th>
          </tr></thead>
          <tbody>
            {recentJobs.map((j, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #222' }}>
                <td style={{ padding: 6, fontFamily: 'monospace', fontSize: 11 }}>{j.job_urn?.split(':').pop()}</td>
                <td style={{ padding: 6, color: stateColor[j.state] || '#888' }}>{j.state}</td>
                <td style={{ padding: 6, color: j.state === 'AWAITING_AUTH' ? '#ff9800' : '#4caf50' }}>
                  {j.state === 'AWAITING_AUTH' ? 'write' : j.previous === 'PLANNING' && j.state === 'DISPATCHED' ? 'r0' : '-'}
                </td>
                <td style={{ padding: 6, color: '#666', fontSize: 11 }}>{j.timestamp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
