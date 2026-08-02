import React from 'react';
import type { ResumeData, ThemeConfig } from '../../lib/resumeTypes';

interface Props { data: ResumeData; theme: ThemeConfig; }

const BulletList: React.FC<{ text: string; textColor: string; accentColor: string }> = ({ text, textColor, accentColor }) => (
  <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
    {text.split('\n').filter(Boolean).map((b, i) => (
      <li key={i} style={{ display: 'flex', gap: 5, marginBottom: 2 }}>
        <span style={{ color: accentColor, flexShrink: 0, fontWeight: 800, fontSize: 8 }}>→</span>
        <span style={{ fontSize: 8, color: textColor, lineHeight: 1.45 }}>{b.replace(/^[-•▸→]\s*/, '')}</span>
      </li>
    ))}
  </ul>
);

export const StartupTemplate: React.FC<Props> = ({ data, theme }) => {
  const P = theme.palette;
  const F = theme.font.css;
  const skills = data.skills.split(',').map(s => s.trim()).filter(Boolean);
  const isOneCol = theme.layout === 'one_col';
  const isTopHeader = theme.layout === 'top_header';

  const Header = (
    <div style={{ backgroundColor: P.primary, padding: isTopHeader ? '28px 36px' : '18px 22px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: isTopHeader ? 30 : 24, fontWeight: 900, color: P.headerText, letterSpacing: '-0.5px', lineHeight: 1.1 }}>{data.fullName || 'Your Name'}</div>
          <div style={{ fontSize: isTopHeader ? 12 : 10, fontWeight: 700, color: P.accent, textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 5 }}>{data.title}</div>
          {isTopHeader && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 10 }}>
              {data.email && <span style={{ fontSize: 8, color: P.headerText, opacity: 0.8 }}>✉ {data.email}</span>}
              {data.phone && <span style={{ fontSize: 8, color: P.headerText, opacity: 0.8 }}>✆ {data.phone}</span>}
              {data.location && <span style={{ fontSize: 8, color: P.headerText, opacity: 0.8 }}>⌖ {data.location}</span>}
              {data.github && <span style={{ fontSize: 8, color: P.accent }}>⌥ {data.github}</span>}
              {data.linkedin && <span style={{ fontSize: 8, color: P.accent }}>in {data.linkedin}</span>}
            </div>
          )}
        </div>
        {data.showPhoto && data.photoUrl && (
          <img src={data.photoUrl} alt="Profile" style={{ width: isTopHeader ? 72 : 56, height: isTopHeader ? 72 : 56, objectFit: 'cover', borderRadius: data.photoShape === 'round' ? '50%' : 8, border: `2px solid ${P.accent}` }} />
        )}
      </div>
    </div>
  );

  if (isTopHeader || isOneCol) {
    return (
      <div style={{ width: 794, minHeight: 1123, backgroundColor: P.body, fontFamily: F, display: 'flex', flexDirection: 'column', fontSize: theme.fontSize }}>
        {Header}
        <div style={{ padding: isTopHeader ? '20px 36px' : '20px 28px', display: 'flex', flexDirection: 'column', gap: 13 }}>
          {!isTopHeader && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, padding: '8px 0', borderBottom: `1px solid ${P.border}`, marginBottom: 4 }}>
              {data.email && <span style={{ fontSize: 7.5, color: P.text }}>✉ {data.email}</span>}
              {data.phone && <span style={{ fontSize: 7.5, color: P.text }}>✆ {data.phone}</span>}
              {data.location && <span style={{ fontSize: 7.5, color: P.text }}>⌖ {data.location}</span>}
            </div>
          )}
          {data.summary && (
            <div style={{ padding: '10px 14px', backgroundColor: `${P.primary}10`, borderLeft: `4px solid ${P.accent}`, borderRadius: '0 6px 6px 0' }}>
              <p style={{ fontSize: 8.5, color: P.text, lineHeight: 1.55, margin: 0 }}>{data.summary}</p>
            </div>
          )}
          {skills.length > 0 && (
            <div>
              <div style={{ fontSize: 8, fontWeight: 800, color: P.primary, textTransform: 'uppercase', letterSpacing: '0.12em', borderBottom: `2px solid ${P.primary}`, paddingBottom: 3, marginBottom: 6 }}>Tech & Skills</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {skills.map((s, i) => <span key={i} style={{ backgroundColor: `${P.primary}15`, border: `1px solid ${P.primary}25`, borderRadius: 4, padding: '3px 8px', fontSize: 7.5, color: P.text, fontWeight: 600 }}>{s}</span>)}
              </div>
            </div>
          )}
          {data.experience.length > 0 && (
            <div>
              <div style={{ fontSize: 8, fontWeight: 800, color: P.primary, textTransform: 'uppercase', letterSpacing: '0.12em', borderBottom: `2px solid ${P.primary}`, paddingBottom: 3, marginBottom: 6 }}>Experience & Impact</div>
              {data.experience.map((exp, i) => (
                <div key={i} style={{ marginBottom: 9, paddingLeft: 10, borderLeft: `3px solid ${P.accent}30` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontSize: 9.5, fontWeight: 700, color: P.text }}>{exp.role}</span>
                    <span style={{ fontSize: 7, color: P.text, opacity: 0.55 }}>{exp.dates}</span>
                  </div>
                  <div style={{ fontSize: 8, color: P.primary, fontWeight: 700, marginBottom: 3 }}>{exp.company}</div>
                  <BulletList text={exp.bullets} textColor={P.text} accentColor={P.accent} />
                </div>
              ))}
            </div>
          )}
          {data.projects.length > 0 && (
            <div>
              <div style={{ fontSize: 8, fontWeight: 800, color: P.primary, textTransform: 'uppercase', letterSpacing: '0.12em', borderBottom: `2px solid ${P.primary}`, paddingBottom: 3, marginBottom: 6 }}>Venture Projects</div>
              {data.projects.map((p, i) => (
                <div key={i} style={{ marginBottom: 6, padding: '7px 10px', border: `1px solid ${P.border}`, borderRadius: 5, borderTop: `3px solid ${P.primary}` }}>
                  <div style={{ fontSize: 8.5, fontWeight: 700, color: P.primary }}>{p.name}</div>
                  <p style={{ fontSize: 7.5, color: P.text, margin: '2px 0 0', lineHeight: 1.4 }}>{p.description}</p>
                </div>
              ))}
            </div>
          )}
          {data.education.length > 0 && (
            <div>
              <div style={{ fontSize: 8, fontWeight: 800, color: P.primary, textTransform: 'uppercase', letterSpacing: '0.12em', borderBottom: `2px solid ${P.primary}`, paddingBottom: 3, marginBottom: 6 }}>Education</div>
              {data.education.map((ed, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <div><div style={{ fontSize: 9, fontWeight: 700, color: P.text }}>{ed.degree}</div><div style={{ fontSize: 8, color: P.primary }}>{ed.school}</div></div>
                  <div style={{ fontSize: 7.5, color: P.text, opacity: 0.5 }}>{ed.year}</div>
                </div>
              ))}
            </div>
          )}
          {data.achievements && (
            <div>
              <div style={{ fontSize: 8, fontWeight: 800, color: P.primary, textTransform: 'uppercase', letterSpacing: '0.12em', borderBottom: `2px solid ${P.primary}`, paddingBottom: 3, marginBottom: 6 }}>Key Wins</div>
              <BulletList text={data.achievements} textColor={P.text} accentColor={P.accent} />
            </div>
          )}
          {data.customSections.map((sec, i) => (
            <div key={i}>
              <div style={{ fontSize: 8, fontWeight: 800, color: P.primary, textTransform: 'uppercase', letterSpacing: '0.12em', borderBottom: `2px solid ${P.primary}`, paddingBottom: 3, marginBottom: 6 }}>{sec.title}</div>
              <p style={{ fontSize: 8, color: P.text, lineHeight: 1.45, margin: 0 }}>{sec.content}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Two-column startup
  return (
    <div style={{ width: 794, minHeight: 1123, backgroundColor: P.body, fontFamily: F, display: 'flex', flexDirection: 'column', fontSize: theme.fontSize }}>
      {Header}
      <div style={{ flex: 1, display: 'flex' }}>
        <div style={{ width: `${theme.sidebarWidth}%`, backgroundColor: P.primary, color: P.headerText, padding: '18px 14px', display: 'flex', flexDirection: 'column', gap: 13 }}>
          <div>
            <div style={{ fontSize: 7, fontWeight: 800, color: P.accent, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 5 }}>Contact</div>
            {data.email && <div style={{ fontSize: 7.5, marginBottom: 3, wordBreak: 'break-all', opacity: 0.9 }}>✉ {data.email}</div>}
            {data.phone && <div style={{ fontSize: 7.5, marginBottom: 3, opacity: 0.9 }}>✆ {data.phone}</div>}
            {data.location && <div style={{ fontSize: 7.5, marginBottom: 3, opacity: 0.9 }}>⌖ {data.location}</div>}
            {data.github && <div style={{ fontSize: 7, marginBottom: 2, color: P.accent }}>⌥ {data.github}</div>}
          </div>
          <div>
            <div style={{ fontSize: 7, fontWeight: 800, color: P.accent, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 5 }}>Skills</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>{skills.map((s, i) => <span key={i} style={{ backgroundColor: `${P.headerText}15`, borderRadius: 3, padding: '2px 5px', fontSize: 6.5, fontWeight: 600 }}>{s}</span>)}</div>
          </div>
          {data.education.length > 0 && (
            <div>
              <div style={{ fontSize: 7, fontWeight: 800, color: P.accent, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 5 }}>Education</div>
              {data.education.map((ed, i) => <div key={i} style={{ marginBottom: 6 }}><div style={{ fontSize: 7.5, fontWeight: 700 }}>{ed.degree}</div><div style={{ fontSize: 7, opacity: 0.8 }}>{ed.school}</div><div style={{ fontSize: 6.5, opacity: 0.6 }}>{ed.year}</div></div>)}
            </div>
          )}
          {data.certifications && (
            <div>
              <div style={{ fontSize: 7, fontWeight: 800, color: P.accent, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 5 }}>Certs</div>
              {data.certifications.split(',').map((c, i) => <div key={i} style={{ fontSize: 7, marginBottom: 3, opacity: 0.9 }}>• {c.trim()}</div>)}
            </div>
          )}
        </div>
        <div style={{ flex: 1, padding: '18px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {data.summary && <div style={{ padding: '8px 10px', backgroundColor: `${P.primary}10`, borderLeft: `4px solid ${P.accent}`, borderRadius: '0 5px 5px 0' }}><p style={{ fontSize: 8, color: P.text, lineHeight: 1.55, margin: 0 }}>{data.summary}</p></div>}
          {data.experience.length > 0 && (
            <div>
              <div style={{ fontSize: 8, fontWeight: 800, color: P.primary, textTransform: 'uppercase', letterSpacing: '0.12em', borderBottom: `2px solid ${P.primary}`, paddingBottom: 3, marginBottom: 6 }}>Experience</div>
              {data.experience.map((exp, i) => (
                <div key={i} style={{ marginBottom: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ fontSize: 9, fontWeight: 700, color: P.text }}>{exp.role}</span><span style={{ fontSize: 7, color: P.text, opacity: 0.5 }}>{exp.dates}</span></div>
                  <div style={{ fontSize: 7.5, color: P.primary, fontWeight: 600, marginBottom: 3 }}>{exp.company}</div>
                  <BulletList text={exp.bullets} textColor={P.text} accentColor={P.accent} />
                </div>
              ))}
            </div>
          )}
          {data.projects.length > 0 && (
            <div>
              <div style={{ fontSize: 8, fontWeight: 800, color: P.primary, textTransform: 'uppercase', letterSpacing: '0.12em', borderBottom: `2px solid ${P.primary}`, paddingBottom: 3, marginBottom: 6 }}>Projects</div>
              {data.projects.map((p, i) => <div key={i} style={{ marginBottom: 6, padding: '5px 7px', border: `1px solid ${P.border}`, borderRadius: 4, borderTop: `3px solid ${P.primary}` }}><div style={{ fontSize: 8.5, fontWeight: 700, color: P.primary }}>{p.name}</div><p style={{ fontSize: 7.5, color: P.text, margin: '2px 0 0', lineHeight: 1.4 }}>{p.description}</p></div>)}
            </div>
          )}
          {data.achievements && (
            <div>
              <div style={{ fontSize: 8, fontWeight: 800, color: P.primary, textTransform: 'uppercase', letterSpacing: '0.12em', borderBottom: `2px solid ${P.primary}`, paddingBottom: 3, marginBottom: 6 }}>Key Wins</div>
              <BulletList text={data.achievements} textColor={P.text} accentColor={P.accent} />
            </div>
          )}
          {data.customSections.map((sec, i) => <div key={i}><div style={{ fontSize: 8, fontWeight: 800, color: P.primary, textTransform: 'uppercase', letterSpacing: '0.12em', borderBottom: `2px solid ${P.primary}`, paddingBottom: 3, marginBottom: 6 }}>{sec.title}</div><p style={{ fontSize: 8, color: P.text, lineHeight: 1.45, margin: 0 }}>{sec.content}</p></div>)}
        </div>
      </div>
    </div>
  );
};
