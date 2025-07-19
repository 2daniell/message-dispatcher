import { Client, LocalAuth } from "whatsapp-web.js";

export class WhatsappClientProvider {

    public static getWhatsappClient(instanceName: string): Client {
        const whatsappClient = new Client({
            authStrategy: new LocalAuth(
                {
                    clientId: instanceName,
                }
            ),
            puppeteer: {
                headless: false,
                executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
                handleSIGINT: false,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-gpu',
                    '--disable-extensions',
                    '--mute-audio',
                    '--disable-background-timer-throttling',
                    '--disable-renderer-backgrounding',
                    '--disable-blink-features=AutomationControlled',
                    '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36'
                ]
            },
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
        })

        return whatsappClient;
    }
}