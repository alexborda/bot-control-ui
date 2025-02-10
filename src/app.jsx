import { useState, useEffect } from "preact/hooks";

const API_URL = "https://tradingbot.up.railway.app";

export function App() {
  const [status, setStatus] = useState(null);
  const [symbol, setSymbol] = useState("BTCUSDT");
  const [qty, setQty] = useState(0.01);
  const [orderType, setOrderType] = useState("buy");
  const [price, setPrice] = useState(null);

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
    <div className="min-h-screen flex flex-col items-center">
      {/* Navbar */}
      <nav className="navbar">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          🚀 Trading Bot
        </h1>
        <div className="space-x-6 text-lg">
          <a href="/">Inicio</a>
          <a href="/dashboard">Panel</a>
        </div>
      </nav>

      {/* Contenedor principal */}
      <div className="container">
        <h1 className="text-4xl font-extrabold text-center mb-8 tracking-wide">Panel de Control del Bot</h1>

        {/* Estado del Bot */}
        <div className="card text-center">
          <h2 className="text-2xl font-semibold">Estado del Bot</h2>
          <p className="text-lg mt-2 flex justify-center items-center gap-2">
            {status === null ? "Cargando..." : status ? "🟢 Activo" : "🔴 Inactivo"}
          </p>
        </div>

        {/* Botones de Control */}
        <div className="flex justify-center gap-6 mt-6">
          <button className="button button-green" onClick={() => fetch(`${API_URL}/start`, { method: "POST" }).then(() => alert("🚀 Bot iniciado"))}>
            ▶ Iniciar
          </button>
          <button className="button button-red" onClick={() => fetch(`${API_URL}/stop`, { method: "POST" }).then(() => alert("🛑 Bot detenido"))}>
            ⏹ Detener
          </button>
        </div>

        {/* Formulario de Órdenes */}
        <form className="card mt-8">
          <h2 className="text-2xl font-semibold text-center">📊 Enviar Orden</h2>
          <div className="mt-4">
            <label className="block text-lg">Símbolo:</label>
            <input type="text" value={symbol} onChange={(e) => setSymbol(e.target.value)} className="input-field" />
          </div>
          <div className="mt-4">
            <label className="block text-lg">Cantidad:</label>
            <input type="number" value={qty} onChange={(e) => setQty(Number(e.target.value))} className="input-field" />
          </div>
          <div className="mt-4">
            <label className="block text-lg">Tipo de Orden:</label>
            <select value={orderType} onChange={(e) => setOrderType(e.target.value)} className="input-field">
              <option value="buy">Compra</option>
              <option value="sell">Venta</option>
            </select>
          </div>
          <button type="submit" className="button button-blue mt-6" onClick={(e) => {
            e.preventDefault();
            fetch(`${API_URL}/trade`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ symbol, qty, order_type: orderType, secret: "supersecreto123" }),
            }).then(res => res.json()).then(data => alert(`✅ Orden enviada: ${JSON.stringify(data)}`));
          }}>
            📩 Enviar Orden
          </button>
        </form>

        {/* Precio en Vivo */}
        <div className="card mt-8 text-center">
          <h2 className="text-2xl font-semibold">💰 Precio en Vivo</h2>
          <p className="text-4xl mt-2 font-bold">{price ? `$${price}` : "Cargando..."}</p>
        </div>
      </div>

      {/* Footer */}
      <footer className="footer">
        Creado con ❤️ para optimizar el trading 📈
      </footer>
    </div>
  );
}
