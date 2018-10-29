Titanium.include('commonjs.js');

/* ------------------------------------------------------------------------ */

var org_basic_core = require('./org_basic_core.js');

/* ------------------------------------------------------------------------ */

Titanium.UI.setBadge(null);

/* ------------------------------------------------------------------------ */

var issues = {};

/* ------------------------------------------------------------------------ */

function emailReport() {
	var reportItems = [];
	
	for (var riskTitle in {'Critical Risk': 1, 'High Risk': 1, 'Medium Risk': 1, 'Low Risk': 1, 'Informational Finding': 1}) {
		if (riskTitle in issues) {
			var riskItem = issues[riskTitle];
			
			for (var issueTitle in riskItem) {
				var issueItem = riskItem[issueTitle];
				var item = [];
				
				item.push('<h1>' + issueTitle + '</h1>');
				item.push('<div>' + issueItem.statementDescription + '</div>');
				
				var entries = issueItem.entries;
				
				for (var i = 0; i < entries.length; i += 1) {
					item.push('<div>' + entries[i].statementDetails + '</div>');
				}
				
				reportItems.push(item.join('\n'));
			}
		}
	}
	
	var emailDialog = Titanium.UI.createEmailDialog({subject: 'Websecurify Report ' + (new Date()).toString(), toRecipients: [], html: true, messageBody: reportItems.join('<br/>')});
	
	if (emailDialog.isSupported()) {
		emailDialog.open();
	} else {
		Titanium.UI.createAlertDialog({title:'Warning', message:'Email not available.'}).show();
	}
}

function clearReport() {
	var alertDialog = Titanium.UI.createAlertDialog({title: 'Clear Report', message: 'Do you really want to clear the current report?', buttonNames: ['Yes', 'No'], cancel: 1});
	
	alertDialog.addEventListener('click', function (event) {
		if (event.index == 0) {
			Titanium.UI.currentWindow.setLeftNavButton(null);
			Titanium.UI.currentWindow.setRightNavButton(null);
			
			Titanium.UI.currentTab.setBadge(null);
			Titanium.UI.setBadge(null);
			
			issues = {};
			
			tableView.setData([]);
		}
	});
	
	alertDialog.show();
}

function addIssue(issue, statement) {
	if (Titanium.UI.currentWindow.getLeftNavButton() != emailButton) {
		Titanium.UI.currentWindow.setLeftNavButton(emailButton);
	}
	
	if (Titanium.UI.currentWindow.getRightNavButton() != clearButton) {
		Titanium.UI.currentWindow.setRightNavButton(clearButton);
	}
	
	var badge = Titanium.UI.currentTab.getBadge();
	
	badge = (badge ? badge : 0) + 1;
	
	Titanium.UI.currentTab.setBadge(badge);
	Titanium.UI.setBadge(badge);
	
	var risk = issue.risk;
	var issueTitle = issue.title;
	var riskTitle = 'Undefined Risk';
	
	if (risk == 'informational') {
		riskTitle = 'Informational Finding';
	} else
	if (risk == 'low') {
		riskTitle = 'Low Risk';
	} else
	if (risk == 'medium') {
		riskTitle = 'Medium Risk';
	} else
	if (risk == 'high') {
		riskTitle = 'High Risk';
	} else
	if (risk == 'critical') {
		riskTitle = 'Critical Risk';
	}
	
	if (!(riskTitle in issues)) {
		issues[riskTitle] = {};
	}
	
	var riskItem = issues[riskTitle];
	
	if (!(issueTitle in riskItem)) {
		riskItem[issueTitle] = {title: issueTitle, description: issue.description, solution: issue.solution, entries: [], statementDescription: statement.description};
	}
	
	var issueItem = riskItem[issueTitle];
	
	issueItem.entries.push({exact: issue.exact, statementDetails: statement.details});
	
	rebuildRisks();
	
	if (issuesWindow.title == riskTitle) {
		rebuildIssues(riskTitle);
	}
	
	if (entriesWindow.title == issueTitle) {
		rebuildEntries(riskTitle, issueTitle);
	}
}

function rebuildRisks() {
	var data = [];
	
	for (var riskTitle in {'Critical Risk': 1, 'High Risk': 1, 'Medium Risk': 1, 'Low Risk': 1, 'Informational Finding': 1}) {
		if (riskTitle in issues) {
			var riskRow = Titanium.UI.createTableViewRow({id: 'riskRow', className: 'riskRow', hasChild: true, riskTitle: riskTitle});
			var riskLabel = Titanium.UI.createLabel({id: 'riskLabel', text: riskTitle, touchEnabled: false, wordWrap: false, ellipsize: true});
			
			riskRow.add(riskLabel);
			
			var riskItem = issues[riskTitle];
			var issuesCount = 0;
			
			for (var issueTitle in riskItem) {
				issuesCount += 1;
			}
			
			if (issuesCount > 0) {
				var riskBadge = Titanium.UI.createLabel({id: 'riskBadge', text: issuesCount});
				
				riskRow.add(riskBadge);
			}
			
			data.push(riskRow);
		}
	}
	
	tableView.setData(data);
}

