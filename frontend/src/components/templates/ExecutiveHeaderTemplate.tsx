import React from 'react';
import type { ResumeData, ThemeConfig } from '../../lib/resumeTypes';

interface Props { data: ResumeData; theme: ThemeConfig; }

const SectionTitle: React.FC<{ title: string; color: string; fontSize: number }> = ({ title, color, fontSize }) => (
  <div style={{ borderBottom: `2.5px solid ${color}`, marginBottom: 6, paddingBottom: 3 }}>
    <h3 style={{ margin: 0, fontSize: fontSize * 1.02, fontWeight: 800, letterSpacing: '0.8px', textTransform: 'uppercase', color }}>{title}</h3>
  </div>
);

const BulletList: React.FC<{ text: string; textColor: string; fontSize: number; lineHeight: number }> = ({ text, textColor, fontSize, lineHeight }) => (
  <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
    {text.split('\n').filter(Boolean).map((b, i) => (
      <li key={i} style={{ display: 'flex', gap: 5, marginBottom: 2.5 }}>
        <span style={{ color: textColor, opacity: 0.5, flexShrink: 0 }}>▸</span>
        <span style={{ fontSize: fontSize * 0.88, color: textColor, lineHeight }}>{b.replace(/^[-•▸]\s*/, '')}</span>
      </li>
    ))}
  </ul>
);

