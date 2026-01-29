
.PHONY: dev backend frontend lint test

# Inicia o backend e o frontend em desenvolvimento

dev: backend frontend

backend:
	cd backend && python3 -m venv venv && . venv/bin/activate && pip install -r requirements.txt && alembic upgrade head && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

frontend:
	cd frontend && npm install && npm run dev

preview:
	cd frontend && npm install && npm run dev

lint:
	ruff .
	black --check .

format:
	black .

test:
	pytest -q
