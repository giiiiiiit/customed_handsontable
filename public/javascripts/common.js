jQuery.fn.extend({
    /**
     * 숫자만 입력 가능하도록 처리
     */
    numberOnly : function() {
        return this.each(function() {
            try {
                var $this = $(this);
                var ctrlKey = 17, vKey = 86, cKey = 67;
                var ctrlDown = false;

                // FF patch : 한글입력 상태에서 keydown 입력 제한이 안걸리는 문제가 있어 한글 입력 불가능하도록 설정
                $this.css('ime-mode', 'disabled');

                // 숫자,콤마,backspace,enter key만 입력 가능하도록 제한
                $this.keydown(function(p_event) {
                    var l_before_length = $this.val().length;
                    var l_keycode = p_event.keyCode;
                    //console.log(l_keycode);


                    var l_str     = l_keycode > 57 ? String.fromCharCode(l_keycode-48) : String.fromCharCode(l_keycode);
                    var l_pattern = /^[0-9]+$/;
                    // back-space, tab-key enter-key, delete-key, ←, ↑, →, ↓는 입력 가능하도록 함
                    if((l_keycode>=112 && l_keycode<=113) || l_keycode == 1 || l_keycode == 8 || l_keycode == 9 || l_keycode == 13 || l_keycode == 46 || l_keycode == 37 || l_keycode == 38 || l_keycode == 39 || l_keycode == 40) {
                        return true;
                    }
                    // ctrl + v 는 입력 가능하도록 함
                    if(l_keycode==ctrlKey){
                    	ctrlDown = true;
                        return true;
                    }else{
                    	if(ctrlDown == true && (l_keycode == vKey)){
                    		ctrlDown = false;
                    		return true;
                    	}

                    }

                    // 숫자만 입력 가능하도록 함
                    var l_after_length = $this.val().length;
                    if(!l_pattern.test(l_str)) {
                        if(l_before_length != l_after_length) {
                           $this.val($this.val().substring(0, l_after_length - 1));
                        }

                        return false;
                    } else {
                        return true;
                    }
                });

                // 포커스를 얻어을 때 처리 - number format을 위한 콤마를 모두 제거한다.
                $this.focus(function() {
                    $this.val($this.val().replace(/,/g, ''));
                });
            } catch(e) {
                alert("[common.js's numberFormat] " + e.description);
            }
        });
    }
});


/*
 * 2014.04.04 도상훈
 *
 * param : scopeRDataNm : Retrieved data name of the Angular $scope,
 * param : obj : 서버로 전송할 오브젝트,
 * param : ds_nm : 가공한 데이터셋 이름
 * param : grid : jqxGrid가 설정된 element id
 * return :
 */
function addDsSet(obj, scopeRDataNm, ds_nm, grid_id, type) {
	if (obj == null || scopeRDataNm == null || ds_nm == null || grid_id == null
			|| type == null || obj == "" || scopeRDataNm == "" || ds_nm == ""
			|| grid_id == "" || type == "") {
		//console.log("[addDsSet] param error!!!");
		return;
	}

	if (type == "CRUD") {
		var ds_org = eval("scopeRDataNm." + ds_nm);
		var ds_aft = eval("$('#" + grid_id + "').jqxGrid('getrows')");

		if (ds_org == "" || ds_aft == "") {
			//console.log("[addDsSet] ds error!!!");
			return;
		}

		// 서버로 전송할 ds에 "_aft" 붙어서 데이터 생성.
		eval("$.extend(obj, {" + ds_nm + " : ds_aft})");

		// 기존 ds에 "_org" 붙어서 원본데이터 생성.
		ds_nm = ds_nm + "_org";
		eval("$.extend(obj, {" + ds_nm + " : ds_org})");

	} else if (type == "NOR") {
		var ds_aft = eval("$('#" + grid_id + "').jqxGrid('getrows')");

		if(ds_aft==""){
			//console.log("[addDsSet] ds error!!!");
			return;
		}

		eval("$.extend(obj, {" + ds_nm + " : ds_aft})");

	}

}

/*
 * 2014.04.04 도상훈
 *
 * param : obj : 서버로 전송할 오브젝트,
 * param : ds_nm : 가공한 데이터셋 이름
 * param : ds_aft : 변경 데이터
 * param : ds_org : 원본 데이터
 * return :
 */
function dsSet(obj, ds_nm, ds_aft, ds_org) {
	if (obj == null || ds_nm == null || ds_aft == null || obj == ""
			|| ds_nm == "" || ds_aft == "") {
		//console.log("[dsSet] param error!!!");
		return;
	}

	eval("$.extend(obj, {" + ds_nm + " : ds_aft})");

	if (ds_org != null) {
		ds_nm = ds_nm + "_org_";
		eval("$.extend(obj, {" + ds_nm + " : ds_org})");
	}
}

function addParamSet(paramArr) {
	var paramStr = '';
	for (var i = 0; i < paramArr.length; i++) {
		paramStr = paramStr + '&' + paramArr[i];
	}
	return paramStr;
}

/*
 * 2014.04.24 고정민
 * function name			: jqxGridRender
 * function description		: jqx grid를 구동시켜준다.
 * parameter: $scope 		: AngularJS 에서 사용하는 data 영역 object,
 * parameter: gridNm 		: jqx grid로 사용할 grid 이름,
 * parameter: mappingDataObj: jqx grid에 사용할 data object 명,
 * parameter: datafieldsObj : jqx grid에 매핑할 data object의 data field(column)명과 type,
 * parameter: columnCfgObj 	: jqx grid에 사용할 column 정보(header description, width, align, and etc ),
 * parameter: widthVal 		: jqx grid 전체 width,
 * parameter: heightVal 	: jqx grid 전체 height,
 * parameter: heightVal 	: jqx grid에 사용할 ready시 구동할 function script
 * return: none
 */
function jqxGridRender($scope, gridNm, mappingDataObj, datafieldsObj, columnCfgObj, widthVal, heightVal, readyFunc) {

	gridNm = "#" + gridNm;

	// jqx grid에 사용할 data source 작성
	var source = {
		datatype : "json",
		datafields : datafieldsObj,
		localdata : eval("$scope." + mappingDataObj)
	};

	// 사용할 data source로 data adapter 작성
	var dataAdapter = new $.jqx.dataAdapter(source);

	// jqx grid initialize
	$(gridNm).jqxGrid({
		width : widthVal,
		height : heightVal,
		source : dataAdapter,
		columns : columnCfgObj,
		ready : function() {
			eval(readyFunc);
		}
	});
};

/*
 * 2014.04.24 고정민
 * function name		: jqxGridUpdateHandler
 * function description	: jqx grid에서 update event 발생시 입력받은 json object(U(ROW_STATUS)값과)에 넣어준다.
 * parameter: event 	: jqx grid event object,
 * parameter: jQuery 	: jQuery object,
 * parameter: jSonObj	: jqx grid에서 사용할 json object,
 * parameter: gridNm 	: jqx grid grid name,
 * return: none
 */
function jqxGridUpdateHandler(event, jQuery, jSonObj, gridNm) {
	var args = event.args;

	// focus out event 시 이전값과 현재값 비교 -> 값이 바뀌어도 동작하지 않는 경우 발생
	var selectedrowindex	= args.rowindex;
	var curRowData = jQuery('#' + gridNm).jqxGrid('getrows')[selectedrowindex];

	if (args.value != eval("curRowData." + args.datafield)) {

		// 현재 선택된 행(selectedrowindex), 그 행의 데이터(curRowData),
		// 입력받은 json object에 해당 행이 있는지 여부 count(여러번 수정 event 발생한 경우)(cnt)
		$('#' + gridNm).jqxGrid('setcellvalue', selectedrowindex, args.datafield, args.value);
		var cnt 				= 0;

		// json object에 값이 없을 경우, U(ROW_STATUS)값과 함께 행을 입력한다.
		// 여기서 grid의 json object와는 reference된다.

		// 1. json object에 값이 없을 경우
		if (Object.keys(jSonObj).length == 0) {
			addDataObj(jQuery, curRowData, "ROW_STATUS", "U");
			addDataObj(jQuery, jSonObj, Object.keys(jSonObj).length, curRowData);

		} else {

			// 2. json object에 값이 있을 경우
			cnt = 0;
			for (var i = 0; i < Object.keys(jSonObj).length; i++) {
				if (jSonObj[i].uid == curRowData.uid) {
					cnt++;
				}
			}

			// 2.1 uid가 동일하지 않을 경우(처음 입력되는 경우), U(ROW_STATUS)값과 함께 행을 입력한다.
			// 2.2 uid가 동일한 경우 아무것도 하지 않는다.
			if (cnt == 0) {
				addDataObj(jQuery, curRowData, "ROW_STATUS", "U");
				addDataObj(jQuery, jSonObj, Object.keys(jSonObj).length, curRowData);
			}

		}

	}
}

/*
 * 2014.04.24 고정민
 * function name		: jqxGridInsertHandler
 * function description	: jqx grid에서 add event 발생시 입력받은 json object(I(ROW_STATUS)값과)에 넣어준다.
 * parameter: event 	: jqx grid event object,
 * parameter: jQuery 	: jQuery object,
 * parameter: jSonObj	: jqx grid에서 사용할 json object,
 * parameter: gridNm 	: jqx grid grid name,
 * return: none
 */
function jqxGridInsertHandler(event, jQuery, jSonObj, gridNm) {

	// add의 경우 json object에 I(ROW_STATUS)값과 함께 빈행을 입력한다.
	var newDataObj = {};
	addDataObj(jQuery, newDataObj, "ROW_STATUS", "I");
	addDataObj(jQuery, jSonObj, Object.keys(jSonObj).length, newDataObj);
	jQuery('#' + gridNm).jqxGrid('addrow', null, newDataObj);
}

