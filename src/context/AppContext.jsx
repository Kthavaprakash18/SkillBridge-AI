import React, { createContext, useContext, useState } from 'react';
import { DEMO_STUDENT, analyzeProfile } from '../data/careers';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [currentPage, setCurrentPage] = useState('landing');
  const [student, setStudent] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [isDemo, setIsDemo] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [roadmapSteps, setRoadmapSteps] = useState(null);

  const loadDemo = () => {
    setStudent(DEMO_STUDENT);
    const result = analyzeProfile(DEMO_STUDENT);
    setAnalysis(result);
    setRoadmapSteps(result.roadmap.map((s, i) => ({ ...s, id: i })));
    setIsDemo(true);
    setCurrentPage('dashboard');
  };

  const runAnalysis = (studentData) => {
    setStudent(studentData);
    const result = analyzeProfile(studentData);
    setAnalysis(result);
    setRoadmapSteps(result.roadmap.map((s, i) => ({ ...s, id: i })));
  };

  const markStepComplete = (stepId) => {
    setRoadmapSteps(prev =>
      prev.map(s => s.id === stepId ? { ...s, progress: 100, status: 'complete' } : s)
    );
  };

  const navigate = (page) => {
    setCurrentPage(page);
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AppContext.Provider value={{
      currentPage, navigate,
      student, setStudent,
      analysis, runAnalysis,
      isDemo, loadDemo,
      sidebarOpen, setSidebarOpen,
      roadmapSteps, setRoadmapSteps, markStepComplete,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
