// ===============================
// LOGIN SEGURO - PROYECTO ACADÉMICO
// HTML + CSS + JavaScript + localStorage
// Backend local: Node.js + Express + Nodemailer
// ===============================

// Para exposición puedes dejar 1 minuto.
// Para una regla más real cambia a 15.
const MINUTOS_BLOQUEO = 1;

let captchaRespuestaCorrecta = "";
let captchaSeleccionado = "";
let correoEnRecuperacion = "";

const captchaImagenes = [
  { nombre: "carro", icono: "🚗" },
  { nombre: "moto", icono: "🏍️" },
  { nombre: "perro", icono: "🐶" },
  { nombre: "gato", icono: "🐱" },
  { nombre: "casa", icono: "🏠" },
  { nombre: "avión", icono: "✈️" },
  { nombre: "árbol", icono: "🌳" },
  { nombre: "bicicleta", icono: "🚲" },
  { nombre: "semáforo", icono: "🚦" }
];

document.addEventListener("DOMContentLoaded", () => {
  crearAdminInicial();
  verificarSesion();

  document.getElementById("registroForm").addEventListener("submit", registrarUsuario);
  document.getElementById("loginForm").addEventListener("submit", iniciarSesion);
  document.getElementById("registroPassword").addEventListener("input", validarReglasPasswordVisual);
  document.getElementById("loginCorreo").addEventListener("input", revisarCaptchaPorUsuario);

  document.getElementById("btnMostrarRecuperacion").addEventListener("click", mostrarRecuperacion);
  document.getElementById("btnVolverLogin").addEventListener("click", volverLogin);
  document.getElementById("recoverySendForm").addEventListener("submit", enviarCodigoRecuperacion);
  document.getElementById("recoveryResetForm").addEventListener("submit", cambiarPasswordConCodigo);
  document.getElementById("nuevaPassword").addEventListener("input", validarReglasNuevaPasswordVisual);
  document.getElementById("codigoRecuperacion").addEventListener("input", () => {
    const input = document.getElementById("codigoRecuperacion");
    input.value = input.value.replace(/\D/g, "");
  });
});

// ===============================
// UTILIDADES
// ===============================

function obtenerUsuarios() {
  return JSON.parse(localStorage.getItem("usuariosLoginSeguro")) || [];
}

function guardarUsuarios(usuarios) {
  localStorage.setItem("usuariosLoginSeguro", JSON.stringify(usuarios));
}

function mostrarAlerta(mensaje, tipo = "info") {
  const alerta = document.getElementById("alerta");
  alerta.textContent = mensaje;
  alerta.className = `alerta ${tipo}`;

  setTimeout(() => {
    alerta.className = "alerta oculto";
  }, 7000);
}

function normalizarCorreo(correo) {
  return correo.trim().toLowerCase();
}

function togglePassword(idInput) {
  const input = document.getElementById(idInput);
  input.type = input.type === "password" ? "text" : "password";
}

// Hash simple con SHA-256 para no guardar la contraseña visible.
// Para un sistema real se recomienda backend + bcrypt/argon2.
async function generarHash(texto) {
  const encoder = new TextEncoder();
  const data = encoder.encode(texto);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(byte => byte.toString(16).padStart(2, "0")).join("");
}

// ===============================
// ADMIN INICIAL
// ===============================

async function crearAdminInicial() {
  const usuarios = obtenerUsuarios();
  const existeAdmin = usuarios.some(u => u.correo === "admin@demo.com");

  if (!existeAdmin) {
    const passwordHash = await generarHash("Admin@123");

    usuarios.push({
      id: Date.now(),
      nombre: "Administrador",
      correo: "admin@demo.com",
      passwordHash,
      rol: "admin",
      estado: "ACTIVO",
      intentosFallidos: 0,
      captchaRequerido: false,
      bloqueadoHasta: null,
      cantidadBloqueos: 0,
      fechaCreacion: new Date().toLocaleString(),
      ultimoLogin: null
    });

    guardarUsuarios(usuarios);
  }
}

// ===============================
// VALIDACIÓN DE CONTRASEÑA
// ===============================

