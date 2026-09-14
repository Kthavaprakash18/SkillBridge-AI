import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ProgressBar } from '../components/UI';
import { AppLayout } from '../components/Layout';
import { CAREER_DATA } from '../data/careers';

const COLOR_MAP = {
  blue: { bg: '#eff6ff', accent: '#2563eb', badge: 'badge-blue' },
  purple: { bg: '#faf5ff', accent: '#7c3aed', badge: 'badge-purple' },
  green: { bg: '#f0fdf4', accent: '#059669', badge: 'badge-green' },
  red: { bg: '#fef2f2', accent: '#dc2626', badge: 'badge-red' },
  pink: { bg: '#fdf2f8', accent: '#db2777', badge: 'badge-red' },
  cyan: { bg: '#ecfeff', accent: '#0891b2', badge: 'badge-cyan' },
  orange: { bg: '#fff7ed', accent: '#ea580c', badge: 'badge-orange' },
};

function CareerCard({ name, data, studentSkills, onCheckMatch, onNavigate }) {
  const colors = COLOR_MAP[data.color] || COLOR_MAP.blue;
  const studentLower = (studentSkills || []).map(s => s.toLowerCase());
  const matched = data.requiredSkills.filter(s =>
    studentLower.some(sl => sl.includes(s.toLowerCase()) || s.toLowerCase().includes(sl))
  );
  const matchPct = studentSkills?.length
    ? Math.round((matched.length / data.requiredSkills.length) * 100)
    : null;

  return (
    <div
      className="card card-hover p-5"
      style={{ borderTop: `3px solid ${colors.accent}` }}
    >
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
          style={{ background: colors.bg }}
        >
          {data.icon}
        </div>
        <div>
          <h3 className="font-semibold text-slate-800">{name}</h3>
          <p className="text-xs text-slate-400">{data.avgSalary}</p>
        </div>
        {matchPct !== null && (
          <span
            className="ml-auto px-2.5 py-1 rounded-full text-xs font-bold"
            style={{
              background: matchPct >= 70 ? '#ecfdf5' : matchPct >= 40 ? '#fffbeb' : '#fef2f2',
              color: matchPct >= 70 ? '#059669' : matchPct >= 40 ? '#d97706' : '#dc2626',
            }}
          >
            {matchPct}% match
          </span>
        )}
      </div>

      <p className="text-xs text-slate-500 mb-3 leading-relaxed">{data.description}</p>

      {/* Match bar */}
      {matchPct !== null && (
        <div className="mb-3">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-400">Your Match</span>
            <span className="font-semibold" style={{ color: colors.accent }}>{matchPct}%</span>
          </div>
          <ProgressBar value={matchPct} color={colors.accent} height={6} />
        </div>
      )}

      {/* Required skills */}
      <div className="mb-3">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Key Skills</p>
        <div className="flex flex-wrap gap-1">
          {data.requiredSkills.map(skill => {
            const have = studentLower.some(sl => sl.includes(skill.toLowerCase()) || skill.toLowerCase().includes(sl));
            return (
              <span
                key={skill}
                className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{
                  background: have ? '#ecfdf5' : '#f8fafc',
                  color: have ? '#065f46' : '#64748b',
                  border: have ? '1px solid #a7f3d0' : '1px solid #e2e8f0',
                }}
              >
                {have ? '✓ ' : ''}{skill}
              </span>
            );
          })}
        </div>
      </div>

      {/* Growth */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-slate-400">Market Growth</span>
        <span
          className="text-xs font-semibold px-2 py-0.5 rounded-full"
          style={{
            background: data.growth === 'Very High' ? '#ecfdf5' : '#eff6ff',
            color: data.growth === 'Very High' ? '#059669' : '#2563eb',
          }}
        >
          📈 {data.growth}
        </span>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          className="btn-primary text-sm flex-1"
          onClick={() => onCheckMatch(name)}
        >
          🎯 Check My Match
        </button>
        <button
          className="btn-ghost text-sm"
          onClick={() => onNavigate(name)}
        >
          →
        </button>
      </div>
    </div>
  );
}

