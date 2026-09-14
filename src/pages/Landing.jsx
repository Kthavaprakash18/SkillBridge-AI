import React, { useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Counter, ProgressBar } from '../components/UI';

const STEPS = [
  { label: 'Student Skills', icon: '🎓', color: '#2563eb' },
  { label: 'AI Analysis', icon: '🤖', color: '#7c3aed' },
  { label: 'Skill Gap', icon: '📊', color: '#0891b2' },
  { label: 'Learning Roadmap', icon: '🗺️', color: '#059669' },
  { label: 'Career Opportunity', icon: '🚀', color: '#d97706' },
];

const STATS = [
  { value: 50000, suffix: '+', label: 'Students Guided' },
  { value: 95, suffix: '%', label: 'Accuracy Rate' },
  { value: 200, suffix: '+', label: 'Career Paths' },
  { value: 1000, suffix: '+', label: 'Opportunities' },
];

const PROBLEMS = [
  { icon: '🧭', title: 'Career Confusion', desc: 'Which career actually fits my skills?' },
  { icon: '📚', title: 'Generic Learning', desc: 'What should I learn next?' },
  { icon: '🔍', title: 'Hidden Skill Gaps', desc: 'What skills am I missing?' },
  { icon: '🔌', title: 'Opportunity Gap', desc: 'Which internships or jobs match me?' },
];

const HOW_STEPS = [
  { num: '01', title: 'Build Profile', desc: 'Add your skills, projects, certificates, and career goal in minutes.', icon: '👤' },
  { num: '02', title: 'AI Skill Analysis', desc: 'Our AI engine analyzes your profile against real industry requirements.', icon: '🤖' },
  { num: '03', title: 'Detect Skill Gaps', desc: 'See exactly which skills you need to become job-ready for your target role.', icon: '📊' },
  { num: '04', title: 'Generate Roadmap', desc: 'Get a step-by-step personalized learning path with curated resources.', icon: '🗺️' },
  { num: '05', title: 'Match Opportunities', desc: 'Discover internships and jobs that best match your current profile.', icon: '💼' },
];

