import React from 'react';
import { useApp } from '../context/AppContext';
import { CircularProgress, ProgressBar, SkillTag, SectionHeader, EmptyState } from '../components/UI';
import { AppLayout } from '../components/Layout';

function getHour() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

function StatCard({ label, value, sub, icon, color, onClick }) {
  return (
    <button
      onClick={onClick}
      className="card card-hover p-5 text-left w-full"
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
          style={{ background: `${color}18` }}
        >
          {icon}
        </div>
        <span className="text-xs text-slate-400 font-medium">View →</span>
      </div>
      <div className="text-2xl font-black mb-0.5" style={{ color }}>{value}</div>
      <div className="text-sm font-semibold text-slate-700">{label}</div>
      {sub && <div className="text-xs text-slate-400 mt-0.5">{sub}</div>}
    </button>
  );
}

export default function Dashboard() {
  const { student, analysis, navigate, loadDemo } = useApp();

  if (!student || !analysis) {
    return (
      <AppLayout>
        <div className="p-6">
          <EmptyState
            icon="🔍"
            title="No Analysis Yet"
            description="Complete the Career Analyzer to see your personalized dashboard with match scores, skill gaps, and roadmap."
            action={
              <div className="flex flex-wrap gap-3 justify-center">
                <button className="btn-primary" onClick={() => navigate('analyzer')}>
                  🔍 Analyze My Career
                </button>
                <button className="btn-secondary" onClick={loadDemo}>
                  🎯 Try Demo
                </button>
              </div>
            }
          />
        </div>
      </AppLayout>
    );
  }

  const totalRoadmapSteps = analysis.roadmap?.length || 6;
  const completedSteps = analysis.roadmap?.filter(s => s.status === 'complete').length || 1;
  const roadmapProgress = Math.round((completedSteps / totalRoadmapSteps) * 100);

  return (
    <AppLayout>
      <div className="p-6 max-w-5xl mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Good {getHour()}, {student.name} 👋
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Here's your career intelligence report for <strong>{analysis.career}</strong>
            </p>
          </div>
          <button
            className="btn-primary text-sm"
            onClick={() => navigate('analyzer')}
          >
            🔄 Re-Analyze
          </button>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Career Match"
            value={`${analysis.matchScore}%`}
            sub={`for ${analysis.career}`}
            icon="🎯"
            color="#2563eb"
            onClick={() => navigate('skillgap')}
          />
          <StatCard
            label="Job Readiness"
            value={`${analysis.jobReadiness}%`}
            sub="overall readiness"
            icon="✅"
            color="#059669"
            onClick={() => navigate('opportunities')}
          />
          <StatCard
            label="Skills"
            value={`${analysis.matchedSkills.length} / ${analysis.totalRequired}`}
            sub="required skills"
            icon="⚡"
            color="#7c3aed"
            onClick={() => navigate('skillgap')}
          />
          <StatCard
            label="Skill Gaps"
            value={analysis.missingSkills.length}
            sub="skills to learn"
            icon="📊"
            color="#f59e0b"
            onClick={() => navigate('skillgap')}
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-5">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-5">

            {/* AI Recommendation */}
            <div className="card p-6" style={{ borderLeft: '4px solid #2563eb' }}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">🤖</span>
                <span className="font-semibold text-slate-800">Your AI Recommendation</span>
                <span className="badge badge-blue ml-auto">AI Generated</span>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed">
                {analysis.aiExplanation}
              </p>
              <div className="mt-4 flex gap-2 flex-wrap">
                <button className="btn-primary text-sm" onClick={() => navigate('roadmap')}>
                  🗺️ View Roadmap
                </button>
                <button className="btn-ghost text-sm" onClick={() => navigate('skillgap')}>
                  📊 See Skill Gaps
                </button>
              </div>
            </div>

            {/* Career Match Breakdown */}
            <div className="card p-6">
              <h2 className="font-semibold text-slate-800 mb-4">Career Match Breakdown</h2>

              <div className="grid grid-cols-3 gap-4 mb-5">
                <CircularProgress
                  value={analysis.matchScore}
                  size={90}
                  color="#2563eb"
                  label="Career Match"
                />
                <CircularProgress
                  value={analysis.jobReadiness}
                  size={90}
                  color="#059669"
                  label="Job Ready"
                />
                <CircularProgress
                  value={(analysis.matchedSkills.length / analysis.totalRequired) * 100}
                  size={90}
                  color="#7c3aed"
                  label="Skill Cover"
                />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600 font-medium">Overall Readiness</span>
                  <span className="font-bold text-slate-800">{analysis.jobReadiness}%</span>
                </div>
                <ProgressBar value={analysis.jobReadiness} color="#059669" height={10} />
              </div>
            </div>

            {/* Skill status */}
            <div className="card p-6">
              <h2 className="font-semibold text-slate-800 mb-4">Skill Status for {analysis.career}</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">You Have ✓</p>
                  <div className="flex flex-wrap gap-2">
                    {analysis.matchedSkills.map(s => (
                      <SkillTag key={s} skill={s} status="have" />
                    ))}
                    {analysis.matchedSkills.length === 0 && (
                      <p className="text-xs text-slate-400">No matching skills yet</p>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">You Need ✕</p>
                  <div className="flex flex-wrap gap-2">
                    {analysis.missingSkills.map(s => (
                      <SkillTag key={s} skill={s} status="missing" />
                    ))}
                    {analysis.missingSkills.length === 0 && (
                      <p className="text-xs text-green-600 font-medium">🎉 You have all required skills!</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right sidebar */}
          <div className="space-y-4">
            {/* Summary card */}
            <div className="card p-5 text-center"
              style={{ background: 'linear-gradient(135deg, #eff6ff, #ecfeff)' }}>
              <p className="text-xs text-blue-600 font-semibold uppercase tracking-wider mb-1">Current Goal</p>
              <p className="text-xl font-bold text-slate-900 mb-4">{analysis.career}</p>
              <div className="text-left space-y-3">
                {[
                  { label: 'Roadmap Progress', value: `${roadmapProgress}%`, icon: '🗺️', onClick: () => navigate('roadmap') },
                  { label: 'Top Skill to Learn', value: analysis.missingSkills[0] || 'Keep practicing!', icon: '⚡', onClick: () => navigate('skillgap') },
                  { label: 'Best Opportunity', value: `${analysis.opportunities?.[0]?.title || 'Data Analyst Intern'} — ${analysis.matchScore}%`, icon: '💼', onClick: () => navigate('opportunities') },
                ].map((item, i) => (
                  <button
                    key={i}
                    onClick={item.onClick}
                    className="w-full flex items-center gap-2.5 p-2.5 bg-white rounded-lg hover:shadow-sm transition-all text-left"
                  >
                    <span className="text-base">{item.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-400">{item.label}</p>
                      <p className="text-sm font-semibold text-slate-800 truncate">{item.value}</p>
                    </div>
                    <span className="text-slate-300 text-xs">→</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Roadmap progress */}
            <div className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold text-slate-800 text-sm">Roadmap Progress</span>
                <span className="text-sm font-bold text-blue-600">{roadmapProgress}%</span>
              </div>
              <ProgressBar value={roadmapProgress} height={8} />
              <p className="text-xs text-slate-500 mt-2">{completedSteps} of {totalRoadmapSteps} steps completed</p>
              <button
                className="btn-primary w-full mt-3 text-sm"
                onClick={() => navigate('roadmap')}
              >
                Continue Learning →
              </button>
            </div>

            {/* Top opportunity */}
            {analysis.opportunities?.[0] && (
              <div className="card p-5">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Best Match</p>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{analysis.opportunities[0].companyLogo}</span>
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">{analysis.opportunities[0].title}</p>
                    <p className="text-xs text-slate-500">{analysis.opportunities[0].company}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className="text-sm font-bold px-2 py-0.5 rounded-full"
                    style={{ background: '#ecfdf5', color: '#059669' }}
                  >
                    {analysis.opportunities[0].matchScore}% Match
                  </span>
                  <span className="badge badge-blue">{analysis.opportunities[0].type}</span>
                </div>
                <button
                  className="btn-primary w-full text-sm"
                  onClick={() => navigate('opportunities')}
                >
                  View All Opportunities →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
