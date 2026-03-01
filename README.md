# Webhook Repo (Flask + ReactJS)

A clean, small assignment-style project that receives GitHub webhooks, stores simplified events in MongoDB, and displays them in a ReactJS dashboard.

## Tech stack

- **Backend:** Flask (Python)
- **Frontend:** ReactJS (loaded in browser for simplicity)
- **Database:** MongoDB

## Features

- Receives GitHub webhook events at `POST /webhook`
- Supports:
  - `push` → saved as `push`
  - `pull_request` opened/reopened/synchronize/edited/ready_for_review → saved as `pull_request`
  - `pull_request` closed + merged → saved as `merge`
- Stores normalized records in MongoDB
- React UI at `/` polls `/api/events` every 15 seconds

## Quick start

### 1) Install dependencies

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### 2) Configure env

```bash
cp .env.example .env
```

Set values as needed:

```env
MONGO_URI=mongodb://localhost:27017
MONGO_DB_NAME=webhook_db
MONGO_COLLECTION_NAME=events
PORT=5000
```

### 3) Run app

```bash
python app.py
```

Open:

- UI: `http://localhost:5000/`
- API: `http://localhost:5000/api/events`
- Webhook: `POST http://localhost:5000/webhook`

## GitHub webhook setup (action-repo)

1. Use ngrok for local testing:
   ```bash
   ngrok http 5000
   ```
2. In your GitHub `action-repo` → **Settings** → **Webhooks** → **Add webhook**
3. Payload URL: `https://<your-ngrok-domain>/webhook`
4. Content type: `application/json`
5. Select events: **Pushes** and **Pull requests**

## Stored event shape

```json
{
  "id": "<mongo_id>",
  "request_id": "...",
  "author": "...",
  "action": "push | pull_request | merge",
  "from_branch": "...",
  "to_branch": "...",
  "timestamp": "..."
}
```

---

This version is for leanring purpose and for assignment. Its not final and production ready repo

