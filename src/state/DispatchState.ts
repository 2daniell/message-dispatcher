import { Message } from "whatsapp-web.js";

export class DispatchState {

    private dispatching: boolean = false;
    private currentIndex: number = 0;
    private messageId: string;

    public resetState(): void {
        this.dispatching = false;
        this.currentIndex = 0;
        this.messageId = null;
    }

    public setMessageId(id: string) {
        this.messageId = id;
    }

    public getMessageId(): string {
        return this.messageId;
    }

    public advance(): void {
        this.currentIndex = this.currentIndex + 1
    }

    public isDispatching(): boolean {
        return this.dispatching;
    }

    public getCurrentIndex(): number {
        return this.currentIndex;
    }

    public setDispatching(active: boolean): void {
        this.dispatching = active;
    }
}