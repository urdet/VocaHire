"""
PDF export of a job session: lists each candidate with their analysis results.

Uses ReportLab (cross-platform, easy install on Windows). Add to requirements:
    pip install reportlab
"""

from io import BytesIO

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
)

from app.db.database import get_db
from app.db.models import (
    JobSession,
    CandidateListItem,
    Candidate,
    Interview,
    AnalysisResult,
)


router = APIRouter(prefix="/exports", tags=["exports"])


# -------------------------------------------------------------------
# PDF helpers
# -------------------------------------------------------------------

def _styles():
    base = getSampleStyleSheet()
    return {
        "h1": ParagraphStyle(
            "h1",
            parent=base["Heading1"],
            fontSize=22,
            textColor=colors.HexColor("#1F497D"),
            spaceAfter=4,
        ),
        "h2": ParagraphStyle(
            "h2",
            parent=base["Heading2"],
            fontSize=15,
            textColor=colors.HexColor("#1F497D"),
            spaceBefore=14,
            spaceAfter=6,
        ),
        "h3": ParagraphStyle(
            "h3",
            parent=base["Heading3"],
            fontSize=12,
            textColor=colors.HexColor("#37352F"),
            spaceBefore=8,
            spaceAfter=4,
        ),
        "muted": ParagraphStyle(
            "muted",
            parent=base["Normal"],
            fontSize=9,
            textColor=colors.HexColor("#73726E"),
        ),
        "body": ParagraphStyle(
            "body",
            parent=base["Normal"],
            fontSize=10,
            leading=14,
        ),
    }


def _format_score(value) -> str:
    if value is None:
        return "—"
    return f"{float(value):.1f} / 100"


