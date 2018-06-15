'use strict';

// Import parts of electron to use
const {app, BrowserWindow} = require('electron');
const path = require('path')
const url = require('url')
const ipfsAPI = require('ipfs-api')
const HttpIPFS = require('ipfs/src/http')

const fixturesDir = __dirname + '/src/fixtures'

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

// Keep a reference for dev mode
let dev = false;
if ( process.defaultApp || /[\\/]electron-prebuilt[\\/]/.test(process.execPath) || /[\\/]electron[\\/]/.test(process.execPath) ) {
  dev = true;
}

const populateIpfs = () =>
  new Promise((resolve, reject) => {
    var ipfs = ipfsAPI('localhost', '5002', { protocol: 'http' })
    console.log('Populate IPFS...')
    ipfs.util.addFromFs(fixturesDir, { recursive: true }, (err, result) => {
      if (err) {
        return reject(err)
      }
      console.log(result);
      resolve(result)
    })
  })

  const startIpfs = (opts = {}) =>
  new Promise((resolve, reject) => {
    const httpAPI = new HttpIPFS(undefined, {
      Addresses: {
        API: '/ip4/0.0.0.0/tcp/5002',
        Gateway: '/ip4/0.0.0.0/tcp/1234'
      }
    })
    console.log('Start IPFS')
    httpAPI.start(true, async err => {
      if (err) {
        console.log('err', err)
        return reject(err)
      }
      resolve()
    })
  }).then(populateIpfs);

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1024, height: 1682, show: false
  });

  mainWindow.setResizable(false)

  // and load the index.html of the app.
  let indexPath;
  if ( dev && process.argv.indexOf('--noDevServer') === -1 ) {
    indexPath = url.format({
      protocol: 'http:',
      host: 'localhost:8080',
      pathname: 'index.html',
      slashes: true
    });
  } else {
    indexPath = url.format({
      protocol: 'file:',
      pathname: path.join(__dirname, 'dist', 'index.html'),
      slashes: true
    });
  }
  mainWindow.loadURL( indexPath );

  // Don't show until we are ready and loaded
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    // Open the DevTools automatically if developing
    if ( dev ) {
      mainWindow.webContents.openDevTools();
    }
  });

  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  createWindow();
  startIpfs();
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});