export default function Landing() {
  const { navigate, loadDemo } = useApp();

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center gap-8">
          <button
            className="flex items-center gap-2.5"
            onClick={() => navigate('landing')}
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold"
              style={{ background: 'linear-gradient(135deg, #2563eb, #06b6d4)' }}>
              S
            </div>
            <span className="font-bold text-slate-900">SkillBridge <span className="gradient-text">AI</span></span>
          </button>

          <div className="hidden md:flex items-center gap-1 ml-4">
            {['Features', 'How It Works', 'Careers'].map(item => (
              <button key={item} className="px-3 py-1.5 text-sm text-slate-600 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                {item}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <button className="btn-ghost text-sm hidden sm:flex" onClick={() => navigate('analyzer')}>Sign In</button>
            <button className="btn-primary text-sm" onClick={() => navigate('analyzer')}>
              Get Started →
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          {/* AI status indicator */}
          <div className="flex justify-center mb-8">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 border border-green-200 text-sm text-green-700 font-medium">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse-soft"></span>
              AI Career Engine — Online
            </span>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text */}
            <div className="animate-slide-up">
              <h1 className="text-5xl lg:text-6xl font-black text-slate-900 leading-tight mb-4">
                Skill<span className="gradient-text">Bridge</span> AI
              </h1>
              <p className="text-2xl font-semibold text-slate-700 mb-4">
                "Your Skills. Your Future."
              </p>
              <p className="text-lg text-slate-500 leading-relaxed mb-8 max-w-lg">
                Discover your career path, identify your skill gaps, build a personalized roadmap,
                and connect with opportunities — powered by AI.
              </p>

              <div className="flex flex-wrap gap-3 mb-8">
                <button className="btn-primary text-base px-6 py-3" onClick={() => navigate('analyzer')}>
                  🔍 Analyze My Skills
                </button>
                <button className="btn-secondary text-base px-6 py-3" onClick={() => navigate('explore')}>
                  🚀 Explore Careers
                </button>
              </div>

              {/* Demo CTA */}
              <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-100">
                <span className="text-2xl">🎯</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-700">See it in action instantly</p>
                  <p className="text-xs text-slate-500">Load demo student profile — no sign-up needed</p>
                </div>
                <button
                  className="btn-primary text-sm px-4 py-2 whitespace-nowrap"
                  onClick={loadDemo}
                >
                  Try Demo
                </button>
              </div>
            </div>

            {/* Right: Bridge visual */}
            <div className="flex justify-center animate-fade-in">
              <div className="relative">
                <div className="flex flex-col items-center gap-0">
                  {STEPS.map((step, i) => (
                    <React.Fragment key={i}>
                      <div
                        className="card-hover card flex items-center gap-3 px-6 py-3.5 rounded-xl w-64"
                        style={{
                          borderLeft: `3px solid ${step.color}`,
                          animation: `slideUp 0.4s ease ${i * 0.1}s both`,
                        }}
                      >
                        <span className="text-xl">{step.icon}</span>
                        <span className="font-semibold text-sm text-slate-700">{step.label}</span>
                        <span
                          className="ml-auto w-2 h-2 rounded-full"
                          style={{ background: step.color }}
                        />
                      </div>
                      {i < STEPS.length - 1 && (
                        <div className="hero-bridge-line" />
                      )}
                    </React.Fragment>
                  ))}
                </div>

                {/* Decorative elements */}
                <div
                  className="absolute -top-4 -right-4 w-12 h-12 rounded-full opacity-20"
                  style={{ background: '#06b6d4' }}
                />
                <div
                  className="absolute -bottom-4 -left-4 w-8 h-8 rounded-full opacity-15"
                  style={{ background: '#2563eb' }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-slate-50 border-y border-slate-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl font-black text-blue-600 mb-1">
                  <Counter target={stat.value} suffix={stat.suffix} />
                </div>
                <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-3">The Problem</p>
            <h2 className="text-4xl font-bold text-slate-900 max-w-xl mx-auto leading-tight">
              Students don't lack potential.<br />They lack <span className="gradient-text">direction.</span>
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {PROBLEMS.map((p, i) => (
              <div key={i} className="card card-hover p-6">
                <div className="text-3xl mb-3">{p.icon}</div>
                <h3 className="font-semibold text-slate-800 mb-2">{p.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">"{p.desc}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-3">How It Works</p>
            <h2 className="text-4xl font-bold text-slate-900">From Student to Opportunity</h2>
            <p className="section-subtitle mt-2 max-w-lg mx-auto">5 simple steps to unlock your personalized career path</p>
          </div>

          <div className="max-w-3xl mx-auto">
            {HOW_STEPS.map((step, i) => (
              <div key={i} className="timeline-item mb-8">
                <div
                  className="timeline-dot text-white font-bold"
                  style={{ background: 'linear-gradient(135deg, #2563eb, #06b6d4)', fontSize: 10 }}
                >
                  {i + 1}
                </div>
                <div className="card card-hover p-5">
                  <div className="flex items-start gap-4">
                    <div className="text-2xl">{step.icon}</div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-blue-400">{step.num}</span>
                        <h3 className="font-semibold text-slate-800">{step.title}</h3>
                      </div>
                      <p className="text-sm text-slate-500 leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 px-6"
        style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #0e7490 100%)' }}>
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-blue-300 text-sm font-semibold uppercase tracking-wider mb-4">SkillBridge AI</p>
          <h2 className="text-4xl font-black text-white mb-4 leading-tight">
            "We don't just recommend a job.<br />
            We show you how to become ready for it."
          </h2>
          <p className="text-blue-200 text-lg mb-2">Discover. Improve. Connect.</p>
          <p className="text-blue-300 text-sm mb-10">Join thousands of students who found their path with SkillBridge AI</p>

          <div className="flex flex-wrap gap-4 justify-center">
            <button
              className="text-base px-8 py-3.5 font-semibold rounded-xl text-white transition-all"
              style={{ background: 'linear-gradient(135deg, #06b6d4, #2563eb)', boxShadow: '0 4px 20px rgb(6 182 212 / 0.4)' }}
              onClick={() => navigate('analyzer')}
            >
              🚀 Start Your Career Analysis
            </button>
            <button
              className="text-base px-8 py-3.5 font-semibold rounded-xl transition-all text-white border border-white/20 hover:bg-white/10"
              onClick={loadDemo}
            >
              👁️ Try Demo
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md flex items-center justify-center text-white text-xs font-bold"
              style={{ background: 'linear-gradient(135deg, #2563eb, #06b6d4)' }}>
              S
            </div>
            <span className="text-slate-400 text-sm">SkillBridge AI — Your Skills. Your Future.</span>
          </div>
          <p className="text-slate-600 text-xs">© 2026 SkillBridge AI. Built for students, by builders.</p>
        </div>
      </footer>
    </div>
  );
}
