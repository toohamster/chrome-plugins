/**
 * var_dump_js v2.0.1 - A JavaScript kit to output var in page.
 *
 * https://github.com/purplestone/var_dump_js
 *
 * Copyright 2014
 * Released under the MIT license.
 */

;(function () {
	var typeOf = function (o) {
		return Object.prototype.toString.call(o);
	};
	var mergePropertyFrom = function(targetObj, srcObj, getPrototypeProperty) {
		var i;
		for (i in srcObj) {
			if(getPrototypeProperty || srcObj.hasOwnProperty(i)) {
				targetObj[i] = srcObj[i];
			}
		}
		return targetObj;
	};
	var isArray = function (obj) {
		return typeOf(obj) === '[object Array]' || (obj instanceof Array);
	};
	var isString = function (o) {
		return typeOf(o) === '[object String]';
	};
	var o = {
		"print_r" : (function () {

			var _fun = {}['print_r'] = function (sValueOut, bHtml, iStack) {
				var ooTT, eT;
				if(_fun.bp){
					return;
				}
				var eDebugDiv = document.getElementById('DebugDiv');
				if(!eDebugDiv) {
					var dd=document.createElement('div');
					dd.id='DebugDiv';
					dd.innerHTML='<div style="color:#000;padding:4px 6px;"><input type="button" class="btn" onclick="print_r.clear();" value="Clear" /> '+
						'<input type="button" class="btn" onclick="print_r.hidden(this);" value="Hidden" /> '+
						'<input type="button" class="btn" onclick="print_r.stop(this);" value="Stop" /></div>'+
						'<div id="Debug_box" style="-float:left;"></div>';
					dd.style.position='absolute';
					dd.style.zIndex='32767';
					dd.style.right='0';
					try{
						dd.style.maxWidth='700px';
						dd.style.wordWrap='break-word';
					}catch(e) {}
					dd.style.top='0';
					dd.style.fontSize='16px';
					dd.style.color='#fff';
					dd.style.backgroundColor='#000';
					document.body.insertBefore(dd,document.body.firstChild);
					var db=document.getElementById('Debug_box');
					db.style.padding='20px';
					db.style.position='relative';
					dd.style.position='fixed';
					db.style.maxHeight='420px';
					db.style.overflow='auto';
					if(document.all && !window.XMLHttpRequest){
						ooTT = new (_fun.fb)(dd,50);
					}
					_fun.db = db;
					_fun.dd = dd;
				}
				_fun.dd.style.display = 'block';
				var oV = document.createElement('span');
				if(sValueOut+'' === '[object Object]') {
					sValueOut = typeOf(sValueOut);
				}
				if(bHtml){
					oV.innerHTML = '<b style="color:#ff9;">'+(++_fun.it)+'</b> : '+sValueOut;
				}else{
					eT = document.createElement('b');
					eT.innerHTML = ++_fun.it;
					eT.style.color = '#ff9';
					oV.appendChild(eT);
					oV.appendChild(document.createTextNode(' : '+sValueOut));
				}
				var sStack = '';
				try{
					var err = new Error('var_dump_js track line');
					sStack = err.stack;
					iStack = iStack || 1;
					var aStack = sStack.split('\n').map(function (s) {
						return s.trim();
					}).filter(function (s) {
						return /^(@|at)/.test(s);
					});
					if(aStack[0].indexOf('@') === 0 && iStack > 1) {
						iStack--;
					}
					sStack = aStack.slice(iStack, iStack+1);
					oV.title = sStack;
					throw err;
				}catch(e) {
					
				}
				_fun.db.appendChild(oV);
				_fun.db.appendChild(document.createElement('br'));
				_fun.db.scrollTop = _fun.db.scrollHeight;


			};

			return mergePropertyFrom(_fun, {
				it : 0,
				bp : false,
				gs : function(e,s){
					if(e.style[s]){
						return e.style[s];
					}
					else if(e.currentStyle){
						return e.currentStyle[s];
					}
					else if(document.defaultView&&document.defaultView.getComputedStyle){
						s=s.replace(/([A-Z])/g,"-$1");
						s=s.toLowerCase();
						var ss=document.defaultView.getComputedStyle(e,"");
						return ss&&ss.getPropertyValue(ss);
					}
					else{
						return null;
					}
				},
				fb : function(e,is){
					var iTop;
					is = is || 40;
					if(typeof(e) === 'string'){
						e=document.getElementById(e);
					}
					e.style.position='absolute';
					if(!isNaN(parseInt(_fun.gs(e,'top'), 10))){
						iTop=parseInt(_fun.gs(e,'top'), 10);
						_fun.fnInterval=setInterval(function(){
							if(e!==null){
								e.style.top=document.documentElement.scrollTop+iTop+'px';
							}
						}, is);
					}else{
						if(isNaN(parseInt(_fun.gs(e,'bottom'), 10))){
							iTop=0;
							_fun.fnInterval=setInterval(function(){
								if(e!==null){
									e.style.top=document.documentElement.scrollTop+iTop+'px';
								}
							}, is);
						}else{
							var iBottom=parseInt(_fun.gs(e,'bottom'), 10);
							_fun.fnInterval=setInterval(function() {
								if(e!==null){
									e.style.top=document.documentElement.scrollTop+document.documentElement.clientHeight-iBottom-e.offsetHeight+'px';
								}
							}, is);
						}
					}
				},
				clear : function (){
					_fun.it=0;
					_fun.db.innerHTML='';
					document.getElementById('DebugDiv').style.display = 'none';
				},
				hidden : function (e){
					if(_fun.db.style.display === 'none'){
						e.value = 'Hidden';
						_fun.db.style.display = '';
					}
					else{
						e.value = 'Show';
						_fun.db.style.display = 'none';
					}
				},
				stop : function (e){
					if(_fun.bp){
						e.value = 'Stop';
						_fun.bp = false;
					}
					else{
						e.value = 'Start';
						_fun.bp = true;
					}
				}

			});

		}()),
		"var_dump" : (function () {
			var _fun = {}['var_dump'] = function (o, fn) {
				var s = '<span style="color:#ff9;">&lt;'+typeOf(o)+'&gt;</span>'+(isArray(o) ? '' : o), i;
				var sL = '<b style="color:#2dd;">', sR = '</b>';
				if(!isString(o)) {
					s += '<br />';
					for (i in o) {
						if(o[i] && o[i].toString() !== undefined && o[i].toString() !== null) {
							s += sL+i+sR +' : '+(o[i].toString()).replace(/</g, '&lt;');
						}else{
							s += sL+i+sR+' : '+(o[i]);
						}
						
						s += '<br />';
					}
				}

				if(!fn) {
					_fun.alert(s);
				}else{
					fn(s);
				}

			};

			return mergePropertyFrom(_fun, {
				'alert': function (s) {
					if(window.print_r) {
						print_r(s, true, 3);
					}else{
						alert(s);
					}
				}
			});

		}())
	};

	if(!window.var_dump) {

		window.print_r = o.print_r;
		window.var_dump = o.var_dump;

	}

	
}());
