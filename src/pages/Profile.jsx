import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AppLayout } from '../components/Layout';

export default function Profile() {
  const { student, setStudent, navigate, runAnalysis } = useApp();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(student || {});
  const [saved, setSaved] = useState(false);

  if (!student) {
    return (
      <AppLayout>
        <div className="p-6 flex flex-col items-center justify-center py-20">
          <span className="text-5xl mb-4">👤</span>
          <h2 className="text-lg font-semibold text-slate-700 mb-2">No Profile Yet</h2>
          <p className="text-slate-500 text-sm mb-6">Complete the Career Analyzer to create your profile.</p>
          <button className="btn-primary" onClick={() => navigate('analyzer')}>
            🔍 Go to Analyzer
          </button>
        </div>
      </AppLayout>
    );
  }

  const handleSave = () => {
    setStudent(form);
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleReanalyze = () => {
    runAnalysis(form);
    navigate('dashboard');
  };

  const displayStudent = editing ? form : student;

  return (
    <AppLayout>
      <div className="p-6 max-w-3xl mx-auto animate-fade-in">
        {/* Header */}
        <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
            <p className="text-slate-500 text-sm">Your career analysis profile</p>
          </div>
          <div className="flex gap-2">
            {!editing ? (
              <button className="btn-secondary text-sm" onClick={() => { setForm(student); setEditing(true); }}>
                ✏️ Edit Profile
              </button>
            ) : (
              <>
                <button className="btn-ghost text-sm" onClick={() => setEditing(false)}>Cancel</button>
                <button className="btn-primary text-sm" onClick={handleSave}>💾 Save Changes</button>
              </>
            )}
          </div>
        </div>

        {saved && (
          <div className="mb-4 p-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm font-medium animate-slide-up">
            ✅ Profile saved successfully!
          </div>
        )}

        {/* Avatar + name */}
        <div className="card p-6 mb-5">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white text-2xl font-bold">
              {student.name?.[0] || 'A'}
            </div>
            <div className="flex-1">
              {editing ? (
                <input
                  className="input font-bold text-lg mb-1"
                  value={form.name || ''}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                />
              ) : (
                <h2 className="text-xl font-bold text-slate-900">{student.name}</h2>
              )}
              <p className="text-slate-500 text-sm">{student.education} · {student.university}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="badge badge-blue">{student.experienceLevel || 'Student'}</span>
                <span className="badge badge-purple">{student.year}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="grid sm:grid-cols-2 gap-5">
          {/* Education */}
          <div className="card p-5">
            <h3 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <span>🎓</span> Education
            </h3>
            {editing ? (
              <div className="space-y-2">
                <input className="input text-sm" placeholder="Degree" value={form.education || ''} onChange={e => setForm(f => ({ ...f, education: e.target.value }))} />
                <input className="input text-sm" placeholder="University" value={form.university || ''} onChange={e => setForm(f => ({ ...f, university: e.target.value }))} />
                <input className="input text-sm" placeholder="Year" value={form.year || ''} onChange={e => setForm(f => ({ ...f, year: e.target.value }))} />
              </div>
            ) : (
              <div className="space-y-1.5">
                <p className="text-sm text-slate-800 font-medium">{student.education}</p>
                <p className="text-sm text-slate-500">{student.university}</p>
                <p className="text-sm text-slate-500">{student.year}</p>
              </div>
            )}
          </div>

          {/* Career Goal */}
          <div className="card p-5">
            <h3 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <span>🎯</span> Career Goal
            </h3>
            <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 text-center">
              <p className="text-xl font-bold text-blue-700">{student.targetCareer}</p>
              <p className="text-xs text-blue-400 mt-0.5">{student.experienceLevel} Level</p>
            </div>
          </div>

          {/* Skills */}
          <div className="card p-5 sm:col-span-2">
            <h3 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <span>⚡</span> Skills ({student.skills?.length || 0})
            </h3>
            <div className="flex flex-wrap gap-2">
              {(student.skills || []).map(skill => (
                <span key={skill} className="skill-tag skill-tag-have">{skill}</span>
              ))}
            </div>
          </div>

          {/* Projects */}
          <div className="card p-5">
            <h3 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <span>📁</span> Projects
            </h3>
            <ul className="space-y-2">
              {(student.projects || []).map((p, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-slate-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0"></span>
                  {p}
                </li>
              ))}
              {(!student.projects || student.projects.length === 0) && (
                <p className="text-sm text-slate-400 italic">No projects added</p>
              )}
            </ul>
          </div>

          {/* Certificates */}
          <div className="card p-5">
            <h3 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <span>🏆</span> Certificates
            </h3>
            <ul className="space-y-2">
              {(student.certificates || []).map((c, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-slate-700">
                  <span className="text-green-500">✓</span>
                  {c}
                </li>
              ))}
              {(!student.certificates || student.certificates.length === 0) && (
                <p className="text-sm text-slate-400 italic">No certificates added</p>
              )}
            </ul>
          </div>

          {/* Interests */}
          <div className="card p-5 sm:col-span-2">
            <h3 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <span>❤️</span> Interests
            </h3>
            <div className="flex flex-wrap gap-2">
              {(student.interests || []).map(interest => (
                <span key={interest} className="badge badge-purple">{interest}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Re-analyze */}
        <div className="mt-5 card p-5 flex items-center justify-between flex-wrap gap-3"
          style={{ background: 'linear-gradient(135deg, #eff6ff, #ecfeff)' }}>
          <div>
            <p className="font-semibold text-slate-800">Update complete?</p>
            <p className="text-xs text-slate-500">Re-run the AI analysis to get fresh results.</p>
          </div>
          <button className="btn-primary text-sm" onClick={handleReanalyze}>
            🔄 Re-analyze Profile
          </button>
        </div>
      </div>
    </AppLayout>
  );
}
