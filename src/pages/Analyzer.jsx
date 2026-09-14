import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { CAREER_DATA, DEMO_STUDENT } from '../data/careers';
import { Spinner } from '../components/UI';
import { AppLayout } from '../components/Layout';

const ANALYSIS_STEPS = [
  'Reading profile...',
  'Extracting skills...',
  'Comparing career requirements...',
  'Identifying skill gaps...',
  'Generating recommendations...',
];

const ALL_SKILLS = [
  'Python', 'SQL', 'Excel', 'Statistics', 'Power BI', 'Data Visualization',
  'Machine Learning', 'TensorFlow', 'Data Structures', 'Algorithms', 'Git',
  'Database', 'Problem Solving', 'Programming', 'Networking', 'Linux',
  'Security Fundamentals', 'SIEM', 'Threat Analysis', 'Figma', 'UX Research',
  'Wireframing', 'Prototyping', 'Visual Design', 'AWS/Azure/GCP', 'Docker',
  'Kubernetes', 'Communication', 'Agile', 'User Research', 'Product Thinking',
];

const EXPERIENCE_LEVELS = ['Student', 'Fresher', '0–1 Year Experience', '1–2 Years Experience'];
const EDUCATION_LEVELS = ['B.Tech/B.E.', 'BCA', 'B.Sc Computer Science', 'B.Com', 'MBA', 'M.Tech', 'MCA', 'Diploma', 'Other'];

