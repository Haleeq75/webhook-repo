import React, { useEffect, useState } from "react";

function Events() {
  const [events, setEvents] = useState([]);
  const [status, setStatus] = useState("");

  function formatTimestamp(isoString) {
    const date = new Date(isoString);

    return (
      date.toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }) + " IST"
    );
  }

  function formatEvent(event) {
    const formattedTime = formatTimestamp(event.timestamp);

    if (event.action === "push") {
      return `${event.author} pushed to ${event.to_branch} on ${formattedTime}`;
    }

    if (event.action === "pull_request") {
      return `${event.author} submitted a pull request from ${event.from_branch} to ${event.to_branch} on ${formattedTime}`;
    }

    if (event.action === "merge") {
      return `${event.author} merged branch ${event.from_branch} to ${event.to_branch} on ${formattedTime}`;
    }

    return `${event.author} triggered ${event.action} on ${formattedTime}`;
  }

  async function loadEvents() {
    try {
      const response = await fetch("http://localhost:5000/api/events");

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      const data = await response.json();
      setEvents(data);
      setStatus(`Last updated: ${new Date().toLocaleTimeString()}`);
    } catch (error) {
      setStatus(`Error loading events: ${error.message}`);
    }
  }

  useEffect(() => {
    loadEvents();
    const interval = setInterval(loadEvents, 15000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <p>{status}</p>

      <ul>
        {events.length === 0 ? (
          <li>No events yet. Trigger a push or pull request action.</li>
        ) : (
          events.map((event, index) => (
            <li key={index}>{formatEvent(event)}</li>
          ))
        )}
      </ul>
    </div>
  );
}

export default Events;