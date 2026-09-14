import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: '⊞' },
  { id: 'analyzer', label: 'Career Analyzer', icon: '🔍' },
  { id: 'skillgap', label: 'Skill Gap', icon: '📊' },
  { id: 'roadmap', label: 'My Roadmap', icon: '🗺️' },
  { id: 'opportunities', label: 'Opportunities', icon: '💼' },
  { id: 'explore', label: 'Explore Careers', icon: '🚀' },
];

export function Sidebar() {
  const { currentPage, navigate, student, sidebarOpen, setSidebarOpen } = useApp();

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full z-50 bg-white border-r border-slate-100
          flex flex-col transition-transform duration-300
          w-64
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:z-auto
        `}
        style={{ boxShadow: '2px 0 20px rgb(0 0 0 / 0.06)' }}
      >
        {/* Logo */}
        <div className="p-5 border-b border-slate-100">
          <button
            className="flex items-center gap-2.5 w-full text-left"
            onClick={() => navigate('landing')}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold"
              style={{ background: 'linear-gradient(135deg, #2563eb, #06b6d4)' }}
            >
              S
            </div>
            <div>
              <div className="text-sm font-700 text-slate-900" style={{ fontWeight: 700, lineHeight: 1.2 }}>SkillBridge</div>
              <div className="text-xs" style={{ background: 'linear-gradient(135deg, #2563eb, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 600 }}>AI Career Platform</div>
            </div>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 overflow-y-auto scrollbar-thin">
          <p className="text-xs font-600 text-slate-400 px-3 mb-2 uppercase tracking-wider" style={{ fontWeight: 600 }}>Main Menu</p>
          <div className="flex flex-col gap-0.5">
            {NAV_ITEMS.map(item => (
              <button
                key={item.id}
                className={`sidebar-link ${currentPage === item.id ? 'active' : ''}`}
                onClick={() => navigate(item.id)}
              >
                <span className="text-base">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          <div className="mt-5 mx-3 p-3 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm">🤖</span>
              <span className="text-xs font-semibold text-blue-700">AI Engine</span>
              <span className="ml-auto w-2 h-2 rounded-full bg-green-400 animate-pulse-soft"></span>
            </div>
            <p className="text-xs text-slate-500">Online & Ready</p>
          </div>
        </nav>

        {/* Bottom section */}
        <div className="p-3 border-t border-slate-100">
          {student && (
            <div className="flex items-center gap-3 px-3 py-2.5 mb-2 rounded-xl bg-slate-50">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white text-xs font-bold">
                {student.name?.[0] || 'A'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 truncate">{student.name}</p>
                <p className="text-xs text-slate-500 truncate">{student.targetCareer}</p>
              </div>
            </div>
          )}
          <div className="flex flex-col gap-0.5">
            <button
              className={`sidebar-link ${currentPage === 'profile' ? 'active' : ''}`}
              onClick={() => navigate('profile')}
            >
              <span className="text-base">👤</span>
              <span>Profile</span>
            </button>
            <button
              className={`sidebar-link ${currentPage === 'settings' ? 'active' : ''}`}
              onClick={() => navigate('settings')}
            >
              <span className="text-base">⚙️</span>
              <span>Settings</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

export function Topbar() {
  const { currentPage, student, setSidebarOpen, navigate } = useApp();

  const titles = {
    dashboard: 'Dashboard',
    analyzer: 'AI Career Analyzer',
    skillgap: 'Skill Gap Analysis',
    roadmap: 'My Career Roadmap',
    opportunities: 'AI Opportunity Match',
    explore: 'Explore Careers',
    profile: 'Profile',
    settings: 'Settings',
    landing: 'Home',
  };

  return (
    <header className="h-14 bg-white border-b border-slate-100 flex items-center px-4 gap-3 sticky top-0 z-30"
      style={{ boxShadow: '0 1px 10px rgb(0 0 0 / 0.04)' }}>
      {/* Mobile menu button */}
      <button
        className="lg:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-600"
        onClick={() => setSidebarOpen(prev => !prev)}
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <rect y="2" width="18" height="2" rx="1" fill="currentColor"/>
          <rect y="8" width="18" height="2" rx="1" fill="currentColor"/>
          <rect y="14" width="18" height="2" rx="1" fill="currentColor"/>
        </svg>
      </button>

      <h1 className="text-base font-semibold text-slate-800 flex-1">
        {titles[currentPage] || 'SkillBridge AI'}
      </h1>

      <div className="flex items-center gap-2">
        {student && (
          <button
            onClick={() => navigate('profile')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white text-xs font-bold">
              {student.name?.[0] || 'A'}
            </div>
            <span className="text-sm font-medium text-slate-700 hidden sm:block">{student.name}</span>
          </button>
        )}
      </div>
    </header>
  );
}

export function AppLayout({ children }) {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto scrollbar-thin">
          {children}
        </main>
      </div>
    </div>
  );
}
