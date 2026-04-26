from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.enums import TA_RIGHT, TA_CENTER
from io import BytesIO

def format_currency(amount: float) -> str:
    """
    Formate un nombre en devise MENA :
    - séparateur des milliers : espace
    - séparateur décimal : virgule
    - toujours 2 chiffres après la virgule
    Exemple : 2142.00 -> "2 142,00"
    """
    # Séparateur des milliers avec espace, puis remplacer le point décimal par virgule
    return f"{amount:,.2f}".replace(",", " ").replace(".", ",")

def generate_invoice_pdf(invoice, client, company_info):
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=20, leftMargin=20, topMargin=30, bottomMargin=30)
    styles = getSampleStyleSheet()
    style_normal = styles['Normal']
    style_center = ParagraphStyle(name='Center', parent=styles['Normal'], alignment=TA_CENTER)
    style_right = ParagraphStyle(name='Right', parent=styles['Normal'], alignment=TA_RIGHT)
    style_bold = ParagraphStyle(name='Bold', parent=styles['Normal'], fontName='Helvetica-Bold')

    story = []

    # En-tête société + titre à droite
    header_data = [
        [Paragraph(f"<b>{company_info['name']}</b>", style_normal),
         Paragraph(f"<b>Facture N° {invoice.invoice_number}</b>", style_bold)],
        [Paragraph(company_info['address'], style_normal), ""],
        [Paragraph(f"Matricule fiscal : {company_info['tax_id']}", style_normal), ""],
    ]
    header_table = Table(header_data, colWidths=[doc.width/2, doc.width/2])
    header_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('ALIGN', (1,0), (1,0), 'RIGHT'),
    ]))
    story.append(header_table)
    story.append(Spacer(1, 10))

    # Dates
    story.append(Paragraph(f"Date d'émission : {invoice.issue_date.strftime('%d/%m/%Y')}", style_normal))
    story.append(Paragraph(f"Date d'échéance : {invoice.due_date.strftime('%d/%m/%Y')}", style_normal))
    story.append(Spacer(1, 15))

    # Client
    story.append(Paragraph("<b>Client :</b>", style_bold))
    story.append(Paragraph(client.name, style_normal))
    if client.address:
        story.append(Paragraph(client.address, style_normal))
    if client.tax_id:
        story.append(Paragraph(f"Matricule fiscal : {client.tax_id}", style_normal))
    story.append(Spacer(1, 15))

    # Tableau des lignes
    data = []
    data.append(["Description", "Qté", "Prix HT", "TVA", "Total HT"])

    for item in invoice.items:
        data.append([
            item.description,
            str(item.quantity),
            format_currency(item.unit_price_ht),
            f"{item.tax_rate}%",
            format_currency(item.quantity * item.unit_price_ht)
        ])

    # Totaux avec le bon format
    data.append(["", "", "", "Sous-total HT", format_currency(invoice.subtotal_ht)])
    data.append(["", "", "", f"TVA ({invoice.tax_rate}%)", format_currency(invoice.tax_amount)])
    data.append(["", "", "", "Total TTC", f"{format_currency(invoice.total_ttc)} {invoice.currency}"])

    col_widths = [80*mm, 25*mm, 30*mm, 30*mm, 40*mm]

    table = Table(data, colWidths=col_widths, repeatRows=1)
    table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.grey),
        ('TEXTCOLOR', (0,0), (-1,0), colors.whitesmoke),
        ('ALIGN', (0,0), (-1,0), 'CENTER'),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,0), 10),
        ('BOTTOMPADDING', (0,0), (-1,0), 6),
        ('ALIGN', (0,1), (0,-1), 'LEFT'),
        ('ALIGN', (1,1), (-1,-1), 'CENTER'),
        ('GRID', (0,0), (-1,-4), 0.5, colors.black),
        ('LINEABOVE', (0,-3), (-1,-3), 1, colors.black),
        ('BACKGROUND', (3,-1), (4,-1), colors.lightgrey),
        ('FONTNAME', (3,-1), (4,-1), 'Helvetica-Bold'),
        ('BOX', (0,-1), (-1,-1), 1, colors.black),
    ]))
    story.append(table)
    story.append(Spacer(1, 15))

    # Notes
    if invoice.notes:
        story.append(Paragraph(f"<b>Notes :</b> {invoice.notes}", style_normal))
        story.append(Spacer(1, 15))

    # Pied
    story.append(Paragraph("Merci de votre confiance. Paiement à réception sous 30 jours.", style_normal))

    doc.build(story)
    buffer.seek(0)
    return buffer.getvalue()