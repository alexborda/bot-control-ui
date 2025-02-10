import { useState, useEffect } from "preact/hooks";

const API_URL = "https://tradingbot.up.railway.app";

export function App() {
  const [status, setStatus] = useState(null);
  const [symbol, setSymbol] = useState("BTCUSDT");
  const [qty, setQty] = useState(0.01);
  const [orderType, setOrderType] = useState("buy");
  const [price, setPrice] = useState(null);

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

  // Enviar orden de trading
  const handleTrade = async (e) => {
    e.preventDefault();
    const response = await fetch(`${API_URL}/trade`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ symbol, qty, order_type: orderType, secret: "supersecreto123" }),
    });
    const data = await response.json();
    alert(`Orden enviada: ${JSON.stringify(data)}`);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-10">
      {/* Navbar */}
      <nav className="bg-gray-800 p-4 w-full flex justify-between text-white">
        <h1 className="text-xl font-bold">Trading Bot</h1>
        <div>
          <a href="/" className="mr-4">Inicio</a>
          <a href="/dashboard">Panel</a>
        </div>
      </nav>

      <h1 className="text-3xl font-bold mt-5">Panel de Control del Bot</h1>

      {/* Estado del bot */}
      <div className="p-4 bg-gray-900 text-white rounded-lg shadow-md mt-4">
        <h2 className="text-2xl font-bold">Estado del Bot</h2>
        <p className="text-lg">
          {status === null ? "Cargando..." : status ? "🟢 Activo" : "🔴 Inactivo"}
        </p>
      </div>

      {/* Botones de control */}
      <div className="flex gap-4 mt-4">
        <button onClick={handleStart} className="bg-green-500 px-4 py-2 rounded-lg">Iniciar</button>
        <button onClick={handleStop} className="bg-red-500 px-4 py-2 rounded-lg">Detener</button>
      </div>

      {/* Formulario de órdenes */}
      <form onSubmit={handleTrade} className="p-4 bg-gray-800 text-white rounded-xl mt-4">
        <h2 className="text-xl font-bold">Enviar Orden</h2>
        <div className="mt-2">
          <label>Símbolo:</label>
          <input type="text" value={symbol} onChange={(e) => setSymbol(e.target.value)} className="p-2 text-black" />
        </div>
        <div className="mt-2">
          <label>Cantidad:</label>
          <input type="number" value={qty} onChange={(e) => setQty(Number(e.target.value))} className="p-2 text-black" />
        </div>
        <div className="mt-2">
          <label>Tipo de Orden:</label>
          <select value={orderType} onChange={(e) => setOrderType(e.target.value)} className="p-2 text-black">
            <option value="buy">Compra</option>
            <option value="sell">Venta</option>
          </select>
        </div>
        <button type="submit" className="bg-blue-500 px-4 py-2 mt-4 rounded-lg">Enviar Orden</button>
      </form>

      {/* Precios en vivo */}
      <div className="p-4 bg-gray-800 text-white rounded-xl mt-4">
        <h2 className="text-xl font-bold">Precio en Vivo</h2>
        <p className="text-lg">{price ? `$${price}` : "Cargando..."}</p>
      </div>
    </div>
  );
}
