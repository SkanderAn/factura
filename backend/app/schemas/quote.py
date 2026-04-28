from pydantic import BaseModel, Field, field_validator
from datetime import datetime
from typing import List, Optional
from app.models.quote import QuoteStatus

class QuoteLineCreate(BaseModel):
    description: str
    quantity: float = 1.0
    unit_price_ht: float = Field(..., alias="unit_price")
    tax_rate: float = Field(19.0, alias="vat_rate")

    class Config:
        populate_by_name = True

class QuoteLineResponse(QuoteLineCreate):
    id: int

class QuoteCreate(BaseModel):
    client_id: int
    issue_date: datetime
    valid_until: datetime
    currency: str = "TND"
    tax_rate: float = Field(19.0, alias="vat_rate")
    notes: Optional[str] = None
    items: List[QuoteLineCreate]

    class Config:
        populate_by_name = True

    @field_validator("issue_date", "valid_until", mode="before")
    def parse_date(cls, value):
        if isinstance(value, str):
            return datetime.fromisoformat(value.replace('Z', '+00:00'))
        return value

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
    subtotal_ht: float = Field(..., alias="subtotal")
    tax_rate: float = Field(..., alias="vat_rate")
    tax_amount: float = Field(..., alias="vat_total")
    total_ttc: float = Field(..., alias="total")
    status: QuoteStatus
    notes: Optional[str]
    items: List[QuoteLineResponse]

    class Config:
        from_attributes = True
        populate_by_name = True