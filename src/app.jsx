import { useState, useEffect } from "preact/hooks";
import "./app.css"; // Importamos estilos desde app.css

const API_URL = "https://tradingbot.up.railway.app";

export function App() {
  const [status, setStatus] = useState(null);
  const [symbol, setSymbol] = useState("BTCUSDT");
  const [qty, setQty] = useState(0.01);
  const [orderType, setOrderType] = useState("buy");
  const [price, setPrice] = useState(null);
  const [activeTab, setActiveTab] = useState("status");
  const [menuOpen, setMenuOpen] = useState(false);
  const [submenuOpen, setSubmenuOpen] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );
 // Detectar si es móvil o PC en tiempo real
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  useEffect(() => {
    fetch(`${API_URL}/status`)
      .then(res => res.json())
      .then(data => setStatus(data.status))
      .catch(() => setStatus(null));
  }, []);

  useEffect(() => {
    const ws = new WebSocket("wss://tradingbot.up.railway.app/ws/market");
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setPrice(data.price);
    };
    return () => ws.close();
  }, []);

  return (
    <div className="app">
      {/* Navbar */}
      <nav className="navbar">
        <h1 className="navbar-title">🚀 Trading Bot</h1>
        <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)}>☰</button>
        <div className={`menu ${menuOpen ? "open" : ""}`}>
          <button className="menu-item" onClick={() => setSubmenuOpen(submenuOpen === "tabs" ? null : "tabs")}>
            📁 Secciones
          </button>
          {submenuOpen === "tabs" && (
            <div className="submenu">
              <button className="submenu-item" onClick={() => { setActiveTab("status"); setMenuOpen(false); }}>📊 Estado</button>
              <button className="submenu-item" onClick={() => { setActiveTab("order"); setMenuOpen(false); }}>🛒 Enviar Orden</button>
              <button className="submenu-item" onClick={() => { setActiveTab("price"); setMenuOpen(false); }}>💰 Precio</button>
            </div>
          )}
          <button className="menu-item" onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? "🌞 Modo Claro" : "🌙 Modo Oscuro"}
          </button>
        </div>
      </nav>

      {/* Contenido dinámico */}
      <div className="container">
        {activeTab === "status" && (
          <div className="card">
            <h2>📊 Estado del Bot</h2>
            <p>{status === null ? "Cargando..." : status ? "🟢 Activo" : "🔴 Inactivo"}</p>
          </div>
        )}
        {activeTab === "order" && (
          <div className="card">
            <h2>🛒 Enviar Orden</h2>
            <form>
              <label>Símbolo:</label>
              <input type="text" value={symbol} onChange={(e) => setSymbol(e.target.value)} className="input-field" />
              <button className="button">📩 Enviar Orden</button>
            </form>
          </div>
        )}
        {activeTab === "price" && (
          <div className="card">
            <h2>💰 Precio en Vivo</h2>
            <p>{price ? `$${price}` : "Cargando..."}</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="footer">Creado con ❤️ para optimizar el trading 📈</footer>
    </div>
  );
}
