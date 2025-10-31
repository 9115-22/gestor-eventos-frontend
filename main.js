// ===============================
// main.js - Gestor de Eventos
// ===============================

const EVENTS_API = "https://gestor-eventos-backend-84mx.onrender.com/api/events";
const PARTICIPANTS_API = "https://gestor-eventos-backend-84mx.onrender.com/api/participants";

// Referencias DOM
const form = document.getElementById("event-form");
const list = document.getElementById("events-list");
const template = document.getElementById("event-template");
const registerSection = document.getElementById("register-section");
const registerForm = document.getElementById("register-form");
const cancelRegister = document.getElementById("cancel-register");

let editId = null;

// ===============================
// Cargar eventos
// ===============================
async function cargarEventos() {
  try {
    const res = await fetch(EVENTS_API);
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
  if (!list || !template) return;
  list.innerHTML = "";
  eventos.forEach(ev => {
    const li = template.content.cloneNode(true);
    li.querySelector(".title").textContent = ev.title;
    li.querySelector(".meta").textContent = `${new Date(ev.date).toLocaleDateString()} | ${ev.location}`;
    li.querySelector(".view").onclick = () => alert(ev.description);
    li.querySelector(".register").onclick = () => mostrarFormularioRegistro(ev._id);
    li.querySelector(".edit").onclick = () => editarEvento(ev);
    li.querySelector(".delete").onclick = () => eliminarEvento(ev._id);
    list.appendChild(li);
  });
}

// ===============================
// Guardar evento
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
      const url = editId ? `${EVENTS_API}/${editId}` : EVENTS_API;

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
  if (!form) return;
  editId = ev._id;
  form.title.value = ev.title;
  form.date.value = ev.date.split("T")[0];
  form.time.value = ev.time || "";
  form.location.value = ev.location;
  form.description.value = ev.description;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ===============================
// Eliminar evento
// ===============================
async function eliminarEvento(id) {
  if (!confirm("¿Eliminar este evento?")) return;
  try {
    const res = await fetch(`${EVENTS_API}/${id}`, { method: "DELETE" });
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
    if (registerSection) registerSection.classList.add("hidden");
  });
}

if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const registro = {
      event: registerForm.eventId.value,
      name: registerForm.name.value,
      email: registerForm.email.value
    };

    try {
      const res = await fetch(PARTICIPANTS_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registro),
      });
      if (!res.ok) throw new Error("Error al registrar participante");
      alert("Participante registrado ✅");
      registerForm.reset();
      if (registerSection) registerSection.classList.add("hidden");
    } catch (err) {
      console.error("❌ Error registrando participante:", err);
      alert("Error al registrar participante. Intenta nuevamente.");
    }
  });
}

// ===============================
// Inicializar
// ===============================
cargarEventos();
