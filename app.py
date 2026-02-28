from __future__ import annotations

import os
from datetime import UTC, datetime
from typing import Any
from uuid import uuid4
from datetime import datetime, timezone
from typing import Any

from dotenv import load_dotenv
from flask import Flask, jsonify, render_template, request
from pymongo import DESCENDING, MongoClient

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME", "webhook_db")
MONGO_COLLECTION_NAME = os.getenv("MONGO_COLLECTION_NAME", "events")
PORT = int(os.getenv("PORT", "5000"))

client = MongoClient(MONGO_URI)
db = client[MONGO_DB_NAME]
events_collection = db[MONGO_COLLECTION_NAME]

app = Flask(__name__)


def _iso_utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _build_push_event(payload: dict[str, Any]) -> dict[str, Any]:
    return {
        "request_id": payload.get("after"),
        "author": payload.get("pusher", {}).get("name", "unknown"),
        "action": "push",
        "from_branch": payload.get("before"),
        "to_branch": (payload.get("ref") or "").replace("refs/heads/", ""),
        "timestamp": payload.get("head_commit", {}).get("timestamp") or _iso_utc_now(),
    }


def _build_pr_event(payload: dict[str, Any], action: str) -> dict[str, Any]:
    pr = payload.get("pull_request", {})
    return {
        "request_id": str(pr.get("id") or payload.get("number") or ""),
        "author": pr.get("user", {}).get("login", "unknown"),
        "action": action,
        "from_branch": pr.get("head", {}).get("ref"),
        "to_branch": pr.get("base", {}).get("ref"),
        "timestamp": pr.get("updated_at") or _iso_utc_now(),
    }


def _extract_event(payload: dict[str, Any], github_event: str) -> dict[str, Any] | None:
    if github_event == "push":
        return _build_push_event(payload)

    if github_event == "pull_request":
        pr_action = payload.get("action")
        pr = payload.get("pull_request", {})

        if pr_action == "closed" and pr.get("merged"):
            return _build_pr_event(payload, "merge")

        if pr_action in {"opened", "reopened", "synchronize", "edited", "ready_for_review"}:
            return _build_pr_event(payload, "pull_request")

    return None


@app.get("/")
def index() -> str:
    return render_template("index.html")


@app.post("/webhook")
def webhook() -> tuple[dict[str, Any], int]:
    payload = request.get_json(silent=True) or {}
    github_event = request.headers.get("X-GitHub-Event", "")

    event_doc = _extract_event(payload, github_event)
    if event_doc is None:
        return {"status": "ignored", "reason": "unsupported event"}, 200

    result = events_collection.insert_one(event_doc)
    event_doc["id"] = str(result.inserted_id)

    return {"status": "ok"}, 200


@app.get("/api/events")
def get_events() -> Any:
    docs = list(events_collection.find().sort("_id", DESCENDING).limit(50))
    formatted: list[dict[str, Any]] = []

    for doc in docs:
        formatted.append(
            {
                "id": str(doc.get("_id")),
                "request_id": doc.get("request_id"),
                "author": doc.get("author"),
                "action": doc.get("action"),
                "from_branch": doc.get("from_branch"),
                "to_branch": doc.get("to_branch"),
                "timestamp": doc.get("timestamp"),
            }
        )

    return jsonify(formatted)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=PORT, debug=True)
