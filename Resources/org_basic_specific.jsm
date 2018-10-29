(function (exports) {
	
	var log = function (message) {
		Titanium.API.log('debug', message);
	};
	
	/* ------------------------------------------------------------------------ */
	
	var getXMLHttpRequestObject = function () {
		var xhr = {
			url: null,
			xhr: Titanium.Network.createHTTPClient(),
			
			open: function (method, url, async) {
				this.url = url;
				
				this.xhr.open(method, url, async);
				
				this.xhr.autoEncodeUrl = false;
				this.xhr.autoRedirect = false;
				this.xhr.enableKeepAlive = false;
				this.xhr.validatesSecureCertificate = false;
			},
			
			send: function (data) {
				if (data) {
					this.xhr.send(data);
				} else {
					this.xhr.send();
				}
			},
			
			abort: function () {
				this.xhr.abort();
			},
			
			overrideMimeType: function (mimeType) {
				// pass
			},
			
			setRequestHeader: function (name, value) {
				this.xhr.setRequestHeader(name, value);
			},
			
			getAllResponseHeaders: function () {
				var headersBlock = this.xhr.getAllResponseHeaders();
				
				if (headersBlock) {
					return headersBlock;
				} else {
					var headerItems = [];
					var headers = this.xhr.getResponseHeaders();
					
					for (var name in headers) {
						headerItems.push(name + ': ' + headers[name]);
					}
					
					return headerItems.join('\r\n');
				}
			},
			
			set onload(handler) {
				var self = this;
				
				this.xhr.onload = function () {
					handler.call(self, self);
				}
			},
			
			set onerror(handler) {
				var self = this;
				
				this.xhr.onerror = function () {
					if (self.xhr.status.toString().match(/^5\d\d/)) {
						self.xhr.onload();
					} else {
						handler.call(self, self);
					}
				}
			},
			
			set onabort(handler) {
				var self = this;
				
				this.xhr.onabort = function () {
					handler.call(self, self);
				}
			},
			
			get status() {
				return this.xhr.status;
			},
			
			get statusText() {
				return this.xhr.statusText;
			},
			
			get responseText() {
				return this.xhr.responseText;
			}
		};
		
		return xhr;
	}
	
	/* ------------------------------------------------------------------------ */
	
	exports.log = log;
	exports.getXMLHttpRequestObject = getXMLHttpRequestObject;
	
})(exports);