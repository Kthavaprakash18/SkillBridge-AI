import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ProgressBar, EmptyState } from '../components/UI';
import { AppLayout } from '../components/Layout';

const STATUS_STYLES = {
  complete: { dot: '#059669', bg: '#ecfdf5', text: 'Completed', badge: 'badge badge-green' },
  'in-progress': { dot: '#2563eb', bg: '#eff6ff', text: 'In Progress', badge: 'badge badge-blue' },
  locked: { dot: '#cbd5e1', bg: '#f8fafc', text: 'Upcoming', badge: 'badge' },
};

function RoadmapStep({ step, index, onMarkComplete, onContinue }) {
  const [expanded, setExpanded] = useState(index === 0 || step.status === 'in-progress');
  const style = STATUS_STYLES[step.status] || STATUS_STYLES.locked;

  return (
    <div
      className="timeline-item mb-6"
      style={{ animation: `slideUp 0.3s ease ${index * 0.1}s both` }}
    >
      {/* Dot */}
      <div
        className="timeline-dot"
        style={{
          background: style.dot,
          color: 'white',
          fontSize: 10,
          fontWeight: 700,
        }}
      >
        {step.status === 'complete' ? '✓' : index + 1}
      </div>

      {/* Card */}
      <div
        className="card"
        style={{ borderLeft: `3px solid ${style.dot}` }}
      >
        <button
          className="w-full flex items-center gap-3 p-4 text-left"
          onClick={() => setExpanded(e => !e)}
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-slate-800">{step.title}</h3>
              <span className={style.badge}>{style.text}</span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{step.desc}</p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="text-right">
              <p className="text-xs text-slate-400">Progress</p>
              <p className="text-sm font-bold text-slate-800">{step.progress}%</p>
            </div>
            <span className="text-slate-400 text-sm">{expanded ? '▲' : '▼'}</span>
          </div>
        </button>

        {/* Progress bar */}
        <div className="px-4 pb-2">
          <ProgressBar
            value={step.progress}
            color={style.dot}
            height={6}
          />
        </div>

        {/* Expanded content */}
        {expanded && (
          <div className="px-4 pb-4 border-t border-slate-50 pt-3">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm">⏱</span>
              <span className="text-sm text-slate-600">Estimated duration: <strong>{step.duration}</strong></span>
            </div>

            <div className="mb-4">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Recommended Resources</p>
              <div className="flex flex-wrap gap-2">
                {step.resources?.map(r => (
                  <span key={r} className="flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-50 rounded-lg text-xs text-blue-700 font-medium border border-blue-100">
                    <span>📚</span>
                    {r}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {step.status !== 'complete' && (
                <>
                  <button
                    className="btn-primary text-sm"
                    onClick={() => onContinue(step)}
                  >
                    {step.status === 'in-progress' ? '▶ Continue Learning' : '🔓 Start This Step'}
                  </button>
                  <button
                    className="btn-ghost text-sm"
                    onClick={() => onMarkComplete(step.id)}
                  >
                    ✓ Mark as Complete
                  </button>
                </>
              )}
              {step.status === 'complete' && (
                <span className="flex items-center gap-1.5 text-sm text-green-600 font-semibold">
                  <span>🎉</span> Completed!
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Roadmap() {
  const { analysis, roadmapSteps, markStepComplete, navigate, loadDemo } = useApp();
  const [notification, setNotification] = useState(null);

  if (!analysis || !roadmapSteps) {
    return (
      <AppLayout>
        <div className="p-6">
          <EmptyState
            icon="🗺️"
            title="No Roadmap Yet"
            description="Complete the Career Analyzer to generate your personalized learning roadmap."
            action={
              <div className="flex gap-3 flex-wrap justify-center">
                <button className="btn-primary" onClick={() => navigate('analyzer')}>Run Analyzer</button>
                <button className="btn-secondary" onClick={loadDemo}>Try Demo</button>
              </div>
            }
          />
        </div>
      </AppLayout>
    );
  }

  const completed = roadmapSteps.filter(s => s.status === 'complete').length;
  const progress = Math.round((completed / roadmapSteps.length) * 100);

  const handleMarkComplete = (id) => {
    markStepComplete(id);
    setNotification('Step marked as complete! 🎉');
    setTimeout(() => setNotification(null), 3000);
  };

  const handleContinue = (step) => {
    if (step.resources?.[0]) {
      window.open(`https://www.google.com/search?q=${encodeURIComponent(step.resources[0] + ' tutorial')}`, '_blank');
    }
  };

  return (
    <AppLayout>
      <div className="p-6 max-w-4xl mx-auto animate-fade-in">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">My Career Roadmap</h1>
            <p className="text-slate-500 text-sm mt-1">
              Personalized learning path to become a <strong>{analysis.career}</strong>
            </p>
          </div>
          <button className="btn-secondary text-sm" onClick={() => navigate('opportunities')}>
            View Opportunities →
          </button>
        </div>

        {/* Notification */}
        {notification && (
          <div className="mb-4 p-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm font-medium animate-slide-up flex items-center gap-2">
            <span>✅</span>
            {notification}
          </div>
        )}

        {/* Progress overview */}
        <div className="card p-6 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="font-semibold text-slate-800">Overall Progress</h2>
              <p className="text-xs text-slate-500">{completed} of {roadmapSteps.length} steps completed</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-black text-blue-600">{progress}%</p>
              <p className="text-xs text-slate-400">Complete</p>
            </div>
          </div>
          <ProgressBar value={progress} height={12} />

          <div className="grid grid-cols-3 gap-3 mt-4">
            {[
              { label: 'Completed', value: completed, color: '#059669', bg: '#ecfdf5' },
              { label: 'In Progress', value: roadmapSteps.filter(s => s.status === 'in-progress').length, color: '#2563eb', bg: '#eff6ff' },
              { label: 'Upcoming', value: roadmapSteps.filter(s => s.status === 'locked').length, color: '#94a3b8', bg: '#f8fafc' },
            ].map(stat => (
              <div key={stat.label} className="text-center p-3 rounded-xl" style={{ background: stat.bg }}>
                <p className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
                <p className="text-xs text-slate-500 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div>
          {roadmapSteps.map((step, i) => (
            <RoadmapStep
              key={step.id}
              step={step}
              index={i}
              onMarkComplete={handleMarkComplete}
              onContinue={handleContinue}
            />
          ))}
        </div>

        {/* End CTA */}
        <div className="mt-6 card p-6 text-center"
          style={{ background: 'linear-gradient(135deg, #0f172a, #1e3a8a)' }}>
          <span className="text-4xl mb-3 block">🎯</span>
          <h3 className="font-bold text-white text-lg mb-1">Ready to apply?</h3>
          <p className="text-blue-200 text-sm mb-4">Check opportunities that match your current skills right now.</p>
          <button
            className="btn-primary text-sm px-6"
            onClick={() => navigate('opportunities')}
          >
            💼 View My Opportunities →
          </button>
        </div>
      </div>
    </AppLayout>
  );
}
