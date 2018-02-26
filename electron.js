const electron		= require('electron');
const app			= electron.app;
const {ipcMain}		= require('electron');
const path			= require('path');
const BrowserWindow	= electron.BrowserWindow;

/*
	Keep a global reference to our window to prevent it being closed when
	garbage collection is performed.
*/
let gameWindow;

app.on('ready', () => {
	gameWindow = new BrowserWindow({
		titleBarStyle:		'hidden',
		minWidth:			1024,
		minHeight:			768,
		show:				false,
		icon:				path.join(__dirname, '/unstable/icon64.png')
	});
	gameWindow.setMenu(null);
	gameWindow.loadURL(`file://${__dirname}/unstable/index.html`);
	// gameWindow.webContents.openDevTools();

	gameWindow.once('ready-to-show', () => {
		gameWindow.show();
	});

	gameWindow.on('closed', function() {
		gameWindow = null;
	});
});

app.on('window-all-closed', function() {
	app.quit();
});

