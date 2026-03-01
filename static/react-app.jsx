const { useEffect, useState } = React;

function ordinalSuffix(day) {
  if (day > 3 && day < 21) {
    return "th";
  }

  switch (day % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}

function formatTimestampInIST(timestamp) {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return timestamp;
  }

  const parts = new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).formatToParts(date);

  const map = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  const dayWithSuffix = `${map.day}${ordinalSuffix(Number(map.day))}`;

  const dayPeriod = (map.dayPeriod || "").toUpperCase();

  return `${dayWithSuffix} ${map.month} ${map.year} - ${map.hour}:${map.minute} ${dayPeriod} IST`;
}

function formatEvent(event) {
  const formattedTimestamp = formatTimestampInIST(event.timestamp);

  if (event.action === "push") {
    return `${event.author} pushed to ${event.to_branch} on ${formattedTimestamp}`;
  }

  if (event.action === "pull_request") {
    return `${event.author} submitted a pull request from ${event.from_branch} to ${event.to_branch} on ${formattedTimestamp}`;
  }

  if (event.action === "merge") {
    return `${event.author} merged branch ${event.from_branch} to ${event.to_branch} on ${formattedTimestamp}`;
  }

  return `${event.author} triggered ${event.action} on ${formattedTimestamp}`;
}

function EventItem({ event }) {
  return (
    <li className="event-item">
      <p className="event-message">{formatEvent(event)}</p>
      <div className="event-meta">
        <span>Request: {event.request_id || "n/a"}</span>
      </div>
    </li>
  );
}

function App() {
  const [events, setEvents] = useState([]);
  const [status, setStatus] = useState("Loading events...");

  async function loadEvents() {
    try {
      const response = await fetch("/api/events");
      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      const data = await response.json();
      setEvents(data);
      setStatus(`Last updated: ${formatTimestampInIST(new Date().toISOString())}`);
    } catch (error) {
      setStatus(`Error loading events: ${error.message}`);
    }
  }

  useEffect(() => {
    loadEvents();
    const timer = setInterval(loadEvents, 15000);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <h1>GitHub Webhook Activity</h1>
      <p className="subtitle">Frontend: ReactJS · Backend: Flask · Polling every 15 seconds</p>

      {events.length === 0 ? (
        <div className="empty-state">No events yet. Trigger a push, PR, or merge event.</div>
      ) : (
        <ul className="events-list">
          {events.map((event) => (
            <EventItem key={event.id} event={event} />
          ))}
        </ul>
      )}

      <p className="status">{status}</p>
    </>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);