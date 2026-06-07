"use client";

import { useState } from "react";
import { useBiblioteca, fmtFecha } from "../../lib/store";

export default function Prestamos() {
  const ctx = useBiblioteca();
  const [idLibro, setIdLibro] = useState("");
  const [idUsuario, setIdUsuario] = useState("");
  const [dias, setDias] = useState(7);
  const [aviso, setAviso] = useState({ texto: "", tipo: "" });

  if (!ctx?.datos) return <p className="cargando">Cargando…</p>;
  const { datos, obtenerLibro, obtenerUsuario, estaVencido, registrarPrestamo, devolver } = ctx;

  const mostrar = (texto, tipo) => {
    setAviso({ texto, tipo });
    setTimeout(() => setAviso({ texto: "", tipo: "" }), 4000);
  };

  const disponibles = datos.libros.filter((l) => l.disponibles > 0);
  const activos = datos.prestamos.filter((p) => p.estado === "activo");
  const historial = [...datos.prestamos].reverse();

  const onPrestar = () => {
    const libroSel = idLibro || (disponibles[0] && String(disponibles[0].id));
    const usuarioSel = idUsuario || (datos.usuarios[0] && String(datos.usuarios[0].id));
    if (!libroSel || !usuarioSel) return mostrar("Selecciona un libro y un usuario.", "error");
    const r = registrarPrestamo(Number(libroSel), Number(usuarioSel), dias);
    mostrar(r.msg, r.ok ? "ok" : "error");
  };

  const onDevolver = (id) => {
    const r = devolver(id);
    mostrar(r.msg, r.ok ? "ok" : "error");
  };

  return (
    <>
      <header className="encabezado">
        <h1>Préstamos de libros</h1>
        <p>Módulo principal: registra préstamos y devoluciones del acervo.</p>
      </header>

      <div className="panel">
        <h2>Registrar nuevo préstamo</h2>
        <div className="form-grid">
          <label>Libro
            <select value={idLibro} onChange={(e) => setIdLibro(e.target.value)}>
              {disponibles.length ? (
                disponibles.map((l) => <option key={l.id} value={l.id}>{l.titulo} ({l.disponibles} disp.)</option>)
              ) : (
                <option value="">— Sin libros disponibles —</option>
              )}
            </select>
          </label>
          <label>Usuario
            <select value={idUsuario} onChange={(e) => setIdUsuario(e.target.value)}>
              {datos.usuarios.length ? (
                datos.usuarios.map((u) => <option key={u.id} value={u.id}>{u.nombre} · {u.numeroCuenta}</option>)
              ) : (
                <option value="">— Sin usuarios —</option>
              )}
            </select>
          </label>
          <label>Días de préstamo
            <input type="number" min={1} max={60} value={dias} onChange={(e) => setDias(e.target.value)} />
          </label>
          <div className="form-accion">
            <button className="btn" onClick={onPrestar}>Registrar préstamo</button>
          </div>
        </div>
        {aviso.texto && <p className={"aviso " + aviso.tipo}>{aviso.texto}</p>}
      </div>

      <div className="panel">
        <div className="panel-head">
          <h2>Préstamos activos</h2>
          <span className="contador">{activos.length}</span>
        </div>
        <div className="tabla-cont">
          <table>
            <thead><tr><th>Libro</th><th>Usuario</th><th>Préstamo</th><th>Vence</th><th></th></tr></thead>
            <tbody>
              {activos.length ? activos.map((p) => {
                const l = obtenerLibro(p.idLibro);
                const u = obtenerUsuario(p.idUsuario);
                return (
                  <tr key={p.id}>
                    <td>{l ? l.titulo : "—"}</td>
                    <td>{u ? u.nombre : "—"}</td>
                    <td>{fmtFecha(p.fechaPrestamo)}</td>
                    <td>{fmtFecha(p.fechaVence)} {estaVencido(p) && <span className="badge badge-vencido">vencido</span>}</td>
                    <td><div className="acciones"><button className="btn-mini primario" onClick={() => onDevolver(p.id)}>Devolver</button></div></td>
                  </tr>
                );
              }) : <tr><td colSpan={5} className="vacio">No hay préstamos activos.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <div className="panel">
        <h2>Historial de préstamos</h2>
        <div className="tabla-cont">
          <table>
            <thead><tr><th>Libro</th><th>Usuario</th><th>Préstamo</th><th>Devolución</th><th>Estado</th></tr></thead>
            <tbody>
              {historial.length ? historial.map((p) => {
                const l = obtenerLibro(p.idLibro);
                const u = obtenerUsuario(p.idUsuario);
                return (
                  <tr key={p.id}>
                    <td>{l ? l.titulo : "—"}</td>
                    <td>{u ? u.nombre : "—"}</td>
                    <td>{fmtFecha(p.fechaPrestamo)}</td>
                    <td>{fmtFecha(p.fechaDevolucion)}</td>
                    <td>{p.estado === "activo"
                      ? <span className="badge badge-ok">activo</span>
                      : <span className="badge badge-dev">devuelto</span>}</td>
                  </tr>
                );
              }) : <tr><td colSpan={5} className="vacio">Sin registros.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
