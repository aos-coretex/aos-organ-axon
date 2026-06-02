import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import ControlPage from './pages/ControlPage';
import OrganMonitoringPage from './pages/control/OrganMonitoringPage';
import PlatformHealthPage from './pages/control/PlatformHealthPage';
import OrganHealthPage from './pages/esb/OrganHealthPage';
import MessageFlowPage from './pages/esb/MessageFlowPage';
import MailboxMonitorPage from './pages/esb/MailboxMonitorPage';
import VigilResultsPage from './pages/esb/VigilResultsPage';
import GliaTicketsPage from './pages/esb/GliaTicketsPage';
import GovernanceStatusPage from './pages/esb/GovernanceStatusPage';
import JobLifecyclePage from './pages/esb/JobLifecyclePage';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Default → Control surface (marketing routes extracted to aos-coretex-website-main 2026-06-02) */}
        <Route index element={<Navigate to="/control" replace />} />

        {/* Control — operations landing */}
        <Route path="control" element={<ControlPage />} />
        <Route path="control/organ-monitoring" element={<OrganMonitoringPage />} />
        <Route path="control/platform-health" element={<PlatformHealthPage />} />

        {/* ESB — data-driven dashboard pages (MP-16 v6t-6) */}
        <Route path="esb/organs" element={<OrganHealthPage />} />
        <Route path="esb/flows" element={<MessageFlowPage />} />
        <Route path="esb/mailboxes" element={<MailboxMonitorPage />} />
        <Route path="esb/vigil" element={<VigilResultsPage />} />
        <Route path="esb/glia" element={<GliaTicketsPage />} />
        <Route path="esb/governance" element={<GovernanceStatusPage />} />
        <Route path="esb/jobs" element={<JobLifecyclePage />} />
      </Route>
    </Routes>
  );
}
