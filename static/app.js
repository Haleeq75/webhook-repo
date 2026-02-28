const eventsContainer = document.getElementById("events");
const statusText = document.getElementById("status");

function formatEvent(event) {
  if (event.action === "push") {
    return `${event.author} pushed to ${event.to_branch} on ${event.timestamp}.`;
  }

  if (event.action === "pull_request") {
    return `${event.author} submitted a pull request from ${event.from_branch} to ${event.to_branch} on ${event.timestamp}.`;
  }

  if (event.action === "merge") {
    return `${event.author} merged branch ${event.from_branch} to ${event.to_branch} on ${event.timestamp}.`;
  }

  return `${event.author} triggered ${event.action} on ${event.timestamp}.`;
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
