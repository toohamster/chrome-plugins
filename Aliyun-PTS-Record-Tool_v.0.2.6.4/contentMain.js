define('contentMain', [
	'common/adapter'
], function($$adapter){
	var _pub_static = function () {var _pub = {}, _pri = {}, _pro = {};
		var _init = function () {
			if(_pri.matchUrl(location.href)) {
				var oUrl = _pri.parseUrl(location.href);

				_pri.scriptCacheId = oUrl.searchJson.getScriptFromRecTool;
				if(_pri.scriptCacheId) {
					_pri.adapter.ctPostToBg({
						cmd : 'ctsGetScriptDataFromBgsCache',
						data : {
							scriptCacheId : _pri.scriptCacheId
						}
					});
					_pri.adapter.ctListenBgMsg(function (oData) {
						if(oData.cmd === 'bgsPostScriptDataToCts') {
							_pri.setScriptDataTopage(oData.data);
						}
					});
				}
				_pri.bindBtn();
				

			}

		};

		_pri["setScriptDataTopage"] = function (oScriptData) {
			document.body.setAttribute('scriptData', JSON.stringify(oScriptData));
			_pri.adapter.ctPostToBg({
				cmd : 'ctsClearCacheById',
				data : {
					scriptCacheId : _pri.scriptCacheId
				}
			});
		};

		_pri["adapter"] = $$adapter('chromeExtension');


		_pri["isChrome"] = !!window.chrome;

		_pri["bindBtn"] = function () {
			var eStyle = document.createElement('style');
			eStyle.innerHTML = '._startupRecTool {display:inline !important;}';
			document.body.appendChild(eStyle);
			document.addEventListener('click', function (evt) {
				if(evt.target.matches('._startupRecTool')) {
					_pri.adapter.ctPostToBg({
						cmd : 'startWin'
					});
				}
			}, 0);
		};


		_pri["urlList"] = [
			'pts.aliyun.com/aliyun/script_new.htm'
			, 'pts.aliyun.test/aliyun/script_new.htm'
			, 'pts.aliyun.com/aliyun/script_edit.htm'
			, 'pts.aliyun.test/aliyun/script_edit.htm'
			, 'toy.ggg/d.html'
		];


		_pri["matchUrl"] = function (sUrl) {
			var aT = sUrl.split('/');
			return _pri.urlList.some(function (s) {
				return aT.slice(2).join('/').indexOf(s) === 0;
			});
		};


		_pri["parseUrl"] = (function(){ 

			var _pub_static = function () {var _pub = {}, _pri = {}, _pro = {};
				var _init = function (sUrl) {
					if(sUrl) {
						_pub["host"] = _pub_static.getHostFromUrl(sUrl);
						_pub["path"] = _pub_static.getPathFromUrl(sUrl);
						_pub["dir"] = _pub_static.getDirFromPath(_pub.path);
						_pub["search"] = _pub_static.getSearchFromUrl(sUrl);
						_pub["hash"] = _pub_static.getHashFromUrl(sUrl);
						_pub["domain"] = _pub_static.getDomainFromUrl(_pub.host);
						_pub["searchJson"] = _pub_static.getJsonFromSearch(_pub.search);
					}else{
						_pub["host"] = _pub["path"] = _pub["dir"] = _pub["search"] = _pub["hash"] = _pub["domain"] = '';
						_pub["searchJson"] = {};
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

			_pub_static["getJsonFromSearch"] = function (sSearch) {
				var i, l, o={}, iI;
				if(sSearch) {
					var aS = sSearch.split('&');
					for (i=0, l = aS.length; i < l; ++i) {
						iI = aS[i].indexOf('=');
						if(~iI) {
							o[aS[i].slice(0, iI)] = decodeURIComponent(aS[i].slice(iI+1)) || undefined;
						}else{
							o[aS[i]] = undefined;
						}
						
					}
				}
				return o;
			};

			_pub_static["getDirFromPath"] = function (sP) {
				if(~sP.lastIndexOf('/')) {
					sP = sP.slice(sP.indexOf('/'), sP.lastIndexOf('/')+1);
				}else{
					sP = '/';
				}
				return sP;
			};

			_pub_static["getHostFromUrl"] = function (sP) {
				sP = sP.slice(sP.indexOf('//')+2);
				~sP.indexOf('/') && (sP = sP.slice(0, sP.indexOf('/')));
				~sP.indexOf('?') && (sP = sP.slice(0, sP.indexOf('?')));
				~sP.indexOf('#') && (sP = sP.slice(0, sP.indexOf('#')));
				return sP;
			};

			_pub_static["getDomainFromUrl"] = function (sHost) {
				~sHost.indexOf(':') && (sHost = sHost.slice(0, sHost.indexOf(':')));
				return sHost;
			};

			_pub_static["getPathFromUrl"] = function (sP) {
				~sP.indexOf('?') && (sP = sP.slice(0, sP.indexOf('?')));
				~sP.indexOf('#') && (sP = sP.slice(0, sP.indexOf('#')));
				sP = sP.slice(sP.indexOf('//')+2);
				if(~sP.indexOf('/')) {
					sP = sP.slice(sP.indexOf('/'));
				}else{
					sP = '/';
				}
				return sP;
			};

			_pub_static["getSearchFromUrl"] = function (sP) {
				if(~sP.indexOf('?')) {
					sP = sP.slice(sP.indexOf('?')+1);
					~sP.indexOf('#') && (sP = sP.slice(0, sP.indexOf('#')));
				}else{
					sP = '';
				}
				
				return sP;
			};

			_pub_static["getHashFromUrl"] = function (sP) {
				if(~sP.indexOf('#')) {
					sP = sP.slice(sP.indexOf('#') + 1);
					return sP;
				}else{
					return '';
				}
			};

			return _pub_static;
		 
		})();


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
