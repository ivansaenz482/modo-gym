# ---------- Development ----------
FROM node:24-alpine AS development
WORKDIR /app

COPY package.json package-lock.json* turbo.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY apps/mobile/package.json apps/mobile/package.json

RUN npm install

WORKDIR /app/apps/api
EXPOSE 3000
CMD ["npm", "run", "start:dev"]

# ---------- Builder ----------
FROM node:24-alpine AS builder
WORKDIR /app
COPY . .
COPY --from=development /app/node_modules ./node_modules
RUN npm run build:api

# ---------- Production ----------
FROM node:24-alpine AS production
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/generated ./apps/api/generated
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json

WORKDIR /app/apps/api
EXPOSE 3000
CMD ["node", "dist/src/main.js"]
