# Login Seguro con Recuperación de Contraseña

Este proyecto es una aplicación web desarrollada con **HTML, CSS, JavaScript, Node.js, Express y Nodemailer**. Simula un sistema de inicio de sesión seguro con registro de usuarios, validación de contraseña fuerte, CAPTCHA, control de intentos fallidos, bloqueo temporal, panel administrador y recuperación de contraseña por código enviado al correo.

## Características principales

- Registro de usuarios.
- Inicio de sesión seguro.
- Validación de contraseña fuerte.
- Checkbox de verificación: “Soy humano”.
- CAPTCHA de imagen simulado.
- Control de intentos fallidos.
- Activación de CAPTCHA después de varios intentos incorrectos.
- Bloqueo temporal después de 5 intentos fallidos.
- Desbloqueo automático después del tiempo configurado.
- Panel administrador para ver y desbloquear usuarios.
- Recuperación de contraseña con código de 6 dígitos.
- Envío de código por correo usando Node.js, Express y Nodemailer.
- Almacenamiento local de usuarios usando `localStorage`.

## Tecnologías utilizadas

- HTML5
- CSS3
- JavaScript
- LocalStorage
- Node.js
- Express
- Nodemailer
- dotenv

## Estructura del proyecto

```txt
login-seguro-recuperacion/
│
├── public/
│   ├── index.html
│   ├── styles.css
│   └── script.js
│
├── server.js
├── package.json
├── .env.example
├── .gitignore
└── README.md
```

## Usuario administrador de prueba

```txt
Correo: admin@demo.com
Contraseña: Admin@123
```

## Reglas de seguridad implementadas

La contraseña debe cumplir con:

```txt
Mínimo 8 caracteres
Al menos una letra mayúscula
Al menos una letra minúscula
Al menos un número
Al menos un carácter especial
```

Ejemplo:

```txt
David@2026
```

## Funcionamiento de recuperación de contraseña

1. El usuario presiona **¿Olvidaste tu contraseña?**
2. Ingresa el correo registrado.
3. El sistema solicita al servidor local un código de recuperación.
4. El servidor genera un código de 6 dígitos.
5. El código se envía por correo electrónico usando Nodemailer.
6. El usuario ingresa el código recibido.
7. El sistema permite crear una nueva contraseña.
8. Se reinician intentos fallidos, CAPTCHA y bloqueo.

## Instalación

Primero instala Node.js en tu computadora.

Luego abre la terminal dentro de la carpeta del proyecto y ejecuta:

```bash
npm install
```

Copia el archivo `.env.example` y renómbralo a `.env`.

En Windows puedes hacerlo manualmente o con:

```bash
copy .env.example .env
```

En Linux o Mac:

```bash
cp .env.example .env
```

## Modo rápido para probar sin correo real

En el archivo `.env`, deja:

```txt
DEV_MODE=true
```

Luego inicia el servidor:

```bash
npm start
```

Abre el navegador en:

```txt
http://localhost:3000
```

Cuando solicites recuperación, el código aparecerá en la consola y también en pantalla como modo desarrollo.

## Modo con correo real usando Gmail

En el archivo `.env`, coloca:

```txt
DEV_MODE=false
EMAIL_USER=tu_correo@gmail.com
EMAIL_PASS=tu_contrasena_de_aplicacion
EMAIL_FROM=tu_correo@gmail.com
```

Importante: no uses tu contraseña normal de Gmail. Usa una **contraseña de aplicación**.

Después ejecuta:

```bash
npm start
```

Y abre:

```txt
http://localhost:3000
```

## Capturas de pantalla

### 1. Pantalla principal

Agrega aquí la captura:

```md
![Pantalla principal](img/pantalla-principal.png)
```

### 2. Recuperación de contraseña

Agrega aquí la captura:

```md
![Recuperación de contraseña](img/recuperacion-password.png)
```

### 3. Código recibido por correo

Agrega aquí la captura:

```md
![Código recibido](img/codigo-correo.png)
```

### 4. Cambio de contraseña

Agrega aquí la captura:

```md
![Cambio de contraseña](img/cambio-password.png)
```

### 5. Panel administrador

Agrega aquí la captura:

```md
![Panel administrador](img/panel-admin.png)
```

## Nota importante

Este proyecto es una simulación académica. Aunque el código de recuperación sí puede enviarse por correo usando un servidor local, los usuarios se siguen almacenando en `localStorage`.

En un sistema real, los usuarios, contraseñas, códigos de recuperación, bloqueos e intentos fallidos deben guardarse en una base de datos y validarse desde el backend. También se recomienda usar algoritmos seguros como `bcrypt` o `Argon2` para proteger contraseñas.

## Autor

**David Freddy Coello Cherrez**

## Estado del proyecto

Proyecto académico funcional para demostrar validaciones de seguridad, recuperación de contraseña y envío de código por correo desde servidor local.