/*
 * 2014.04.24 고정민
 * function name		: jqxGridDeleteHandler
 * function description	: jqx grid에서 delete event 발생시 입력받은 json object(D(ROW_STATUS)값과)에 넣어준다.
 * parameter: event 	: jqx grid event object,
 * parameter: jQuery 	: jQuery object,
 * parameter: jSonObj	: jqx grid에서 사용할 json object,
 * parameter: gridNm 	: jqx grid grid name,
 * return: none
 */
function jqxGridDeleteHandler(event, jQuery, jSonObj, gridNm) {

	// 현재 선택된 행(selectedrowindex), 그 행의 데이터(curRowData),
	// 현재 선택된 행의 id(id)
	var selectedrowindex = $('#' + gridNm).jqxGrid('getselectedrowindex') - 1;
	var curRowData = jQuery('#' + gridNm).jqxGrid('getrows')[selectedrowindex];
	var id = $('#' + gridNm).jqxGrid('getrowid', selectedrowindex);

	// json object에 값이 없을 경우 혹은 json object에 값이 있고 상태가 U(ROW_STATUS)일 경우,
	// D(ROW_STATUS)값과 함께 행을 입력한다.

	// 1. json object에 값이 없을 경우
	if(Object.keys(jSonObj).length == 0) {
		addDataObj(jQuery, curRowData, "ROW_STATUS", "D");
		addDataObj(jQuery, jSonObj, Object.keys(jSonObj).length, curRowData);

	} else {

		// 2. json object에 값이 있을 경우
		cnt = 0;
		for (var i = 0; i < Object.keys(jSonObj).length; i++) {
			if(jSonObj[i].uid == curRowData.uid) {
				cnt++;
			}
		}

		// 2.1 uid가 동일하지 않을 경우(처음 입력되는 경우), D(ROW_STATUS)값과 함께 행을 입력한다.
		// 2.2 uid가 동일한 경우
		// 2.2.1 상태값이 I(ROW_STATUS)이면 그냥 삭제
		// 2.2.2 상태값이 U(ROW_STATUS)이면 상태값만 D(ROW_STATUS)로 변경해 준다.
		if(cnt == 0) {
			addDataObj(jQuery, curRowData, "ROW_STATUS", "D");
			addDataObj(jQuery, jSonObj, Object.keys(jSonObj).length, curRowData);

		} else {
			if(curRowData.ROW_STATUS == "I") {
				delete jSonObj[0];
			} else if(curRowData.ROW_STATUS == "U") {
				curRowData.ROW_STATUS = "D";
			}
		}
	}

	jQuery('#' + gridNm).jqxGrid('deleterow', id);

}




/*
 * 2014.04.28 고정민
 * function name			: handsonGridInsertHandler
 * function description		: handson grid에서 extend function을 이용하여 json object 형태의 데이터에 json 형태의 데이터를 추가한다.
 * parameter: jQuery 		: jQuery object,
 * parameter: jSonObj 		: 데이터 Object,
 * parameter: insertDO 		: 입력할 데이터 Object,
 * parameter: chkAllYn 		: check all 사용여부,
 * return: none
 */
function handsonGridInsertHandler(jQuery, $scope, jSonObj, insertDO, chkAllYn) {

	if(typeof(insertDO)=='undefined') insertDO = {};
	if(typeof(chkAllYn)=='undefined') chkAllYn = 'N';

	var gridDataObjStr = jSonObj + ".grid";
	var chgDataObjStr = jSonObj + ".chg";
	var orgDataObjStr = jSonObj + ".org";

	var newDataObj = insertDO;

	var maxUid = Object.keys(eval(orgDataObjStr)).length;		// 원본 data의 uid 최고값
	var curRow;
	var maxTempUid = undefined;
	var maxRow = undefined;

	// 추가 된 데이터 Object에서 가장큰 list row 번호(curRow), 가장큰 uid 조회
	for (var i = 0; i < Object.keys(eval(chgDataObjStr)).length; i++) {
		curRow = Object.keys(eval(chgDataObjStr))[i];
		maxRow = curRow;
		if(0 <= eval(chgDataObjStr)[curRow].uid) {
			maxTempUid = eval(chgDataObjStr)[curRow].uid;
		}
	}

	// 추가 된 데이터가 없을때, 있을때 사용할 uid를 생성
	var nextUid;
	if(maxTempUid == undefined) {
		nextUid = maxUid;
	} else {
		nextUid = maxTempUid + 1;
	}

	// 추가 된 데이터가 없을때, 있을때 사용할 uid를 생성
	var nextRow;
	if(maxRow == undefined) {
		nextRow = 0;
	} else {
		nextRow = (maxRow * 1) + 1;
	}

	// 새로 추가할 데이터 오블젝트에 입력할 uid, ROW_STATUS 추가
	addDataObj(jQuery, newDataObj, "uid", nextUid);
	addDataObj(jQuery, newDataObj, "ROW_STATUS", "I");
	if(chkAllYn == 'Y') addDataObj(jQuery, newDataObj, "CHK", null);

	// grid에 사용하는 데이터 Object에 새 행 추가
	addDataObj(jQuery, eval(gridDataObjStr), Object.keys(eval(gridDataObjStr)).length, newDataObj);

	// grid를 통해 추가/수정/삭제 된 데이터 Object에 새행 추가
	addDataObj(jQuery, eval(chgDataObjStr), nextRow, newDataObj);

}

/*
 * 2014.04.28 고정민
 * function name			: handsonGridDeleteHandler
 * function description		: handson grid에서 선택한 데이터를 삭제한다, 추가/수정/삭제 용 데이터 오브젝트에서도 추가/삭제한다.
 * parameter: jQuery 		: jQuery object,
 * parameter: jSonObj_grid 	: grid에 사용하는 데이터 Object(by reference),
 * parameter: jSonObj_man 	: grid를 통해 추가/수정/삭제 된 데이터 Object(by reference),
 * parameter: selRow 		: 현재 선택된 행,
 * parameter: hsContainer 	: handson grid container,
 * return: none
 */
function handsonGridDeleteHandler(jQuery, $scope, jSonObj, selRow, hsContainer) {

	var gridDataObjStr = jSonObj + ".grid";
	var chgDataObjStr = jSonObj + ".chg";

	// 현재 선택된 행의 데이터
	var curRowData = eval(gridDataObjStr)[selRow];

	var sameRow = undefined;
	var curRow = undefined;
	var cnt;

	// json object에 값이 없을 경우 혹은 json object에 값이 있고 상태가 U(ROW_STATUS)일 경우,
	// D(ROW_STATUS)값과 함께 행을 입력한다.

	// 1. json object에 값이 없을 경우: 변경사항 입력 데이터 오브젝트(jSonObj_man)에 상태값과, 행 데이터를 입력하고
	// grid에서 선택된 행을 삭제한다.
	if(Object.keys(eval(chgDataObjStr)).length == 0) {
		addDataObj(jQuery, curRowData, "ROW_STATUS", "D");
		addDataObj(jQuery, eval(chgDataObjStr), "0", curRowData);

	} else {

		// 2. json object에 값이 있을 경우
		cnt = 0;
		for (var i = 0; i < Object.keys(eval(chgDataObjStr)).length; i++) {
			curRow = Object.keys(eval(chgDataObjStr))[i];
			if(eval(chgDataObjStr)[curRow].uid == curRowData.uid) {
				cnt++;
				sameRow = curRow;
			}

		}

		// 변경된 데이터 Object 다음행 번호 생성
		var nextRow;
		if(curRow == undefined) {
			nextRow = 0;
		} else {
			nextRow = (curRow * 1) + 1;
		}

		// 2.1 uid가 동일하지 않을 경우(처음 입력되는 경우), D(ROW_STATUS)값과 함께 행을 입력한다.
		// 2.2 uid가 동일한 경우
		// 2.2.1 상태값이 I(ROW_STATUS)이면 그냥 삭제
		// 2.2.2 상태값이 U(ROW_STATUS)이면 상태값만 D(ROW_STATUS)로 변경해 준다.
		if(cnt == 0) {
			addDataObj(jQuery, curRowData, "ROW_STATUS", "D");
			addDataObj(jQuery, eval(chgDataObjStr), nextRow, curRowData);

		} else {
			if(curRowData.ROW_STATUS == "I") {
				delete eval(chgDataObjStr)[sameRow];

			} else if(curRowData.ROW_STATUS == "U") {
				curRowData.ROW_STATUS = "D";

			}

		}
	}

	// grid 내 행 삭제
	hsContainer.handsontable('alter', 'remove_row', Number(selRow));

}

/*
 * 2014.04.28 고정민
 * function name			: handsonGridUpdateHandler
 * function description		: handson grid에서 선택한 데이터를 수한다, 추가/수정/삭제 용 데이터 오브젝트에서도 추가/삭제한다.
 * parameter: jQuery 		: jQuery object,
 * parameter: jSonObj_man 	: grid를 통해 추가/수정/삭제 된 데이터 Object(by reference),
 * parameter: selRow 		: 현재 선택된 행,
 * parameter: hsContainer 	: handson grid container,
 * parameter: $scope 		: $scope,
 * return: none
 */
