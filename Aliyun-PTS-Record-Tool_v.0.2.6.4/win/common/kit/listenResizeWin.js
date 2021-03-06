/**
* @example 
	'kit/listenResizeWin'

	$$listenResizeWin.add(fn);
	$$listenResizeWin.remove(fn);
	$$listenResizeWin.clear();
	$$listenResizeWin.destroy();
*/
define([
	'lib/jquery/1_11'
	
], function ($) {
	var _pri_static = {}, _pub_static = {};

	_pri_static["callbackList"] = [];

	_pub_static["checkResize"] = function () {
		var iWinWidth = $(window).width();
		var iWinHeight = $(window).height();
		var oWH = {
			width:iWinWidth,
			height:iWinHeight,
			oldWidth : _pub_static.width,
			oldHeight : _pub_static.height
		};
		if(_pri_static.callbackList.length
			&&(
				_pub_static.width  != iWinWidth
				|| _pub_static.height  != iWinHeight
			)
		) {
			_pri_static.runCallbackList(oWH);
		}
		_pub_static.width = iWinWidth;
		_pub_static.height = iWinHeight;
		return oWH;
	};

	_pri_static["runCallbackList"] = function (oWH) {
		var i, l;
		for (i=0, l = _pri_static.callbackList.length; i < l; ++i) {
			try{
				_pri_static.callbackList[i](oWH);
			}catch(e) {}
		}
	};

	_pri_static["listenResizeWin"] = function () {
		_pub_static.checkResize();
		_pri_static.iSI = setInterval(function() {
			_pub_static.checkResize();
		},1000);
		$(window).on('resize', _pub_static.checkResize);
	};

	_pub_static["add"] = function (callback, bRunAtAdd) {
		_pri_static.callbackList.push(callback);
		if(bRunAtAdd) {
			callback(_pub_static.checkResize());
		}
		//callback({
			//width:_pub_static.width,
			//height:_pub_static.height,
			//oldWidth : _pub_static.width,
			//oldHeight : _pub_static.height
		//});
	};

	_pub_static["remove"] = function (callback) {
		var i, l;
		for (i=0, l = _pri_static.callbackList.length; i < l; ++i) {
			if(_pri_static.callbackList[i] === callback) {
				_pri_static.callbackList.splice(i, 1);
				return true;
			}
		}
		return false;
	};

	_pub_static["clear"] = function () {
		_pri_static.callbackList = [];
	};

	_pub_static["destroy"] = function () {
		_pub_static.clear();
		clearInterval(_pri_static.iSI);
		$(window).off('resize', _pub_static.checkResize);
	};

	_pri_static.listenResizeWin();

	return _pub_static;

});