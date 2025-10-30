const API = 'http://localhost:5000/api';

// ✅ Cargar eventos desde el backend
async function fetchEvents() {
  try {
    const res = await fetch(`${API}/events`);
    const events = await res.json();
    localStorage.setItem('events_cache', JSON.stringify(events)); // respaldo local
    renderEvents(events);
  } catch (e) {
    const cached = localStorage.getItem('events_cache');
    if (cached) renderEvents(JSON.parse(cached));
    else console.error("Error al cargar eventos:", e);
  }
}

// ✅ Mostrar lista de eventos
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
        <button onclick="viewParticipants('${ev._id}')">Ver Participantes</button>
        <button onclick="editEvent('${ev._id}')">Editar</button>
        <button onclick="deleteEvent('${ev._id}')">Eliminar</button>
        <button onclick="shareEvent('${ev.title}', '${ev._id}')">Compartir</button>
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

// ✅ Registrar participante
async function showRegister(eventId) {
  const name = prompt('Tu nombre:');
  const email = prompt('Tu correo electrónico:');
  if (!name || !email) return alert('Debe ingresar nombre y correo.');

  console.log("🧾 Enviando participante:", { event: eventId, name, email });

  try {
    const res = await fetch(`${API}/participants`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event: eventId, name, email }) // 👈 campo correcto
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Error al registrar participante");
    }

    alert('🎟️ Registro completado. Revisa tu correo para la confirmación.');
  } catch (err) {
    console.error("❌ Error en registro:", err.message);
    alert("No se pudo registrar el participante.");
  }
}

// ✅ Ver detalles del evento
async function viewEvent(id) {
  const res = await fetch(`${API}/events/${id}`);
  const ev = await res.json();
  alert(`📅 ${ev.title}\n\n${new Date(ev.date).toLocaleDateString()} ${ev.time || ''}\n${ev.location}\n\n${ev.description}`);
}

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

// ✅ Ver participantes de un evento
async function viewParticipants(eventId) {
  try {
    const res = await fetch(`${API}/participants/event/${eventId}`);
    const participants = await res.json();

    if (!participants.length) {
      return alert("No hay participantes inscritos en este evento aún.");
    }

    const list = participants
      .map(p => `👤 ${p.name} — ${p.email}`)
      .join('\n');

    alert(`Participantes inscritos:\n\n${list}`);
  } catch (err) {
    console.error("❌ Error al obtener participantes:", err);
    alert("Error al cargar los participantes.");
  }
}

// ✅ Compartir evento (Web Share API)
function shareEvent(title, id) {
  const url = `${window.location.origin}/event/${id}`;
  if (navigator.share) {
    navigator.share({
      title: `Evento: ${title}`,
      text: "¡No te pierdas este evento!",
      url: url,
    })
      .then(() => console.log("✅ Evento compartido con éxito"))
      .catch(err => console.error("❌ Error al compartir:", err));
  } else {
    alert("Tu navegador no soporta compartir directamente. Copia este enlace:\n" + url);
  }
}

// ✅ Inicializar
fetchEvents();