export const ExecutiveHeaderTemplate: React.FC<Props> = ({ data, theme }) => {
  const P = theme.palette;
  const F = theme.font.css;
  const FS = theme.fontSize || 11;
  const LH = theme.lineHeight || 1.5;
  const SS = theme.sectionSpacing || 14;
  const SW = theme.sidebarWidth || 32;

  const skills = data.skills.split(',').map(s => s.trim()).filter(Boolean);
  const isTwoCol = theme.layout === 'two_col_left' || theme.layout === 'two_col_right';

  return (
    <div style={{ width: 794, minHeight: 1123, backgroundColor: P.body, fontFamily: F, display: 'flex', flexDirection: 'column', fontSize: FS, margin: 0, padding: 0, boxSizing: 'border-box' }}>
      {/* Executive Full-Width Header */}
      <div style={{ backgroundColor: P.primary, padding: '26px 32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: Math.max(24, FS * 2.6), fontWeight: 900, color: P.headerText, letterSpacing: '-0.5px', lineHeight: 1, marginBottom: 6 }}>{data.fullName || 'Your Name'}</div>
            <div style={{ fontSize: Math.max(10, FS * 1.05), fontWeight: 700, color: P.accent, letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 10 }}>{data.title}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              {data.email && <span style={{ fontSize: FS * 0.8, color: P.headerText, opacity: 0.9 }}>✉ {data.email}</span>}
              {data.phone && <span style={{ fontSize: FS * 0.8, color: P.headerText, opacity: 0.9 }}>✆ {data.phone}</span>}
              {data.location && <span style={{ fontSize: FS * 0.8, color: P.headerText, opacity: 0.9 }}>⌖ {data.location}</span>}
              {data.linkedin && <span style={{ fontSize: FS * 0.75, color: P.headerText, opacity: 0.85 }}>in {data.linkedin}</span>}
            </div>
          </div>
          {data.showPhoto && data.photoUrl && (
            <img src={data.photoUrl} alt="Profile" style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: data.photoShape === 'round' ? '50%' : 8, border: `3px solid ${P.accent}`, marginLeft: 20 }} />
          )}
        </div>
      </div>

      {/* Thin accent bar */}
      <div style={{ height: 4, backgroundColor: P.accent }} />

      {/* Content area — two-col or single */}
      {isTwoCol ? (
        <div style={{ flex: 1, display: 'flex' }}>
          {/* Main column */}
          <div style={{ flex: 1, padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: SS }}>
            {data.summary && (
              <div>
                <SectionTitle title="Executive Profile" color={P.primary} fontSize={FS} />
                <p style={{ fontSize: FS * 0.88, color: P.text, lineHeight: LH, margin: 0 }}>{data.summary}</p>
              </div>
            )}
            {data.experience.length > 0 && (
              <div>
                <SectionTitle title="Professional Experience" color={P.primary} fontSize={FS} />
                {data.experience.map((exp, i) => (
                  <div key={i} style={{ marginBottom: SS * 0.7 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <div>
                        <div style={{ fontSize: FS * 0.98, fontWeight: 800, color: P.text }}>{exp.role}</div>
                        <div style={{ fontSize: FS * 0.88, color: P.primary, fontWeight: 700 }}>{exp.company}</div>
                      </div>
                      <div style={{ fontSize: FS * 0.78, color: P.text, opacity: 0.65 }}>{exp.dates}</div>
                    </div>
                    <div style={{ marginTop: 3 }}><BulletList text={exp.bullets} textColor={P.text} fontSize={FS} lineHeight={LH} /></div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* Sidebar */}
          <div style={{ width: `${SW}%`, backgroundColor: `${P.primary}08`, borderLeft: `2px solid ${P.primary}15`, padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: SS }}>
            <div>
              <SectionTitle title="Education" color={P.primary} fontSize={FS} />
              {data.education.map((ed, i) => (
                <div key={i} style={{ marginBottom: 6 }}>
                  <div style={{ fontSize: FS * 0.88, fontWeight: 800, color: P.text }}>{ed.degree}</div>
                  <div style={{ fontSize: FS * 0.8, color: P.primary, fontWeight: 700 }}>{ed.school}</div>
                  <div style={{ fontSize: FS * 0.75, color: P.text, opacity: 0.65 }}>{ed.year}</div>
                </div>
              ))}
            </div>
            <div>
              <SectionTitle title="Core Skills" color={P.primary} fontSize={FS} />
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3.5 }}>
                {skills.map((s, i) => <span key={i} style={{ backgroundColor: `${P.primary}15`, border: `1px solid ${P.primary}30`, borderRadius: 3, padding: '2px 6px', fontSize: FS * 0.75, fontWeight: 600, color: P.text }}>{s}</span>)}
              </div>
            </div>
            {data.certifications && (
              <div>
                <SectionTitle title="Certifications" color={P.primary} fontSize={FS} />
                {data.certifications.split(',').map((c, i) => <div key={i} style={{ fontSize: FS * 0.8, color: P.text, marginBottom: 3, lineHeight: LH }}>• {c.trim()}</div>)}
              </div>
            )}
          </div>
        </div>
      ) : (
        // Single column layout
        <div style={{ flex: 1, padding: '22px 32px', display: 'flex', flexDirection: 'column', gap: SS }}>
          {data.summary && (
            <div>
              <SectionTitle title="Executive Profile" color={P.primary} fontSize={FS} />
              <p style={{ fontSize: FS * 0.88, color: P.text, lineHeight: LH, margin: 0 }}>{data.summary}</p>
            </div>
          )}
          {data.experience.length > 0 && (
            <div>
              <SectionTitle title="Professional Experience" color={P.primary} fontSize={FS} />
              {data.experience.map((exp, i) => (
                <div key={i} style={{ marginBottom: SS * 0.7 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <div>
                      <div style={{ fontSize: FS * 0.98, fontWeight: 800, color: P.text }}>{exp.role}</div>
                      <div style={{ fontSize: FS * 0.88, color: P.primary, fontWeight: 700 }}>{exp.company}</div>
                    </div>
                    <div style={{ fontSize: FS * 0.78, color: P.text, opacity: 0.65 }}>{exp.dates}</div>
                  </div>
                  <div style={{ marginTop: 3 }}><BulletList text={exp.bullets} textColor={P.text} fontSize={FS} lineHeight={LH} /></div>
                </div>
              ))}
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <SectionTitle title="Education" color={P.primary} fontSize={FS} />
              {data.education.map((ed, i) => (
                <div key={i} style={{ marginBottom: 5 }}>
                  <div style={{ fontSize: FS * 0.88, fontWeight: 800, color: P.text }}>{ed.degree}</div>
                  <div style={{ fontSize: FS * 0.8, color: P.primary, fontWeight: 700 }}>{ed.school}</div>
                  <div style={{ fontSize: FS * 0.75, color: P.text, opacity: 0.65 }}>{ed.year}</div>
                </div>
              ))}
            </div>
            <div>
              <SectionTitle title="Skills" color={P.primary} fontSize={FS} />
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3.5 }}>
                {skills.map((s, i) => <span key={i} style={{ backgroundColor: `${P.primary}12`, border: `1px solid ${P.primary}25`, borderRadius: 3, padding: '2px 6px', fontSize: FS * 0.75, fontWeight: 600, color: P.text }}>{s}</span>)}
              </div>
            </div>
          </div>
          {data.achievements && (
            <div>
              <SectionTitle title="Key Achievements" color={P.primary} fontSize={FS} />
              <BulletList text={data.achievements} textColor={P.text} fontSize={FS} lineHeight={LH} />
            </div>
          )}
          {data.customSections.map((sec, i) => (
            <div key={i}>
              <SectionTitle title={sec.title} color={P.primary} fontSize={FS} />
              <p style={{ fontSize: FS * 0.88, color: P.text, lineHeight: LH, margin: 0 }}>{sec.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
