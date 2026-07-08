FROM node:22-alpine AS dependencies

WORKDIR /app

COPY package*.json ./
RUN npm ci

FROM node:22-alpine AS build

WORKDIR /app

RUN DATABASE_URL="postgresql://user:password@localhost:5432/agenda_worker" npm run build

COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM build AS production-dependencies

RUN npm prune --omit=dev

FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY --from=production-dependencies /app/package*.json ./
COPY --from=production-dependencies /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/prisma.config.ts ./prisma.config.ts

EXPOSE 3000

CMD ["node", "dist/server.js"]