export default function ExploreCareer() {
  const { student, analysis, navigate, runAnalysis } = useApp();
  const [selectedCareer, setSelectedCareer] = useState(null);
  const [checkResult, setCheckResult] = useState(null);

  const handleCheckMatch = (careerName) => {
    setSelectedCareer(careerName);
    if (student) {
      const career = CAREER_DATA[careerName];
      const studentLower = student.skills.map(s => s.toLowerCase());
      const matched = career.requiredSkills.filter(s =>
        studentLower.some(sl => sl.includes(s.toLowerCase()) || s.toLowerCase().includes(sl))
      );
      const missing = career.requiredSkills.filter(s =>
        !studentLower.some(sl => sl.includes(s.toLowerCase()) || s.toLowerCase().includes(sl))
      );
      const matchScore = Math.round((matched.length / career.requiredSkills.length) * 100);
      setCheckResult({ careerName, matched, missing, matchScore, career });
    } else {
      navigate('analyzer');
    }
  };

  const handleNavigate = (careerName) => {
    // Set target career and go to analyzer
    navigate('analyzer');
  };

  return (
    <AppLayout>
      <div className="p-6 max-w-6xl mx-auto animate-fade-in">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Explore Careers</h1>
          <p className="text-slate-500 text-sm mt-1">
            Discover career paths and see how well your profile matches each role
          </p>
        </div>

        {!student && (
          <div className="card p-4 mb-5 flex items-center gap-3"
            style={{ background: '#fffbeb', borderLeft: '4px solid #f59e0b' }}>
            <span className="text-xl">💡</span>
            <p className="text-sm text-amber-700">
              <strong>Tip:</strong> Complete the Career Analyzer first to see your personalized match percentages for each career.
            </p>
            <button className="btn-primary text-sm ml-auto whitespace-nowrap" onClick={() => navigate('analyzer')}>
              Analyze Now →
            </button>
          </div>
        )}

        {/* Career grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(CAREER_DATA).map(([name, data]) => (
            <CareerCard
              key={name}
              name={name}
              data={data}
              studentSkills={student?.skills}
              onCheckMatch={handleCheckMatch}
              onNavigate={handleNavigate}
            />
          ))}
        </div>

        {/* Match modal */}
        {checkResult && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setCheckResult(null)}>
            <div
              className="card max-w-md w-full p-6 animate-scale-in"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">{checkResult.career.icon}</span>
                <div>
                  <h2 className="font-bold text-slate-900">{checkResult.careerName}</h2>
                  <p className="text-sm text-slate-500">Your Match Analysis</p>
                </div>
                <button
                  className="ml-auto text-slate-400 hover:text-slate-700 text-xl"
                  onClick={() => setCheckResult(null)}
                >×</button>
              </div>

              {/* Match score */}
              <div className="text-center p-4 rounded-xl mb-4"
                style={{
                  background: checkResult.matchScore >= 70 ? '#ecfdf5' : '#fffbeb',
                }}>
                <p
                  className="text-4xl font-black mb-1"
                  style={{ color: checkResult.matchScore >= 70 ? '#059669' : '#d97706' }}
                >
                  {checkResult.matchScore}%
                </p>
                <p className="text-sm font-semibold text-slate-600">Career Match</p>
              </div>

              <ProgressBar
                value={checkResult.matchScore}
                color={checkResult.matchScore >= 70 ? '#059669' : '#f59e0b'}
                height={8}
              />

              <div className="grid grid-cols-2 gap-3 mt-4 mb-4">
                <div>
                  <p className="text-xs text-slate-400 font-semibold mb-1.5">You Have ✓</p>
                  {checkResult.matched.map(s => (
                    <p key={s} className="text-xs text-green-600 font-medium py-0.5">✓ {s}</p>
                  ))}
                  {checkResult.matched.length === 0 && (
                    <p className="text-xs text-slate-400 italic">None yet</p>
                  )}
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-semibold mb-1.5">You Need ✕</p>
                  {checkResult.missing.map(s => (
                    <p key={s} className="text-xs text-red-500 font-medium py-0.5">✕ {s}</p>
                  ))}
                  {checkResult.missing.length === 0 && (
                    <p className="text-xs text-green-600 font-semibold">🎉 All skills matched!</p>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  className="btn-primary flex-1 text-sm"
                  onClick={() => {
                    setCheckResult(null);
                    navigate('analyzer');
                  }}
                >
                  Analyze for This Career →
                </button>
                <button className="btn-ghost text-sm" onClick={() => setCheckResult(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
