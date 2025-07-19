import { Client, GroupChat, Message } from "whatsapp-web.js";
import { MemoryGroupRepository } from "../repository/MemoryGroupRepository";
import { isJSDocThisTag } from "typescript";
import { Config } from "../config/Config";
import { Command, CommandProcessor } from "../command/Command";
import { DispatchState } from "../state/DispatchState";

export interface Event {

}

export interface ReadyEvent extends Event {

}

export interface MessageReceivedEvent extends Event {
    message: Message;
}

// ----------------------------------------- \\

export interface Listener<T> {
    handle(event: T): Promise<void> | void;
}

export class ReadyListener implements Listener<ReadyEvent> {

    public constructor(
        private readonly name: string,
        private readonly whatsappClient: Client,
        private readonly groupRepository: MemoryGroupRepository,
        private readonly dispatchState: DispatchState,
        private readonly commandProcessor: CommandProcessor,
        private readonly setTriggerGroup: (group: GroupChat) => void
    ) {}

    public async handle(event: ReadyEvent): Promise<void> {
        
        console.log(`Automação ${this.name} está pronta!`);

        const chats = await this.whatsappClient.getChats();
        const groups = chats.filter(chat => chat.isGroup).map(group => group as GroupChat);

        const triggerGroup = groups.find(group => group.name === Config.ALLOWED_GROUP);

        if (triggerGroup) {
            console.log(`Grupo de Gatilho ${triggerGroup.name}} foi encontrado com sucesso!`);

            this.setTriggerGroup(triggerGroup);
        }

        console.log(`Automação ${this.name} encontrou ${groups.length} grupos.`);

        this.groupRepository.setGroups(groups);

        if (this.dispatchState.isDispatching()) {
            console.log("🔄 Reinício detectado. Retomando envio...");

            if (!triggerGroup) {
                console.log("Grupo de gatilho não encontrado!")
                return;
            }

            const messages = await triggerGroup.fetchMessages({ limit: 50 });
            const message: Message = messages.find(msg => msg.id._serialized === this.dispatchState.getMessageId());

            if (!message) {
                console.error("❌ Mensagem original não encontrada. Reinício abortado.");
                return;
            }

            this.commandProcessor.forceRunCommand("disparar", message);
        }
    }
}

export class MessageListener implements Listener<MessageReceivedEvent> {

    public constructor(
        private groupRepository: MemoryGroupRepository,
        private whatsappClient: Client,
        private commandProcessor: CommandProcessor
    ) {}

    public async handle(event: MessageReceivedEvent): Promise<void> {
        
        if (!this.groupRepository.getGroups() || this.groupRepository.getGroups().length < 1) {
            return;
        }

        const message: Message = event.message;

        const botNumber = this.whatsappClient.info.wid._serialized;
        const isMentioned: boolean = message.mentionedIds.map(id => id.toString()).includes(botNumber);

        if (!isMentioned) return;

        const chat = await message.getChat();

        if (!chat.isGroup) return;
        if (chat.name.trim() !== Config.ALLOWED_GROUP) return;

        console.log(`Um novo comando foi adicionado a fila de processamento`)
        this.commandProcessor.enqueueCommand(message);

    }

}