import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard/Dashboard';
import LeadCollection from './pages/LeadCollection/LeadCollection';
import AllLeads from './pages/AllLeads/AllLeads';
import CallAutomation from './pages/CallAutomation/CallAutomation';
import Appointments from './pages/Appointments/Appointments';
import Analytics from './pages/Analytics/Analytics';
import Settings from './pages/Settings/Settings';

function App() {
    return (
        <Router>
            <Layout>
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/leads/generate" element={<LeadCollection />} />
                    <Route path="/leads/all" element={<AllLeads />} />
                    <Route path="/calls" element={<CallAutomation />} />
                    <Route path="/appointments" element={<Appointments />} />
                    <Route path="/analytics" element={<Analytics />} />
                    <Route path="/settings" element={<Settings />} />
                </Routes>
            </Layout>
        </Router>
    );
}

export default App;