function handsonGridUpdateHandler(jQuery, jSonObj_grid, jSonObj_man, selRow, hsContainer, $scope) {

	// sort 된 경우 해당하는 행 연산
	if(hsContainer.handsontable('getInstance').sortIndex.length > 0) {
		if(hsContainer.handsontable('getInstance').sortIndex.length > selRow) {
			selRow = hsContainer.handsontable('getInstance').sortIndex[selRow][0];
		}
	}

	// 현재 선택된 행의 데이터
	var curRowData = jSonObj_grid[selRow];

	var cnt = 0;
	var curRow = undefined;
//	var sameRow;

	// json object에 값이 없을 경우, U(ROW_STATUS)값과 함께 행을 입력한다.
	// 여기서 grid의 json object와는 reference된다.

	// 1. json object에 값이 없을 경우
	if (Object.keys(jSonObj_man).length == 0) {
		addDataObj(jQuery, curRowData, "ROW_STATUS", "U");
		addDataObj(jQuery, jSonObj_man, "0", curRowData);

	} else {

		// 2. json object에 값이 있을 경우
		if(curRowData == undefined) {
			return;
		}

		cnt = 0;
		for (var i = 0; i < Object.keys(jSonObj_man).length; i++) {
			curRow = Object.keys(jSonObj_man)[i];
			if(jSonObj_man[curRow].uid == curRowData.uid) {
				cnt++;
				sameRow = curRow;
			}
		}

		// 변경된 데이터 Object 다음행 번호 생성
		var nextRow;
		if(curRow == undefined) {
			nextRow = 0;
		} else {
			nextRow = (curRow * 1) + 1;
		}

		// 2.1 uid가 동일하지 않을 경우(처음 입력되는 경우), U(ROW_STATUS)값과 함께 행을 입력한다.
		// 2.2 uid가 동일한 경우 아무것도 하지 않는다.
		if (cnt == 0) {
			addDataObj(jQuery, curRowData, "ROW_STATUS", "U");
			addDataObj(jQuery, jSonObj_man, nextRow, curRowData);
		}

	}

}

/*
 * 2014.04.24 고정민
 * function name		: addDataObj
 * function description	: jQuery extend function을 이용하여 json object 형태의 데이터에 json 형태의 데이터를 추가한다.
 * parameter: jQuery 	: jQuery object,
 * parameter: dataObj 	: 데이터를 입력할 json object(reference된다),
 * parameter: keyNm		: 입력할 키 값,
 * parameter: keyVal 	: 입력할 키 벨류,
 * return: none
 */
function addDataObj(jQuery, dataObj, keyNm, keyVal) {
	eval("jQuery.extend(dataObj, {" + keyNm + " : keyVal})");
}

/*
 * 2014.04.24 고정민
 * function name		: addDataMapObj
 * function description	: jQuery extend function을 이용하여 json object 형태의 데이터에 json 형태의 데이터를 추가한다.
 * parameter: jQuery 	: jQuery object,
 * parameter: dataObj 	: 데이터를 입력할 json object(reference된다),
 * parameter: keyNm		: 입력할 키 값,
 * parameter: keyVal 	: 입력할 키 벨류,
 * return: none
 */
function addDataMapObj(jQuery, dataObj, keyVal) {
	eval("jQuery.extend(dataObj, keyVal)");
}

/*
 * 2014.04.29 고정민
 * function name		: codeDataInitializer
 * function description	: dropdown으로 사용할 데이터를 코드, 이름을 컬럼명으로 가져와 만든다.
 * parameter: codeObj 	: 데이터를 입력할 object,
 * parameter: codeColNm : 코드 컬럼 값,
 * parameter: descColNm	: 값 컬럼 값,
 * return: none
 */
function codeDataInitializer(codeObj, codeColNm, descColNm) {

	if(codeObj == undefined) return '';

	var codeString = "";
	var tempCosdeString = "";
	var tempDescString = "";
	var tempString = "";
	for (var i = 0; i < codeObj.length; i++) {
		if(i != 0) codeString = codeString + '|| ';
		tempCosdeString = eval("codeObj[" + i + "]." + codeColNm);
		tempDescString = eval("codeObj[" + i + "]." + descColNm);
		if(tempCosdeString == null && tempDescString == null) {
			tempCosdeString = '';
		} else {
			tempString = (tempCosdeString == null ? "" : tempCosdeString) + ":" + (tempDescString == null ? "" : tempDescString);
		}
		codeString = codeString + "" + tempString + "";
	}
	return codeString;
}

/*
 * 2014.04.29 고정민
 * function name		: addUid
 * function description	: 입력받은 data object에 uid를 생성해준다.
 * parameter: dataObj 	: uid를 입력할 data object,
 * return: none
 */
function addUid(dataObj) {
	if(dataObj != undefined) {
		for (var i = 0; i < dataObj.length; i++) {
			addDataObj(jQuery, dataObj[i], "uid", i);
		}
	}
}

/*
 * 2014.09.11 고정민
 * function name		: measureText
 * function description	: font size, style에 맞는 width 계산
 * parameter: pText 	: 입력 text,
 * parameter: pFontSize : font size,
 * parameter: pStyle 	: font style,
 * return: none
 */
function measureText(pText, pFontSize, pStyle) {
    var lDiv = document.createElement('lDiv');

    document.body.appendChild(lDiv);

    if (pStyle != null) {
        lDiv.style = pStyle;
    }
    lDiv.style.fontSize = "" + pFontSize + "px";
    lDiv.style.position = "absolute";
    lDiv.style.left = -1000;
    lDiv.style.top = -1000;

    lDiv.innerHTML = pText;

    var lResult = {
        width: lDiv.clientWidth,
        height: lDiv.clientHeight
    };

    document.body.removeChild(lDiv);
    lDiv = null;

    return lResult;
};


/*
 * 2014.09.11 고정민
 * function name		: getMaxTextByWidth
 * function description	: 최대 표시 width에 맞는 글자 리턴
 * parameter: pText 	: 입력 text,
 * parameter: pFontSize : font size,
 * parameter: pStyle 	: font style,
 * parameter: maxSize 	: 최대 표시 width,
 * return: none
 */
function getMaxTextByWidth(pText, pFontSize, pStyle, maxSize) {
	var tempText, charactorSize;
	for(var counter = 0; counter < pText.length; counter++) {
		tempText = pText.substring(0, pText.length - counter);
		charactorSize = measureText(tempText, pFontSize, pStyle);
		
		//띄어쓰기 문자로 인해 substring, +4 , trim 적용
		if (charactorSize.width + 4 <= maxSize) {	
			return tempText.substring(0,tempText.length-2).trim();
		}
	};
	return pText;
};

/*
 * 2014.04.29 고정민
 * function name		: customedRenderer
 * function description	: handson table에서 dropdown rendering 시에 코드 데이터 삭제하여 보여준다.
 * return: none
 */
function customedRenderer(instance, td, row, col, prop, value, cellProperties) {

	var code, desc;

	if((cellProperties.type == 'dropdown' || cellProperties.type == 'autocomplete') && value != null) {
		instance.view.wt.wtDom.addClass(td, 'htDropdown');
		if(value.indexOf(':') == -1 && value.length >= 3) {
			var evalStr = "instance.getData()[row]." + arguments[4] + "= ''";
			eval(evalStr);
		}

		Handsontable.renderers.TextRenderer.apply(this, arguments);
		code = value.match(/.+(?=\:)/mg);
		if(code != null) {
			code = code.toString();
			desc = value.replace(code, "").replace(':', "").replace("'", "");
			td.textContent = desc;
		} else {
			td.textContent = '';
		}

	} else {
		if(cellProperties.type == 'text') {
			Handsontable.renderers.TextRenderer.apply(this, arguments);
		} else if(cellProperties.type == 'textHyperLink') {
			instance.view.wt.wtDom.addClass(td, 'htTextHyperLink');
			Handsontable.renderers.TextRenderer.apply(this, arguments);
		} else if(cellProperties.type == 'htTextHyperLinkLeftAlign') {
			instance.view.wt.wtDom.addClass(td, 'htTextHyperLinkLeftAlign');
			Handsontable.renderers.TextRenderer.apply(this, arguments);
		} else if(cellProperties.type == 'textCenter') {
			instance.view.wt.wtDom.addClass(td, 'htTextCenter');
			Handsontable.renderers.TextRenderer.apply(this, arguments);
		} else if(cellProperties.type == 'date') {
			instance.view.wt.wtDom.addClass(td, 'htDate');
			Handsontable.renderers.AutocompleteRenderer.apply(this, arguments);
		} else if(cellProperties.type == 'numeric') {
			Handsontable.renderers.NumericRenderer.apply(this, arguments);
		} else if(cellProperties.type == 'checkbox') {
			instance.view.wt.wtDom.addClass(td, 'htCheckbox');
			arguments[5] = (arguments[5] == undefined) ? false : arguments[5];
			Handsontable.renderers.CheckboxRenderer.apply(this, arguments);
		} else if(cellProperties.type == 'autocomplete') {
			Handsontable.renderers.AutocompleteRenderer.apply(this, arguments);
		} else if(cellProperties.type == 'handsontable') {
			Handsontable.renderers.AutocompleteRenderer.apply(this, arguments);
		} else if(cellProperties.type == 'password') {
			Handsontable.renderers.PasswordRenderer.apply(this, arguments);
		} else if(cellProperties.type == 'dropdown') {
			Handsontable.renderers.AutocompleteRenderer.apply(this, arguments);
		}

	}

	// 화면에 보이는 character 수 한정
	if(td.textContent != undefined) limitCharLength(td, cellProperties);

}


/**
 * 글자수를 td 크기로 만든다(2줄이 되는 현상 방지)
 * @param td
 * @param cellProperties
 * @returns td
 */
function limitCharLength(td, cellProperties) {
	var displayVal = td.textContent;
	var charactorSize = measureText(displayVal, '10', {font: 'Arial'});

	var displayCharNo = Math.round((td.clientWidth / 1.5));
	if(displayVal != undefined) {
		if(charactorSize.width > displayCharNo) {
			if(cellProperties.type != 'password') {
				displayVal = getMaxTextByWidth(displayVal, '10', {font: 'Arial'}, displayCharNo) + '..';
			}
			td.textContent = displayVal;
		}
	}
}

