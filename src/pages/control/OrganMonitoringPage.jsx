import { useCallback, useEffect, useState } from 'react';
import styles from './OrganMonitoringPage.module.css';
import { formatAssignedLlm, formatCostLast24h } from './assignedLlm.js';

const POLL_INTERVAL_MS = 15_000;

function lightState(organ) {
  if (!organ.health_ok) return 'red';
  if (!organ.spine_connected) return 'orange';
  if (organ.actively_exchanging) return 'yellow';
  return 'green';
}

function OrganCard({ organ, llmRecord, onOpen }) {
  const state = lightState(organ);
  const assignedLlm = formatAssignedLlm(llmRecord);
  const costLast24h = formatCostLast24h(llmRecord);
  return (
    <div className={styles.card}>
      <div className={styles.cardHead}>
        <div className={styles.name} title={`#${organ.num} · :${organ.port}`}>{organ.name}</div>
        <div className={styles.lights}>
          <span className={`${styles.light} ${styles.red}   ${state === 'red'    ? styles.on : ''}`} title="DEAD" />
          <span className={`${styles.light} ${styles.orange}${state === 'orange' ? ' ' + styles.on : ''}`} title="ON but disconnected" />
          <span className={`${styles.light} ${styles.green} ${state === 'green'  ? styles.on : ''}`} title="ON + Spine connected" />
          <span className={`${styles.light} ${styles.yellow}${state === 'yellow' ? ' ' + styles.on : ''}`} title="Actively exchanging" />
        </div>
      </div>
      <div className={styles.description}>{organ.description}</div>
      <div className={styles.llm} title="MP-CONFIG-1 R8 — /api/config/llm-assignments">
        <span className={styles.llmLabel}>Assigned LLM:</span>
        <span className={styles.llmValue}>{assignedLlm}</span>
      </div>
      <div className={styles.llm} title="MP-CONFIG-1 R9 — llm_usage_event roll-up (last 24h)">
        <span className={styles.llmLabel}>Cost (last 24h):</span>
        <span className={styles.llmValue}>{costLast24h}</span>
      </div>
      <button type="button" className={styles.pill} onClick={() => onOpen(organ.name)}>
        Details
      </button>
    </div>
  );
}

function DetailModal({ name, onClose }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/control/organs/${encodeURIComponent(name)}`)
      .then(r => r.json())
      .then(d => { if (!cancelled) setData(d); })
      .catch(err => { if (!cancelled) setError(err.message); });
    return () => { cancelled = true; };
  }, [name]);

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHead}>
          <h2>{name}</h2>
          <button type="button" className={styles.close} onClick={onClose}>×</button>
        </div>
        {error && <div className={styles.error}>{error}</div>}
        {!data && !error && <div className={styles.loading}>Loading…</div>}
        {data && (
          <>
            <div className={styles.metaRow}>
              <span>#{data.num}</span>
              <span>port {data.port}</span>
              <span>{data.description}</span>
            </div>
            <h3>Health</h3>
            <pre className={styles.json}>{JSON.stringify(data.health, null, 2)}</pre>
            <h3>Introspect</h3>
            <pre className={styles.json}>{JSON.stringify(data.introspect, null, 2)}</pre>
          </>
        )}
      </div>
    </div>
  );
}

export default function OrganMonitoringPage() {
  const [state, setState] = useState({ organs: [], spine: null, generated_at: null });
  const [llmByOrgan, setLlmByOrgan] = useState({}); // lowercase-name → record
  const [error, setError] = useState(null);
  const [detail, setDetail] = useState(null);

  const fetchOrgans = useCallback(async () => {
    try {
      const res = await fetch('/api/control/organs');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setState(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  // MP-CONFIG-1 R8 — fetch LLM assignments alongside organ health. Failures
  // silently degrade the "Assigned LLM" attribute to "—" per the per-card
  // formatter; the aggregator already handles per-organ probe errors.
  const fetchLlmAssignments = useCallback(async () => {
    try {
      const res = await fetch('/api/config/llm-assignments');
      if (!res.ok) return;
      const data = await res.json();
      const byName = {};
      for (const record of (data.organs || [])) {
        byName[record.organ_name] = record;
      }
      setLlmByOrgan(byName);
    } catch {
      // Non-fatal: cards render "N/A (deterministic)" or "—"
    }
  }, []);

  useEffect(() => {
    fetchOrgans();
    fetchLlmAssignments();
    const id = setInterval(() => {
      fetchOrgans();
      fetchLlmAssignments();
    }, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [fetchOrgans, fetchLlmAssignments]);

  const byState = { red: 0, orange: 0, green: 0, yellow: 0 };
  for (const o of state.organs) byState[lightState(o)] += 1;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Organ Monitoring</h1>
        <div className={styles.summary}>
          <span><i className={`${styles.dot} ${styles.green}`} />{byState.green} green</span>
          <span><i className={`${styles.dot} ${styles.yellow}`} />{byState.yellow} yellow</span>
          <span><i className={`${styles.dot} ${styles.orange}`} />{byState.orange} orange</span>
          <span><i className={`${styles.dot} ${styles.red}`} />{byState.red} red</span>
          {state.generated_at && (
            <span className={styles.timestamp}>Updated {new Date(state.generated_at).toLocaleTimeString()}</span>
          )}
        </div>
      </header>
      {error && <div className={styles.banner}>Aggregator error: {error}</div>}
      {state.spine && !state.spine.reachable && (
        <div className={styles.banner}>Spine not reachable — orange/green distinction degraded.</div>
      )}
      <div className={styles.grid}>
        {state.organs.map((o) => (
          <OrganCard
            key={o.name}
            organ={o}
            llmRecord={llmByOrgan[o.name.toLowerCase()] || null}
            onOpen={setDetail}
          />
        ))}
      </div>
      {detail && <DetailModal name={detail} onClose={() => setDetail(null)} />}
    </div>
  );
}
