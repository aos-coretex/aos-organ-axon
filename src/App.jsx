import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import ProjectsPage from './pages/ProjectsPage';
import MonadPage from './pages/projects/MonadPage';
import ComponentsPage from './pages/ComponentsPage';
import GraphheightDashboard from './pages/projects/GraphheightDashboard';
import SpinePage from './pages/projects/SpinePage';
import OpveraPage from './pages/projects/OpveraPage';
import OpveraWebsite from './pages/projects/OpveraWebsite';
import ComingSoon from './pages/projects/ComingSoon';
import VivanPage from './pages/projects/VivanPage';
import BluboxPage from './pages/projects/BluboxPage';
import SentiencePage from './pages/projects/SentiencePage';
import NnetcastPage from './pages/projects/NnetcastPage';
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
        <Route index element={<HomePage />} />

        {/* Projects — products built by the foundry */}
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="projects/opvera" element={<OpveraPage />} />
        <Route path="projects/opvera/website" element={<OpveraWebsite />} />
        <Route path="projects/opvera/coming-soon" element={<ComingSoon />} />
        <Route path="projects/vivan" element={<VivanPage />} />
        <Route path="projects/blubox" element={<BluboxPage />} />
        <Route path="projects/sentience" element={<SentiencePage />} />
        <Route path="projects/nnetcast" element={<NnetcastPage />} />

        {/* Components — foundry infrastructure (standalone pages only) */}
        <Route path="components" element={<ComponentsPage />} />
        <Route path="components/monad" element={<MonadPage />} />
        <Route path="components/graphheight" element={<GraphheightDashboard />} />
        <Route path="components/spine" element={<SpinePage />} />

        {/* ESB — data-driven dashboard pages (MP-16 v6t-6) */}
        <Route path="esb/organs" element={<OrganHealthPage />} />
        <Route path="esb/flows" element={<MessageFlowPage />} />
        <Route path="esb/mailboxes" element={<MailboxMonitorPage />} />
        <Route path="esb/vigil" element={<VigilResultsPage />} />
        <Route path="esb/glia" element={<GliaTicketsPage />} />
        <Route path="esb/governance" element={<GovernanceStatusPage />} />
        <Route path="esb/jobs" element={<JobLifecyclePage />} />

        {/* Control — operations landing */}
        <Route path="control" element={<ControlPage />} />
        <Route path="control/organ-monitoring" element={<OrganMonitoringPage />} />
        <Route path="control/platform-health" element={<PlatformHealthPage />} />

        {/* Legacy redirects (retained for bookmark compatibility) */}
        <Route path="projects/monad" element={<Navigate to="/components/monad" replace />} />
        <Route path="projects/monad/graphheight" element={<Navigate to="/components/graphheight" replace />} />
      </Route>
    </Routes>
  );
}
