# backend/init_db.py
from app.database import engine, Base
from app.models import user 
import logging

logging.basicConfig()
logging.getLogger('sqlalchemy').setLevel(logging.INFO)

print("🔨 Initialisation de la base de données...")

# Ici, create_all va créer UNIQUEMENT les tables qui n'existent pas
Base.metadata.create_all(bind=engine)

print("✅ Toutes les tables (manquantes) ont été créées avec succès.")