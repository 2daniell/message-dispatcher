import path from "path";
import { app, BrowserWindow, ipcMain, Menu } from "electron";
import { BotManager } from "../../BotManager";

let mainWindow: BrowserWindow

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1000,
        height: 700,
        frame: false,
        resizable: false,
        transparent: true,
        webPreferences: {
            preload: path.join(__dirname, '../preload/Preload.js'),
        },
    });

    Menu.setApplicationMenu(null)
    //mainWindow.loadURL("http://localhost:5173/")
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
}

app.whenReady().then(async () => {
    createWindow();

    //await BotManager.loadBots();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
})

app.setName("Message Dispatcher")

ipcMain.on("bot:create", async (event, instanceName: string) => {
  try {
    await BotManager.createBot(
      instanceName,
      (qr) => {
        event.sender.send(`bot:qr:${instanceName}`, qr);
      },
      () => {
        event.sender.send(`bot:ready:${instanceName}`);
      }
    );
  } catch (err: any) {
    console.error(`Erro ao criar bot: ${err.message}`);
    //event.sender.send(`bot:error:${instanceName}`, err.message);
  }
});

ipcMain.handle("bot:get", async () => {
    return BotManager.getBots();
});

ipcMain.on("bot:stop", async (event, instanceName: string) => {
    try {
        await BotManager.stopBot(instanceName);
    } catch (err: any) {
        console.error(`Erro ao parar bot: ${err.message}`);
        //event.sender.send(`bot:error:${instanceName}`, err.message);
    }
}); 

ipcMain.on("bot:start", async (event, instanceName: string) => {
    try {
        await BotManager.startBot(instanceName);
    } catch (err: any) {
        console.error(`Erro ao iniciar bot: ${err.message}`);
        //event.sender.send(`bot:error:${instanceName}`, err.message);
    }
});

ipcMain.on("bot:delete", async (event, instanceName: string) => {
    try {
        await BotManager.deleteBot(instanceName);
    } catch (err: any) {
        console.error(`Erro ao deletar bot: ${err.message}`);
        //event.sender.send(`bot:error:${instanceName}`, err.message);
    }
});

ipcMain.on("app:stop-and-exit", async () => {
    try {
        await BotManager.destroyAll();
        app.quit();
    } catch (err: any) {
        console.error(`Erro ao parar e sair: ${err.message}`);
        app.quit();
    }
});


