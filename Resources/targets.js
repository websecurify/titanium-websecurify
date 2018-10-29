Titanium.include('config.js');
Titanium.include('commonjs.js');

/* ------------------------------------------------------------------------ */

var org_basic_http = require('./org_basic_http.js');

/* ------------------------------------------------------------------------ */

var targets = [];

/* ------------------------------------------------------------------------ */

var tableView = Titanium.UI.createTableView({id: 'tableView', style: Titanium.UI.iPhone.TableViewStyle.GROUPED, separatorStyle: Titanium.UI.iPhone.TableViewSeparatorStyle.NONE});

Titanium.UI.currentWindow.add(tableView);

/* ------------------------------------------------------------------------ */

tableView.addEventListener('click', function (event) {
	Titanium.App.fireEvent('launchTest', {target: event.rowData.target});
});

tableView.addEventListener('delete',function (event) {
	targets.splice(event.index, 1);
	
	Titanium.App.Properties.setList('targets', targets);
	
	if (targets.length == 0) {
		tableView.editing = false;
		
		Titanium.UI.currentWindow.setRightNavButton(null);
	}
});

/* ------------------------------------------------------------------------ */

var editButton = Titanium.UI.createButton({id: 'editButton', title: 'Edit', style: Titanium.UI.iPhone.SystemButtonStyle.PLAIN});

editButton.addEventListener('click', function () {
	Titanium.UI.currentWindow.setRightNavButton(doneButton);
	
	tableView.editing = true;
});

var doneButton = Titanium.UI.createButton({id: 'doneButton', title: 'Done', style: Titanium.UI.iPhone.SystemButtonStyle.DONE});

doneButton.addEventListener('click', function () {
	if (targets.length > 0) {
		Titanium.UI.currentWindow.setRightNavButton(editButton);
	} else {
		Titanium.UI.currentWindow.setRightNavButton(null);
	}
	
	tableView.editing = false;
});

/* ------------------------------------------------------------------------ */

function rebuildTargets() {
	targets = Titanium.App.Properties.getList('targets');
	
	if (!targets) {
		targets = [];
	}
	
	if (targets.length == 0 && BETA) {
		targets = [
			'http://demo.testfire.net/',
			'http://testphp.vulnweb.com/',
			'http://testasp.vulnweb.com/',
			'http://testaspnet.vulnweb.com/',
			'http://zero.webappsecurity.com/',
			'http://crackme.cenzic.com/',
			'http://www.webscantest.com/'
		];
	}
	
	var data = [];
	
	for (var i = 0; i < targets.length; i += 1) {
		var target = targets[i];
		var title = org_basic_http.Url.parse(target).getHost().make();
		var targetRow = Titanium.UI.createTableViewRow({id: 'targetRow', className: 'targetRow', hasChild: false, target: target});
		var titleLabel = Titanium.UI.createLabel({id: 'titleLabel', text: title, touchEnabled: false, wordWrap: false, ellipsize: true});
		var targetLabel = Titanium.UI.createLabel({id: 'targetLabel', text: target, touchEnabled: false, wordWrap: false, ellipsize: true});
		
		targetRow.add(titleLabel);
		targetRow.add(targetLabel);
		
		data.push(targetRow);
	}
	
	tableView.setData(data);
	
	if (data.length > 0) {
		Titanium.UI.currentWindow.setRightNavButton(editButton);
	} else {
		Titanium.UI.currentWindow.setRightNavButton(null);
	}
}

/* ------------------------------------------------------------------------ */

rebuildTargets();

/* ------------------------------------------------------------------------ */

function handleTestStarted(event) {
	var targets = Titanium.App.Properties.getList('targets');
	
	if (!targets) {
		targets = [];
	}
	
	var target = event.target;
	var index = targets.indexOf(target);
	
	if (index < 0) {
		targets.unshift(target);
	} else {
		targets.splice(index, 1);
		targets.unshift(target);
	}
	
	Titanium.App.Properties.setList('targets', targets);
	
	rebuildTargets();
}

Titanium.App.addEventListener('testStarted', handleTestStarted);
