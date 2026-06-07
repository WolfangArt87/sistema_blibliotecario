"use client";

/* =====================================================================
   CONTEXTO DE LA BIBLIOTECA
   Maneja el estado global de la aplicación (libros, usuarios y
   préstamos), la lógica del negocio y la persistencia con localStorage.
   Reemplaza a los módulos almacenamiento/libros/usuarios/prestamos.
   ===================================================================== */

import { createContext, useContext, useEffect, useState, useCallback } from "react";

const CLAVE = "biblioteca_fim_uas";
const Contexto = createContext(null);

// ---------- utilidades ----------
const hoy = () => new Date().toISOString().slice(0, 10);
const sumarDias = (dias) => {
  const f = new Date();
  f.setDate(f.getDate() + parseInt(dias, 10));
  return f.toISOString().slice(0, 10);
};
const nuevoId = () => Date.now() + Math.floor(Math.random() * 1000);

// ---------- datos de ejemplo ----------
const datosEjemplo = () => ({
  libros: [
    { id: 1, titulo: "Cálculo de una variable", autor: "James Stewart", isbn: "978-607-526-117-9", ejemplares: 3, disponibles: 2 },
    { id: 2, titulo: "Fundamentos de bases de datos", autor: "Silberschatz, Korth", isbn: "978-844-816-840-3", ejemplares: 2, disponibles: 2 },
    { id: 3, titulo: "Ingeniería de software", autor: "Ian Sommerville", isbn: "978-607-323-238-8", ejemplares: 4, disponibles: 3 },
    { id: 4, titulo: "Física universitaria, Vol. 1", autor: "Sears, Zemansky", isbn: "978-607-442-288-7", ejemplares: 2, disponibles: 1 }
  ],
  usuarios: [
    { id: 1, nombre: "Ana López Ramírez", numeroCuenta: "2021030456" },
    { id: 2, nombre: "Carlos Medina Soto", numeroCuenta: "2022041122" },
    { id: 3, nombre: "Diana Rivera Castro", numeroCuenta: "2020019988" }
  ],
  prestamos: [
    { id: 1, idLibro: 1, idUsuario: 1, fechaPrestamo: "2025-05-20", fechaVence: "2025-05-27", fechaDevolucion: null, estado: "activo" },
    { id: 4, idLibro: 4, idUsuario: 2, fechaPrestamo: "2025-05-22", fechaVence: "2025-05-29", fechaDevolucion: null, estado: "activo" },
    { id: 3, idLibro: 3, idUsuario: 3, fechaPrestamo: "2025-05-10", fechaVence: "2025-05-17", fechaDevolucion: "2025-05-16", estado: "devuelto" }
  ]
});

