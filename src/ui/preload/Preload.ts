import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("ElectronAPI", {
  createBot: (instanceName: string) => {
    ipcRenderer.send("bot:create", instanceName);
  },
  onQrCode: (instanceName: string, callback: (qr: string) => void) => {
    ipcRenderer.on(`bot:qr:${instanceName}`, (_, qr) => callback(qr));
  },
  onReady: (instanceName: string, callback: () => void) => {
    ipcRenderer.on(`bot:ready:${instanceName}`, callback);
  },
  onError: (instanceName: string, callback: (msg: string) => void) => {
    ipcRenderer.on(`bot:error:${instanceName}`, (_, msg) => callback(msg));
  },
  getBots: () => ipcRenderer.invoke("bot:get"),
  stopBot: (instanceName: string) => {
    ipcRenderer.send("bot:stop", instanceName);
  },
  startBot: (instanceName: string) => {
    ipcRenderer.send("bot:start", instanceName);
  },
  deleteBot: (instanceName: string) => {
    ipcRenderer.send("bot:delete", instanceName);
  },
  stopAndExit: () => {
    ipcRenderer.send("app:stop-and-exit");
  }
});
