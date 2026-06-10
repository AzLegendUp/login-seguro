# Login Seguro con Recuperación de Contraseña

Este proyecto es una aplicación web desarrollada con **HTML, CSS, JavaScript, Node.js, Express y Nodemailer**. Simula un sistema de inicio de sesión seguro con registro de usuarios, validación de contraseña fuerte, CAPTCHA, control de intentos fallidos, bloqueo temporal, panel administrador y recuperación de contraseña mediante un código enviado al correo electrónico.

## Características principales

* Registro de usuarios.
* Inicio de sesión seguro.
* Validación de contraseña fuerte.
* Checkbox de verificación: “Soy humano”.
* CAPTCHA de imagen simulado.
* Control de intentos fallidos.
* Activación de CAPTCHA después de varios intentos incorrectos.
* Bloqueo temporal después de 5 intentos fallidos.
* Desbloqueo automático después del tiempo configurado.
* Panel administrador para ver usuarios registrados.
* Panel administrador para desbloquear usuarios.
* Recuperación de contraseña con código de 6 dígitos.
* Envío de código por correo usando Node.js, Express y Nodemailer.
* Almacenamiento local de usuarios usando `localStorage`.

## Tecnologías utilizadas

* HTML5
* CSS3
* JavaScript
* LocalStorage
* Node.js
* Express
* Nodemailer
* dotenv

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
├── package-lock.json
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

El sistema valida que la contraseña cumpla con las siguientes condiciones:

```txt
Mínimo 8 caracteres
Al menos una letra mayúscula
Al menos una letra minúscula
Al menos un número
Al menos un carácter especial
```

Ejemplo de contraseña válida:

```txt
David@2026
```

## Funcionamiento general del sistema

El usuario puede registrarse ingresando su nombre, correo electrónico y contraseña. Luego puede iniciar sesión usando sus credenciales.

Durante el inicio de sesión, el sistema realiza las siguientes validaciones:

1. Verifica que los campos no estén vacíos.
2. Comprueba que el usuario exista.
3. Valida que el usuario no esté bloqueado.
4. Verifica que se haya marcado la opción “Soy humano”.
5. Comprueba la contraseña ingresada.
6. Activa CAPTCHA si el usuario acumula varios intentos fallidos.
7. Bloquea temporalmente al usuario después de 5 intentos fallidos.
8. Permite desbloquear usuarios desde el panel administrador.

## Control de intentos fallidos

| Intentos fallidos | Acción del sistema                  |
| ----------------- | ----------------------------------- |
| 1 intento         | Muestra mensaje de error            |
| 2 intentos        | Advierte intentos restantes         |
| 3 intentos        | Activa CAPTCHA obligatorio          |
| 4 intentos        | Mantiene CAPTCHA y advierte bloqueo |
| 5 intentos        | Bloquea temporalmente al usuario    |

## Bloqueo y desbloqueo

Cuando un usuario llega a 5 intentos fallidos, el sistema cambia su estado a:

```txt
BLOQUEADO_TEMPORAL
```

Después del tiempo configurado, el sistema puede desbloquear automáticamente al usuario.

El administrador también puede desbloquear al usuario manualmente desde el panel administrador, reiniciando:

```txt
Intentos fallidos = 0
CAPTCHA requerido = No
Estado = ACTIVO
Bloqueado hasta = null
```

## Funcionamiento de recuperación de contraseña

El sistema permite recuperar la contraseña mediante un código enviado al correo electrónico del usuario.

El proceso funciona de la siguiente manera:

1. El usuario presiona **¿Olvidaste tu contraseña?**
2. Ingresa el correo registrado.
3. El sistema solicita al servidor local un código de recuperación.
4. El servidor genera un código de 6 dígitos.
5. El código se envía por correo electrónico usando Nodemailer.
6. El usuario ingresa el código recibido.
7. El sistema permite crear una nueva contraseña.
8. Se reinician los intentos fallidos, CAPTCHA y bloqueo.

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

## Configuración del archivo .env

El archivo `.env` permite configurar el servidor y el correo electrónico.

Ejemplo:

```env
PORT=3000

DEV_MODE=true

EMAIL_USER=tu_correo@gmail.com
EMAIL_PASS=tu_contrasena_de_aplicacion
EMAIL_FROM=tu_correo@gmail.com
```

## Modo rápido para probar sin correo real

Para probar sin enviar correos reales, deja en el archivo `.env`:

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

Cuando solicites recuperación de contraseña, el código aparecerá en la consola del servidor y también en pantalla como modo desarrollo.

## Modo con correo real usando Gmail

Para enviar el código al correo real, en el archivo `.env` coloca:

```txt
DEV_MODE=false
EMAIL_USER=tu_correo@gmail.com
EMAIL_PASS=tu_contrasena_de_aplicacion
EMAIL_FROM=tu_correo@gmail.com
```

Importante: no uses tu contraseña normal de Gmail. Usa una **contraseña de aplicación** generada desde la cuenta de Google.

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

<p align="center">
  <img width="800" alt="Pantalla principal" src="https://github.com/user-attachments/assets/6293a980-e838-403b-8e80-a84840e4287f" />
</p>

### 2. Registro de usuario


<p align="center">
  <img width="555" height="648" alt="image" src="https://github.com/user-attachments/assets/2067dee0-13b2-43a5-a5c5-dc215dee90df" />
  
</p>