/*
 * 2014.04.29 고정민
 * function name			: handsonGridRender
 * function description		: handson table을 rendering 해준다.
 * parameter: gridData 		: table에서 사용할 data object,
 * parameter: colHeaders 	: column header setting properties,
 * parameter: colWidths 	: column width properties,
 * parameter: columns 		: column mapping infomation,
 * parameter: curRowForGrid : 현재 선택된 행번호 저장할 변수,
 * parameter: hsContainer 	: handson table에서 사용할 container id,
 * parameter: $scope 		: AngularJS에서 사용할 data scope,
 * parameter: heightVal 	: handson table height
 * parameter: readonlyBool	: readonly boolean
 * parameter: rowHeaders 	: rowHeaders boolean
 * parameter: sortBool	 	: sort boolean
 * return: none
 */
function handsonGridRender(gridData, colHeaders, colWidths, columns, curRowForGrid, hsContainer, $scope, heightVal, readonlyBool, rowHeaders, sortBool, fixedColLeft) {
	if(typeof(fixedColLeft)=='undefined' || fixedColLeft == "") fixedColLeft = 1;
	if(typeof(readonlyBool)=='undefined') readonlyBool = true;
	if(typeof(sortBool)=='undefined') sortBool = true;
	if(typeof(rowHeaders)=='undefined') rowHeaders = true;


	//페이징처리 변수가 없을 경우
	if(cfn_undfToNull($scope.currentPage) == "" || cfn_undfToNull($scope.perPage) == ""){
		$scope.currentPage = 1;
		$scope.perPage = 1;
	}


	var gridDataObjStr = gridData + ".grid";
	var chgDataObjStr = gridData + ".chg";

	// CHK(checkall 컬럼)이 있는지 확인
	var chkAllColumnYn = false;
	var chkAllBool = false;
	var chkALlClassNm = "";
	var afterRender = false;
	for (var i = 0; i < columns.length; i++) {
		if(columns[i].data == 'CHK') {
			chkAllColumnYn = true;
			var chkAllHeaderStr = "<input type='checkbox' class='checkAll' />";
			chkALlClassNm = "cls_" + hsContainer.selector.replace('#', "");
			colHeaders[i] = "<input type='checkbox' class='" +  chkALlClassNm + "' />";
			break;
		}
	}



	hsContainer.handsontable({
		colHeaders 			: colHeaders,
		columns 			: columns,
		colWidths 			: colWidths,
		columnSorting 		: sortBool,
		fillHandle 			: null,
		currentRowClassName : 'currentRow',
		currentColClassName : 'currentCol',
		stretchH 			: "all",
		height				: heightVal,
		multiSelect			: false,
		rowHeaders			: function (row) {
			if(rowHeaders == true){
				return ($scope.currentPage - 1) * $scope.perPage + row + 1;
			}else if(rowHeaders == false){
				false;
			}
		},
		manualColumnResize	: true,
		fixedColumnsLeft	: fixedColLeft,
		afterChange : function() {
			if(arguments[0] != null) {
				if(arguments[0][0][2] != arguments[0][0][3]) {
					if(arguments[0][0][1] != 'CHK') {
						handsonGridUpdateHandler(jQuery, eval(gridDataObjStr), eval(chgDataObjStr), arguments[0][0][0], hsContainer, $scope);
					}
				}
			}
		},
		cells: function (row, col, prop) {
			if(columns[col].renderer == undefined) {
				var cellProperties = {};
				cellProperties.renderer = customedRenderer;

				if(readonlyBool == true) {
					cellProperties.readOnly = readonlyBool;
				} else {
					if(columns[col].readOnly != undefined) {
						cellProperties.readOnly = columns[col].readOnly;
					} else {
						cellProperties.readOnly = readonlyBool;
					}
				}

				return cellProperties;
			}

		},
		onSelection : function() {
			eval(curRowForGrid + " = '" + arguments[0] + "'");
	    },
	    afterRender : function(isForced) {

	    	/*
	    	 * 2014.05.28 김영두
	    	 */
			if(chkAllColumnYn) {
				$('.' + chkALlClassNm).on('click', function() {
					chkAllBool = $('.' + chkALlClassNm)[0].checked; // 처음 클릭했을 때의 값(True or False)을 저장
					chkAllBool = chkAllBool == undefined ? false : chkAllBool;
					for (var i = 0; i < Object.keys(eval(gridDataObjStr)).length; i++) {
						eval(gridDataObjStr)[i].CHK = chkAllBool;
					}
					afterRender = true;
				});
				if(afterRender) {
					$('.' + chkALlClassNm)[0].checked = chkAllBool; // 처음 클릭했던 값을 다시 주입.
				}
			}
		},
		afterLoadData : function() {
			// check all 이 있을 경우에 data 로딩시 check box를 초기화 해준다
			if(chkAllColumnYn) {
				if($('.' + chkALlClassNm)[0] != undefined) {
					$('.' + chkALlClassNm)[0].checked = false;
					afterRender = false;
				}
			}
	    }

	});

	//위에서 rowHeaders 을 페이징처리해서 보여주는 부분때문에 false 설정을 별도로 한번 더 하는 로직.
	if(rowHeaders == false){
		hsContainer.handsontable({
			rowHeaders : false
		});
	}


};



/*
 * 2014.04.29 고정민
 * function name			: exceptionHandler
 * function description		: session 처리등 exception 발생을 처리한다. cookie에 현재 페이지 정보를 저장한다
 * parameter: returnData 	: 서버 리턴값
 * parameter: successMsg 	: request 성공시 메세지
 * parameter: sucMsgYn 		: 성공메세지 표시 여부
 * parameter: windowObj		: 팝업 에서의 exception handling을 위한 $window object
 * return: none
 */
function exceptionHandler(resultData, successMsg, sucMsgYn, windowObj) {

	if(typeof(sucMsgYn)=='undefined') sucMsgYn = 'Y';

	// cookie에 현재 페이지 정보 저장
	var pathArray = window.location.pathname.split( '/' );
	var curUrlStr = "";

	if(pathArray.length < 3) {
		for (var i = 2; i < pathArray.length; i++) {
			curUrlStr += '/' + pathArray[i];
		}
	} else {
		for (var i = 3; i < pathArray.length; i++) {
			curUrlStr += '/' + pathArray[i];
		}
	}
	$.cookie('CUR_PAGE', encodeURI(curUrlStr), { expires: 1, path: '/' });
	$.cookie('CUR_USR_ID', encodeURI(getCookie("USR_ID")), { expires: 1, path: '/' });

	if("0" != resultData.ERRORCODE) {
		if("99999" == resultData.ERRORCODE) {
			alert(resultData.ERRORMSG);
			window.location.replace(gWebContext + "/CMM_MAIN.do");
			return true;

		} else if("-5" == resultData.ERRORCODE) {
			bootbox.alert(resultData.ERRORMSG, function() {
				if(typeof(windowObj)!='undefined') {
					if(window.location.href != window.opener.location.href) {
						windowObj.close();
					} else {
						location.replace(gWebContext + "/web/jsp/cmm/CMM_LOGIN.jsp");
					}

				} else {
					location.replace(gWebContext + "/web/jsp/cmm/CMM_LOGIN.jsp");
				}

			});
			return true;

		} else {
			bootbox.alert(resultData.ERRORMSG);
			return true;
		}
	} else {
		if('Y' == sucMsgYn) {
			bootbox.alert("successfully saved " +successMsg  );
		}
		return false;
	}
}

/*
 * 2014.07.09 dsh
 * function name			: getUTF8Length
 * function description		: byte count
 * parameter: string 		: string
 * return: length
 */
function getUTF8Length(string) {
    var utf8length = 0;
    for (var n = 0; n < string.length; n++) {
        var c = string.charCodeAt(n);
        if (c < 128) {
            utf8length++;
        }
        else if((c > 127) && (c < 2048)) {
            utf8length = utf8length+2;
        }
        else {
            utf8length = utf8length+3;
        }
    }
    return utf8length;
 }

/*
 * 2014.07.09 dsh
 * function name			: byteCount
 * function description		: byte count
 * parameter: string 		: string
 * return: length
 */
function byteCount(s) {
    return encodeURI(s).split(/%..|./).length - 1;
}

/*
 * 2014.05.07 고정민
 * function name			: lengthCheck
 * function description		: 저장할 값의 길이를 확인한다
 * parameter: do_chg 		: 서버에 저장할 값
 * parameter: jsonObj 		: 각 컬럼의 길이(jason 형태로 입력)
 * return: none
 */
function lengthCheck(do_chg, jsonObj) {
	var columnNm;
	var maxLength;
	var curLength;
	var curRow;
	for (var i = 0; i < Object.keys(jsonObj).length; i++) {
		columnNm = Object.keys(jsonObj)[i];
		maxLength = eval("jsonObj." + columnNm);

		for (var j = 0; j < Object.keys(do_chg).length; j++) {
			curRow = Object.keys(do_chg)[j];
			if(do_chg[curRow].ROW_STATUS != 'D') {
				if(undefined != eval("do_chg[" + curRow + "]." + columnNm)) {
					curLength = eval("do_chg[" + curRow + "]." + columnNm).length;
					if(maxLength < curLength) {
						bootbox.alert("Please check the maximum length of " + columnNm);
						return true;
					}
				}
			}
		}

	}
	return false;
}



/*
 * 2014.05.07 고정민
 * function name			: lengthCheckByRow
 * function description		: 저장할 값의 길이를 확인한다
 * parameter: $scope 		: $scope
 * parameter: str_do_row 	: 현재 data object
 * parameter: curRow 		: 현재 행
 * parameter: jsonObj 		: 각 컬럼의 길이(jason 형태로 입력)
 * parameter: hsc			: handson container
 * return: validate 여부
 */
