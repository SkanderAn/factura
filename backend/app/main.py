from fastapi import FastAPI
from app.database import engine, Base
from app.routers import auth 
from sqlalchemy import text
from app.models import user  
from app.routers import auth, clients, invoices, dashboard
from fastapi.middleware.cors import CORSMiddleware



app = FastAPI(title="Factura API", version="1.0.0")

origins = [
    "http://localhost:3000",     
    "http://127.0.0.1:3000",
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(clients.router)
app.include_router(invoices.router)
app.include_router(dashboard.router)

@app.get("/")
def root():
    return {"message": "Factura API is running"}

@app.get("/health")
def health():
    return {"status": "ok"}