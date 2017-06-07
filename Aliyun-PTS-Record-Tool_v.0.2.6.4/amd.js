var requirejs = (function () {
	var _pri_static = {};
	var _pub_static = function () {var _pub = {}, _pri = {}, _pro = {};
		var _init = function () {
			var aRely = [], exec;
			if(arguments.length > 1) {
				aRely = arguments[0];
				exec = arguments[1];
			}

			if(!_pri_static.allRelyOk) {
				var aRelyList = Object.keys(_pri_static.idList).concat(aRely);
				aRelyList.forEach(function (sRelyId) {
					if(!(sRelyId in _pri_static.mdCache)) {
						throw new Error(sRelyId + ' <-- This module is not defined. ');
					}
				});
				_pri_static.allRelyOk = true;
			}

			exec.apply(null, _pri_static.getRelyModule(aRely));
			
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

	_pri_static["mdCache"] = {};
	_pri_static["idList"] = {};

	_pub_static["getRely"] = function (aRelyId) {
		return aRelyId.map(function (sMdId) {
			return _pri_static.mdCache[sMdId].module;
		});
	};

	_pri_static["getRelyModule"] = function (aRelyId) {
		return aRelyId.map(function (sMdId) {
			return _pri_static.getMdActed(sMdId);
		});
	};

	_pri_static["getMdActed"] = function (sMdId) {
		var oMC = _pri_static.mdCache[sMdId];
		if(oMC && ('module' in oMC)) {
			oMd = oMC.module;
		}else{
			//console.log(sMdId + ' exec moduleConstructor.');
			oMd = oMC.module = oMC.moduleConstructor.apply(null, _pri_static.getRelyModule(oMC.rely));
		}
		return oMd;
	};

	_pub_static["resetDefine"] = function () {
		_pri_static.allRelyOk = false;
	};

	_pub_static["cacheMd"] = function (sMdId, aRely, oMd) {
		_pri_static.mdCache[sMdId] = {
			moduleConstructor : oMd,
			rely : aRely
		};
		aRely.forEach(function (sRelyMdId) {
			_pri_static.idList[sRelyMdId] = true;
		});
	};



	return _pub_static;
}());

var define = function () {
	var sMdId, aRely = [], aDoMd;
	if(arguments.length < 2 || Object.prototype.toString.call(arguments[0]) !== '[object String]') {
		throw new Error('define() arguments length must gt 2 , and first argument is module name .');
	}else if(arguments.length === 2) {
		sMdId = arguments[0];
		oMd = arguments[1];
	}else{
		sMdId = arguments[0];
		aRely = arguments[1];
		oMd = arguments[2];
	}

	if(!aRely || Object.prototype.toString.call(aRely) !== '[object Array]') {
		throw new Error('define() second argument: '+aRely+' is rely info that a array .');
	}

	if(Object.prototype.toString.call(oMd) !== '[object Function]') {
		oMd = oMd.apply(null, requirejs.getRely(aRely));
	}

	requirejs.cacheMd([sMdId], aRely, oMd);
	requirejs.resetDefine();
};