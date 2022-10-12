// ****************************************************************************************************************************************************************
// SCRIPT ZOOM

//process for zoom file with touch
function zoomFileCallBack(zoomData){
	if(zoomData.endTouch){
		zDst = null;
		isTouchZoom = false;
		if(itemLoadPdf.dataZoom) itemLoadPdf.dataZoom.pointCenter = null;
		if(itemLoadPdf.dataZoomVer) itemLoadPdf.dataZoomVer.pointCenter = null;
		onImgTouchZoom = false;
		return;
	}
	onImgTouchZoom = true;
	if(zoomData.touchs.length == 2){
		isTouchZoom = true;
		let distanceValue = common.distancePointToPoint(zoomData.touchs[0].x, zoomData.touchs[0].y, zoomData.touchs[1].x, zoomData.touchs[1].y);
		if(itemLoadPdf.pageAlign.hoz > 0){
			if(zDst == null){
				zDst = distanceValue;
			}

			if(itemLoadPdf.dataZoom.pointCenter == null){
				itemLoadPdf.dataZoom.pointCenter = common.getAveragePoint(zoomData.touchs[0].x, zoomData.touchs[0].y, zoomData.touchs[1].x, zoomData.touchs[1].y);
			}
			
			
			if(distanceValue > zDst){
				if((distanceValue - zDst) > 30){
					let scale = (0.25 - currentZoom);	
					currentZoom = 0;
					zoomOut({point:itemLoadPdf.dataZoom.pointCenter},scale);
					zDst = distanceValue;
				}
			}
			else{
				if((zDst - distanceValue) > 30){
					let scale = (currentZoom > 0) ? currentZoom : 0.25;	
					currentZoom = 0;
					zoomIn({point:itemLoadPdf.dataZoom.pointCenter},scale);
					zDst = (distanceValue);
				}
			}
		}else{
			if(zDst == null){
				zDst = distanceValue;
			}

			if(itemLoadPdf.dataZoomVer.pointCenter == null){
				itemLoadPdf.dataZoomVer.pointCenter = common.getAveragePoint(zoomData.touchs[0].x, zoomData.touchs[0].y, zoomData.touchs[1].x, zoomData.touchs[1].y);
			}
			if(distanceValue > zDst){
				if((distanceValue - zDst) > 30){
					let scale = (0.25 - currentZoom);	
					currentZoom = 0;
					zoomOut({point:itemLoadPdf.dataZoomVer.pointCenter},scale);
					zDst = distanceValue;
				}
			}
			else{
				if((zDst - distanceValue) > 30){
					let scale = (currentZoom > 0) ? currentZoom : 0.25;	
					currentZoom = 0;
					zoomIn({point:itemLoadPdf.dataZoomVer.pointCenter},scale);
					zDst = (distanceValue);
				}
			}
		}
	}
	
}

// ****************************************************************************************************************************************************************
//process for zoom file with mouse
function zoomFileMouseCallBack(zoomData){
	
	if(!zoomData.endTouch){
		currentZoom = parseFloat((currentZoom).toFixed(2));
		if(zoomData.zoomDelta && zoomData.zoomDelta > 0){
			let scale = (currentZoom > 0) ? currentZoom : 0.25;	
			currentZoom = 0;
			zoomIn(zoomData,scale);
		}
		else{		
			let scale = parseFloat((0.25 - currentZoom).toFixed(2));	
			currentZoom = 0;
			zoomOut(zoomData,scale);
			
		}
	}
}

// ****************************************************************************************************************************************************************
// zoom page in
function zoomIn(zoomData,scale){
	if(itemLoadPdf != null){
		zoomEnd = true;
		if(itemLoadPdf.scale > zoomRange[0]){
			calZoom(scale,true);
			calcXY(zoomData,false);
			$('#percent'+tabCurrent).text(itemLoadPdf.percent+'%')
		}

	}
}

// ****************************************************************************************************************************************************************
// zoom page out
function zoomOut(zoomData,scale){
	if(itemLoadPdf != null){
		zoomEnd = true;
		if((itemLoadPdf.scale < zoomRange[1])){
			calZoom(scale,false);
			calcXY(zoomData,true);
			$('#percent'+tabCurrent).text(itemLoadPdf.percent+'%')
		}
	}
}

