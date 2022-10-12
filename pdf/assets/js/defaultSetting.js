

// ****************************************************************************************************************************************************************

// SCRIPT SETTING DEFAULT
function setDefaultSetting(){

	ipcRenderer.on('haskey-error',(event,data)=>{
		common.showHideLoader(false);
        common.showMessage(data);
	});

	// get data login from main.js
	ipcRenderer.send('dataLoginRequest', null); 
    ipcRenderer.on('dataLoginReply',(event,data)=>{
        datalogin=data.datalogin;
		message=data.message;
		getSetting();
	});
	//get data login user
	getUserInfo();

	// set function for btn ok of popup
	$('#btn-ok').on('click',()=>{
		if(common.okFnCallBack != null){
			$('#confirmModal').modal('hide');
			common.okFnCallBack();
		}
	});
	// set function for btn cancel of popup
	$('#btn-cancel').on('click', () => {
		if(common.cancelFnCallBack != null){
			$('#confirmModal').modal('hide');
			common.cancelFnCallBack();
		}
	});
	// set function for btn cancel error of popup
	$('#btn-cancel-eror').on('click', () => {
		if(common.cancelFnCallBack != null){
			$('#messageModal').modal('hide');
			common.cancelFnCallBack();
		}
	});
	// set function for btn cancel of popup
	$('#btn-tab-search').click();
	$('#tab-btn-01').click();
    
    // ****************************************************************************************************************************************************************
    // SCRIPT 19.「×」アイコンクリック
	$("#closeApp").on("click",() => {
		doConfirm("LPWI0002",() => logOut('closeApp'));
	});
    // END SCRIPT 19.「×」アイコンクリック
    // ****************************************************************************************************************************************************************
	
	// ****************************************************************************************************************************************************************
	// SCRIPT maximize and unmaximize
	ipcRenderer.on('ismax',(event,data)=>{
		ismax = data;
		if(ismax){
			$('.minmax').removeClass('max').addClass('min')
		}else{
			$('.minmax').removeClass('min').addClass('max')
		}
	});
	ipcRenderer.send('getMinMax', null); 
    $('#logOut').on('click',() => {
        doConfirm("LPWI0002",() => logOut('logout'));
    });	

    $('#mini').on('click',() => {
        ipcRenderer.send('mini', ''); 
    });	
    $('#minmax').on('click',() => {
        ipcRenderer.send('minmax', ''); 
    });	
    // END  SCRIPT maximize and unmaximize
    // ****************************************************************************************************************************************************************
    
    // ****************************************************************************************************************************************************************
    // SCRIPT 15.「色選択」アイコンクリック
    $("#btn-change-color-tb").on("click", function($event){
		$('.shapeTypeContainer').removeClass('active');
        $("#color-change").css("display", ($("#color-change").css("display") == "block" ? "none" : "block"));
        $("#line-size-change").css("display", "none");
		$event.stopPropagation();
		clearSelect(true);
		// if(active && active[0].nodeName == 'TEXTAREA') return;
		// removeShapeSltor();
    });

    $('.btn-color-popup').on('click', e => {
        let value = e.currentTarget.getAttribute('value');
        $('.dotContainer').removeClass('colorSelected');
        e.currentTarget.setAttribute('class', 'btn-color-popup colorSelected');
        setColorPicker(value);
		if(svgMoveEVent){
			svgMoveEVent.setColor(value);
		}
    });
    // END SCRIPT 15.「色選択」アイコンクリック
    // ****************************************************************************************************************************************************************
    $(window).on('mousemove',function(e) {
        pointZoomKey = {x : e.clientX,y:e.clientY}
    });
    // ****************************************************************************************************************************************************************
    // SCRIPT 14.「線の幅選択」アイコンクリック
    $(window).click(function(e) {
        // $("#line-size-change").css("display", "none");
		// $("#color-change").css("display", "none");
		$('.shapeTypeContainer').removeClass('active');
		if(e.target.id=="highlightchange"||e.target.id=="pennew" || e.target.id=="highLightClick"){
			// $("#highlightchange").css("display", ($("#highlightchange").css("display") == "block" ? "none" : "none"));
			return;
		}else{
			$("#highlightchange").css("display", "none");
		}
		
		$("#line-size-change,#color-change").css("display", "none");
		
    });

    $("#btn-change-size-tb").on("click", function($event){
		$('.shapeTypeContainer').removeClass('active');
        $("#line-size-change").css("display", ($("#line-size-change").css("display") == "block" ? "none" : "block"));
        $("#color-change").css("display", "none");
		$event.stopPropagation();
		clearSelect(true);
		removeShapeSltor();
		$('.stampProdCon').removeClass('active');
    });

    $('.dotContainer').on('click', e => {
        let value = e.currentTarget.getAttribute('value');
        $('.dotContainer').removeClass('rowSelected');
        e.currentTarget.setAttribute('class', 'dotContainer rowSelected');
		setDotSize(value);
		clearSelect(true);
		removeShapeSltor();
		$('.stampProdCon').removeClass('active');
	});
	
	$('#highLightClick').on('click', e => {
		setPaintClick(true,'hl');
	});
	
	$('.hlItem').click(function(e){
		hLightOpacity = parseFloat(e.currentTarget.getAttribute("value"));
		$('.hlItem').removeClass('rowSelected');
		$('.hlItem[value="'+hLightOpacity+'"]').addClass('rowSelected');
		setOpacity(hLightOpacity);
	})
    // END SCRIPT 14.「線の幅選択」アイコンクリック
    // ****************************************************************************************************************************************************************

}

