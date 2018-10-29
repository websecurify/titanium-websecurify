Titanium.include('commonjs.js');

/* ------------------------------------------------------------------------ */

var org_basic_core = require('./org_basic_core.js');
var org_basic_specific = require('./org_basic_specific.js');
var org_basic_concrete = require('./org_basic_concrete.js');
var org_basic_webacid = require('./org_basic_webacid.js');
var com_mobile_webacid = require('./com_mobile_webacid.js');
var org_basic_http = require('./org_basic_http.js');

/* ------------------------------------------------------------------------ */

var engine = null;

/* ------------------------------------------------------------------------ */

function Engine() {
	this.workspace = new org_basic_concrete.TestWorkspace();
	this.client = new org_basic_concrete.TestClient();
	this.scheduler = new org_basic_webacid.Scheduler(this.workspace, this.client, 20);
	this.reporter = new org_basic_concrete.TestReporter(this.workspace);
	this.progressor = new org_basic_webacid.Progressor(this.scheduler, 10);
	this.engine = new com_mobile_webacid.MobileEngine(this.workspace, this.scheduler, this.reporter, this.progressor);
	
	this.reporter.registerObserver(this);
	this.progressor.registerObserver(this);
}

Engine.prototype.fireEvent = function (event, data) {
	Titanium.App.fireEvent(event, data);
};

Engine.prototype.launch = function (target) {
	try {
		this.url = org_basic_http.Url.parse(target);
	} catch (e) {
		this.fireEvent('testFailedLaunching', {target: this.url.make()});
		
		return;
	}
	
	this.engine.launchUrl(this.url);
	
	this.fireEvent('testStarted', {target: this.url.make()});
};

Engine.prototype.terminate = function () {
	this.scheduler.pause();
	
	this.workspace = null;
	this.client = null;
	this.scheduler = null;
	this.reporter = null;
	this.progressor = null;
	this.engine = null;
	
	this.fireEvent('testFinished', {target: this.url.make()});
};

Engine.prototype.pause = function () {
	this.scheduler.pause();
};

Engine.prototype.resume = function () {
	this.scheduler.resume();
};

Engine.prototype.extractRisk = function (level) {
	switch (level) {
		case 'LEVEL00':
		case 'LEVEL01':
			return 'informational';
			
		case 'LEVEL02':
			return 'low';
			
		case 'LEVEL03':
		case 'LEVEL04':
		case 'LEVEL05':
			return 'medium';
			
		case 'LEVEL06':
		case 'LEVEL07':
			return 'high';
			
		case 'LEVEL08':
		case 'LEVEL09':
		case 'LEVEL10':
			return 'critical';
	}
};

Engine.prototype.splitDescription = function (text) {
	return org_basic_core.HtmlUtils.unescapeHtmlComponent(text.replace(/<\/?\w+>/g, '')).replace(/\n+|\r+/g, ' ').replace(/\s+/g, ' ').trim().split(/solution: /).map(function (item) {
		return item.trim();
	});
};

Engine.prototype.reformatExact = function (text) {
	if (text.length > 300) {
		text = text.substring(0, 300);
		
		if (text.substring(text.length - 3, text.length) != '...') {
			text += '...';
		}
	}
	
	return text;
};

Engine.prototype.handleReportedStatement = function (statement) {
	var level = statement.getLevel().value;
	var title = statement.getTitle();
	var summary = statement.getSummary();
	var description = statement.getDescription();
	var details = statement.getDetails();
	var exact = statement.getExact();
	
	statement = {level: level, title: title, summary: summary,  description: description, details: details, exact: exact};
	
	var risk = this.extractRisk(level);
	var result = this.splitDescription(description);
	var issueDescription = result[0];
	var issueSolution = result[1];
	var issueExact = this.reformatExact(exact);
	var issue = {risk: risk, title: title, summary: summary, description: issueDescription, solution: issueSolution, exact: issueExact};
	
	this.fireEvent('issueIdentified', {statement: statement, issue: issue});
};

Engine.prototype.handleProgressNotification = function (percentage, step, steps, status) {
	this.fireEvent('progressUpdated', {progress: {percentage:percentage, step:step, steps:steps, status:status}});
	
	if (percentage == 100) {
		this.terminate();
	}
};

/* ------------------------------------------------------------------------ */
	
function startTest(event) {
	engine = new Engine();
	
	engine.launch(event.target);
}

Titanium.App.addEventListener('startTest', startTest);

function stopTest(event) {
	engine.terminate();
	
	engine = null;
}

Titanium.App.addEventListener('stopTest', stopTest);
