import React from 'react';
import type { ResumeData, ThemeConfig } from '../../lib/resumeTypes';

interface Props { data: ResumeData; theme: ThemeConfig; }

const TechBadge: React.FC<{ label: string; color: string; fontSize: number }> = ({ label, color, fontSize }) => (
  <span style={{ backgroundColor: `${color}15`, color, border: `1px solid ${color}30`, borderRadius: 4, padding: '2px 7px', fontSize: fontSize * 0.78, fontWeight: 700, fontFamily: 'monospace' }}>
    {label}
  </span>
);

export const SoftwareEngTemplate: React.FC<Props> = ({ data, theme }) => {
  const P = theme.palette;
  const F = theme.font.css;
  const FS = theme.fontSize || 11;
  const LH = theme.lineHeight || 1.5;
  const SS = theme.sectionSpacing || 14;
  const SW = theme.sidebarWidth || 30;

  const skills = data.skills.split(',').map(s => s.trim()).filter(Boolean);

  return (
    <div style={{ width: 794, minHeight: 1123, backgroundColor: P.body, fontFamily: F, display: 'flex', flexDirection: 'column', fontSize: FS, margin: 0, padding: 0, boxSizing: 'border-box' }}>
      {/* GitHub/Developer Header */}
      <div style={{ backgroundColor: P.primary, color: P.headerText, padding: '24px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: Math.max(22, FS * 2.5), fontWeight: 900, letterSpacing: '-0.5px' }}>{data.fullName || 'Your Name'}</div>
          <div style={{ fontSize: Math.max(10, FS * 1.05), fontWeight: 700, color: P.accent, textTransform: 'uppercase', letterSpacing: '0.8px', marginTop: 4 }}>{data.title}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 10, fontSize: FS * 0.82 }}>
            {data.email && <span>✉ {data.email}</span>}
            {data.phone && <span>✆ {data.phone}</span>}
            {data.github && <span style={{ fontFamily: 'monospace' }}>github.com/{data.github.replace(/^https?:\/\/(www\.)?github\.com\//, '')}</span>}
            {data.linkedin && <span>in {data.linkedin}</span>}
          </div>
        </div>
        {data.showPhoto && data.photoUrl && (
          <img src={data.photoUrl} alt="Profile" style={{ width: 68, height: 68, objectFit: 'cover', borderRadius: 8, border: `2px solid ${P.accent}` }} />
        )}
      </div>

      <div style={{ flex: 1, padding: '22px 26px', display: 'flex', gap: 18 }}>
        {/* Main Content Column */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: SS }}>
          {/* Summary */}
          {data.summary && (
            <div>
              <div style={{ borderBottom: `2px solid ${P.primary}`, paddingBottom: 3, marginBottom: 6 }}>
                <h3 style={{ margin: 0, fontSize: FS * 1.02, fontWeight: 800, letterSpacing: '0.8px', textTransform: 'uppercase', color: P.primary }}>// Summary</h3>
              </div>
              <p style={{ margin: 0, fontSize: FS * 0.88, color: P.text, lineHeight: LH }}>{data.summary}</p>
            </div>
          )}

          {/* Work Experience */}
          {data.experience.length > 0 && (
            <div>
              <div style={{ borderBottom: `2px solid ${P.primary}`, paddingBottom: 3, marginBottom: 8 }}>
                <h3 style={{ margin: 0, fontSize: FS * 1.02, fontWeight: 800, letterSpacing: '0.8px', textTransform: 'uppercase', color: P.primary }}>// Work Experience</h3>
              </div>
              {data.experience.map((exp, i) => (
                <div key={i} style={{ marginBottom: SS * 0.7 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontSize: FS * 0.98, fontWeight: 800, color: P.text }}>{exp.role}</span>
                    <span style={{ fontSize: FS * 0.78, color: P.text, opacity: 0.7 }}>{exp.dates}</span>
                  </div>
                  <div style={{ fontSize: FS * 0.88, color: P.primary, fontWeight: 700, marginBottom: 4 }}>{exp.company}{exp.location ? ` · ${exp.location}` : ''}</div>
                  <ul style={{ margin: 0, paddingLeft: 14 }}>
                    {exp.bullets.split('\n').filter(Boolean).map((b, idx) => (
                      <li key={idx} style={{ fontSize: FS * 0.88, color: P.text, lineHeight: LH, marginBottom: 2 }}>{b.replace(/^[-•▸]\s*/, '')}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {/* Key Projects */}
          {data.projects.length > 0 && (
            <div>
              <div style={{ borderBottom: `2px solid ${P.primary}`, paddingBottom: 3, marginBottom: 8 }}>
                <h3 style={{ margin: 0, fontSize: FS * 1.02, fontWeight: 800, letterSpacing: '0.8px', textTransform: 'uppercase', color: P.primary }}>// Open Source & Projects</h3>
              </div>
              {data.projects.map((p, i) => (
                <div key={i} style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: FS * 0.95, fontWeight: 800, color: P.text }}>{p.name} {p.tech && <span style={{ fontSize: FS * 0.78, color: P.primary, fontWeight: 600 }}>({p.tech})</span>}</div>
                  <div style={{ fontSize: FS * 0.85, color: P.text, lineHeight: LH, marginTop: 2 }}>{p.description}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Sidebar Column */}
        <div style={{ width: `${SW}%`, backgroundColor: `${P.primary}06`, borderLeft: `2px solid ${P.primary}15`, padding: '18px 14px', display: 'flex', flexDirection: 'column', gap: SS }}>
          {/* Tech Stack Chips */}
          {skills.length > 0 && (
            <div>
              <div style={{ borderBottom: `1.5px solid ${P.primary}`, paddingBottom: 3, marginBottom: 8 }}>
                <h3 style={{ margin: 0, fontSize: FS * 0.95, fontWeight: 800, letterSpacing: '0.8px', textTransform: 'uppercase', color: P.primary }}>Tech Stack</h3>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {skills.map((s, i) => <TechBadge key={i} label={s} color={P.primary} fontSize={FS} />)}
              </div>
            </div>
          )}

          {/* Education */}
          {data.education.length > 0 && (
            <div>
              <div style={{ borderBottom: `1.5px solid ${P.primary}`, paddingBottom: 3, marginBottom: 8 }}>
                <h3 style={{ margin: 0, fontSize: FS * 0.95, fontWeight: 800, letterSpacing: '0.8px', textTransform: 'uppercase', color: P.primary }}>Education</h3>
              </div>
              {data.education.map((ed, i) => (
                <div key={i} style={{ marginBottom: 6 }}>
                  <div style={{ fontSize: FS * 0.88, fontWeight: 800, color: P.text }}>{ed.degree}</div>
                  <div style={{ fontSize: FS * 0.8, color: P.primary, fontWeight: 700 }}>{ed.school}</div>
                  <div style={{ fontSize: FS * 0.75, color: P.text, opacity: 0.7 }}>{ed.year}</div>
                </div>
              ))}
            </div>
          )}

          {/* Certifications */}
          {data.certifications && (
            <div>
              <div style={{ borderBottom: `1.5px solid ${P.primary}`, paddingBottom: 3, marginBottom: 8 }}>
                <h3 style={{ margin: 0, fontSize: FS * 0.95, fontWeight: 800, letterSpacing: '0.8px', textTransform: 'uppercase', color: P.primary }}>Certifications</h3>
              </div>
              {data.certifications.split(',').map((c, i) => (
                <div key={i} style={{ fontSize: FS * 0.78, color: P.text, marginBottom: 3, lineHeight: LH }}>• {c.trim()}</div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
