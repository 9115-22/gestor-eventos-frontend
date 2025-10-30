// ================================
// 🌐 CONFIGURACIÓN GLOBAL
// ================================
const API_URL = "https://gestor-eventos-backend-84mx.onrender.com/api"; 
// ⬆️ Usa la URL EXACTA de tu backend en Render

// ================================
// 🎯 FUNCIONES CRUD DE EVENTOS
// ================================
const eventForm = document.getElementById("event-form");
const eventsList = document.getElementById("events-list");
const eventTemplate = document.getElementById("event-template");
const registerSection = document.getElementById("register-section");
const registerForm = document.getElementById("register-form");
const cancelRegister = document.getElementById("cancel-register");

let editingEventId = null;

// ✅ Cargar eventos al iniciar
document.addEventListener("DOMContentLoaded", loadEvents);

// ================================
// 🔹 Cargar todos los eventos
// ================================
async function loadEvents() {
  try {
    const res = await fetch(`${API_URL}/events`);
    const data = await res.json();
    renderEvents(data);
  } catch (error) {
    console.error("❌ Error cargando eventos:", error);
  }
}

// ================================
// 🔹 Mostrar eventos en la lista
// ================================
function renderEvents(events) {
  eventsList.innerHTML = "";

  if (!events.length) {
    eventsList.innerHTML = "<p>No hay eventos registrados.</p>";
    return;
  }

  events.forEach(event => {
    const clone = eventTemplate.content.cloneNode(true);
    clone.querySelector(".title").textContent = event.title;
    clone.querySelector(".meta").textContent = `${event.date} — ${event.location}`;
    clone.querySelector(".view").addEventListener("click", () => alert(event.description));
    clone.querySelector(".register").addEventListener("click", () => openRegisterForm(event._id));
    clone.querySelector(".edit").addEventListener("click", () => editEvent(event));
    clone.querySelector(".delete").addEventListener("click", () => deleteEvent(event._id));
    eventsList.appendChild(clone);
  });
}

// ================================
// 🔹 Crear o editar un evento
// ================================
eventForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(eventForm);
  const eventData = Object.fromEntries(formData.entries());

  try {
    let res;
    if (editingEventId) {
      res = await fetch(`${API_URL}/events/${editingEventId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventData),
      });
      editingEventId = null;
    } else {
      res = await fetch(`${API_URL}/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventData),
      });
    }

    if (res.ok) {
      eventForm.reset();
      loadEvents();
      alert("✅ Evento guardado correctamente");
    } else {
      alert("❌ Error al guardar el evento");
    }
  } catch (error) {
    console.error("❌ Error guardando evento:", error);
  }
});

// ================================
// 🔹 Editar evento
// ================================
function editEvent(event) {
  eventForm.title.value = event.title;
  eventForm.date.value = event.date;
  eventForm.time.value = event.time || "";
  eventForm.location.value = event.location || "";
  eventForm.description.value = event.description || "";
  editingEventId = event._id;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ================================
// 🔹 Eliminar evento
// ================================
async function deleteEvent(id) {
  if (!confirm("¿Seguro que deseas eliminar este evento?")) return;

  try {
    const res = await fetch(`${API_URL}/events/${id}`, { method: "DELETE" });
    if (res.ok) {
      loadEvents();
      alert("🗑️ Evento eliminado correctamente");
    } else {
      alert("❌ Error al eliminar el evento");
    }
  } catch (error) {
    console.error("❌ Error eliminando evento:", error);
  }
}

// ================================
// 🔹 Formulario de registro de participante
// ================================
function openRegisterForm(eventId) {
  registerSection.classList.remove("hidden");
  document.getElementById("eventId").value = eventId;
  registerSection.scrollIntoView({ behavior: "smooth" });
}

cancelRegister.addEventListener("click", () => {
  registerSection.classList.add("hidden");
  registerForm.reset();
});

registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(registerForm);
  const participantData = Object.fromEntries(formData.entries());

  try {
    const res = await fetch(`${API_URL}/participants`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(participantData),
    });

    if (res.ok) {
      alert("🎉 Participante registrado correctamente");
      registerForm.reset();
      registerSection.classList.add("hidden");
    } else {
      alert("❌ Error al registrar participante");
    }
  } catch (error) {
    console.error("❌ Error registrando participante:", error);
  }
});
