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
let openedFilePath;


const env = process.env.NODE_ENV || 'development';

// If development environment
if (env === 'development') {
	try {
		require('electron-reloader')(module, {
			debug: true,
			watchRenderer: true
		});
	} catch (error) {
    //console.log(error);
  }	
}


function createWindow () {
        mainWindow = new BrowserWindow({
        width: 850,
        height: 700,
        titleBarStyle: "hiddenInset",
        webPreferences: {
          preload: path.join(app.getAppPath(), "renderer.js"),
        }
    });
    mainWindow.webContents.openDevTools();
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
          click: () => createWindow(),
                                                                // create new window func!!!
        },
        //  {
        //    label: "New window",         
        //  accelerator: `${ctrl}+Shift+N`,
        //    click: () => createWindow(),
        //  },
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
          click: () => ipcMain.emit("create-document-triggered"),
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
        // { role: "pasteAndMatchStyle" },
        { role: "delete" },
        { role: "selectAll",
        accelerator: `${ctrl}+A`},
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);
};

app.whenReady().then(() => {
  createWindow();
});

const handleError = () => {
  new Notification({
    title: "Error",
    body: "Sorry, something went wrong :(",
  }).show();
};

const openFile = (filePath) => {
  fs.readFile(filePath, "utf8", (error, content) => {
    if (error) {
      handleError();
    } else {
      // app.addRecentDocument(filePath);
      openedFilePath = filePath;
      mainWindow.webContents.send("document-opened", { filePath, content });
    }
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

function SaveAs(content) {
  try {
    dialog
    .showSaveDialog(mainWindow, {
      filters: [{ name: "text files", extensions: ["txt"] }],
    })
    .then(file => {
      console.log(content)
      console.log(file)
      fs.writeFile(file['filePath'], content, () => {
        openedFilePath = file['filePath'];
        mainWindow.webContents.send("document-created", file['filePath']);
      })
    });
  } catch (error) {
    // nothing
  }
}

ipcMain.on("create-document-triggered", (_, content) => {
  SaveAs(content);
});

ipcMain.on("file-content-updated", (_, textareaContent) => {
  // On textarea change
});

ipcMain.on("save-document-triggered", (_, content) => {
  try {
    if (!openedFilePath) {
      return SaveAs(content);
    }
    fs.writeFile(openedFilePath, content, () => {})
    new Notification({
      title: "File Saved",
      body: "File saved sucessfully",
    }).show();
  } catch (error) {
    throw error;
  }
});