function calZoom(scale,zomIn){
	let scaleCalc = parseFloat((scale / 2).toFixed(3));
	let calcPer = (scaleCalc * 100);
	if(zomIn){
		let percent = Math.round(itemLoadPdf.percent - ((scale) * 100));
		itemLoadPdf.scale = parseFloat((itemLoadPdf.scale - scaleCalc).toFixed(3));
		itemLoadPdf.percent = percent < 25 ? 25 : percent;

		if(itemLoadPdf.dataZoom){
			itemLoadPdf.dataZoom.heightContainer -= (itemLoadPdf.dataZoom.percentHeight * calcPer);
			itemLoadPdf.dataZoom.widthContainer -= (itemLoadPdf.dataZoom.percentWidth * calcPer);
		}
	
		if(itemLoadPdf.dataZoomVer){
			itemLoadPdf.dataZoomVer.heightContainer -= (itemLoadPdf.dataZoomVer.percentHeight * calcPer);
			itemLoadPdf.dataZoomVer.widthContainer -= (itemLoadPdf.dataZoomVer.percentWidth * calcPer);
		}
	}else{
		let percent = Math.round(itemLoadPdf.percent + ((scale) * 100));
		itemLoadPdf.scale = parseFloat((itemLoadPdf.scale + scaleCalc).toFixed(3));
		itemLoadPdf.percent = percent > 600 ? 600 : percent;
		if(itemLoadPdf.dataZoom){
			itemLoadPdf.dataZoom.heightContainer += (itemLoadPdf.dataZoom.percentHeight * calcPer);
			itemLoadPdf.dataZoom.widthContainer += (itemLoadPdf.dataZoom.percentWidth * calcPer);
		}
		if(itemLoadPdf.dataZoomVer){
			itemLoadPdf.dataZoomVer.heightContainer += (itemLoadPdf.dataZoomVer.percentHeight * calcPer);
			itemLoadPdf.dataZoomVer.widthContainer += (itemLoadPdf.dataZoomVer.percentWidth * calcPer);
		}
	
	}
	zoomContent().subscribe(_=>{});
}

// ****************************************************************************************************************************************************************
// calc x , y off zoom point エラー ~ 10px
function calcXY(zoomData,keybroad = false){
	let scrollCurrent = $('#export-div'+tabCurrent)[0].scrollTop;
	let heightHoz = (itemLoadPdf.dataZoom) ? (itemLoadPdf.dataZoom.heightContainer * itemLoadPdf.pageAlign.hoz ) : 0;
	let heightVer = (itemLoadPdf.dataZoomVer) ? (itemLoadPdf.dataZoomVer.heightContainer * itemLoadPdf.pageAlign.ver ) : 0;
	let heightHozOld = (itemLoadPdf.dataZoom) ? (itemLoadPdf.dataZoom.heightContainerOld * itemLoadPdf.pageAlign.hoz ) : 0;
	let heightVerOld = (itemLoadPdf.dataZoomVer) ? (itemLoadPdf.dataZoomVer.heightContainerOld * itemLoadPdf.pageAlign.ver ) : 0;
	let totalHieghtOld = ((heightHozOld) + (heightVerOld));
	let totalHieghtNew = ((heightHoz) + (heightVer));
	itemLoadPdf.offsetY = ((((scrollCurrent + (zoomData.point.y-90))/(totalHieghtOld / 100)) * totalHieghtNew /100)-(zoomData.point.y - 90));
	if(itemLoadPdf.dataZoom) itemLoadPdf.dataZoom.heightContainerOld = itemLoadPdf.dataZoom.heightContainer;
	if(itemLoadPdf.dataZoomVer) itemLoadPdf.dataZoomVer.heightContainerOld = itemLoadPdf.dataZoomVer.heightContainer;
	$("#export-div"+tabCurrent).scrollTop(itemLoadPdf.offsetY);
	if(itemLoadPdf.pageAlign.hoz > 0){
		if(itemLoadPdf.dataZoom.widthContainer > window.innerWidth){
			let percentOld = (itemLoadPdf.dataZoom.widthContainerOld/100)
			let percentNew = (itemLoadPdf.dataZoom.widthContainer/100)
			itemLoadPdf.dataZoom.offsetX = ((
				(
					($('#export-div'+tabCurrent)[0].scrollLeft + zoomData.point.x)
					/
					percentOld
				) 
				*percentNew - zoomData.point.x
				));
		}else{
			itemLoadPdf.dataZoom.offsetX = 0;
		}
		itemLoadPdf.dataZoom.widthContainerOld = itemLoadPdf.dataZoom.widthContainer;
		$("#export-div"+tabCurrent).scrollLeft(itemLoadPdf.dataZoom.offsetX);
	}else{
		if(itemLoadPdf.dataZoomVer.widthContainer > window.innerWidth){
			itemLoadPdf.dataZoomVer.offsetX = (((($('#export-div'+tabCurrent)[0].scrollLeft + zoomData.point.x)
											  /((((itemLoadPdf.dataZoomVer.widthContainerOld)))/100)) 
											  *(itemLoadPdf.dataZoomVer.widthContainer / 100))-zoomData.point.x);
			itemLoadPdf.dataZoomVer.widthContainerOld = itemLoadPdf.dataZoomVer.widthContainer;
		}else{
			itemLoadPdf.dataZoomVer.offsetX = 0;
			itemLoadPdf.dataZoomVer.widthContainerOld = itemLoadPdf.dataZoomVer.widthContainer;
		}
		$("#export-div"+tabCurrent).scrollLeft(itemLoadPdf.dataZoomVer.offsetX);
	}
}

