import "./globals.css";
import { BibliotecaProvider } from "../lib/store";
import Sidebar from "../components/Sidebar";

export const metadata = {
  title: "Biblioteca FIM · UAS",
  description: "Sistema de Administración de Bibliotecas — Facultad de Ingeniería Los Mochis",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <BibliotecaProvider>
          <Sidebar />
          <main className="contenido">{children}</main>
        </BibliotecaProvider>
      </body>
    </html>
  );
}
