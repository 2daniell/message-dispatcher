import { GroupChat, Message } from "whatsapp-web.js";
import { Command } from "./Command";
import sleep from "../common/Sleep";
import { MemoryGroupRepository } from "../repository/MemoryGroupRepository";
import { Config } from "../config/Config";
import { DispatchState } from "../state/DispatchState";
import { Bot } from "../Bot";

export class DispatchCommand implements Command {

    private static GROUPS_BEFORE_RESTART: number = Config.GROUPS_BEFORE_RESTART;

    public constructor(
        private groupRepository: MemoryGroupRepository,
        private dispatchState: DispatchState,
        private bot: Bot
    ) {}

    public async execute(message: Message): Promise<void> {

        const toSend = await message.getQuotedMessage();

        if (!toSend) {
            console.error("❌ Nenhuma mensagem citada foi encontrada.");
            return;
        }

        if (!this.dispatchState.isDispatching()) {
            this.dispatchState.setDispatching(true);
            this.dispatchState.setMessageId(message.id._serialized);

            console.log("ID colocado no State: " + this.dispatchState.getMessageId)

            await message.react("✅");
            await sleep(1500);
            await message.reply("✅ Disparo iniciado com sucesso!");
            await sleep(1000);
        }

        const groups: GroupChat[] = this.groupRepository.getGroups();
        const total: number = groups.length;

        const batchSize = 5;
        const startIndex = this.dispatchState.getCurrentIndex();

        for (let i = startIndex; i < total; i++) {

            const group = groups[i];

             try {
                await toSend.forward(group);
                console.log(`Mensagem enviada para grupo: ${group.name}`);
            } catch (err) {
                console.error(`Erro ao enviar para ${group.name}:`, err);
            }

            this.dispatchState.advance();

            await sleep(250)

            if ((i + 1) % 5 === 0 ) {
                const dalay = (Math.floor(Math.random() * (40 - 20 + 1)) + 20) * 1000;
                await sleep(dalay);
            }

            if ((i + 1) % DispatchCommand.GROUPS_BEFORE_RESTART === 0) {
                console.log(`⏸️ Pausando para reinício após ${DispatchCommand.GROUPS_BEFORE_RESTART} grupos`);

                this.dispatchState.setDispatching(true);

                await sleep(2000);

                await this.bot.restart();
                return;
            }

        }

        this.dispatchState.resetState();
        console.log("✅ Disparo finalizado com sucesso.");

        await sleep(1000);
        await message.reply("✅ Disparo finalizado com sucesso!");
    }
    
}