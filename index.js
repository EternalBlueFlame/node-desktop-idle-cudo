const { app, BrowserWindow } = electron = require('electron');
//we need a "window" but we don't want one, so we make a null window so we can just take from the system screen itself.
let mainWindow = null;
//idle tracking vars
var cursorPosition =null;
var idleSeconds=0;

//tracks system power manager use. gets significant improvements with electron 10, otherwise is spotty on linux and win 10+. When it doesn't work there's just no action from it.
const {powerMonitor} = require('electron'); 

//class instancing through plugin loading is highly recommended, the main app asar will not load in a reasonable timeframe outside of something like nano, this wastes a lot of dev time.
// documentation on plugin loading https://beyondco.de/blog/plugin-system-for-electron-apps-part-1

//this should be called automatically on import to the main app. if not this class can easily be copies to a main class.
app.whenReady().then(() => {
	updateCursor();

	//TODO: disposable test method to prove result. remove this for real deployment.
	testCursor();
});


//uses an async thread to track cursor position and system idle every second.
const updateCursor = async () => {
	//checking cursor X and Y independently is not efficient, but the class instancing of cursorPosition has obscure data that prevents direct comparison.
	if(cursorPosition!=null
		&& cursorPosition.x == electron.screen.getCursorScreenPoint().x
		&& cursorPosition.y == electron.screen.getCursorScreenPoint().y){
		idleSeconds++;
	} else {
		idleSeconds=0;
		cursorPosition = electron.screen.getCursorScreenPoint();
	}

	//extra check to electron native idle detection, similar to old methods but proper cross-platform and more reliable, ish...
	// doesn't really work until node 10, and even then there's some holes, the cursor check is going to be the star of the script typically.
	//NOTE: <1 should be perfectly fine, but I gave an extra second buffer just in case something lags the hood.
	if(powerMonitor.getSystemIdleTime()<2) {
		idleSeconds=0;
	}

	//pause the thread for one second
	//TODO: this should be extended for the entire expected inactivity time or at least a larger portion of it for efficiency reasons
	await new Promise(resolve => setTimeout(resolve, 1000));
	updateCursor();

};

//call this to get the seconds it has been idle.
//in theory, the integer idleSeconds should be publicly accessible to a class instance so this feels redundant.
function getIdle(){
	return idleSeconds;
}

//TODO: disposable test, remove this for real deployment.
const testCursor = async () => {
	console.log("idle seconds " + getIdle());
	await new Promise(resolve => setTimeout(resolve, 2000));
	testCursor();

};
