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
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );

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
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100 transition-all duration-300">
      {/* Navbar con menú acordeón */}
      <nav className="navbar">
        <h1 className="text-2xl font-bold flex items-center gap-2 md:text-3xl">
          🚀 Trading Bot {isMobile ? "📱" : "💻"}
        </h1>
        <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
          ☰
        </button>
        <div className={`absolute top-14 right-4 bg-gray-700 p-4 rounded-lg shadow-lg transition-all duration-300 ${menuOpen ? "block" : "hidden"} md:relative md:top-0 md:right-0 md:bg-transparent md:p-0 md:shadow-none md:flex md:space-x-6`}>
          {/* Opciones del menú */}
          <div>
            <button className="block w-full text-left text-white p-2 hover:bg-gray-600 rounded-lg" onClick={() => setSubmenuOpen(submenuOpen === "opciones" ? null : "opciones")}>
              ⚙ Opciones
            </button>
            {submenuOpen === "opciones" && (
              <div className="bg-gray-800 p-3 rounded-lg mt-2 space-y-2">
                <a href="/" className="block text-white hover:text-blue-400" onClick={() => { setMenuOpen(false); setSubmenuOpen(null); }}>🏠 Inicio</a>
                <a href="/dashboard" className="block text-white hover:text-blue-400" onClick={() => { setMenuOpen(false); setSubmenuOpen(null); }}>📊 Panel</a>
              </div>
            )}
          </div>

          {/* Pestañas del bot en el menú */}
          <div>
            <button className="block w-full text-left text-white p-2 hover:bg-gray-600 rounded-lg" onClick={() => setSubmenuOpen(submenuOpen === "tabs" ? null : "tabs")}>
              📁 Secciones
            </button>
            {submenuOpen === "tabs" && (
              <div className="bg-gray-800 p-3 rounded-lg mt-2 space-y-2">
                <button className="block w-full text-left text-white hover:text-blue-400" onClick={() => { setActiveTab("status"); setMenuOpen(false); setSubmenuOpen(null); }}>
                  📊 Estado del Bot
                </button>
                <button className="block w-full text-left text-white hover:text-blue-400" onClick={() => { setActiveTab("order"); setMenuOpen(false); setSubmenuOpen(null); }}>
                  🛒 Enviar Orden
                </button>
                <button className="block w-full text-left text-white hover:text-blue-400" onClick={() => { setActiveTab("price"); setMenuOpen(false); setSubmenuOpen(null); }}>
                  💰 Precio
                </button>
              </div>
            )}
          </div>

          {/* Botón para modo oscuro */}
          <div>
            <button className="block w-full text-left text-white p-2 hover:bg-gray-600 rounded-lg" onClick={() => setSubmenuOpen(submenuOpen === "darkmode" ? null : "darkmode")}>
              {darkMode ? "🌞 Modo Claro" : "🌙 Modo Oscuro"}
            </button>
            {submenuOpen === "darkmode" && (
              <div className="bg-gray-800 p-3 rounded-lg mt-2 space-y-2">
                <button className="block w-full text-left text-white hover:text-blue-400" onClick={() => { setDarkMode(!darkMode); setMenuOpen(false); setSubmenuOpen(null); }}>
                  {darkMode ? "☀️ Activar Modo Claro" : "🌑 Activar Modo Oscuro"}
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Contenido dinámico basado en pestañas seleccionadas */}
      <div className="container">
        {activeTab === "status" && (
          <div className="card text-center">
            <h2 className="text-xl font-semibold md:text-2xl">📊 Estado del Bot</h2>
            <p className="text-lg mt-2">
              {status === null ? "Cargando..." : status ? "🟢 Activo" : "🔴 Inactivo"}
            </p>
          </div>
        )}

        {activeTab === "order" && (
          <div className="card text-center">
            <h2 className="text-xl font-semibold md:text-2xl">🛒 Enviar Orden</h2>
            <form className="mt-4">
              <label className="block text-sm md:text-lg">Símbolo:</label>
              <input type="text" value={symbol} onChange={(e) => setSymbol(e.target.value)} className="input-field" />
              <button className="button button-blue mt-4">📩 Enviar Orden</button>
            </form>
          </div>
        )}

        {activeTab === "price" && (
          <div className="card text-center">
            <h2 className="text-xl font-semibold md:text-2xl">💰 Precio en Vivo</h2>
            <p className="text-3xl mt-2 font-bold">{price ? `$${price}` : "Cargando..."}</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="footer">Creado con ❤️ para optimizar el trading 📈</footer>
    </div>
  );
}