export function BibliotecaProvider({ children }) {
  const [datos, setDatos] = useState(null); // null mientras carga (evita errores en SSR)

  // Cargar desde localStorage al iniciar
  useEffect(() => {
    let inicial;
    try {
      const guardado = localStorage.getItem(CLAVE);
      inicial = guardado ? JSON.parse(guardado) : datosEjemplo();
    } catch {
      inicial = datosEjemplo();
    }
    setDatos(inicial);
  }, []);

  // Guardar en localStorage en cada cambio
  useEffect(() => {
    if (datos) localStorage.setItem(CLAVE, JSON.stringify(datos));
  }, [datos]);

  // ---------- helpers de consulta ----------
  const obtenerLibro = useCallback((id) => datos?.libros.find((l) => l.id === id), [datos]);
  const obtenerUsuario = useCallback((id) => datos?.usuarios.find((u) => u.id === id), [datos]);
  const prestamosActivosDe = useCallback(
    (idUsuario) => (datos?.prestamos.filter((p) => p.idUsuario === idUsuario && p.estado === "activo").length) || 0,
    [datos]
  );
  const estaVencido = useCallback(
    (p) => p.estado === "activo" && p.fechaVence < hoy(),
    []
  );

  // ---------- acciones: LIBROS ----------
  const guardarLibro = (entrada) => {
    const titulo = entrada.titulo.trim();
    const autor = entrada.autor.trim();
    const isbn = entrada.isbn.trim();
    const ejemplares = parseInt(entrada.ejemplares, 10);

    if (!titulo || !autor) return { ok: false, msg: "El título y el autor son obligatorios." };
    if (isNaN(ejemplares) || ejemplares < 1) return { ok: false, msg: "Debe haber al menos un ejemplar." };

    if (entrada.id) {
      const libro = obtenerLibro(entrada.id);
      if (!libro) return { ok: false, msg: "El libro no existe." };
      const prestados = libro.ejemplares - libro.disponibles;
      if (ejemplares < prestados)
        return { ok: false, msg: `No puede haber menos de ${prestados} ejemplares: hay ${prestados} prestados.` };
      setDatos((d) => ({
        ...d,
        libros: d.libros.map((l) =>
          l.id === entrada.id
            ? { ...l, titulo, autor, isbn, ejemplares, disponibles: ejemplares - (l.ejemplares - l.disponibles) }
            : l
        ),
      }));
    } else {
      setDatos((d) => ({
        ...d,
        libros: [...d.libros, { id: nuevoId(), titulo, autor, isbn, ejemplares, disponibles: ejemplares }],
      }));
    }
    return { ok: true };
  };

  const eliminarLibro = (id) => {
    const activo = datos.prestamos.some((p) => p.idLibro === id && p.estado === "activo");
    if (activo) return { ok: false, msg: "No se puede eliminar: el libro tiene préstamos activos." };
    setDatos((d) => ({ ...d, libros: d.libros.filter((l) => l.id !== id) }));
    return { ok: true };
  };

  // ---------- acciones: USUARIOS ----------
  const guardarUsuario = (entrada) => {
    const nombre = entrada.nombre.trim();
    const numeroCuenta = entrada.numeroCuenta.trim();
    if (!nombre || !numeroCuenta) return { ok: false, msg: "El nombre y el número de cuenta son obligatorios." };

    const duplicado = datos.usuarios.find((u) => u.numeroCuenta === numeroCuenta && u.id !== entrada.id);
    if (duplicado) return { ok: false, msg: "Ya existe un usuario con ese número de cuenta." };

    if (entrada.id) {
      setDatos((d) => ({
        ...d,
        usuarios: d.usuarios.map((u) => (u.id === entrada.id ? { ...u, nombre, numeroCuenta } : u)),
      }));
    } else {
      setDatos((d) => ({ ...d, usuarios: [...d.usuarios, { id: nuevoId(), nombre, numeroCuenta }] }));
    }
    return { ok: true };
  };

  const eliminarUsuario = (id) => {
    const activo = datos.prestamos.some((p) => p.idUsuario === id && p.estado === "activo");
    if (activo) return { ok: false, msg: "No se puede eliminar: el usuario tiene préstamos activos." };
    setDatos((d) => ({ ...d, usuarios: d.usuarios.filter((u) => u.id !== id) }));
    return { ok: true };
  };

  // ---------- acciones: PRÉSTAMOS (módulo principal) ----------
  const registrarPrestamo = (idLibro, idUsuario, dias) => {
    const libro = obtenerLibro(idLibro);
    const usuario = obtenerUsuario(idUsuario);
    if (!libro || !usuario) return { ok: false, msg: "Selecciona un libro y un usuario válidos." };
    if (libro.disponibles <= 0) return { ok: false, msg: `No hay ejemplares disponibles de "${libro.titulo}".` };

    setDatos((d) => ({
      ...d,
      libros: d.libros.map((l) => (l.id === idLibro ? { ...l, disponibles: l.disponibles - 1 } : l)),
      prestamos: [
        ...d.prestamos,
        {
          id: nuevoId(),
          idLibro,
          idUsuario,
          fechaPrestamo: hoy(),
          fechaVence: sumarDias(dias),
          fechaDevolucion: null,
          estado: "activo",
        },
      ],
    }));
    return { ok: true, msg: `Préstamo registrado: "${libro.titulo}" para ${usuario.nombre}.` };
  };

  const devolver = (idPrestamo) => {
    const prestamo = datos.prestamos.find((p) => p.id === idPrestamo);
    if (!prestamo || prestamo.estado !== "activo") return { ok: false, msg: "El préstamo no existe o ya fue devuelto." };
    setDatos((d) => ({
      ...d,
      prestamos: d.prestamos.map((p) =>
        p.id === idPrestamo ? { ...p, estado: "devuelto", fechaDevolucion: hoy() } : p
      ),
      libros: d.libros.map((l) =>
        l.id === prestamo.idLibro && l.disponibles < l.ejemplares ? { ...l, disponibles: l.disponibles + 1 } : l
      ),
    }));
    return { ok: true, msg: "Devolución registrada correctamente." };
  };

  const reiniciar = () => setDatos(datosEjemplo());

  const valor = {
    datos,
    obtenerLibro, obtenerUsuario, prestamosActivosDe, estaVencido,
    guardarLibro, eliminarLibro,
    guardarUsuario, eliminarUsuario,
    registrarPrestamo, devolver,
    reiniciar,
  };

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useBiblioteca() {
  return useContext(Contexto);
}

// Da formato a una fecha YYYY-MM-DD -> DD/MM/AAAA
export function fmtFecha(f) {
  if (!f) return "—";
  const [a, m, d] = f.split("-");
  return `${d}/${m}/${a}`;
}
