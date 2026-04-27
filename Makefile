.PHONY: install backend-install backend-dev backend-build backend-test backend-seed backend-up backend-down dev frontend-install frontend-build frontend-lint mock e2e-install e2e-test test typespec api-gen clean

# --- Composite ---

install: backend-install frontend-install e2e-install

test: backend-test e2e-test

# --- Backend (NestJS + Postgres) ---

backend-install:
	cd backend && npm install

backend-dev:
	cd backend && npm run start:dev

backend-build:
	cd backend && npm run build

backend-test:
	cd backend && npm test

backend-seed:
	cd backend && npm run seed

backend-up:
	docker compose up -d

backend-down:
	docker compose down

# --- Frontend (Vite + React) ---

frontend-install:
	cd frontend && npm install

dev:
	cd frontend && npm run dev

frontend-build:
	cd frontend && npm run build

frontend-lint:
	cd frontend && npm run lint

mock:
	cd frontend && npm run dev:api

# --- TypeSpec / API ---

typespec:
	cd specs && npx tsp compile main.tsp

api-gen: typespec

# --- E2E (Playwright) ---

e2e-install:
	cd e2e && npm install && npx playwright install

e2e-test:
	cd e2e && npx playwright test

# --- Cleanup ---

clean:
	rm -rf backend/dist backend/node_modules frontend/dist frontend/node_modules e2e/node_modules
