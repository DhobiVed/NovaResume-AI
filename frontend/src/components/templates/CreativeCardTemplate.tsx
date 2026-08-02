import React from 'react';
import type { ResumeData, ThemeConfig } from '../../lib/resumeTypes';

interface Props { data: ResumeData; theme: ThemeConfig; }

const SectionHeader: React.FC<{ title: string; color: string; fontSize: number }> = ({ title, color, fontSize }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
    <div style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: color }} />
    <h3 style={{ margin: 0, fontSize: fontSize * 1.02, fontWeight: 800, letterSpacing: '0.8px', textTransform: 'uppercase', color }}>{title}</h3>
  </div>
);

export const CreativeCardTemplate: React.FC<Props> = ({ data, theme }) => {
  const P = theme.palette;
  const F = theme.font.css;
  const FS = theme.fontSize || 11;
  const LH = theme.lineHeight || 1.5;
  const SS = theme.sectionSpacing || 14;
  const SW = theme.sidebarWidth || 32;

  const skills = data.skills.split(',').map(s => s.trim()).filter(Boolean);

  return (
    <div style={{ width: 794, minHeight: 1123, backgroundColor: P.body, fontFamily: F, display: 'flex', flexDirection: 'column', fontSize: FS, margin: 0, padding: 0, boxSizing: 'border-box' }}>
      {/* Top Banner with Accent */}
      <div style={{ backgroundColor: P.primary, padding: '24px 28px', color: P.headerText }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: Math.max(22, FS * 2.5), fontWeight: 900, letterSpacing: '-0.5px' }}>{data.fullName || 'Your Name'}</h1>
            <p style={{ margin: '4px 0 0', fontSize: Math.max(10, FS * 1.05), fontWeight: 700, color: P.accent, textTransform: 'uppercase', letterSpacing: '0.8px' }}>{data.title}</p>
          </div>
          {data.showPhoto && data.photoUrl && (
            <img src={data.photoUrl} alt="Profile" style={{ width: 68, height: 68, objectFit: 'cover', borderRadius: 12, border: `2px solid ${P.accent}` }} />
          )}
        </div>

        {/* Contact Pill Bar */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 14, paddingTop: 10, borderTop: `1px solid ${P.headerText}30` }}>
          {data.email && <span style={{ fontSize: FS * 0.8, opacity: 0.9 }}>✉ {data.email}</span>}
          {data.phone && <span style={{ fontSize: FS * 0.8, opacity: 0.9 }}>✆ {data.phone}</span>}
          {data.location && <span style={{ fontSize: FS * 0.8, opacity: 0.9 }}>⌖ {data.location}</span>}
          {data.linkedin && <span style={{ fontSize: FS * 0.75, opacity: 0.85 }}>in {data.linkedin}</span>}
          {data.github && <span style={{ fontSize: FS * 0.75, opacity: 0.85 }}>⌥ {data.github}</span>}
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, padding: '20px 22px', display: 'flex', gap: 16 }}>
        {/* Left Column (Skills & Extra Cards) */}
        <div style={{ width: `${SW}%`, display: 'flex', flexDirection: 'column', gap: SS }}>
          {/* Skills Card */}
          {skills.length > 0 && (
            <div style={{ backgroundColor: `${P.primary}08`, border: `1px solid ${P.primary}20`, borderRadius: 10, padding: 12 }}>
              <SectionHeader title="Top Skills" color={P.primary} fontSize={FS} />
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {skills.map((s, i) => (
                  <span key={i} style={{ backgroundColor: P.primary, color: P.headerText, fontSize: FS * 0.75, fontWeight: 700, padding: '2px 7px', borderRadius: 4 }}>
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Certifications Card */}
          {data.certifications && (
            <div style={{ backgroundColor: `${P.accent}08`, border: `1px solid ${P.accent}20`, borderRadius: 10, padding: 12 }}>
              <SectionHeader title="Certifications" color={P.primary} fontSize={FS} />
              {data.certifications.split(',').map((c, i) => (
                <div key={i} style={{ fontSize: FS * 0.78, color: P.text, marginBottom: 4, lineHeight: LH }}>✓ {c.trim()}</div>
              ))}
            </div>
          )}

          {/* Languages Card */}
          {data.languages && (
            <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: 12 }}>
              <SectionHeader title="Languages" color={P.primary} fontSize={FS} />
              {data.languages.split(',').map((l, i) => (
                <div key={i} style={{ fontSize: FS * 0.78, color: P.text, marginBottom: 2, lineHeight: LH }}>🌐 {l.trim()}</div>
              ))}
            </div>
          )}
        </div>

        {/* Right Main Column */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: SS }}>
          {/* Summary Card */}
          {data.summary && (
            <div style={{ backgroundColor: '#ffffff', border: `1px solid ${P.border}`, borderRadius: 10, padding: 12 }}>
              <SectionHeader title="Creative Profile" color={P.primary} fontSize={FS} />
              <p style={{ margin: 0, fontSize: FS * 0.88, color: P.text, lineHeight: LH }}>{data.summary}</p>
            </div>
          )}

          {/* Experience Card */}
          {data.experience.length > 0 && (
            <div style={{ backgroundColor: '#ffffff', border: `1px solid ${P.border}`, borderRadius: 10, padding: 12 }}>
              <SectionHeader title="Work History" color={P.primary} fontSize={FS} />
              {data.experience.map((exp, i) => (
                <div key={i} style={{ marginBottom: SS * 0.7, paddingBottom: 8, borderBottom: i < data.experience.length - 1 ? '1px dashed #e2e8f0' : 'none' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <div style={{ fontSize: FS * 0.95, fontWeight: 800, color: P.text }}>{exp.role}</div>
                    <div style={{ fontSize: FS * 0.78, color: P.primary, fontWeight: 700 }}>{exp.dates}</div>
                  </div>
                  <div style={{ fontSize: FS * 0.85, color: P.primary, fontWeight: 700, marginBottom: 4 }}>{exp.company}{exp.location ? ` · ${exp.location}` : ''}</div>
                  <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                    {exp.bullets.split('\n').filter(Boolean).map((b, idx) => (
                      <li key={idx} style={{ fontSize: FS * 0.85, color: P.text, lineHeight: LH, marginBottom: 2, display: 'flex', gap: 4 }}>
                        <span style={{ color: P.accent }}>•</span>
                        <span>{b.replace(/^[-•▸]\s*/, '')}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {/* Education & Projects Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {data.education.length > 0 && (
              <div style={{ backgroundColor: '#ffffff', border: `1px solid ${P.border}`, borderRadius: 10, padding: 10 }}>
                <SectionHeader title="Education" color={P.primary} fontSize={FS} />
                {data.education.map((ed, i) => (
                  <div key={i} style={{ marginBottom: 4 }}>
                    <div style={{ fontSize: FS * 0.88, fontWeight: 800, color: P.text }}>{ed.degree}</div>
                    <div style={{ fontSize: FS * 0.78, color: P.primary }}>{ed.school} · {ed.year}</div>
                  </div>
                ))}
              </div>
            )}

            {data.projects.length > 0 && (
              <div style={{ backgroundColor: '#ffffff', border: `1px solid ${P.border}`, borderRadius: 10, padding: 10 }}>
                <SectionHeader title="Projects" color={P.primary} fontSize={FS} />
                {data.projects.map((p, i) => (
                  <div key={i} style={{ marginBottom: 4 }}>
                    <div style={{ fontSize: FS * 0.88, fontWeight: 800, color: P.text }}>{p.name}</div>
                    <div style={{ fontSize: FS * 0.78, color: P.text, opacity: 0.9, lineHeight: LH }}>{p.description}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
