import { app, BrowserWindow, Menu } from "electron";
import fs from "fs";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow;
let server;

const distDir = path.join(__dirname, "dist");
const serverHost = "localhost";
const isDev = process.env.NODE_ENV === "development" || !fs.existsSync(distDir);

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".webmanifest": "application/manifest+json",
  ".map": "application/json; charset=utf-8",
};

function getContentType(filePath) {
  return (
    mimeTypes[path.extname(filePath).toLowerCase()] ||
    "application/octet-stream"
  );
}

function serveStaticFile(requestPath, response) {
  const cleanedPath = requestPath === "/" ? "/index.html" : requestPath;
  const resolvedPath = path.normalize(path.join(distDir, cleanedPath));

  if (!resolvedPath.startsWith(path.normalize(distDir))) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  const fallbackPath = path.join(distDir, "index.html");
  const filePath = fs.existsSync(resolvedPath) ? resolvedPath : fallbackPath;

  try {
    const fileBuffer = fs.readFileSync(filePath);
    const isHtml = path.extname(filePath).toLowerCase() === ".html";
    response.writeHead(200, {
      "Content-Type": getContentType(filePath),
      "Cache-Control": "no-store",
      ...(isHtml
        ? {
            "Content-Security-Policy": [
              "default-src 'self'",
              "script-src 'self' https://apis.google.com https://www.gstatic.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com data:",
              "img-src 'self' data: blob: https:",
              "connect-src 'self' http://127.0.0.1:* http://localhost:* ws://127.0.0.1:* ws://localhost:* https://*.firebaseio.com https://*.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://www.googleapis.com https://firestore.googleapis.com https://firebasestorage.googleapis.com",
              "frame-src 'self' https://accounts.google.com https://*.firebaseapp.com",
              "worker-src 'self' blob:",
              "media-src 'self' blob:",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
          }
        : {}),
    });
    response.end(fileBuffer);
  } catch (error) {
    console.error("Static file error:", error);
    response.writeHead(500);
    response.end("Internal Server Error");
  }
}

function startStaticServer() {
  return new Promise((resolve, reject) => {
    server = http.createServer((request, response) => {
      const requestUrl = new URL(request.url, `http://${serverHost}`);
      serveStaticFile(requestUrl.pathname, response);
    });

    server.on("error", reject);

    server.listen(0, serverHost, () => {
      const address = server.address();
      resolve(address.port);
    });
  });
}

function enableAutoStart() {
  try {
    // On Windows and macOS, register the app to start on login
    const exePath = app.getPath("exe");
    const args = app.isPackaged ? [] : [app.getAppPath()];

    if (process.platform === "win32") {
      // Windows: Use setLoginItemSettings for registry auto-start
      app.setLoginItemSettings({
        openAtLogin: true,
        path: exePath,
        args: args,
        enabled: true,
      });
      console.log("Auto-start enabled on Windows");
    } else if (process.platform === "darwin") {
      // macOS: Use setLoginItemSettings for Launch Agent
      app.setLoginItemSettings({
        openAtLogin: true,
        enabled: true,
      });
      console.log("Auto-start enabled on macOS");
    } else if (process.platform === "linux") {
      // Linux: Create desktop file in autostart directory
      const autoStartDir = path.join(
        process.env.HOME || process.env.USERPROFILE || "/root",
        ".config/autostart",
      );
      const desktopFile = path.join(autoStartDir, "trackit.desktop");

      if (!fs.existsSync(autoStartDir)) {
        fs.mkdirSync(autoStartDir, { recursive: true });
      }

      const desktopContent = `[Desktop Entry]
  Type=Application
  Version=1.0
  Name=TrackIT
  Comment=Study and Task Tracking Application
  Exec="${exePath}" ${args.map((arg) => `"${arg}"`).join(" ")}
  StartupNotify=true
  Terminal=false
  `;

      fs.writeFileSync(desktopFile, desktopContent);
      console.log("Auto-start enabled on Linux");
    }
  } catch (error) {
    console.error("Failed to enable auto-start:", error);
  }
}

function createAppMenu() {
  const isMac = process.platform === "darwin";
  const isAutoStartEnabled = app.getLoginItemSettings?.().openAtLogin || false;

  const template = [
    ...(isMac
      ? [
          {
            label: "TrackIT",
            submenu: [
              { role: "about" },
              { type: "separator" },
              { role: "services" },
              { type: "separator" },
              { role: "hide" },
              { role: "hideOthers" },
              { role: "unhide" },
              { type: "separator" },
              { role: "quit" },
            ],
          },
        ]
      : []),
    {
      label: "File",
      submenu: [
        {
          label: "Start on System Boot",
          type: "checkbox",
          checked: isAutoStartEnabled,
          click: (menuItem) => {
            if (menuItem.checked) {
              enableAutoStart();
            } else {
              const exePath = app.getPath("exe");
              const args = app.isPackaged ? [] : [app.getAppPath()];
              if (process.platform === "linux") {
                const desktopFile = path.join(
                  process.env.HOME || process.env.USERPROFILE || "/root",
                  ".config/autostart/trackit.desktop",
                );
                if (fs.existsSync(desktopFile)) {
                  fs.unlinkSync(desktopFile);
                }
              } else {
                app.setLoginItemSettings({
                  openAtLogin: false,
                  path: exePath,
                  args: args,
                });
              }
            }
          },
        },
        { type: "separator" },
        isMac ? { role: "close" } : { role: "quit" },
      ],
    },
    {
      label: "Edit",
      submenu: [
        { role: "undo" },
        { role: "redo" },
        { type: "separator" },
        { role: "cut" },
        { role: "copy" },
        { role: "paste" },
      ],
    },
    {
      label: "View",
      submenu: [
        { role: "reload" },
        { role: "forceReload" },
        { role: "toggleDevTools" },
        { type: "separator" },
        { role: "resetZoom" },
        { role: "zoomIn" },
        { role: "zoomOut" },
        { type: "separator" },
        { role: "togglefullscreen" },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

function getAppIcon() {
  const iconPath = path.join(__dirname, "resources", "icon.png");
  if (fs.existsSync(iconPath)) {
    return iconPath;
  }
  return undefined;
}

function createWindow() {
  console.log("Creating window...");

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: false,
      enableRemoteModule: false,
    },
    icon: getAppIcon(),
    show: false, // Don't show until ready
  });

  // Center window on screen
  mainWindow.center();

  // Build the file URL
  const loadUrl = `http://${serverHost}:${server.address().port}`;

  console.log("Loading URL:", loadUrl);

  mainWindow.loadURL(loadUrl).catch((err) => {
    console.error("Failed to load URL:", err);
  });

  // Show window when ready
  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });

  // Open DevTools only in development
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on("closed", function () {
    mainWindow = null;
  });
}

// Handle app ready
app.on("ready", async function () {
  try {
    console.log("App is ready");
    const port = await startStaticServer();
    console.log("Static server listening on port:", port);
    createAppMenu();
    createWindow();
  } catch (error) {
    console.error("Failed to start app server:", error);
    app.quit();
  }
});

// Handle window closed
app.on("window-all-closed", function () {
  // On macOS, apps typically stay open until explicitly quit
  if (process.platform !== "darwin") {
    if (server) {
      server.close();
    }
    app.quit();
  }
});

// Handle app activate (macOS)
app.on("activate", function () {
  if (mainWindow === null) {
    createWindow();
  }
});
