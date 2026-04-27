from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional
from app.models.quote import QuoteStatus

class QuoteLineCreate(BaseModel):
    description: str
    quantity: float = 1.0
    unit_price_ht: float
    tax_rate: float = 19.0

class QuoteLineResponse(QuoteLineCreate):
    id: int

class QuoteCreate(BaseModel):
    client_id: int
    issue_date: datetime
    valid_until: datetime
    currency: str = "TND"
    tax_rate: float = 19.0
    notes: Optional[str] = None
    items: List[QuoteLineCreate]

class QuoteUpdate(BaseModel):
    status: Optional[QuoteStatus] = None

class QuoteResponse(BaseModel):
    id: int
    quote_number: str
    user_id: int
    client_id: int
    issue_date: datetime
    valid_until: datetime
    currency: str
    subtotal_ht: float
    tax_rate: float
    tax_amount: float
    total_ttc: float
    status: QuoteStatus
    notes: Optional[str]
    items: List[QuoteLineResponse]

    class Config:
        from_attributes = True