# Sistema de Administración de Bibliotecas — Next.js
### Facultad de Ingeniería Los Mochis · Universidad Autónoma de Sinaloa

Prototipo funcional desarrollado con **Next.js (React)** para la materia
**Metodologías Tradicionales de Desarrollo de Software**. Administra el acervo de la
biblioteca y, de manera principal, el **módulo de préstamos de libros**.

---

## Requisitos previos

- **Node.js 18.18 o superior** (incluye npm). Descárgalo en https://nodejs.org

Para comprobar que lo tienes instalado, abre una terminal y ejecuta:

```bash
node --version
```

---

## Cómo ejecutarlo

1. Abre una terminal dentro de la carpeta del proyecto.
2. Instala las dependencias (solo la primera vez):

   ```bash
   npm install
   ```

3. Inicia el servidor de desarrollo:

   ```bash
   npm run dev
   ```

4. Abre tu navegador en **http://localhost:3000**

Para generar la versión optimizada de producción:

```bash
npm run build
npm start
```

---

## Funcionalidades

- **Inicio:** panel con estadísticas del acervo y préstamos activos recientes.
- **Préstamos** (módulo principal): registro de préstamos y devoluciones con control
  automático de la disponibilidad de ejemplares. Marca los préstamos vencidos.
- **Libros:** alta, consulta, edición, eliminación y búsqueda del acervo.
- **Usuarios:** alta, consulta, edición, eliminación y búsqueda de estudiantes.
- **Persistencia:** la información se conserva entre sesiones usando `localStorage`.
- **Reiniciar datos:** botón inferior izquierdo para volver a los datos de ejemplo.

El sistema inicia con datos de ejemplo para poder probarlo de inmediato.

---

## Estructura del proyecto

```
biblioteca-nextjs/
├── package.json            Dependencias y scripts
├── next.config.mjs         Configuración de Next.js
├── jsconfig.json           Alias de rutas
├── app/                    App Router (cada carpeta es una ruta)
│   ├── layout.js           Estructura común (proveedor + barra lateral)
│   ├── globals.css         Estilos globales
│   ├── page.js             Inicio (panel principal)
│   ├── prestamos/page.js   Módulo principal: préstamos y devoluciones
│   ├── libros/page.js      Gestión de libros
│   └── usuarios/page.js    Gestión de usuarios
├── components/
│   └── Sidebar.js          Barra lateral con navegación
└── lib/
    └── store.js            Contexto global: estado, lógica y persistencia
```

---

## Tecnologías

- **Next.js 14** (App Router) — framework de React.
- **React 18** — componentes e interfaz de usuario.
- **JavaScript** — lógica del sistema.
- **CSS** — diseño visual (globals.css).
- **localStorage** — almacenamiento persistente en el navegador.

---

## Arquitectura

La aplicación usa una arquitectura por capas del lado del cliente:

- **Presentación:** componentes y páginas de React (`app/`, `components/`).
- **Lógica de negocio:** contexto global `lib/store.js` (validaciones, préstamos, devoluciones).
- **Datos:** persistencia con `localStorage` en formato JSON.

El estado de libros, usuarios y préstamos se comparte entre todas las páginas mediante un
**Context de React** (`BibliotecaProvider`), que carga los datos al iniciar y los guarda
automáticamente en cada cambio.

---

## Metodología aplicada

El desarrollo siguió el **modelo en cascada (secuencial)**: requisitos → análisis → diseño →
programación → pruebas. Cada fase se completó antes de iniciar la siguiente.
