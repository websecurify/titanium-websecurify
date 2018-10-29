var homeWindow = Titanium.UI.createWindow({id: 'homeWindow', title: 'Home', url: 'home.js'});
var homeTab = Titanium.UI.createTab({id: 'homeTab', title: 'Home', icon: 'house.png', window: homeWindow});
var reportWindow = Titanium.UI.createWindow({id: 'reportWindow', title: 'Report', url: 'report.js'});
var reportTab = Titanium.UI.createTab({id: 'reportTab', title: 'Report', icon: 'chart.png', window: reportWindow});
var targetsWindow = Titanium.UI.createWindow({id: 'targetsWindow', title: 'Targets', url: 'targets.js'});
var targetsTab = Titanium.UI.createTab({id: 'targetsTab', title: 'Targets', icon: 'radiation.png', window: targetsWindow});
var tabGroup = Titanium.UI.createTabGroup({id: 'tabGroup', visible: false});

tabGroup.addTab(homeTab);
tabGroup.addTab(reportTab);
tabGroup.addTab(targetsTab);
tabGroup.open();

/* ------------------------------------------------------------------------ */

function createWorkerWindow() {
	var workerWindow = Titanium.UI.createWindow({id: 'workerWindow', url: 'worker.js', visible: false});
	
	workerWindow.open();
	
	return workerWindow;
}

var workerWindow = createWorkerWindow();

/* ------------------------------------------------------------------------ */

Titanium.App.addEventListener('testStarted', function (event) {
	tabGroup.activeTab = homeTab;
});

Titanium.App.addEventListener('testFinished', function (event) {
	tabGroup.activeTab = reportTab;
	
	workerWindow.close();
	
	workerWindow = createWorkerWindow();
});

Titanium.App.addEventListener('issueIdentified', function (event) {
	showMessage(event.issue.title);
});

/* ------------------------------------------------------------------------ */

var tosWindow = Titanium.UI.createWindow({id: 'tosWindow', title: 'Terms of Service', url: 'tos.js'});

tosWindow.open({transition: Titanium.UI.iPhone.AnimationStyle.FLIP_FROM_RIGHT});

/* ------------------------------------------------------------------------ */

tosWindow.addEventListener('closing', function (event) {
	tabGroup.visible = true;
	
	Titanium.UI.backgroundImage = 'background.png';
	
	tosWindow.close({transition: Titanium.UI.iPhone.AnimationStyle.FLIP_FROM_RIGHT});
});

/* ------------------------------------------------------------------------ */

var messageWindow = Titanium.UI.createWindow({id: 'messageWindow', touchEnabled: false});
var messageView = Titanium.UI.createView({id: 'messageView', touchEnabled: false, opacity: 0});
var messageLebel = Titanium.UI.createLabel({id: 'messageLabel', touchEnabled: false, wordWrap: false, ellipsize: true});

messageWindow.add(messageView);
messageView.add(messageLebel);

/* ------------------------------------------------------------------------ */

messageWindow.open();

/* ------------------------------------------------------------------------ */

function showMessage(message) {
	if (messageWindow.timeout) {
		clearTimeout(messageWindow.timeout);
	}
	
	messageView.opacity = 1;
	messageLebel.text = message;
	
	messageWindow.timeout = setTimeout(function () {
		messageWindow.timeout = null;
		
		var animation = Titanium.UI.createAnimation({opacity: 0, duration: 1000});
		
		messageView.animate(animation);
	}, 1000);
}

/* ------------------------------------------------------------------------ */

setTimeout(function () {
	tabGroup.activeTab = reportTab;
	
	setTimeout(function () {
		tabGroup.activeTab = targetsTab;
		
		setTimeout(function () {
			tabGroup.activeTab = homeTab;
		}, 1);
	}, 1);
}, 1);
