define([
	'angular-filter',
	'angular-context-menu',
	'common/kit/listenResizeWin',
	'lib/bootstrap-3.2.0/vendor/bootstrap-dialog/bootstrap-dialog',
	'lodash2',
	'lib/velocity/v',
	'common/adapter',
	'kit/wildcard2',
	'test'
], function ($$angularFilter, $$angularContextMenu, $$listenResizeWin, $$bootstrapDialog, _, $$velocity, $$adapter, $$wildcard, $$test) {
	//$$test('dev');
	var _pub_static = function () {var _pub = {}, _pri = {}, _pro = {};
		var _init = function () {
			
			if(_pri.sCurrVer) {
				document.title += ' v' + _pri.sCurrVer;
			}

			if(_pri.testEnv) {

				if(_pri.testEnv === 'dev') {
					$('#vmData, #vm, #renderVm, #vmResult').show();
					$('#renderVm').on('click', function () {
						$('#vmResult').val(
							$$velocity.render(
								$('#vm').val(),
								JSON.parse($('#vmData').val())
							)
						);
					});
				}
			}

			var httpViewApp = angular.module('HttpView', ['angular.filter', 'ng-context-menu'])
				.controller('HttpListCtrl', function($scope) {
					_pri.HttpListCtrl$scope = $scope;
					$scope.recData = {
						init : [
							_pri.createActionData('init')
						],
						action : [
							_pri.createActionData('action', {
								transaction : true
							})
						],
						end : [
							_pri.createActionData('end')
						]
					};



					$scope.sortData = [
						{name:'初始化', type:'init',data:$scope.recData.init},
						{name:'事务', type:'action',data:$scope.recData.action},
						{name:'结束', type:'end',data:$scope.recData.end}
					];
					$scope.typeList = [];
					$scope.typeShowList = [];
					$scope.t = false;
					$scope.beAutoScroll = _pri.beAutoScroll = false;
					_pri.iD = 1;

					//_pri.adapter.winPostToBg({
						//msg : 'toolIsActive',
						//toolIsActive : true
					//});
					//var iSI = setInterval(function() {try{
						//_pri.adapter.winPostToBg({
							//msg : 'toolIsActive',
							//toolIsActive : true
						//});
					//}catch(e) {clearInterval(iSI);}},900);

					_pri.adapter.winListenBgMsg(function (oData) {
						_pri.handleMsg(oData, $scope);
					});
					if(_pri.testEnv) {
						_pri.adapter.winListenWinMsg(function (oData) {
							_pri.handleMsg(oData, $scope);
						});
					}

					//$scope.onDarg();
					$scope["targetToAction"] = function (oAction) {
						if($scope.targetAction) {
							$scope.targetAction._targetClass = '';
						}
						$scope.targetAction = oAction;
						$scope.targetAction._targetClass = 'target-action';
					};
					$scope["getActionShowList"] = function (oA) {
						var aShowList;
						if($scope.typeShowList.length) {
							if($scope.typeShowList.some(function (s) {
								return s === 'all';
							})) {
								aShowList = oA.list;
							}else{
								aShowList =  oA.list.filter(function (oHttp) {
									return $scope.typeShowList.some(function (s) {
										var bMatch = oHttp.contentType === s;
										if(!oHttp.contentType && s === 'other') {
											bMatch = true;
										}
										return bMatch;
									});
								});
							}
						}else{
							aShowList =  [];
						}
						aShowList = aShowList.filter(function (oHttp) {
							return oHttp.matchTrue;
						});
						oA.filterHttpLength = aShowList.length;

						return aShowList;
					};


					$scope["addMatch"] = function ($event) {
						if(!$event || $event.which === 13) {
							$scope.createMatch();
						}
					};


					$scope["ruleList"] = [
						'允许'
						, '禁止'
					];

					$scope["matchList"] = [
						{
							str : '*.google.*',
							rule : $scope.ruleList[1]
						},
						{
							str : '*.mozilla.*',
							rule : $scope.ruleList[1]
						}
					];

					$scope.$watch('matchList', function(newValue, oldValue) {
						$scope.runMatchFilter();
						//$scope.$apply();
					});

					$scope["delMatch"] = function (oMatch) {
						_pri.forEachDel($scope.matchList, function (oM) {
							return oM === oMatch;
						});
						$scope.runMatchFilter();
					};


					$scope["addMatchRule"] = $scope.ruleList[0];

					$scope["runMatchFilter"] = function () {
						 _pri.listFetch.list.forEach(function (oHttp) {
							_pri.matchHttp(oHttp);
						});
					};

					$scope["createMatch"] = function () {
						if($scope.addMatchStr) {
							$scope.matchList.push({
								str : $scope.addMatchStr,
								rule : $scope.addMatchRule
							});
							$scope.runMatchFilter();
							
						}
						$scope.addMatchStr = '';
						$scope.addMatchRule = $scope.ruleList[0];
						
					};

					$scope["showEditMatchStr"] = function (oMatch) {
						oMatch._editMatchClass = 'ecit-match-str';
					};

					$scope["showEditMatchRule"] = function (oMatch) {
						oMatch._editMatchClass = 'ecit-match-rule';
					};

					$scope["saveMatchStr"] = function (oMatch, $event) {
						if(!$event || $event.which === 13) {
							delete oMatch._editMatchClass;
							$scope.runMatchFilter();
						}
					};

					$scope["saveMatchRule"] = function (oMatch) {
						delete oMatch._editMatchClass;
						$scope.runMatchFilter();
					};



					$scope["hideInfoBox"] = function (oHttp) {
						setTimeout(function() {
							_pri.hideInfoBox();
							oHttp._lastSel = false;
							$scope.$apply();
						});
					};

					$scope["createActionAndRec"] = (function () {
						var _fun = function (oTargetAction) {
							var sActionType = oTargetAction ? oTargetAction.type : 'action';
							if(_.isString(oTargetAction)) {
								sActionType = oTargetAction;
							}
							var oAction = _pri.createAction(sActionType, {
								name : $scope.createActionName,
								targetAction : oTargetAction,
								transaction : sActionType === 'action' ? true : false
							});
							_pri.getRecDataList().forEach(function (oA) {
								_pri.hideActionListBox(oA);
							});
							$scope.targetToAction(oAction);
							_pri.showActionListBox(oAction);
						};
					
						_fun["transIndex"] = 2;
					
						return _fun;
					}());

					$scope["setSelAction"] = function (oAction, $event) {
						_pri.getRecDataList().forEach(function (oA) {
							oA._selClass = '';
						});
						if($event && $event.originalEvent) {
							var iX = $event.originalEvent.offsetX || $event.originalEvent.layerX;
							if(iX < 6) {
								$scope.targetToAction(oAction);
							}
						}
						oAction._selClass = 'sel-action';
					};
					$scope["getRecDataList"] = function () {
						return _pri.getRecDataList();
					};
					$scope["rename"] = function (oAction, $event) {
						$event.stopPropagation();
						oAction.rename = true;
						setTimeout(function() {
							$('._httpList ._renameInput').focus();
						},200);
					};
					$scope["buildScript"] = function () {
						if(!$scope.compressedBtn.disable) {
							if(_pri.buildScript() !== false) {
								$scope.showScriptView();
							}
						}
					};

					$scope["willDisableBtnClass"] = ['stopBtn', 'recBtn', 'filterBtn', 'compressedBtn', 'removeBtn', 'filteMatchBtn'];

					$scope["showScriptView"] = function () {
						$scope.willDisableBtnClass.forEach(function (s) {
							$scope[s].disable = true;
						});
						//$('._stopBtn, ._recBtn, ._filterBtn, ._compressedBtn, ._removeBtn').addClass('disable');
						$('._httpView').hide();
						$('._ptsScriptView').show();
					};

					$scope.willDisableBtnClass.forEach(function (s) {
						$scope[s] = {};
					});

					$scope["toHttpView"] = function () {
						$scope.willDisableBtnClass.forEach(function (s) {
							$scope[s].disable = false;
						});
						$('._httpView').show();
						$('._ptsScriptView').hide();
					};

					$scope["renameOkEnter"] = function (oAction, $event) {
						if($event.which === 13) {
							$scope.renameOk(oAction, $event);
						}
					};

					$scope["checkFilterBtnAble"] = function ($event) {
						if($scope.filterBtn.disable) {
							$event.stopPropagation();
						}
					};

					$scope["checkMatchBtnDisable"] = function ($event) {
						if($scope.filteMatchBtn.disable) {
							$event.stopPropagation();
						}
					};



					$scope["renameOk"] = function (oAction, $event) {
						var eAction = $($event.currentTarget).closest('._action')[0];
						var oCheck = _pri.checkActionName(oAction.name);
						if(oCheck.isOk) {
							oAction.rename = false;
						}else{
							//alert(oCheck.msg);
							$$bootstrapDialog.show({
								title: '发现错误',
								message: oCheck.msg,
								buttons: [{
									label: 'OK',
									cssClass: 'btn-style2 btn-style2-primary',
									action: function(dialog) {
										dialog.close();
										$('._renameInput', eAction).focus();
									}
								}],
								noFade : true
							});
						}
					};
					$scope["renameTransaction"] = function (oAction, $event) {
						$event.stopPropagation();
						oAction.renameTransaction = true;
						var eAction = $($event.currentTarget).closest('._action')[0];
						_pri.offsetRenameTransactionInput(eAction);
						setTimeout(function() {
							$('._httpList ._renameTransactionInput').focus();
						},200);
					};
					$scope["renameTransactionOk"] = function (oAction, $event) {
						if(!$event || $event.which === 13) {
							oAction.renameTransaction = false;
						}
					};
					$scope.targetToAction($scope.recData.action[0]);
					$scope["onShowContextMenu"] = function (oHttp) {
						//var_dump(oHttp);
						$scope.$emit('callShowContextMenu', {
							http : oHttp,
							selHttp : _pri.listFetch.list.filter(function (oH) {
								return oH._statusClass === 'on-sel';
							}),
							actionList : _pri.getRecDataList().map(function (oAction) {
								return oAction;
							})
						});
					};
					$scope["bindElmData"] = function (oData) {
						var_dump(oData.url);
					};
					$scope["onCloseContextMenu"] = function (oHttp) {
						$scope.$emit('callCloseContextMenu', oHttp);
					};

					$scope["onShowActionMenu"] = function (oAction, $event, sMenuId) {
						var eAction = $($event.currentTarget).closest('._action')[0];
						$scope.$emit('callShowActionMenu', {
							action : oAction,
							elm : eAction,
							memuId : sMenuId,
							evt : $event
						});
						//if(sMenuId) {
							//_pri.sendCustomEvent({
								//cmd : 'openContextMenu',
								//data : {
									//evt : $event,
									//action : oAction,
									//elm : eAction
								//}
							//});
						//}
					};
					$scope["onCloseActionMenu"] = function (oAction) {
						$scope.$emit('callCloseActionMenu', oAction);
					};

					$scope["toggleActionListBox"] = function (oAction) {
						_pri.toggleActionListBox(oAction);
					};
					$scope["showActionListBox"] = function (oAction) {
						_pri.showActionListBox(oAction);
					};
					$scope["hideActionListBox"] = function (oAction) {
						_pri.hideActionListBox(oAction);
					};

					$scope["getTypeList"] = function () {
						var oR = {'html':true}, aR = [];
						if($scope.httpList) {
							$scope.httpList.forEach(function (o) {
								if(o.contentType) {
									if(!(o.contentType in oR)) {
										oR[o.contentType] = true;
									}
								}else{
									oR['other'] = true;
								}
							});
						}
						delete oR.html;
						var k;
						for (k in oR) {
							aR.push(k);
						}
						return aR;
						//return [
							//'html',
							//'css',
							//'js',
							//'img',
							//'other'
						//];
					};
					$scope["clearListAll"] = function () {
						if(!$scope.removeBtn.disable) {
							$$bootstrapDialog.show({
								title: '清空请求确认',
								message: '确定要清空所有录制的请求？',
								buttons: [
									{
										label: '取消',
										cssClass: 'btn-style2',
										action: function(dialog) {
											dialog.close();
										}
									}
									, {
										label: '全部清空',
										cssClass: 'btn-style2 btn-style2-primary',
										action: function(dialog) {
											dialog.setTitle('全部清空');
											$scope.actClearList('all');
											dialog.close();
											$scope.$apply('recData');
										}
									}
								],
								noFade : true
							});
						}
					};
					$scope["actClearList"] = function (oA) {
						if(oA === 'all') {
							$scope.getRecDataList().forEach(function (oA) {
								oA.list = [];
							});
							$scope.httpList = _pri.listFetch.list = [];
							$scope.postMsgToBg({
								msg : 'clearList'
							});
						}else if(oA) {
							_pri.forEachDel(_pri.listFetch.list, function (o) {
								return oA.list.some(function (oH) {
									return oH === o;
								});
							});
							//_.remove(_pri.listFetch.list, function (o) {
								//return oA.list.some(function (oH) {
									//return oH === o;
								//});
							//});
							oA.list = [];
						}
						_pri.hideInfoBox();
						$scope.typeList = $scope.getTypeList();
						$scope.showType();
					};
					$scope["postMsgToBg"] = function (oMsg) {
						var sCache = document.body.getAttribute('postWinData');
						if(0&&sCache !== 'hasLoadedCacheByBg') {
							if(!sCache) {
								sCache = '[]';
							}
							var aData = JSON.parse(sCache);
							aData.push(oMsg);
							document.body.setAttribute('postWinData', JSON.stringify(aData));
						}else{
							_pri.adapter.winPostToBg(oMsg);
						}
					};
					$scope["showType"] = function () {
						var aTypeShowList = [];
						$('._typeSel input[type=checkbox]').each(function () {
							if(this.checked) {
								aTypeShowList.push(this.value);
							}
						});
						//$scope.typeShowList = $scope.typeList.filter(function (s) {
							//return aTypeShowList.some(function (sHide) {
								//return sHide === s;
							//});
						//});
						$scope.typeShowList = aTypeShowList;
					};
					$scope["autoScroll"] = function () {
						_pri.beAutoScroll = $scope.beAutoScroll;
					};
					$scope["stop"] = function (bForce) {
						if(bForce || !$scope.stopBtn.disable) {
							$('._stopBtn').hide();
							$('._recBtn').show();
							$('body').addClass('stop-rec');
							_pri.bStop = true;
						}
					};
					$scope["rec"] = function () {
						if(!$scope.recBtn.disable) {
							$('._recBtn').hide();
							$('._stopBtn').show();
							$('body').removeClass('stop-rec');
							_pri.bStop = false;
						}
					};
					$scope["selHttp"] = function ($event, oHttp) {
						$event = $event || {};
						_pri.blingSelected($event, oHttp, $scope);
						_pri.showInfo(oHttp);
					};
					$scope["upload"] = function (oHttp) {
						var oData = _pri.getScriptData();
						$scope.stop(true);
						if(oData) {
							_.merge(oData, {
								//pageId : _pri.createUUID(),
								testEnv : _pri.testEnv,
								scriptId : _pri.createUUID()
							});
							$scope.postMsgToBg({
								msg : 'upload',
								data : oData
							});
							_pri.aPostConfirm.push(setTimeout(function() {
									//alert('打开窗口失败，请先启动Firefox浏览器。');
							}, 3000));
						}
					};
					$scope["handlerDragAction"] = function (sType, oData, oSrc) {
						_pri.HttpListCtrl$scope.setSelAction(oData);
						if(['init', 'action', 'end'].some(function (s) {
							return sType === s;
						})) {
							setTimeout(function() {
								$('._httpList').addClass('on-moving-action');
							});
							
						}
					};
					$scope["handlerDropAction"] = function (sType, oData, oSrc) {
						if(['init', 'action', 'end'].some(function (s) {
							return sType === s;
						})) {
							$('._httpList').removeClass('on-moving-action');
						}
						if(oData) {
							if(oSrc.event.delegateTarget.overElm) {
								$(oSrc.dropElement).removeClass('over-under over-above');
							}
							_pri.moveAction(oData.dragData, oData.dropData, oData.position === 'above');
						}
					};
					$scope["delAction"] = function (oAction) {
						_pri.delAction(oAction);
					};
					$scope["handlerDragHttp"] = function (sType, oData, oSrc) {
						/**
							oData
							oSrc
								event
								dragElement :
						*/
						if(oData._statusClass !== 'on-sel') {
							$scope.selHttp(null, oData);
						}
					};
					$scope["handlerDropHttp"] = function (sType, oData, oSrc) {
						/**
							oData
								position :
								dragData :
								dropData :
							oSrc
								event
								dragElement :
								dropElement :
						*/
						if(oSrc.event.delegateTarget.overElm) {
							$(oSrc.dropElement).removeClass('over-under over-above');
						}
						if(oData) {
							var aSelHttp = _pri.listFetch.list.filter(function (oHttp) {
								return oHttp._statusClass === 'on-sel';
							});
							if(!aSelHttp.some(function (oHttp) {
								return oHttp === oData.dropData;
							})) {
								_pri.moveHttp(aSelHttp, oData.dropData, oData.position === 'above');
							}
						}
					};
					_pri["onDrag"] = {
						'init' : $scope.handlerDragAction,
						'action' : $scope.handlerDragAction,
						'end' : $scope.handlerDragAction,
						'httpItem' : $scope.handlerDragHttp
					};
					_pri["onDrop"] = {
						'init' : $scope.handlerDropAction,
						'action' : $scope.handlerDropAction,
						'end' : $scope.handlerDropAction,
						'httpItem' : $scope.handlerDropHttp
					};
					$scope["refreshFilteredData"] = function () {
						$scope.filteredData = {};
						_.forIn($scope.recData, function (aA, k) {
							aA.forEach(function (oA) {
								$scope.filteredData[k+oA.name] = $scope.getActionShowList(oA);
							});
						});
					};

				})
					
				.directive('ngFocus', function( $timeout ) {
					return function( scope, elem, attrs ) {
						scope.$watch(attrs.ngFocus, function( yes ) {
							if ( yes ) {
								$timeout(function() {
									elem[0].focus();
								},0, false);
							}
						});
					};
				})
				.directive('bindDataToElm', ['$parse', function ($parse) {
					return function (scope, elm, attrs) {
						elm = elm[0];
						var sV = attrs['bindDataToElm'];
						var aV = sV.split(':');
						sV = aV[0];
						var oV = aV[0].trim().match(/^\{\{(.+)\}\}$/);
						if(oV) {
							sV = $parse(sV);
						}
						elm[sV] = aV[1] ? scope[aV[1]] : undefined;
					}
				}])
				.directive('uiDrag', ['$parse', function ($parse) {
					return function (scope, elm, attrs) {
						elm = elm[0];
						elm.setAttribute('draggable', 'true');
						var sV = attrs['uiDrag'];
						var aV = sV.split(':');
						sV = aV[0];
						var oV = aV[0].trim().match(/^\{\{(.+)\}\}$/);
						if(oV) {
							sV = $parse(sV);
						}
						elm.dragData = {
							name : sV.split(' '),
							args : aV[1] ? scope[aV[1]] : undefined,
							scope : scope
						};
					}
				}])
				.directive('uiDrop', ['$parse', function ($parse) {
					return function (scope, elm, attrs) {
						elm = elm[0];
						var sV = attrs['uiDrop'];
						var aV = sV.split(':');
						sV = aV[0];
						var oV = aV[0].trim().match(/^\{\{(.+)\}\}$/);
						if(oV) {
							sV = $parse(sV);
						}
						elm.dropData = {
							name : sV.split(' '),
							args : aV[1] ? scope[aV[1]] : undefined,
							scope : scope
						};
					}
				}])
				.filter('filterBy', ['$parse', function( $parse ) {
					return function (collection, properties, search) {

						if(search === undefined) {
							return collection;
						}try{

						var aR = collection.filter(function(oHttp, i) {
							return properties.some(function(prop) {
								var comparator = $parse(prop)(oHttp);
								var aFilterOr = [].concat(search);
								return aFilterOr.some(function (s) {
									if(oHttp.matchTrue === false) {
										return false;
									}
									if(s === 'all' || (comparator === undefined && s === 'other')) {
										return true;
									}
									return s === comparator;
								});
							});
						});
						}catch(e) {
							debugger;
						}
						return aR;
					};
				}])
				.filter('unique', ['$parse', function( $parse ) {
					return function (collection, property) {
						var oR = {}, aR = [];
						return collection.filter(function (o) {
							var comparator = $parse(property)(o);
							if(comparator && !(comparator in oR)) {
								oR[comparator] = true;
								return true;
							}
						});
					};
				}])
				.controller('MainCtrl', function($scope) {
					$scope.$on('callShowContextMenu', function(e, oData) {
						$scope.$broadcast('showContextMenu', oData);
					});
					$scope.$on('callCloseContextMenu', function(e, oData) {
						$scope.$broadcast('closeContextMenu', oData);
					});
					$scope.$on('callShowActionMenu', function(e, oData) {
						$scope.$broadcast('showActionMenu', oData);
					});
					$scope.$on('callCloseActionMenu', function(e, oData) {
						$scope.$broadcast('closeActionMenu', oData);
					});
				})
				.controller('InfoBoxCtrl', function($scope) {
					$scope.info = null;
					_pri.showInfoBox.getScope($scope);
				})
				.controller('ActionListContextMenu', function($scope) {
					$scope.$on('closeActionMenu', function(evt, oData) {
						//var_dump(oData);
					});
					$scope["buildAction"] = function () {
						var oData = _.clone($scope.action);
						_pri.formatActionDataToVmData(oData);
						$('._ptsScriptModal').modal();
					};
					$scope["rename"] = function () {
						$scope.action.rename = true;
						setTimeout(function() {
							$('._httpList ._renameInput').focus();
						},200);
					};
					$scope["renameTransaction"] = function () {
						var oAction = $scope.action;
						oAction.renameTransaction = true;
						var eAction = $scope.eAction;
						_pri.offsetRenameTransactionInput(eAction);
						setTimeout(function() {
							$('._httpList ._renameTransactionInput').focus();
						},200);
					};
					$scope.$on('showActionMenu', function(evt, oData) {
						$scope.action = oData.action;
						$scope.eAction = oData.elm;
						var $actionOperate = $('._operateActionBtn', oData.elm);
						var oOffset = $actionOperate.offset();
						$scope["beActionListHide"] = _pri.beActionListHide($scope.action);
						$scope["canTransaction"] = $scope.action.type === 'action' && !$scope.action.transaction;
						$scope["hasTransaction"] = $scope.action.transaction;
						_pri.HttpListCtrl$scope.setSelAction($scope.action);
						$('#menu-actionItem').addClass('open').css({
							'top' : (oOffset.top + 20) + 'px'
							, 'left' : (oOffset.left - 100) + 'px'
						});
					});
					$scope["setTarget"] = function () {
						_pri.HttpListCtrl$scope.targetToAction($scope.action);
					};
					$scope["setSelAction"] = function () {
						_pri.HttpListCtrl$scope.setSelAction($scope.action);
					};
					$scope["showActionListBox"] = function () {
						_pri.showActionListBox($scope.action);
					};
					$scope["hideActionListBox"] = function () {
						_pri.hideActionListBox($scope.action);
					};
					$scope["clearList"] = function () {
						$$bootstrapDialog.show({
							title: '清空请求确认',
							message: '亲，确定清空 <em>' + $scope.action.name + '</em>',
							buttons: [
								{
									label: '取消',
									cssClass: 'btn-style2',
									action: function(dialog) {
										dialog.close();
									}
								},
								{
									label: '清空请求',
									cssClass: 'btn-style2 btn-style2-primary',
									action: function(dialog) {
										_pri.HttpListCtrl$scope.actClearList($scope.action);
										$scope.$apply();
										dialog.close();
									}
								}
							],
							noFade : true
						});
					};
					$scope["delAction"] = function () {
						_pri.delAction($scope.action);
						$scope.closeContextMenu();
					};
					$scope["closeContextMenu"] = function () {
						$('#menu-actionItem').removeClass('open');
						$scope.createAction = '';
					};
					$scope["setTransaction"] = function () {
						_pri.setTransaction($scope.action);
					};
					$scope["delTransaction"] = function () {
						_pri.delTransaction($scope.action);
					};
					$scope["createCurrAction"] = function () {
						_pri.createAction($scope.action.type);
					};
					$scope.$watch('createAction', function(newValue, oldValue) {
						if(newValue) {
							//print_r('createAction : ' + newValue);
							//var_dump($scope.action);
							//_pri.createAction(newValue);
							//debugger;
							_pri.createAction($scope.action.type);
							$scope.closeContextMenu();
						}
					});
				})
				.controller('HttpListContextMenu', function($scope) {
					$scope.$on('showContextMenu', function(evt, oData) {
						//var_dump(oData);
						//var_dump(oData.http);
						var oHttp = oData.http;
						if(!oData.selHttp.some(function (oH) {
							return oH === oHttp;
						})) {
							_pri.HttpListCtrl$scope.selHttp(null, oHttp);
							oData.selHttp = [oHttp];
						}
						$scope.context = oData;
					});
					$scope.$on('closeContextMenu', function(evt, oData) {
						//print_r($scope.moveTo);
					});
					$scope["closeContextMenu"] = function () {
						$('#menu-httpItem').removeClass('open');
						$scope.moveTo = '';
					};
					$scope["delHttp"] = function () {
						_pri.delHttp($scope.context.selHttp);
						$scope.closeContextMenu();
					};
					$scope["buildHttp"] = function () {
						var oData = $scope.context.selHttp.map(function (oHttp) {
							return _.clone(oHttp);
						});
						$scope.closeContextMenu();
					};
					$scope.$watch('moveTo', function(newValue, oldValue) {
						if(newValue) {
							//print_r('moveTo : ' + newValue);
							//var_dump($scope.context);
							_pri.moveToAction(newValue, $scope.context.selHttp);
							$scope.closeContextMenu();
						}
					});
				})
			;
			//var $html = angular.element(document.getElementsByTagName('html')[0]);
			//angular.element().ready(function() {
				//angular.resumeBootstrap([httpViewApp['name']]);
			//});
			//$('._ptsScriptModal').on('show.bs.modal', function (e) {
			//});

			//alert(document.body.getAttribute('ver'));

			//$.get($('.__updataVerBtn').attr('href'), function (oData) {
					//if(!_pri.verIsLatest(oData.latestVer)) {
						//var sLatestVerUrl = oData.latestVerChromeUrl;
						//alert(location.href);
						//alert(_pri.adapter.env);
						//if(_pri.adapter.env === 'firefoxAddon') {
							//sLatestVerUrl = oData.latestVerFirefoxUrl;
						//}
						//$('.__updataVerBtn').prop('href', sLatestVerUrl).show();
					//}
				//},
				
				//'jsonp'
			//);

			$.ajax({
				url : $('.__updataVerBtn').attr('href'),
				success : function (oData) {
					var sLatestVerUrl = oData.Chrome.latestDownloadUrl;
					var sLatestVer = oData.Chrome.latestVer;
					if(_pri.adapter.env === 'firefoxAddon') {
						sLatestVerUrl = oData.Firefox.latestDownloadUrl;
						sLatestVer = oData.Firefox.latestVer;
					}
					if(!_pri.verIsLatest(sLatestVer)) {
						//alert(location.href);
						//alert(_pri.adapter.env);
						//alert(JSON.stringify(oData, 0, 4));
						$('.__updataVerBtn').attr('href', sLatestVerUrl).show();
					}
				},
				dataType : 'json'
			});



			$('._ptsScriptModal').on('show.bs.modal', function (e) {


			});
			$('._createPtsScriptBtn').on('click', function () {
				$('._ptsScript').val()
			});

			$('._typeSel').on('click', function (evt) {
				evt.stopPropagation();
			});

			$('._filterGroup').on('mouseover', function () {
				if(!$('._filterBtn', this).hasClass('disable')) {
					$(this).addClass('open');
				}
			});

			$('._filterGroup').on('mouseenter', function () {
				clearTimeout(_pri.iDropMenuHideTimer);
			});
			$('._filterGroup').on('mouseleave', function () {
				var eFilterGroup = this;
				_pri.iDropMenuHideTimer = setTimeout(function() {
					$(eFilterGroup).removeClass('open');
				},270);
			});

			$(document).on('click', function (evt) {
				if(
					!$(evt.target).closest('.context-menu').length
					&& !$(evt.target).closest('._contextMuneBtn').length
				) {
					$('.context-menu').removeClass('open');
				}
			});

			$('#menu-actionItem').on('click', function (evt) {
				var eMmenuActionItem = this;
				if(
					evt.target !== eMmenuActionItem
					&& evt.target.tagName !== 'SELECT'
				) {
					$(eMmenuActionItem).removeClass('open');
				}
			});

			window.onbeforeunload = function(){
				_pri.adapter.winPostToBg({
					msg : 'closeWin'
				});
			};
			_pri.adapter.winPostToBg({
				msg : 'openWin'
			});

			angular.resumeBootstrap();
			window.name = 'alibaba_CTC_PTS_record_tool_win';

			$('._httpList')
				.on('selectstart', function (evt) {
					evt.preventDefault();
				})
			;
			var iSI = setInterval(function() {try{
				
				var iTopBarHeight = $('._topBar').height();
				if(_pri.iTopBarHeightTemp !== iTopBarHeight) {
					_pri.iTopBarHeightTemp = iTopBarHeight;
					_pri.relayoutUi($$listenResizeWin.checkResize());
				}
			}catch(e) {console.log(e);clearInterval(iSI);}},500);
			$$listenResizeWin.add(function (oWH) {
				_pri.relayoutUi(oWH);
			}, true);

			$('body').css('visibility', 'visible');

			$('._httpList')
				.on('dragstart', '[ui-drag]', function (evt) {
					//print_r('dragstart');
					var eSel = this;
					evt.originalEvent.dataTransfer.setData('dragData:'+eSel.dragData.name.join('|'),null);

					_pri.dragSel = eSel;
					if(_pri.onDrag) {
						$(eSel).addClass('on-drag');
						_.forIn(_pri.onDrag, function (fListener, k) {
							if(eSel.dragData.name.some(function (s) {
								return k === s;
							}) && fListener) {
								/**
									oData
									oSrc
										event
										dragElement :
								*/
								fListener(k, eSel.dragData.args, {
									event : evt,
									dragElement : eSel
								});
							}
						});
						_pri.HttpListCtrl$scope.$apply('recList');
					}
				})
				.on('dragover', '[ui-drag]', function (evt) {
					//print_r('over');
					var eOver = this;
					if(_pri.bDragMatchDrop(_pri.dragSel, eOver)) {
						evt.preventDefault();
						if(_pri.dragSel !== eOver) {
							_pri.parseInsertPosition(evt, eOver);
						}
						evt.delegateTarget.overElm = eOver;
					}else{
						delete evt.delegateTarget.overElm;
					}
				})
				.on('dragleave', '[ui-drag]', function (evt) {
					//var_dump('leave');
					$(this).removeClass('over-under over-above');
					delete evt.delegateTarget.overElm;
				})
				.on('dragend', '[ui-drag]', function (evt) {
					//print_r('dragend');
					evt.preventDefault();
					var eSel = this;
					$(eSel).removeClass('on-drag');
					var eOver = evt.delegateTarget.overElm;
					$(eSel).removeClass('drag-sel');
					if(_pri.onDrop) {
						var oSrc = {
							event : evt,
							dragElement : eSel
						};
						if(_pri.bDragMatchDrop(eSel, eOver)) {
							_.forIn(_pri.onDrop, function (fListener, k) {
								if(eSel.dropData.name.some(function (s) {
									return k === s;
								}) && fListener) {
									var oData = {
										position : evt.delegateTarget.insertPosition,
										dragData : eSel.dragData.args
									};
									oData.dropData = eOver.dropData.args;
									oSrc.dropElement = eOver;
									/**
										oData
											position :
											dragData :
											dropData :
										oSrc
											event
											dragElement :
											dropElement :
									*/
									fListener(k, oData, oSrc);
								}
							});
						}else{
							_pri.dragSel.dragData.name.forEach(function (s) {
								if(_pri.onDrop[s]) {
									_pri.onDrop[s](s, null, oSrc);
								}
							});
						}
						_pri.HttpListCtrl$scope.$apply('recList');
					}
				})
			;

			$(document).on('keypress', function (evt) {
				//print_r(evt.which);
				if(evt.shiftKey && _pri.debugTriggerCheck(evt.which)) {
					//print_r(_pri.debugTriggerCheck.aDebugCheck);
					$('body').toggleClass('debug');
					if($('body').hasClass('debug')) {
						_pri.debugScriptData = true;
					}else{
						_pri.debugScriptData = false;
					}
					
				}
			});

		};

		_pri["relayoutUi"] = function (oWH) {
			var iTopBarHeight = $('._topBar').height();
			$('._main').css({
				marginTop : iTopBarHeight + 'px'
			});
			var iInfoBoxHeight = oWH.height - iTopBarHeight - 10;
			$('._infoBox').css({
				height : iInfoBoxHeight + 'px'
			});
			iInfoBoxHeight -= 20;
			$('._infoBox .tab-pane').height(iInfoBoxHeight-30+'px');

			if(oWH.width <= 1024 && oWH.width > 740) {
				$('._topBar').addClass('s740_1024').removeClass('s740');
			}else if(oWH.width <= 740) {
				$('._topBar').addClass('s740').removeClass('s740_1024');
			}else{
				$('._topBar').removeClass('s740_1024', 's740');
			}

			_pri.dialogHeight = oWH.height - iTopBarHeight - 100;
			$('._ptsScript').height(_pri.dialogHeight - 30 + 'px');
		};

		_pri["testEnv"] = $('#testEnv').val();

		_pri["debugTriggerCheck"] = (function () {
			var _fun = function (iKeyCode) {
				_fun.aDebugCheck.shift(iKeyCode);
				_fun.aDebugCheck.push(iKeyCode);
				//100,97,116,97
				//68,65,84,65
				//print_r(_fun.aDebugCheck);
				return _fun.checkArrString();
			};
			_fun["aDebugCheck"] = Array(4);

			_fun["checkArrString"] = function () {
				return (_fun.aDebugCheck[0] === 100 || _fun.aDebugCheck[0] === 68)
				&& (_fun.aDebugCheck[1] === 97 || _fun.aDebugCheck[1] === 65)
				&& (_fun.aDebugCheck[2] === 116 || _fun.aDebugCheck[2] === 84)
				&& (_fun.aDebugCheck[3] === 97 || _fun.aDebugCheck[3] === 65);
			};
		
			return _fun;
		}());

		_pri["handleMsg"] = function (oData, $scope) {
			
			if(!_pri.bStop) {
				if(oData.msg === 'postHttp' || oData.msg === 'postHttpList') {
					$scope.httpList = _pri.listFetch(oData);
					$scope.typeList = $scope.getTypeList();
					$scope.showType();
					$scope.$apply('targetAction');
				}
			}

			if(oData.msg === 'getUpload') {
				_pri.aPostConfirm.forEach(function (iS) {
					clearTimeout(iS);
				});
				_pri.tips('已成功上传脚本到手工编写文本框，请到新建脚本页面继续编辑。', {
					force : true,
					hide : true
				});
				_pri.aPostConfirm = [];
			}
		};


		_pri["buildScript"] = function () {
			var oD = _pri.getScriptData();
			var sScriptTxt = oD.script;
			if(_pri.debugScriptData) {
				sScriptTxt = oD.script + '\n========= vm =========\n' + _pri.scriptVm + '\n========== data ========\n' + oD.data;
			}
			if(oD) {
				$('._ptsScript')
					//.val(JSON.stringify(oData, 0, 4))
					.val(sScriptTxt)
					//.val(oD.script + '\n==================\n' + oD.data)
					.height(_pri.dialogHeight - 30 + 'px')
				;
				setTimeout(function() {
					$('._ptsScript').select();
				},550);


				//var oMC_win = $('._mcShow')[0].contentWindow;
				//oMC_win.oMC.doc.setValue(sScriptTxt);
				//oMC_win.oMC.setSize('100%', '100%');
			}else{
				return false;
			}
		};

		_pri["createUUID"] = function (sGap) {
			var sUUID = '';
			sGap = sGap || '';

			while(sUUID.length < 32) {
				sUUID += Math.floor(Math.random()*36).toString(36);
			}
			var aS = sUUID.split('');
			aS = [
				aS.splice(0,8).join(''),
				aS.splice(0,4).join(''),
				aS.splice(0,4).join(''),
				aS.splice(0,4).join(''),
				aS.slice(0).join('')
			];
			sUUID = aS.join(sGap);
			//print_r(aS.join('-'));

			return sUUID;
		};


		_pri["verIsLatest"] = function (sVer) {
			return sVer === _pri.sCurrVer;
		};

		_pri["sendCustomEvent"] = function (oData) {
			var event = document.createEvent('CustomEvent');
			event.initCustomEvent('CustomEventMessage', true, true, oData);
			window.dispatchEvent(event);
		};

		_pri["adapter"] = (function () {
			var sEnv;
			//if(
				//!~location.href.indexOf('chrome-extension://')
			//) {
				//sEnv = 'webDev';
			//}
			return $$adapter(sEnv);
		})();

		_pri["aPostConfirm"] = [];
		
		_pri["getFormatData"] = function () {
			var oData = _.cloneDeep(_pri.HttpListCtrl$scope.recData);
			var oResp = _pri.formatToVmData(oData);
			return {
				data : oResp.data,
				resp : oResp
			};
		};

		_pri["forEachDel"] = function (aE, fnF, thisArg) {
			thisArg = thisArg || aE;
			var i, l, bRF;
			for (i=0, l = aE.length; i < l; ++i) {
				if(fnF.call(thisArg, aE[i], i)) {
					aE.splice(i, 1);
					i--;
					l--;
				}
			}
			return aE;
		};

		_pri["filterContentType"] = function (oData) {
			if(!_pri.HttpListCtrl$scope.typeShowList.some(function (s) {
				return s === 'all';
			})) {
				if(_pri.HttpListCtrl$scope.typeShowList.length) {
					_.flatten([oData.init, oData.actions, oData.end]).forEach(function (oA) {
						oA.requests = oA.requests.filter(function (oHttp) {
							return _pri.HttpListCtrl$scope.typeShowList.some(function (s) {
								var bMatch = oHttp.contentType === s;
								if(!oHttp.contentType && s === 'other') {
									bMatch = true;
								}
								if(oHttp.matchTrue === false) {
									bMatch = false;
								}
								return bMatch;
							});
						});
					});
				}
			}else{
				_.flatten([oData.init, oData.actions, oData.end]).forEach(function (oA) {
					oA.requests = oA.requests.filter(function (oHttp) {
						return oHttp.matchTrue;
					});
				});
			}
		};

		_pri["copeActionInfo"] = function (oData) {
			[oData.init, oData.actions, oData.end].forEach(function (aA) {
				aA.forEach(function (oA, i) {
					oA.desc = _pri.encodeQuotationMarks(oA.name);
					oA.name = oA.type + (i+1);
				});
			});
		};
		_pri["encodeQuotationMarks"] = function (s) {
			return s.replace(/\'/g, '\\\'')//.replace(/\r/g, '');.replace(/\n/g, '\\n');
		};
		_pri["startTime"] = +new Date();

		_pri["formatHttpDataToVmData"] = function (oHttp) {
			oHttp.headers = {};
			oHttp.url = _pri.encodeQuotationMarks(oHttp.url);
			//oHttp.body = oHttp.postData || '';
			oHttp.body = _pri.encodeQuotationMarks(oHttp.postData || '');
			if(oHttp.requestHeader) {
				oHttp.requestHeader.forEach(function (aHeader) {
					if(
						aHeader[0] !== 'Accept'
						&& aHeader[0] !== 'User-Agent'
						&& aHeader[0] !== 'Cookie'
					) {
						oHttp.headers[_pri.encodeQuotationMarks(aHeader[0])] = _pri.encodeQuotationMarks(aHeader[1]);
					}
				});
			}
			delete oHttp._dataArray;
			delete oHttp.postData;
			delete oHttp.requestHeader;
			delete oHttp.responseHeader;
			delete oHttp.$$hashKey;
			delete oHttp.index;
			delete oHttp._statusClass;
			delete oHttp.__cacheStatusClass;
			delete oHttp._parentAction;
			return oHttp;
		};

		_pri["formatActionDataToVmData"] = function (oA) {
			oA.requests = oA.list;
			oA.requests = oA.requests.map(function (oHttp) {
				_pri.formatHttpDataToVmData(oHttp);
				return oHttp;
			});
			delete oA.list;
			delete oA._targetClass;
			delete oA._hideListClass;
			delete oA._selClass;
			delete oA.$$hashKey;
			delete oA._parentAction;
		};

		_pri["checkActionSize"] = function (oA) {
			var sASTpl = _pri.macroGenerateRequestTpl + _pri.actDefTpl;
			var sActionScript = $$velocity.render(sASTpl, {
				action : oA
			});
			oA.scriptTextSize = sActionScript.length * 2;
			return oA.scriptTextSize > (64 * 1024 * 2);
		};

		_pri["formatToVmData"] = function (oData) {
			var hasTransaction = false;
			_.flatten([oData.init, oData.action, oData.end]).forEach(function (oA) {
				if(oA.transaction) {
					hasTransaction = true;
				}else{
					oA.transaction = '';
				}
				_pri.formatActionDataToVmData(oA);
			});
			oData.actions = oData.action;
			delete oData.action;
			var oR = {data:oData};
			if(!hasTransaction) {
				oR.error = {
					hasTransaction : hasTransaction
				}
			}
			//var sASTpl = _pri.macroGenerateRequestTpl + _pri.actDefTpl;
			//_.flatten([oData.init, oData.actions, oData.end]).forEach(function (oA) {
				//if(_pri.checkActionSize(oA)) {
					//oA._scriptTextSizeWarning = true;
					//if(oR.error) {
						//oR.error.bigAction.push(oA);
					//}else{
						//oR.error = {
							//bigAction : [oA]
						//}
					//}
				//}
			//});
			//oData.actions.forEach(function (oA) {
			//});
			
			return oR;
		};

		_pri["setTransaction"] = function (oAction) {
			oAction.transaction = true;
		};

		_pri["delTransaction"] = function (oAction) {
			delete oAction.transaction;
		};
		
		_pri["moveHttp"] = function (aHttp, oHttpTo, bAbove) {
			aHttp.forEach(function (oHttp) {
				_.pull(oHttp._parentAction.list, oHttp);
				oHttp._parentAction = oHttpTo._parentAction;
			});
			var iInsertIndex = _.indexOf(oHttpTo._parentAction.list, oHttpTo);
			oHttpTo._parentAction.list.splice.apply(oHttpTo._parentAction.list, [iInsertIndex+!bAbove, 0].concat(aHttp));
		};
		
		_pri["moveAction"] = function (oActionSel, oActionTo, bAbove) {
			_.pull(_pri.HttpListCtrl$scope.recData[oActionSel.type], oActionSel);
			var iInsertIndex = _.indexOf(_pri.HttpListCtrl$scope.recData[oActionSel.type], oActionTo);
			_pri.HttpListCtrl$scope.recData[oActionTo.type].splice(iInsertIndex+!bAbove, 0, oActionSel);
		};

		_pri["delHttp"] = function (aHttp) {
			if(!$.isArray(aHttp)) {
				aHttp = [aHttp];
			}
			aHttp.forEach(function (oH) {
				_.remove(oH._parentAction.list, oH);
				_.remove(_pri.listFetch.list, oH);
			});
			setTimeout(function() {
				_pri.HttpListCtrl$scope.$apply('recData');
			});
			_pri.hideInfoBox();
		};

		_pri["getScriptData"] = function () {
			var oInfo =_pri.getFormatData();
			var oData = oInfo.data;
			_pri.filterContentType(oData);
			_pri.copeActionInfo(oData);
			//oData.id = _pri.scriptId || 'theCreateScriptIdFormPtsNewScriptPage';
			[oData.init, oData.actions, oData.end].forEach(function (aA) {
				_.remove(aA, function (o) {
					return !o.requests.length;
				});
				aA.forEach(function (oA) {
					if(_pri.checkActionSize(oA)) {
						oA._scriptTextSizeWarning = true;
						if(oInfo.resp.error) {
							oInfo.resp.error.bigAction.push(oA);
						}else{
							oInfo.resp.error = {
								bigAction : [oA]
							}
						}
					}
				});
			});
			//_.remove(oData.end);
			if(!oInfo.resp.error) {
				var sData = JSON.stringify(oData, 0, 4);
				var sScript = $$velocity.render(_pri.scriptVm, oData);
				sScript = sScript.split('\n').map(function (s) {
					s = s.replace(/\t/g, '    ');
					//s = s.replace(/    /g, '@');
					return s;
				}).filter(function (s) {
					return s.trim();
				}).map(function (s) {
					var sStr = s.trim();
					if(
						sStr.indexOf('headers = [ NVPair') === 0
						|| sStr.indexOf('##') === 0
					) {
						s = '\n' + s;
					}else if(sStr.indexOf('return statusCode') === 0) {
						s = '\n' + s + '\n';
					}
					return s;
				}).join('\n');
				return {
					data : sData,
					script : sScript
				};
			}else{
				if(oInfo.resp.error.bigAction) {
					if(oInfo.resp.error.bigAction.length) {
						var aWarning = oInfo.resp.error.bigAction.map(function (oA) {
							return '<em>'+oA.desc+'</em>';
						});
						$$bootstrapDialog.show({
							title: '脚本文件超大啦',
							message: '亲，行为包含的请求大小不能超过64K。\n'+aWarning.join(', ')+'大小超过64K，请调整',
							buttons: [
								{
									label: '取消',
									cssClass: 'btn-style2',
									action: function(dialog) {
										dialog.close();
									}
								}
								, {
									label: '确定',
									cssClass: 'btn-style2 btn-style2-primary',
									action: function(dialog) {
										dialog.close();
									}
								}
							],
							noFade : true
						});
					}

				}else{
					$$bootstrapDialog.show({
						title: '发现错误',
						message: '至少要有一个行为。',
						buttons: [{
							label: 'OK',
							cssClass: 'btn-style2 btn-style2-primary',
							action: function(dialog) {
								dialog.close();
							}
						}],
						noFade : true
					});
				}
				return false;
			}
		};

		_pri["checkActionName"] = function (sActionName) {
			var bOk = true, sMsg;
			if(sActionName) {
				//bOk = /^[\w_]+$/.test(sActionName);
				//if(bOk) {
					//if(/^\d/.test(sActionName)) {
						//bOk = false;
						//sMsg = 'Action名称不能由数字开头';
					//}
				//}else{
					//sMsg = 'Action名称只能由数字、字母、下划线组成';
				//}
			}else{
				bOk = false;
				sMsg = 'action名称不能为空';
			}
			if(sActionName.length > 20) {
				sMsg = 'action名称不能超过20个字符。';
				bOk = false;
			}
			return {
				isOk : bOk,
				msg : sMsg
			};
		};

		_pri["offsetRenameTransactionInput"] = function (eAction) {
			var oOffset = $('._actionTransactionNameText', eAction).position();
			setTimeout(function() {
				$('._renameTransactionInput', eAction).css('left', oOffset.left+12+'px');
			});
			
		};

		_pri["bDragMatchDrop"] = function (eStart, eOver) {
			return eOver && _pri.dragSel.dragData.name.some(function (sDrag) {
				return eOver.dropData.name.some(function (sDrop) {
					return sDrag === sDrop;
				});
			});
		};

		_pri["parseInsertPosition"] = function (evt, elm) {
			if(_pri.bUnderItem(evt.originalEvent, elm)) {
				$(elm).addClass('over-under');
				$(elm).removeClass('over-above');
				evt.delegateTarget.insertPosition = 'under';
			}else{
				$(elm).addClass('over-above');
				$(elm).removeClass('over-under');
				evt.delegateTarget.insertPosition = 'above';
			}
		};

		_pri["bUnderItem"] = function (evt, elm) {
			var oOffset = $(elm).offset();
			if(1||evt.offsetY === undefined) {
				evt.offsetY = evt.layerY - oOffset.top;
			}
			var iH = $(elm).outerHeight();
			//print_r(evt.offsetY +' | '+   iH/2);
			return evt.offsetY >= iH/2;
		};

		_pri["delAction"] = function (oAction) {

			$$bootstrapDialog.show({
				title: '删除确认',
				message: '亲，确定要删除 <em>'+oAction.name+'</em>？',
				buttons: [
					{
						label: '取消',
						cssClass: 'btn-style2',
						action: function(dialog) {
							dialog.close();
						}
					}
					, {
						label: '确定',
						cssClass: 'btn-style2 btn-style2-primary',
						action: function(dialog) {
							_pri.actDelAction(oAction);
							dialog.close();
							_pri.HttpListCtrl$scope.$apply('recData');
						}
					}
				],
				noFade : true
			});
		};

		_pri["actDelAction"] = function (oAction) {
			if(_pri.HttpListCtrl$scope.recData.action.length > 1 || oAction.type !== 'action') {
				if(_pri.HttpListCtrl$scope.targetAction === oAction) {
					delete _pri.HttpListCtrl$scope.targetAction;
				}
				_.forIn(_pri.HttpListCtrl$scope.recData, function (aAction) {
					_.remove(aAction, oAction);
				});
				_pri.targetOtherAction();
			}else{
				_pri.tips('脚本中必须至少有一个 action，已经为您自动创建。', {
					autoHide : true
				});
				_pri.HttpListCtrl$scope.actClearList(oAction);
				oAction.name = 'action1';
				_pri.HttpListCtrl$scope.targetToAction(oAction);
			}
			
		};

		_pri["targetOtherAction"] = (function () {
			var _fun = function () {
				var oTargetAction;
				_pri.HttpListCtrl$scope.targetToAction(_pri.HttpListCtrl$scope.recData.action[0]);
			};
		
			
		
			return _fun;
		}());


		_pri["getRecDataList"] = function () {
			var oData = _pri.HttpListCtrl$scope.recData;
			return _.flatten([oData.init, oData.action, oData.end]);
		};

		_pri["hideActionListBox"] = function (oAction) {
			oAction._hideListClass = 'hide-action-list-box';
		};

		_pri["showActionListBox"] = function (oAction) {
			oAction._hideListClass = '';
		};

		_pri["toggleActionListBox"] = function (oAction) {
			if(_pri.beActionListHide(oAction)) {
				_pri.showActionListBox(oAction);
			}else{
				_pri.hideActionListBox(oAction);
			}
		};

		_pri["beActionListHide"] = function (oAction) {
			return !!oAction._hideListClass;
		};

		_pri["getActionListBoxByNameEle"] = function (eNameEle) {
			return $(eNameEle).parents('._actionBox')[0];
		};

		_pri["getActionFromRecData"] = function (sActionValue) {
			var iI = sActionValue.lastIndexOf('(');
			var sName = sActionValue.slice(0, iI-1);
			var sType = sActionValue.slice(iI+1, -1);
			var oTargetAction;
			_pri.getRecDataList().some(function (oAction) {
				if(oAction.name === sName) {
					oTargetAction = oAction;
					return true;
				}
			});
			return oTargetAction;
		};

		_pri["moveToAction"] = function (sActionName, httpList) {
			//print_r(sActionName);
			var oTargetAction = _pri.getActionFromRecData(sActionName);
			if(oTargetAction) {
				httpList.forEach(function (oH) {
					_.remove(oH._parentAction.list, oH);
					oH._parentAction = oTargetAction;
					oTargetAction.list.push(oH);
				});
			}
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


		_pri["blingSelected"] = function ($event, oHttp, $scope) {
			if($event.shiftKey) {
				var iLast = -1;
				var aTr = $($event.currentTarget).parents('.action-list').find('.tr').toArray();
				var iEndIndex = -1;
				aTr.some(function (eTr, i) {
					iEndIndex = i;
					return eTr.httpData === oHttp;
				});
				if(_pri.selLast && iEndIndex>-1 && aTr.some(function (eTr, i) {
					var oH = eTr.httpData;
					iLast = i;
					return oH === _pri.selLast;
				})) {
					$scope.httpList.forEach(function (oHttp) {
						if(oHttp._statusClass === 'on-sel') {
							oHttp._statusClass = oHttp.__cacheStatusClass;
						}
					});
					if(iLast >= iEndIndex) {
						iLast = [iLast, iEndIndex];
						iEndIndex = iLast[0]+1;
						iLast = iLast[1];
					}else{
						iEndIndex++;
					}
					
					aTr.slice(iLast, iEndIndex).forEach(function (eTr) {
						var oH = eTr.httpData;
						oH._statusClass = 'on-sel';
					});
				}else{
					$scope.httpList.forEach(function (oHttp) {
						if(oHttp._statusClass === 'on-sel') {
							oHttp._statusClass = oHttp.__cacheStatusClass;
						}
					});
					oHttp._statusClass = 'on-sel';
					_pri.selLast = oHttp;
				}
			}else if($event.ctrlKey) {
				if(oHttp._statusClass === 'on-sel') {
					oHttp._statusClass = oHttp.__cacheStatusClass;
				}else{
					oHttp._statusClass = 'on-sel';
				}
			}else{
				$scope.httpList.forEach(function (oHttp) {
					if(oHttp._statusClass === 'on-sel') {
						oHttp._statusClass = oHttp.__cacheStatusClass;
					}
				});
				oHttp._statusClass = 'on-sel';
				_pri.selLast = oHttp;
			}
		};

		_pri["createActionData"] = (function () {
			var _fun = function (sType, oSpec) {
				oSpec = oSpec || {};
				var sName = oSpec.name || sType.toLowerCase() + _fun.getIndex(sType);
				
				var oR = {
					name : sName,
					type : sType,
					list : []
				};
				oR.transaction = !!oSpec.transaction;
				if(sType === 'action') {
					oR.transaction = true;
				}
				return oR;
			};
		
			_fun["getIndex"] = function (sType) {
				_fun.oIndex[sType] = _fun.oIndex[sType] || 0;
				return ++_fun.oIndex[sType];
			};

			_fun["oIndex"] = {};
		
			return _fun;
		}());

		_pri["createAction"] = function (sType, oSpec) {
			var oNewAction = _pri.createActionData(sType, oSpec);
			var aAction = _pri.HttpListCtrl$scope.recData[sType];
			var bInserted = false;
			if(oSpec && oSpec.targetAction) {
				aAction.forEach(function (oA, i) {
					if(oA === oSpec.targetAction) {
						aAction.splice(i+1, 0, oNewAction);
						bInserted = true;
					}
				});
			}
			if(!bInserted) {
				aAction.push(oNewAction);
			}
			return oNewAction;
		};

		_pri["actionIndex"] = 1;

		_pri["showInfo"] = function (oHttp) {
			_pri.showInfoBox(oHttp);
			_pri.renderSelHttpRelated(oHttp);
			_pri.showTabRequest();
		};

		_pri["renderSelHttpRelated"] = function (oHttp) {
			_pri.listFetch.list.forEach(function (o) {
				delete o._lastSel;
			});
			oHttp._lastSel = true;
		};

		_pri["hideInfoBox"] = function () {
			$('._httpList').removeClass('col-xs-8').addClass('col-xs-12');
			$('._infoBox').addClass('col-xs-4').hide();
		};

		_pri["showTabRequest"] = function () {
			$('._requestHeaderPaneTab').eq(0).tab('show');
		};

		_pri["showInfoBox"] = (function () {
			var _fun = function (oInfo) {
				if(oInfo.postData) {
					if(oInfo.postData  ) {
						oInfo.postData = _pri.encodeQuotationMarks(oInfo.postData);
						oInfo._dataArray = oInfo.postData.split('&').map(function (s) {
							return s.split('=');
						});
					}
				}
				_fun.$scope.info = oInfo;
				$('._httpList').removeClass('col-xs-12').addClass('col-xs-8');
				$('._infoBox').addClass('col-xs-4').show();
				$('._main').addClass('show-info-box');
			};
		
			_fun["getScope"] = function (oScope) {
				_fun.$scope = oScope;
			};
		
			return _fun;
		}());

		_pri["scrollToButtom"] = function () {
			setTimeout(function() {
				$('body')[0].scrollTop = $('body')[0].scrollHeight;
				$('html')[0].scrollTop = $('html')[0].scrollHeight;
			});
			
		};

		_pri["matchHttp"] = function (oHttp) {
			var sAccept = _pri.HttpListCtrl$scope.ruleList[0];
			var sExcept = _pri.HttpListCtrl$scope.ruleList[1];
			var bR = true;
			var bHasA = false;
			var bA = false;
			if(_pri.HttpListCtrl$scope.matchList.length) {
				var urlStr = oHttp.url.slice(oHttp.url.indexOf('://')+3);
				urlStr = urlStr.slice(0, urlStr.indexOf('/'));
				_pri.HttpListCtrl$scope.matchList.some(function (oMatch) {
					var bM = $$wildcard(oMatch.str, urlStr);
					if(oMatch.rule === sAccept) {
						bHasA = true;
					}
					if(bM) {
						if(oMatch.rule === sAccept) {
							bA = true;
						}else{
							bR = false;
							oHttp.matchTrue = !!bR && (bHasA ? bA : true);
							return true;
						}
					}
				});

				oHttp.matchTrue = !!bR && (bHasA ? bA : true);


			}else{
				oHttp.matchTrue = true;
			}
		};

		_pri["copeHttpData"] = function (oD) {
			var sType = oD.msg;
			var oData = oD.data;
			oData = _pri.decorateData(oData);
			//var_dump(oData);
			if(sType === 'response') {
				oData.contentType = _pri.parseContentType(oData);	
				_pri.listFetch.list.some(function (oD, i) {
					var bHas = (oData.index === oD.index) || (oData.requestId && oData.requestId === oD.requestId);
					if(bHas) {
						oData.__cacheStatusClass = '';
						if(oData.locCache) {
							oData.__cacheStatusClass = 'weak';
						}else{
							if(oData.status === 304) {
								oData.__cacheStatusClass = 'info';
							}else if(oData.status >= 400) {
								oData.__cacheStatusClass = 'danger';
							}
						}
						if(oD._statusClass !== 'on-sel') {
							oData._statusClass = oData.__cacheStatusClass;
						}
						_pri.copeScriptSize(oData);
						JH.mergePropertyFrom(_pri.listFetch.list[i], oData);
					}
					return bHas;
				});
			}else if(sType === 'request') {
				oData._statusClass = 'warning';
				_pri.listFetch.list.push(oData);
				oData._parentAction = _pri.HttpListCtrl$scope.targetAction;
				_pri.copeScriptSize(oData);
				_pri.matchHttp(oData);
				_pri.HttpListCtrl$scope.targetAction.list.push(oData);
			}
			oData.__cacheStatusClass = oData._statusClass;
		};

		_pri["copeScriptSize"] = function (oData) {
			
		};

		_pri["listFetch"] = (function () {
			var _fun = function (oPost) {
				if(!_pri.listFetch.list) {
					_pri.listFetch.list = [];
				}
				var sType = oPost.msg;
				oData = oPost.data;

				var beGoScroll = false;
				if(sType === 'postHttpList') {
					oData.forEach(function (oD) {
						if(oD.msg === 'request') {
							beGoScroll = true;
						}
						_pri.copeHttpData(oD);
					});
				}else{
					if(oData.msg === 'request') {
						beGoScroll = true;
					}
					_pri.copeHttpData(oData);
				}
				if(_pri.beAutoScroll && beGoScroll) {
					_pri.scrollToButtom();
				}
				return _pri.listFetch.list;
			};
		
			_fun["list"] = [];
		
			return _fun;
		}());;

		_pri["cacheData"] = (function () {
			var _fun = function (sSpace, sId, oData) {
				_fun[sSpace] = _fun[sSpace] || {};
				//_fun[sSpace][sId] = oData;
			};

			return _fun;
		}());

		_pri["getData"] = function (sSpace, sId) {
			var oR = null;
			if(_pri.cacheData[sSpace]) {
				oR = _pri.cacheData[sSpace][sId];
			}
			return oR;
		};

		_pri["tips"] = function (sText, oSpec) {
			oSpec = oSpec || {};
			$('._tipsBox ._tipsText').html(sText);
			$('._tipsBox').show();
			var bClose = true;
			var fHide = function () {
				setTimeout(function() {
					if(bClose || oSpec.force) {
						$('._tipsBox').fadeOut();
					}
				},oSpec.autoHide == 1 ? 3000 : oSpec.autoHide);
			};
			$('._tipsBox ._tipsContent').on('mouseenter', function () {
				bClose = false;
			}).on('mouseleave', function () {
				bClose = true;
				fHide();
			}).on('click', 'button.close', function () {
				bClose = true;
				$('._tipsBox').hide();
			});
			if(oSpec.autoHide) {
				fHide();
			}
		};

		_pri["copeHttpHeadersData"] = function (oData) {
			var oD = {
				requestHeader : oData.requestHeader
			};
			if(oD.responseHeader) {
				oD.responseHeader = oData.responseHeader;
			}
			delete oData.requestHeader;
			delete oData.responseHeader;

			return oD;
		};

		_pri["decorateData"] = function (oData) {
			oData.timeStamp = new Date() - _pri.startTime;
			//_pri.cacheData('httpHeaders', oData.index, _pri.copeHttpHeadersData(oData));
			return oData;
		};

		_pri["getExtName"] = function (s) {
			var aS = s.split('?');
			var sE = aS[0].slice(aS[0].lastIndexOf('.')+1);
			return sE;
		};

		_pri["sCurrVer"] = _pri.parseUrl(location.href).searchJson.ver;

		_pri["scriptVm"] = [
			'#! /usr/bin/env python   ',
			'# -*- coding: utf-8 -*-',
			'# PTS Script record tool v' + _pri.sCurrVer,
			'',
			'# PTS脚本SDK：框架API、常用HTTP请求/响应处理API',
			'from util import PTS',
			'from HTTPClient import NVPair',
			'from HTTPClient import Cookie',
			'from HTTPClient import HTTPRequest',
			'from HTTPClient import CookieModule',
			'',
			'# 脚本初始化段，可以设置压测引擎的常用HTTP属性',
			'#PTS.HttpUtilities.setKeepAlive(False)',
			'#PTS.HttpUtilities.setUrlEncoding(\'GBK\')',
			'#PTS.HttpUtilities.setFollowRedirects(False)',
			'#PTS.HttpUtilities.setUseCookieModule(False)',
			'PTS.HttpUtilities.setUseContentEncoding(True)',
			'PTS.HttpUtilities.setUseTransferEncoding(True)',
			'',
			'#\\# 如想通过ECS内网IP进行压测，必须在下方“innerIp”备注行中输入ECS内网IP，如有多个请以英文逗号分隔，例如：127.0.0.1,127.0.0.2',
			'# innerIp:',
			_pri["macroGenerateRequestTpl"] = [
			'#macro(generateRequest $request)',
			'',
			'        headers = [ NVPair(\'Accept\', \'*/*\'),#set($headers = ${request.headers})#foreach($hdr-key in $headers.keySet()) NVPair(\'$hdr-key\', \'#noescape()$headers.get($hdr-key)#end\'),#end NVPair(\'User-Agent\', \'PTS-HTTP-CLIENT\'), ]',
			'    #if(${request.method} == \"GET\")    result = HTTPRequest().GET(\'#noescape()${request.url}#end\', None, headers)#else    result = HTTPRequest().POST(\'#noescape()${request.url}#end\', \'\'\'#noescape()${request.body}#end\'\'\', headers)#end#end'
			].join('\n'),
			'',
			'#\\# 脚本执行单元类，每个VU/压测线程会创建一个TestRunner实例对象',
			'',
			'class TestRunner:',
			'',
			'    # TestRunner对象的初始化方法，每个线程在创建TestRunner后执行一次该方法',
			'    def __init__(self):',
			'        self.threadContext = PTS.Context.getThreadContext()',
			'        #foreach($action in $init)self.${action.name}()',
			'        #end',
			'',
			'        self.init_cookies = CookieModule.listAllCookies(self.threadContext)',
			'    ',
			'    # 主体压测方法，每个线程在测试生命周期内会循环调用该方法',
			'    def __call__(self):',
			'        PTS.Data.delayReports = 1',
			'        ',
			'        for c in self.init_cookies:',
			'            CookieModule.addCookie(c, self.threadContext)',
			'        #foreach($action in ${actions})',
			'',
			'        #if(${action.transaction} != \"\")statusCode = self.${action.name}()',
			'        PTS.Framework.setExtraData(statusCode)#else',
			'        self.${action.name}()',
			'        #end',
			'        #end',
			'        ',
			'        PTS.Data.report()',
			'        PTS.Data.delayReports = 0',
			'        ',
			'    # TestRunner销毁方法，每个线程循环执行完成后执行一次该方法',
			'    def __del__(self):',
			'        ',
			'        for c in self.init_cookies:',
			'            CookieModule.addCookie(c, self.threadContext)',
			'        #foreach($action in $end)',
			'',
			'        self.${action.name}()',
			'        #end',
			'    ',
			'    # 定义请求函数',
			'    #foreach($action in $init)',
			'',
			'',
			'    #\\# #noescape()${action.desc}#end',
			'',
			'    def ${action.name}(self):',
			'        #foreach($request in ${action.requests})#generateRequest($request)',
			'        #end',
			'    #end',

			'    #foreach($action in ${actions})',
			_pri["actDefTpl"] = [
			'',
			'',
			'    #\\# #noescape()${action.desc}#end',
			'',
			'    def ${action.name}(self):',
			'        #if(${action.transaction} != \"\")statusCode = [0L, 0L, 0L, 0L]#end',
			'        #foreach($request in ${action.requests})#generateRequest($request)',
			'',
			'        #if(${action.transaction} != \"\")PTS.Framework.addHttpCode(result.getStatusCode(), statusCode)',
			'',
			'        #end#end',
			'',
			'        #\\# statusCode[0]代表http code < 300 个数,    statusCode[1] 代表 300<=http code<400 个数',
			'        # statusCode[2]代表400<=http code<500个数，  statusCode[3] 代表 http code >=500个数',
			'        # 如果http code 300 到 400 之间是正常的',
			'        # 那么判断事务失败，请将statusCode[1:3] 改为   statusCode[2:3] 即可',
			'',
			'        #if(${action.transaction} != \"\")if(sum(statusCode[1:3]) > 0):',
			'',
			'            PTS.Data.forCurrentTest.success = False',
			'            PTS.Logger.error(u\'事务请求中http 返回状态大于300，请检查请求是否正确!\')',
			'       #end return statusCode',
			'        '
			].join('\n'),
			'    #end',
			'    ',
			'    #foreach($action in $end)',
			'',
			'',
			'    #\\# #noescape()${action.desc}#end',
			'',
			'    def ${action.name}(self):',
			'        #foreach($request in ${action.requests})#generateRequest($request)',
			'        #end',
			'    #end',
			'',
			'',
			'',
			'# 编织压测事务',
			'#foreach($action in ${actions})#if(${action.transaction} != \"\")PTS.Framework.instrumentMethod(u\'#noescape()${action.desc}#end\', \'${action.name}\', TestRunner)',
			'#end#end',
			''
		].join('\n');

		_pri["parseContentType"] = function (oData) {
			if(oData.method === 'POST') {
				return 'html';
			}
			var sExtName = _pri.getExtName(oData.url);
			var sCT;
			if(oData.responseHeader) {
				if(oData.responseHeader.some(function (arr) {
					if(arr[0].toLowerCase() === 'content-type') {
						sCT = arr[1];
						return true;
					}
				})) {
					sCT = sCT.split(';')[0].trim();
					switch(sCT) {
						case 'text/css':
							return 'css';
						case 'text/html':
							return 'html';
						case 'text/javascript':
						case 'application/javascript':
						case 'application/x-javascript':
							return 'js';
						case 'image/bmp':
						case 'image/x-jg':
						case 'image/gif':
						case 'image/x-icon':
						case 'image/jpg':
						case 'image/jpeg':
						case 'image/png':
						case 'image/tiff':
							return 'img';
						case 'text/json':
						case 'application/json':
							return 'json';
							break;
						case 'application/x-shockware-flash':
							return 'flash';
							break;
						
						default:
							switch(sExtName) {
								case 'css':
									return 'css';
								case 'js':
									return 'js';
								case 'html':
								case 'htm':
								case 'shtml':
									return 'html';
							}
					}
				}
				
			}


			return 'other';

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