function lengthCheckByRow($scope, str_do_row, curRow, arryObj, hsc) {
	var columnVal, columnId, columnNm;
	var maxLength;
	var curLength;
	var curRow;
	var colArr;
	var focusColmn, focusRow;

	for (var i = 0; i < arryObj.length; i++) {
		columnVal = arryObj[i];
		colArr = columnVal.split('||');
		columnId = colArr[0];
		columnNm = colArr[1];
		maxLength = colArr[2];
		focusColmn = colArr[3];

		if(undefined != eval(str_do_row + ".chg[" + curRow + "]." + columnId)) {
			curLength = eval(str_do_row + ".chg[" + curRow + "]." + columnId).length;
			if(maxLength < curLength) {
				var curUid = eval(str_do_row + ".chg[" + curRow + "].uid");
				var gridDO = eval(str_do_row + ".grid");
				for (var j = 0; j < gridDO.length; j++) {
					if(gridDO[j].uid == curUid) {
						focusRow = j;
					}
				}

				bootbox.alert("Please check the maximum length of" + columnNm,
						function() {hsc.handsontable("selectCell", (parseInt(focusRow)), parseInt(focusColmn));});
				return true;
			}
		}

	}
	return false;
}

/*
 * 2014.07.09 dsh
 * function name			: a0chk
 * function description		: 영문/숫자만 입력 가능하게 replace 시킨다.
 * parameter: th 			: elemnet this
 * return: none
 */
function a0Chk(th){
	th.value=th.value.replace(/[^a-zA-Z0-9]/g,'');
}



/*
 * 2014.05.07 고정민
 * function name			: mandantoryColumnCheck
 * function description		: 필수값 입력여부를 확인한다
 * parameter: do_chg 		: 서버에 저장할 값
 * parameter: jsonObj 		: 필수컬럼 array
 * return: none
 */
function mandantoryColumnCheck(do_chg, arryObj) {
	var columnNm;
	var curLength;
	var curRow;
	for (var i = 0; i < Object.keys(arryObj).length; i++) {
		columnNm = arryObj[i];

		for (var j = 0; j < Object.keys(do_chg).length; j++) {
			curRow = Object.keys(do_chg)[j];
			if(do_chg[curRow].ROW_STATUS != 'D') {
				if(undefined == eval("do_chg[" + curRow + "]." + columnNm)) {
					bootbox.alert(columnNm + " column is the mandatory value to be entered.");
					return true;
				}
				curLength = eval("do_chg[" + curRow + "]." + columnNm).length;
				if(0 >= curLength || eval("do_chg[" + curRow + "]." + columnNm) == ':') {
					bootbox.alert(columnNm + " column is the mandatory value to be entered.");
					return true;
				}
			}
		}

	}
	return false;
}



/*
 * 2014.05.07 고정민
 * function name			: mandantoryColumnCheckByRow
 * function description		: 필수값 입력여부를 확인한다
 * parameter: $scope 		: $scope
 * parameter: str_do_row 	: 현재 data object
 * parameter: curRow 		: 현재행
 * parameter: arryObj 		: 필수값 array (ex> "USR_ID:User ID:1")
 * parameter: hsc 			: handson table container
 * return: valid 여부
 */
function mandantoryColumnCheckByRow($scope, str_do_row, curRow, arryObj, hsc) {
	var columnVal, columnId, columnNm;
	var curLength;
	var colArr;
	var focusColmn, focusRow;
	var checkBool = false;

	for (var k = 0; k < Object.keys(arryObj).length; k++) {

		checkBool = false;

		columnVal = arryObj[k];
		colArr = columnVal.split(":");

		columnId = colArr[0];
		columnNm = colArr[1];
		focusColmn = colArr[2];

		if(columnId == undefined || columnNm == undefined || focusColmn == undefined ||
				columnId == "" || columnNm == "" || focusColmn == ""){
			//console.log("[common.js][fn::mandantoryColumnCheckByRow]arryObj error...");
			return;
		};

		if(undefined == eval(str_do_row + ".chg[" + curRow + "]." + columnId)) {
			checkBool = true;
		} else {
			curLength = eval(str_do_row + ".chg[" + curRow + "]." + columnId).length;
			if(0 >= curLength) {
				checkBool = true;
			}
		};

		if(checkBool) {
			var curUid = eval(str_do_row + ".chg[" + curRow + "].uid");
			var gridDO = eval(str_do_row + ".grid");
			for (var j = 0; j < gridDO.length; j++) {
				if(gridDO[j].uid == curUid) {
					focusRow = j;
				}
			}

			bootbox.alert("[Mandatory field] Please input "+ columnNm,
				function() {
					hsc.handsontable("selectCell", parseInt(focusRow), parseInt(focusColmn));
				});
			return true;
		};

	};

	return false;
}


/*
 * 2014.07.25 고정민
 * function name			: fromToDateColumnCheck
 * function description		: fromDt, toDt값을 비교하여 유효한지 여부를 리턴한다.
 * parameter: fromDt 		: from date
 * parameter: toDt 			: to date
 * parameter: delimeterVal 	: 구분자
 * parameter: formatVal 	: date format 형태
 * return: none
 */
function fromToDateColumnCheck(fromDt, toDt, delimeterVal, formatVal) {
	var dtFormat = formatVal.split(delimeterVal);
	var fromDtArry = fromDt.split(delimeterVal);
	var toDtArry = toDt.split(delimeterVal);
	var yyyyOrder, mmOrder, ddOrder;

	for(var i=0; i<dtFormat.length; i++){
		if(dtFormat[i] == 'MM') mmOrder = i;
		if(dtFormat[i] == 'DD') ddOrder = i;
		if(dtFormat[i] == 'yyyy') yyyyOrder = i;
	}

	var comparedFromDt = new Date();
	comparedFromDt.setUTCFullYear(fromDtArry[yyyyOrder] * 1);
	comparedFromDt.setUTCMonth((fromDtArry[mmOrder] * 1) - 1);
	comparedFromDt.setUTCDate(fromDtArry[ddOrder] * 1);

	var comparedToDt = new Date();
	comparedToDt.setUTCFullYear(toDtArry[yyyyOrder] * 1);
	comparedToDt.setUTCMonth((toDtArry[mmOrder] * 1) - 1);
	comparedToDt.setUTCDate(toDtArry[ddOrder] * 1);

	if(comparedFromDt > comparedToDt) {
		return false;
	} else {
		return true;
	}
};


/*
 * 2014.05.07 고정민
 * function name			: setMenuAuth
 * function description		: 접속자 권한에 맞는 메뉴를 조회한다.
 * parameter: $http 		: $http
 * parameter: $scope 		: $scope
 * parameter: jQuery 		: jQuery
 * parameter: initFunc 		: 화면 로딩시 실행시킬 function 명
 * return: none
 */
function setMenuAuth($http, $scope, jQuery, initFunc) {

	var initFuncYn = 'N';
	if(typeof(initFunc)!='undefined') initFuncYn = 'Y';

	var ctrUrl = gWebContext + '/commonCtr.do';
	var dataObj = {};
	var paramDataObj = {};

	addDataObj(jQuery, paramDataObj, 	"SVC_ID", 			"selectMenuAuth");
	addDataObj(jQuery, dataObj, 		"paramDataObj", 	paramDataObj);

	$http.post(ctrUrl, dataObj)
	.success(function(returnData) {
		if(exceptionHandler(returnData.RESULT, '', 'N')) return;

		$scope.do_trackAuth = returnData.do_trackAuth;
		$scope.do_uptAuth = returnData.do_uptAuth;
		$scope.do_rptAuth = returnData.do_rptAuth;
		$scope.do_adminAuth = returnData.do_adminAuth;

		$scope.do_user_info = returnData.VARIABLE_MAP;

		if('Y' == initFuncYn) {
			eval(initFunc);
		}

	}).error(function(data, status, headers, config) {
		alert('error: ' + status);
	});
}


/*
 * 2014.05.19 고정민
 * function name			: logOutFunc
 * function description		: 로그아웃 처리
 * parameter: $http 		: $http
 * return: none
 */
function logOutFunc($http) {
	if (null != $.cookie("CUR_PAGE")) {
		$.removeCookie("CUR_PAGE", {path: "/"});
	}

	var logout_url	= gWebContext + '/logout.do';
	$http.get(logout_url).success(function() {
		window.setTimeout(function() {
			location.href = gWebContext + '/web/jsp/cmm/CMM_LOGIN.jsp';
		}, 50);
	}).error(function(data, status, headers, config) {
		window.setTimeout(function() {
			location.href = gWebContext + "/web/jsp/cmm/CMM_LOGIN.jsp";
		}, 50);
		return status;
	});
}


/*
 * 2014.05.19 고정민
 * function name			: setDataObj,
 * function description		: handson table에 사용할 data object 초기화,
 * parameter: jQuery 		: jQuery,
 * parameter: $scope 		: $scope,
 * parameter: dataObjStr 	: data object 명,
 * return: none
 */
function setDataObj(jQuery, $scope, dataObjStr) {
	var tempDataObj = {};
	addDataObj(jQuery, tempDataObj, "org", {});
	addDataObj(jQuery, tempDataObj, "grid", {});
	addDataObj(jQuery, tempDataObj, "chg", {});

	addDataMapObj(jQuery, eval(dataObjStr), tempDataObj);
}


/*
 * 2014.05.19 고정민
 * function name			: returnDataHandler,
 * function description		: handson table에 사용할 data object에 조회한 값을 넣어준다,
 * parameter: $scope 		: $scope,
 * parameter: hsc 			: handson table container,
 * parameter: curDataObjStr : return data를 적용시킬 data object,
 * parameter: returnDO 		: return data object,
 * return: none
 */
function returnDataHandler($scope, hsc, curDataObjStr, returnDO) {

	var hsi = hsc.handsontable('getInstance');
	returnDO = (returnDO == undefined) ? [] : returnDO;

	addUid(returnDO);

	var tempDOStr = curDataObjStr + ".chg = {}";
	eval(tempDOStr);

	var orgDataObj = new Object();
	orgDataObj = JSON.parse(JSON.stringify(returnDO));
	tempDOStr = curDataObjStr + ".org = orgDataObj" ;
	eval(tempDOStr);

	tempDOStr = curDataObjStr + ".grid = returnDO" ;
	eval(tempDOStr);

	//scroll 위로 올리기 위해 데이터 null로 리셋2014-08-28 by dsh
	var evalReset = "hsi.loadData(null)";
	eval(evalReset);


	var evalStr = "hsi.loadData(" + tempDOStr + ")";
	eval(evalStr);

	hsi.render();
}