function SkillChip({ skill, selected, onToggle }) {
  return (
    <button
      type="button"
      onClick={() => onToggle(skill)}
      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all border ${
        selected
          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
          : 'bg-white text-slate-600 border-slate-200 hover:border-blue-400 hover:text-blue-600'
      }`}
    >
      {selected ? '✓ ' : ''}{skill}
    </button>
  );
}

export default function Analyzer() {
  const { runAnalysis, navigate, loadDemo, student: existingStudent } = useApp();

  const [form, setForm] = useState({
    name: existingStudent?.name || '',
    education: existingStudent?.education || '',
    university: existingStudent?.university || '',
    year: existingStudent?.year || '',
    skills: existingStudent?.skills || [],
    projects: existingStudent?.projects?.join(', ') || '',
    certificates: existingStudent?.certificates?.join(', ') || '',
    interests: existingStudent?.interests?.join(', ') || '',
    targetCareer: existingStudent?.targetCareer || '',
    experienceLevel: existingStudent?.experienceLevel || '',
  });

  const [customSkill, setCustomSkill] = useState('');
  const [errors, setErrors] = useState({});
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [uploadLabel, setUploadLabel] = useState('Upload Resume (PDF)');
  const [uploadDone, setUploadDone] = useState(false);

  const toggleSkill = (skill) => {
    setForm(f => ({
      ...f,
      skills: f.skills.includes(skill)
        ? f.skills.filter(s => s !== skill)
        : [...f.skills, skill],
    }));
  };

  const addCustomSkill = () => {
    const trimmed = customSkill.trim();
    if (trimmed && !form.skills.includes(trimmed)) {
      setForm(f => ({ ...f, skills: [...f.skills, trimmed] }));
      setCustomSkill('');
    }
  };

  const handleUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadLabel(`📄 ${file.name}`);
      setTimeout(() => {
        setUploadDone(true);
        // Simulate extracting skills from resume
      }, 800);
    }
  };

  const validate = () => {
    const err = {};
    if (!form.name.trim()) err.name = 'Name is required';
    if (!form.education) err.education = 'Education is required';
    if (form.skills.length === 0) err.skills = 'Add at least one skill';
    if (!form.targetCareer) err.targetCareer = 'Select a target career';
    return err;
  };

  const handleAnalyze = async () => {
    const err = validate();
    if (Object.keys(err).length) {
      setErrors(err);
      return;
    }
    setErrors({});
    setAnalyzing(true);
    setAnalysisStep(0);

    for (let i = 0; i < ANALYSIS_STEPS.length; i++) {
      await new Promise(r => setTimeout(r, 700 + i * 200));
      setAnalysisStep(i + 1);
    }

    const studentData = {
      ...form,
      projects: form.projects.split(',').map(p => p.trim()).filter(Boolean),
      certificates: form.certificates.split(',').map(c => c.trim()).filter(Boolean),
      interests: form.interests.split(',').map(i => i.trim()).filter(Boolean),
    };

    runAnalysis(studentData);
    await new Promise(r => setTimeout(r, 500));
    navigate('dashboard');
  };

  const fillDemo = () => {
    setForm({
      name: DEMO_STUDENT.name,
      education: DEMO_STUDENT.education,
      university: DEMO_STUDENT.university,
      year: DEMO_STUDENT.year,
      skills: [...DEMO_STUDENT.skills],
      projects: DEMO_STUDENT.projects.join(', '),
      certificates: DEMO_STUDENT.certificates.join(', '),
      interests: DEMO_STUDENT.interests.join(', '),
      targetCareer: DEMO_STUDENT.targetCareer,
      experienceLevel: DEMO_STUDENT.experienceLevel,
    });
  };

  if (analyzing) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-full py-20 px-6">
          <div className="card p-10 max-w-md w-full text-center animate-scale-in">
            {/* AI animation */}
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: 'linear-gradient(135deg, #2563eb22, #06b6d422)',
                  animation: 'pulseSoft 1.5s ease-in-out infinite',
                }}
              />
              <div className="absolute inset-2 rounded-full bg-white flex items-center justify-center">
                <span className="text-3xl">🤖</span>
              </div>
            </div>

            <h2 className="text-xl font-bold text-slate-800 mb-2">Analyzing Your Profile</h2>
            <p className="text-slate-500 text-sm mb-8">Powered by SkillBridge AI Engine</p>

            <div className="space-y-3 mb-8">
              {ANALYSIS_STEPS.map((step, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                    i < analysisStep
                      ? 'bg-green-50 text-green-700'
                      : i === analysisStep
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-slate-300'
                  }`}
                >
                  {i < analysisStep ? (
                    <span className="text-green-500 font-bold">✓</span>
                  ) : i === analysisStep ? (
                    <Spinner size={16} color="#2563eb" />
                  ) : (
                    <span className="w-4 h-4 rounded-full border-2 border-slate-200 flex-shrink-0" />
                  )}
                  <span className="text-sm font-medium">{step}</span>
                </div>
              ))}
            </div>

            <div className="w-full bg-slate-100 rounded-full h-1.5">
              <div
                className="h-1.5 rounded-full transition-all duration-700"
                style={{
                  width: `${(analysisStep / ANALYSIS_STEPS.length) * 100}%`,
                  background: 'linear-gradient(90deg, #2563eb, #06b6d4)',
                }}
              />
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">AI Career Analyzer</h1>
              <p className="text-slate-500 text-sm mt-1">Fill in your details and let AI map your career path</p>
            </div>
            <button
              type="button"
              onClick={fillDemo}
              className="btn-secondary text-sm gap-2"
            >
              🎯 Fill Demo Profile
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main form */}
          <div className="lg:col-span-2 space-y-5">

            {/* Personal Info */}
            <div className="card p-6">
              <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <span>👤</span> Personal Information
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Full Name *</label>
                  <input
                    className={`input ${errors.name ? 'border-red-400' : ''}`}
                    placeholder="e.g. Ananya Sharma"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>
                <div>
                  <label className="label">University / College</label>
                  <input
                    className="input"
                    placeholder="e.g. VIT University"
                    value={form.university}
                    onChange={e => setForm(f => ({ ...f, university: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="label">Education *</label>
                  <select
                    className={`input ${errors.education ? 'border-red-400' : ''}`}
                    value={form.education}
                    onChange={e => setForm(f => ({ ...f, education: e.target.value }))}
                  >
                    <option value="">Select degree</option>
                    {EDUCATION_LEVELS.map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                  {errors.education && <p className="text-red-500 text-xs mt-1">{errors.education}</p>}
                </div>
                <div>
                  <label className="label">Year of Study</label>
                  <select
                    className="input"
                    value={form.year}
                    onChange={e => setForm(f => ({ ...f, year: e.target.value }))}
                  >
                    <option value="">Select year</option>
                    {['1st Year', '2nd Year', '3rd Year', '4th Year', 'Graduated'].map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Experience Level</label>
                  <select
                    className="input"
                    value={form.experienceLevel}
                    onChange={e => setForm(f => ({ ...f, experienceLevel: e.target.value }))}
                  >
                    <option value="">Select level</option>
                    {EXPERIENCE_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Interests / Domains</label>
                  <input
                    className="input"
                    placeholder="e.g. Data Science, AI, Finance"
                    value={form.interests}
                    onChange={e => setForm(f => ({ ...f, interests: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            {/* Skills */}
            <div className="card p-6">
              <h2 className="font-semibold text-slate-800 mb-1 flex items-center gap-2">
                <span>⚡</span> Your Skills *
              </h2>
              <p className="text-xs text-slate-500 mb-4">Select all skills you currently have</p>

              <div className="flex flex-wrap gap-2 mb-4">
                {ALL_SKILLS.map(skill => (
                  <SkillChip
                    key={skill}
                    skill={skill}
                    selected={form.skills.includes(skill)}
                    onToggle={toggleSkill}
                  />
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  className="input flex-1"
                  placeholder="Add custom skill..."
                  value={customSkill}
                  onChange={e => setCustomSkill(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addCustomSkill()}
                />
                <button type="button" className="btn-primary" onClick={addCustomSkill}>Add</button>
              </div>

              {form.skills.length > 0 && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-700 font-semibold mb-1.5">Selected ({form.skills.length}):</p>
                  <div className="flex flex-wrap gap-1.5">
                    {form.skills.map(s => (
                      <span key={s} className="badge badge-blue">
                        {s}
                        <button
                          type="button"
                          onClick={() => toggleSkill(s)}
                          className="ml-1 text-blue-400 hover:text-blue-700"
                        >×</button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {errors.skills && <p className="text-red-500 text-xs mt-2">{errors.skills}</p>}
            </div>

            {/* Projects & Certs */}
            <div className="card p-6">
              <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <span>📁</span> Projects & Certificates
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="label">Projects (comma-separated)</label>
                  <textarea
                    className="input"
                    rows={2}
                    placeholder="e.g. Sales Prediction System, Customer Dashboard"
                    value={form.projects}
                    onChange={e => setForm(f => ({ ...f, projects: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="label">Certificates (comma-separated)</label>
                  <textarea
                    className="input"
                    rows={2}
                    placeholder="e.g. Python Fundamentals (Coursera), Google Data Analytics"
                    value={form.certificates}
                    onChange={e => setForm(f => ({ ...f, certificates: e.target.value }))}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right sidebar */}
          <div className="space-y-5">
            {/* Target career */}
            <div className="card p-6">
              <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <span>🎯</span> Target Career *
              </h2>
              <div className="space-y-2">
                {Object.entries(CAREER_DATA).map(([career, data]) => (
                  <button
                    key={career}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, targetCareer: career }))}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                      form.targetCareer === career
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-slate-100 hover:border-blue-200 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-xl">{data.icon}</span>
                    <div>
                      <p className={`text-sm font-semibold ${form.targetCareer === career ? 'text-blue-700' : 'text-slate-700'}`}>
                        {career}
                      </p>
                      <p className="text-xs text-slate-400">{data.avgSalary}</p>
                    </div>
                    {form.targetCareer === career && (
                      <span className="ml-auto text-blue-500 font-bold">✓</span>
                    )}
                  </button>
                ))}
              </div>
              {errors.targetCareer && <p className="text-red-500 text-xs mt-2">{errors.targetCareer}</p>}
            </div>

            {/* Resume Upload */}
            <div className="card p-6">
              <h2 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <span>📄</span> Resume Upload
              </h2>
              <label className="flex flex-col items-center justify-center gap-2 p-4 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all">
                <span className="text-2xl">{uploadDone ? '✅' : '📤'}</span>
                <span className="text-sm font-medium text-slate-600">{uploadLabel}</span>
                <span className="text-xs text-slate-400">{uploadDone ? 'Resume uploaded!' : 'Click to upload PDF'}</span>
                <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleUpload} />
              </label>
              {uploadDone && (
                <p className="text-xs text-green-600 font-medium mt-2 text-center">
                  ✓ Skills will be extracted automatically
                </p>
              )}
            </div>

            {/* Analyze button */}
            <button
              type="button"
              onClick={handleAnalyze}
              className="w-full py-4 rounded-xl font-bold text-white text-base transition-all"
              style={{
                background: 'linear-gradient(135deg, #2563eb, #06b6d4)',
                boxShadow: '0 4px 20px rgb(37 99 235 / 0.35)',
              }}
            >
              🔍 Analyze My Career
            </button>

            <div className="text-center">
              <p className="text-xs text-slate-400">Analysis takes ~3 seconds</p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
