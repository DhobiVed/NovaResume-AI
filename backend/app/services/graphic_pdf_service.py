import os
import uuid
from typing import Dict, Any, List
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, KeepTogether, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.graphics.shapes import Drawing, Rect, String
from app.core.config import GENERATED_DIR

THEME_PALETTES = {
    "royal_blue": {"sidebar": "#1e3a8a", "accent": "#3b82f6", "sidebar_text": "#ffffff", "card_bg": "#f8fafc", "text": "#0f172a"},
    "navy_gold": {"sidebar": "#0f172a", "accent": "#eab308", "sidebar_text": "#ffffff", "card_bg": "#f8fafc", "text": "#0f172a"},
    "black_emerald": {"sidebar": "#064e3b", "accent": "#10b981", "sidebar_text": "#ffffff", "card_bg": "#f0fdf4", "text": "#064e3b"},
    "indigo_cyan": {"sidebar": "#312e81", "accent": "#06b6d4", "sidebar_text": "#ffffff", "card_bg": "#f0f9ff", "text": "#1e1b4b"},
    "slate_orange": {"sidebar": "#1e293b", "accent": "#f97316", "sidebar_text": "#ffffff", "card_bg": "#fff7ed", "text": "#0f172a"},
    "wine_grey": {"sidebar": "#4c1d95", "accent": "#a855f7", "sidebar_text": "#ffffff", "card_bg": "#faf5ff", "text": "#3b0764"},
    "dark_purple": {"sidebar": "#3b0764", "accent": "#d8b4fe", "sidebar_text": "#ffffff", "card_bg": "#f3e8ff", "text": "#2e1065"},
    "charcoal_blue": {"sidebar": "#111827", "accent": "#38bdf8", "sidebar_text": "#ffffff", "card_bg": "#f0f9ff", "text": "#111827"},
    "forest_green": {"sidebar": "#14532d", "accent": "#22c55e", "sidebar_text": "#ffffff", "card_bg": "#f0fdf4", "text": "#14532d"},
    "cyberpunk_dark": {"sidebar": "#09090b", "accent": "#f43f5e", "sidebar_text": "#ffffff", "card_bg": "#18181b", "text": "#f4f4f5"},
    "google_style": {"sidebar": "#1a73e8", "accent": "#ea4335", "sidebar_text": "#ffffff", "card_bg": "#f8f9fa", "text": "#202124"},
    "microsoft_style": {"sidebar": "#0078d4", "accent": "#00bcf2", "sidebar_text": "#ffffff", "card_bg": "#f3f2f1", "text": "#201f1e"},
    "apple_minimal": {"sidebar": "#1d1d1f", "accent": "#86868b", "sidebar_text": "#ffffff", "card_bg": "#f5f5f7", "text": "#1d1d1f"},
    "canva_modern": {"sidebar": "#7d2ae8", "accent": "#00c4cc", "sidebar_text": "#ffffff", "card_bg": "#fafafa", "text": "#2d3748"},
    "executive_gold": {"sidebar": "#1e1b4b", "accent": "#d97706", "sidebar_text": "#ffffff", "card_bg": "#fffbe6", "text": "#1e1b4b"},
    "corporate_teal": {"sidebar": "#134e4a", "accent": "#14b8a6", "sidebar_text": "#ffffff", "card_bg": "#f0fdfa", "text": "#134e4a"},
    "luxury_rose": {"sidebar": "#881337", "accent": "#fb7185", "sidebar_text": "#ffffff", "card_bg": "#fff1f2", "text": "#4c0519"},
    "startup_violet": {"sidebar": "#581c87", "accent": "#c084fc", "sidebar_text": "#ffffff", "card_bg": "#faf5ff", "text": "#3b0764"},
    "data_science_blue": {"sidebar": "#172554", "accent": "#38bdf8", "sidebar_text": "#ffffff", "card_bg": "#f0f9ff", "text": "#0f172a"},
    "magazine_layout": {"sidebar": "#0f172a", "accent": "#ec4899", "sidebar_text": "#ffffff", "card_bg": "#fdf2f8", "text": "#0f172a"},
}

