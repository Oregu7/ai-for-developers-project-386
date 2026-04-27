# Stage 1: Build frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app

COPY frontend/package.json frontend/package-lock.json* ./
RUN npm install

COPY frontend/tsconfig.json frontend/tsconfig.app.json frontend/tsconfig.node.json ./
COPY frontend/vite.config.ts frontend/index.html ./
COPY frontend/src/ src/
COPY frontend/public/ public/

RUN npm run build

# Stage 2: Build backend
FROM node:20-alpine AS backend-builder

WORKDIR /app

COPY backend/package.json backend/package-lock.json* ./
RUN npm ci

COPY backend/tsconfig.json backend/tsconfig.build.json backend/nest-cli.json ./
COPY backend/src/ src/

RUN npm run build

# Stage 3: Production
FROM node:20-alpine AS production

WORKDIR /app

ARG PORT=3000
ARG DATABASE_URL
ARG ALLOWED_ORIGINS

ENV PORT=${PORT}
ENV DATABASE_URL=${DATABASE_URL}
ENV ALLOWED_ORIGINS=${ALLOWED_ORIGINS}

# Install production dependencies only
COPY backend/package.json backend/package-lock.json* ./
RUN npm ci --omit=dev

# Copy built backend
COPY --from=backend-builder /app/dist ./dist

# Copy built frontend
COPY --from=frontend-builder /app/dist ./public

EXPOSE ${PORT}

CMD ["node", "dist/main"]
