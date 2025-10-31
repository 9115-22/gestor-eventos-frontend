document.addEventListener("DOMContentLoaded", function() {
  console.log("✅ DOM cargado - Inicializando aplicación...");

  // URLs del backend
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

  // ✅ FUNCIÓN PARA PROBAR CONEXIÓN
  async function testBackendConnection() {
    try {
      console.log("🔗 Probando conexión con el backend...");
      
      // Probar endpoint de health
      const healthResponse = await fetch('https://gestor-eventos-backend-84mx.onrender.com/api/health');
      console.log('✅ Health check:', healthResponse.status);
      
      // Probar endpoint de eventos
      const eventsResponse = await fetch(API_URL_EVENTS);
      console.log('✅ Events endpoint:', eventsResponse.status);
      
      if (healthResponse.ok && eventsResponse.ok) {
        console.log('🎉 ¡Conexión con backend exitosa!');
        return true;
      }
    } catch (error) {
      console.error('❌ Error en conexión con backend:', error);
      showError('No se pudo conectar con el servidor. Verifica tu conexión a internet.');
      return false;
    }
  }

  // ✅ FUNCIÓN PARA MOSTRAR ERRORES
  function showError(message) {
    let errorDiv = document.getElementById('error-message');
    if (!errorDiv) {
      errorDiv = document.createElement('div');
      errorDiv.id = 'error-message';
      errorDiv.style.cssText = `
        background: #fee;
        border: 1px solid #fcc;
        color: #c00;
        padding: 10px;
        margin: 10px 0;
        border-radius: 4px;
      `;
      if (form) {
        form.parentNode.insertBefore(errorDiv, form);
      }
    }
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    
    setTimeout(() => {
      errorDiv.style.display = 'none';
    }, 5000);
  }

  // ✅ FUNCIÓN PARA OCULTAR ERROR
  function hideError() {
    const errorDiv = document.getElementById('error-message');
    if (errorDiv) {
      errorDiv.style.display = 'none';
    }
  }

  // ===============================
  // Cargar eventos - MEJORADO
  // ===============================
  async function cargarEventos() {
    try {
      console.log("🔄 Cargando eventos...");
      
      const res = await fetch(API_URL_EVENTS, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      if (!res.ok) {
        throw new Error(`Error ${res.status}: ${res.statusText}`);
      }
      
      const eventos = await res.json();
      console.log(`✅ ${eventos.length} eventos cargados correctamente`);
      renderEventos(eventos);
      hideError();
      
    } catch (err) {
      console.error("❌ Error cargando eventos:", err);
      showError(`Error al cargar eventos: ${err.message}`);
      
      if (list) {
        list.innerHTML = `
          <div class="error-message">
            <p>❌ No se pudieron cargar los eventos</p>
            <p>${err.message}</p>
            <button onclick="cargarEventos()" style="margin-top: 10px; padding: 5px 10px;">
              Reintentar
            </button>
          </div>
        `;
      }
    }
  }

  // ===============================
  // Renderizar eventos - MEJORADO
  // ===============================
  function renderEventos(eventos) {
    if (!list) {
      console.error("❌ No se encontró el elemento events-list");
      return;
    }

    if (!eventos || eventos.length === 0) {
      list.innerHTML = '<p class="no-events">No hay eventos disponibles. ¡Crea el primero!</p>';
      return;
    }

    list.innerHTML = "";
    eventos.forEach(ev => {
      const li = template.content.cloneNode(true);
      
      // Configurar elementos
      li.querySelector(".title").textContent = ev.title || "Sin título";
      li.querySelector(".meta").textContent = `${ev.date?.split("T")[0] || "Sin fecha"} | ${ev.location || "Sin ubicación"}`;
      
      // Configurar botones con verificación de existencia
      const viewBtn = li.querySelector(".view");
      const registerBtn = li.querySelector(".register");
      const editBtn = li.querySelector(".edit");
      const deleteBtn = li.querySelector(".delete");
      
      if (viewBtn) {
        viewBtn.onclick = () => mostrarDetallesEvento(ev);
      }
      
      if (registerBtn) {
        registerBtn.onclick = () => mostrarFormularioRegistro(ev._id);
      }
      
      if (editBtn) {
        editBtn.onclick = () => editarEvento(ev);
      }
      
      if (deleteBtn) {
        deleteBtn.onclick = () => eliminarEvento(ev._id);
      }
      
      list.appendChild(li);
    });
  }

  // ✅ NUEVA FUNCIÓN PARA MOSTRAR DETALLES
  function mostrarDetallesEvento(ev) {
    const detalles = `
Título: ${ev.title}
Descripción: ${ev.description || "Sin descripción"}
Fecha: ${ev.date?.split("T")[0] || "Sin fecha"}
Hora: ${ev.time || "No especificada"}
Ubicación: ${ev.location || "Sin ubicación"}
Capacidad: ${ev.capacity || "No especificada"}
    `;
    alert(detalles);
  }

  // ===============================
  // Guardar evento (crear o editar) - MEJORADO
  // ===============================
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      console.log(editId ? "✏️ Actualizando evento..." : "📝 Creando nuevo evento...");
      
      const nuevoEvento = {
        title: form.title.value.trim(),
        date: form.date.value,
        time: form.time.value,
        location: form.location.value.trim(),
        description: form.description.value.trim(),
      };

      // Validación básica
      if (!nuevoEvento.title || !nuevoEvento.date) {
        showError("El título y la fecha son obligatorios");
        return;
      }

      try {
        const method = editId ? "PUT" : "POST";
        const url = editId ? `${API_URL_EVENTS}/${editId}` : API_URL_EVENTS;

        const res = await fetch(url, {
          method,
          headers: { 
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify(nuevoEvento),
        });

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`Error ${res.status}: ${errorText}`);
        }

        const result = await res.json();
        console.log("✅ Evento guardado:", result);
        
        alert(editId ? "Evento actualizado ✅" : "Evento guardado ✅");
        form.reset();
        editId = null;
        cargarEventos();
        hideError();
        
      } catch (err) {
        console.error("❌ Error guardando evento:", err);
        showError(`Error al guardar el evento: ${err.message}`);
      }
    });
  }

  // ===============================
  // Editar evento
  // ===============================
  function editarEvento(ev) {
    editId = ev._id;
    if (form) {
      form.title.value = ev.title || "";
      form.date.value = ev.date?.split("T")[0] || "";
      form.time.value = ev.time || "";
      form.location.value = ev.location || "";
      form.description.value = ev.description || "";
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
    console.log(`✏️ Editando evento: ${ev.title}`);
  }

  // ===============================
  // Eliminar evento - MEJORADO
  // ===============================
  async function eliminarEvento(id) {
    if (!confirm("¿Estás seguro de que quieres eliminar este evento?")) return;
    
    try {
      const res = await fetch(`${API_URL_EVENTS}/${id}`, { 
        method: "DELETE" 
      });
      
      if (!res.ok) {
        throw new Error(`Error ${res.status} al eliminar evento`);
      }

      console.log("✅ Evento eliminado");
      alert("Evento eliminado ✅");
      cargarEventos();
      
    } catch (err) {
      console.error("❌ Error eliminando evento:", err);
      showError(`Error al eliminar el evento: ${err.message}`);
    }
  }

  // ===============================
  // Registro de participantes - MEJORADO
  // ===============================
  function mostrarFormularioRegistro(eventId) {
    if (!registerSection || !registerForm) {
      console.error("❌ No se encontraron elementos del formulario de registro");
      return;
    }
    registerSection.classList.remove("hidden");
    registerForm.eventId.value = eventId;
    registerSection.scrollIntoView({ behavior: "smooth" });
    console.log(`📋 Registro para evento: ${eventId}`);
  }

  if (cancelRegister) {
    cancelRegister.addEventListener("click", () => {
      registerSection.classList.add("hidden");
      registerForm.reset();
    });
  }

  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      
      const registro = {
        event: registerForm.eventId.value,
        name: registerForm.name.value.trim(),
        email: registerForm.email.value.trim(),
      };

      // Validación
      if (!registro.name || !registro.email) {
        alert("Nombre y email son obligatorios");
        return;
      }

      try {
        const res = await fetch(API_URL_PARTICIPANTS, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify(registro),
        });
        
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`Error ${res.status}: ${errorText}`);
        }

        const result = await res.json();
        console.log("✅ Participante registrado:", result);
        
        alert("Participante registrado ✅");
        registerForm.reset();
        registerSection.classList.add("hidden");
        
      } catch (err) {
        console.error("❌ Error registrando participante:", err);
        alert(`Error al registrar participante: ${err.message}`);
      }
    });
  }

  // ===============================
  // Botón flotante
  // ===============================
  if (addEventBtn) {
    addEventBtn.addEventListener("click", () => {
      const formSection = document.getElementById('form-section');
      if (formSection) {
        formSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  // ===============================
  // Inicializar aplicación
  // ===============================
  async function inicializar() {
    console.log("🚀 Inicializando gestor de eventos...");
    
    // Probar conexión primero
    const conexionExitosa = await testBackendConnection();
    
    if (conexionExitosa) {
      // Cargar eventos si la conexión es exitosa
      await cargarEventos();
    }
    
    console.log("✅ Aplicación inicializada correctamente");
  }

  // Hacer funciones globales para botones HTML
  window.cargarEventos = cargarEventos;
  window.mostrarFormularioRegistro = mostrarFormularioRegistro;

  // Iniciar la aplicación
  inicializar();
});