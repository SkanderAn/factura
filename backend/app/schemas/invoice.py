from pydantic import BaseModel, Field, field_validator
from datetime import datetime
from typing import List, Optional
from app.models.invoice import InvoiceStatus

class InvoiceLineCreate(BaseModel):
    description: str
    quantity: float = 1.0
    unit_price_ht: float = Field(..., alias="unit_price")
    tax_rate: float = Field(19.0, alias="vat_rate")

    class Config:
        populate_by_name = True

class InvoiceLineResponse(InvoiceLineCreate):
    id: int

class InvoiceCreate(BaseModel):
    client_id: int
    issue_date: datetime
    due_date: datetime
    currency: str = "TND"
    tax_rate: float = Field(19.0, alias="vat_rate")
    notes: Optional[str] = None
    items: List[InvoiceLineCreate]

    class Config:
        populate_by_name = True

    @field_validator("issue_date", "due_date", mode="before")
    def parse_date(cls, value):
        if isinstance(value, str):
            return datetime.fromisoformat(value.replace('Z', '+00:00'))
        return value

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
    subtotal_ht: float = Field(..., alias="subtotal")
    tax_rate: float = Field(..., alias="vat_rate")
    tax_amount: float = Field(..., alias="vat_total")
    total_ttc: float = Field(..., alias="total")
    status: InvoiceStatus
    notes: Optional[str]
    items: List[InvoiceLineResponse]

    class Config:
        from_attributes = True
        populate_by_name = True