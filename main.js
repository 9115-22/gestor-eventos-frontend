// 🔹 URL pública del backend en Render
const API = 'https://gestor-eventos-backend-84mx.onrender.com/api';

// ✅ Cargar eventos
async function fetchEvents() {
  try {
    const res = await fetch(`${API}/events`);
    const events = await res.json();
    localStorage.setItem('events_cache', JSON.stringify(events));
    renderEvents(events);
  } catch (e) {
    const cached = localStorage.getItem('events_cache');
    if (cached) renderEvents(JSON.parse(cached));
    else console.error("Error al cargar eventos:", e);
  }
}

// ✅ Mostrar eventos
function renderEvents(events) {
  const ul = document.getElementById('events-list');
  ul.innerHTML = '';
  events.forEach(ev => {
    const li = document.createElement('li');
    li.innerHTML = `
      <strong>${ev.title}</strong>
      <div>${new Date(ev.date).toLocaleDateString()} ${ev.time || ''} - ${ev.location || ''}</div>
      <p>${ev.description || ''}</p>
      <div>
        <button onclick="viewEvent('${ev._id}')">Ver</button>
        <button onclick="showRegister('${ev._id}')">Inscribirse</button>
        <button onclick="editEvent('${ev._id}')">Editar</button>
        <button onclick="deleteEvent('${ev._id}')">Eliminar</button>
      </div>
    `;
    ul.appendChild(li);
  });
}

// ✅ Crear o editar evento
document.getElementById('event-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target));
  const method = e.target.dataset.editing ? 'PUT' : 'POST';
  const url = e.target.dataset.editing
    ? `${API}/events/${e.target.dataset.id}`
    : `${API}/events`;

  await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  e.target.reset();
  e.target.dataset.editing = '';
  e.target.dataset.id = '';
  fetchEvents();
  alert('✅ Evento guardado correctamente.');
});

// ✅ Editar evento (rellenar formulario)
async function editEvent(id) {
  const res = await fetch(`${API}/events/${id}`);
  const ev = await res.json();
  const form = document.getElementById('event-form');
  form.title.value = ev.title;
  form.date.value = ev.date.split('T')[0];
  form.time.value = ev.time || '';
  form.location.value = ev.location || '';
  form.description.value = ev.description || '';
  form.dataset.editing = true;
  form.dataset.id = id;
}

// ✅ Eliminar evento
async function deleteEvent(id) {
  if (!confirm('¿Seguro que deseas eliminar este evento?')) return;
  await fetch(`${API}/events/${id}`, { method: 'DELETE' });
  fetchEvents();
}

// ✅ Inicializar
fetchEvents();
