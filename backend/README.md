# Jokko Santé — Backend API & Services (Railway)

Serveur API Node.js / Express / TypeScript dédié au déploiement sur **Railway**.

---

## 🌟 Fonctionnalités du Backend

1. **API HL7 FHIR R4 standard** :
   - `GET /api/fhir/Location` : Disponibilité des lits et services sous format standardisé *Bundle FHIR R4* pour interopérabilité avec le Dossier Patient Unique (DPU) et DHIS2.
2. **Administration sécurisée des utilisateurs** :
   - `POST /api/users/create` & `POST /api/users/reset-password` : Utilise la clé secrète `service_role` côté serveur de manière 100% étanche.
3. **Healthcheck & Monitoring** :
   - `GET /api/health` : Statut, métriques d'uptime et région.
4. **Analytics & Statistiques** :
   - `GET /api/stats/overview` : Agrégations d'occupation et flux de transferts.

---

## 🚀 Déploiement sur Railway

### Méthode 1 : Connexion GitHub (Recommandé)

1. Rendez-vous sur [railway.app](https://railway.app) et connectez votre compte GitHub.
2. Créez un **New Project** → **Deploy from GitHub repo** → Sélectionnez ce dépôt.
3. Dans les paramètres du service Railway :
   - **Root Directory** : `backend`
   - **Environment Variables** :
     - `PORT` : `4000`
     - `SUPABASE_URL` : `https://xxxx.supabase.co`
     - `SUPABASE_SERVICE_ROLE_KEY` : `eyJh...` (Clé secrète de votre projet Supabase)
     - `CORS_ORIGIN` : `*` (ou l'URL de votre frontend Vercel)
4. Railway détecte automatiquement le `Dockerfile` et déploie le conteneur en moins de 60 secondes.

---

## 💻 Développement Local

```bash
cd backend
npm install
cp .env.example .env   # renseigner SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY
npm run dev
```

Le serveur démarre sur [http://localhost:4000](http://localhost:4000).
