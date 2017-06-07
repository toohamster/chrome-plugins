
var main = (function () {
	var _pub_static = function () {var _pub = {}, _pri = {}, _pro = {};
		var _init = function () {
			_pri.bindBrowserAction();
			//_pri.startMonitorWin();
			_pri.listenMsg();
		};

		_pri["bindBrowserAction"] = function () {
			chrome.browserAction.onClicked.addListener(function(tab) {
				if(_pri.sWinId) {
					chrome.windows.get(_pri.sWinId, function (oWin) {
						if(oWin) {
							chrome.windows.update(oWin.id, {
								focused : true
							});
						}else{
							_pri.createWin();
						}
					});

				}else{
					_pri.createWin();
				}
			});
		};

		_pri["createWin"] = function () {
			var oWinArgs = {
				width : window.screen.availWidth / 2,
				height : window.screen.availHeight
			};
			chrome.windows.create({
				url: 'win/win.html?ver=' + chrome.app.getDetails().version
				, type: 'popup'
				, left : 0
				, top : 0
				, width: oWinArgs.width
				, height: oWinArgs.height
			}, function (oWin) {
				_pri.sWinId = oWin.id;
			});
			chrome.windows.create({
				url: 'about:blank'
				//, type: "popup"
				, left : oWinArgs.width
				, top : 0
				, width: oWinArgs.width
				, height: oWinArgs.height
			});
			_pri.startServer();
		};

		_pri["listenMsg"] = function () {
			chrome.runtime.onMessage.addListener(function (oData, oSender) {
				if(oData.sign === 'winPostToBg') {
					oData = oData.data;
					if(oData.msg === 'toolIsActive') {
						_pri.setStatusToActive();
					}else if(oData.msg === 'upload') {
						_pri.postScriptDataToPage(oData.data);
					}else if(oData.msg === 'closeWin') {
						_pri.closeServer();
					}else if(oData.msg === 'openWin') {
						_pri.startServer();
					}
				}else if(oData.sign === 'ctPostToBg') {
					oData = oData.data;
					if(oData.cmd === 'ctsGetScriptDataFromBgsCache') {
						oData = oData.data;
						var oScriptData = _pri.scriptCache[oData.scriptCacheId];
						if(oData.scriptCacheId === 'i3bgzm5g-v527-1d99-wnpp-r6auahkdn5qu') {
							oScriptData = {
								script : 'script Test!',
								data : {}
							}
						}
						chrome.tabs.sendMessage(oSender.tab.id, {
							sign : 'bgPostToCt',
							data : {
								cmd : 'bgsPostScriptDataToCts',
								data : oScriptData
							}
						});
					}else if(oData.cmd === 'ctsClearCacheById') {
						delete _pri.scriptCache[oData.data.scriptCacheId];
					}else if(oData.cmd === 'startWin') {
						_pri.createWin();
					}
				}
			});
		};

		_pri["postScriptDataToPage"] = function (oData) {
			_pri.scriptCache[oData.scriptId] = oData;
			_pri.openCreateScriptWin(oData);
		};

		_pri["scriptCache"] = {};

		_pri["openCreateScriptWin"] = function (oData) {
			var sNewScriptUrl = 'https://pts.aliyun.com/aliyun/script_new.htm?getScriptFromRecTool=';
			if(oData.testEnv === 'dev') {
				sNewScriptUrl = 'http://toy.ggg/d.html?getScriptFromRecTool=';
			}else if(oData.testEnv === 'test') {
				sNewScriptUrl = 'https://pts.aliyun.test/aliyun/script_new.htm?getScriptFromRecTool=';
			}
			var oTab = window.open(sNewScriptUrl + oData.scriptId);
			
		};

		_pri["setStatusToActive"] = function () {
			_pri.toolIsActive = true;
		};

		_pri["objNvToArr"] = function (obj) {
			return obj.map(function (o) {
				return [o.name, o.value];
			});
		};

		_pri["handleEvent"] = (function () {
			var _fun = function (sStep) {
				return _fun[sStep] || (_fun[sStep] = function (oHttp) {
					var oItem = {
						url : oHttp.url
						, method : oHttp.method
						, requestId : oHttp.requestId
					};

					switch(sStep) {
						case 'onBeforeRequest':
							oItem.requestBody = oHttp.requestBody;
							_pri.handleHttpData({
								type : 'request',
								http : oItem
							});
							break;
						case 'onSendHeaders'://debugger;
							oItem.requestHeader = _pri.objNvToArr(oHttp.requestHeaders);
							_pri.handleHttpData({
								type : 'request',
								http : oItem
							});
							break;
						case 'onBeforeRedirect':
						case 'onCompleted':
						case 'onErrorOccurred'://debugger;
							oItem.responseHeader = _pri.objNvToArr(oHttp.responseHeaders);
							_pri.handleHttpData({
								type : 'response',
								http : oItem
							});
							break;
						
					}
					//console.log(sStep);
					//console.log(oItem);



					//if (oHttp.requestHeaders) {
						//console.log('\n' + oHttp.method + ' ' + oHttp.url);
						//console.log(oHttp.requestHeaders);
					//} else if (oHttp.redirectUrl) {
						//console.log('\n' + oHttp.statusLine + "\n Redirect to: " + oHttp.redirectUrl);
						//console.log(oHttp.responseHeaders);
					//} else if (oHttp.responseHeaders) {
						//console.log('\n' + oHttp.statusLine);
						//console.log(oHttp.responseHeaders);
					//}

					//_pri.sendMsgToWin({
						//cmd : 'http',
						//data : {
							//d : 'ddddddd'
							//, oHttp : oHttp
						//}
					//});

				});
			};
		
			
		
			return _fun;
		}());

		_pri["sendMsgToWin"] = function (oData, fCallback) {
			chrome.runtime.sendMessage({
				sign : 'bgPostToWin',
				data : oData
			}, fCallback);
			
		};

		_pri["filters"] = {
			urls: ['<all_urls>']
			//, tabId: tabId
		};

		_pri["closeServer"] = function () {
			_pri.httpRemoveListeners();

			_pri.clearList();
			_pri.startServer.ok = false;
			_pri.planCloseServer = false;

			_pri.monitorWin();
		};

		_pri["startServer"] = (function () {
			var _fun = function (state) {
				if(!_fun.ok) {
					_pri.httpAddListeners();

					_fun.ok = true;
					_fun.reqIndex = 0;
				}
				_pri.planCloseServer = false;
				_pri.toolIsActive = true;

				_pri.monitorWin();
				
			};
		
			
		
			return _fun;
		}());

		_pri["clearList"] = function () {
			_pri.cacheRequest.list = [];
			_pri.startServer.reqIndex = 0;
		};

		_pri["httpAddListeners"] = function () {
			chrome.webRequest.onBeforeRequest.addListener(_pri.handleEvent('onBeforeRequest'), _pri.filters, ['requestBody']);
			chrome.webRequest.onSendHeaders.addListener(_pri.handleEvent('onSendHeaders'), _pri.filters, ['requestHeaders']);
			//chrome.webRequest.onBeforeRedirect.addListener(_pri.handleEvent('onBeforeRedirect'), _pri.filters, ['responseHeaders']);
			chrome.webRequest.onCompleted.addListener(_pri.handleEvent('onCompleted'), _pri.filters, ['responseHeaders']);
			//chrome.webRequest.onErrorOccurred.addListener(_pri.handleEvent('onErrorOccurred'), _pri.filters);


		};

		_pri["httpRemoveListeners"] = function () {
			chrome.webRequest.onBeforeRequest.removeListener(_pri.handleEvent('onBeforeRequest'));
			chrome.webRequest.onSendHeaders.removeListener(_pri.handleEvent('onSendHeaders'));
			//chrome.webRequest.onBeforeRedirect.removeListener(_pri.handleEvent('onBeforeRedirect'));
			chrome.webRequest.onCompleted.removeListener(_pri.handleEvent('onCompleted'));
			//chrome.webRequest.onErrorOccurred.removeListener(_pri.handleEvent('onErrorOccurred'));
		};

		//_pri["startMonitorWin"] = function () {
			//_pri.listenActiveStatus();
			//_pri.iMonitorToolBeActiveTimer = setInterval(function () {
				//try{
					//_pri.monitorWin();
				//}catch(e) {console.log(e); clearInterval(_pri.iMonitorToolBeActiveTimer);}
			//},1000);
		//};

		_pri["monitorWin"] = function() {
			if(_pri.startServer.ok) {
				//if(_pri.planCloseServer && !_pri.toolIsActive) {
					//_pri.closeServer();
				//}
				//if(_pri.toolIsActive) {
					//_pri.planCloseServer = false;
					//_pri.toolIsActive = false;
				//}else{
					//_pri.planCloseServer = true;
				//}
				chrome.browserAction.setIcon({
					path : 'logo_on19.png'
				});
			}else{
				chrome.browserAction.setIcon({
					path : 'logo19.png'
				});
			}
		};

		_pri["handleHttpData"] = function (oData) {
			var oHttp = oData.http;
			if(oData.type === 'request') {
				if(_pri.cacheRequest(oHttp)) {
					_pri.postHttpToWin('request', oHttp);
				}
			}else if(oData.type === 'response') {
				_pri.checkResponse(oHttp);
				_pri.postHttpToWin('response', oHttp);
			}
		};

		_pri["postHttpToWin"] = function (sType, oHttp) {
			if(oHttp.requestBody && oHttp.requestBody.formData) {
				var aP = [];
				for (var k in oHttp.requestBody.formData) {
					aP.push(encodeURIComponent(k)+'='+encodeURIComponent(oHttp.requestBody.formData[k]));
				}
				oHttp.postData = aP.join('&');
				delete oHttp.requestBody;
			}
			_pri.postDataToWin('postHttp', {
				msg : sType,
				data : oHttp
			});
		};

		_pri["postDataToWin"] = function (sMsg, oData) {
			_pri.sendMsgToWin({
				msg : sMsg,
				data : oData
			});
		};

		_pri["cacheRequest"] = (function () {
			var _fun = function (oHttp) {
				if(_fun.list[oHttp.requestId]) {
					_fun.list[oHttp.requestId].push(oHttp.requestHeader);
					return true;
				}else{
					oHttp.index = ++_pri.startServer.reqIndex;
					_fun.list[oHttp.requestId] = [oHttp.index, oHttp.requestBody];
					return false;
				}
				
			};
		
			_fun["list"] = {};
		
			return _fun;
		}()); 

		_pri["checkResponse"] = function (oHttp) {
			var oCacheReq = _pri.cacheRequest.list[oHttp.requestId];
			if(oCacheReq) {
				oHttp.requestHeader = oCacheReq[2];
				oHttp.requestBody = oCacheReq[1];
				oHttp.index = oCacheReq[0];
				delete _pri.cacheRequest.list[oHttp.requestId];
			}
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
}());