/*
 * 2014.08.12 developer
 * function name			: gridReadOnlyByRowHandler
 * function description		: handson table edit모드 행단위 변경
 * parameter: $scope 		: $scope,
 * parameter: hsc 			: handson table container,
 * parameter: selRow 		: 적용시킬 행,
 * parameter: readOnlyBool 	: 적용시킬 boolean 값,
 * return: none
 */
function gridReadOnlyByRowHandler($scope, hsc, selRow, readOnlyBool) {
	hsc.handsontable({
		cells : function(row, col, prop) {
			var cellProperties = {};
			cellProperties.renderer = customedRenderer;
			if(prop != undefined) {
				if(row == selRow) {
					cellProperties.readOnly = readOnlyBool;
				}
			}
			return cellProperties;
		}
	});
};


/*
 * 2014.05.20 dsh
 * function name			: gridReadOnlyToggleHandler
 * function description		: handson table edit모드 변경
 * parameter: $scope 		: $scope,
 * parameter: hsc 			: handson table container,
 * parameter: do_str 		: readOnly 적용시킬 grid data object,
 * parameter: columnArry 	: 적용시킬 column array,
 * parameter: modeBtnStr 	: 사용할 버튼,
 * parameter: btnArry 		: 안보일 버튼 array,
 * return: none
 */
function gridReadOnlyToggleHandler($scope, hsc, do_str, columnArry, modeBtnStr, btnArry, disArry) {
	if($('#' + modeBtnStr).attr("disabled") == false || $('#' + modeBtnStr).attr("disabled") == undefined){
		hsc.handsontable({
			cells : function(row, col, prop) {
				var cellProperties = {};
				cellProperties.readOnly = true;
				cellProperties.renderer = customedRenderer;
				return cellProperties;
			}
		});

		$('#' + modeBtnStr).attr("disabled",true);

		for (var i = 0; i < btnArry.length; i++) {
			$('#' + btnArry[i]).hide();
		}
		for (var i = 0; i < disArry.length; i++) {
			$('#' + disArry[i]).attr("disabled",true);
		}
	} else {

		hsc.handsontable({
			cells : function(row, col, prop) {
				var cellProperties = {};
				for (var i = 0; i < columnArry.length; i++) {
					if(do_str[row] != undefined) {
						if (prop == columnArry[i]) {
							cellProperties.readOnly = true;
						}
					}
				}
				cellProperties.renderer = customedRenderer;
				return cellProperties;
			}
		});

		$('#' + modeBtnStr).attr("disabled",false);

		for (var i = 0; i < btnArry.length; i++) {
			$('#' + btnArry[i]).show();
		}

		for (var i = 0; i < disArry.length; i++) {
			$('#' + disArry[i]).attr("disabled",false);
		}

	}
}

/*
 * 2014.05.20 dsh
 * function name			: componentReadOnlyToggleHandler
 * function description		: component edit모드 변경
 * parameter: compId 		: 적용시킬 component(element) ID array,
 * parameter: modeBtnStr 	: 사용할 버튼
 * return: none
 */
function componentReadOnlyToggleHandler(modeBtnStr, compId ) {

	if($('#' + modeBtnStr).attr("disabled") == false || $('#' + modeBtnStr).attr("disabled") == undefined){

		for (var i = 0; i < compId.length; i++) {
			//$('#' + compId[i]).attr("readonly",false);
			$('#' + compId[i]).attr("disabled",true);
		}

		$('#' + modeBtnStr).attr("disabled",true);


	} else {

		for (var i = 0; i < compId.length; i++) {
			//$('#' + compId[i]).attr("readonly",true);
			$('#' + compId[i]).attr("disabled",false);
		}

		$('#' + modeBtnStr).attr("disabled",false);

	}
}


/*
 * 2014.05.20 dsh
 * function name			: fn_objIsNull
 * function description		: obj null이면 true, 아니면 false
 * parameter: obj 			: obj
 * return: boolean
 */
function cfn_objIsNull(obj){
	if(Object.keys(obj).length > 0) return false;
	else return true;
}

/*
 * 2014.05.20 dsh
 * function name			: cfn_undfToNull
 * function description		: obj undefined 가 아니면 해당 값을 리턴하고, undefined면 빈스트링을 리턴
 * parameter: obj 			: obj
 * return: null을 리턴하는게 아니라 빈스트링("")을 리턴한다.
 */
function cfn_undfToNull(obj){
	var str = "";
	if(obj!=undefined) str = obj;


	return str;
}

/*
 * 2014.06.12 dsh
 * function name			: cfn_chkCount
 * function description		: grid에 매팅되어있는 obejct에 CHK컬럼이 ture인 갯수 리턴
 * parameter: obj 			: obj
 * return: boolean
 */
function cfn_chkCount(obj){
	var cnt = 0;
	for(var i=0; i<obj.length; i++){
		if(obj[i].CHK == true){
			cnt++;
		}
	}
	return cnt;
}


/*
 * 2014.05.23 고정민
 * function name			: getCodeFromName,
 * function description		: CODE, NAME 형태의 json data에서 NAME 값으로 CODE 값을 return 해준다
 * parameter: $scope		: $scope,
 * parameter: jQuery		: jQuery,
 * parameter: dataObjStr	: CODE, NAME 값이 있는 json data object,
 * parameter: compareVal	: 찾을 값,
 * return: CODE 값
 */
function getCodeFromName($scope, jQuery, dataObjStr, compareVal) {
	var returnVal;
	for (var i = 0; i < Object.keys(eval(dataObjStr)).length; i++) {
		if (eval(dataObjStr)[i].NAME == compareVal) {
			returnVal = eval(dataObjStr)[i].CODE;
			break;
		}
	}
	return returnVal;
}


/*
 * 2014.05.23 고정민
 * function name			: getCodeVal,
 * function description		: CODE delimeter NAME 형태의 값에서 CODE 값을 분리해 리턴한다
 * parameter: codeAndNameVal: CODE delimeter NAME 형태의 값
 * parameter: delimiterStr	: delemiter string
 * return: CODE 값
 */
function getCodeVal(codeAndNameVal, delimiterStr) {

	var rtn = "";
	if(codeAndNameVal != ""){
		var idx = codeAndNameVal.indexOf(delimiterStr);
		if(idx > 1){
			rtn = codeAndNameVal.substring(0, idx).trim();
		}
	}

	return rtn;
}


/*
 * 2014.08.22 김영두
 * function name			: getNameVal,
 * function description		: CODE delimeter NAME 형태의 값에서 Name 값을 분리해 리턴한다
 * parameter: codeAndNameVal: CODE delimeter NAME 형태의 값
 * parameter: delimiterStr	: delemiter string
 * return: CODE 값
 */
function getNameVal(codeAndNameVal, delimiterStr) {

	var rtn = "";
	if(codeAndNameVal != ""){
		var idx = codeAndNameVal.indexOf(delimiterStr) + 1;
		if(idx > 1){
			rtn = codeAndNameVal.substring(idx, 100).trim();
		}
	}

	return rtn;
}


/*
 * 2014.06.11 고정민
 * function name				: excelLoadHandler,
 * function description			: excel file을 읽어 data object에 넣어준다.
 * parameter: $scope			: $scope
 * parameter: inputFileDataObj	: file information
 * parameter: outputDataObj		: excel의 data를 저장할 data object
 * parameter: XLSXReaderService	: excel data read를 보장하기 위한 factory
 */
function excelLoadHandler($scope, inputFileDataObj, outputDataObj, XLSXReaderService) {
	XLSXReaderService.readFile($scope.excelFile, $scope.showPreview).then(
	function(xlsxData) {
		$scope.sheets = xlsxData.sheets;
//		console.dir("$scope.fileChanged");
//		console.dir($scope.sheets);
	});
};


/*
 * 2014.06.11 고정민
 * function name				: DownloadJSON2CSV,
 * function description			: grid에 사용하는 json object를 csv파일로 저장해준다.
 * parameter: objArray			: data json object

function DownloadJSON2CSV(objArray) {
	var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
	var str = '';
	var curColumn = '';
	var curVal = '';
	var csvData = '';

	for (var i = 0; i < array.length; i++) {

		var line = '';

		// 1. csv data creation
		// 1.1 header creation
		// header는 array[0]이라고 가정
		if(i == 0) {
			for ( var index in array[i]) {
				if (line != '') line += ',';
				line += JSON.stringify(array[i][index]);
			}
		} else {
			// 1.2 data creation
			for (var j = 0; j < Object.keys(array[0]).length; j++) {
				curColumn = Object.keys(array[0])[j];
				if (j != 0) line += ',';
				curVal = JSON.stringify((array[i][curColumn] != undefined) ? array[i][curColumn] : '');
				line += curVal;
			}

		}
		str += line + '\r\n';

	}


	if (navigator.appName != 'Microsoft Internet Explorer') {
		csvData = 'data:text/csv;charset=utf-8,' + escape(str);
		window.open(csvData);

	} else {
		var popup = window.open('', 'csv', '');
		popup.document.body.innerHTML = '<pre>' + str + '</pre>';
		csvData = 'data:text/csv;charset=utf-8,' + escape(str);
		window.open(csvData);

	}

}
 */


/*
 * 2014.06.11 고정민
 * function name			: handsontableToJsonHandler,
 * function description		: handsontable header, grid data를 이용해 excel export용 데이터를 생성한다.
 * parameter: $scope		: $scope
 * parameter: hsc			: handsontable container
 * parameter: gridDataObj	: grid data object
 */
