var obj_NgApp = angular.module('app_customed_handsontable', []);

obj_NgApp.controller('ctr_customed_handsontable', function($scope, $http, $document, $window) {


	//global variable setting
	var do_codeObj = {};

	//B. data setting
	$scope.do_exception = {};

	// data object initialize
	setDataObj(jQuery, $scope, "$scope.do_exception");

	//handson table parameter setting
	var hsc_exception = $("#hst_exception"); // grid object 선언

	// set dummy data for dropbox
	do_codeObj = {
		CODE_CNTR_SIZE: "20FT:20FT|| 40FT:40FT|| 40HQ:40HQ|| 45HQ:45HQ"
		,CODE_EXCP_RSN: "ETAC:ETA changed|| DLY1:Delayed due to Vessel|| DLY2:Delayed due to Customs|| SHRT:Shortage in Quantity|| SURP:Surplus in Quantity|| MISS:Missing|| DMGD:Damage|| OTHR:Others|| OVCD:Shipment over carried"
		,CODE_FWDR: "F001:3PLUS|| F023:AGLC|| F006:Air Sea Transport|| F003:AIT|| F009:DUG|| F008:Expeditors|| F014:EZ World Wide|| F024:F21 Local Truck|| F002:Hanjin Logistics|| F004:Hankyu|| F016:HJ Bakker|| F026:KERRY LOGISTICS|| F007:MC Cargo|| F020:MSM|| F025:New Connect|| F010:Savino Del Bene|| F011:Stevens Global|| F005:U-Freight|| F012:UPS"
		,CODE_SPMT_TP: "FCL:FCL|| LCL:LCL"
		,CODE_TRSP_MD: "SEA:Sea|| AIR:Air|| RAIL:Rail|| TRK:Truck"
		,CODE_UNT: "KGM:KG|| LBS:LBS"
		,MVMNT_STTS: "BKD:Booked|| LDD:Loaded on board|| DEP:Departed|| ARR:Arrived|| CUS:Customs cleared|| WHO:Released from W/H|| DLV:Delivered"
		}
	
	
	/*
	 * 2014.07.22 jhj
	 * function description :document ready시 수행
	 * return: none
	 */
	$document.ready(function () {
		setExceptionGrid();

		var jsonData = [
				{EXCP_RSN: "ETAC:ETA changed", RMK: "remark sample 1", EXCP_PICS: "100", EXCP_LCTN_CD: "SEA:Sea", EXCP_DATE: "04/07/2015", LST_MODI_DATE: "", LST_MODIR_ID: "jmko09"},
				{EXCP_RSN: "DLY1:Delayed due to Vessel", RMK: "remark sample 2", EXCP_PICS: "200", EXCP_LCTN_CD: "RAIL:Rail", EXCP_DATE: "04/07/2015", LST_MODI_DATE: "", LST_MODIR_ID: "jmko09"}
				];

		returnDataHandler($scope, hsc_exception, "$scope.do_exception", jsonData);

	});


	/*
	 * 2014.07.22 jmko09
	 * function description : 데이터 로드
	 * return: none
	 */
	$scope.load_ExcptnBtn = function() {
		$scope.org_data = FormatJSON($scope.do_exception.org);
		$scope.chg_data = FormatJSON($scope.do_exception.chg);
		$scope.grid_data = FormatJSON($scope.do_exception.grid);

	}


	/*
	 * 2014.07.22 jhj
	 * function description : add 버튼 클릭시 수행, 행 추가
	 * return: none
	 */
	$scope.add_ExcptnBtn = function() {

		/*
		 * A. Validation
		 */
		if (hsc_exception == undefined) {
			bootbox.alert("No data loaded on the table.");
			return false;
		}

		/*
		 * B. parameter setting
		 */
		var dataObj = "$scope.do_exception";

		/*
		 * C. add handson table row jQuery : jQuery object
		 * $scope : $scope orgData : data object
		 */
		handsonGridInsertHandler(jQuery, $scope, dataObj);

	};


	/*
	 * 2014.07.22 jhj
	 * function description : del 버튼 클릭시 수행, 행 삭제
	 * return: none
	 */
	$scope.del_ExcptnBtn  = function() {
		/*
		 * A. parameter setting
		 */
		var hs_curRow 	= $scope.hst_exception_curRow; 	// 현재 선택된 행
		var dataObj 	= "$scope.do_exception"; 			//

		/*
		 * B. Validation
		 */
		if(hs_curRow == undefined || hsc_exception.handsontable('getInstance').getCell(hs_curRow, 0) == null) {
			bootbox.alert("Please select row(s) to delete.");
			return false;
		}

		/*
		 * C. delete handsontable row
		 * jQuery 			: jQuery object
		 * $scope 			: $scope
		 * dataObj			: data object
		 * hs_user_curRow	: 현재 선택된 행
		 * hsc_user			: handson table container 명
		 */
		handsonGridDeleteHandler(jQuery, $scope, dataObj, hs_curRow, hsc_exception);

	};
	

	/*
	 *  2014.07.22 jhj
	 * function name		: setExceptionGrid
	 * function description		: Exception grid 세팅.
	 * return: none
	 */
	function setExceptionGrid(){

		//A. data setting
		var gridData = "$scope.do_exception"; // grid에 사용할 데이터 선언

		/// handson table 기타 properties 설정

		// column header
		var colHeaders 	= ["*Exception Reason", "Remark", "Exception Piece", "Exception Location","Expected <br>Delivery Date", "Update Time", "Report By"];

		// column width
		var colWidths 	= [ 140, 180, 60, 150, 80, 80, 70 ];

		// column detail
		var columns 		= [ {	data: "EXCP_RSN",
						type: 'autocomplete',
						source: do_codeObj.CODE_EXCP_RSN.split('||'),
						strinct: false,
						filter: false,
						readOnly: false},
				            {	data: "RMK"},
				            {	data: "EXCP_PICS",
				                type: "numeric",
				            	format:","},
				            {	data: "EXCP_LCTN_CD",
						type: 'autocomplete',
						source: do_codeObj.CODE_TRSP_MD.split('||'),
						strinct: false,
						filter: true,
						readOnly: false},
				            {	data: "EXCP_DATE", 
						type: "date", 
						dateFormat: 'mm/dd/yy'},
					    {	data: "LST_MODI_DATE", 
						type: "date", 
						dateFormat: 'mm/dd/yy'},
					    {	data: "LST_MODIR_ID", 
						readOnly : true}
					 ];

		handsonGridRender(gridData, colHeaders, colWidths, columns, "$scope.hst_exception_curRow", hsc_exception, $scope, 400, false, true);

	};


function FormatJSON(oData, sIndent) {
    if (arguments.length < 2) {
        var sIndent = "";
    }
    var sIndentStyle = "    ";
    var sDataType = RealTypeOf(oData);

    // open object
    if (sDataType == "array") {
        if (oData.length == 0) {
            return "[]";
        }
        var sHTML = "[";
    } else {
        var iCount = 0;
        $.each(oData, function() {
            iCount++;
            return;
        });
        if (iCount == 0) { // object is empty
            return "{}";
        }
        var sHTML = "{";
    }

    // loop through items
    var iCount = 0;
    $.each(oData, function(sKey, vValue) {
        if (iCount > 0) {
            sHTML += ",";
        }
        if (sDataType == "array") {
            sHTML += ("\n" + sIndent + sIndentStyle);
        } else {
            sHTML += ("\n" + sIndent + sIndentStyle + "\"" + sKey + "\"" + ": ");
        }

        // display relevant data type
        switch (RealTypeOf(vValue)) {
            case "array":
            case "object":
                sHTML += FormatJSON(vValue, (sIndent + sIndentStyle));
                break;
            case "boolean":
            case "number":
                sHTML += vValue.toString();
                break;
            case "null":
                sHTML += "null";
                break;
            case "string":
                sHTML += ("\"" + vValue + "\"");
                break;
            default:
                sHTML += ("TYPEOF: " + typeof(vValue));
        }

        // loop
        iCount++;
    });

    // close object
    if (sDataType == "array") {
        sHTML += ("\n" + sIndent + "]");
    } else {
        sHTML += ("\n" + sIndent + "}");
    }

    // return
    return sHTML;
}

function RealTypeOf(v) {
  if (typeof(v) == "object") {
    if (v === null) return "null";
    if (v.constructor == (new Array).constructor) return "array";
    if (v.constructor == (new Date).constructor) return "date";
    if (v.constructor == (new RegExp).constructor) return "regex";
    return "object";
  }
  return typeof(v);
}


});
