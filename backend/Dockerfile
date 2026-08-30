# ==========================================
# 1. Étape de Build (TypeScript Compilation)
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copie des fichiers de configuration
COPY package*.json tsconfig.json ./

# Installation des dépendances complètes
RUN npm ci

# Copie du code source
COPY src/ ./src/

# Compilation TypeScript vers ./dist
RUN npm run build

# ==========================================
# 2. Étape de Production (Image Légère)
# ==========================================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000

# Création d'un utilisateur non-root pour la sécurité
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 expressuser

# Copie des dépendances de production uniquement
COPY package*.json ./
RUN npm ci --only=production

# Copie des fichiers compilés depuis le builder
COPY --from=builder /app/dist ./dist

# Changement des droits
USER expressuser

EXPOSE 4000

# Commande de démarrage
CMD ["node", "dist/server.js"]
