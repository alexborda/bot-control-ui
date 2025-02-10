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

  // Aplicar el modo oscuro desde localStorage
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
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100 transition-all duration-300">
      {/* Navbar con menú desplegable y modo oscuro */}
      <nav className="navbar">
        <h1 className="text-2xl font-bold flex items-center gap-2 md:text-3xl">
          🚀 Trading Bot {isMobile ? "📱" : "💻"}
        </h1>
        <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
          ☰
        </button>
        <div className={`absolute top-14 right-4 bg-gray-700 p-4 rounded-lg shadow-lg transition-all duration-300 ${menuOpen ? "block" : "hidden"} md:relative md:top-0 md:right-0 md:bg-transparent md:p-0 md:shadow-none md:flex md:space-x-6`}>
          <a href="/" className="block text-white hover:text-blue-400 md:inline-block" onClick={() => setMenuOpen(false)}>Inicio</a>
          <a href="/dashboard" className="block text-white hover:text-blue-400 md:inline-block" onClick={() => setMenuOpen(false)}>Panel</a>
          <button
            className="w-full bg-gray-600 text-white p-2 rounded-lg mt-2 md:mt-0 md:w-auto"
            onClick={() => {
              setDarkMode(!darkMode);
              setMenuOpen(false);
            }}
          >
            {darkMode ? "🌞 Modo Claro" : "🌙 Modo Oscuro"}
          </button>
        </div>
      </nav>

      {/* Contenedor principal con pestañas */}
      <div className="container">
        <h1 className="title">Panel de Control</h1>

        {/* Pestañas */}
        <div className="tabs">
          <button className={`tab-button ${activeTab === "status" ? "active" : ""}`} onClick={() => setActiveTab("status")}>📊 Estado</button>
          <button className={`tab-button ${activeTab === "order" ? "active" : ""}`} onClick={() => setActiveTab("order")}>🛒 Enviar Orden</button>
          <button className={`tab-button ${activeTab === "price" ? "active" : ""}`} onClick={() => setActiveTab("price")}>💰 Precio</button>
        </div>

        {/* Contenido de las pestañas */}
        <div className="card text-center">
          {activeTab === "status" && (
            <>
              <h2 className="text-xl font-semibold md:text-2xl">Estado del Bot</h2>
              <p className="text-lg mt-2">
                {status === null ? "Cargando..." : status ? "🟢 Activo" : "🔴 Inactivo"}
              </p>
            </>
          )}

          {activeTab === "order" && (
            <form className="mt-4">
              <h2 className="text-xl font-semibold text-center md:text-2xl">📊 Enviar Orden</h2>
              <div className="mt-4">
                <label className="block text-sm md:text-lg">Símbolo:</label>
                <input type="text" value={symbol} onChange={(e) => setSymbol(e.target.value)} className="input-field" />
              </div>
              <div className="mt-4">
                <label className="block text-sm md:text-lg">Cantidad:</label>
                <input type="number" value={qty} onChange={(e) => setQty(Number(e.target.value))} className="input-field" />
              </div>
              <div className="mt-4">
                <label className="block text-sm md:text-lg">Tipo de Orden:</label>
                <select value={orderType} onChange={(e) => setOrderType(e.target.value)} className="input-field">
                  <option value="buy">Compra</option>
                  <option value="sell">Venta</option>
                </select>
              </div>
              <button type="submit" className="button button-blue mt-4">
                📩 Enviar Orden
              </button>
            </form>
          )}

          {activeTab === "price" && (
            <>
              <h2 className="text-xl font-semibold md:text-2xl">💰 Precio en Vivo</h2>
              <p className="text-3xl mt-2 font-bold">{price ? `$${price}` : "Cargando..."}</p>
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="footer">
        Creado con ❤️ para optimizar el trading 📈 - {isMobile ? "Versión Móvil" : "Versión PC"}
      </footer>
    </div>
  );
}
