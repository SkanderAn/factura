from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta
from app.database import get_db
from app.models.quote import Quote, QuoteStatus
from app.models.quote_line import QuoteLine
from app.models.client import Client
from app.models.invoice import Invoice, InvoiceStatus
from app.models.invoice_line import InvoiceLine
from app.routers.auth import get_current_user
from app.schemas.quote import QuoteCreate, QuoteUpdate, QuoteResponse
from app.routers.invoices import generate_invoice_number

router = APIRouter(prefix="/quotes", tags=["Quotes"])

def generate_quote_number(db: Session) -> str:
    year = datetime.now().year
    count = db.query(Quote).filter(Quote.quote_number.startswith(f"D-{year}-")).count()
    next_num = count + 1
    return f"D-{year}-{next_num:04d}"

def calculate_totals(items, tax_rate):
    subtotal = sum(item.quantity * item.unit_price_ht for item in items)
    tax_amount = subtotal * (tax_rate / 100)
    total = subtotal + tax_amount
    return subtotal, tax_amount, total

@router.post("/", response_model=QuoteResponse)
def create_quote(
    quote_data: QuoteCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    client = db.query(Client).filter(Client.id == quote_data.client_id, Client.user_id == current_user.id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    subtotal, tax_amount, total = calculate_totals(quote_data.items, quote_data.tax_rate)
    quote_number = generate_quote_number(db)
    
    new_quote = Quote(
        quote_number=quote_number,
        user_id=current_user.id,
        client_id=quote_data.client_id,
        issue_date=quote_data.issue_date,
        valid_until=quote_data.valid_until,
        currency=quote_data.currency,
        subtotal_ht=subtotal,
        tax_rate=quote_data.tax_rate,
        tax_amount=tax_amount,
        total_ttc=total,
        status=QuoteStatus.DRAFT,
        notes=quote_data.notes
    )
    db.add(new_quote)
    db.flush()
    
    for item in quote_data.items:
        line = QuoteLine(
            quote_id=new_quote.id,
            description=item.description,
            quantity=item.quantity,
            unit_price_ht=item.unit_price_ht,
            tax_rate=item.tax_rate
        )
        db.add(line)
    
    db.commit()
    db.refresh(new_quote)
    return new_quote

@router.get("/", response_model=List[QuoteResponse])
def list_quotes(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
    skip: int = 0,
    limit: int = 100
):
    quotes = db.query(Quote).filter(Quote.user_id == current_user.id).offset(skip).limit(limit).all()
    return quotes

@router.get("/{quote_id}", response_model=QuoteResponse)
def get_quote(
    quote_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    quote = db.query(Quote).filter(Quote.id == quote_id, Quote.user_id == current_user.id).first()
    if not quote:
        raise HTTPException(status_code=404, detail="Quote not found")
    return quote

@router.patch("/{quote_id}", response_model=QuoteResponse)
def update_quote(
    quote_id: int,
    update_data: QuoteUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    quote = db.query(Quote).filter(Quote.id == quote_id, Quote.user_id == current_user.id).first()
    if not quote:
        raise HTTPException(status_code=404, detail="Quote not found")
    
    if update_data.status is not None:
        try:
            if isinstance(update_data.status, QuoteStatus):
                quote.status = update_data.status
            else:
                quote.status = QuoteStatus(update_data.status)
        except ValueError:
            raise HTTPException(status_code=400, detail="Statut invalide. Valeurs possibles : brouillon, envoyé, accepté, refusé, converti")
    
    db.commit()
    db.refresh(quote)
    return quote

@router.patch("/{quote_id}/status", response_model=QuoteResponse)
def update_quote_status(
    quote_id: int,
    status: str = Body(..., embed=True),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    quote = db.query(Quote).filter(Quote.id == quote_id, Quote.user_id == current_user.id).first()
    if not quote:
        raise HTTPException(status_code=404, detail="Quote not found")
    try:
        quote.status = QuoteStatus(status)
    except ValueError:
        raise HTTPException(status_code=400, detail="Statut invalide. Valeurs possibles : brouillon, envoyé, accepté, refusé, converti")
    db.commit()
    db.refresh(quote)
    return quote

@router.post("/{quote_id}/convert", response_model=dict)
def convert_quote_to_invoice(
    quote_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    quote = db.query(Quote).filter(Quote.id == quote_id, Quote.user_id == current_user.id).first()
    if not quote:
        raise HTTPException(status_code=404, detail="Quote not found")
    
    # Optionnel : décommentez pour n'autoriser que les devis acceptés
    # if quote.status != QuoteStatus.ACCEPTED:
    #     raise HTTPException(status_code=400, detail="Seul un devis accepté peut être converti")
    
    invoice_number = generate_invoice_number(db)
    new_invoice = Invoice(
        invoice_number=invoice_number,
        user_id=current_user.id,
        client_id=quote.client_id,
        issue_date=datetime.now(),
        due_date=datetime.now().replace(day=28) + timedelta(days=30),
        currency=quote.currency,
        subtotal_ht=quote.subtotal_ht,
        tax_rate=quote.tax_rate,
        tax_amount=quote.tax_amount,
        total_ttc=quote.total_ttc,
        status=InvoiceStatus.DRAFT,
        notes=quote.notes
    )
    db.add(new_invoice)
    db.flush()
    
    for item in quote.items:
        line = InvoiceLine(
            invoice_id=new_invoice.id,
            description=item.description,
            quantity=item.quantity,
            unit_price_ht=item.unit_price_ht,
            tax_rate=item.tax_rate
        )
        db.add(line)
    
    quote.status = QuoteStatus.CONVERTED
    db.commit()
    db.refresh(new_invoice)
    return {"message": "Devis converti", "invoice_id": new_invoice.id, "invoice_number": new_invoice.invoice_number}