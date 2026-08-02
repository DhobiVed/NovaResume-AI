import React from 'react';
import type { ResumeData, ThemeConfig } from '../../lib/resumeTypes';

interface Props { data: ResumeData; theme: ThemeConfig; }

const SectionHeading: React.FC<{ title: string; color: string; fontSize: number }> = ({ title, color, fontSize }) => (
  <div style={{ borderBottom: `1.5px solid ${color}`, marginBottom: 6, paddingBottom: 2 }}>
    <h2 style={{ margin: 0, fontSize: fontSize * 1.05, fontWeight: 800, letterSpacing: '0.8px', textTransform: 'uppercase', color }}>{title}</h2>
  </div>
);

export const AtsClassicTemplate: React.FC<Props> = ({ data, theme }) => {
  const P = theme.palette;
  const F = theme.font.css;
  const FS = theme.fontSize || 11;
  const LH = theme.lineHeight || 1.5;
  const SS = theme.sectionSpacing || 14;

  const skills = data.skills.split(',').map(s => s.trim()).filter(Boolean);

  return (
    <div style={{ width: 794, minHeight: 1123, backgroundColor: P.body, fontFamily: F, padding: '36px 42px', display: 'flex', flexDirection: 'column', gap: SS, fontSize: FS, boxSizing: 'border-box' }}>
      {/* Header Name & Contact Info — Plain Text ATS Layout */}
      <div style={{ textAlign: 'center', borderBottom: `2px solid ${P.primary}`, paddingBottom: 12 }}>
        <h1 style={{ margin: 0, fontSize: Math.max(22, FS * 2.4), fontWeight: 900, color: P.primary, letterSpacing: '-0.5px' }}>{data.fullName || 'Your Name'}</h1>
        <div style={{ fontSize: Math.max(10, FS * 1.02), fontWeight: 700, color: P.accent, textTransform: 'uppercase', letterSpacing: '0.8px', marginTop: 3 }}>{data.title}</div>
        <div style={{ fontSize: FS * 0.85, color: P.text, marginTop: 8, display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 12, lineHeight: LH }}>
          {data.email && <span>{data.email}</span>}
          {data.phone && <span>• {data.phone}</span>}
          {data.location && <span>• {data.location}</span>}
          {data.linkedin && <span>• {data.linkedin}</span>}
          {data.github && <span>• {data.github}</span>}
        </div>
      </div>

      {/* Summary */}
      {data.summary && (
        <div>
          <SectionHeading title="Professional Summary" color={P.primary} fontSize={FS} />
          <p style={{ margin: 0, fontSize: FS * 0.88, color: P.text, lineHeight: LH }}>{data.summary}</p>
        </div>
      )}

      {/* Experience */}
      {data.experience.length > 0 && (
        <div>
          <SectionHeading title="Work Experience" color={P.primary} fontSize={FS} />
          {data.experience.map((exp, i) => (
            <div key={i} style={{ marginBottom: SS * 0.7 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: FS * 0.98, fontWeight: 800, color: P.text }}>{exp.role}</span>
                <span style={{ fontSize: FS * 0.8, color: P.text, opacity: 0.75 }}>{exp.dates}</span>
              </div>
              <div style={{ fontSize: FS * 0.88, color: P.primary, fontWeight: 700, marginBottom: 4 }}>{exp.company}{exp.location ? ` — ${exp.location}` : ''}</div>
              <ul style={{ margin: 0, paddingLeft: 14 }}>
                {exp.bullets.split('\n').filter(Boolean).map((b, idx) => (
                  <li key={idx} style={{ fontSize: FS * 0.88, color: P.text, lineHeight: LH, marginBottom: 2 }}>{b.replace(/^[-•▸]\s*/, '')}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {data.education.length > 0 && (
        <div>
          <SectionHeading title="Education" color={P.primary} fontSize={FS} />
          {data.education.map((ed, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <div>
                <span style={{ fontSize: FS * 0.92, fontWeight: 800, color: P.text }}>{ed.degree}</span>
                <span style={{ fontSize: FS * 0.85, color: P.primary, marginLeft: 8 }}>{ed.school}</span>
              </div>
              <span style={{ fontSize: FS * 0.8, color: P.text, opacity: 0.75 }}>{ed.year}</span>
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <div>
          <SectionHeading title="Technical & Core Skills" color={P.primary} fontSize={FS} />
          <p style={{ margin: 0, fontSize: FS * 0.88, color: P.text, lineHeight: LH }}>
            <strong style={{ color: P.primary }}>Skills:</strong> {skills.join(', ')}
          </p>
        </div>
      )}

      {/* Projects */}
      {data.projects.length > 0 && (
        <div>
          <SectionHeading title="Key Projects" color={P.primary} fontSize={FS} />
          {data.projects.map((p, i) => (
            <div key={i} style={{ marginBottom: 6 }}>
              <span style={{ fontSize: FS * 0.92, fontWeight: 800, color: P.text }}>{p.name}: </span>
              <span style={{ fontSize: FS * 0.88, color: P.text, lineHeight: LH }}>{p.description}</span>
            </div>
          ))}
        </div>
      )}

      {/* Certifications */}
      {data.certifications && (
        <div>
          <SectionHeading title="Certifications" color={P.primary} fontSize={FS} />
          <p style={{ margin: 0, fontSize: FS * 0.88, color: P.text, lineHeight: LH }}>{data.certifications}</p>
        </div>
      )}

      {/* Achievements */}
      {data.achievements && (
        <div>
          <SectionHeading title="Honors & Achievements" color={P.primary} fontSize={FS} />
          <ul style={{ margin: 0, paddingLeft: 14 }}>
            {data.achievements.split('\n').filter(Boolean).map((ach, i) => (
              <li key={i} style={{ fontSize: FS * 0.88, color: P.text, lineHeight: LH, marginBottom: 2 }}>{ach}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
