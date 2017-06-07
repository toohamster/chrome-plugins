
//function windowInEx() {
	//return 'messageManager' in window;
//}

//if(windowInEx()) {
	
	////window.addEventListener( "message", function (evt) {
		////var oData = evt.data.data;
		////var sMsg = evt.data.msg;
		////if(sMsg === 'postHttp' || sMsg === 'postHttpList') {
			////if(sMsg === 'postHttpList') {
				////document.getElementById('edit-box').value += oData.map(function (o) {
					////return JSON.stringify(o, 0, 4);
				////}).join(',\n\n\n');
			////}else{
				////document.getElementById('edit-box').value += '\n\n\n'+JSON.stringify(oData, 0, 4);
			////}
			////document.getElementById('edit-box').value += ',';
		////}
	////}, false);

//}else{
	//$.getScript( 'data.js', function() {

		//$(function () {
			//var iHttp = 1;
			//var firePostSeries = function (aData) {
				//if(aData.length) {
					//setTimeout(function() {
						//var oPostData = {
							//msg : 'postHttp',
							//data : aData.shift()
						//};
						////console.log(oData);
						//postMsg(oPostData);
						////iHttp++;
						////if(iHttp > 10) {
							////return;
						////}
						//firePostSeries(aData);
					//},100);
				//}else{
					//postMsg({msg:'httpListEnd'});
				//}
			//};
			//var firePostOnce = function (oData) {
				//var oPostData = {
					//msg : 'postHttpList',
					//data : oData
				//};
				//postMsg(oPostData);
				//postMsg({msg:'httpListEnd'});
			//};


			//if(0) {
				//setTimeout(function() {
					//firePostOnce(aData);
				//},1000);
				
			//}else{
				//firePostSeries(aData);
				////setTimeout(function() {
					////iHttp = -100;
					////firePostSeries(aData);
				////},10000);
			//}

			//function postMsg(oData) {
				//chrome.runtime.sendMessage('cmgjaihjmmmfiapnkkpajicfeebejdcc', oData);
			//}
		//});
	//});
//}

window.name = 'NG_DEFER_BOOTSTRAP!';
requirejs(['win', 'lib/jh'], function($$p){
	$$p();
});