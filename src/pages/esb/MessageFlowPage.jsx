import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useSpineEvents } from '../../hooks/useSpineEvents';

export default function MessageFlowPage() {
  const [flows, setFlows] = useState([]);
  const [liveEvents, setLiveEvents] = useState([]);
  const { connected, subscribe } = useSpineEvents();

  useEffect(() => {
    fetch('/api/esb/flows/recent').then(r => r.json()).then(d => setFlows(d.flows || [])).catch(() => {});
  }, []);

  useEffect(() => {
    return subscribe('state_transition', (data) => {
      setLiveEvents(prev => [{ ...data, received_at: new Date().toISOString() }, ...prev].slice(0, 50));
    });
  }, [subscribe]);

  const laneType = (flow) => {
    if (flow.to_state === 'AWAITING_AUTH') return 'write';
    if (flow.from_state === 'PLANNING' && flow.to_state === 'DISPATCHED') return 'r0';
    return 'unknown';
  };

  const laneColor = { write: '#ff9800', r0: '#4caf50', unknown: '#9e9e9e' };

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <Link to="/esb" style={{ color: '#8b7355' }}>Back to ESB</Link>
      <h1>Message Flow Visualization</h1>
      <p>WebSocket: {connected ? 'connected' : 'disconnected'} | Live events: {liveEvents.length}</p>

      {liveEvents.length > 0 && (
        <section style={{ marginTop: 16 }}>
          <h2>Live Events</h2>
          <div style={{ maxHeight: 300, overflow: 'auto', background: '#111', borderRadius: 8, padding: 12 }}>
            {liveEvents.map((e, i) => (
              <div key={i} style={{ padding: '4px 0', borderBottom: '1px solid #222', fontSize: 13 }}>
                <span style={{ color: laneColor[laneType(e)] }}>{e.entity_urn?.split(':').pop()}</span>
                {' '}{e.previous_state} → <strong>{e.current_state}</strong>
                <span style={{ color: '#666', marginLeft: 8 }}>{e.actor}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      <section style={{ marginTop: 24 }}>
        <h2>Recent State Transitions</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #333' }}>
              <th style={{ textAlign: 'left', padding: 6 }}>Entity</th>
              <th style={{ textAlign: 'left', padding: 6 }}>Transition</th>
              <th style={{ textAlign: 'left', padding: 6 }}>Lane</th>
              <th style={{ textAlign: 'left', padding: 6 }}>Actor</th>
              <th style={{ textAlign: 'left', padding: 6 }}>Time</th>
            </tr>
          </thead>
          <tbody>
            {flows.map((f, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #222' }}>
                <td style={{ padding: 6, fontFamily: 'monospace', fontSize: 11 }}>{f.entity_urn?.split(':').pop()}</td>
                <td style={{ padding: 6 }}>{f.from_state} → {f.to_state}</td>
                <td style={{ padding: 6, color: laneColor[laneType(f)] }}>{laneType(f)}</td>
                <td style={{ padding: 6, color: '#888' }}>{f.actor}</td>
                <td style={{ padding: 6, color: '#666', fontSize: 11 }}>{f.timestamp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