function validarPasswordFuerte(password) {
  return {
    length: password.length >= 8,
    upper: /[A-ZÁÉÍÓÚÑ]/.test(password),
    lower: /[a-záéíóúñ]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>_\-+=/\\[\];'`~]/.test(password)
  };
}

function passwordEsValida(password) {
  const reglas = validarPasswordFuerte(password);
  return reglas.length && reglas.upper && reglas.lower && reglas.number && reglas.special;
}

function validarReglasPasswordVisual() {
  const password = document.getElementById("registroPassword").value;
  actualizarReglasVisuales(password, {
    length: "ruleLength",
    upper: "ruleUpper",
    lower: "ruleLower",
    number: "ruleNumber",
    special: "ruleSpecial"
  });
}

function validarReglasNuevaPasswordVisual() {
  const password = document.getElementById("nuevaPassword").value;
  actualizarReglasVisuales(password, {
    length: "resetRuleLength",
    upper: "resetRuleUpper",
    lower: "resetRuleLower",
    number: "resetRuleNumber",
    special: "resetRuleSpecial"
  });
}

function actualizarReglasVisuales(password, ids) {
  const reglas = validarPasswordFuerte(password);

  actualizarRegla(ids.length, reglas.length, "Mínimo 8 caracteres");
  actualizarRegla(ids.upper, reglas.upper, "Al menos una mayúscula");
  actualizarRegla(ids.lower, reglas.lower, "Al menos una minúscula");
  actualizarRegla(ids.number, reglas.number, "Al menos un número");
  actualizarRegla(ids.special, reglas.special, "Al menos un carácter especial");
}

function actualizarRegla(id, cumple, texto) {
  const elemento = document.getElementById(id);
  elemento.textContent = `${cumple ? "✅" : "❌"} ${texto}`;
  elemento.style.color = cumple ? "#166534" : "#991b1b";
}

// ===============================
// REGISTRO
// ===============================

async function registrarUsuario(event) {
  event.preventDefault();

  const nombre = document.getElementById("nombre").value.trim();
  const correo = normalizarCorreo(document.getElementById("registroCorreo").value);
  const password = document.getElementById("registroPassword").value;
  const confirmar = document.getElementById("confirmarPassword").value;

  if (!nombre || !correo || !password || !confirmar) {
    mostrarAlerta("Todos los campos son obligatorios.", "error");
    return;
  }

  if (!passwordEsValida(password)) {
    mostrarAlerta("La contraseña no cumple con las reglas de seguridad.", "error");
    return;
  }

  if (password !== confirmar) {
    mostrarAlerta("Las contraseñas no coinciden.", "error");
    return;
  }

  const usuarios = obtenerUsuarios();

  if (usuarios.some(u => u.correo === correo)) {
    mostrarAlerta("No se pudo registrar. Verifique los datos ingresados.", "error");
    return;
  }

  const passwordHash = await generarHash(password);

  usuarios.push({
    id: Date.now(),
    nombre,
    correo,
    passwordHash,
    rol: "usuario",
    estado: "ACTIVO",
    intentosFallidos: 0,
    captchaRequerido: false,
    bloqueadoHasta: null,
    cantidadBloqueos: 0,
    fechaCreacion: new Date().toLocaleString(),
    ultimoLogin: null
  });

  guardarUsuarios(usuarios);
  document.getElementById("registroForm").reset();
  validarReglasPasswordVisual();

  mostrarAlerta("Usuario registrado correctamente. Ahora puede iniciar sesión.", "success");
}

// ===============================
// LOGIN
// ===============================

