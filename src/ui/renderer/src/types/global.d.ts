export interface ElectronAPI {
    createBot(instanceName: string): Promise<void>;
    onQrCode(instanceName: string, callback: (qr: string) => void): void;
    onReady(instanceName: string, callback: () => void): void;
    getBots(): Promise<{ id: number; name: string; status: "online" | "offline" | "connecting" }[]>;
    stopBot(instanceName: string): Promise<void>;
    startBot(instanceName: string): Promise<void>;
    deleteBot(instanceName: string): Promise<void>;
    stopAndExit(): Promise<void>;
}

declare global {
    interface Window {
        ElectronAPI: ElectronAPI;
    }
}