function rebuildIssues(riskTitle) {
	issuesWindow.title = riskTitle;
	
	var data = [];
	var riskItem = issues[riskTitle];
	
	for (var issueTitle in riskItem) {
		var issueRow = Titanium.UI.createTableViewRow({id: 'issueRow', className: 'issueRow', hasChild: true, riskTitle: riskTitle, issueTitle: issueTitle});
		var issueLabel = Titanium.UI.createLabel({id: 'issueLabel', text: issueTitle, touchEnabled: false, wordWrap: false, ellipsize: true});
		
		issueRow.add(issueLabel);
		
		var issueItem = riskItem[issueTitle];
		var entryCount = issueItem.entries.length;
		
		if (entryCount > 0) {
				var issueBadge = Titanium.UI.createLabel({id: 'issueBadge', text: entryCount});
				
				issueRow.add(issueBadge);
		}
		
		data.push(issueRow);
	}
	
	issuesTableView.setData(data);
}

function rebuildEntries(riskTitle, itemTitle) {
	entriesWindow.title = itemTitle;
	
	var data = [];
	var riskItem = issues[riskTitle];
	var issueItem = riskItem[itemTitle];
	var descriptionLabel = Titanium.UI.createLabel({id:'descriptionLabel', text: issueItem.description, touchEnabled: false});
	var descriptionRow = Titanium.UI.createTableViewRow({id: 'descriptionRow', className: 'descriptionRow', header: 'Description', hasChild: false, selectionStyle: Titanium.UI.iPhone.TableViewCellSelectionStyle.NONE});
	var solutionLabel = Titanium.UI.createLabel({id:'solutionLabel', text: issueItem.solution, touchEnabled: false});
	var solutionRow = Titanium.UI.createTableViewRow({id: 'solutionRow', className: 'solutionRow', header: 'Solution', hasChild: false, selectionStyle: Titanium.UI.iPhone.TableViewCellSelectionStyle.NONE});
	
	descriptionRow.add(descriptionLabel);
	solutionRow.add(solutionLabel);
	
	data.push(descriptionRow);
	data.push(solutionRow);
	
	var entries = issueItem.entries;
	
	for (var i = 0; i < entries.length; i += 1) {
		var exactRow = Titanium.UI.createTableViewRow({id: 'exactRow', className: 'exactRow', header: (i == 0 ? 'Entries' : null), hasChild: false, selectionStyle: Titanium.UI.iPhone.TableViewCellSelectionStyle.NONE});
		var exactLabel = Titanium.UI.createLabel({id:'exactLabel', text: entries[i].exact, touchEnabled: false});
		
		exactRow.add(exactLabel);
		
		data.push(exactRow);
	}
	
	entriesTableView.setData(data);
}

/* ------------------------------------------------------------------------ */

var tableView = Titanium.UI.createTableView({id: 'tableView', style: Titanium.UI.iPhone.TableViewStyle.GROUPED, separatorStyle: Titanium.UI.iPhone.TableViewSeparatorStyle.NONE});

Titanium.UI.currentWindow.add(tableView);

/* ------------------------------------------------------------------------ */

tableView.addEventListener('click', function (event) {
	var riskTitle = event.rowData.riskTitle;
	
	rebuildIssues(riskTitle);
	
	Titanium.UI.currentTab.open(issuesWindow, {animated: true});
});

/* ------------------------------------------------------------------------ */

var issuesWindow = Titanium.UI.createWindow({id: 'issuesWindow'});
var issuesTableView = Titanium.UI.createTableView({id: 'issuesTableView', style: Titanium.UI.iPhone.TableViewStyle.GROUPED, separatorStyle: Titanium.UI.iPhone.TableViewSeparatorStyle.NONE});

issuesWindow.add(issuesTableView);

/* ------------------------------------------------------------------------ */

issuesWindow.addEventListener('focus', function (event) {
	rebuildIssues(issuesWindow.title);
});

/* ------------------------------------------------------------------------ */

var entriesWindow = Titanium.UI.createWindow({id: 'entriesWindow'});
var entriesTableView = Titanium.UI.createTableView({id: 'entriesTableView', style: Titanium.UI.iPhone.TableViewStyle.GROUPED, separatorStyle: Titanium.UI.iPhone.TableViewSeparatorStyle.NONE});

entriesWindow.add(entriesTableView);

/* ------------------------------------------------------------------------ */

issuesTableView.addEventListener('click', function (event) {
	var riskTitle = event.rowData.riskTitle;
	var issueTitle = event.rowData.issueTitle;
	
	rebuildEntries(riskTitle, issueTitle);
	
	Titanium.UI.currentTab.open(entriesWindow, {animated: true});
});

/* ------------------------------------------------------------------------ */

var emailButton = Titanium.UI.createButton({id: 'emailButton', title: 'Email', style: Titanium.UI.iPhone.SystemButtonStyle.PLAIN});

emailButton.addEventListener('click', function (event) {
	emailReport();
});

var clearButton = Titanium.UI.createButton({id: 'clearButton', title: 'Clear', style: Titanium.UI.iPhone.SystemButtonStyle.PLAIN});

clearButton.addEventListener('click', function (event) {
	clearReport();
});

/* ------------------------------------------------------------------------ */

function handleTestFinished(event) {
	var issuesCount = 0;
	
	for (var riskTitle in issues) {
		var riskItem = issues[riskTitle];
		
		for (var issueTitle in riskItem) {
			var issueItem = riskItem[issueTitle];
			
			issuesCount += issueItem.entries.length;
		}
	}
	
	var alertDialog = Titanium.UI.createAlertDialog({title: 'Test Completed', message: 'The current test completed. ' + issuesCount + ' issues were identified!'});
	
	alertDialog.show();
}

Titanium.App.addEventListener('testFinished', handleTestFinished);

function handleIssueIdentified(event) {
	addIssue(event.issue, event.statement);
}

Titanium.App.addEventListener('issueIdentified', handleIssueIdentified);