async function iniciarSesion(event) {
  event.preventDefault();

  const correo = normalizarCorreo(document.getElementById("loginCorreo").value);
  const password = document.getElementById("loginPassword").value;
  const soyHumano = document.getElementById("soyHumano").checked;

  if (!correo || !password) {
    mostrarAlerta("Ingrese correo y contraseña.", "error");
    return;
  }

  if (!soyHumano) {
    mostrarAlerta("Debe marcar la opción 'Soy humano'.", "error");
    return;
  }

  const usuarios = obtenerUsuarios();
  const usuario = usuarios.find(u => u.correo === correo);

  if (!usuario) {
    mostrarAlerta("Usuario o contraseña incorrectos.", "error");
    return;
  }

  actualizarDesbloqueoAutomatico(usuario, usuarios);

  if (usuario.estado === "BLOQUEADO_TEMPORAL") {
    mostrarAlerta(`Usuario bloqueado temporalmente. Intente después de: ${formatearFecha(usuario.bloqueadoHasta)}`, "error");
    cargarPanelAdmin();
    return;
  }

  if (usuario.estado === "BLOQUEADO_ADMIN") {
    mostrarAlerta("Usuario bloqueado por administrador.", "error");
    return;
  }

  if (usuario.captchaRequerido) {
    const captchaValido = validarCaptchaImagen();

    if (!captchaValido) {
      mostrarAlerta("CAPTCHA incorrecto. Seleccione la imagen solicitada.", "error");
      return;
    }
  }

  const passwordHash = await generarHash(password);

  if (passwordHash !== usuario.passwordHash) {
    manejarIntentoFallido(usuario, usuarios);
    return;
  }

  usuario.intentosFallidos = 0;
  usuario.captchaRequerido = false;
  usuario.bloqueadoHasta = null;
  usuario.estado = "ACTIVO";
  usuario.ultimoLogin = new Date().toLocaleString();

  guardarUsuarios(usuarios);

  localStorage.setItem("sesionLoginSeguro", JSON.stringify({
    correo: usuario.correo,
    rol: usuario.rol,
    nombre: usuario.nombre
  }));

  document.getElementById("loginForm").reset();
  ocultarCaptcha();

  mostrarAlerta("Inicio de sesión correcto.", "success");
  verificarSesion();
}

function manejarIntentoFallido(usuario, usuarios) {
  usuario.intentosFallidos += 1;

  if (usuario.intentosFallidos >= 3) {
    usuario.captchaRequerido = true;
    generarCaptchaImagen();
  }

  if (usuario.intentosFallidos >= 5) {
    usuario.estado = "BLOQUEADO_TEMPORAL";
    usuario.bloqueadoHasta = Date.now() + MINUTOS_BLOQUEO * 60 * 1000;
    usuario.cantidadBloqueos += 1;

    mostrarAlerta(`Usuario bloqueado por ${MINUTOS_BLOQUEO} minuto(s) por demasiados intentos fallidos.`, "error");
  } else {
    const restantes = 5 - usuario.intentosFallidos;

    if (usuario.intentosFallidos >= 3) {
      mostrarAlerta(`Usuario o contraseña incorrectos. CAPTCHA activado. Intentos restantes: ${restantes}.`, "error");
    } else {
      mostrarAlerta(`Usuario o contraseña incorrectos. Intentos restantes: ${restantes}.`, "error");
    }
  }

  guardarUsuarios(usuarios);
  cargarPanelAdmin();
}

function actualizarDesbloqueoAutomatico(usuario, usuarios) {
  if (
    usuario.estado === "BLOQUEADO_TEMPORAL" &&
    usuario.bloqueadoHasta &&
    Date.now() >= usuario.bloqueadoHasta
  ) {
    usuario.estado = "ACTIVO";
    usuario.intentosFallidos = 0;
    usuario.captchaRequerido = false;
    usuario.bloqueadoHasta = null;
    guardarUsuarios(usuarios);
  }
}

// ===============================
// RECUPERACIÓN POR CORREO
// ===============================

function mostrarRecuperacion() {
  document.getElementById("authContainer").classList.add("oculto");
  document.getElementById("recoveryContainer").classList.remove("oculto");
  document.getElementById("recoverySendForm").classList.remove("oculto");
  document.getElementById("recoveryResetForm").classList.add("oculto");

  const correoLogin = document.getElementById("loginCorreo").value.trim();
  document.getElementById("resetCorreo").value = correoLogin;
}

function volverLogin() {
  document.getElementById("recoveryContainer").classList.add("oculto");
  document.getElementById("authContainer").classList.remove("oculto");
  document.getElementById("recoverySendForm").reset();
  document.getElementById("recoveryResetForm").reset();
  correoEnRecuperacion = "";
}

