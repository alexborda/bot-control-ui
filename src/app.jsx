import { useState, useEffect } from "preact/hooks";

const API_URL = "https://tradingbot.up.railway.app";

export function App() {
  const [status, setStatus] = useState(null);
  const [symbol, setSymbol] = useState("BTCUSDT");
  const [qty, setQty] = useState(0.01);
  const [orderType, setOrderType] = useState("buy");
  const [price, setPrice] = useState(null);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("status");
  const [submenuOpen, setSubmenuOpen] = useState(null);
  const [darkMode, setDarkMode] = useState(localStorage.getItem("theme") === "dark");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Enviar orden
  const sendOrder = async () => {
    const order = {
      secret: import.meta.env.VITE_API_SECRET,
      order_type: orderType,
      symbol,
      qty,
      price,
    };
    const response = await fetch(`${API_URL}/trade`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(order),
    });
    const result = await response.json();
    setOrders((prevOrders) => [...prevOrders, result]);
  };

  // WebSocket con reconexión automática
  const setupWebSocket = (url, onMessage) => {
    let ws = new WebSocket(url);
    ws.onmessage = (event) => onMessage(JSON.parse(event.data));
    ws.onclose = () => setTimeout(() => setupWebSocket(url, onMessage), 3000);
    return ws;
  };

  useEffect(() => {
    const ws = setupWebSocket("wss://tradingbot.up.railway.app/ws/market", (data) => setPrice(data.price));
    return () => ws.close();
  }, []);

  useEffect(() => {
    const ws = setupWebSocket("wss://tradingbot.up.railway.app/ws/orders", (data) => setOrders((prevOrders) => [...prevOrders, data]));
    return () => ws.close();
  }, []);

  useEffect(() => {
    const fetchStatus = () => {
      fetch(`${API_URL}/status`)
        .then(res => res.json())
        .then(data => setStatus(data.bot_running))
        .catch(() => setStatus(null));
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
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

  return (
    <div className="app">
      <header className="header">
        <nav className="navbar">
          <h1 className="navbar-title">Trading Bot</h1>
          <button className="menu-item" onClick={() => setSubmenuOpen(submenuOpen === "tabs" ? null : "tabs")}>☰</button>
          <button className="menu-item" onClick={() => setActiveTab("status")}>📊 Estado</button>
          <button className="menu-item" onClick={() => setActiveTab("order")}>🛒 Enviar Orden</button>
          <button className="menu-item" onClick={() => setActiveTab("price")}>💰 Precio</button>
          <button className="menu-item" onClick={() => setActiveTab("theme")}>
            {darkMode ? "🌞 Light" : "🌙 Dark"}
          </button>
        </nav>
      </header>

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
            <form onSubmit={(e) => { e.preventDefault(); sendOrder(); }}>
              <label>Símbolo:</label>
              <input type="text" value={symbol} onChange={(e) => setSymbol(e.target.value)} className="input-field" />
              <label>Cantidad:</label>
              <input type="number" value={qty} onChange={(e) => setQty(Number(e.target.value))} className="input-field" />
              <label>Tipo de Orden:</label>
              <select value={orderType} onChange={(e) => setOrderType(e.target.value)} className="input-field">
                <option value="buy">Comprar</option>
                <option value="sell">Vender</option>
              </select>
              <button type="submit" className="button">📩 Enviar Orden</button>
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
            <h2>🌙 Modo Oscuro</h2>
            <button className="menu-item" onClick={() => setDarkMode(!darkMode)}>
              {darkMode ? "🌞 Light" : "🌙 Dark"}
            </button>
          </div>
        )}
      </div>

      <footer className="footer">Creado con ❤️ para optimizar el trading 📈</footer>
    </div>
  );
}
