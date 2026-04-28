# Factura – Plateforme de facturation et devis pour le marché MENA

Factura est une application SaaS permettant aux freelances, consultants et PME du Maghreb et du Moyen‑Orient de créer, gérer et suivre leurs factures et devis de façon simple et professionnelle.

## 🚀 Fonctionnalités

- Authentification sécurisée (JWT)
- Gestion complète des clients (CRUD)
- Création de factures et devis avec lignes dynamiques
- Calcul automatique des totaux (HT, TVA, TTC)
- Génération de PDF pour les factures
- Conversion devis → facture en un clic
- Tableau de bord avec indicateurs clés (CA, impayés, évolution graphique)
- Interface responsive bilingue (français / arabe prêt)

## 🛠️ Stack technique

| Composant   | Technologie                                      |
|-------------|--------------------------------------------------|
| Backend     | FastAPI, Python 3.11+, PostgreSQL, SQLAlchemy   |
| Frontend    | Next.js 14, TypeScript, Tailwind CSS, shadcn/ui |
| Authentification | JWT, bcrypt                                  |
| PDF         | ReportLab                                        |
| Graphiques  | Recharts                                         |
| Déploiement | Prêt pour Railway (backend) + Vercel (frontend) |

## 📦 Installation et exécution locale

### Prérequis
- Python 3.11 ou supérieur
- Node.js 20+ (ou 22)
- PostgreSQL 16 (ou SQLite pour le développement)

### 1. Cloner le dépôt
```bash
git clone https://github.com/votre-utilisateur/factura.git
cd factura
