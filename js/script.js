const STORAGE_KEYS = {
  visitors: 'sgs_visitors',
  notifications: 'sgs_notifications',
  events: 'sgs_events'
};

const defaultData = {
  visitors: [],
  notifications: [],
  events: [
    {
      id: crypto.randomUUID(),
      host: 'A-101 / Sharma Family',
      title: 'Sunday Kids Games',
      date: new Date().toISOString().slice(0, 10),
      description: 'Join us in the central park at 5 PM for games and snacks.'
    }
  ]
};

function readData(key) {
  const raw = localStorage.getItem(key);
  if (!raw) return [...defaultData[key.replace('sgs_', '')]];
  try {
    return JSON.parse(raw);
  } catch {
    return [...defaultData[key.replace('sgs_', '')]];
  }
}

function writeData(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function appState() {
  return {
    visitors: readData(STORAGE_KEYS.visitors),
    notifications: readData(STORAGE_KEYS.notifications),
    events: readData(STORAGE_KEYS.events)
  };
}

function saveState(state) {
  writeData(STORAGE_KEYS.visitors, state.visitors);
  writeData(STORAGE_KEYS.notifications, state.notifications);
  writeData(STORAGE_KEYS.events, state.events);
}

function renderVisitors(listEl, visitors) {
  if (!visitors.length) {
    listEl.innerHTML = '<div class="item">No visitors registered yet.</div>';
    return;
  }
  listEl.innerHTML = visitors
    .slice()
    .reverse()
    .map((v) => `
      <div class="item">
        <strong>${v.name}</strong> visiting <strong>${v.flat}</strong>
        <div class="meta">Phone: ${v.phone} · Purpose: ${v.purpose}</div>
        <div class="meta">${new Date(v.createdAt).toLocaleString()}</div>
        <span class="badge ${v.status}">${v.status.toUpperCase()}</span>
      </div>
    `)
    .join('');
}

function renderNotifications(container, notifications, flat) {
  const filtered = notifications.filter((n) => n.flat.toLowerCase() === flat.toLowerCase());
  if (!filtered.length) {
    container.innerHTML = '<div class="item">No notifications for this flat number.</div>';
    return;
  }
  container.innerHTML = filtered
    .slice()
    .reverse()
    .map((n) => `
      <div class="item">
        <strong>${n.visitorName}</strong> is waiting at the gate.
        <div class="meta">Purpose: ${n.purpose}</div>
        <div class="meta">Received: ${new Date(n.createdAt).toLocaleString()}</div>
      </div>
    `)
    .join('');
}

function renderEvents(container, events) {
  if (!events.length) {
    container.innerHTML = '<div class="item">No resident events published.</div>';
    return;
  }
  container.innerHTML = events
    .slice()
    .reverse()
    .map((e) => `
      <div class="item">
        <strong>${e.title}</strong>
        <div class="meta">By: ${e.host} · Date: ${e.date}</div>
        <div>${e.description}</div>
      </div>
    `)
    .join('');
}

function renderAdminVisitors(container, state) {
  if (!state.visitors.length) {
    container.innerHTML = '<div class="item">No visitor records.</div>';
    return;
  }

  container.innerHTML = state.visitors
    .slice()
    .reverse()
    .map((v) => `
      <div class="item">
        <strong>${v.name}</strong> → ${v.flat}
        <div class="meta">${v.phone} · ${v.purpose}</div>
        <label class="meta">Status
          <select data-id="${v.id}" class="status-select">
            <option value="pending" ${v.status === 'pending' ? 'selected' : ''}>Pending</option>
            <option value="approved" ${v.status === 'approved' ? 'selected' : ''}>Approved</option>
            <option value="rejected" ${v.status === 'rejected' ? 'selected' : ''}>Rejected</option>
          </select>
        </label>
      </div>
    `)
    .join('');

  container.querySelectorAll('.status-select').forEach((select) => {
    select.addEventListener('change', (e) => {
      const id = e.target.dataset.id;
      const nextState = appState();
      nextState.visitors = nextState.visitors.map((v) =>
        v.id === id ? { ...v, status: e.target.value } : v
      );
      saveState(nextState);
      renderAll();
    });
  });
}

function renderStats(state) {
  document.getElementById('stat-visitors').textContent = state.visitors.length;
  document.getElementById('stat-pending').textContent = state.visitors.filter((v) => v.status === 'pending').length;
  document.getElementById('stat-notifications').textContent = state.notifications.length;
  document.getElementById('stat-events').textContent = state.events.length;
}

function ensureDefaults() {
  Object.values(STORAGE_KEYS).forEach((key) => {
    if (!localStorage.getItem(key)) {
      const defaultKey = key.replace('sgs_', '');
      localStorage.setItem(key, JSON.stringify(defaultData[defaultKey]));
    }
  });
}

function renderAll() {
  const state = appState();
  renderVisitors(document.getElementById('visitor-log'), state.visitors);
  renderEvents(document.getElementById('events-feed'), state.events);
  renderEvents(document.getElementById('admin-events'), state.events);
  renderAdminVisitors(document.getElementById('admin-visitors'), state);
  renderStats(state);
}

document.addEventListener('DOMContentLoaded', () => {
  ensureDefaults();

  document.querySelectorAll('.tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach((t) => t.classList.remove('active'));
      document.querySelectorAll('.panel').forEach((p) => p.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(tab.dataset.tab).classList.add('active');
    });
  });

  document.getElementById('visitor-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const state = appState();

    const visitor = {
      id: crypto.randomUUID(),
      name: document.getElementById('visitorName').value.trim(),
      phone: document.getElementById('visitorPhone').value.trim(),
      flat: document.getElementById('visitorFlat').value.trim(),
      purpose: document.getElementById('visitorPurpose').value.trim(),
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    state.visitors.push(visitor);
    state.notifications.push({
      id: crypto.randomUUID(),
      flat: visitor.flat,
      visitorName: visitor.name,
      purpose: visitor.purpose,
      createdAt: visitor.createdAt
    });

    saveState(state);
    e.target.reset();
    document.getElementById('guard-message').textContent = `Visitor registered and notification sent to flat ${visitor.flat}.`;
    renderAll();
  });

  document.getElementById('load-notifications').addEventListener('click', () => {
    const flat = document.getElementById('resident-flat').value.trim();
    const state = appState();
    if (!flat) {
      document.getElementById('resident-notifications').innerHTML = '<div class="item">Enter flat number first.</div>';
      return;
    }
    renderNotifications(document.getElementById('resident-notifications'), state.notifications, flat);
  });

  document.getElementById('event-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const state = appState();

    state.events.push({
      id: crypto.randomUUID(),
      host: document.getElementById('eventHost').value.trim(),
      title: document.getElementById('eventTitle').value.trim(),
      date: document.getElementById('eventDate').value,
      description: document.getElementById('eventDescription').value.trim()
    });

    saveState(state);
    e.target.reset();
    document.getElementById('event-message').textContent = 'Event published to all residents.';
    renderAll();
  });

  renderAll();
});