function handsontableToJsonHandler($scope, hsc, gridDataObj) {
	var excelDataObj = [];

	// header 정보 입력
	var curRowData = {};
	var curHeader = '';
	var headerArry = hsc.handsontable("getColHeader");
	var dataFieldArry = hsc.handsontable("getRowHeader");
	for (var j = 0; j < Object.keys(headerArry).length; j++) {
		curHeader = hsc.handsontable('getInstance').getSettings().columns[j].data;
		if(curHeader != 'CHK')
			addDataObj(jQuery, curRowData, curHeader, headerArry[j].replace(/<([a-zA-Z0-9 "'=;/:]+)([>^]+)*/g,""));
	}
	excelDataObj.push(JSON.parse(JSON.stringify(curRowData)));

	// grid data 입력
	for (var j = 0; j < Object.keys(gridDataObj).length; j++) {
		excelDataObj.push(JSON.parse(JSON.stringify(gridDataObj[j])));

		if(excelDataObj[excelDataObj.length - 1].uid != undefined)
			delete excelDataObj[excelDataObj.length - 1].uid;

		delete excelDataObj[excelDataObj.length - 1].CHK;

		for (var i = 0; i < Object.keys(headerArry).length; i++) {
			excelDataObj[excelDataObj.length - 1].uid != undefined;
		}
	}

	return excelDataObj;
};


/*
 * 2014.06.19 고정민
 * function name		: jsonToCSVStrHandler,
 * function description	: json을 CSV export에 사용할 string 형태로 변환해 준다.
 * parameter: objArray	: CSV export 할 json
 * return value			: 변환된 string
 */
function jsonToCSVStrHandler(objArray) {
	var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
	var str = '';
	var curColumn = '';
	var curVal = '';
	var csvData = '';

	for (var i = 0; i < array.length; i++) {

		var line = '';

		// 1. csv data creation
		// 1.1 header creation
		// header는 array[0]이라고 가정
		if(i == 0) {
			for ( var index in array[i]) {
				if (line != '') line += ',';
				line += JSON.stringify(array[i][index]);
//				line += array[i][index];
			}
		} else {
			// 1.2 data creation
			for (var j = 0; j < Object.keys(array[0]).length; j++) {
				curColumn = Object.keys(array[0])[j];
				if (j != 0) line += ',';
				curVal = JSON.stringify((array[i][curColumn] != undefined) ? array[i][curColumn] : '');
//				curVal = (array[i][curColumn] != undefined) ? array[i][curColumn] : '';
				line += curVal;
			}

		}
		str += line + '\r\n';

	}
	return str;
}


/*
 * 2014.06.19 고정민
 * function name		: isIE,
 * function description	: browser가 IE인지 여부를 리턴해준다.
 */
function isIE() {
	return ((navigator.appName == 'Microsoft Internet Explorer') || ((navigator.appName == 'Netscape') &&
			(new RegExp("Trident/.*rv:([0-9]{1,}[\.0-9]{0,})").exec(navigator.userAgent) != null)));
}


/*
 * 2014.06.19 고정민
 * function name				: exportToCSV,
 * function description			: IE인지 chrome, firefox, opera 등 인지 구분하여 csv 저장한다
 * parameter: $scope			: $scope
 * parameter: hsc				: handsontable container
 * parameter: handsonDataObj	: handsontable grid data object
 * parameter: excelDownIFrame	: IE에서 사용할 csv 다운용 iframe
 * parameter: csvBtnId			: csv export 용 a tag id
 * parameter: fileName			: csv file 명
 */
function exportToCSV($scope, hsc, handsonDataObj, excelDownIFrame, csvBtnId, fileName) {

//	if(handsonDataObj.length > 6000) {
//		bootbox.alert("There are too many data(rows) to be downloaded in CSV format.");
//		return;
//	}

	//.csv 없으면 에러
	if(fileName.indexOf(".csv") == -1){
		bootbox.alert("CSV File Name is invalid.");
		return;
	}

	var td = new Date();
	var mmddyyyy = td.toISOString().replace(/^(\d{4})\-(\d{2})\-(\d{2}).*$/, '$2$3$1');
	//파일명에 today작업
	fileName = fileName.substring(0, fileName.indexOf(".csv")) + "_" + mmddyyyy + ".csv";


	var jsonDataObj = handsontableToJsonHandler($scope, hsc, handsonDataObj);
	var csvDataObj = jsonToCSVStrHandler(jsonDataObj);
	var csvData = 'data:text/csv;charset=utf-8,' + escape(csvDataObj);

	if(isIE()) {

		var Browser = {
			IsIe : function() {
				return navigator.appVersion.indexOf("MSIE") != -1;
			},
			Navigator : navigator.appVersion,
			Version : function() {
				var version = 999; //
				if (navigator.appVersion.indexOf("MSIE") != -1)
					// IE again, lets downgrade version number
					version = parseFloat(navigator.appVersion.split("MSIE")[1]);
				return version;
			}
		};

		if (Browser.IsIe && Browser.Version() <= 9) {
			bootbox.alert("csv download function does not support Internet Explorer version 9 or lower.");
			return;

			/*
			$('#' + csvBtnId).attr('download', fileName);
			$('#' + csvBtnId).attr('href', "#");
			excelDownIFrame.document.open("text/html", "replace");
			excelDownIFrame.document.write(csvDataObj);
			excelDownIFrame.document.close();
			excelDownIFrame.focus();
			excelDownIFrame.document.execCommand('SaveAs', true, fileName);
			*/
		}

		var anchorForCSV = document.createElement('a');
        if(window.navigator.msSaveOrOpenBlob){
            var fileData = csvDataObj;
            var blobObject = new Blob([csvDataObj]);
            window.navigator.msSaveOrOpenBlob(blobObject, fileName);
        }


	} else {
		var link = document.createElement('a');
		link.innerHTML = "Export to CSV";
		link.setAttribute('download', fileName);
		link.setAttribute('style', "display: none");
		link.href = csvData;
		document.body.appendChild(link);
	    link.click();
	}

}


/*
 * 2014.06.19 고정민
 * function name				: downloadWithName,
 * function description			: chrome에서 csv 다운시 특정이름으로 하기 위한 function

function downloadWithName(uri, name) {

	function eventFire(el, etype) {
		if (el.fireEvent) {
			(el.fireEvent('on' + etype));
		} else {
			var evObj = document.createEvent('Events');
			evObj.initEvent(etype, true, false);
			el.dispatchEvent(evObj);
		}
	}

	var link = document.createElement("a");
	link.download = name;
	link.href = uri;
	eventFire(link, "click");

}
 */


/*
 * 2014.06.19 고정민
 * function name		: getCookie,
 * function description	: cookie에 있는 특정 값을 반환한다.
 * parameter: cName		: cookie에서 가져올 키 값
 * return value			: 키에 해당하는 cookie 값
 */
function getCookie(cName) {
	cName = cName + '=';
	var cookieData = document.cookie;
	var start = cookieData.indexOf(cName);
	var cValue = '';
	if (start != -1) {
		start += cName.length;
		var end = cookieData.indexOf(';', start);
		if (end == -1)
			end = cookieData.length;
		cValue = cookieData.substring(start, end);
	}
	return unescape(cValue);
}


function cfn_myInfoOpen(usr_id){
	alert(usr_id);
}


function cfn_chkPw(str){
   var reg = /^.{6,20}$/;    // a-z 0-9 중에 6자리 부터 12자리만 허용 한다는 뜻이구요
   return(reg.test(str));
};


/*
 * 2014.06.27 고정민
 * function name		: postRequestPopupHandler,
 * function description	: post 방식으로 popup을 호출한다
 * parameter: popUpUrl	: popup으로 열릴 화면 url
 * parameter: paramObj	: 넘길 데이터
 * parameter: widthVal	: width
 * parameter: heightVal	: height
 */
function postRequestPopupHandler(popUpUrl, paramObj, widthVal, heightVal, sameWindowYn) {


	if(typeof(sameWindowYn)=='undefined') sameWindowYn = 'N';

	var form = document.createElement("form");
	form.setAttribute("method", "post");
	form.setAttribute("action", popUpUrl);
	var targetStr;
	var str;

	if(sameWindowYn == 'Y') {
		var urlArr = popUpUrl.split('/');
		str = urlArr[urlArr.length-1].replace(/[_./]/g, "");
		targetStr = str;
	} else {
		targetStr = guid();
	}

	form.setAttribute("target", targetStr);

	var hiddenField;
	for (var j = 0; j < Object.keys(paramObj).length; j++) {
		curColumn = Object.keys(paramObj)[j];
		hiddenField = document.createElement("input");
		hiddenField.setAttribute("type", 	"hidden");
		hiddenField.setAttribute("id", 		curColumn);
		hiddenField.setAttribute("name", 	curColumn);
		hiddenField.setAttribute("value", 	paramObj[curColumn]);
		form.appendChild(hiddenField);
	}
	document.body.appendChild(form);

	// screen size 로 popup을 중간에 위치에 호출
	var screenWidth = screen.availWidth;
	var screenHeight= screen.availHeight;
	var popupLeft 	= (screenWidth - widthVal) / 2;
	var popupTop 	= (screenHeight - heightVal) / 2;


	window.open(popUpUrl, targetStr ,'scrollbars=yes,menubar=no,height=' + heightVal + ',width=' + widthVal + ',left=' + popupLeft + ',top=' + popupTop + ',resizable=yes,toolbar=no,status=no');



	form.submit();
};


/**
 * Generates a GUID string.
 * @returns {String} The generated GUID.
 * @example af8a8416-6e18-a307-bd9c-f2c947bbb3aa
 * @author Slavik Meltser (slavik@meltser.info).
 * @link http://slavik.meltser.info/?p=142
 */
function guid() {
    function _p8(s) {
        var p = (Math.random().toString(16)+"000000000").substr(2,8);
        return s ? "-" + p.substr(0,4) + "-" + p.substr(4,4) : p ;
    }
    return _p8() + _p8() + _p8() + _p8();
};


/*
 * 2014.06.30 고정민
 * function name		: authHandling,
 * function description	: 권한에 따른 화면 handling
 * parameter: jQuery	: jQuery
 * parameter: returnData: 리턴 데이터
 * return				: 화면 수정 가능 여부
 */
function authHandling(jQuery, returnData) {
	// 화면 컨트롤 있는지 여부 확인
	if(returnData.VARIABLE_MAP.PERMS_YN == "Y") {
		// 쓰기권한이 있는지 여부 확인
		if(returnData.VARIABLE_MAP.MODI_YN != "Y") {
			jQuery('.cudAuthCtr').remove();
		}

	} else {
		// 화면 권한이 없을 떄 처리
		var pathArray = window.location.pathname.split( '/' );
		var curUrlStr = "";

		if(pathArray.length < 3) {
			for (var i = 2; i < pathArray.length; i++) {
				curUrlStr += '/' + pathArray[i];
			}
		} else {
			for (var i = 3; i < pathArray.length; i++) {
				curUrlStr += '/' + pathArray[i];
			}
		}

		if(curUrlStr != getCookie("CUR_PAGE")) {
			location.replace(gWebContext + '/web' + getCookie("CUR_PAGE"));
		} else {
			location.replace(gWebContext + "/web/jsp/cmm/CMM_LOGIN.jsp");
		}
	}
	return returnData.VARIABLE_MAP.MODI_YN == "Y" ? true : false;
};


/*
 * 2014.07.11 김영두
 * function name		: formattedDate,
 * function description	: 기본 Date를 정형화된 Date로 변환(ex:07/11/2014)
 * parameter: date		: date
 * return value			: 변환된 Date
 */
function formattedDate(date){

	//ISO Date로 전환(달, 일자를 2자리 수로 고정하기 위해)
	var isoDate = date.toISOString();

	//정규 표현식으로 변환(MM/DD/YYYY)
	result = isoDate.replace(/^(\d{4})\-(\d{2})\-(\d{2}).*$/, '$2/$3/$1');
	return result;
}

/*
 * 2014.07.11 김영두
 * function name		: subtractDate,
 * function description	: Date에
 * parameter: date		: 날짜
 * parameter: sub		: 감산 할 날(일)의 수
 * return value			: 연산 후 Date
 */
function subtractDate(date, sub){
	//sub 값이 있을 경우(빼기)
	if(sub != undefined){
		date.setDate(date.getDate()-sub);
	}
	return date;
}

/*
 * 2014.07.21 dsh
 * function name		: isDate
 * function description	: Date validation(only pattern : mm/dd/yyyy)
 * parameter: date		: 날짜
 * return value			: boolean(true/false)
 */
function isDate(txtDate)
{
    var currVal = txtDate;
    if(currVal == '')
        return false;

    var rxDatePattern = /^(\d{1,2})(\/)(\d{1,2})(\/)(\d{4})$/; //Declare Regex
    var dtArray = currVal.match(rxDatePattern); // is format OK?

    if (dtArray == null)
        return false;

    //Checks for mm/dd/yyyy format.
    dtMonth = dtArray[1];
    dtDay	= dtArray[3];
    dtYear 	= dtArray[5];

//    console.log(dtYear + " / " + dtMonth + " / " + dtDay);

    if (dtYear < 1900)
    	return false;


    if (dtMonth < 1 || dtMonth > 12)
        return false;
    else if (dtDay < 1 || dtDay> 31)
        return false;
    else if ((dtMonth==4 || dtMonth==6 || dtMonth==9 || dtMonth==11) && dtDay ==31)
        return false;
    else if (dtMonth == 2)
    {
        var isleap = (dtYear % 4 == 0 && (dtYear % 100 != 0 || dtYear % 400 == 0));
        if (dtDay> 29 || (dtDay ==29 && !isleap))
                return false;

    }
    return true;
}


/*
 * 2014.07.21 dsh
 * function name		: dtFormatCompl
 * function description	: Date 포멧 자동 완성(only pattern : mmddyyy -> mm/dd/yyyy)
 * parameter: date		: 날짜
 * return value			: date string
 */
function dtFormatCompl(dt){
	var rtn;
	//길이가 8이고 '/'이 하나도 없을 경우 01/01/2014 형태로 바꿔준다.
	if(dt.length == 8 && dt.indexOf('/') == -1){

		rtn = dt.substr(0,2) + '/' + dt.substr(2,2) + '/' + dt.substr(4,4);


	}else{
		rtn = dt;
	}


	//Date 형식이 아니면 빈 값으로 넘겨버린다.
	if(!isDate(rtn)){
		rtn = "";
	}

	return rtn;
}




function isTwoObjDiffer(firstDO, secondDO) {
	var curRow;
	for (var j = 0; j < Object.keys(firstDO).length; j++) {
		curRow = Object.keys(firstDO)[j];
		if(firstDO[curRow] != secondDO[curRow]) {
			return false;
		}
	}
	return true;
}

/*
 * 2014.09.01
 * function name		: differenceInDays
 * function description	: 입력한 두 날짜 사이의 기간을 구한다(from - to)
 * parameter: fromDate	: from 날짜
 * parameter: toDate	: to   날짜
 * return				: 두 날짜의 뺄셈 결과
 * */
function differenceInDays(fromDate, toDate){

    var dt1 = fromDate.split('/');
    var dt2 = toDate.split('/');
    var one = new Date(dt1[2], dt1[0]-1, dt1[1]);
    var two = new Date(dt2[2], dt2[0]-1, dt2[1]);

    var millisecondsPerDay = 1000 * 60 * 60 * 24;
    var millisBetween = two.getTime() - one.getTime();
    var days = millisBetween / millisecondsPerDay;
    //month가 같으면(fromDate ~ toDate 둘다 포함한 날수. between 의미 )
    if(dt1[0] == dt2[0]){
    	days++;
    }
    return Math.floor(days);
}

/*
 * 2014.10.01
 * function name		: isAlpha
 * function description	: 알파벳인지체크
 * return				: boolean
 * */
function isAlpha(str){
	   //var r = new RegExp("[a-zA-Z]");
	   var re = /[^a-zA-Z]/;
	   return(!re.test(str));
}

/*
 * 2014.10.01
 * function name		: isAlphaNum
 * function description	: 알파벳, 숫자 인지체크
 * return				: boolean
 * */
function isAlphaNum(str){
	   //var r = new RegExp("[a-zA-Z]");
	 var re = /[^a-zA-Z0-9]/;
	 return(!re.test(str));
}


/*
 * 2014.10.06
 * function name		: isHB
 * function description	: HOUSE BL# 입력 허용 - 영문(대/소), 특수기호, 숫자, space 특수기호 . - ( ) & , / _ # % * ' " ; :
 * return				: boolean
 * */
function isHB(str){

	   var re = /[^a-zA-Z0-9-()&,\/_#%*'";:]/;
	   return(!re.test(str));
}

/*
 * 2014.10.06
 * function name		: isPC
 * function description	: PO/CTN 입력 허용 -  영문(대/소), 숫자, space
 * return				: boolean
 * */
function isPC(str){

	   var re = /[^a-zA-Z0-9]/;
	   return(!re.test(str));
}


/*
 * 2014.10.01
 * function name		: .format()
 * function description	: 천단위로 콤마(',') 추가
 * return				: String(ex 100,000,000)
 * */
// 숫자 타입에서 쓸 수 있도록 format() 함수 추가
Number.prototype.format = function(){
    if(this==0) return 0;

    var reg = /(^[+-]?\d+)(\d{3})/;
    var n = (this + '');

    while (reg.test(n)) n = n.replace(reg, '$1' + ',' + '$2');

    return n;
};
// 문자열 타입에서 쓸 수 있도록 format() 함수 추가
String.prototype.format = function(){
    var num = parseFloat(this);
    if( isNaN(num) ) return "0";

    return num.format();
};

/*
 * 2015.01.14
 * function name		: mddArrHandler()
 * function description	: multi dropdown component 에 의해 선택된 값을 서버에서 원하는 형태로 변경하는 로직
 * return				: array
  mdl 변경전 형태
  [
    {NAME: 1, CODE: "David"},
    {NAME: 2, CODE: "Jhon"},
    {NAME: 3, CODE: "Lisa"},
    {NAME: 4, CODE: "Nicole"},
    {NAME: 5, CODE: "Danny"}
  ]
  
  return 형태
   ["David","Jhon","Lisa","Nicole","Danny" ]
  
  
 * */
function mddArrHandler(mdl){
	var rtnArr = [];
	for(var i=0; i < mdl.length; i++){
		rtnArr[i] = mdl[i].CODE;
	}
	return rtnArr;
}



/*
 * * 2015.03.19
 * function name		: mmdSettingHandler()
 * function description	: multi dropdown component 에 scrollable 를 변경하는 로직
 * parameter  $scope		: $scope
 * parameter  id			: Setting 에서 선언해준 mddId: "mddPod"
 * parameter  scrollable	: scrollable : true/false
 * parameter  height		: height : "300px"(default=300px)
 * return					: true/false
 */ 
function mmdSettingHandler($scope, id, scrollable, height){
	
	//$scope체크
	if(typeof($scope) == 'undefined') {
		return false;
	}
	
	//height default setting
	if(typeof(height) == 'undefined') {
		height = "300px";
	}
	 
	//scope 하위 엘리먼트 중에 파라미터로 넘어온 아이디를 찾아서 해당 settings 를 변경해준다.
	for(var cs = $scope.$$childHead; cs; cs = cs.$$nextSibling) {
		if(typeof(cs.settings) != 'undefined') {
			if(cfn_undfToNull(cs.settings.mddId) == id){
				cs.settings.scrollable = scrollable;
				cs.settings.scrollableHeight = height;
				//변경후 성공리턴.
				return true;
			}
		}
	}
	//못찾았으면 실패
	return false;
	
}

