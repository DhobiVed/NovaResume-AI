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

export const StudentFresherTemplate: React.FC<Props> = ({ data, theme }) => {
  const P = theme.palette;
  const F = theme.font.css;
  const skills = data.skills.split(',').map(s => s.trim()).filter(Boolean);
  const isTwoCol = theme.layout === 'two_col_left' || theme.layout === 'two_col_right';

  const SectionHead: React.FC<{ title: string }> = ({ title }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
      <div style={{ fontSize: 8, fontWeight: 800, color: P.primary, textTransform: 'uppercase', letterSpacing: '0.14em' }}>{title}</div>
      <div style={{ flex: 1, height: 1.5, backgroundColor: `${P.primary}30` }} />
    </div>
  );

  const singleCol = (
    <div style={{ width: 794, minHeight: 1123, backgroundColor: P.body, fontFamily: F, fontSize: theme.fontSize }}>
      {/* Student Header with accent bar */}
      <div style={{ backgroundColor: P.primary, padding: '22px 32px' }}>
        <div style={{ fontSize: 26, fontWeight: 900, color: P.headerText }}>{data.fullName || 'Your Name'}</div>
        <div style={{ fontSize: 10, color: P.accent, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 3 }}>{data.title}</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 8 }}>
          {data.email && <span style={{ fontSize: 7.5, color: P.headerText, opacity: 0.85 }}>✉ {data.email}</span>}
          {data.phone && <span style={{ fontSize: 7.5, color: P.headerText, opacity: 0.85 }}>✆ {data.phone}</span>}
          {data.location && <span style={{ fontSize: 7.5, color: P.headerText, opacity: 0.85 }}>⌖ {data.location}</span>}
          {data.linkedin && <span style={{ fontSize: 7.5, color: P.accent, opacity: 0.9 }}>in {data.linkedin}</span>}
          {data.github && <span style={{ fontSize: 7.5, color: P.accent, opacity: 0.9 }}>⌥ {data.github}</span>}
        </div>
      </div>
      <div style={{ padding: '20px 32px', display: 'flex', flexDirection: 'column', gap: 13 }}>
        {data.objective && (
          <div>
            <SectionHead title="Career Objective" />
            <p style={{ fontSize: 8.5, color: P.text, lineHeight: 1.55, margin: 0, fontStyle: 'italic' }}>{data.objective}</p>
          </div>
        )}
        {data.education.length > 0 && (
          <div>
            <SectionHead title="Education" />
            {data.education.map((ed, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <div>
                  <div style={{ fontSize: 9.5, fontWeight: 700, color: P.text }}>{ed.degree}</div>
                  <div style={{ fontSize: 8, color: P.primary, fontWeight: 600 }}>{ed.school}</div>
                  {ed.honors && <div style={{ fontSize: 7.5, color: P.text, opacity: 0.7 }}>{ed.honors}</div>}
                </div>
                <div style={{ fontSize: 7.5, color: P.text, opacity: 0.5, textAlign: 'right' }}>{ed.year}{ed.gpa ? `\nGPA: ${ed.gpa}` : ''}</div>
              </div>
            ))}
          </div>
        )}
        {skills.length > 0 && (
          <div>
            <SectionHead title="Technical Skills" />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {skills.map((s, i) => (
                <span key={i} style={{ backgroundColor: `${P.primary}12`, border: `1px solid ${P.primary}25`, borderRadius: 4, padding: '2px 7px', fontSize: 7.5, color: P.text, fontWeight: 600 }}>{s}</span>
              ))}
            </div>
          </div>
        )}
        {data.experience.length > 0 && (
          <div>
            <SectionHead title="Experience" />
            {data.experience.map((exp, i) => (
              <div key={i} style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: 9, fontWeight: 700, color: P.text }}>{exp.role}</div>
                    <div style={{ fontSize: 8, color: P.primary, fontWeight: 600 }}>{exp.company}</div>
                  </div>
                  <div style={{ fontSize: 7.5, color: P.text, opacity: 0.5 }}>{exp.dates}</div>
                </div>
                <BulletList text={exp.bullets} textColor={P.text} />
              </div>
            ))}
          </div>
        )}
        {data.projects.length > 0 && (
          <div>
            <SectionHead title="Academic Projects" />
            {data.projects.map((p, i) => (
              <div key={i} style={{ marginBottom: 6, padding: '6px 8px', border: `1px solid ${P.primary}20`, borderRadius: 5, backgroundColor: `${P.primary}05` }}>
                <div style={{ fontSize: 8.5, fontWeight: 700, color: P.primary }}>{p.name}{p.tech ? ` · ${p.tech}` : ''}</div>
                <p style={{ fontSize: 7.5, color: P.text, margin: '2px 0 0', lineHeight: 1.4 }}>{p.description}</p>
              </div>
            ))}
          </div>
        )}
        {data.certifications && (
          <div>
            <SectionHead title="Certifications & Awards" />
            <p style={{ fontSize: 8, color: P.text, margin: 0 }}>{data.certifications}</p>
          </div>
        )}
        {data.achievements && (
          <div>
            <SectionHead title="Achievements & Extracurriculars" />
            <BulletList text={data.achievements} textColor={P.text} />
          </div>
        )}
        {data.customSections.map((sec, i) => (
          <div key={i}>
            <SectionHead title={sec.title} />
            <p style={{ fontSize: 8, color: P.text, lineHeight: 1.45, margin: 0 }}>{sec.content}</p>
          </div>
        ))}
      </div>
    </div>
  );

  if (!isTwoCol) return singleCol;

  return (
    <div style={{ width: 794, minHeight: 1123, backgroundColor: P.body, fontFamily: F, display: 'flex', flexDirection: 'column', fontSize: theme.fontSize }}>
      <div style={{ backgroundColor: P.primary, padding: '22px 24px' }}>
        <div style={{ fontSize: 24, fontWeight: 900, color: P.headerText }}>{data.fullName || 'Your Name'}</div>
        <div style={{ fontSize: 10, color: P.accent, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 2 }}>{data.title}</div>
      </div>
      <div style={{ flex: 1, display: 'flex' }}>
        {/* Sidebar */}
        <div style={{ width: `${theme.sidebarWidth}%`, backgroundColor: `${P.primary}0d`, borderRight: `2px solid ${P.primary}18`, padding: '18px 14px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <div style={{ fontSize: 7.5, fontWeight: 700, color: P.primary, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Contact</div>
            {data.email && <div style={{ fontSize: 7, color: P.text, marginBottom: 3, wordBreak: 'break-all' }}>{data.email}</div>}
            {data.phone && <div style={{ fontSize: 7, color: P.text, marginBottom: 3 }}>{data.phone}</div>}
            {data.location && <div style={{ fontSize: 7, color: P.text, marginBottom: 3 }}>{data.location}</div>}
            {data.linkedin && <div style={{ fontSize: 6.5, color: P.primary, marginBottom: 2 }}>{data.linkedin}</div>}
          </div>
          <div>
            <div style={{ fontSize: 7.5, fontWeight: 700, color: P.primary, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Skills</div>
            {skills.map((s, i) => <div key={i} style={{ fontSize: 7, color: P.text, marginBottom: 2.5, padding: '2px 5px', backgroundColor: `${P.primary}12`, borderRadius: 3 }}>{s}</div>)}
          </div>
          {data.certifications && (
            <div>
              <div style={{ fontSize: 7.5, fontWeight: 700, color: P.primary, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Certifications</div>
              {data.certifications.split(',').map((c, i) => <div key={i} style={{ fontSize: 7, color: P.text, marginBottom: 2.5 }}>• {c.trim()}</div>)}
            </div>
          )}
        </div>
        {/* Main */}
        <div style={{ flex: 1, padding: '18px 16px', display: 'flex', flexDirection: 'column', gap: 11 }}>
          {data.objective && <p style={{ fontSize: 8, color: P.text, lineHeight: 1.5, margin: 0, borderLeft: `3px solid ${P.accent}`, paddingLeft: 8, fontStyle: 'italic' }}>{data.objective}</p>}
          {data.education.length > 0 && (
            <div>
              <div style={{ fontSize: 8, fontWeight: 800, color: P.primary, textTransform: 'uppercase', letterSpacing: '0.12em', borderBottom: `1.5px solid ${P.primary}`, paddingBottom: 3, marginBottom: 6 }}>Education</div>
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
              <div style={{ fontSize: 8, fontWeight: 800, color: P.primary, textTransform: 'uppercase', letterSpacing: '0.12em', borderBottom: `1.5px solid ${P.primary}`, paddingBottom: 3, marginBottom: 6 }}>Projects</div>
              {data.projects.map((p, i) => (
                <div key={i} style={{ marginBottom: 6, padding: '5px 7px', border: `1px solid ${P.primary}18`, borderRadius: 4 }}>
                  <div style={{ fontSize: 8.5, fontWeight: 700, color: P.primary }}>{p.name}</div>
                  <p style={{ fontSize: 7.5, color: P.text, margin: '2px 0 0', lineHeight: 1.4 }}>{p.description}</p>
                </div>
              ))}
            </div>
          )}
          {data.experience.length > 0 && (
            <div>
              <div style={{ fontSize: 8, fontWeight: 800, color: P.primary, textTransform: 'uppercase', letterSpacing: '0.12em', borderBottom: `1.5px solid ${P.primary}`, paddingBottom: 3, marginBottom: 6 }}>Experience</div>
              {data.experience.map((exp, i) => (
                <div key={i} style={{ marginBottom: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 9, fontWeight: 700, color: P.text }}>{exp.role}</span>
                    <span style={{ fontSize: 7, color: P.text, opacity: 0.5 }}>{exp.dates}</span>
                  </div>
                  <div style={{ fontSize: 7.5, color: P.primary, fontWeight: 600, marginBottom: 3 }}>{exp.company}</div>
                  <BulletList text={exp.bullets} textColor={P.text} />
                </div>
              ))}
            </div>
          )}
          {data.achievements && (
            <div>
              <div style={{ fontSize: 8, fontWeight: 800, color: P.primary, textTransform: 'uppercase', letterSpacing: '0.12em', borderBottom: `1.5px solid ${P.primary}`, paddingBottom: 3, marginBottom: 6 }}>Achievements</div>
              <BulletList text={data.achievements} textColor={P.text} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
