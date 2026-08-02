import React from 'react';
import type { ResumeData, ThemeConfig } from '../../lib/resumeTypes';

interface Props { data: ResumeData; theme: ThemeConfig; }

const SectionTitle: React.FC<{ title: string; color: string; borderColor: string; fontSize: number; spacing: number }> = ({ title, color, borderColor, fontSize, spacing }) => (
  <div style={{ marginBottom: spacing / 2 }}>
    <h3 style={{
      color,
      fontSize: fontSize * 1.02,
      fontWeight: 800,
      letterSpacing: '0.8px',
      textTransform: 'uppercase',
      borderBottom: `2px solid ${borderColor}`,
      paddingBottom: 3,
      marginBottom: 4
    }}>
      {title}
    </h3>
  </div>
);

const BulletList: React.FC<{ text: string; textColor: string; fontSize: number; lineHeight: number }> = ({ text, textColor, fontSize, lineHeight }) => (
  <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
    {text.split('\n').filter(Boolean).map((b, i) => (
      <li key={i} style={{ display: 'flex', gap: 5, marginBottom: 2.5 }}>
        <span style={{ color: textColor, opacity: 0.5, flexShrink: 0, marginTop: 1 }}>▸</span>
        <span style={{ fontSize: fontSize * 0.9, color: textColor, lineHeight }}>{b.replace(/^[-•▸]\s*/, '')}</span>
      </li>
    ))}
  </ul>
);

