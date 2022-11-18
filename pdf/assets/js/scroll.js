function setScriptPageChange(){
// ****************************************************************************************************************************************************************
// SCRIPT 8.「現在のページ」テキストの入力後
	$('body').on('keyup','#currentPage', e => {
		if(itemLoadPdf){
			if(itemLoadPdf.page.length > 1){
				clearInterval(timer2);
				let val = e.currentTarget.value;
				if(val  == null || val == "") return;
				if( re.test(val) ){
					if(val < 1) val = 1;
					else if(val >= itemLoadPdf.page.length) val = itemLoadPdf.page.length;
					timer2 = setTimeout(x=>{
						$("#export-div"+tabCurrent).scrollTop($('#'+tabCurrent+'-file-'+itemLoadPdf.seqNo+'-page-'+ (val-1))[0].offsetTop-90);
						$("#export-div"+tabCurrent).scrollLeft(0);
						$('#currentPage').val(val);
						pageCurrent = val;
						itemLoadPdf.pageCurrent = pageCurrent;
						$('#currentPage').blur();
						currentPageKeyPress = false;
					},500)
				}else{
					timer2 = setTimeout(x=>{
						$("#export-div"+tabCurrent).scrollTop($('#'+tabCurrent+'-file-'+itemLoadPdf.seqNo+'-page-0')[0].offsetTop-90);
						$("#export-div"+tabCurrent).scrollLeft(0);
						$('#currentPage').val(1);
						pageCurrent = 1;
						itemLoadPdf.pageCurrent = pageCurrent;
						$('#currentPage').blur();
						currentPageKeyPress = false;
					},500)
				}
			}
		}
	});

	$('#currentPage').on('focus',e=>{
		currentPageKeyPress = true;
	})

// END SCRIPT 8.「現在のページ」テキストの入力後
// ****************************************************************************************************************************************************************

}

function initScrollForExportDivMain(id){
	$("#export-div"+id).on("scroll",(e)=>{ 
		if(itemLoadPdf){
			if(itemLoadPdf.page.length > 1){
				for(let i = 0; i < itemLoadPdf.page.length ; i ++ ){
					let crollEvent = (e.currentTarget.scrollTop + ($('#'+tabCurrent+'-file-'+itemLoadPdf.seqNo+'-page-'+i)[0].offsetHeight/2))-90;
					let offsetTop = $('#'+tabCurrent+'-file-'+itemLoadPdf.seqNo+'-page-'+i)[0].offsetTop;
					let totalHeight = (offsetTop + $('#'+tabCurrent+'-file-'+itemLoadPdf.seqNo+'-page-'+i)[0].offsetHeight);
					if(crollEvent >= offsetTop && crollEvent <= totalHeight){
						$('#currentPage').val(i+1);
						pageCurrent = i+1;
						itemLoadPdf.pageCurrent = pageCurrent;
					}
				}
			}
		}
	});
}
// ****************************************************************************************************************************************************************
//process drag or scroll page PDF
function scrollFileCallBack(dataScroll){
	if(dataScroll.scroll == false) {; 
		if(dragText == true){
			$('.font-container').removeClass('zindx1 zindx2 zindx3').addClass('zindx3');
		}
		setTimeout(x=>{positionScroll = null},50)
	}
	if(dataScroll.scroll){
		clearSelect(true);
		removeShapeSltor();
		$('.stampProdCon').removeClass('active');
		
	}else{
		setCursor();
	}
	
	if((dataScroll.which == null || dataScroll.which == 1) && (canPaint || cantText || canEraser )){
		return;
	}
	
	clearTimeout(timer3);
	if(dataScroll.scroll){
		$('.updateZoom.zindx2').removeClass('curPen curBrush curRom curText curDrag curDefault').addClass('curDrag');
	}else{
		$('.updateZoom.zindx2').removeClass('curPen curBrush curRom curText curDrag curDefault').addClass('curDefault');
	}
	timer3 = setTimeout(_=>{
		if(isTouchZoom || dataScroll == null || dataScroll == undefined || !dataScroll.scroll){
			positionScroll = null;
			return;
		}
		if(positionScroll == null){
			positionScroll = {x: dataScroll.x, y: dataScroll.y};
		}
		else{
			scrollFile(dataScroll);
		}
	},isTouchZoom ? 500 : 0)
}

// ****************************************************************************************************************************************************************
//process drag or scroll page PDF
function scrollFile(dataScroll){
	let scrollL = $("#export-div"+tabCurrent).scrollLeft();
	let scrollT = $("#export-div"+tabCurrent).scrollTop();
	let scrollX = positionScroll.x - dataScroll.x;
	let scrollY = positionScroll.y - dataScroll.y;
	if((scrollL > 0 && scrollX < 0) || scrollX > 0){
		$("#export-div"+tabCurrent).scrollLeft(scrollL + scrollX);
	}

	if((scrollT > 0 && scrollY < 0) || scrollY > 0){
		$("#export-div"+tabCurrent).scrollTop(scrollT + scrollY);
	}

	positionScroll = {x: dataScroll.x, y: dataScroll.y};
}
// END SCRIPT ZOOM
// ****************************************************************************************************************************************************************

