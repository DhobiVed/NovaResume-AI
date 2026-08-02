import React from 'react';
import type { ResumeData, ThemeConfig } from '../../lib/resumeTypes';

interface Props { data: ResumeData; theme: ThemeConfig; }

const BulletList: React.FC<{ text: string; textColor: string }> = ({ text, textColor }) => (
  <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
    {text.split('\n').filter(Boolean).map((b, i) => (
      <li key={i} style={{ display: 'flex', gap: 6, marginBottom: 2 }}>
        <span style={{ color: textColor, opacity: 0.35, flexShrink: 0 }}>—</span>
        <span style={{ fontSize: 8, color: textColor, lineHeight: 1.5 }}>{b.replace(/^[-•▸]\s*/, '')}</span>
      </li>
    ))}
  </ul>
);

/** MinimalLine — clean single-column with thin rule dividers. Also covers Elegant variants via serif fonts. */
export const MinimalLineTemplate: React.FC<Props> = ({ data, theme }) => {
  const P = theme.palette;
  const F = theme.font.css;
  const skills = data.skills.split(',').map(s => s.trim()).filter(Boolean);
  const isTwoCol = theme.layout === 'two_col_left' || theme.layout === 'two_col_right';

  const MainContent = (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14, padding: isTwoCol ? '20px 18px' : '24px 48px' }}>
      {data.summary && (
        <div>
          <div style={{ fontSize: 8, fontWeight: 700, color: P.primary, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 6 }}>Profile</div>
          <div style={{ height: 1, backgroundColor: P.primary, opacity: 0.2, marginBottom: 6 }} />
          <p style={{ fontSize: 8.5, color: P.text, lineHeight: 1.6, margin: 0, fontStyle: 'italic' }}>{data.summary}</p>
        </div>
      )}
      {data.experience.length > 0 && (
        <div>
          <div style={{ fontSize: 8, fontWeight: 700, color: P.primary, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 6 }}>Experience</div>
          <div style={{ height: 1, backgroundColor: P.primary, opacity: 0.2, marginBottom: 8 }} />
          {data.experience.map((exp, i) => (
            <div key={i} style={{ marginBottom: 10, paddingLeft: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 2 }}>
                <span style={{ fontSize: 9.5, fontWeight: 700, color: P.text }}>{exp.role}</span>
                <span style={{ fontSize: 7.5, color: P.text, opacity: 0.5 }}>{exp.dates}</span>
              </div>
              <div style={{ fontSize: 8, color: P.primary, fontWeight: 600, marginBottom: 4 }}>{exp.company}</div>
              <BulletList text={exp.bullets} textColor={P.text} />
            </div>
          ))}
        </div>
      )}
      {data.education.length > 0 && (
        <div>
          <div style={{ fontSize: 8, fontWeight: 700, color: P.primary, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 6 }}>Education</div>
          <div style={{ height: 1, backgroundColor: P.primary, opacity: 0.2, marginBottom: 8 }} />
          {data.education.map((ed, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
              <div>
                <div style={{ fontSize: 9, fontWeight: 700, color: P.text }}>{ed.degree}</div>
                <div style={{ fontSize: 8, color: P.primary }}>{ed.school}</div>
              </div>
              <div style={{ fontSize: 7.5, color: P.text, opacity: 0.5 }}>{ed.year}</div>
            </div>
          ))}
        </div>
      )}
      {data.projects.length > 0 && (
        <div>
          <div style={{ fontSize: 8, fontWeight: 700, color: P.primary, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 6 }}>Projects</div>
          <div style={{ height: 1, backgroundColor: P.primary, opacity: 0.2, marginBottom: 8 }} />
          {data.projects.map((p, i) => (
            <div key={i} style={{ marginBottom: 6 }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: P.text }}>{p.name}</div>
              <p style={{ fontSize: 8, color: P.text, margin: '2px 0 0', lineHeight: 1.4 }}>{p.description}</p>
            </div>
          ))}
        </div>
      )}
      {data.achievements && (
        <div>
          <div style={{ fontSize: 8, fontWeight: 700, color: P.primary, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 6 }}>Achievements</div>
          <div style={{ height: 1, backgroundColor: P.primary, opacity: 0.2, marginBottom: 8 }} />
          <BulletList text={data.achievements} textColor={P.text} />
        </div>
      )}
      {data.customSections.map((sec, i) => (
        <div key={i}>
          <div style={{ fontSize: 8, fontWeight: 700, color: P.primary, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 6 }}>{sec.title}</div>
          <div style={{ height: 1, backgroundColor: P.primary, opacity: 0.2, marginBottom: 8 }} />
          <p style={{ fontSize: 8, color: P.text, lineHeight: 1.45, margin: 0 }}>{sec.content}</p>
        </div>
      ))}
    </div>
  );

  if (!isTwoCol) {
    return (
      <div style={{ width: 794, minHeight: 1123, backgroundColor: P.body, fontFamily: F, fontSize: theme.fontSize }}>
        {/* Simple clean header */}
        <div style={{ padding: '32px 48px 20px', borderBottom: `3px solid ${P.primary}` }}>
          <div style={{ fontSize: 28, fontWeight: 900, color: P.text, letterSpacing: '-0.3px' }}>{data.fullName || 'Your Name'}</div>
          <div style={{ fontSize: 11, fontWeight: 600, color: P.primary, textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 4 }}>{data.title}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 8 }}>
            {data.email && <span style={{ fontSize: 7.5, color: P.text, opacity: 0.7 }}>{data.email}</span>}
            {data.phone && <span style={{ fontSize: 7.5, color: P.text, opacity: 0.7 }}>{data.phone}</span>}
            {data.location && <span style={{ fontSize: 7.5, color: P.text, opacity: 0.7 }}>{data.location}</span>}
            {data.linkedin && <span style={{ fontSize: 7.5, color: P.primary, opacity: 0.8 }}>{data.linkedin}</span>}
          </div>
        </div>
        {/* Skills row */}
        {skills.length > 0 && (
          <div style={{ padding: '10px 48px', borderBottom: `1px solid ${P.border}`, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {skills.map((s, i) => <span key={i} style={{ fontSize: 7.5, color: P.text, background: `${P.primary}12`, border: `1px solid ${P.primary}25`, borderRadius: 3, padding: '2px 6px' }}>{s}</span>)}
          </div>
        )}
        {MainContent}
      </div>
    );
  }

  // Two-column variant
  return (
    <div style={{ width: 794, minHeight: 1123, backgroundColor: P.body, fontFamily: F, display: 'flex', flexDirection: 'column', fontSize: theme.fontSize }}>
      <div style={{ padding: '24px 24px 16px', borderBottom: `3px solid ${P.primary}` }}>
        <div style={{ fontSize: 26, fontWeight: 900, color: P.text }}>{data.fullName || 'Your Name'}</div>
        <div style={{ fontSize: 10, fontWeight: 600, color: P.primary, textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 3 }}>{data.title}</div>
      </div>
      <div style={{ flex: 1, display: 'flex' }}>
        <div style={{ width: '30%', backgroundColor: `${P.primary}08`, borderRight: `2px solid ${P.primary}15`, padding: '18px 14px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <div style={{ fontSize: 7.5, fontWeight: 700, color: P.primary, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 4 }}>Contact</div>
            {data.email && <div style={{ fontSize: 7, color: P.text, marginBottom: 3, wordBreak: 'break-all' }}>{data.email}</div>}
            {data.phone && <div style={{ fontSize: 7, color: P.text, marginBottom: 3 }}>{data.phone}</div>}
            {data.location && <div style={{ fontSize: 7, color: P.text, marginBottom: 3 }}>{data.location}</div>}
          </div>
          <div>
            <div style={{ fontSize: 7.5, fontWeight: 700, color: P.primary, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 4 }}>Skills</div>
            {skills.map((s, i) => <div key={i} style={{ fontSize: 7, color: P.text, marginBottom: 2.5 }}>• {s}</div>)}
          </div>
          {data.certifications && (
            <div>
              <div style={{ fontSize: 7.5, fontWeight: 700, color: P.primary, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 4 }}>Certifications</div>
              {data.certifications.split(',').map((c, i) => <div key={i} style={{ fontSize: 7, color: P.text, marginBottom: 2.5 }}>• {c.trim()}</div>)}
            </div>
          )}
          {data.languages && (
            <div>
              <div style={{ fontSize: 7.5, fontWeight: 700, color: P.primary, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 4 }}>Languages</div>
              {data.languages.split(',').map((l, i) => <div key={i} style={{ fontSize: 7, color: P.text, marginBottom: 2.5 }}>• {l.trim()}</div>)}
            </div>
          )}
        </div>
        {MainContent}
      </div>
    </div>
  );
};
