import { useState, useEffect } from "preact/hooks";

const API_URL = import.meta.env.VITE_BACKEND_URL;
const WS_URL_MARKET = API_URL.replace(/^http/, "wss") + "/ws/market"; // 🔒 Asegurar wss://
const WS_URL_ORDERS = API_URL.replace(/^http/, "wss") + "/ws/orders"; // 🔒 Asegurar wss://

export function App() {
  const [status, setStatus] = useState(null);
  const [symbol, setSymbol] = useState("BTCUSDT");
  const [qty, setQty] = useState(0.01);
  const [orderType, setOrderType] = useState("buy");
  const [price, setPrice] = useState(null);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("status");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [menuOpen, setMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {const savedTheme = localStorage.getItem("theme");
    return savedTheme ? savedTheme === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;});
  
  // 📡 Función para conectar WebSockets con reconexión automática
  const setupWebSocket = (url, onMessage) => {
    let ws = new WebSocket(url);
    ws.onopen = () => console.log(`✅ Conectado a ${url}`);
    ws.onmessage = (event) => onMessage(JSON.parse(event.data));
    ws.onerror = (error) => console.error(`❌ Error en WebSocket ${url}`, error);
    ws.onclose = () => {
      console.warn(`⚠️ WebSocket cerrado. Reintentando conexión a ${url}...`);
      setTimeout(() => setupWebSocket(url, onMessage), 3000);
    };
    return ws;
  };
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

  // cambia la pantalla si es un mobil
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 🔒 Conectar al WebSocket de Market con `wss://`
  useEffect(() => {
    const ws = setupWebSocket(WS_URL_MARKET, (data) => setPrice(data.price));
    return () => ws.close();
  }, [WS_URL_MARKET]);

  // 🔒 Conectar al WebSocket de Orders con `wss://`
  useEffect(() => {
    const ws = setupWebSocket(WS_URL_ORDERS, (data) => setOrders((prevOrders) => [...prevOrders, data]));
    return () => ws.close();
  }, [WS_URL_ORDERS]);

 // 📊 Obtener el estado del bot cada 5 segundos
 useEffect(() => {
  const fetchStatus = async () => {
    try {
      const res = await fetch(`${API_URL}/status`);
      if (!res.ok) throw new Error("Error al obtener el estado");
      const data = await res.json();
      setStatus(data.status ? "🟢 Activo" : "🔴 Inactivo");
    } catch (error) {
      setStatus("⚠️ Error al obtener estado");
    }
  };

  fetchStatus();
  const interval = setInterval(fetchStatus, 5000);
  return () => clearInterval(interval);
}, []);

  useEffect(() => {
    const root = document.documentElement; //Obtiene el <html>
    if (darkMode) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  return (
    <div className={`app ${darkMode ? "dark" : ""}`}>
      <header className="header">
        <nav className="navbar">
          <h1 className="navbar-title">Trading Bot {isMobile ? "📱" : "💻"}</h1>
          <div className="hidden md:flex space-x-4">
          <button className="menu-item" onClick={() => setMenuOpen(menuOpen === "tabs" ? null : "tabs")}>☰</button>
          <button className="menu-item" onClick={() => setActiveTab("status")}>📊 Estado</button>
          <button className="menu-item" onClick={() => setActiveTab("order")}>🛒 Enviar Orden</button>
          <button className="menu-item" onClick={() => setActiveTab("price")}>💰 Precio</button>
          <button className="menu-item" onClick={() => setDarkMode(!darkMode)}>{darkMode ? "🌞 Light" : "🌙 Dark"}</button>
          <div className={`menu ${menuOpen ? "open" : ""}`}>
          {menuOpen === "tabs" && (
            <div className="submenu">
              <button className="button" onClick={handleStart}>🟢 Start</button>
              <button className="button" onClick={handleStop}>🔴 Stop</button>
            </div>
          )}
        </div>
        </div>
        {/* Botón hamburguesa en móvil */}
        <button className="md:hidden text-white text-2xl" onClick={() => setMenuOpen(!menuOpen)}>☰</button>
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
      </div>

      <footer className="footer">Creado con ❤️ para optimizar el trading 📈</footer>
    </div>
  );
}
