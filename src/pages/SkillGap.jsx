import React from 'react';
import { useApp } from '../context/AppContext';
import { ProgressBar, SkillTag, PriorityBadge, EmptyState } from '../components/UI';
import { AppLayout } from '../components/Layout';
import { SKILL_GAP_DETAILS } from '../data/careers';

function SkillGapCard({ skill, index }) {
  const details = SKILL_GAP_DETAILS[skill] || {
    currentLevel: 'Beginner',
    requiredLevel: 'Intermediate',
    priority: 'MEDIUM',
    importance: 75,
    effort: '3–5 weeks',
    resource: 'Online tutorials and practice projects',
    why: `${skill} is required for this role.`,
  };

  const priorityColor = {
    HIGH: '#dc2626',
    MEDIUM: '#d97706',
    LOW: '#059669',
  }[details.priority] || '#2563eb';

  return (
    <div
      className="card card-hover p-5"
      style={{ animation: `slideUp 0.3s ease ${index * 0.08}s both` }}
    >
      <div className="flex items-start justify-between flex-wrap gap-2 mb-3">
        <div>
          <h3 className="font-semibold text-slate-800 text-base">{skill}</h3>
          <p className="text-xs text-slate-400 mt-0.5">{details.why}</p>
        </div>
        <PriorityBadge level={details.priority} />
      </div>

      {/* Importance bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-slate-500 mb-1">
          <span>Importance for role</span>
          <span className="font-semibold">{details.importance}%</span>
        </div>
        <ProgressBar value={details.importance} color={priorityColor} height={6} />
      </div>

      {/* Levels */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="p-2.5 rounded-lg bg-red-50 border border-red-100 text-center">
          <p className="text-xs text-red-400 font-medium">Current Level</p>
          <p className="text-sm font-bold text-red-600">{details.currentLevel}</p>
        </div>
        <div className="p-2.5 rounded-lg bg-green-50 border border-green-100 text-center">
          <p className="text-xs text-green-400 font-medium">Required Level</p>
          <p className="text-sm font-bold text-green-600">{details.requiredLevel}</p>
        </div>
      </div>

      {/* Resource */}
      <div className="flex items-center gap-2 p-2.5 rounded-lg bg-blue-50 border border-blue-100">
        <span className="text-base">📚</span>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-blue-500 font-medium">Recommended Resource</p>
          <p className="text-sm font-semibold text-blue-700 truncate">{details.resource}</p>
        </div>
      </div>

      <div className="flex items-center justify-between mt-3">
        <span className="text-xs text-slate-400">⏱ {details.effort} effort</span>
        <a
          href={details.resourceUrl || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-600 font-semibold hover:underline"
          onClick={e => !details.resourceUrl && e.preventDefault()}
        >
          Start Learning →
        </a>
      </div>
    </div>
  );
}

export default function SkillGap() {
  const { analysis, navigate, loadDemo } = useApp();

  if (!analysis) {
    return (
      <AppLayout>
        <div className="p-6">
          <EmptyState
            icon="📊"
            title="No Skill Analysis Yet"
            description="Run the Career Analyzer first to see your personalized skill gap report."
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

  return (
    <AppLayout>
      <div className="p-6 max-w-5xl mx-auto animate-fade-in">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Skill Gap Analysis</h1>
          <p className="text-slate-500 text-sm mt-1">
            Detailed breakdown of your skills vs. <strong>{analysis.career}</strong> requirements
          </p>
        </div>

        {/* Summary bar */}
        <div className="card p-5 mb-6 flex flex-wrap gap-6 items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600 font-bold text-lg">
              {analysis.matchedSkills.length}
            </div>
            <div>
              <p className="text-xs text-slate-400">Skills You Have</p>
              <p className="font-semibold text-slate-800">Matched</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-600 font-bold text-lg">
              {analysis.missingSkills.length}
            </div>
            <div>
              <p className="text-xs text-slate-400">Skills Missing</p>
              <p className="font-semibold text-slate-800">Gaps Found</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-lg">
              {analysis.totalRequired}
            </div>
            <div>
              <p className="text-xs text-slate-400">Total Required</p>
              <p className="font-semibold text-slate-800">For {analysis.career}</p>
            </div>
          </div>

          <div className="flex-1 min-w-40">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-500">Skill Coverage</span>
              <span className="font-bold text-slate-800">{analysis.matchScore}%</span>
            </div>
            <ProgressBar
              value={analysis.matchScore}
              color={analysis.matchScore >= 70 ? '#059669' : '#f59e0b'}
              height={10}
            />
          </div>

          <button
            className="btn-primary text-sm ml-auto"
            onClick={() => navigate('roadmap')}
          >
            📍 View Roadmap →
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: skill lists */}
          <div className="space-y-5">
            {/* Current skills */}
            <div className="card p-5">
              <h2 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-green-500 text-white flex items-center justify-center text-xs font-bold">✓</span>
                Current Skills
              </h2>
              <div className="flex flex-col gap-2">
                {analysis.matchedSkills.map(skill => (
                  <div key={skill} className="flex items-center gap-2 p-2 rounded-lg hover:bg-green-50 transition-colors">
                    <span className="text-green-500 font-bold text-sm">✓</span>
                    <span className="text-sm text-slate-700 font-medium">{skill}</span>
                    <span className="ml-auto badge badge-green text-xs">Have</span>
                  </div>
                ))}
                {analysis.matchedSkills.length === 0 && (
                  <p className="text-sm text-slate-400 italic">No matched skills yet.</p>
                )}
              </div>
            </div>

            {/* Missing skills */}
            <div className="card p-5">
              <h2 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-xs font-bold">✕</span>
                Missing Skills
              </h2>
              <div className="flex flex-col gap-2">
                {analysis.missingSkills.map((skill, i) => {
                  const details = SKILL_GAP_DETAILS[skill];
                  return (
                    <div key={skill} className="flex items-center gap-2 p-2 rounded-lg hover:bg-red-50 transition-colors">
                      <span className="text-red-400 font-bold text-sm">✕</span>
                      <span className="text-sm text-slate-700 font-medium">{skill}</span>
                      {details && (
                        <PriorityBadge level={details.priority} />
                      )}
                    </div>
                  );
                })}
                {analysis.missingSkills.length === 0 && (
                  <p className="text-sm text-green-600 font-medium">🎉 No gaps! You have all required skills.</p>
                )}
              </div>
            </div>

            {/* Quick action */}
            <div className="card p-5 text-center"
              style={{ background: 'linear-gradient(135deg, #eff6ff, #ecfeff)' }}>
              <span className="text-3xl mb-2 block">🚀</span>
              <p className="font-semibold text-slate-800 text-sm mb-1">Ready to fix these gaps?</p>
              <p className="text-xs text-slate-500 mb-3">Your personalized roadmap is ready.</p>
              <button
                className="btn-primary w-full text-sm"
                onClick={() => navigate('roadmap')}
              >
                Start Roadmap →
              </button>
            </div>
          </div>

          {/* Right: Gap details */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="font-semibold text-slate-700">Detailed Gap Analysis</h2>
            {analysis.missingSkills.length === 0 ? (
              <div className="card p-8 text-center">
                <span className="text-5xl">🎉</span>
                <p className="text-lg font-bold text-slate-800 mt-3">No Skill Gaps!</p>
                <p className="text-slate-500 text-sm mt-1">You have all required skills for {analysis.career}.</p>
                <button className="btn-primary mt-4" onClick={() => navigate('opportunities')}>
                  View Opportunities →
                </button>
              </div>
            ) : (
              analysis.missingSkills.map((skill, i) => (
                <SkillGapCard key={skill} skill={skill} index={i} />
              ))
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
