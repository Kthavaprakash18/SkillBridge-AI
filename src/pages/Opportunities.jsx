import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { SkillTag, MatchBadge, EmptyState } from '../components/UI';
import { AppLayout } from '../components/Layout';

function OpportunityCard({ opp, index }) {
  const [saved, setSaved] = useState(false);
  const scoreColor = opp.matchScore >= 80 ? '#059669' : opp.matchScore >= 65 ? '#d97706' : '#dc2626';
  const scoreBg = opp.matchScore >= 80 ? '#ecfdf5' : opp.matchScore >= 65 ? '#fffbeb' : '#fef2f2';

  return (
    <div
      className="card card-hover p-5"
      style={{ animation: `slideUp 0.3s ease ${index * 0.07}s both` }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-xl border border-slate-100">
            {opp.companyLogo}
          </div>
          <div>
            <h3 className="font-semibold text-slate-800">{opp.title}</h3>
            <p className="text-sm text-slate-500">{opp.company}</p>
          </div>
        </div>
        <div
          className="px-3 py-1 rounded-full text-sm font-black flex-shrink-0"
          style={{ background: scoreBg, color: scoreColor }}
        >
          {opp.matchScore}% Match
        </div>
      </div>

      {/* Details */}
      <div className="flex flex-wrap gap-2 mb-3">
        <span className="badge badge-blue">📍 {opp.location}</span>
        <span className={`badge ${opp.type === 'Internship' ? 'badge-purple' : 'badge-cyan'}`}>
          {opp.type}
        </span>
        <span className="badge badge-green">💰 {opp.stipend}</span>
        <span className="badge" style={{ background: '#f1f5f9', color: '#64748b' }}>
          🕐 Posted {opp.postedDays}d ago
        </span>
      </div>

      {/* Skill match */}
      <div className="grid grid-cols-2 gap-2 mb-3 p-3 bg-slate-50 rounded-xl">
        <div>
          <p className="text-xs text-slate-400 font-semibold mb-1.5">Your Match</p>
          <div className="space-y-1">
            {opp.requiredSkills.map(s => {
              const have = opp.matchedSkills.includes(s);
              return (
                <div key={s} className="flex items-center gap-1.5 text-xs">
                  <span className={have ? 'text-green-500' : 'text-red-400'}>{have ? '✓' : '✕'}</span>
                  <span className={have ? 'text-slate-700' : 'text-slate-400'}>{s}</span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400 font-semibold mb-1.5">Gap Skills</p>
          <div className="space-y-1">
            {opp.missingSkills.length === 0 ? (
              <p className="text-xs text-green-600 font-medium">None! 🎉</p>
            ) : (
              opp.missingSkills.map(s => (
                <span key={s} className="text-xs text-red-500 block">{s}</span>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Deadline */}
      <p className="text-xs text-slate-400 mb-3">⏰ Apply by: <strong>{opp.deadline}</strong></p>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          className="btn-primary text-sm flex-1"
          onClick={() => window.open('https://internshala.com', '_blank')}
        >
          View Opportunity →
        </button>
        <button
          className={`btn-ghost text-sm px-3 ${saved ? 'text-blue-600' : ''}`}
          onClick={() => setSaved(s => !s)}
          title="Save for later"
        >
          {saved ? '🔖' : '♡'}
        </button>
      </div>
    </div>
  );
}

export default function Opportunities() {
  const { analysis, navigate, loadDemo } = useApp();

  const [filters, setFilters] = useState({
    type: 'All',
    minMatch: 0,
    location: 'All',
  });
  const [sortBy, setSortBy] = useState('match');

  if (!analysis) {
    return (
      <AppLayout>
        <div className="p-6">
          <EmptyState
            icon="💼"
            title="No Opportunities Yet"
            description="Run the Career Analyzer to get AI-matched internship and job recommendations."
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

  const locations = ['All', ...new Set(analysis.opportunities.map(o => o.location))];

  const filtered = useMemo(() => {
    let ops = analysis.opportunities;
    if (filters.type !== 'All') ops = ops.filter(o => o.type === filters.type);
    if (filters.location !== 'All') ops = ops.filter(o => o.location === filters.location);
    ops = ops.filter(o => o.matchScore >= filters.minMatch);
    if (sortBy === 'match') ops = [...ops].sort((a, b) => b.matchScore - a.matchScore);
    if (sortBy === 'recent') ops = [...ops].sort((a, b) => a.postedDays - b.postedDays);
    return ops;
  }, [analysis.opportunities, filters, sortBy]);

  return (
    <AppLayout>
      <div className="p-6 max-w-5xl mx-auto animate-fade-in">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">AI Opportunity Match</h1>
          <p className="text-slate-500 text-sm mt-1">
            Curated opportunities matched to your profile for <strong>{analysis.career}</strong>
          </p>
        </div>

        {/* Top opportunity highlight */}
        {filtered[0] && (
          <div
            className="card p-5 mb-5 flex items-center gap-4 flex-wrap"
            style={{ borderLeft: '4px solid #2563eb', background: 'linear-gradient(135deg, #fff, #f0f7ff)' }}
          >
            <div className="text-2xl">🏆</div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-blue-500 font-semibold uppercase tracking-wider">Best Match for You</p>
              <p className="font-bold text-slate-800">{filtered[0].title} — {filtered[0].company}</p>
              <p className="text-xs text-slate-500">{filtered[0].location} · {filtered[0].type} · {filtered[0].stipend}</p>
            </div>
            <MatchBadge score={filtered[0].matchScore} />
            <button
              className="btn-primary text-sm"
              onClick={() => window.open('https://internshala.com', '_blank')}
            >
              Apply Now →
            </button>
          </div>
        )}

        {/* Filters */}
        <div className="card p-4 mb-5 flex flex-wrap gap-3 items-end">
          <div>
            <label className="label text-xs">Type</label>
            <select
              className="input py-1.5 text-sm w-36"
              value={filters.type}
              onChange={e => setFilters(f => ({ ...f, type: e.target.value }))}
            >
              <option value="All">All Types</option>
              <option value="Internship">Internship</option>
              <option value="Full-time">Full-time</option>
            </select>
          </div>
          <div>
            <label className="label text-xs">Location</label>
            <select
              className="input py-1.5 text-sm w-36"
              value={filters.location}
              onChange={e => setFilters(f => ({ ...f, location: e.target.value }))}
            >
              {locations.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="label text-xs">Min Match %</label>
            <select
              className="input py-1.5 text-sm w-32"
              value={filters.minMatch}
              onChange={e => setFilters(f => ({ ...f, minMatch: Number(e.target.value) }))}
            >
              <option value={0}>Any</option>
              <option value={50}>50%+</option>
              <option value={70}>70%+</option>
              <option value={80}>80%+</option>
            </select>
          </div>
          <div>
            <label className="label text-xs">Sort By</label>
            <select
              className="input py-1.5 text-sm w-32"
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
            >
              <option value="match">Match %</option>
              <option value="recent">Most Recent</option>
            </select>
          </div>
          <div className="ml-auto self-end">
            <span className="text-sm text-slate-500 font-medium">{filtered.length} opportunities</span>
          </div>
        </div>

        {/* Cards grid */}
        {filtered.length === 0 ? (
          <div className="card p-8 text-center">
            <span className="text-4xl">🔍</span>
            <p className="font-semibold text-slate-700 mt-2">No results match your filters</p>
            <button
              className="btn-ghost text-sm mt-3"
              onClick={() => setFilters({ type: 'All', minMatch: 0, location: 'All' })}
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {filtered.map((opp, i) => (
              <OpportunityCard key={opp.id} opp={opp} index={i} />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
