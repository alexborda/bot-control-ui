import { useState, useEffect } from "preact/hooks";

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
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );
const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

useEffect(() => {
  const handleResize = () => {
    setIsMobile(window.innerWidth < 768);
  };

  // Ejecutar la detección en el primer render
  handleResize();

  // Agregar event listener para cambios en el tamaño de pantalla
  window.addEventListener("resize", handleResize);

  // Limpiar el event listener cuando el componente se desmonta
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
// Obtener estado del bot
  useEffect(() => {
    fetch(`${API_URL}/status`)
      .then(res => res.json())
      .then(data => setStatus(data.status))
      .catch(() => setStatus(null));
  }, []);
// WebSocket para precios en vivo
  useEffect(() => {
    const ws = new WebSocket("wss://tradingbot.up.railway.app/ws/market");
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setPrice(data.price);
    };
    return () => ws.close();
  }, []);

  // Iniciar y detener bot
  const handleStart = async () => {
    await fetch(`${API_URL}/start`, { method: "POST" });
    alert("Bot iniciado");
  };

  const handleStop = async () => {
    await fetch(`${API_URL}/stop`, { method: "POST" });
    alert("Bot detenido");
  };

  return (
    <div className="app">
      {/* Navbar */}
      <nav className="navbar">
        <h1 className="navbar-title">Trading Bot</h1>
        <button className="menu-item" onClick={() => setSubmenuOpen(submenuOpen === "tabs" ? null : "tabs")}>☰</button>
        <button className="menu-item" onClick={() => {setActiveTab("status"); setMenuOpen(false); }}>📊 Estado</button>
        <button className="menu-item" onClick={() => {setActiveTab("order"); setMenuOpen(false); }}>🛒 Enviar Orden</button>
        <button className="menu-item" onClick={() => {setActiveTab("price"); setMenuOpen(false); }}>💰 Precio</button>
        <button className="menu-item" onClick={() => {setActiveTab("theme"); setMenuOpen(false); }}>🌙 Modo</button>
        <div className={`menu ${submenuOpen ? "open" : ""}`}>
          {submenuOpen === "tabs" && (
            <div className="submenu">
              <button className="button" onClick={handleStart}>🟢 Iniciar Bot</button>
              <button className="button" onClick={handleStop}>🔴 Detener Bot</button>
            </div>
          )}
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
        {activeTab === "theme" && (
          <div className="card">
            <h2>Modo Oscuro o Claro</h2>
            <button className="menu-item" onClick={() => setDarkMode(!darkMode)}>
              {darkMode ? "🌞 Modo Claro" : "🌙 Modo Oscuro"}
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="footer">Creado con ❤️ para optimizar el trading 📈</footer>
    </div>
  );
}
