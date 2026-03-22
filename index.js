const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason
} = require("@whiskeysockets/baileys");

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("auth");

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: false
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === "open") {
      console.log("✅ Bot conectado no WhatsApp!");
    }

    if (connection === "close") {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      console.log("❌ Conexão fechada. Código:", statusCode);

      if (statusCode !== DisconnectReason.loggedOut) {
        console.log("🔄 Tentando reconectar...");
        startBot();
      } else {
        console.log("⚠️ Sessão desconectada. Será preciso parear novamente.");
      }
    }
  });

  setTimeout(async () => {
    try {
      const numero = "5521991465645"; // exemplo: 5521999998888
      const codigo = await sock.requestPairingCode(numero);
      console.log("📱 CÓDIGO DE PAREAMENTO WHATSAPP:", codigo);
    } catch (erro) {
      console.log("❌ Erro ao gerar código de pareamento:", erro?.message || erro);
    }
  }, 5000);

  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const texto =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text ||
      "";

    const numero = msg.key.remoteJid;
    if (!texto) return;

    if (texto.toLowerCase() === "oi" || texto.toLowerCase() === "menu") {
      await sock.sendMessage(numero, {
        text: "👷 Olá! Bem-vindo ao suporte SRT\n\nDigite:\n1️⃣ Falar com o BOT\n2️⃣ Falar com o Pablo"
      });
    } else if (texto === "1") {
      await sock.sendMessage(numero, {
        text: "🤖 Você está falando com o BOT.\n\nFaça sua pergunta sobre o Porto Sudeste."
      });
    } else if (texto === "2") {
      await sock.sendMessage(numero, {
        text: "👷 Aguarde, você será atendido pelo Pablo."
      });
    } else {
      await sock.sendMessage(numero, {
        text: "🤖 Ainda estou aprendendo. Em breve vou responder tudo sobre o Porto Sudeste."
      });
    }
  });
}

startBot();
