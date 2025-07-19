import PQueue from "p-queue";
import { Message } from "whatsapp-web.js";
import { DispatchCommand } from "./DispatchCommand";

export interface Command {
    execute(message: Message): Promise<void>;
}

export class CommandProcessor {

    private commands: Map<string, Command>;
    private commandQueue: PQueue;

    public constructor() {
        this.commands = new Map();
        this.commandQueue = new PQueue({ concurrency: 1});
    }

    public registerCommand(name: string, command: Command): void {
        if (this.commands.has(name)) {
            throw new Error(`Comando com o nome '${name}' já está registrado.`);
        }
        this.commands.set(name, command);
    }

    public async enqueueCommand(command: Message): Promise<void> {
        this.commandQueue.add(() => this.processCommand(command));
    }

    public async forceRunCommand(commandName: string, message: Message) {
        if (!this.commands.has(commandName)) {
            throw new Error(`Comando ${commandName.toUpperCase()} não encontrado!`)
        }
        
        const command: Command =  this.commands.get(commandName);

        console.log("Forçando execução do comando: " + commandName.toUpperCase())
        
        await command.execute(message);
    }

    private async processCommand(message: Message): Promise<void> {
        try {
            if (message.fromMe) return;

            const text = message.body;

            if (!text) return;

            const args = text.trim().split(/\s+/);
            const commandName = args[1]?.toLowerCase(); //Modelo: @Bot status

            if (commandName && this.commands.has(commandName)) {

                const executor = this.commands.get(commandName);

                if (executor) {
                    try {
                        console.log(`Comando ${commandName.toUpperCase()} executado`)
                        await executor.execute(message);
                    } catch(err) {
                        console.log("Erro ao processar comando" + err)
                    }
                }
            } else {
                message.reply(`❌ Commando ${commandName.toUpperCase()} não encontrado!`);
            }
        } catch(err) {
            message.reply("❌ Não foi possivel executar o comando.");
            console.error(err);
        }
    }



}