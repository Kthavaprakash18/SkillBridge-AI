import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AppLayout } from '../components/Layout';

const SECTIONS = [
  { id: 'profile', label: 'Profile Settings', icon: '👤' },
  { id: 'notifications', label: 'Notifications', icon: '🔔' },
  { id: 'career', label: 'Career Preferences', icon: '🎯' },
  { id: 'privacy', label: 'Privacy', icon: '🔒' },
];

function Toggle({ value, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
      style={{ background: value ? '#2563eb' : '#e2e8f0' }}
    >
      <span
        className="inline-block h-4 w-4 rounded-full bg-white transition-transform"
        style={{ transform: value ? 'translateX(24px)' : 'translateX(4px)', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}
      />
    </button>
  );
}

export default function Settings() {
  const { student, navigate } = useApp();
  const [activeSection, setActiveSection] = useState('profile');
  const [notifs, setNotifs] = useState({
    emailUpdates: true,
    jobAlerts: true,
    weeklyReport: false,
    roadmapReminders: true,
  });
  const [prefs, setPrefs] = useState({
    jobType: 'Both',
    location: 'Remote & On-site',
    salary: '₹10,000+ /month',
    openToRelocation: true,
  });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <AppLayout>
      <div className="p-6 max-w-4xl mx-auto animate-fade-in">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
          <p className="text-slate-500 text-sm">Manage your account and preferences</p>
        </div>

        {saved && (
          <div className="mb-4 p-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm font-medium animate-slide-up">
            ✅ Settings saved!
          </div>
        )}

        <div className="grid sm:grid-cols-4 gap-5">
          {/* Sidebar */}
          <div className="card p-3 h-fit">
            {SECTIONS.map(section => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`sidebar-link w-full ${activeSection === section.id ? 'active' : ''}`}
              >
                <span>{section.icon}</span>
                <span>{section.label}</span>
              </button>
            ))}
            <div className="mt-3 pt-3 border-t border-slate-100">
              <button
                className="sidebar-link w-full text-red-500 hover:bg-red-50 hover:text-red-600"
                onClick={() => navigate('landing')}
              >
                <span>🚪</span>
                <span>Logout</span>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="sm:col-span-3 space-y-4">
            {activeSection === 'profile' && (
              <div className="card p-6">
                <h2 className="font-semibold text-slate-800 mb-4">Profile Settings</h2>
                {student ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white text-xl font-bold">
                        {student.name?.[0] || 'A'}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800">{student.name}</p>
                        <p className="text-sm text-slate-500">{student.email || 'ananya@example.com'}</p>
                      </div>
                      <button className="btn-ghost text-sm ml-auto" onClick={() => navigate('profile')}>
                        Edit Profile →
                      </button>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="label">Display Name</label>
                        <input className="input" defaultValue={student.name} />
                      </div>
                      <div>
                        <label className="label">Email</label>
                        <input className="input" type="email" defaultValue={student.email || 'ananya@example.com'} />
                      </div>
                      <div>
                        <label className="label">Education</label>
                        <input className="input" defaultValue={student.education} />
                      </div>
                      <div>
                        <label className="label">University</label>
                        <input className="input" defaultValue={student.university} />
                      </div>
                    </div>
                    <button className="btn-primary text-sm" onClick={handleSave}>Save Changes</button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-slate-500 text-sm mb-3">No profile created yet.</p>
                    <button className="btn-primary text-sm" onClick={() => navigate('analyzer')}>
                      Create Profile →
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeSection === 'notifications' && (
              <div className="card p-6">
                <h2 className="font-semibold text-slate-800 mb-4">Notification Preferences</h2>
                <div className="space-y-4">
                  {[
                    { key: 'emailUpdates', label: 'Email Updates', desc: 'Receive product updates and news' },
                    { key: 'jobAlerts', label: 'Job & Internship Alerts', desc: 'Get notified when new matching opportunities appear' },
                    { key: 'weeklyReport', label: 'Weekly Progress Report', desc: 'Summary of your roadmap and skill progress every week' },
                    { key: 'roadmapReminders', label: 'Roadmap Reminders', desc: 'Reminders to continue your learning steps' },
                  ].map(item => (
                    <div key={item.key} className="flex items-center justify-between py-3 border-b border-slate-50">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{item.label}</p>
                        <p className="text-xs text-slate-500">{item.desc}</p>
                      </div>
                      <Toggle
                        value={notifs[item.key]}
                        onChange={val => setNotifs(n => ({ ...n, [item.key]: val }))}
                      />
                    </div>
                  ))}
                </div>
                <button className="btn-primary text-sm mt-4" onClick={handleSave}>Save Preferences</button>
              </div>
            )}

            {activeSection === 'career' && (
              <div className="card p-6">
                <h2 className="font-semibold text-slate-800 mb-4">Career Preferences</h2>
                <div className="space-y-4">
                  <div>
                    <label className="label">Preferred Job Type</label>
                    <select
                      className="input"
                      value={prefs.jobType}
                      onChange={e => setPrefs(p => ({ ...p, jobType: e.target.value }))}
                    >
                      <option>Both</option>
                      <option>Internship Only</option>
                      <option>Full-time Only</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Preferred Location</label>
                    <select
                      className="input"
                      value={prefs.location}
                      onChange={e => setPrefs(p => ({ ...p, location: e.target.value }))}
                    >
                      <option>Remote & On-site</option>
                      <option>Remote Only</option>
                      <option>On-site Only</option>
                      <option>Hybrid</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Minimum Compensation</label>
                    <select
                      className="input"
                      value={prefs.salary}
                      onChange={e => setPrefs(p => ({ ...p, salary: e.target.value }))}
                    >
                      <option>Any</option>
                      <option>₹5,000+ /month</option>
                      <option>₹10,000+ /month</option>
                      <option>₹20,000+ /month</option>
                      <option>₹3 LPA+ (Full-time)</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between py-3 border-t border-slate-100">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">Open to Relocation</p>
                      <p className="text-xs text-slate-500">Show opportunities requiring relocation</p>
                    </div>
                    <Toggle
                      value={prefs.openToRelocation}
                      onChange={val => setPrefs(p => ({ ...p, openToRelocation: val }))}
                    />
                  </div>
                </div>
                <button className="btn-primary text-sm mt-4" onClick={handleSave}>Save Preferences</button>
              </div>
            )}

            {activeSection === 'privacy' && (
              <div className="card p-6">
                <h2 className="font-semibold text-slate-800 mb-4">Privacy Settings</h2>
                <div className="space-y-4">
                  {[
                    { label: 'Profile Visibility', desc: 'Allow recruiters to find your profile', defaultOn: true },
                    { label: 'Anonymous Analytics', desc: 'Help us improve with anonymous usage data', defaultOn: true },
                    { label: 'Share Progress', desc: 'Show your roadmap progress to connections', defaultOn: false },
                  ].map(item => {
                    const [on, setOn] = useState(item.defaultOn);
                    return (
                      <div key={item.label} className="flex items-center justify-between py-3 border-b border-slate-50">
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{item.label}</p>
                          <p className="text-xs text-slate-500">{item.desc}</p>
                        </div>
                        <Toggle value={on} onChange={setOn} />
                      </div>
                    );
                  })}
                  <div className="pt-2">
                    <button className="btn-ghost text-sm text-red-500 hover:bg-red-50 hover:text-red-600">
                      🗑️ Delete My Account
                    </button>
                  </div>
                </div>
                <button className="btn-primary text-sm mt-4" onClick={handleSave}>Save Settings</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