async function enviarCodigoRecuperacion(event) {
  event.preventDefault();

  const correo = normalizarCorreo(document.getElementById("resetCorreo").value);
  const usuarios = obtenerUsuarios();
  const usuario = usuarios.find(u => u.correo === correo);

  if (!usuario) {
    mostrarAlerta("No se encontró una cuenta registrada con ese correo.", "error");
    return;
  }

  try {
    const respuesta = await fetch("/api/recuperacion/enviar-codigo", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ correo })
    });

    const data = await respuesta.json();

    if (!respuesta.ok || !data.ok) {
      mostrarAlerta(data.mensaje || "No se pudo enviar el código.", "error");
      return;
    }

    correoEnRecuperacion = correo;
    document.getElementById("recoverySendForm").classList.add("oculto");
    document.getElementById("recoveryResetForm").classList.remove("oculto");

    if (data.codigoDesarrollo) {
      mostrarAlerta(`Modo desarrollo: código generado ${data.codigoDesarrollo}. En producción esto llegaría al correo.`, "info");
    } else {
      mostrarAlerta("Código enviado correctamente. Revise su correo electrónico.", "success");
    }

  } catch (error) {
    mostrarAlerta("No se pudo conectar con el servidor local. Ejecute: npm start", "error");
  }
}

async function cambiarPasswordConCodigo(event) {
  event.preventDefault();

  const codigo = document.getElementById("codigoRecuperacion").value.trim();
  const nuevaPassword = document.getElementById("nuevaPassword").value;
  const confirmarNuevaPassword = document.getElementById("confirmarNuevaPassword").value;

  if (!correoEnRecuperacion) {
    mostrarAlerta("Primero debe solicitar un código de recuperación.", "error");
    return;
  }

  if (!/^\d{6}$/.test(codigo)) {
    mostrarAlerta("El código debe tener 6 números.", "error");
    return;
  }

  if (!passwordEsValida(nuevaPassword)) {
    mostrarAlerta("La nueva contraseña no cumple con las reglas de seguridad.", "error");
    return;
  }

  if (nuevaPassword !== confirmarNuevaPassword) {
    mostrarAlerta("Las nuevas contraseñas no coinciden.", "error");
    return;
  }

  try {
    const respuesta = await fetch("/api/recuperacion/verificar-codigo", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        correo: correoEnRecuperacion,
        codigo
      })
    });

    const data = await respuesta.json();

    if (!respuesta.ok || !data.ok) {
      mostrarAlerta(data.mensaje || "Código incorrecto o vencido.", "error");
      return;
    }

    const usuarios = obtenerUsuarios();
    const usuario = usuarios.find(u => u.correo === correoEnRecuperacion);

    if (!usuario) {
      mostrarAlerta("Usuario no encontrado.", "error");
      return;
    }

    usuario.passwordHash = await generarHash(nuevaPassword);
    usuario.estado = "ACTIVO";
    usuario.intentosFallidos = 0;
    usuario.captchaRequerido = false;
    usuario.bloqueadoHasta = null;

    guardarUsuarios(usuarios);

    document.getElementById("recoveryResetForm").reset();
    validarReglasNuevaPasswordVisual();
    volverLogin();

    mostrarAlerta("Contraseña actualizada correctamente. Ya puede iniciar sesión.", "success");

  } catch (error) {
    mostrarAlerta("No se pudo conectar con el servidor local. Ejecute: npm start", "error");
  }
}

// ===============================
// CAPTCHA DE IMAGEN
// ===============================

function revisarCaptchaPorUsuario() {
  const correo = normalizarCorreo(document.getElementById("loginCorreo").value);
  const usuarios = obtenerUsuarios();
  const usuario = usuarios.find(u => u.correo === correo);

  if (usuario && usuario.captchaRequerido) {
    generarCaptchaImagen();
  } else {
    ocultarCaptcha();
  }
}

function generarCaptchaImagen() {
  const box = document.getElementById("captchaImagenBox");
  const pregunta = document.getElementById("captchaPregunta");
  const opciones = document.getElementById("captchaOpciones");

  captchaSeleccionado = "";

  const mezcladas = [...captchaImagenes].sort(() => Math.random() - 0.5).slice(0, 6);
  const correcta = mezcladas[Math.floor(Math.random() * mezcladas.length)];

  captchaRespuestaCorrecta = correcta.nombre;
  pregunta.textContent = correcta.nombre;

  opciones.innerHTML = "";

  mezcladas.forEach(item => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "captcha-card";
    card.innerHTML = `${item.icono}<span>${item.nombre}</span>`;

    card.addEventListener("click", () => {
      document.querySelectorAll(".captcha-card").forEach(c => c.classList.remove("selected"));
      card.classList.add("selected");
      captchaSeleccionado = item.nombre;
    });

    opciones.appendChild(card);
  });

  box.classList.remove("oculto");
}

