define([
	
], function () {
	var _pri_s = {};
	_pri_s["WildcardMatcher"] = function(text, separator) {
		this.text = text = text || '';
		this.hasWild = ~text.indexOf('*');
		this.separator = separator;
		this.parts = text.split(separator);
	};

	_pri_s.WildcardMatcher.prototype.match = function(input) {
		var matches = true;
		var parts = this.parts;
		var ii;
		var partsCount = parts.length;
		var testParts;

		if (typeof input == 'string' || input instanceof String) {
			if (!this.hasWild && this.text != input) {
				matches = false;
			} else {
				testParts = (input || '').split(this.separator);
				for (ii = 0; matches && ii < partsCount; ii++) {
					if (parts[ii] === '*')	{
						continue;
					} else if (ii < testParts.length) {
						matches = parts[ii] === testParts[ii];
					} else {
						matches = false;
					}
				}

				// If matches, then return the component parts
				matches = matches && testParts;
			}
		}
		else if (typeof input.splice == 'function') {
			matches = [];

			for (ii = input.length; ii--; ) {
				if (this.match(input[ii])) {
					matches[matches.length] = input[ii];
				}
			}
		}
		else if (typeof input == 'object') {
			matches = {};

			for (var key in input) {
				if (this.match(key)) {
					matches[key] = input[key];
				}
			}
		}

		return matches;
	};

	var _pub_static = function () {var _pub = {}, _pri = {}, _pro = {};
		var _init = function(text, test, separator) {
			var matcher = new _pri_s.WildcardMatcher(text, separator || /[\/\.]/);
			if (typeof test != 'undefined') {
				_pub = matcher.match(test);
			}

		};




		switch(this+'') {
			case 'test':
				_pub._pri = _pri;
				_pub_static._pri_s = _pri_s;
			case 'extend':
				_pub._pro = _pro;
				_pub._init = _init;
				break;
			default:
				delete _pub._init;
				delete _pub._pro;
				_init.apply(_pub, arguments);
		}
		return _pub;
	};

	

	return _pub_static;

});