### 3. Validación de contraseña segura


<p align="center">
  <img width="541" height="405" alt="image" src="https://github.com/user-attachments/assets/d739b601-e8fd-403b-b865-de663b42f382" />
  <img width="549" height="402" alt="image" src="https://github.com/user-attachments/assets/890f661a-9988-4800-aabd-d7811a303074" />

</p>

### 4. Inicio de sesión


<p align="center">
  <img width="578" height="663" alt="image" src="https://github.com/user-attachments/assets/48ea70c1-877d-4210-a566-130e0df1eb5b" />

</p>

### 5. CAPTCHA activado

<p align="center">
  <img width="1191" height="872" alt="image" src="https://github.com/user-attachments/assets/dd1155a9-a998-41d8-8bc6-2ba6c485f9cb" />

</p>

### 6. Usuario bloqueado


<p align="center">
  <img width="1208" height="890" alt="image" src="https://github.com/user-attachments/assets/80404167-7017-4457-9c5a-3046ecfa10cc" />

</p>

### 7. Recuperación de contraseña

<p align="center">
  <img width="656" height="381" alt="image" src="https://github.com/user-attachments/assets/82567021-312c-4985-a891-0db6062837b8" />
  <img width="1215" height="783" alt="image" src="https://github.com/user-attachments/assets/c19f6e01-5000-4003-b061-c5f88599e31c" />

</p>

### 8. Código recibido por correo


<p align="center">
  <img width="1919" height="792" alt="image" src="https://github.com/user-attachments/assets/2daf8167-d7b4-4697-8532-47d955560c9e" />

</p>

### 9. Cambio de contraseña


<p align="center">
  <img width="685" height="667" alt="image" src="https://github.com/user-attachments/assets/e1a3d2a9-39a4-4e38-909c-29756e479bde" />

</p>

### 10. Panel de usuario


<p align="center">
  <img width="1264" height="523" alt="image" src="https://github.com/user-attachments/assets/87b2868b-f672-4af7-b8b1-c67939dda721" />

</p>

### 11. Panel administrador


<p align="center">
 <img width="1217" height="549" alt="image" src="https://github.com/user-attachments/assets/e91c8802-fe11-47da-981c-c3355c5f252c" />

</p>

## Funcionalidades demostradas

### Registro de usuario

El sistema permite crear una cuenta ingresando nombre, correo electrónico y contraseña. Antes de registrar al usuario, valida que la contraseña cumpla las reglas de seguridad.

### Inicio de sesión

El usuario puede iniciar sesión con el correo y contraseña registrados. El sistema verifica la cuenta, el estado del usuario, la contraseña y la opción “Soy humano”.

### Validación de contraseña

El sistema muestra reglas visuales que indican si la contraseña cumple con longitud mínima, mayúsculas, minúsculas, números y caracteres especiales.

### CAPTCHA

El CAPTCHA se activa después de varios intentos fallidos. El usuario debe seleccionar la imagen solicitada para continuar con el inicio de sesión.

### Bloqueo temporal

Después de 5 intentos fallidos, el usuario queda bloqueado temporalmente. Durante ese tiempo no puede iniciar sesión.

### Desbloqueo automático

Cuando termina el tiempo de bloqueo, el sistema puede permitir nuevamente el acceso al usuario.

### Desbloqueo por administrador

El administrador puede ingresar al panel administrativo y desbloquear manualmente a los usuarios bloqueados.

### Recuperación de contraseña

El usuario puede solicitar un código de recuperación al correo registrado. Luego ingresa el código recibido y crea una nueva contraseña.

### Envío de código por correo

El servidor local utiliza Node.js, Express y Nodemailer para enviar el código de recuperación al correo electrónico.


## Cómo ejecutar el proyecto

Ejecuta el servidor local:

```bash
npm start
```

Luego abre en el navegador:

```txt
http://localhost:3000
```

## Cómo subir el proyecto a GitHub

Inicializar Git:

```bash
git init
```

Agregar archivos:

```bash
git add .
```

Crear commit:

```bash
git commit -m "Primer commit del login seguro con recuperacion"
```

Cambiar rama a main:

```bash
git branch -M main
```

Conectar repositorio remoto:

```bash
git remote add origin https://github.com/TU-USUARIO/login-seguro.git
```

Subir proyecto:

```bash
git push -u origin main
```

Si vas a reemplazar el contenido de un repositorio anterior, puedes usar:

```bash
git push -u origin main --force
```

## Seguridad del archivo .env

No subas el archivo `.env` a GitHub porque contiene información privada.

El archivo `.gitignore` debe incluir:

```txt
node_modules/
.env
.DS_Store
```

En GitHub solo debe quedar un archivo de ejemplo como `.env.example`.

## Nota importante

Este proyecto es una simulación académica de un sistema de login seguro. Aunque el sistema puede enviar códigos reales al correo mediante un servidor local con Node.js, los usuarios se almacenan en `localStorage`.

En un sistema real, los usuarios, contraseñas, códigos de recuperación, bloqueos e intentos fallidos deben guardarse en una base de datos y validarse desde el backend. También se recomienda usar algoritmos seguros como `bcrypt` o `Argon2` para proteger contraseñas.

## Autor

**David Freddy Coello Cherrez**

## Estado del proyecto

Proyecto académico funcional para demostrar validaciones de seguridad, recuperación de contraseña y envío de código por correo desde servidor local.
