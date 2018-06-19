'use strict';
const {app, BrowserWindow} = require('electron');
const path = require('path')
const url = require('url')
const ipfsAPI = require('ipfs-api')
const HttpIPFS = require('ipfs/src/http')
const fixturesDir = __dirname + '/src/fixtures'
const IPFSFactory = require('ipfsd-ctl')
const f = IPFSFactory.create()
let mainWindow;

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
  mainWindow = new BrowserWindow({
    width: 1024, height: 1682, show: false
  });

  mainWindow.setResizable(false)

  mainWindow.maximize();

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

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    if ( dev ) {
      mainWindow.webContents.openDevTools();
    }
  });

  mainWindow.on('closed', function() {
    mainWindow = null;
  });
}

app.on('ready', () => {
  createWindow();

  f.spawn(function (err, ipfsd) {
    if (err) { throw err }
    ipfsd.start([], (err, ipfsApi) => {
      global.ipfsApi = ipfsApi;
    });
    
    ipfsd.api.id(function (err, id) {
      if (err) { throw err }
    })
  })
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
