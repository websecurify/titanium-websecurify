var introductionLabel = Titanium.UI.createLabel({id:'introductionLabel', text: 'Websecurify is an automated web application security testing environment based on advanced automation, discovery and fuzzing technologies.', touchEnabled: false});
var introductionRow = Titanium.UI.createTableViewRow({id: 'introductionRow', header: 'Introduction', hasChild: false, touchEnabled: false, selectionStyle: Titanium.UI.iPhone.TableViewCellSelectionStyle.NONE});

introductionRow.add(introductionLabel);

var warningLabel = Titanium.UI.createLabel({id: 'warningLabel', text: 'Automated web application testing solutions submit thousands of requests with bogus and incorrect data which may be stored, processed and later used by important business workflows. Although Websecurify will try to limit the potential damage of the automated vulnerability discovery process by using advanced analytical engine, it is recommended to test only applications which are deployed in demo or test environments.', touchEnabled: false});
var warningRow = Titanium.UI.createTableViewRow({id: 'warningRow', header: 'WARNING', hasChild: false, touchEnabled: false, selectionStyle: Titanium.UI.iPhone.TableViewCellSelectionStyle.NONE});

warningRow.add(warningLabel);

/* ------------------------------------------------------------------------ */

var tableView = Titanium.UI.createTableView({id: 'tableView', data: [introductionRow, warningRow], scrollable: false, style: Titanium.UI.iPhone.TableViewStyle.GROUPED, separatorStyle: Titanium.UI.iPhone.TableViewSeparatorStyle.NONE});

Titanium.UI.currentWindow.add(tableView);

/* ------------------------------------------------------------------------ */

var acceptButton = Titanium.UI.createButton({id: 'acceptButton', title: 'I Agree and Accept Full Responsability'});

Titanium.UI.currentWindow.add(acceptButton);

/* ------------------------------------------------------------------------ */

acceptButton.addEventListener('click', function (event) {
	Titanium.UI.currentWindow.fireEvent('closing');
});
