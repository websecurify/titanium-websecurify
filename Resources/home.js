Titanium.include('commonjs.js');

/* ------------------------------------------------------------------------ */

var org_basic_http = require('./org_basic_http.js');

/* ------------------------------------------------------------------------ */

var targetToolbar = Titanium.UI.createToolbar({id: 'targetToolbar'});

Titanium.UI.currentWindow.add(targetToolbar);

var targetField = Titanium.UI.createTextField({id: 'targetField', hintText: 'http://', autocorrect: false, keyboardType: Titanium.UI.KEYBOARD_URL, returnKeyType: Titanium.UI.RETURNKEY_GO, borderStyle: Titanium.UI.INPUT_BORDERSTYLE_ROUNDED, autocapitalization: Titanium.UI.TEXT_AUTOCAPITALIZATION_NONE, clearButtonMode: Titanium.UI.INPUT_BUTTONMODE_ONFOCUS});

Titanium.UI.currentWindow.add(targetField);

var targetBorder = Titanium.UI.createView({id: 'targetBorder'});

Titanium.UI.currentWindow.add(targetBorder);

/* ------------------------------------------------------------------------ */

targetField.addEventListener('return', function (event) {
	handleLaunchTest({target: event.value});
});

/* ------------------------------------------------------------------------ */

var tableView = Titanium.UI.createTableView({id: 'tableView', style: Titanium.UI.iPhone.TableViewStyle.GROUPED, separatorStyle: Titanium.UI.iPhone.TableViewSeparatorStyle.NONE});

Titanium.UI.currentWindow.add(tableView);

/* ------------------------------------------------------------------------ */

var taskRow = Titanium.UI.createTableViewRow({id: 'taskRow', hasChild: false, selectionStyle: Titanium.UI.iPhone.TableViewCellSelectionStyle.NONE});
var stopRow = Titanium.UI.createTableViewRow({id: 'stopRow', hasChild: false});

/* ------------------------------------------------------------------------ */

var taskImageView = Titanium.UI.createImageView({id: 'taskImageView'});

taskRow.add(taskImageView);

var taskProgressBar = Titanium.UI.createProgressBar({id: 'taskProgressBar', value: 0, message: 'starting...', style: Titanium.UI.iPhone.ProgressBarStyle.PLAIN});

taskRow.add(taskProgressBar);

var stopLabel = Titanium.UI.createLabel({id: 'stopLabel', text: 'Stop', touchEnabled: false, wordWrap: false, ellipsize: true});

stopRow.add(stopLabel);

/* ------------------------------------------------------------------------ */

taskProgressBar.show();

/* ------------------------------------------------------------------------ */

stopRow.addEventListener('click', function (event) {
	handleTerminateTest({target: targetField.value});
});

/* ------------------------------------------------------------------------ */

function handleLaunchTest(event) {
	var target = event.target;
	
	if (!target) {
		return;
	}
	
	target = target + '';
	target = target.trim();
	
	if (!target) {
		return;
	}
	
	if (!target.match(/^https?:\/\//i)) {
		target = 'http://' + target;
	}
	
	var url = null;
	
	try {
		url = org_basic_http.Url.parse(target).make();
	} catch (e) {
		var alertDialog = Titanium.UI.createAlertDialog({title: 'Ivalid Target', message: 'Invalid target url ' + target + '!'});
		
		alertDialog.show();
		
		return;
	}
	
	if (targetField.enabled == false) {
		var alertDialog = Titanium.UI.createAlertDialog({title: 'Running Test', message: 'There is already a test underway. Do you want to stop it and test ' + target + ' instead?', buttonNames: ['Yes', 'No'], cancel: 1});
		
		alertDialog.addEventListener('click', function (event) {
			if (event.index == 0) {
				Titanium.App.fireEvent('stopTest', {target: target});
				Titanium.App.fireEvent('startTest', {target: target});
			}
		});
		
		alertDialog.show();
	} else {
		var alertDialog = Titanium.UI.createAlertDialog({title: 'Start Test', message: 'Are you sure you want to test ' + target + '?', buttonNames: ['Yes', 'No'], cancel: 1});
		
		alertDialog.addEventListener('click', function (event) {
			if (event.index == 0) {
				Titanium.App.fireEvent('startTest', {target: target});
			}
		});
		
		alertDialog.show();
	}
}

Titanium.App.addEventListener('launchTest', handleLaunchTest);

function handleTerminateTest(event) {
	var target = event.target;
	var alertDialog = Titanium.UI.createAlertDialog({title: 'Stop Test', message: 'Are you sure you want to stop the current test?', buttonNames: ['Yes', 'No'], cancel: 1});
	
	alertDialog.addEventListener('click', function (event) {
		if (event.index == 0) {
			Titanium.App.fireEvent('stopTest', {target: target});
		}
	});
	
	alertDialog.show();
}

Titanium.App.addEventListener('terminateTest', handleTerminateTest);

function handleTestStarted(event) {
	targetField.value = event.target;
	targetField.enabled = false;
	targetField.color = '#cccccc';
	taskProgressBar.value = 0;
	taskProgressBar.message = 'starting...';
	
	tableView.setData([taskRow, stopRow]);
}

Titanium.App.addEventListener('testStarted', handleTestStarted);

function handleTestFinished(event) {
	targetField.value = event.target;
	targetField.enabled = true;
	targetField.color = '#000000';
	taskProgressBar.value = 0;
	taskProgressBar.message = '';
	
	tableView.setData([]);
}

Titanium.App.addEventListener('testFinished', handleTestFinished);

function handleProgressUpdated(event) {
	taskProgressBar.value = event.progress.percentage / 100;
	taskProgressBar.message = event.progress.status;
}

Titanium.App.addEventListener('progressUpdated', handleProgressUpdated);