export const ModernSidebarTemplate: React.FC<Props> = ({ data, theme }) => {
  const P = theme.palette;
  const F = theme.font.css;
  const FS = theme.fontSize || 11;
  const LH = theme.lineHeight || 1.5;
  const SS = theme.sectionSpacing || 14;
  const SW = theme.sidebarWidth || 32;

  const skills = data.skills.split(',').map(s => s.trim()).filter(Boolean);
  const isRight = theme.layout === 'two_col_right';

  const Sidebar = (
    <div style={{
      width: `${SW}%`,
      backgroundColor: P.primary,
      color: P.headerText,
      padding: '22px 16px',
      flexShrink: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: SS,
    }}>
      {/* Photo */}
      {data.showPhoto && data.photoUrl && (
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 4 }}>
          <img src={data.photoUrl} alt="Profile"
            style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: data.photoShape === 'round' ? '50%' : 8, border: `2px solid ${P.accent}` }} />
        </div>
      )}
      {/* Contact */}
      <div>
        <div style={{ fontSize: FS * 0.85, fontWeight: 800, letterSpacing: '0.8px', textTransform: 'uppercase', color: P.accent, borderBottom: `1px solid ${P.accent}40`, paddingBottom: 3, marginBottom: 6 }}>Contact</div>
        {data.email && <div style={{ fontSize: FS * 0.82, marginBottom: 4, wordBreak: 'break-all', lineHeight: LH }}>✉ {data.email}</div>}
        {data.phone && <div style={{ fontSize: FS * 0.82, marginBottom: 4, lineHeight: LH }}>✆ {data.phone}</div>}
        {data.location && <div style={{ fontSize: FS * 0.82, marginBottom: 4, lineHeight: LH }}>⌖ {data.location}</div>}
        {data.linkedin && <div style={{ fontSize: FS * 0.78, marginBottom: 3, opacity: 0.9, lineHeight: LH }}>in {data.linkedin}</div>}
        {data.github && <div style={{ fontSize: FS * 0.78, marginBottom: 3, opacity: 0.9, lineHeight: LH }}>⌥ {data.github}</div>}
      </div>
      {/* Skills */}
      {skills.length > 0 && (
        <div>
          <div style={{ fontSize: FS * 0.85, fontWeight: 800, letterSpacing: '0.8px', textTransform: 'uppercase', color: P.accent, borderBottom: `1px solid ${P.accent}40`, paddingBottom: 3, marginBottom: 6 }}>Skills</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3.5 }}>
            {skills.map((s, i) => (
              <span key={i} style={{ backgroundColor: `${P.headerText}20`, border: `1px solid ${P.headerText}30`, borderRadius: 3, padding: '2px 6px', fontSize: FS * 0.75, fontWeight: 600 }}>{s}</span>
            ))}
          </div>
        </div>
      )}
      {/* Certifications */}
      {data.certifications && (
        <div>
          <div style={{ fontSize: FS * 0.85, fontWeight: 800, letterSpacing: '0.8px', textTransform: 'uppercase', color: P.accent, borderBottom: `1px solid ${P.accent}40`, paddingBottom: 3, marginBottom: 6 }}>Certifications</div>
          {data.certifications.split(',').map((c, i) => (
            <div key={i} style={{ fontSize: FS * 0.8, marginBottom: 3, lineHeight: LH }}>• {c.trim()}</div>
          ))}
        </div>
      )}
      {/* Languages */}
      {data.languages && (
        <div>
          <div style={{ fontSize: FS * 0.85, fontWeight: 800, letterSpacing: '0.8px', textTransform: 'uppercase', color: P.accent, borderBottom: `1px solid ${P.accent}40`, paddingBottom: 3, marginBottom: 6 }}>Languages</div>
          {data.languages.split(',').map((l, i) => (
            <div key={i} style={{ fontSize: FS * 0.8, marginBottom: 2, lineHeight: LH }}>• {l.trim()}</div>
          ))}
        </div>
      )}
    </div>
  );

  const Main = (
    <div style={{ flex: 1, padding: '22px 18px', display: 'flex', flexDirection: 'column', gap: SS }}>
      {/* Summary */}
      {data.summary && (
        <div>
          <SectionTitle title="Professional Summary" color={P.primary} borderColor={P.primary} fontSize={FS} spacing={SS} />
          <p style={{ fontSize: FS * 0.88, color: P.text, lineHeight: LH, margin: 0 }}>{data.summary}</p>
        </div>
      )}
      {/* Experience */}
      {data.experience.length > 0 && (
        <div>
          <SectionTitle title="Work Experience" color={P.primary} borderColor={P.primary} fontSize={FS} spacing={SS} />
          {data.experience.map((exp, i) => (
            <div key={i} style={{ marginBottom: SS * 0.7 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 2 }}>
                <div>
                  <div style={{ fontSize: FS * 0.98, fontWeight: 800, color: P.text }}>{exp.role}</div>
                  <div style={{ fontSize: FS * 0.88, color: P.primary, fontWeight: 700 }}>{exp.company}{exp.location ? ` · ${exp.location}` : ''}</div>
                </div>
                <div style={{ fontSize: FS * 0.78, color: P.text, opacity: 0.7, flexShrink: 0, marginLeft: 8 }}>{exp.dates}</div>
              </div>
              <BulletList text={exp.bullets} textColor={P.text} fontSize={FS} lineHeight={LH} />
            </div>
          ))}
        </div>
      )}
      {/* Education */}
      {data.education.length > 0 && (
        <div>
          <SectionTitle title="Education" color={P.primary} borderColor={P.primary} fontSize={FS} spacing={SS} />
          {data.education.map((ed, i) => (
            <div key={i} style={{ marginBottom: SS * 0.4 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: FS * 0.95, fontWeight: 800, color: P.text }}>{ed.degree}</div>
                  <div style={{ fontSize: FS * 0.88, color: P.primary, fontWeight: 700 }}>{ed.school}</div>
                </div>
                <div style={{ fontSize: FS * 0.78, color: P.text, opacity: 0.7 }}>{ed.year}</div>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Projects */}
      {data.projects.length > 0 && (
        <div>
          <SectionTitle title="Projects" color={P.primary} borderColor={P.primary} fontSize={FS} spacing={SS} />
          {data.projects.map((p, i) => (
            <div key={i} style={{ marginBottom: SS * 0.4 }}>
              <div style={{ fontSize: FS * 0.95, fontWeight: 800, color: P.text }}>{p.name}</div>
              <p style={{ fontSize: FS * 0.85, color: P.text, margin: '2px 0 0', lineHeight: LH }}>{p.description}</p>
            </div>
          ))}
        </div>
      )}
      {/* Achievements */}
      {data.achievements && (
        <div>
          <SectionTitle title="Achievements" color={P.primary} borderColor={P.primary} fontSize={FS} spacing={SS} />
          <BulletList text={data.achievements} textColor={P.text} fontSize={FS} lineHeight={LH} />
        </div>
      )}
      {/* Custom Sections */}
      {data.customSections.map((sec, i) => (
        <div key={i}>
          <SectionTitle title={sec.title} color={P.primary} borderColor={P.primary} fontSize={FS} spacing={SS} />
          <p style={{ fontSize: FS * 0.88, color: P.text, lineHeight: LH, margin: 0 }}>{sec.content}</p>
        </div>
      ))}
    </div>
  );

  return (
    <div style={{ width: 794, minHeight: 1123, backgroundColor: P.body, fontFamily: F, display: 'flex', flexDirection: 'column', fontSize: FS, margin: 0, padding: 0, boxSizing: 'border-box' }}>
      {/* Header Banner */}
      <div style={{ backgroundColor: P.primary, padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: Math.max(22, FS * 2.4), fontWeight: 900, color: P.headerText, letterSpacing: '-0.5px', lineHeight: 1 }}>{data.fullName || 'Your Name'}</div>
          <div style={{ fontSize: Math.max(10, FS * 1.05), fontWeight: 700, color: P.accent, letterSpacing: '0.8px', textTransform: 'uppercase', marginTop: 4 }}>{data.title}</div>
        </div>
      </div>
      {/* Body: Sidebar + Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: isRight ? 'row-reverse' : 'row' }}>
        {Sidebar}
        {Main}
      </div>
    </div>
  );
};