function zoomContent(){
	
	removeShapeSltor();
	$('.stampProdCon').removeClass('active');
	return new Observable(observer => {
        itemLoadPdf.page.map(x=>{
			//chieu ngang
			if(x.align){
				let divmain = document.getElementsByClassName('divMain-'+itemLoadPdf.seqNo+'-page-'+(x.index)+'-'+tabCurrent)[0];
				divmain.style.webkitTransform = divmain.style.transform = 'translate(-50%,-50%) scale('+itemLoadPdf.scale+') rotate('+x.rotate+'deg)';
				divmain.setAttribute('scale',itemLoadPdf.scale)
				if(x.alignReal){
					$('#'+tabCurrent+'-file-'+itemLoadPdf.seqNo+'-page-'+(x.index)).css('height',(itemLoadPdf.dataZoom.heightContainer)+'px');
				}
				else{
					$('#'+tabCurrent+'-file-'+itemLoadPdf.seqNo+'-page-'+(x.index)).css('height',(itemLoadPdf.dataZoom.widthContainer+20)+'px');
				}
			} 

			//chieu doc
			else {

				let divmain = document.getElementsByClassName('divMain-'+itemLoadPdf.seqNo+'-page-'+(x.index)+'-'+tabCurrent)[0];
				divmain.style.webkitTransform = divmain.style.transform = 'translate(-50%,-50%) scale('+itemLoadPdf.scale+') rotate('+x.rotate+'deg)';
				divmain.setAttribute('scale',itemLoadPdf.scale)
				if(x.alignReal){
					$('#'+tabCurrent+'-file-'+itemLoadPdf.seqNo+'-page-'+(x.index)).css('height',(itemLoadPdf.dataZoomVer.widthContainer+20)+'px');
				}
				else{
					$('#'+tabCurrent+'-file-'+itemLoadPdf.seqNo+'-page-'+(x.index)).css('height',(itemLoadPdf.dataZoomVer.heightContainer)+'px');
				}
			}
		});
		
		calcWidthHeightConZoom();
        observer.next();
        observer.complete();
    })
}

function calcWidthHeightConZoom(){
    calcPageHozVer().subscribe(dataAlign =>{
        if(dataAlign.hoz > 0 ){
            let width = (itemLoadPdf.dataZoom) ? (itemLoadPdf.dataZoom.widthContainer) : (itemLoadPdf.dataZoomVer.widthContainer);
            $('#e-pdf'+tabCurrent).css({'width':(width > screen.width)?((width+20)+'px') : (screen.width - 8)+'px'});
        }else{
            let height = (itemLoadPdf.dataZoom) ? (itemLoadPdf.dataZoom.heightContainer) : (itemLoadPdf.dataZoomVer.heightContainer);
            $('#e-pdf'+tabCurrent).css({'width':(height > screen.width)?((height+20)+'px') : (screen.width - 8)+'px'});
        }
    });
}