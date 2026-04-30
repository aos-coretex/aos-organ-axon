/**
 * Platform Health — ESB-native re-home of the monolith's Vigil Monitoring page.
 *
 * Data sources (all via /api/control/platform-health/*, served by Axon):
 *   - tests, summary, groups, history  ← Vigil (:4015) + platform registry YAML
 *   - run triggers                      ← Spine OTMs to Vigil
 *   - cortex degraded ratio             ← Cortex (:4040) HTTP proxy
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import SummaryStrip from '../../components/verification/SummaryStrip';
import GroupHeader from '../../components/verification/GroupHeader';
import VerificationCard from '../../components/verification/VerificationCard';
import DegradedRatioCard from '../../components/verification/DegradedRatioCard';
import TestDetailDrawer from '../../components/verification/TestDetailDrawer';
import styles from './PlatformHealthPage.module.css';

const API = '/api/control/platform-health';
const POLL_INTERVAL = 15000;

export default function PlatformHealthPage() {
  const [tests, setTests] = useState([]);
  const [summary, setSummary] = useState(null);
  const [groups, setGroups] = useState([]);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [tierFilter, setTierFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState(null);
  const [drawerTestId, setDrawerTestId] = useState(null);
  const [drawerData, setDrawerData] = useState(null);
  const [error, setError] = useState(null);
  const [runningAll, setRunningAll] = useState(false);

  const [cortexRatio, setCortexRatio] = useState(null);
  const [cortexRatioError, setCortexRatioError] = useState(null);

  const pollTimer = useRef(null);

  const fetchTests = useCallback(() => {
    fetch(`${API}/tests`)
      .then((r) => r.json())
      .then((data) => setTests(data.tests || []))
      .catch((e) => setError(e.message));
  }, []);

  const fetchSummary = useCallback(() => {
    fetch(`${API}/summary`)
      .then((r) => r.json())
      .then(setSummary)
      .catch(() => {});
  }, []);

  const fetchGroups = useCallback(() => {
    fetch(`${API}/groups`)
      .then((r) => r.json())
      .then((data) => setGroups(data.groups || []))
      .catch(() => {});
  }, []);

  const fetchCortexRatio = useCallback(() => {
    fetch(`${API}/cortex/degraded-ratio`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        setCortexRatio(data);
        setCortexRatioError(null);
      })
      .catch((e) => {
        setCortexRatioError(e.message);
      });
  }, []);

  const fetchAll = useCallback(() => {
    fetchTests();
    fetchSummary();
    fetchGroups();
    fetchCortexRatio();
  }, [fetchTests, fetchSummary, fetchGroups, fetchCortexRatio]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  useEffect(() => {
    if (!autoRefresh) {
      clearInterval(pollTimer.current);
      return;
    }
    pollTimer.current = setInterval(fetchAll, POLL_INTERVAL);
    return () => clearInterval(pollTimer.current);
  }, [autoRefresh, fetchAll]);

  function handleTrigger(testId) {
    fetch(`${API}/run/${encodeURIComponent(testId)}`, { method: 'POST' })
      .then(() => {
        setTests((prev) =>
          prev.map((t) => (t.id === testId ? { ...t, status: 'running' } : t))
        );
      })
      .catch(() => {});
  }

  function handleRunGroup(groupId) {
    fetch(`${API}/run-group/${encodeURIComponent(groupId)}`, { method: 'POST' })
      .then(() => fetchTests())
      .catch(() => {});
  }

  function handleRunAll() {
    setRunningAll(true);
    fetch(`${API}/run-all`, { method: 'POST' })
      .then(() => fetchTests())
      .catch(() => {});
  }

  useEffect(() => {
    if (runningAll && tests.length > 0 && !tests.some((t) => t.status === 'running')) {
      setRunningAll(false);
    }
  }, [tests, runningAll]);

  function handleCardClick(testId) {
    setDrawerTestId(testId);
    setDrawerData(null);
    fetch(`${API}/tests/${encodeURIComponent(testId)}`)
      .then((r) => r.json())
      .then(setDrawerData)
      .catch(() => {});
  }

  function handleDrawerClose() {
    setDrawerTestId(null);
    setDrawerData(null);
  }

  const filteredTests = tests.filter((t) => {
    if (tierFilter !== 'all' && t.tier !== tierFilter) return false;
    if (statusFilter === 'pass' && t.status !== 'pass') return false;
    if (statusFilter === 'fail' && t.status !== 'fail') return false;
    if (statusFilter === 'blocked' && t.status !== 'blocked') return false;
    if (statusFilter === 'stale' && t.status !== 'unknown' && t.freshness !== 'stale' && t.freshness !== 'dead') return false;
    return true;
  });

  const groupedTests = {};
  for (const t of filteredTests) {
    if (!groupedTests[t.group]) groupedTests[t.group] = [];
    groupedTests[t.group].push(t);
  }

  const groupOrder = groups.map((g) => g.id);
  const sortedGroupIds = Object.keys(groupedTests).sort(
    (a, b) => (groupOrder.indexOf(a) - groupOrder.indexOf(b))
  );

  if (error && tests.length === 0) {
    return (
      <div className={styles.page}>
        <div className={styles.error}>
          <p>Could not connect to Platform Health API</p>
          <p style={{ opacity: 0.6, marginTop: 8 }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerInner}>
          <Link to="/control" className={styles.backLink}>
            &larr; Control
          </Link>
          <div className={styles.headerRow}>
            <div>
              <h1 className={styles.headerTitle}>Platform Health</h1>
              <p className={styles.headerSubtitle}>Vigil verification + Cortex degraded ratio</p>
            </div>
            <div className={styles.headerActions}>
              <button
                className={`${styles.refreshToggle} ${autoRefresh ? styles.refreshActive : ''}`}
                onClick={() => setAutoRefresh(!autoRefresh)}
                title={autoRefresh ? 'Pause auto-refresh' : 'Resume auto-refresh'}
              >
                <span className={autoRefresh ? styles.pulseDot : styles.staticDot} />
                {autoRefresh ? 'Auto-refresh' : 'Paused'}
              </button>
              <button
                className={`${styles.runAllBtn} ${runningAll ? styles.runAllActive : ''}`}
                onClick={handleRunAll}
                disabled={runningAll}
              >
                {runningAll && <span className={styles.runAllSpinner} />}
                {runningAll ? 'Running\u2026' : 'Run All'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.summarySection}>
        <SummaryStrip summary={summary} statusFilter={statusFilter} onStatusFilter={setStatusFilter} />
      </div>

      <div className={styles.organHealthSection}>
        <div className={styles.organHealthHeader}>Organ Health</div>
        <div className={styles.organHealthGrid}>
          <DegradedRatioCard data={cortexRatio} error={cortexRatioError} />
        </div>
      </div>

      <div className={styles.filterSection}>
        <div className={styles.filterTabs}>
          {['all', 'unit', 'integration'].map((tier) => (
            <button
              key={tier}
              className={`${styles.filterTab} ${tierFilter === tier ? styles.filterTabActive : ''}`}
              onClick={() => setTierFilter(tier)}
            >
              {tier === 'all' ? 'All' : tier === 'unit' ? 'Unit' : 'Integration'}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.gridSection}>
        {sortedGroupIds.map((groupId) => {
          const groupMeta = groups.find((g) => g.id === groupId) || {
            id: groupId, name: groupId, icon: 'default', total: 0, passing: 0, failing: 0, blocked: 0, stale: 0,
          };

          return (
            <div key={groupId} className={styles.groupBlock}>
              <GroupHeader group={groupMeta} onRunGroup={handleRunGroup} />
              <div className={styles.cardGrid}>
                {groupedTests[groupId].map((t) => (
                  <VerificationCard
                    key={t.id}
                    test={t}
                    onTrigger={handleTrigger}
                    onClick={handleCardClick}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {drawerTestId && (
        <TestDetailDrawer
          testDetail={drawerData}
          onClose={handleDrawerClose}
          onRun={handleTrigger}
        />
      )}
    </div>
  );
}
