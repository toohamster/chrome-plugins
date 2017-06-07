define([
	'common/adapter'
], function ($$adapter) {

	var _pub_static = function () {var _pub = {}, _pri = {}, _pro = {};
		var _init = function (sType) {
			var sEnv;
			//if(
				//!~location.href.indexOf('chrome-extension://')
			//) {
				//sEnv = 'webDev';
			//}
			_pri["envType"] = sEnv;
			_pri["adapter"] = $$adapter();
			

			var sTypeTip = '!! ' + sType + ' !!';
			$('div.tools').append('<span style="position:absolute;">'+sTypeTip+'</span>');
			document.title = sTypeTip + document.title;
			$('body').addClass('test');
			$('#testEnv').val(sType);

			var eUpdataVerBtn = $('.__updataVerBtn')[0];
			switch(sType) {
				case 'dev':
					_pri.loadHttpList();
					eUpdataVerBtn.href = 'http://toy.ggg/s_d/ver_info.php';
					break;
				case 'test':
					var eHelp = $('._topBar .btn-group .btn.btn-ico-help')[0];
					eHelp.href = _pri.replaceTestHost(eHelp.href);

					eUpdataVerBtn.href = _pri.replaceTestHost(eUpdataVerBtn.href);
					break;
				
			}

			
			
		};

		_pri["replaceTestHost"] = function (sUrl) {
			return sUrl.replace('http://pts.aliyun.com', 'http://pts.aliyun.test');
		};

		_pri["loadHttpList"] = function () {
			$.getScript( 'data.js', function(s) {
				eval(s);
				$(function () {
					var iHttp = 1;
					var firePostSeries = function (aData) {
						if(aData.length) {
							setTimeout(function() {
								var oPostData = {
									msg : 'postHttp',
									data : aData.shift()
								};
								//console.log(oData);
								postMsg(oPostData);
								//iHttp++;
								//if(iHttp > 10) {
									//return;
								//}
								firePostSeries(aData);
							},100);
						}else{
							postMsg({msg:'httpListEnd'});
						}
					};
					var firePostOnce = function (oData) {
						var oPostData = {
							msg : 'postHttpList',
							data : oData
						};
						postMsg(oPostData);
						postMsg({msg:'httpListEnd'});
					};


					if(1) {
						setTimeout(function() {
							firePostOnce(aData);
						},1000);
						
					}else{
						firePostSeries(aData);
						//setTimeout(function() {
							//iHttp = -100;
							//firePostSeries(aData);
						//},10000);
					}

					function postMsg(oData) {
						_pri.adapter.winPostToWin(oData);
					}
				});

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