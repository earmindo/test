# MusicAI — AI Music Generation Platform

Generate music from text prompts using **ACE-Step 1.5**, available on web and mobile.

## Structure

```
/
├── apps/
│   ├── web/          # Next.js — landing page + dashboard
│   ├── mobile/       # React Native (Expo) — iOS & Android
│   └── api/          # FastAPI — backend (auth, subscriptions, jobs)
├── services/
│   └── ai-worker/    # Python service — ACE-Step 1.5 inference
├── packages/
│   └── shared/       # Types TypeScript partagés web/mobile
└── infra/            # Docker Compose, configs déploiement
```

## Lancer en local

### Prérequis
- Node.js 20+, Yarn 4
- Python 3.11+
- Docker & Docker Compose
- GPU recommandé pour l'AI worker (sinon CPU lent)

### Démarrage

```bash
# Backend API
cd apps/api && pip install -r requirements.txt && uvicorn main:app --reload

# AI Worker
cd services/ai-worker && pip install -r requirements.txt && python worker.py

# Site web
yarn dev:web

# App mobile
yarn dev:mobile
```

### Variables d'environnement

Copier `.env.example` → `.env` dans chaque app.

## Stack

| Couche | Technologie |
|--------|------------|
| Web | Next.js 14 + React |
| Mobile | React Native (Expo) |
| Backend | FastAPI (Python) |
| AI | ACE-Step 1.5 |
| DB | PostgreSQL |
| Queue | Redis + Celery |
| Storage | S3 / Cloudflare R2 |
| Auth | Supabase Auth |
| Paiements web | Stripe |
| Paiements mobile | RevenueCat |

## Monétisation

- **Free** : 3 générations/jour
- **Pro** : Illimité, haute qualité, téléchargement
- **Studio** : Stems séparés, usage commercial, accès API
