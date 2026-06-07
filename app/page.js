"use client";

import { useBiblioteca, fmtFecha } from "../lib/store";

export default function Inicio() {
  const ctx = useBiblioteca();
  if (!ctx?.datos) return <p className="cargando">Cargando…</p>;

  const { datos, obtenerLibro, obtenerUsuario, estaVencido } = ctx;
  const disponibles = datos.libros.reduce((s, l) => s + l.disponibles, 0);
  const activos = datos.prestamos.filter((p) => p.estado === "activo");

  return (
    <>
      <header className="encabezado">
        <h1>Panel principal</h1>
        <p>Resumen del acervo y de la actividad de préstamos.</p>
      </header>

      <div className="tarjetas">
        <div className="tarjeta"><span className="t-num">{datos.libros.length}</span><span className="t-lbl">Títulos en el acervo</span></div>
        <div className="tarjeta"><span className="t-num">{disponibles}</span><span className="t-lbl">Ejemplares disponibles</span></div>
        <div className="tarjeta"><span className="t-num">{activos.length}</span><span className="t-lbl">Préstamos activos</span></div>
        <div className="tarjeta"><span className="t-num">{datos.usuarios.length}</span><span className="t-lbl">Usuarios registrados</span></div>
      </div>

      <div className="panel">
        <h2>Préstamos activos recientes</h2>
        <div className="tabla-cont">
          <table>
            <thead>
              <tr><th>Libro</th><th>Usuario</th><th>Fecha préstamo</th><th>Vence</th></tr>
            </thead>
            <tbody>
              {activos.length === 0 ? (
                <tr><td colSpan={4} className="vacio">Sin préstamos activos.</td></tr>
              ) : (
                activos.slice(0, 5).map((p) => {
                  const libro = obtenerLibro(p.idLibro);
                  const us = obtenerUsuario(p.idUsuario);
                  return (
                    <tr key={p.id}>
                      <td>{libro ? libro.titulo : "—"}</td>
                      <td>{us ? us.nombre : "—"}</td>
                      <td>{fmtFecha(p.fechaPrestamo)}</td>
                      <td>
                        {fmtFecha(p.fechaVence)}{" "}
                        {estaVencido(p) && <span className="badge badge-vencido">vencido</span>}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
