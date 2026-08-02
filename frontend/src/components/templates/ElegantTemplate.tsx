import React from 'react';
import type { ResumeData, ThemeConfig } from '../../lib/resumeTypes';

interface Props { data: ResumeData; theme: ThemeConfig; }

const BulletList: React.FC<{ text: string; textColor: string; accentColor: string }> = ({ text, textColor, accentColor }) => (
  <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
    {text.split('\n').filter(Boolean).map((b, i) => (
      <li key={i} style={{ display: 'flex', gap: 6, marginBottom: 2 }}>
        <span style={{ color: accentColor, flexShrink: 0, fontWeight: 400, fontSize: 8, lineHeight: 1.45 }}>•</span>
        <span style={{ fontSize: 8, color: textColor, lineHeight: 1.5 }}>{b.replace(/^[-•▸]\s*/, '')}</span>
      </li>
    ))}
  </ul>
);

/** Elegant — covers Healthcare, Academic, Elegant variants. Serif-friendly, single or two column. */
export const ElegantTemplate: React.FC<Props> = ({ data, theme }) => {
  const P = theme.palette;
  const F = theme.font.css;
  const skills = data.skills.split(',').map(s => s.trim()).filter(Boolean);
  const isTwoCol = theme.layout === 'two_col_left' || theme.layout === 'two_col_right';

  const SectionH: React.FC<{ title: string }> = ({ title }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
      <div style={{ width: 20, height: 2, backgroundColor: P.primary }} />
      <div style={{ fontSize: 8, fontWeight: 800, color: P.primary, textTransform: 'uppercase', letterSpacing: '0.15em' }}>{title}</div>
      <div style={{ flex: 1, height: 1, backgroundColor: `${P.primary}25` }} />
    </div>
  );

  return (
    <div style={{ width: 794, minHeight: 1123, backgroundColor: P.body, fontFamily: F, display: 'flex', flexDirection: 'column', fontSize: theme.fontSize }}>
      {/* Elegant top header — centered, refined */}
      <div style={{ padding: '28px 40px 16px', textAlign: 'center', borderBottom: `3px solid ${P.primary}` }}>
        {data.showPhoto && data.photoUrl && (
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
            <img src={data.photoUrl} alt="Profile" style={{ width: 70, height: 70, objectFit: 'cover', borderRadius: data.photoShape === 'round' ? '50%' : 8, border: `3px solid ${P.primary}` }} />
          </div>
        )}
        <div style={{ fontSize: 28, fontWeight: 900, color: P.text, letterSpacing: '0.02em' }}>{data.fullName || 'Your Name'}</div>
        <div style={{ fontSize: 11, fontWeight: 600, color: P.primary, textTransform: 'uppercase', letterSpacing: '0.15em', marginTop: 4 }}>{data.title}</div>
        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 14, marginTop: 8 }}>
          {data.email && <span style={{ fontSize: 7.5, color: P.text, opacity: 0.7 }}>{data.email}</span>}
          {data.phone && <span style={{ fontSize: 7.5, color: P.text, opacity: 0.7 }}>{data.phone}</span>}
          {data.location && <span style={{ fontSize: 7.5, color: P.text, opacity: 0.7 }}>{data.location}</span>}
          {data.linkedin && <span style={{ fontSize: 7.5, color: P.primary, opacity: 0.85 }}>{data.linkedin}</span>}
        </div>
      </div>

      {/* Body */}
      {isTwoCol ? (
        <div style={{ flex: 1, display: 'flex' }}>
          {/* Sidebar */}
          <div style={{ width: `${theme.sidebarWidth}%`, backgroundColor: `${P.primary}09`, borderRight: `1px solid ${P.primary}20`, padding: '20px 14px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            {data.summary && (
              <div>
                <div style={{ fontSize: 7.5, fontWeight: 700, color: P.primary, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 5 }}>Profile</div>
                <p style={{ fontSize: 7.5, color: P.text, lineHeight: 1.55, margin: 0, fontStyle: 'italic' }}>{data.summary}</p>
              </div>
            )}
            <div>
              <div style={{ fontSize: 7.5, fontWeight: 700, color: P.primary, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 5 }}>Expertise</div>
              {skills.map((s, i) => <div key={i} style={{ fontSize: 7.5, color: P.text, marginBottom: 3 }}>◦ {s}</div>)}
            </div>
            {data.certifications && (
              <div>
                <div style={{ fontSize: 7.5, fontWeight: 700, color: P.primary, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 5 }}>Certifications</div>
                {data.certifications.split(',').map((c, i) => <div key={i} style={{ fontSize: 7.5, color: P.text, marginBottom: 3 }}>◦ {c.trim()}</div>)}
              </div>
            )}
            {data.languages && (
              <div>
                <div style={{ fontSize: 7.5, fontWeight: 700, color: P.primary, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 5 }}>Languages</div>
                {data.languages.split(',').map((l, i) => <div key={i} style={{ fontSize: 7.5, color: P.text, marginBottom: 3 }}>◦ {l.trim()}</div>)}
              </div>
            )}
          </div>
          {/* Main */}
          <div style={{ flex: 1, padding: '20px 18px', display: 'flex', flexDirection: 'column', gap: 13 }}>
            {data.experience.length > 0 && (
              <div>
                <SectionH title="Professional Experience" />
                {data.experience.map((exp, i) => (
                  <div key={i} style={{ marginBottom: 9 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <div style={{ fontSize: 9.5, fontWeight: 700, color: P.text }}>{exp.role}</div>
                      <div style={{ fontSize: 7, color: P.text, opacity: 0.5 }}>{exp.dates}</div>
                    </div>
                    <div style={{ fontSize: 8, color: P.primary, fontWeight: 600, marginBottom: 3 }}>{exp.company}</div>
                    <BulletList text={exp.bullets} textColor={P.text} accentColor={P.primary} />
                  </div>
                ))}
              </div>
            )}
            {data.education.length > 0 && (
              <div>
                <SectionH title="Education" />
                {data.education.map((ed, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <div><div style={{ fontSize: 9.5, fontWeight: 700, color: P.text }}>{ed.degree}</div><div style={{ fontSize: 8, color: P.primary }}>{ed.school}</div></div>
                    <div style={{ fontSize: 7.5, color: P.text, opacity: 0.5 }}>{ed.year}</div>
                  </div>
                ))}
              </div>
            )}
            {data.projects.length > 0 && (
              <div>
                <SectionH title="Research & Projects" />
                {data.projects.map((p, i) => (
                  <div key={i} style={{ marginBottom: 6 }}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: P.text, fontStyle: 'italic' }}>{p.name}</div>
                    <p style={{ fontSize: 8, color: P.text, margin: '2px 0 0', lineHeight: 1.4 }}>{p.description}</p>
                  </div>
                ))}
              </div>
            )}
            {data.achievements && (
              <div>
                <SectionH title="Achievements" />
                <BulletList text={data.achievements} textColor={P.text} accentColor={P.primary} />
              </div>
            )}
            {data.customSections.map((sec, i) => (
              <div key={i}>
                <SectionH title={sec.title} />
                <p style={{ fontSize: 8, color: P.text, lineHeight: 1.45, margin: 0 }}>{sec.content}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        // Single column
        <div style={{ flex: 1, padding: '20px 40px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {data.summary && (
            <div>
              <SectionH title="Professional Profile" />
              <p style={{ fontSize: 8.5, color: P.text, lineHeight: 1.6, margin: 0, fontStyle: 'italic' }}>{data.summary}</p>
            </div>
          )}
          {data.experience.length > 0 && (
            <div>
              <SectionH title="Professional Experience" />
              {data.experience.map((exp, i) => (
                <div key={i} style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: P.text }}>{exp.role}</div>
                    <div style={{ fontSize: 7.5, color: P.text, opacity: 0.5 }}>{exp.dates}</div>
                  </div>
                  <div style={{ fontSize: 8.5, color: P.primary, fontWeight: 600, marginBottom: 4 }}>{exp.company}</div>
                  <BulletList text={exp.bullets} textColor={P.text} accentColor={P.primary} />
                </div>
              ))}
            </div>
          )}
          {data.education.length > 0 && (
            <div>
              <SectionH title="Education" />
              {data.education.map((ed, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <div><div style={{ fontSize: 9.5, fontWeight: 700, color: P.text }}>{ed.degree}</div><div style={{ fontSize: 8.5, color: P.primary }}>{ed.school}</div></div>
                  <div style={{ fontSize: 7.5, color: P.text, opacity: 0.5 }}>{ed.year}</div>
                </div>
              ))}
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {skills.length > 0 && (
              <div><SectionH title="Skills" />
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>{skills.map((s, i) => <span key={i} style={{ fontSize: 7.5, color: P.text, border: `1px solid ${P.primary}30`, borderRadius: 3, padding: '2px 5px' }}>◦ {s}</span>)}</div></div>
            )}
            {data.certifications && (
              <div><SectionH title="Certifications" />
              <p style={{ fontSize: 8, color: P.text, margin: 0 }}>{data.certifications}</p></div>
            )}
          </div>
          {data.projects.length > 0 && (
            <div>
              <SectionH title="Research & Projects" />
              {data.projects.map((p, i) => (
                <div key={i} style={{ marginBottom: 6 }}><div style={{ fontSize: 9, fontWeight: 700, color: P.text, fontStyle: 'italic' }}>{p.name}</div><p style={{ fontSize: 8, color: P.text, margin: '2px 0 0', lineHeight: 1.4 }}>{p.description}</p></div>
              ))}
            </div>
          )}
          {data.achievements && (
            <div><SectionH title="Achievements" /><BulletList text={data.achievements} textColor={P.text} accentColor={P.primary} /></div>
          )}
          {data.customSections.map((sec, i) => (
            <div key={i}><SectionH title={sec.title} /><p style={{ fontSize: 8, color: P.text, lineHeight: 1.45, margin: 0 }}>{sec.content}</p></div>
          ))}
        </div>
      )}
    </div>
  );
};
