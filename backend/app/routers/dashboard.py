from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta  
from app.database import get_db
from app.routers.auth import get_current_user
from app.models.invoice import Invoice, InvoiceStatus
from app.models.client import Client

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/stats")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    now = datetime.now()
    first_day_of_month = datetime(now.year, now.month, 1)
    if now.month == 12:
        next_month = datetime(now.year + 1, 1, 1)
    else:
        next_month = datetime(now.year, now.month + 1, 1)

    monthly_revenue = db.query(func.sum(Invoice.total_ttc)).filter(
        Invoice.user_id == current_user.id,
        Invoice.status == InvoiceStatus.PAID,
        Invoice.issue_date >= first_day_of_month,
        Invoice.issue_date < next_month
    ).scalar() or 0.0

    
    unpaid_invoices = db.query(Invoice).filter(
        Invoice.user_id == current_user.id,
        Invoice.status.in_([InvoiceStatus.SENT, InvoiceStatus.OVERDUE]),
        Invoice.due_date < datetime.now()
    ).all()
    unpaid_count = len(unpaid_invoices)
    unpaid_total = sum(inv.total_ttc for inv in unpaid_invoices)

    
    clients_count = db.query(Client).filter(Client.user_id == current_user.id).count()

    
    evolution = []
    # On commence par le mois le plus ancien (il y a 5 mois) jusqu'au mois actuel
    for i in range(5, -1, -1):
        # Mois cible = now moins i mois
        month_date = now - relativedelta(months=i)
        month_start = datetime(month_date.year, month_date.month, 1)
        # Premier jour du mois suivant
        if month_date.month == 12:
            month_end = datetime(month_date.year + 1, 1, 1)
        else:
            month_end = datetime(month_date.year, month_date.month + 1, 1)

        total = db.query(func.sum(Invoice.total_ttc)).filter(
            Invoice.user_id == current_user.id,
            Invoice.status == InvoiceStatus.PAID,
            Invoice.issue_date >= month_start,
            Invoice.issue_date < month_end
        ).scalar() or 0.0
        evolution.append({
            "month": month_start.strftime("%b %Y"),
            "total": float(total)
        })

    return {
        "monthly_revenue": float(monthly_revenue),
        "unpaid_count": unpaid_count,
        "unpaid_total": float(unpaid_total),
        "clients_count": clients_count,
        "evolution": evolution
    }