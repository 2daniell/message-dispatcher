import { Bot } from "./Bot";
import { FileAccesser } from "./common/FileAccesser";
import { rm } from 'fs/promises';
import path from 'path';

export class BotManager {

    private static instances: Map<string, Bot> = new Map();
    private static botStorege = new FileAccesser("bots/bots.json");

    public static async createBot(
        instanceName: string, 
        onQrCode: (qr: string) => void, 
        onReady: () => void
    ): Promise<void> {

        if (BotManager.instances.has(instanceName)) {
            throw new Error(`Bot com o nome ${instanceName} já existe.`);
        }

        await BotManager.startBot(instanceName, onQrCode, onReady);

    }

    public static async stopBot(instanceName: string): Promise<void> {
        if (!BotManager.instances.has(instanceName)) {
            throw new Error(`Bot com o nome ${instanceName} não existe.`);
        }

        const bot = BotManager.instances.get(instanceName);
        await bot.stop();

        BotManager.instances.delete(instanceName);
    }

    public static async startBot(instanceName: string, onQrCode?: (qr: string) => void, 
        onReady?: () => void): Promise<Bot> {
        if (BotManager.instances.has(instanceName)) {
            throw new Error(`Bot com o nome ${instanceName} já está em execução.`);
        }

        const currentBots = await BotManager.botStorege.readJSON().catch(() => []);

        if (!currentBots.includes(instanceName)) {
            await BotManager.botStorege.insertJSON([...currentBots, instanceName]);
        }

        const bot = new Bot(instanceName);

        const whatsappClient = bot.getWhatsappClient();
        if (onQrCode) {
            whatsappClient.on("qr", onQrCode);
        }

        if (onReady) {
            whatsappClient.on("ready", onReady);
        }

        await bot.start();

        BotManager.instances.set(instanceName, bot);

        return bot;
    }

    public static async deleteBot(instanceName: string): Promise<void> {
        
        if (BotManager.instances.has(instanceName)) {
            const bot = BotManager.instances.get(instanceName);
            await bot.stop();
            BotManager.instances.delete(instanceName);
        }

        const currentBots = await BotManager.botStorege.readJSON().catch(() => []);
        const updatedBots = currentBots.filter(name => name !== instanceName);
        await BotManager.botStorege.insertJSON(updatedBots);

        const sessionPath = path.resolve('.wwebjs_auth', `session-${instanceName}`);
        try {
            await rm(sessionPath, { recursive: true, force: true });
            console.log(`Sessão ${sessionPath} removida com sucesso.`);
        } catch (err) {
            console.error(`Erro ao remover a sessão ${sessionPath}:`, err);
        }

    }

    public static async destroyAll(): Promise<void> {
        for (const [instanceName, bot] of BotManager.instances.entries()) {
            await bot.stop();
        }
        BotManager.instances.clear();
    }

    public static async getBots(): Promise<{ name: string; status: string}[]> {
        const savedBots = await BotManager.botStorege.readJSON().catch(() => []);
        return savedBots.map(name => ({
            name,
            status: this.instances.has(name) ? "online" : "offline"
        }));
    }


}