def _build_pdf(job_session: JobSession, candidates: list, owner) -> BytesIO:
    buf = BytesIO()
    doc = SimpleDocTemplate(
        buf,
        pagesize=A4,
        leftMargin=2 * cm,
        rightMargin=2 * cm,
        topMargin=2 * cm,
        bottomMargin=2 * cm,
        title=f"VocaHire - {job_session.title or 'Session'}",
        author=f"{owner.first_name} {owner.last_name}" if owner else "VocaHire",
    )

    s = _styles()
    story = []

    # -------- Header --------
    story.append(Paragraph("VocaHire — Rapport d'analyse de session", s["h1"]))
    story.append(Paragraph(
        f"Généré pour {owner.first_name} {owner.last_name} ({owner.email})"
        if owner else "VocaHire",
        s["muted"]
    ))
    story.append(Spacer(1, 0.4 * cm))

    # -------- Session info --------
    story.append(Paragraph("Informations de la session", s["h2"]))

    info_data = [
        ["Titre",          job_session.title     or "—"],
        ["Poste",          job_session.job_title or "—"],
        ["Qualités",       job_session.qualities or "—"],
        ["Type",           job_session.session_type or "—"],
        ["Date prévue",    str(job_session.scheduled_date) if job_session.scheduled_date else "—"],
        ["Créée le",       str(job_session.created_at)],
        ["Nb candidats",   str(len(candidates))],
    ]
    info_table = Table(info_data, colWidths=[4 * cm, 12 * cm])
    info_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#F5F5F4")),
        ("TEXTCOLOR",  (0, 0), (0, -1), colors.HexColor("#37352F")),
        ("FONTNAME",   (0, 0), (0, -1), "Helvetica-Bold"),
        ("FONTSIZE",   (0, 0), (-1, -1), 9),
        ("VALIGN",     (0, 0), (-1, -1), "TOP"),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING",    (0, 0), (-1, -1), 6),
        ("GRID",       (0, 0), (-1, -1), 0.25, colors.HexColor("#E9E9E7")),
    ]))
    story.append(info_table)
    story.append(Spacer(1, 0.6 * cm))

    # -------- Candidates summary table --------
    story.append(Paragraph("Récapitulatif des candidats", s["h2"]))

    summary_rows = [["#", "Candidat", "Statut", "Score final"]]
    for idx, c in enumerate(candidates, start=1):
        candidate = c["candidate"]
        name = (
            f"{candidate.first_name} {candidate.last_name}"
            if candidate else "—"
        )
        interview = c["interview"]
        status = interview.status if interview else "no interview"
        score = c["analysis"].final_score if c["analysis"] else None
        summary_rows.append([str(idx), name, status, _format_score(score)])

    summary_table = Table(summary_rows, colWidths=[1.2 * cm, 7 * cm, 4 * cm, 4 * cm])
    summary_table.setStyle(TableStyle([
        ("BACKGROUND",   (0, 0), (-1, 0), colors.HexColor("#1F497D")),
        ("TEXTCOLOR",    (0, 0), (-1, 0), colors.white),
        ("FONTNAME",     (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE",     (0, 0), (-1, -1), 9),
        ("ALIGN",        (0, 0), (-1, -1), "LEFT"),
        ("ALIGN",        (3, 0), (3, -1), "RIGHT"),
        ("VALIGN",       (0, 0), (-1, -1), "MIDDLE"),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING",    (0, 0), (-1, -1), 6),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1),
            [colors.white, colors.HexColor("#F5F5F4")]),
        ("GRID",         (0, 0), (-1, -1), 0.25, colors.HexColor("#E9E9E7")),
    ]))
    story.append(summary_table)

    # -------- Detail page per candidate --------
    for idx, c in enumerate(candidates, start=1):
        candidate = c["candidate"]
        interview = c["interview"]
        analysis  = c["analysis"]

        story.append(PageBreak())
        name = (
            f"{candidate.first_name} {candidate.last_name}"
            if candidate else "Candidat inconnu"
        )
        story.append(Paragraph(f"Candidat #{idx} — {name}", s["h2"]))

        meta_lines = []
        if candidate:
            if candidate.email:  meta_lines.append(f"Email : {candidate.email}")
            if candidate.phone:  meta_lines.append(f"Téléphone : {candidate.phone}")
            if candidate.city:   meta_lines.append(f"Ville : {candidate.city}")
            if candidate.cin:    meta_lines.append(f"CIN : {candidate.cin}")
        if interview:
            meta_lines.append(f"Statut de l'entretien : {interview.status}")
        if meta_lines:
            story.append(Paragraph(" • ".join(meta_lines), s["muted"]))
            story.append(Spacer(1, 0.3 * cm))

        if analysis is None:
            story.append(Paragraph(
                "Aucune analyse disponible pour ce candidat.", s["body"]
            ))
            continue

        # Scores
        story.append(Paragraph("Scores détaillés", s["h3"]))
        score_rows = [
            ["Critère",                 "Score"],
            ["Pertinence du contenu",   _format_score(analysis.content_relevance)],
            ["Confiance vocale",        _format_score(analysis.vocal_confidence)],
            ["Clarté du discours",      _format_score(analysis.clarity_of_speech)],
            ["Fluidité",                _format_score(analysis.fluency)],
            ["Score final pondéré",     _format_score(analysis.final_score)],
        ]
        score_table = Table(score_rows, colWidths=[10 * cm, 6 * cm])
        score_table.setStyle(TableStyle([
            ("BACKGROUND",   (0, 0), (-1, 0), colors.HexColor("#1F497D")),
            ("TEXTCOLOR",    (0, 0), (-1, 0), colors.white),
            ("FONTNAME",     (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTNAME",     (0, -1), (-1, -1), "Helvetica-Bold"),
            ("BACKGROUND",   (0, -1), (-1, -1), colors.HexColor("#E8F0FE")),
            ("FONTSIZE",     (0, 0), (-1, -1), 10),
            ("ALIGN",        (1, 0), (1, -1), "RIGHT"),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ("TOPPADDING",    (0, 0), (-1, -1), 6),
            ("GRID",         (0, 0), (-1, -1), 0.25, colors.HexColor("#E9E9E7")),
        ]))
        story.append(score_table)

        # Feedback
        if analysis.feedback:
            story.append(Spacer(1, 0.3 * cm))
            story.append(Paragraph("Retour qualitatif", s["h3"]))
            story.append(Paragraph(analysis.feedback, s["body"]))

    doc.build(story)
    buf.seek(0)
    return buf


# -------------------------------------------------------------------
# Route
# -------------------------------------------------------------------

@router.get("/job-session/{job_session_id}/pdf")
def export_job_session_pdf(job_session_id: int, db: Session = Depends(get_db)):
    """Generate a PDF report for the given job session, including each
    candidate's analysis (if available)."""

    job_session = db.query(JobSession).filter(
        JobSession.id == job_session_id
    ).first()
    if not job_session:
        raise HTTPException(status_code=404, detail="Job session not found")

    items = db.query(CandidateListItem).filter(
        CandidateListItem.job_session_id == job_session_id
    ).all()

    # Build a list of (candidate, interview, analysis) bundles
    candidates = []
    for item in items:
        candidate = (
            db.query(Candidate).filter(Candidate.id == item.candidate_id).first()
            if item.candidate_id else None
        )
        interview = db.query(Interview).filter(
            Interview.candidate_item_id == item.id
        ).first()
        analysis = (
            db.query(AnalysisResult).filter(
                AnalysisResult.interview_id == interview.id
            ).first()
            if interview else None
        )
        candidates.append({
            "item":      item,
            "candidate": candidate,
            "interview": interview,
            "analysis":  analysis,
        })

    # Owner (for the PDF header)
    owner = job_session.owner

    pdf_buf = _build_pdf(job_session, candidates, owner)

    safe_title = (job_session.title or f"session_{job_session.id}").replace(" ", "_")
    filename = f"VocaHire_{safe_title}.pdf"

    return StreamingResponse(
        pdf_buf,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )