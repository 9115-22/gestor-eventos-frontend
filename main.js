// main.js

// URL de tu backend en Render
const API_URL = "https://gestor-eventos-backend-84mx.onrender.com";

// Elementos del DOM
const eventForm = document.getElementById('event-form');
const eventsList = document.getElementById('events-list');
const eventTemplate = document.getElementById('event-template');

// Función para cargar eventos desde el backend
async function loadEvents() {
  try {
    const res = await fetch(`${API_URL}/api/events`);
    const events = await res.json();

    eventsList.innerHTML = '';
    events.forEach(event => {
      const clone = eventTemplate.content.cloneNode(true);
      clone.querySelector('.title').textContent = event.title;
      clone.querySelector('.meta').textContent = `${event.date} ${event.time || ''} - ${event.location || ''}`;
      
      // Botones
      clone.querySelector('.view').addEventListener('click', () => alert(JSON.stringify(event)));
      clone.querySelector('.register').addEventListener('click', () => registerParticipant(event._id));
      clone.querySelector('.edit').addEventListener('click', () => editEvent(event));
      clone.querySelector('.delete').addEventListener('click', () => deleteEvent(event._id));

      eventsList.appendChild(clone);
    });
  } catch (err) {
    console.error('Error al cargar eventos:', err);
  }
}

// Guardar nuevo evento
eventForm.addEventListener('submit', async e => {
  e.preventDefault();
  const formData = new FormData(eventForm);
  const eventData = Object.fromEntries(formData.entries());

  try {
    await fetch(`${API_URL}/api/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData)
    });
    eventForm.reset();
    loadEvents();
  } catch (err) {
    console.error('Error al guardar evento:', err);
  }
});

// Editar evento
async function editEvent(event) {
  const newTitle = prompt('Editar título del evento', event.title);
  if (!newTitle) return;

  try {
    await fetch(`${API_URL}/api/events/${event._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTitle })
    });
    loadEvents();
  } catch (err) {
    console.error('Error al editar evento:', err);
  }
}

// Eliminar evento
async function deleteEvent(id) {
  if (!confirm('¿Eliminar este evento?')) return;
  try {
    await fetch(`${API_URL}/api/events/${id}`, { method: 'DELETE' });
    loadEvents();
  } catch (err) {
    console.error('Error al eliminar evento:', err);
  }
}

// Registrar participante (ejemplo simple)
function registerParticipant(eventId) {
  const name = prompt('Nombre del participante');
  const email = prompt('Correo del participante');
  if (!name || !email) return;

  fetch(`${API_URL}/api/participants`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ eventId, name, email })
  })
  .then(() => alert('Participante registrado!'))
  .catch(err => console.error('Error al registrar participante:', err));
}

// Inicializar
loadEvents();