// ****************************************************************************************************************************************************************
// create path file when starting app
function getSetting() {
	if(datalogin == null  || datalogin.url == null || datalogin.url == ""){
		common.showErrMessage(common.getMessageWithErrorCode("E99",message), () => errorlogout());
		return;
	}
	try {
		common.mkDirByPathSync(datalogin.templateFolder);
		common.mkDirByPathSync(pathWork);
		common.mkDirByPathSync(pathRegist);
		
	} catch (error) {
		common.showErrMessage(common.getMessageWithErrorCode("E99",message), 
		() => errorlogout())
	}
}

// logout for btn
function logOut(item){
	// clearSelect();
    if(item == 'logout'){
		common.showHideLoader(true);
		try {
			loginService.logout(datalogin).subscribe(data => {
				common.showHideLoader(false);
				if(!data.error){
					ipcRenderer.send(item, item); 
					common.showInfoMessage('ログアウトしました。');
				}else{
					common.showMessage(data.errorCode);
				}
			});
		} catch (error) {
			common.showHideLoader(false);
		}
    }else{
        ipcRenderer.send(item, item);
		common.showInfoMessage('ログアウトしました。');
    }
}

// ****************************************************************************************************************************************************************
// SCRIPT PROCESS LAYOUT TOOLBAR
function toggleToolBar(){
	let toolbar = $('.custom-navbar');
	
	setTimeout(function(){
		toolbar.slideUp(500);
	}, timeout);
	
	$(document).mousemove(function(e){
		let barPosition = window.pageYOffset + toolbar.outerHeight(true);
		if(e.pageY <= barPosition){
			toolbar.show();
		}else{
			toolbar.slideUp(500);
		}
	});
}

function toggleTab(){
	let tabPanel = $('.panel'),
		tabBtn = $('#tab-btn-01'),
		wall = $('#wall-for-tab'),
		wallSearch = $('#wall-for-tab-search'),
		customTab = $('.custom-tab'),
		tabSearchBtn = $('#btn-tab-search'),
		tabPanelSearch = $('#panel-search'),
		customTabSearch = $('.custom-tab-search');

	tabBtn.click(function(){
		if(tabPanel.css("display") === 'none'){
			customTab.addClass('panel-show');
		}
		else{
			customTab.removeClass('panel-show');
		}

		tabPanel.animate({width:"toggle"},200);
		tabBtn.toggleClass("active");
		wall.toggle();	
		scrollLeftPanel();
	});

	tabSearchBtn.click(()=>{
		if(isRotate) return;
		if(tabPanelSearch.css("display") === 'none'){
			customTabSearch.addClass('panel-search-show');
		}
		else{
			customTabSearch.removeClass('panel-search-show');
		}

		tabPanelSearch.animate({height:"toggle"},200);
		tabSearchBtn.toggleClass("active");
		wallSearch.toggle();
		if($('#mergePDFcontainer').hasClass('active')){
			closeCombine();
		}
	});
	
	wall.on('mousedown', function(){
		let customShow = $('.panel-show');
		if(customShow){
			customTab.removeClass('panel-show');
		}

		tabPanel.animate({width: "toggle"}, 200);
		tabBtn.toggleClass("active");

		wall.hide();
	});

	wallSearch.on('mousedown', function(){
		if($('.drawingSearchContent.showPopup').length == 0){
			let customSearchShow = $('.panel-search-show');
			if(customSearchShow){
				customTabSearch.removeClass('panel-search-show');
			}
			tabPanelSearch.animate({height: "toggle"}, 200);
			tabSearchBtn.toggleClass("active");
			wallSearch.hide();
		}
		
	});
}

// END SCRIPT PROCESS LAYOUT TOOLBAR
// ****************************************************************************************************************************************************************
function getUserInfo(){
	//get data login user
	ipcRenderer.send('dataUserInfoRequest', null); 
	ipcRenderer.on('dataUserInfoReply',(event,data)=>{
		userInfo = null;
		if(data && data.userInfo){
			userInfo = data.userInfo;
			datalogin.uh2 = userInfo.uh2;
			datalogin.userid = userInfo.userid;
		}
		pathAssets = data.pathAssets;
		// $('#openDrawingSearch').attr('disabled','true').removeAttr(((data == null || data.userInfo == null) || (data && data.userInfo && data.userInfo.author)) ? 'disabled' : '');
		// if(data && !data.init && data.userInfo && data.userInfo.author) $('#openDrawingSearch').click();
		$("#usrInfo").text((userInfo) ? (userInfo.usrId + " : " + userInfo.usrNm) : '');
		$('#logOut').css('display',(userInfo) ? '' : 'none');
	});
}

// END  SCRIPT SETTING DEFAULT
// ****************************************************************************************************************************************************************


function callbackMouseEvent($e){
	switch($e.type){
		case 'stampSign':
			handleSignStamp($e);
			break;
	}
}