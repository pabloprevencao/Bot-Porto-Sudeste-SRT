const { default: makeWASocket, useMultiFileAuthState } = require("@whiskeysockets/baileys");
const qrcode = require("qrcode-terminal");

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState("auth");

    const sock = makeWASocket({
        auth: state
    });

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", (update) => {
        const { qr, connection } = update;

        if (qr) {
            console.log("📱 Escaneie o QR Code abaixo:");
            qrcode.generate(qr, { small: true });
        }

        if (connection === "open") {
            console.log("✅ Bot conectado no WhatsApp!");
        }
    });

    sock.ev.on("messages.upsert", async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message) return;

        const texto = msg.message.conversation || msg.message.extendedTextMessage?.text;
        const numero = msg.key.remoteJid;

        if (!texto) return;

        if (texto.toLowerCase() === "oi" || texto.toLowerCase() === "menu") {
            await sock.sendMessage(numero, {
                text: "👷 Olá! Bem-vindo ao suporte SRT\n\nDigite:\n1️⃣ Falar com o BOT\n2️⃣ Falar com o Pablo"
            });
        }

        else if (texto === "1") {
            await sock.sendMessage(numero, {
                text: "🤖 Você está falando com o BOT.\n\nFaça sua pergunta sobre o Porto Sudeste."
            });
        }

        else if (texto === "2") {
            await sock.sendMessage(numero, {
                text: "👷 Aguarde, você será atendido pelo Pablo."
            });
        }

        else {
            await sock.sendMessage(numero, {
                text: "🤖 Ainda estou aprendendo. Em breve vou responder tudo sobre o Porto Sudeste."
            });
        }
    });
}

startBot();
