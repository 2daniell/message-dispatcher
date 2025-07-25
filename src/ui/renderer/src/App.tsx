import { useEffect, useRef, useState } from "react";
import { Plus, X } from "lucide-react";

type BotStatus = "online" | "offline" | "connecting";

interface Bot {
  id: number;
  name: string;
  status: BotStatus;
}

export default function App() {
  const [bots, setBots] = useState<Bot[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [qrBotId, setQrBotId] = useState<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const fetchBots = async () => {
    try {
      const data = await window.ElectronAPI.getBots();
      setBots(data);
    } catch (error) {
      console.error("Erro ao buscar bots:", error);
    }
  }

  useEffect(() => {
    fetchBots();
  }, []);

  const handleCreateBot = () => {
    const instanceName = newName.trim();
    if (!instanceName) {
      alert("Por favor, insira um nome válido para a instância.");
      return;
    }

    const alreadyExists = bots.some((bot) => bot.name === instanceName);
    if (alreadyExists) {
      alert("Já existe um bot com esse nome!");
      return;
    }

    const botId = Date.now();

    setBots((prev) => [
      ...prev,
      { id: botId, name: instanceName, status: "connecting" },
    ]);

    setNewName("");
    setShowModal(false);
    setQrBotId(botId);
    
    window.ElectronAPI.createBot(instanceName);

    window.ElectronAPI.onQrCode(instanceName, (qr) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qr)}`;

      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
      img.onerror = () => console.error('Failed to load QR code image');
      img.src = qrImageUrl;
    });

    window.ElectronAPI.onReady(instanceName, () => {
      setBots((prev) =>
        prev.map((bot) =>
          bot.name === instanceName ? { ...bot, status: "online" } : bot
        )
      );
      setQrBotId(null);
    });

  };

  const handleDeleteBot = async (instanceName: string) => {
    if (confirm("Tem certeza que deseja excluir este bot?")) {
      window.ElectronAPI.deleteBot(instanceName);
      setBots((prev) => prev.filter((bot) => bot.name !== instanceName));
      setQrBotId(null);
      setNewName("");
    }
  };

  const handleStartBot = async (instanceName: string) => {
    try {
      await window.ElectronAPI.startBot(instanceName);
      setBots((prev) =>
        prev.map((bot) =>
          bot.name === instanceName ? { ...bot, status: "online" } : bot
        )
      );
    } catch (error) {
      console.error("Erro ao iniciar o bot:", error);
    }
  };

  const handleStopBot = async (instanceName: string) => {
    if (!confirm("Tem certeza que deseja parar este bot?")) return;

    try {
      await window.ElectronAPI.stopBot(instanceName);
      setBots((prev) =>
        prev.map((bot) =>
          bot.name === instanceName ? { ...bot, status: "offline" } : bot
        )
      );
    } catch (error) {
      console.error("Erro ao parar o bot:", error);
    }
  }

  const handleClose = async () => {
    await window.ElectronAPI.stopAndExit();
  };

  return (
    <div className="bg-gray-100 rounded-2xl min-h-screen font-sans select-none relative">

      {/* Botão fechar (fake) */}
      <button
        className="fixed top-3 right-3 w-8 h-8 bg-red-500 hover:bg-red-600 text-white font-bold flex items-center justify-center rounded transition-colors duration-200 shadow z-50"
        onClick={() => handleClose()}
      >
        ×
      </button>

      {/* Cabeçalho fixo */}
      <div className="fixed top-0 left-0 w-full bg-white z-40 px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-800 text-center">Painel de Bots</h1>
      </div>

      {/* Espaçamento após cabeçalho */}
      <div className="h-[80px]" />

      {/* Grid de bots */}
      <div className="p-6 grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-6">
        {bots.map((bot) => (
          <div
            key={bot.id}
            className="bg-white p-4 rounded-2xl shadow-md relative transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div
              className={`absolute top-3 right-3 w-3 h-3 rounded-full ${
                bot.status === "online"
                  ? "bg-green-500 shadow-[0_0_6px_2px_rgba(34,197,94,0.4)]"
                  : bot.status === "connecting"
                  ? "bg-yellow-400 animate-pulse"
                  : "bg-gray-400"
              }`}
            ></div>

            <div className="flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mb-2">
                🤖
              </div>
              <h3 className="font-semibold text-lg text-gray-800 mb-2">
                {bot.name}
              </h3>

              <div className="flex gap-2 mt-2">
                {bot.status === "online" ? (
                  <button
                    onClick={() => handleStopBot(bot.name)}
                    className="px-3 py-1 rounded-lg text-white text-sm font-medium bg-green-500 hover:bg-green-600 transition"
                  >
                    Parar
                  </button>
                ) : (
                  <button
                    onClick={() => handleStartBot(bot.name)}
                    className="px-3 py-1 rounded-lg text-white text-sm font-medium bg-gray-500 hover:bg-gray-600 transition"
                  >
                    Iniciar
                  </button>
                )}
                <button
                  onClick={() => handleDeleteBot(bot.name)}
                  className="px-3 py-1 rounded-lg text-white text-sm font-medium bg-gray-500 hover:bg-gray-600 transition"
                >
                  Excluir
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Botão adicionar */}
        <div
          onClick={() => setShowModal(true)}
          className="border-2 border-dashed border-emerald-500 bg-emerald-50 hover:bg-emerald-100 text-emerald-500 flex items-center justify-center cursor-pointer rounded-2xl text-4xl font-bold transition"
        >
          <Plus size={36} />
        </div>
      </div>

      {/* Modal de criar novo bot */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-[320px] relative shadow-lg">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
              onClick={() => setShowModal(false)}
            >
              <X size={20} />
            </button>

            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Criar novo bot
            </h2>

            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Nome da instância"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4 outline-none focus:ring-2 focus:ring-emerald-400 transition"
            />

            <button
              onClick={handleCreateBot}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2 rounded-lg transition"
            >
              Criar
            </button>
          </div>
        </div>
      )}

      {/* Modal de QRCode */}
      {qrBotId && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-lg w-[300px] text-center relative flex items-center justify-center flex-col">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Escaneie o QR Code</h2>
            <canvas ref={canvasRef} width={200} height={200} style={{background: "#f5f7fa"}}></canvas>
            <p className="text-gray-500 mt-4 text-sm">Aguardando leitura...</p>
          </div>
        </div>
      )}
    </div>
  );
}
