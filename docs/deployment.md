# Guide de déploiement

## GitHub Secrets à configurer

Dans **Settings → Secrets → Actions** du repo GitHub :

| Secret | Description |
|--------|-------------|
| `VERCEL_TOKEN` | Token Vercel (vercel.com → Settings → Tokens) |
| `RAILWAY_TOKEN` | Token Railway (railway.app → Settings → Tokens) |
| `EXPO_TOKEN` | Token Expo (expo.dev → Access Tokens) |

## Variables d'environnement production

### API (Railway)
Copier `.env.example` et remplir avec les vraies valeurs dans le dashboard Railway.

### Web (Vercel)
Configurer dans le dashboard Vercel → Project → Environment Variables :
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_API_URL=https://api.musicai.app
```

## Lancer un build mobile manuellement

```bash
cd apps/mobile

# Preview build (APK / IPA pour TestFlight)
eas build --platform all --profile preview

# Production build + soumission aux stores
eas build --platform all --profile production
eas submit --platform all
```

## Migrations DB en prod

```bash
cd apps/api
DATABASE_URL=<prod_url> alembic upgrade head
```

## Premier déploiement Railway

```bash
# Installer Railway CLI
npm install -g @railway/cli
railway login

# Créer les services
railway init
railway add --name api
railway add --name ai-worker
railway add --name redis

# Lier les variables d'env
railway variables set --service api < apps/api/.env
```

## Checklist avant lancement

- [ ] Compte Supabase créé + auth configurée (Google OAuth)
- [ ] Stripe : produits + prix créés, webhook configuré (`/api/v1/subscriptions/webhook`)
- [ ] RevenueCat : produits configurés iOS + Android, webhook (`/api/v1/revenuecat/webhook`)
- [ ] AWS S3 : bucket créé, CORS configuré, IAM user avec permissions S3
- [ ] Domaine configuré (DNS → Vercel pour le web, Railway pour l'API)
- [ ] Certificats SSL (automatiques via Vercel / Railway)
- [ ] Migrations DB exécutées (`alembic upgrade head`)
- [ ] App Store Connect : app créée, métadonnées remplies, privacy URL ajoutée
- [ ] Google Play Console : app créée, content rating rempli
- [ ] EAS project ID mis à jour dans `app.json`
- [ ] `eas.json` : Apple ID et App Store Connect App ID configurés
