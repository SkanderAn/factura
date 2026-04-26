from fastapi import FastAPI
from app.database import engine, Base
from app.routers import auth 
from sqlalchemy import text
from app.models import user  


app = FastAPI(title="Factura API", version="1.0.0")


app.include_router(auth.router)

@app.get("/")
def root():
    return {"message": "Factura API is running"}

@app.get("/health")
def health():
    return {"status": "ok"}