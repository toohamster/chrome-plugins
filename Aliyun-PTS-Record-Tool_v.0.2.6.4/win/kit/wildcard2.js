define([
	
], function () {

	var _pub_static = function () {var _pub = {}, _pri = {}, _pro = {};
		var _init = function (sWildcard, str) {
			var e = new RegExp('^' + _pub_static.wildcardToReg(sWildcard));
			_pub = e.test(str);
		};

		

		switch(this+'') {
			case 'test':
				_pub._pri = _pri;
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

	_pub_static["wildcardToReg"] = function (sWildcard) {
		var sReg = sWildcard.replace(/([\^\$\+\?\=\!\:\|\\\/\(\)\[\]\{\}\.])/g, '\\$1');
		sReg = sReg.replace(/([\*\?])/g, '.$1');

		return sReg;
	};

	return _pub_static;

});