import React, { useEffect, useRef, useState } from 'react';

// Animated number counter
export function Counter({ target, suffix = '', duration = 1200 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const start = Date.now();
        const tick = () => {
          const elapsed = Date.now() - start;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setCount(Math.round(eased * target));
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
}

// Animated progress bar
export function ProgressBar({ value, color = '#2563eb', height = 8, animated = true, className = '' }) {
  const [width, setWidth] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setTimeout(() => setWidth(value), 100);
      }
    }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value]);

  return (
    <div
      ref={ref}
      className={`w-full rounded-full overflow-hidden ${className}`}
      style={{ height, background: '#f1f5f9' }}
    >
      <div
        style={{
          width: `${width}%`,
          height: '100%',
          background: color,
          borderRadius: 'inherit',
          transition: animated ? 'width 1.2s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
        }}
      />
    </div>
  );
}

// Circular progress indicator
export function CircularProgress({ value, size = 80, strokeWidth = 6, color = '#2563eb', label, sublabel }) {
  const [animVal, setAnimVal] = useState(0);
  const ref = useRef(null);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setTimeout(() => setAnimVal(value), 100);
      }
    }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value]);

  const strokeDashoffset = circumference - (animVal / 100) * circumference;

  return (
    <div ref={ref} className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="circular-progress">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#f1f5f9"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span style={{ fontSize: size / 4.5, fontWeight: 700, color, lineHeight: 1 }}>
            {animVal}%
          </span>
        </div>
      </div>
      {label && <p className="text-xs font-600 text-slate-600 text-center">{label}</p>}
      {sublabel && <p className="text-xs text-slate-400 text-center">{sublabel}</p>}
    </div>
  );
}

// Skill tag
export function SkillTag({ skill, status = 'have' }) {
  const styles = {
    have: 'skill-tag skill-tag-have',
    missing: 'skill-tag skill-tag-missing',
    partial: 'skill-tag skill-tag-partial',
  };
  const icons = { have: '✓', missing: '✕', partial: '⚠' };
  return (
    <span className={styles[status]}>
      <span>{icons[status]}</span>
      {skill}
    </span>
  );
}

// Loading spinner
export function Spinner({ size = 20, color = '#2563eb' }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        border: `2.5px solid ${color}22`,
        borderTop: `2.5px solid ${color}`,
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }}
    />
  );
}

// Match badge
export function MatchBadge({ score }) {
  const color = score >= 80 ? '#059669' : score >= 65 ? '#d97706' : '#dc2626';
  const bg = score >= 80 ? '#ecfdf5' : score >= 65 ? '#fffbeb' : '#fef2f2';
  return (
    <span
      style={{
        background: bg,
        color,
        padding: '4px 12px',
        borderRadius: 999,
        fontSize: 13,
        fontWeight: 700,
      }}
    >
      {score}% Match
    </span>
  );
}

// Section header
export function SectionHeader({ eyebrow, title, subtitle, center = false }) {
  return (
    <div className={`mb-10 ${center ? 'text-center' : ''}`}>
      {eyebrow && (
        <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-2">{eyebrow}</p>
      )}
      <h2 className="section-title">{title}</h2>
      {subtitle && <p className="section-subtitle">{subtitle}</p>}
    </div>
  );
}

// Empty state
export function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-slate-700 mb-2">{title}</h3>
      <p className="text-slate-500 text-sm max-w-xs mb-6">{description}</p>
      {action}
    </div>
  );
}

// Priority badge
export function PriorityBadge({ level }) {
  const styles = {
    HIGH: 'badge badge-red',
    MEDIUM: 'badge badge-orange',
    LOW: 'badge badge-green',
  };
  return <span className={styles[level] || 'badge badge-blue'}>{level}</span>;
}

// Tooltip wrapper (simple)
export function Tooltip({ children, text }) {
  return (
    <span className="relative group">
      {children}
      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
        {text}
      </span>
    </span>
  );
}
