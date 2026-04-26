from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Enum
from sqlalchemy.sql import func
import enum
from app.database import Base

class InvoiceStatus(str, enum.Enum):
    DRAFT = "brouillon"
    SENT = "envoyée"
    PAID = "payée"
    OVERDUE = "impayée"

class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(Integer, primary_key=True, index=True)
    invoice_number = Column(String, unique=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    client_id = Column(Integer, ForeignKey("clients.id"), nullable=False)
    issue_date = Column(DateTime, nullable=False)
    due_date = Column(DateTime, nullable=False)
    currency = Column(String, default="TND")  # TND, MAD, EUR, etc.
    subtotal_ht = Column(Float, default=0.0)
    tax_rate = Column(Float, default=19.0)  # TVA en %
    tax_amount = Column(Float, default=0.0)
    total_ttc = Column(Float, default=0.0)
    status = Column(Enum(InvoiceStatus), default=InvoiceStatus.DRAFT)
    notes = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())