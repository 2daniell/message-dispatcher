import { Client, GroupChat } from "whatsapp-web.js";
import { WhatsappClientProvider } from "./provider/WhatsappClientProvider";
import { EventManager } from "./event/EventManager";
import { MemoryGroupRepository } from "./repository/MemoryGroupRepository";
import { CommandProcessor } from "./command/Command";
import { DispatchState } from "./state/DispatchState";
import { DispatchCommand } from "./command/DispatchCommand";
import sleep from "./common/Sleep";
import { StatusCommand } from "./command/StatusCommand";

export class Bot {

    private readonly name: string;
    private readonly whatsappClient: Client
    private readonly eventManager: EventManager;
    private readonly groupRepository: MemoryGroupRepository;
    private readonly commandProcessor: CommandProcessor;
    private readonly dispatchState: DispatchState;
    private triggerGroup: GroupChat;

    public constructor(name: string, dispatchState?: DispatchState) {
        this.name = name;
        this.whatsappClient = WhatsappClientProvider.getWhatsappClient(name);
        this.groupRepository = new MemoryGroupRepository();
        this.commandProcessor = new CommandProcessor()
        this.dispatchState = dispatchState || new DispatchState();

        this.commandProcessor.registerCommand("disparar", new DispatchCommand(this.groupRepository, this.dispatchState, this));
        this.commandProcessor.registerCommand("status", new StatusCommand());

        this.eventManager = new EventManager(this);
    }

    public async start(): Promise<void> {
        await this.whatsappClient.initialize();
    }

    public async stop(): Promise<void> {
        await this.whatsappClient.destroy();
    }

    public async restart(): Promise<void> {
        await this.stop();
        await sleep(5000);

        const bot = new Bot(this.name, this.dispatchState);
        bot.start();
    }

    public getWhatsappClient(): Client {
        return this.whatsappClient;
    }

    public getInstanceName(): string {
        return this.name;
    }

    public getGroupRepository(): MemoryGroupRepository {
        return this.groupRepository;
    }

    public getCommandProcessor(): CommandProcessor {
        return this.commandProcessor;
    }

    public getDispatchState() {
        return this.dispatchState;
    }

    public getTriggerGroup(): GroupChat {
        return this.triggerGroup;
    }

    public setTriggerGroup(group: GroupChat) {
        this.triggerGroup = group;
    }
}