from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional
from app.models.invoice import InvoiceStatus

class InvoiceLineCreate(BaseModel):
    description: str
    quantity: float = 1.0
    unit_price_ht: float
    tax_rate: float = 19.0

class InvoiceLineResponse(InvoiceLineCreate):
    id: int

class InvoiceCreate(BaseModel):
    client_id: int
    issue_date: datetime
    due_date: datetime
    currency: str = "TND"
    tax_rate: float = 19.0
    notes: Optional[str] = None
    items: List[InvoiceLineCreate]  # les lignes de facture

class InvoiceUpdate(BaseModel):
    status: Optional[InvoiceStatus] = None
    notes: Optional[str] = None

class InvoiceResponse(BaseModel):
    id: int
    invoice_number: str
    user_id: int
    client_id: int
    issue_date: datetime
    due_date: datetime
    currency: str
    subtotal_ht: float
    tax_rate: float
    tax_amount: float
    total_ttc: float
    status: InvoiceStatus
    notes: Optional[str]
    items: List[InvoiceLineResponse]

    class Config:
        from_attributes = True