from sqlalchemy import Column, Integer, String, Float, ForeignKey
from app.database import Base

class InvoiceLine(Base):
    __tablename__ = "invoice_lines"

    id = Column(Integer, primary_key=True, index=True)
    invoice_id = Column(Integer, ForeignKey("invoices.id", ondelete="CASCADE"), nullable=False)
    description = Column(String, nullable=False)
    quantity = Column(Float, nullable=False, default=1)
    unit_price_ht = Column(Float, nullable=False)  # prix unitaire HT
    tax_rate = Column(Float, nullable=False, default=19.0)  # TVA en %