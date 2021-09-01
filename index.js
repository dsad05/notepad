const electron = require('electron');

const { 
    BrowserWindow,
    app,
    ipcMain,
    dialog,
    Notification,
    Menu,
 } = electron;
const path = require("path");
const fs = require("fs");

let mainWindow;

app.on('ready', () => {
        mainWindow = new BrowserWindow({
        width: 850,
        height: 700,
        titleBarStyle: "hiddenInset",
        webPreferences: {
          preload: path.join(app.getAppPath(), "renderer.js"),
        }
    }); 
    mainWindow.loadFile('index.html');
    mainWindow.on('closed', () => app.quit());
    var ctrl = process.platform === 'darwin' ? 'Command' : 'Control'; // if apple's OS
    const menuTemplate = [
    {
      label: "File",
      submenu: [
        {
          label: "New file",
          accelerator: `${ctrl}+N`,
          click: () => createTab(),           // add createTab func & createWindow func
        },
         {
           label: "New window",         
         accelerator: `${ctrl}+Shift+N`,
           click: () => createWindow(),
         },
        {
          label: "Open",
          accelerator: `${ctrl}+O`,
          click: () => ipcMain.emit("open-document-triggered"),
        },
        {
          label: "Save",
          accelerator: `${ctrl}+S`,
          click: () => ipcMain.emit("save-document-triggered"),
        },
        {
          label: "Save as",
          accelerator: `${ctrl}+Shift+S`,
          click: () => ipcMain.emit("saveAs-document-triggered"),
        },
        { type: "separator" },
        {
          label: "Open Recent",
          role: "recentdocuments",
          submenu: [
            {
              label: "Clear Recent",
              role: "clearrecentdocuments",
            },
          ],
        },
        { type: "separator" },
        {
          label: "Exit",
          accelerator: `${ctrl}+Q`,
          role: "quit",
        },
      ],
    },
    {
      label: "Edit",
      submenu: [
        { role: "undo",
        accelerator: `${ctrl}+Z`},
        { role: "redo" ,
        accelerator: `${ctrl}+Y`},
        { type: "separator" },
        { role: "cut",
        accelerator: `${ctrl}+X`},
        { role: "copy",
        accelerator: `${ctrl}+C`},
        { role: "paste",
        accelerator: `${ctrl}+V`},
        { role: "pasteAndMatchStyle" },
        { role: "delete" },
        { role: "selectAll",
        accelerator: `${ctrl}+A`},
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);
});

const handleError = () => {
  new Notification({
    title: "Error",
    body: "Sorry, something went wrong :(",
  }).show();
};

const openFile = (filePath) => {
    fs.readFile(filePath, "utf8", (content) => {
        app.addRecentDocument(filePath);
        openedFilePath = filePath;
        mainWindow.webContents.send("document:opened", { filePath, content });
    });
};
  
app.on("open-file", (_, filePath) => {
    openFile(filePath);
});
ipcMain.on("open-document-triggered", () => {
  dialog
    .showOpenDialog({
      properties: ["openFile"],
      filters: [{ name: "text files", extensions: ["txt"] }],
    })
    .then(({ filePaths }) => {
      const filePath = filePaths[0];

      openFile(filePath);
    });
});

ipcMain.on("create-document-triggered", () => {
  dialog
    .showSaveDialog(mainWindow, {
      filters: [{ name: "text files", extensions: ["txt"] }],
    })
    .then(({ filePath }) => {
      fs.writeFile(filePath, "", (error) => {
        if (error) {
          handleError();
        } else {
          app.addRecentDocument(filePath);
          openedFilePath = filePath;
          mainWindow.webContents.send("document-created", filePath);
        }
      });
    });
});

ipcMain.on("file-content-updated", (_, textareaContent) => {
  fs.writeFile(openedFilePath, textareaContent, (error) => {
    if (error) {
      handleError();
    }
  });
});