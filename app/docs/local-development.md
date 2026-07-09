# Local Development

## Frontend

```bash
cd app/frontend
npm install
npm run dev
```

Vite dev server:

```text
http://127.0.0.1:5173
```

## API

```bash
cd app/api
python -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Health check:

```text
GET http://127.0.0.1:8000/api/health
```

API tests:

```bash
cd app/api
. .venv/bin/activate
python -m pytest
```

## Vercel

Vercel project root should be `app/`.

Build command:

```text
npm --prefix frontend install && npm --prefix frontend run build
```

Output directory:

```text
frontend/dist
```

API entrypoint:

```text
api/index.py
```
