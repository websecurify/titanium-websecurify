function getFileContents(path) {
	path = path.replace('.js', '.jsm');
	
	var file = Titanium.Filesystem.getFile(path);
	
	return file.read().text;
}

function getModuleContents(path) {
	return getFileContents(path);
}

function evalInScope(__scope__, expression) {
	eval('(function () { with (this) {' + expression + '}}).call(__scope__);');
}

function require(module) {
	if (!('__modules__' in arguments.callee)) {
		arguments.callee.__modules__ = {};
	}
	
	if (!(module in arguments.callee.__modules__)) {
		var __scope__ = {
			exports: {},
			requires: require
		};
		
		evalInScope(__scope__, getModuleContents(module));
		
		arguments.callee.__modules__[module] = __scope__.exports;
	}
	
	return arguments.callee.__modules__[module];
}
