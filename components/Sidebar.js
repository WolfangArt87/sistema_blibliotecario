"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useBiblioteca } from "../lib/store";

const enlaces = [
  { href: "/", ico: "▣", texto: "Inicio" },
  { href: "/prestamos", ico: "⇄", texto: "Préstamos" },
  { href: "/libros", ico: "▤", texto: "Libros" },
  { href: "/usuarios", ico: "◍", texto: "Usuarios" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { reiniciar } = useBiblioteca();

  const onReiniciar = () => {
    if (confirm("Esto borrará todos los datos y cargará los de ejemplo. ¿Continuar?")) {
      reiniciar();
    }
  };

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">FIM</div>
        <div className="brand-text">
          <strong>Biblioteca</strong>
          <span>Ing. Los Mochis · UAS</span>
        </div>
      </div>

      <nav className="menu">
        {enlaces.map((e) => (
          <Link
            key={e.href}
            href={e.href}
            className={"menu-item" + (pathname === e.href ? " active" : "")}
          >
            <span className="ico">{e.ico}</span> {e.texto}
          </Link>
        ))}
      </nav>

      <div className="sidebar-foot">
        <button className="btn-ghost-sm" onClick={onReiniciar} title="Borra todos los datos y recarga los de ejemplo">
          Reiniciar datos
        </button>
        <p className="ver">Prototipo v1.0 · Next.js</p>
      </div>
    </aside>
  );
}