function validarCaptchaImagen() {
  return captchaSeleccionado === captchaRespuestaCorrecta;
}

function ocultarCaptcha() {
  document.getElementById("captchaImagenBox").classList.add("oculto");
  document.getElementById("captchaOpciones").innerHTML = "";
  captchaRespuestaCorrecta = "";
  captchaSeleccionado = "";
}

// ===============================
// SESIÓN Y PANELES
// ===============================

function verificarSesion() {
  const sesion = JSON.parse(localStorage.getItem("sesionLoginSeguro"));

  const authContainer = document.getElementById("authContainer");
  const recoveryContainer = document.getElementById("recoveryContainer");
  const panelUsuario = document.getElementById("panelUsuario");
  const panelAdmin = document.getElementById("panelAdmin");

  if (!sesion) {
    authContainer.classList.remove("oculto");
    recoveryContainer.classList.add("oculto");
    panelUsuario.classList.add("oculto");
    panelAdmin.classList.add("oculto");
    return;
  }

  authContainer.classList.add("oculto");
  recoveryContainer.classList.add("oculto");

  if (sesion.rol === "admin") {
    panelAdmin.classList.remove("oculto");
    panelUsuario.classList.add("oculto");
    document.getElementById("adminInfo").textContent = `Sesión iniciada como: ${sesion.nombre} (${sesion.correo})`;
    cargarPanelAdmin();
  } else {
    panelUsuario.classList.remove("oculto");
    panelAdmin.classList.add("oculto");
    document.getElementById("usuarioInfo").textContent = `Bienvenido/a ${sesion.nombre} (${sesion.correo})`;
  }
}

function cerrarSesion() {
  localStorage.removeItem("sesionLoginSeguro");
  mostrarAlerta("Sesión cerrada correctamente.", "info");
  verificarSesion();
}

// ===============================
// PANEL ADMINISTRADOR
// ===============================

function cargarPanelAdmin() {
  const tabla = document.getElementById("tablaUsuarios");

  if (!tabla) return;

  const usuarios = obtenerUsuarios();
  tabla.innerHTML = "";

  usuarios.forEach(usuario => {
    actualizarDesbloqueoAutomatico(usuario, usuarios);
  });

  guardarUsuarios(usuarios);

  usuarios.forEach(usuario => {
    const fila = document.createElement("tr");

    const bloqueadoHasta = usuario.bloqueadoHasta ? formatearFecha(usuario.bloqueadoHasta) : "No aplica";

    fila.innerHTML = `
      <td>${usuario.nombre}</td>
      <td>${usuario.correo}</td>
      <td>${usuario.rol}</td>
      <td class="${usuario.estado === "ACTIVO" ? "estado-activo" : "estado-bloqueado"}">${usuario.estado}</td>
      <td>${usuario.intentosFallidos}</td>
      <td>${usuario.captchaRequerido ? "Sí" : "No"}</td>
      <td>${bloqueadoHasta}</td>
      <td>
        ${
          usuario.rol === "admin"
          ? "No aplica"
          : `<button class="btn-warning" onclick="desbloquearUsuario('${usuario.correo}')">Desbloquear</button>`
        }
      </td>
    `;

    tabla.appendChild(fila);
  });
}

function desbloquearUsuario(correo) {
  const usuarios = obtenerUsuarios();
  const usuario = usuarios.find(u => u.correo === correo);

  if (!usuario) {
    mostrarAlerta("Usuario no encontrado.", "error");
    return;
  }

  usuario.estado = "ACTIVO";
  usuario.intentosFallidos = 0;
  usuario.captchaRequerido = false;
  usuario.bloqueadoHasta = null;

  guardarUsuarios(usuarios);
  cargarPanelAdmin();

  mostrarAlerta("Usuario desbloqueado correctamente.", "success");
}

function formatearFecha(timestamp) {
  return new Date(timestamp).toLocaleString();
}
