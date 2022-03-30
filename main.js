/** @format */

const path = require("path");
const url = require("url");
const { app, BrowserWindow, ipcMain, Menu, dialog } = require("electron");
const Log = require("./models/Log");
const connectDB = require("./config/db");
const getAllFilesByExtension = require("./src/service/getAllFilesByExtension");

const featureParser = require("./src/service/featureParser");
const featureDataTransformer = require("./src/service/featureDataTransformer");

// Connect to database
connectDB();

let mainWindow;

let isDev = false;
const isMac = process.platform === "darwin" ? true : false;

if (
  process.env.NODE_ENV !== undefined &&
  process.env.NODE_ENV === "development"
) {
  isDev = true;
}

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: isDev ? 1400 : 1100,
    height: 800,
    show: false,
    backgroundColor: "white",
    icon: `${__dirname}/assets/icons/icon.png`,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  let indexPath;

  if (isDev && process.argv.indexOf("--noDevServer") === -1) {
    indexPath = url.format({
      protocol: "http:",
      host: "localhost:8080",
      pathname: "index.html",
      slashes: true,
    });
  } else {
    indexPath = url.format({
      protocol: "file:",
      pathname: path.join(__dirname, "dist", "index.html"),
      slashes: true,
    });
  }

  mainWindow.loadURL(indexPath);

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();

    // Open devtools if dev
    if (isDev) {
      const {
        default: installExtension,
        REACT_DEVELOPER_TOOLS,
      } = require("electron-devtools-installer");

      installExtension(REACT_DEVELOPER_TOOLS).catch((err) =>
        console.log("Error loading React DevTools: ", err)
      );
      mainWindow.webContents.openDevTools();
    }
  });

  mainWindow.on("closed", () => (mainWindow = null));
}

app.on("ready", () => {
  createMainWindow();

  const mainMenu = Menu.buildFromTemplate(menu);
  Menu.setApplicationMenu(mainMenu);
});

const menu = [
  ...(isMac ? [{ role: "appMenu" }] : []),
  {
    role: "fileMenu",
  },
  {
    role: "editMenu",
  },
  {
    label: "Logs",
    submenu: [
      {
        label: "Clear Logs",
        click: () => clearLogs(),
      },
    ],
  },
  ...(isDev
    ? [
        {
          label: "Developer",
          submenu: [
            { role: "reload" },
            { role: "forcereload" },
            { type: "separator" },
            { role: "toggledevtools" },
          ],
        },
      ]
    : []),
];

// Load logs
ipcMain.on("logs:load", sendLogs);

ipcMain.on("files:get", (e, rootPath) => {
  let files = getFiles(rootPath, "feature");
  getFeatureModel(files);
});

ipcMain.on("openDir", async (event, path) => {
  const options = {
    title: "Select directory to scan",
    //defaultPath: '/path/to/something/',
    //buttonLabel: 'Do it',
    /*filters: [
        { name: 'xml', extensions: ['xml'] }
      ],*/
    //properties: ['showHiddenFiles'],
    properties: ["openDirectory"],
    //message: 'This message will only be shown on macOS'
  };

  const result = await dialog.showOpenDialog(mainWindow, options);
  // dialog.showOpenDialog(function (fileNames) {

  //   if (fileNames === undefined) {
  //     console.log("No directory selected");
  //   } else {
  //     console.log(`selected dir: ${fileNames[0]}`)
  //   }
  // });

  mainWindow.webContents.send(
    "directory:set",
    JSON.stringify(result.filePaths[0])
  );
});

// Create log
ipcMain.on("logs:add", async (e, item) => {
  try {
    await Log.create(item);
    sendLogs();
  } catch (err) {
    console.log(err);
  }
});

// Delete log
ipcMain.on("logs:delete", async (e, id) => {
  try {
    await Log.findOneAndDelete({ _id: id });
    sendLogs();
  } catch (err) {
    console.log(err);
  }
});

function getFiles(rootPath, extension) {
  console.log(`root path: ${rootPath}`);
  const featureList = getAllFilesByExtension(rootPath, extension).map((f) => {
    const featureEntry = featureParser(f);
    const featureTransformedDescriptor = featureDataTransformer(
      featureEntry,
      f
    );
    return featureTransformedDescriptor;
  });
  const display = featureList.slice(2, 24);
  const display2 = display.map((x) => x[0]);
  console.log(
    `Files found with extension transform ${extension}: ${JSON.stringify(
      display2
    )}`
  );
  return display2;
}

function getFeatureModel(files) {
  console.log(`sending feature files to renderer ${JSON.stringify(files)}`);
  mainWindow.webContents.send("features:get", JSON.stringify(files));
  console.log("getting features model");
}

// Send log items
async function sendLogs() {
  try {
    const logs = await Log.find().sort({ created: 1 });
    mainWindow.webContents.send("logs:get", JSON.stringify(logs));
  } catch (err) {
    console.log(err);
  }
}

// Clear all logs
async function clearLogs() {
  try {
    await Log.deleteMany({});
    mainWindow.webContents.send("logs:clear");
  } catch (err) {
    console.log(err);
  }
}

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    createMainWindow();
  }
});

// Stop error
app.allowRendererProcessReuse = true;
