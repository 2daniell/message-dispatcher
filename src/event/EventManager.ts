import { Listener, MessageListener, MessageReceivedEvent, ReadyEvent, ReadyListener } from "./Event";
import { Bot } from "../Bot";

export class EventManager {

    private listeners: Map<string, Listener<any>[]> = new Map();

    public constructor(
        private readonly bot: Bot
    ) {

        const instanceName = bot.getInstanceName();
        const whatsappClient = this.bot.getWhatsappClient();

        this.register<MessageReceivedEvent>("message", new MessageListener(
            bot.getGroupRepository(),
            whatsappClient,
            bot.getCommandProcessor()
        ))
        whatsappClient.on("message", (message) => this.dispatch<MessageReceivedEvent>("message", { message: message}))

        this.register<ReadyEvent>("ready", new ReadyListener(
            instanceName, 
            whatsappClient, 
            this.bot.getGroupRepository(),
            this.bot.getDispatchState(),
            this.bot.getCommandProcessor(),
            this.bot.setTriggerGroup
        ));
        whatsappClient.on("ready", () => this.dispatch<ReadyEvent>("ready", {}))
    }

    public register<T>(eventName: string, listener: Listener<T>): void {
        if (!this.listeners.has(eventName)) {
            this.listeners.set(eventName, []);
        }
        this.listeners.get(eventName)?.push(listener);
    }
    
    public dispatch<T>(eventName: string, event: T): void {
        const eventListeners = this.listeners.get(eventName);
        if (eventListeners) {
            eventListeners.forEach(listener => listener.handle(event));
        }
    }

}