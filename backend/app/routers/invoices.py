from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.database import get_db
from app.models.invoice import Invoice, InvoiceStatus
from app.models.invoice_line import InvoiceLine
from app.models.client import Client
from app.routers.auth import get_current_user
from app.schemas.invoice import InvoiceCreate, InvoiceUpdate, InvoiceResponse
from fastapi.responses import Response
from app.services.pdf_generator import generate_invoice_pdf

router = APIRouter(prefix="/invoices", tags=["Invoices"])

def generate_invoice_number(db: Session) -> str:
    """Génère un numéro de facture unique du type F-2026-0001"""
    year = datetime.now().year
    # Compter les factures de l'année en cours
    count = db.query(Invoice).filter(Invoice.invoice_number.startswith(f"F-{year}-")).count()
    next_num = count + 1
    return f"F-{year}-{next_num:04d}"

def calculate_totals(items, tax_rate):
    subtotal = sum(item.quantity * item.unit_price_ht for item in items)
    tax_amount = subtotal * (tax_rate / 100)
    total = subtotal + tax_amount
    return subtotal, tax_amount, total

@router.post("/", response_model=InvoiceResponse)
def create_invoice(
    invoice_data: InvoiceCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    # Vérifier que le client appartient bien à l'utilisateur
    client = db.query(Client).filter(Client.id == invoice_data.client_id, Client.user_id == current_user.id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    # Calculer les totaux
    subtotal, tax_amount, total = calculate_totals(invoice_data.items, invoice_data.tax_rate)
    
    # Créer la facture
    invoice_number = generate_invoice_number(db)
    new_invoice = Invoice(
        invoice_number=invoice_number,
        user_id=current_user.id,
        client_id=invoice_data.client_id,
        issue_date=invoice_data.issue_date,
        due_date=invoice_data.due_date,
        currency=invoice_data.currency,
        subtotal_ht=subtotal,
        tax_rate=invoice_data.tax_rate,
        tax_amount=tax_amount,
        total_ttc=total,
        status=InvoiceStatus.DRAFT,
        notes=invoice_data.notes
    )
    db.add(new_invoice)
    db.flush()  # pour obtenir l'id de la facture avant d'ajouter les lignes
    
    # Ajouter les lignes de facture
    for item in invoice_data.items:
        line = InvoiceLine(
            invoice_id=new_invoice.id,
            description=item.description,
            quantity=item.quantity,
            unit_price_ht=item.unit_price_ht,
            tax_rate=item.tax_rate
        )
        db.add(line)
    
    db.commit()
    db.refresh(new_invoice)
    
    # Recharger les items pour la réponse
    return new_invoice

@router.get("/", response_model=List[InvoiceResponse])
def list_invoices(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
    skip: int = 0,
    limit: int = 100
):
    invoices = db.query(Invoice).filter(Invoice.user_id == current_user.id).offset(skip).limit(limit).all()
    return invoices

@router.get("/{invoice_id}", response_model=InvoiceResponse)
def get_invoice(
    invoice_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id, Invoice.user_id == current_user.id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return invoice

@router.patch("/{invoice_id}", response_model=InvoiceResponse)
def update_invoice(
    invoice_id: int,
    update_data: InvoiceUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id, Invoice.user_id == current_user.id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    if update_data.status is not None:
        invoice.status = update_data.status
    if update_data.notes is not None:
        invoice.notes = update_data.notes
    
    db.commit()
    db.refresh(invoice)
    return invoice

@router.delete("/{invoice_id}")
def delete_invoice(
    invoice_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id, Invoice.user_id == current_user.id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    db.delete(invoice)
    db.commit()
    return {"detail": "Invoice deleted"}

@router.get("/{invoice_id}/pdf")
def generate_pdf(
    invoice_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    # Récupérer la facture avec ses lignes
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id, Invoice.user_id == current_user.id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    # Récupérer le client
    client = db.query(Client).filter(Client.id == invoice.client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    # Infos société (à rendre dynamique plus tard via un modèle Company)
    company_info = {
        "name": "Factura Demo",
        "address": "Tunis, Tunisie",
        "tax_id": "1234567X/A/M/000"
    }
    
    pdf_bytes = generate_invoice_pdf(invoice, client, company_info)
    
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=facture_{invoice.invoice_number}.pdf"}
    )
