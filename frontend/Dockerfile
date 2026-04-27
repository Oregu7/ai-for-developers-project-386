FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

ENV PORT=5173

EXPOSE ${PORT}

CMD sh -c "npm run dev -- --host 0.0.0.0 --port $PORT"
