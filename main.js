// ===============================
// main.js - Gestor de Eventos
// ===============================

// URLs del backend en Render
const API_URL_EVENTS = "https://gestor-eventos-backend-84mx.onrender.com/api/events";
const API_URL_PARTICIPANTS = "https://gestor-eventos-backend-84mx.onrender.com/api/participants";

// Referencias DOM
const form = document.getElementById("event-form");
const list = document.getElementById("events-list");
const template = document.getElementById("event-template");
const registerSection = document.getElementById("register-section");
const registerForm = document.getElementById("register-form");
const cancelRegister = document.getElementById("cancel-register");
const addEventBtn = document.getElementById("add-event-btn");

let editId = null;

// ===============================
// Cargar eventos
// ===============================
async function cargarEventos() {
  try {
    const res = await fetch(API_URL_EVENTS);
    if (!res.ok) throw new Error("Error al obtener eventos");
    const eventos = await res.json();
    renderEventos(eventos);
  } catch (err) {
    console.error("❌ Error cargando eventos:", err);
  }
}

// ===============================
// Renderizar eventos
// ===============================
function renderEventos(eventos) {
  list.innerHTML = "";
  eventos.forEach(ev => {
    const li = template.content.cloneNode(true);
    li.querySelector(".title").textContent = ev.title;
    li.querySelector(".meta").textContent = `${ev.date?.split("T")[0]} | ${ev.location || "Sin ubicación"}`;
    li.querySelector(".view").onclick = () => alert(ev.description || "Sin descripción");
    li.querySelector(".register").onclick = () => mostrarFormularioRegistro(ev._id);
    li.querySelector(".edit").onclick = () => editarEvento(ev);
    li.querySelector(".delete").onclick = () => eliminarEvento(ev._id);
    list.appendChild(li);
  });
}

// ===============================
// Guardar evento (crear o editar)
// ===============================
if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const nuevoEvento = {
      title: form.title.value.trim(),
      date: form.date.value,
      time: form.time.value,
      location: form.location.value.trim(),
      description: form.description.value.trim(),
    };

    try {
      const method = editId ? "PUT" : "POST";
      const url = editId ? `${API_URL_EVENTS}/${editId}` : API_URL_EVENTS;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevoEvento),
      });

      if (!res.ok) throw new Error("Error al guardar evento");
      alert(editId ? "Evento actualizado ✅" : "Evento guardado ✅");
      form.reset();
      editId = null;
      cargarEventos();
    } catch (err) {
      console.error("❌ Error guardando evento:", err);
      alert("Error al guardar el evento. Verifica tu conexión con el servidor.");
    }
  });
}

// ===============================
// Editar evento
// ===============================
function editarEvento(ev) {
  editId = ev._id;
  form.title.value = ev.title;
  form.date.value = ev.date.split("T")[0];
  form.time.value = ev.time || "";
  form.location.value = ev.location || "";
  form.description.value = ev.description || "";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ===============================
// Eliminar evento
// ===============================
async function eliminarEvento(id) {
  if (!confirm("¿Eliminar este evento?")) return;
  try {
    const res = await fetch(`${API_URL_EVENTS}/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Error al eliminar");
    alert("Evento eliminado ✅");
    cargarEventos();
  } catch (err) {
    console.error("❌ Error eliminando evento:", err);
  }
}

// ===============================
// Registro de participantes
// ===============================
function mostrarFormularioRegistro(eventId) {
  if (!registerSection || !registerForm) return;
  registerSection.classList.remove("hidden");
  registerForm.eventId.value = eventId;
  registerSection.scrollIntoView({ behavior: "smooth" });
}

if (cancelRegister) {
  cancelRegister.addEventListener("click", () => {
    registerSection.classList.add("hidden");
  });
}

if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const registro = {
      event: registerForm.eventId.value,
      name: registerForm.name.value,
      email: registerForm.email.value,
    };

    try {
      const res = await fetch(API_URL_PARTICIPANTS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registro),
      });
      if (!res.ok) throw new Error("Error al registrar participante");
      alert("Participante registrado ✅");
      registerForm.reset();
      registerSection.classList.add("hidden");
    } catch (err) {
      console.error("❌ Error registrando participante:", err);
      alert("Error al registrar participante. Intenta nuevamente.");
    }
  });
}

// ===============================
// Botón flotante
// ===============================
if (addEventBtn) {
  addEventBtn.addEventListener("click", () => {
    document.getElementById('form-section').scrollIntoView({ behavior: 'smooth' });
  });
}

// ===============================
// Inicializar
// ===============================
cargarEventos();
