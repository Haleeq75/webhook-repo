# Webhook Repo (Beginner Friendly Guide)

This project is a small Flask app that:

1. Receives GitHub webhook events (`push`, `pull_request`, and merged PRs).
2. Saves simplified event data into MongoDB.
3. Shows those events in a web page that auto-refreshes every 15 seconds.

---

## What you are building

You will use **two GitHub repositories**:

- `action-repo` → where you make commits, PRs, and merges.
- `webhook-repo` → this Flask app that receives those events.

When something happens in `action-repo`, GitHub sends a webhook to this app.

---

## Prerequisites

Install these first:

- Python 3.10+
- Git
- MongoDB (local install or MongoDB Atlas)
- ngrok (for exposing your local server to GitHub)

---

## Project files (quick overview)

- `app.py` → Flask backend (`/webhook`, `/api/events`, `/`)
- `templates/index.html` → UI page
- `static/app.js` → frontend polling/rendering
- `static/styles.css` → UI styles
- `.env.example` → environment variable template
- `requirements.txt` → Python dependencies

---

## Step 1: Setup Python environment

From inside `webhook-repo`:
# webhook-repo

Flask app that receives GitHub webhooks, stores normalized event documents in MongoDB, and serves a polling UI that refreshes every 15 seconds.

## 1) Repository setup

Create two repos on GitHub:

1. `action-repo` (make code changes here to trigger webhooks)
2. `webhook-repo` (this Flask app)

## 2) Local setup

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

If `pip install` fails, make sure your internet/proxy is correctly configured.

---

## Step 2: Configure environment variables

Copy env template:

```bash
cp .env.example .env
```

Open `.env` and set values:

```env
MONGO_URI=mongodb://localhost:27017
MONGO_DB_NAME=webhook_db
MONGO_COLLECTION_NAME=events
PORT=5000
```

If you use MongoDB Atlas, replace `MONGO_URI` with your Atlas connection string.

> Security note: keep `.env` private and never commit it to GitHub. This repo ignores `.env` via `.gitignore`.
> If you accidentally shared credentials (for example in chat/screenshots), rotate your MongoDB password immediately.

---

## Step 3: Start MongoDB

### Option A: Local MongoDB
Start your local MongoDB service (depends on your OS setup).

### Option B: MongoDB Atlas
Use your Atlas URI in `.env`. No local DB process needed.

---

## Step 4: Run Flask app
cp .env.example .env
```

Update `.env` as needed for your MongoDB instance.

### MongoDB schema (stored fields)

Each incoming supported webhook event is stored as:

- `id` (Mongo `_id`, returned via API)
- `request_id`
- `author`
- `action` (`push`, `pull_request`, `merge`)
- `from_branch`
- `to_branch`
- `timestamp`

## 3) Run the app

```bash
python app.py
```

You should now have:

- UI: `http://localhost:5000/`
- Webhook endpoint: `POST http://localhost:5000/webhook`
- Events API: `GET http://localhost:5000/api/events`

---

## Step 5: Expose local server with ngrok

GitHub cannot call `localhost` directly. So expose port 5000:
App URLs:

- UI: `http://localhost:5000/`
- Webhook receiver: `POST http://localhost:5000/webhook`
- Events API: `GET http://localhost:5000/api/events`

## 4) Event handling rules

- Push event (`X-GitHub-Event: push`) -> `action = push`
- Pull request event (`X-GitHub-Event: pull_request`) ->
  - if `action=closed` and `pull_request.merged=true` -> `action = merge`
  - common PR update actions (`opened`, `reopened`, `synchronize`, `edited`, `ready_for_review`) -> `action = pull_request`

## 5) Expose local server to GitHub using ngrok

```bash
ngrok http 5000
```

Copy the **HTTPS** forwarding URL, for example:

`https://abcd-1234.ngrok-free.app`

Your final webhook URL will be:

`https://abcd-1234.ngrok-free.app/webhook`

---

## Step 6: Connect `action-repo` webhook in GitHub

In your **action-repo** on GitHub:

1. Go to **Settings** → **Webhooks** → **Add webhook**
2. **Payload URL**: `https://<your-ngrok-url>/webhook`
3. **Content type**: `application/json`
4. Choose events:
   - **Pushes**
   - **Pull requests**
5. Save.

---

## Step 7: Trigger test events

In `action-repo`, do these actions:

1. Push a commit to any branch.
2. Open a pull request.
3. Merge a pull request.

Then verify all three places:

- Flask terminal logs show webhook requests.
- MongoDB has saved event documents.
- UI updates automatically (every 15 seconds).

---

## Stored MongoDB schema

Each stored event contains:

- `id`
- `request_id`
- `author`
- `action` (`push`, `pull_request`, `merge`)
- `from_branch`
- `to_branch`
- `timestamp`

---

## Event mapping rules (important)

- GitHub `push` event → action: `push`
- GitHub `pull_request` event:
  - if `action=closed` and `merged=true` → action: `merge`
  - for actions like `opened`, `reopened`, `synchronize`, etc. → action: `pull_request`

---

## UI message format requirements

The frontend renders exactly these patterns:
Copy the HTTPS forwarding URL and configure in `action-repo`:

- GitHub > `action-repo` > Settings > Webhooks > Add webhook
- Payload URL: `https://<ngrok-id>.ngrok.io/webhook`
- Content type: `application/json`
- Events: **Just the push event** and **Pull requests**

## 6) Test flow

1. Push commits/branches in `action-repo`
2. Create and merge pull requests
3. Verify:
   - Flask logs show webhook receipts
   - MongoDB has saved normalized documents
   - UI updates automatically within 15 seconds

## 7) UI output formats

The frontend renders event lines in the required formats:

- Push: `{author} pushed to {to_branch} on {timestamp}.`
- PR: `{author} submitted a pull request from {from_branch} to {to_branch} on {timestamp}.`
- Merge: `{author} merged branch {from_branch} to {to_branch} on {timestamp}.`

---

## Troubleshooting

### 1) GitHub says delivery failed
- Make sure Flask app is running.
- Make sure ngrok is running.
- Make sure webhook URL uses **https** and ends with `/webhook`.
- If ngrok restarted, update webhook URL in GitHub (URL changes on free plans).

### 2) No data in UI
- Open `http://localhost:5000/api/events` and check JSON output.
- Confirm MongoDB connection string in `.env`.
- Confirm webhook events are selected correctly in GitHub.

### 3) `ModuleNotFoundError`
- Activate venv: `source .venv/bin/activate`
- Reinstall dependencies: `pip install -r requirements.txt`

---

## Quick run checklist

- [ ] MongoDB running / Atlas URI set
- [ ] `.env` configured
- [ ] Flask app running on port 5000
- [ ] ngrok forwarding port 5000
- [ ] Webhook added in `action-repo` with `/webhook`
- [ ] Push + PR + Merge actions tested
- [ ] Events visible in UI

You’re done ✅
