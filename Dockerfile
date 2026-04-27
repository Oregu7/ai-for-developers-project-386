FROM node:20-bookworm

RUN apt-get update && \
    apt-get install -y postgresql postgresql-client && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /project

COPY backend/package*.json ./backend/
RUN cd backend && npm ci

COPY frontend/package*.json ./frontend/
RUN cd frontend && npm ci

COPY e2e/package*.json ./e2e/
RUN cd e2e && npm install

COPY . .

RUN cd backend && npm run build

ARG POSTGRES_USER=booking
ARG POSTGRES_PASSWORD=booking
ARG POSTGRES_DB=booking
ARG POSTGRES_PORT=5432
ARG BACKEND_PORT=3000
ARG PORT=5001
ARG VITE_API_URL=http://localhost:3000

ENV POSTGRES_USER=${POSTGRES_USER}
ENV POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
ENV POSTGRES_DB=${POSTGRES_DB}
ENV POSTGRES_PORT=${POSTGRES_PORT}
ENV DATABASE_URL=postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@localhost:${POSTGRES_PORT}/${POSTGRES_DB}
ENV BACKEND_PORT=${BACKEND_PORT}
ENV PORT=${PORT}
ENV VITE_API_URL=${VITE_API_URL}
ENV ALLOWED_ORIGINS=http://localhost:${PORT},http://localhost:4173

EXPOSE ${BACKEND_PORT} ${PORT}

COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

ENTRYPOINT ["/docker-entrypoint.sh"]
