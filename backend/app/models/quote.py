from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Enum
from sqlalchemy.sql import func
import enum
from app.database import Base
from sqlalchemy.orm import relationship
from app.models.quote_line import QuoteLine


class QuoteStatus(str, enum.Enum):
    DRAFT = "brouillon"
    SENT = "envoyé"
    ACCEPTED = "accepté"
    REFUSED = "refusé"
    CONVERTED = "converti"

class Quote(Base):
    __tablename__ = "quotes"

    id = Column(Integer, primary_key=True, index=True)
    quote_number = Column(String, unique=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    client_id = Column(Integer, ForeignKey("clients.id"), nullable=False)
    issue_date = Column(DateTime, nullable=False)
    valid_until = Column(DateTime, nullable=False)
    currency = Column(String, default="TND")
    subtotal_ht = Column(Float, default=0.0)
    tax_rate = Column(Float, default=19.0)
    tax_amount = Column(Float, default=0.0)
    total_ttc = Column(Float, default=0.0)
    status = Column(Enum(QuoteStatus), default=QuoteStatus.DRAFT)
    notes = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    items = relationship("QuoteLine", backref="quote", cascade="all, delete-orphan")