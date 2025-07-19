import { Message } from "whatsapp-web.js";
import { Command } from "./Command";
import sleep from "../common/Sleep";

export class StatusCommand implements Command {

    public async execute(message: Message): Promise<void> {
        
        await sleep(1000 * 1)

        message.reply("✅ Automação online!")

    }

}