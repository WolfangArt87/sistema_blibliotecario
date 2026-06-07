"use client";

import { useState } from "react";
import { useBiblioteca } from "../../lib/store";

const vacio = { id: null, titulo: "", autor: "", isbn: "", ejemplares: 1 };

export default function Libros() {
  const ctx = useBiblioteca();
  const [form, setForm] = useState(vacio);
  const [busqueda, setBusqueda] = useState("");
  const [aviso, setAviso] = useState({ texto: "", tipo: "" });

  if (!ctx?.datos) return <p className="cargando">Cargando…</p>;
  const { datos, guardarLibro, eliminarLibro } = ctx;

  const mostrar = (texto, tipo) => {
    setAviso({ texto, tipo });
    setTimeout(() => setAviso({ texto: "", tipo: "" }), 4000);
  };

  const cambiar = (campo) => (e) => setForm({ ...form, [campo]: e.target.value });

  const onGuardar = () => {
    const r = guardarLibro(form);
    if (r.ok) { setForm(vacio); mostrar("Libro guardado correctamente.", "ok"); }
    else mostrar(r.msg, "error");
  };

  const onEditar = (l) => setForm({ id: l.id, titulo: l.titulo, autor: l.autor, isbn: l.isbn, ejemplares: l.ejemplares });

  const onEliminar = (id) => {
    if (!confirm("¿Eliminar este libro del acervo?")) return;
    const r = eliminarLibro(id);
    mostrar(r.ok ? "Libro eliminado." : r.msg, r.ok ? "ok" : "error");
  };

  const t = busqueda.toLowerCase().trim();
  const lista = t
    ? datos.libros.filter((l) => l.titulo.toLowerCase().includes(t) || l.autor.toLowerCase().includes(t))
    : datos.libros;

  return (
    <>
      <header className="encabezado">
        <h1>Acervo de libros</h1>
        <p>Alta, consulta, edición y baja de los títulos de la biblioteca.</p>
      </header>

      <div className="panel">
        <h2>{form.id ? "Editar libro" : "Registrar libro"}</h2>
        <div className="form-grid">
          <label>Título
            <input type="text" value={form.titulo} onChange={cambiar("titulo")} placeholder="Ej. Cálculo de una variable" />
          </label>
          <label>Autor
            <input type="text" value={form.autor} onChange={cambiar("autor")} placeholder="Ej. James Stewart" />
          </label>
          <label>ISBN
            <input type="text" value={form.isbn} onChange={cambiar("isbn")} placeholder="Ej. 978-607-..." />
          </label>
          <label>Ejemplares
            <input type="number" min={1} value={form.ejemplares} onChange={cambiar("ejemplares")} />
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
          <h2>Títulos registrados</h2>
          <input className="buscador" type="search" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar por título o autor…" />
        </div>
        <div className="tabla-cont">
          <table>
            <thead><tr><th>Título</th><th>Autor</th><th>ISBN</th><th>Ejempl.</th><th>Disp.</th><th></th></tr></thead>
            <tbody>
              {lista.length ? lista.map((l) => (
                <tr key={l.id}>
                  <td>{l.titulo}</td>
                  <td>{l.autor}</td>
                  <td>{l.isbn || "—"}</td>
                  <td>{l.ejemplares}</td>
                  <td>{l.disponibles > 0
                    ? <span className="badge badge-ok">{l.disponibles}</span>
                    : <span className="badge badge-cero">0</span>}</td>
                  <td><div className="acciones">
                    <button className="btn-mini" onClick={() => onEditar(l)}>Editar</button>
                    <button className="btn-mini peligro" onClick={() => onEliminar(l.id)}>Eliminar</button>
                  </div></td>
                </tr>
              )) : <tr><td colSpan={6} className="vacio">No hay libros que coincidan.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
