# Webhook Repository

## 1. Project Overview

This project is a Flask-based web application that:

* Receives GitHub webhook events (`push`, `pull_request`, and merged pull requests).
* Normalizes and stores event data in MongoDB.
* Displays events in a web interface that refreshes automatically every 15 seconds.

The system demonstrates end-to-end webhook integration, backend processing, database storage, and frontend polling.

---

## 2. Architecture Overview

You will use two GitHub repositories:

1. **`action-repo`** – Used to perform commits, create pull requests, and merge changes. These actions trigger webhook events.
2. **`webhook-repo`** – Contains the Flask application that receives and processes webhook events.

When an event occurs in `action-repo`, GitHub sends a webhook payload to the Flask application hosted in `webhook-repo`.

---

## 3. Prerequisites

Ensure the following are installed before proceeding:

* Python 3.10 or later
* Git
* MongoDB (local installation or MongoDB Atlas)
* ngrok (to expose the local server to GitHub)

---

## 4. Project Structure

The repository contains the following key files:

* `app.py` – Flask backend (`/webhook`, `/api/events`, `/`)
* `templates/index.html` – Frontend UI template
* `static/app.js` – Frontend polling and rendering logic
* `static/styles.css` – UI styling
* `.env.example` – Environment variable template
* `requirements.txt` – Python dependencies

---

## 5. Repository Setup

Create the following repositories on GitHub:

1. `action-repo` – Used to trigger webhook events.
2. `webhook-repo` – Contains the Flask application.

Clone `webhook-repo` to your local system and navigate into it.

---

## 6. Local Environment Setup

Inside the `webhook-repo` directory:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

If installation fails, verify your internet connection or proxy configuration.

---

## 7. Environment Configuration

Copy the environment template:

```bash
cp .env.example .env
```

Update the `.env` file with appropriate values:

```env
MONGO_URI=mongodb://localhost:27017
MONGO_DB_NAME=webhook_db
MONGO_COLLECTION_NAME=events
PORT=5000
```

If using MongoDB Atlas, replace `MONGO_URI` with your Atlas connection string.

### Security Guidelines

* Do not commit the `.env` file to version control.
* If credentials are accidentally exposed, immediately rotate the affected credentials.

---

## 8. MongoDB Setup

### Option A: Local MongoDB

Start your local MongoDB service according to your operating system configuration.

### Option B: MongoDB Atlas

Use your Atlas connection string in the `.env` file. No local database instance is required.

### Stored Event Schema

Each supported webhook event is stored with the following fields:

* `id` (MongoDB `_id`)
* `request_id`
* `author`
* `action` (`push`, `pull_request`, `merge`)
* `from_branch`
* `to_branch`
* `timestamp`

---

## 9. Running the Flask Application

Start the application:

```bash
flask run
```

Available endpoints:

* UI: `http://localhost:5000/`
* Webhook endpoint: `POST http://localhost:5000/webhook`
* Events API: `GET http://localhost:5000/api/events`

---

## 10. Event Handling Logic

The application maps GitHub events as follows:

* `push` event → `action = push`
* `pull_request` event:

  * If `action=closed` and `pull_request.merged=true` → `action = merge`
  * For actions such as `opened`, `reopened`, `synchronize`, `edited`, `ready_for_review` → `action = pull_request`

---

## 11. Exposing the Local Server Using ngrok

Since GitHub cannot access `localhost`, expose port 5000 using ngrok:

```bash
ngrok http 5000
```

Copy the HTTPS forwarding URL (for example):

```
https://abcd-1234.ngrok-free.app
```

Your webhook URL will be:

```
https://abcd-1234.ngrok-free.app/webhook
```

---

## 12. Configuring the Webhook in `action-repo`

In your `action-repo` on GitHub:

1. Navigate to **Settings → Webhooks → Add webhook**
2. Set **Payload URL** to:

   ```
   https://<your-ngrok-url>/webhook
   ```
3. Set **Content type** to:

   ```
   application/json
   ```
4. Select events:

   * Pushes
   * Pull requests
5. Save the configuration.

---

## 13. Testing the Integration

Perform the following actions in `action-repo`:

1. Push a commit to any branch.
2. Open a pull request.
3. Merge a pull request.

Verify:

* The Flask terminal logs show incoming webhook requests.
* MongoDB contains stored event documents.
* The UI updates automatically within 15 seconds.

---

## 14. UI Output Format

The frontend renders events in the following formats:

* Push:
  `{author} pushed to {to_branch} on {timestamp}.`

* Pull Request:
  `{author} submitted a pull request from {from_branch} to {to_branch} on {timestamp}.`

* Merge:
  `{author} merged branch {from_branch} to {to_branch} on {timestamp}.`

---

## 15. Troubleshooting

### Delivery Failures in GitHub

* Ensure the Flask application is running.
* Ensure ngrok is running.
* Confirm the webhook URL uses HTTPS and ends with `/webhook`.
* If ngrok restarts (free plan), update the webhook URL in GitHub.

### No Data Displayed in UI

* Check `http://localhost:5000/api/events` for JSON output.
* Verify MongoDB connection settings in `.env`.
* Confirm that the correct webhook events are selected in GitHub.

### ModuleNotFoundError

* Activate the virtual environment:

  ```bash
  source .venv/bin/activate
  ```
* Reinstall dependencies:

  ```bash
  pip install -r requirements.txt
  ```

---

## 16. Deployment Checklist

* MongoDB running or Atlas URI configured
* `.env` properly configured
* Flask application running on port 5000
* ngrok forwarding port 5000
* Webhook configured in `action-repo`
* Push, pull request, and merge events tested
* Events visible in UI

The webhook integration system is now fully operational.
