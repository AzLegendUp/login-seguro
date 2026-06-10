const express = require("express");
const nodemailer = require("nodemailer");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Guarda códigos temporalmente en memoria.
// En un sistema real se debe guardar en base de datos con expiración.
const codigosRecuperacion = new Map();

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

function crearCodigo() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function crearTransporter() {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (!emailUser || !emailPass) {
    return null;
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: emailUser,
      pass: emailPass
    }
  });
}

app.post("/api/recuperacion/enviar-codigo", async (req, res) => {
  const correo = String(req.body.correo || "").trim().toLowerCase();

  if (!correo || !/^\S+@\S+\.\S+$/.test(correo)) {
    return res.status(400).json({
      ok: false,
      mensaje: "Correo electrónico inválido."
    });
  }

  const codigo = crearCodigo();
  const expiraEn = Date.now() + 10 * 60 * 1000; // 10 minutos

  codigosRecuperacion.set(correo, {
    codigo,
    expiraEn
  });

  const modoDesarrollo = process.env.DEV_MODE === "true";
  const transporter = crearTransporter();

  if (modoDesarrollo || !transporter) {
    console.log("====================================");
    console.log(`Código de recuperación para ${correo}: ${codigo}`);
    console.log("====================================");

    return res.json({
      ok: true,
      mensaje: "Código generado en modo desarrollo.",
      codigoDesarrollo: codigo
    });
  }

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: correo,
      subject: "Código de recuperación de contraseña",
      text: `Su código de recuperación es: ${codigo}. Este código vence en 10 minutos.`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>Recuperación de contraseña</h2>
          <p>Su código de recuperación es:</p>
          <h1 style="letter-spacing: 4px;">${codigo}</h1>
          <p>Este código vence en 10 minutos.</p>
          <p>Si usted no solicitó este código, ignore este mensaje.</p>
        </div>
      `
    });

    res.json({
      ok: true,
      mensaje: "Código enviado correctamente."
    });
  } catch (error) {
    console.error("Error enviando correo:", error);

    res.status(500).json({
      ok: false,
      mensaje: "No se pudo enviar el correo. Revise EMAIL_USER, EMAIL_PASS y la contraseña de aplicación."
    });
  }
});

app.post("/api/recuperacion/verificar-codigo", (req, res) => {
  const correo = String(req.body.correo || "").trim().toLowerCase();
  const codigo = String(req.body.codigo || "").trim();

  const registro = codigosRecuperacion.get(correo);

  if (!registro) {
    return res.status(400).json({
      ok: false,
      mensaje: "No existe un código activo para este correo."
    });
  }

  if (Date.now() > registro.expiraEn) {
    codigosRecuperacion.delete(correo);

    return res.status(400).json({
      ok: false,
      mensaje: "El código expiró. Solicite uno nuevo."
    });
  }

  if (registro.codigo !== codigo) {
    return res.status(400).json({
      ok: false,
      mensaje: "Código incorrecto."
    });
  }

  codigosRecuperacion.delete(correo);

  res.json({
    ok: true,
    mensaje: "Código verificado correctamente."
  });
});

app.listen(PORT, () => {
  console.log(`Servidor iniciado en http://localhost:${PORT}`);
});
