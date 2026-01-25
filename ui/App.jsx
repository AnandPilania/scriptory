import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import Home from './pages/Home';
import EditorPage from './pages/EditorPage';
import Settings from './pages/Settings';
import TeamActivity from './pages/TeamActivity';
import GitDocsPage from './pages/GitDocsPage';
import GlobalCommandPalette from './components/command/GlobalCommandPalette';
import AnalyticsPage from './pages/AnalyticsPage';

function App() {
    return (
        <Router>
            <GlobalCommandPalette />

            <Routes>
                <Route path="/" element={<MainLayout />}>
                    <Route index element={<Home />} />
                    <Route path="document/:id" element={<EditorPage />} />
                    <Route path="settings" element={<Settings />} />
                    <Route path="team" element={<TeamActivity />} />
                    <Route path="git-docs" element={<GitDocsPage />} />
                    <Route path="analytics" element={<AnalyticsPage />} />
                </Route>
            </Routes>
        </Router>
    );
}

export default App;
