"use client";

import { useState } from "react";
import { useBiblioteca } from "../../lib/store";

const vacio = { id: null, nombre: "", numeroCuenta: "" };

export default function UsuariosPage() {
  const ctx = useBiblioteca();
  const [form, setForm] = useState(vacio);
  const [busqueda, setBusqueda] = useState("");
  const [aviso, setAviso] = useState({ texto: "", tipo: "" });

  if (!ctx?.datos) return <p className="cargando">Cargando…</p>;
  const { datos, guardarUsuario, eliminarUsuario, prestamosActivosDe } = ctx;

  const mostrar = (texto, tipo) => {
    setAviso({ texto, tipo });
    setTimeout(() => setAviso({ texto: "", tipo: "" }), 4000);
  };

  const cambiar = (campo) => (e) => setForm({ ...form, [campo]: e.target.value });

  const onGuardar = () => {
    const r = guardarUsuario(form);
    if (r.ok) { setForm(vacio); mostrar("Usuario guardado correctamente.", "ok"); }
    else mostrar(r.msg, "error");
  };

  const onEditar = (u) => setForm({ id: u.id, nombre: u.nombre, numeroCuenta: u.numeroCuenta });

  const onEliminar = (id) => {
    if (!confirm("¿Eliminar este usuario?")) return;
    const r = eliminarUsuario(id);
    mostrar(r.ok ? "Usuario eliminado." : r.msg, r.ok ? "ok" : "error");
  };

  const t = busqueda.toLowerCase().trim();
  const lista = t
    ? datos.usuarios.filter((u) => u.nombre.toLowerCase().includes(t) || u.numeroCuenta.toLowerCase().includes(t))
    : datos.usuarios;

  return (
    <>
      <header className="encabezado">
        <h1>Usuarios</h1>
        <p>Estudiantes registrados que pueden solicitar préstamos.</p>
      </header>

      <div className="panel">
        <h2>{form.id ? "Editar usuario" : "Registrar usuario"}</h2>
        <div className="form-grid">
          <label>Nombre completo
            <input type="text" value={form.nombre} onChange={cambiar("nombre")} placeholder="Ej. Ana López Ramírez" />
          </label>
          <label>Número de cuenta
            <input type="text" value={form.numeroCuenta} onChange={cambiar("numeroCuenta")} placeholder="Ej. 2021030456" />
          </label>
          <div className="form-accion">
            <button className="btn" onClick={onGuardar}>Guardar</button>
            {form.id && <button className="btn-ghost" onClick={() => setForm(vacio)}>Cancelar</button>}
          </div>
        </div>
        {aviso.texto && <p className={"aviso " + aviso.tipo}>{aviso.texto}</p>}
      </div>

      <div className="panel">
        <div className="panel-head">
          <h2>Usuarios registrados</h2>
          <input className="buscador" type="search" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar por nombre o cuenta…" />
        </div>
        <div className="tabla-cont">
          <table>
            <thead><tr><th>Nombre</th><th>Número de cuenta</th><th>Préstamos activos</th><th></th></tr></thead>
            <tbody>
              {lista.length ? lista.map((u) => (
                <tr key={u.id}>
                  <td>{u.nombre}</td>
                  <td>{u.numeroCuenta}</td>
                  <td>{prestamosActivosDe(u.id)}</td>
                  <td><div className="acciones">
                    <button className="btn-mini" onClick={() => onEditar(u)}>Editar</button>
                    <button className="btn-mini peligro" onClick={() => onEliminar(u.id)}>Eliminar</button>
                  </div></td>
                </tr>
              )) : <tr><td colSpan={4} className="vacio">No hay usuarios que coincidan.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
