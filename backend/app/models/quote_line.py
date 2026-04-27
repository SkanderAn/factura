from sqlalchemy import Column, Integer, String, Float, ForeignKey
from app.database import Base

class QuoteLine(Base):
    __tablename__ = "quote_lines"

    id = Column(Integer, primary_key=True, index=True)
    quote_id = Column(Integer, ForeignKey("quotes.id", ondelete="CASCADE"), nullable=False)
    description = Column(String, nullable=False)
    quantity = Column(Float, nullable=False, default=1)
    unit_price_ht = Column(Float, nullable=False)
    tax_rate = Column(Float, nullable=False, default=19.0)