class GraphicPdfService:
    def generate_graphic_pdf(self, resume_data: Dict[str, Any], theme_key: str = "royal_blue") -> str:
        filename = f"graphic_resume_{uuid.uuid4().hex[:8]}.pdf"
        file_path = os.path.join(GENERATED_DIR, filename)

        palette = THEME_PALETTES.get(theme_key, THEME_PALETTES["royal_blue"])
        sidebar_bg = colors.HexColor(palette["sidebar"])
        accent_color = colors.HexColor(palette["accent"])
        sidebar_text_color = colors.HexColor(palette["sidebar_text"])
        main_text_color = colors.HexColor(palette["text"])
        card_bg_color = colors.HexColor(palette["card_bg"])

        doc = SimpleDocTemplate(
            file_path,
            pagesize=A4,
            leftMargin=20,
            rightMargin=20,
            topMargin=20,
            bottomMargin=20
        )

        styles = getSampleStyleSheet()

        # Typography Styles
        name_style = ParagraphStyle(
            'HeaderName',
            parent=styles['Heading1'],
            fontSize=26,
            leading=30,
            textColor=sidebar_text_color,
            fontName='Helvetica-Bold',
            spaceAfter=2
        )

        title_style = ParagraphStyle(
            'HeaderTitle',
            parent=styles['Normal'],
            fontSize=13,
            leading=16,
            textColor=accent_color,
            fontName='Helvetica-Bold',
            spaceAfter=6
        )

        sidebar_heading = ParagraphStyle(
            'SidebarHead',
            parent=styles['Heading2'],
            fontSize=11,
            leading=14,
            textColor=accent_color,
            fontName='Helvetica-Bold',
            spaceBefore=10,
            spaceAfter=4
        )

        sidebar_text = ParagraphStyle(
            'SidebarBody',
            parent=styles['Normal'],
            fontSize=8.5,
            leading=11.5,
            textColor=sidebar_text_color,
            fontName='Helvetica',
            spaceAfter=3
        )

        main_heading = ParagraphStyle(
            'MainHead',
            parent=styles['Heading2'],
            fontSize=13,
            leading=16,
            textColor=sidebar_bg,
            fontName='Helvetica-Bold',
            spaceBefore=8,
            spaceAfter=4
        )

        main_subhead = ParagraphStyle(
            'MainSubHead',
            parent=styles['Normal'],
            fontSize=10,
            leading=13,
            textColor=main_text_color,
            fontName='Helvetica-Bold',
            spaceAfter=2
        )

        main_body = ParagraphStyle(
            'MainBody',
            parent=styles['Normal'],
            fontSize=8.5,
            leading=11.5,
            textColor=main_text_color,
            fontName='Helvetica',
            spaceAfter=4
        )

        # 1. TOP HEADER BANNER (Full Width)
        header_data = [
            [
                Paragraph(f"<b>{resume_data.get('fullName', 'Alex Vance')}</b>", name_style),
            ],
            [
                Paragraph(resume_data.get('title', 'Senior AI Systems Engineer').upper(), title_style),
            ],
            [
                Paragraph(
                    f"📧 {resume_data.get('email', '')}  |  📞 {resume_data.get('phone', '')}  |  📍 {resume_data.get('location', '')}  |  🔗 {resume_data.get('linkedin', '')}",
                    sidebar_text
                )
            ]
        ]
        
        header_table = Table(header_data, colWidths=[550])
        header_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), sidebar_bg),
            ('PADDING', (0, 0), (-1, -1), 12),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('BOTTOMPADDING', (0, -1), (-1, -1), 10),
        ]))

        # 2. LEFT SIDEBAR CONTENT (30% -> ~165pt)
        sidebar_elements = []

        if resume_data.get('objective'):
            sidebar_elements.append(Paragraph("CAREER OBJECTIVE", sidebar_heading))
            sidebar_elements.append(Paragraph(resume_data.get('objective'), sidebar_text))
            sidebar_elements.append(Spacer(1, 4))

        if resume_data.get('skills'):
            sidebar_elements.append(Paragraph("SKILLS & TECH", sidebar_heading))
            # Format skills as graphical bullet chips
            skills_list = [s.strip() for s in resume_data.get('skills', '').split(',') if s.strip()]
            for s in skills_list[:12]:
                sidebar_elements.append(Paragraph(f"▪ <b>{s}</b>", sidebar_text))
            sidebar_elements.append(Spacer(1, 4))

        if resume_data.get('certifications'):
            sidebar_elements.append(Paragraph("CERTIFICATIONS", sidebar_heading))
            sidebar_elements.append(Paragraph(resume_data.get('certifications'), sidebar_text))
            sidebar_elements.append(Spacer(1, 4))

        if resume_data.get('languages'):
            sidebar_elements.append(Paragraph("LANGUAGES", sidebar_heading))
            sidebar_elements.append(Paragraph(resume_data.get('languages'), sidebar_text))

        # 3. RIGHT MAIN CONTENT AREA (70% -> ~375pt)
        main_elements = []

        if resume_data.get('summary'):
            main_elements.append(Paragraph("EXECUTIVE SUMMARY", main_heading))
            main_elements.append(HRFlowable(width="100%", thickness=1.5, color=accent_color, spaceAfter=4))
            main_elements.append(Paragraph(resume_data.get('summary'), main_body))
            main_elements.append(Spacer(1, 6))

        if resume_data.get('experience'):
            main_elements.append(Paragraph("PROFESSIONAL EXPERIENCE", main_heading))
            main_elements.append(HRFlowable(width="100%", thickness=1.5, color=accent_color, spaceAfter=4))
            for exp in resume_data.get('experience', []):
                role_line = f"<b>{exp.get('role', '')}</b> @ <font color='{palette['accent']}'><b>{exp.get('company', '')}</b></font> ({exp.get('dates', '')})"
                main_elements.append(Paragraph(role_line, main_subhead))
                for bullet in exp.get('bullets', '').split('\n'):
                    if bullet.strip():
                        main_elements.append(Paragraph(f"• {bullet.strip()}", main_body))
                main_elements.append(Spacer(1, 4))

        if resume_data.get('projects'):
            main_elements.append(Paragraph("FEATURED PROJECTS", main_heading))
            main_elements.append(HRFlowable(width="100%", thickness=1.5, color=accent_color, spaceAfter=4))
            for proj in resume_data.get('projects', []):
                proj_title = f"<b>{proj.get('name', '')}</b>"
                main_elements.append(Paragraph(proj_title, main_subhead))
                main_elements.append(Paragraph(proj.get('description', ''), main_body))
                main_elements.append(Spacer(1, 4))

        if resume_data.get('education'):
            main_elements.append(Paragraph("EDUCATION", main_heading))
            main_elements.append(HRFlowable(width="100%", thickness=1.5, color=accent_color, spaceAfter=4))
            for ed in resume_data.get('education', []):
                ed_line = f"<b>{ed.get('degree', '')}</b> - {ed.get('school', '')} ({ed.get('year', '')})"
                main_elements.append(Paragraph(ed_line, main_subhead))

        # 4. TWO-COLUMN LAYOUT TABLE
        two_col_table = Table([[sidebar_elements, main_elements]], colWidths=[165, 385])
        two_col_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, 0), sidebar_bg),
            ('BACKGROUND', (1, 0), (1, 0), card_bg_color),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('PADDING', (0, 0), (0, 0), 10),
            ('PADDING', (1, 0), (1, 0), 12),
            ('LEFTPADDING', (1, 0), (1, 0), 14),
        ]))

        story = [header_table, Spacer(1, 6), two_col_table]
        doc.build(story)
        return file_path

graphic_pdf_service = GraphicPdfService()
