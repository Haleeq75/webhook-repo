const eventsContainer = document.getElementById("events");
const statusText = document.getElementById("status");

function getOrdinal(day) {
  if (day > 3 && day < 21) return "th";
  switch (day % 10) {
    case 1: return "st";
    case 2: return "nd";
    case 3: return "rd";
    default: return "th";
  }
}

function formatTimestamp(isoString) {
  const date = new Date(isoString);

  return date.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  }) + " IST";
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

function renderEvents(events) {
  eventsContainer.innerHTML = "";

  if (!events.length) {
    const empty = document.createElement("li");
    empty.textContent = "No events yet. Trigger a push or pull request action.";
    eventsContainer.appendChild(empty);
    return;
  }

  events.forEach((event) => {
    const li = document.createElement("li");
    li.textContent = formatEvent(event);
    eventsContainer.appendChild(li);
  });
}

async function loadEvents() {
  try {
    const response = await fetch("/api/events");
    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const events = await response.json();
    renderEvents(events);
    statusText.textContent = `Last updated: ${new Date().toLocaleTimeString()}`;
  } catch (error) {
    statusText.textContent = `Error loading events: ${error.message}`;
  }
}

loadEvents();
setInterval(loadEvents, 15000);