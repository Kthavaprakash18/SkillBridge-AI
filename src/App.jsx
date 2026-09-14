import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Analyzer from './pages/Analyzer';
import SkillGap from './pages/SkillGap';
import Roadmap from './pages/Roadmap';
import Opportunities from './pages/Opportunities';
import ExploreCareer from './pages/ExploreCareer';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import BridgeBot, { ChatButton } from './pages/BridgeBot';

function Router() {
  const { currentPage } = useApp();
  const [chatOpen, setChatOpen] = useState(false);

  const pages = {
    landing: <Landing />,
    dashboard: <Dashboard />,
    analyzer: <Analyzer />,
    skillgap: <SkillGap />,
    roadmap: <Roadmap />,
    opportunities: <Opportunities />,
    explore: <ExploreCareer />,
    profile: <Profile />,
    settings: <Settings />,
  };

  return (
    <div key={currentPage} className="animate-fade-in">
      {pages[currentPage] || <Landing />}

      {/* Floating Chat Button — visible on all pages except landing */}
      {currentPage !== 'landing' && (
        <>
          <ChatButton onClick={() => setChatOpen(o => !o)} isOpen={chatOpen} />
          {chatOpen && <BridgeBot onClose={() => setChatOpen(false)} />}
        </>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Router />
    </AppProvider>
  );
}
