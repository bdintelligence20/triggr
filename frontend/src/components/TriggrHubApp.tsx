import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './layout/Header';
import Sidebar from './layout/Sidebar';
import Dashboard from './views/Dashboard';
import Hubs from './views/Hubs';
import Library from './views/Library';
import Chat from './views/Chat';
import Insights from './views/Insights';
import Profile from './views/Profile';
import Settings from './views/Settings';
import FloatingActionButton from './common/FloatingActionButton';
import { useState } from 'react';
import { useLocation } from 'react-router-dom';

const TriggrHubApp = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const shouldShowFAB = !location.pathname.includes('/chat');

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        isMobileMenuOpen={isMobileMenuOpen} 
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />
      <div className="flex">
        <Sidebar 
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
        />
        <main className="flex-1 min-h-[calc(100vh-64px)] w-full max-w-[1920px] mx-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/hubs" element={<Hubs />} />
            <Route path="/library" element={<Library />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/insights" element={<Insights />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
      {shouldShowFAB && <FloatingActionButton />}
    </div>
  );
};

export default TriggrHubApp;