import React from 'react';
import type { ResumeData, ThemeConfig } from '../../lib/resumeTypes';

interface Props { data: ResumeData; theme: ThemeConfig; }

const BulletList: React.FC<{ text: string; textColor: string }> = ({ text, textColor }) => (
  <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
    {text.split('\n').filter(Boolean).map((b, i) => (
      <li key={i} style={{ display: 'flex', gap: 5, marginBottom: 2 }}>
        <span style={{ color: textColor, opacity: 0.4, flexShrink: 0 }}>▸</span>
        <span style={{ fontSize: 8, color: textColor, lineHeight: 1.45 }}>{b.replace(/^[-•▸]\s*/, '')}</span>
      </li>
    ))}
  </ul>
);

export const CorporateTemplate: React.FC<Props> = ({ data, theme }) => {
  const P = theme.palette;
  const F = theme.font.css;
  const skills = data.skills.split(',').map(s => s.trim()).filter(Boolean);
  const isOneCol = theme.layout === 'one_col';

  if (isOneCol) {
    return (
      <div style={{ width: 794, minHeight: 1123, backgroundColor: P.body, fontFamily: F, fontSize: theme.fontSize }}>
        <div style={{ backgroundColor: P.primary, padding: '24px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 26, fontWeight: 900, color: P.headerText }}>{data.fullName || 'Your Name'}</div>
            <div style={{ fontSize: 10, color: P.accent, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 3 }}>{data.title}</div>
          </div>
          {data.showPhoto && data.photoUrl && (
            <img src={data.photoUrl} alt="Profile" style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: data.photoShape === 'round' ? '50%' : 8, border: `2px solid ${P.accent}` }} />
          )}
        </div>
        <div style={{ backgroundColor: `${P.primary}12`, padding: '8px 40px', borderBottom: `1px solid ${P.border}`, display: 'flex', flexWrap: 'wrap', gap: 16 }}>
          {data.email && <span style={{ fontSize: 7.5, color: P.text }}>✉ {data.email}</span>}
          {data.phone && <span style={{ fontSize: 7.5, color: P.text }}>✆ {data.phone}</span>}
          {data.location && <span style={{ fontSize: 7.5, color: P.text }}>⌖ {data.location}</span>}
          {data.linkedin && <span style={{ fontSize: 7.5, color: P.primary }}>{data.linkedin}</span>}
        </div>
        <div style={{ padding: '18px 40px', display: 'flex', flexDirection: 'column', gap: 13 }}>
          {data.summary && (
            <div>
              <div style={{ fontSize: 9, fontWeight: 800, color: P.primary, textTransform: 'uppercase', letterSpacing: '0.12em', borderBottom: `2px solid ${P.primary}`, paddingBottom: 3, marginBottom: 6 }}>Professional Summary</div>
              <p style={{ fontSize: 8.5, color: P.text, lineHeight: 1.55, margin: 0 }}>{data.summary}</p>
            </div>
          )}
          {data.experience.length > 0 && (
            <div>
              <div style={{ fontSize: 9, fontWeight: 800, color: P.primary, textTransform: 'uppercase', letterSpacing: '0.12em', borderBottom: `2px solid ${P.primary}`, paddingBottom: 3, marginBottom: 6 }}>Work Experience</div>
              {data.experience.map((exp, i) => (
                <div key={i} style={{ marginBottom: 10, paddingLeft: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: P.text }}>{exp.role}</div>
                      <div style={{ fontSize: 8.5, color: P.primary, fontWeight: 600 }}>{exp.company}</div>
                    </div>
                    <div style={{ fontSize: 7.5, color: P.text, opacity: 0.55 }}>{exp.dates}</div>
                  </div>
                  <BulletList text={exp.bullets} textColor={P.text} />
                </div>
              ))}
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <div style={{ fontSize: 9, fontWeight: 800, color: P.primary, textTransform: 'uppercase', letterSpacing: '0.12em', borderBottom: `2px solid ${P.primary}`, paddingBottom: 3, marginBottom: 6 }}>Education</div>
              {data.education.map((ed, i) => (
                <div key={i} style={{ marginBottom: 5 }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: P.text }}>{ed.degree}</div>
                  <div style={{ fontSize: 8, color: P.primary }}>{ed.school}</div>
                  <div style={{ fontSize: 7.5, color: P.text, opacity: 0.55 }}>{ed.year}</div>
                </div>
              ))}
            </div>
            <div>
              <div style={{ fontSize: 9, fontWeight: 800, color: P.primary, textTransform: 'uppercase', letterSpacing: '0.12em', borderBottom: `2px solid ${P.primary}`, paddingBottom: 3, marginBottom: 6 }}>Core Skills</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                {skills.map((s, i) => <span key={i} style={{ fontSize: 7.5, color: P.text, border: `1px solid ${P.border}`, borderRadius: 3, padding: '2px 5px' }}>{s}</span>)}
              </div>
            </div>
          </div>
          {data.certifications && (
            <div>
              <div style={{ fontSize: 9, fontWeight: 800, color: P.primary, textTransform: 'uppercase', letterSpacing: '0.12em', borderBottom: `2px solid ${P.primary}`, paddingBottom: 3, marginBottom: 6 }}>Certifications</div>
              <p style={{ fontSize: 8, color: P.text, margin: 0 }}>{data.certifications}</p>
            </div>
          )}
          {data.achievements && (
            <div>
              <div style={{ fontSize: 9, fontWeight: 800, color: P.primary, textTransform: 'uppercase', letterSpacing: '0.12em', borderBottom: `2px solid ${P.primary}`, paddingBottom: 3, marginBottom: 6 }}>Key Achievements</div>
              <BulletList text={data.achievements} textColor={P.text} />
            </div>
          )}
          {data.customSections.map((sec, i) => (
            <div key={i}>
              <div style={{ fontSize: 9, fontWeight: 800, color: P.primary, textTransform: 'uppercase', letterSpacing: '0.12em', borderBottom: `2px solid ${P.primary}`, paddingBottom: 3, marginBottom: 6 }}>{sec.title}</div>
              <p style={{ fontSize: 8, color: P.text, lineHeight: 1.45, margin: 0 }}>{sec.content}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Two-column corporate
  return (
    <div style={{ width: 794, minHeight: 1123, backgroundColor: P.body, fontFamily: F, display: 'flex', flexDirection: 'column', fontSize: theme.fontSize }}>
      <div style={{ backgroundColor: P.primary, padding: '20px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 24, fontWeight: 900, color: P.headerText }}>{data.fullName || 'Your Name'}</div>
          <div style={{ fontSize: 10, color: P.accent, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 2 }}>{data.title}</div>
        </div>
        {data.showPhoto && data.photoUrl && (
          <img src={data.photoUrl} alt="Profile" style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: data.photoShape === 'round' ? '50%' : 6, border: `2px solid ${P.accent}` }} />
        )}
      </div>
      <div style={{ flex: 1, display: 'flex' }}>
        {/* Sidebar */}
        <div style={{ width: `${theme.sidebarWidth}%`, backgroundColor: P.primary, color: P.headerText, padding: '18px 14px', display: 'flex', flexDirection: 'column', gap: 13 }}>
          <div>
            <div style={{ fontSize: 7, fontWeight: 800, color: P.accent, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 5 }}>Contact</div>
            {data.email && <div style={{ fontSize: 7.5, marginBottom: 3, wordBreak: 'break-all', opacity: 0.9 }}>{data.email}</div>}
            {data.phone && <div style={{ fontSize: 7.5, marginBottom: 3, opacity: 0.9 }}>{data.phone}</div>}
            {data.location && <div style={{ fontSize: 7.5, marginBottom: 3, opacity: 0.9 }}>{data.location}</div>}
            {data.linkedin && <div style={{ fontSize: 7, marginBottom: 2, opacity: 0.8 }}>{data.linkedin}</div>}
          </div>
          <div>
            <div style={{ fontSize: 7, fontWeight: 800, color: P.accent, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 5 }}>Core Skills</div>
            {skills.map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 3 }}>
                <div style={{ width: 4, height: 4, borderRadius: '50%', backgroundColor: P.accent, flexShrink: 0 }} />
                <span style={{ fontSize: 7, opacity: 0.9 }}>{s}</span>
              </div>
            ))}
          </div>
          {data.education.length > 0 && (
            <div>
              <div style={{ fontSize: 7, fontWeight: 800, color: P.accent, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 5 }}>Education</div>
              {data.education.map((ed, i) => (
                <div key={i} style={{ marginBottom: 6 }}>
                  <div style={{ fontSize: 7.5, fontWeight: 700 }}>{ed.degree}</div>
                  <div style={{ fontSize: 7, opacity: 0.8 }}>{ed.school}</div>
                  <div style={{ fontSize: 6.5, opacity: 0.6 }}>{ed.year}</div>
                </div>
              ))}
            </div>
          )}
          {data.certifications && (
            <div>
              <div style={{ fontSize: 7, fontWeight: 800, color: P.accent, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 5 }}>Certifications</div>
              {data.certifications.split(',').map((c, i) => <div key={i} style={{ fontSize: 7, marginBottom: 3, opacity: 0.9 }}>• {c.trim()}</div>)}
            </div>
          )}
        </div>
        {/* Main */}
        <div style={{ flex: 1, padding: '18px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {data.summary && (
            <div>
              <div style={{ fontSize: 8.5, fontWeight: 800, color: P.primary, textTransform: 'uppercase', letterSpacing: '0.12em', borderBottom: `2px solid ${P.primary}`, paddingBottom: 3, marginBottom: 6 }}>Summary</div>
              <p style={{ fontSize: 8, color: P.text, lineHeight: 1.55, margin: 0 }}>{data.summary}</p>
            </div>
          )}
          {data.experience.length > 0 && (
            <div>
              <div style={{ fontSize: 8.5, fontWeight: 800, color: P.primary, textTransform: 'uppercase', letterSpacing: '0.12em', borderBottom: `2px solid ${P.primary}`, paddingBottom: 3, marginBottom: 6 }}>Experience</div>
              {data.experience.map((exp, i) => (
                <div key={i} style={{ marginBottom: 9 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <div style={{ fontSize: 9.5, fontWeight: 700, color: P.text }}>{exp.role}</div>
                    <div style={{ fontSize: 7, color: P.text, opacity: 0.5 }}>{exp.dates}</div>
                  </div>
                  <div style={{ fontSize: 8, color: P.primary, fontWeight: 600, marginBottom: 3 }}>{exp.company}</div>
                  <BulletList text={exp.bullets} textColor={P.text} />
                </div>
              ))}
            </div>
          )}
          {data.projects.length > 0 && (
            <div>
              <div style={{ fontSize: 8.5, fontWeight: 800, color: P.primary, textTransform: 'uppercase', letterSpacing: '0.12em', borderBottom: `2px solid ${P.primary}`, paddingBottom: 3, marginBottom: 6 }}>Notable Projects</div>
              {data.projects.map((p, i) => (
                <div key={i} style={{ marginBottom: 5 }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: P.text }}>{p.name}</div>
                  <p style={{ fontSize: 8, color: P.text, margin: '2px 0 0', lineHeight: 1.4 }}>{p.description}</p>
                </div>
              ))}
            </div>
          )}
          {data.achievements && (
            <div>
              <div style={{ fontSize: 8.5, fontWeight: 800, color: P.primary, textTransform: 'uppercase', letterSpacing: '0.12em', borderBottom: `2px solid ${P.primary}`, paddingBottom: 3, marginBottom: 6 }}>Achievements</div>
              <BulletList text={data.achievements} textColor={P.text} />
            </div>
          )}
          {data.customSections.map((sec, i) => (
            <div key={i}>
              <div style={{ fontSize: 8.5, fontWeight: 800, color: P.primary, textTransform: 'uppercase', letterSpacing: '0.12em', borderBottom: `2px solid ${P.primary}`, paddingBottom: 3, marginBottom: 6 }}>{sec.title}</div>
              <p style={{ fontSize: 8, color: P.text, lineHeight: 1.45, margin: 0 }}>{sec.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
