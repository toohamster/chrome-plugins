define('common/adapter', [
	
], function () {

	var _pub_static = function () {var _pub = {}, _pri = {}, _pro = {};
		var _init = function (oSpec) {
			var sEnv = 'webDev';
			if(
				~location.href.indexOf('resource://')
				//|| ~navigator.userAgent.toLowerCase().indexOf('firefox')
			) {
				sEnv = 'firefoxAddon';
			}else if(
				~location.href.indexOf('chrome-extension://')
				//|| ~navigator.userAgent.toLowerCase().indexOf('chrome')
			) {
				sEnv = 'chromeExtension';
			}

			_pub.env = oSpec || sEnv;
			_pri.buildAdapter(_pub.env);
		};


		_pri["defineList"] = {
			"firefoxAddon" : {
				'winListenBgMsg' : function (fCallback) {
					window.addEventListener('message', function (evt) {
						var oData = evt.data;
						if(oData.sign === 'bgPostToWin') {
							delete oData.sign;
							fCallback(oData.data);
						}
					}, false);
				},
				'winPostToWin' : function (oData) {
					window.postMessage({
						msg : 'winPostToWin',
						data : oData
					}, '*');
				},
				'winListenWinMsg' : function (fCallback) {
					window.addEventListener('message', function (evt) {
						var oData = evt.data;
						if(oData.msg === 'winPostToWin') {
							delete oData.sign;
							fCallback(oData.data);
						}
					}, false);
				},
				'winPostToBg' : function (oData) {
					window.postMessage({
						sign : 'winPostToBg',
						data : oData
					}, '*');
				},
				'ctPostToBg' : function (oMsg) {
					self.port.emit('ctPostToBg', oMsg);
				},
				'bgListenCtMsg' : function (fCallback) {
					self.port.on('ctPostToBg', fCallback);
				},
				'ctListenBgMsg' : function (fCallback) {
					self.port.on('bgPostToCt', fCallback);
				},
				'ctPostToPage' : function (oMsg) {
					_pri.triggerCustomEvent('ctPostToPage', oMsg);
				},
				'pagePostToCt' : function (oMsg) {
					_pri.triggerCustomEvent('pagePostToCt', oMsg);
				},
				'ctListenPageMsg' : function (fCallback) {
					window.addEventListener('ctsPostToPage', function(event) {
					  fCallback(event.detail);
					}, false);
				},
				'pageListenCtMsg' : function (fCallback) {
					window.addEventListener('pagePostToCt', function(event) {
					  fCallback(event.detail);
					}, false);
				}
			},
			"chromeExtension" : {
				'winListenBgMsg' : function (fCallback) {
					chrome.runtime.onMessage.addListener(function (oData) {
						if(oData.sign === 'bgPostToWin') {
							fCallback(oData.data);
						}
					});
				},

				'winPostToWin' : function (oData) {
					chrome.runtime.sendMessage({
						sign : 'winPostToWin',
						data : oData
					});
				},
				'winListenWinMsg' : function (fCallback) {
					chrome.runtime.onMessage.addListener(function (oData) {
						if(oData.sign === 'winPostToWin') {
							fCallback(oData.data);
						}
					});
				},

				'winPostToBg' : function (oData) {
					chrome.runtime.sendMessage({
						sign : 'winPostToBg',
						data : oData
					});
				},

				'ctPostToBg' : function (oData) {
					chrome.runtime.sendMessage({
						sign : 'ctPostToBg',
						data : oData
					});
				},
				'ctListenBgMsg' : function (fCallback) {
					chrome.runtime.onMessage.addListener(function (oData) {
						if(oData.sign === 'bgPostToCt') {
							fCallback(oData.data);
						}
					});
				}

			}
		};

		_pri["triggerCustomEvent"] = function (eventName, oMsg) {console.log(eventName);
			if(typeof cloneInto !== 'undefined') {
				oMsg = cloneInto(oMsg, document.defaultView);
			}
			var event = document.createEvent('CustomEvent');
			event.initCustomEvent(eventName, true, true, oMsg);
			document.documentElement.dispatchEvent(event);
		};
		
		_pri["buildAdapter"] = function (sEnv) {
			var oDefine = {};
			switch(sEnv) {
				case 'webDev':
				case 'firefoxAddon':
					oDefine = _pri.defineList.firefoxAddon
					break;
				case 'chromeExtension':
					oDefine = _pri.defineList.chromeExtension
					break;
				default:
					throw new Error('Unknown adapter env .');
			}

			[
				'winListenBgMsg'

				, 'winPostToWin'
				, 'winListenWinMsg'

				, 'winPostToBg'

				, 'ctPostToPage'

				, 'pagePostToCt'

				, 'ctListenPageMsg'
				, 'pageListenCtMsg'
				
				, 'ctListenBgMsg'

				, 'ctPostToBg'
				, 'bgListenCtMsg'
			].forEach(function (sMethod) {
				_pub[sMethod] = oDefine[sMethod];
			});
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

	

	return _pub_static;

});