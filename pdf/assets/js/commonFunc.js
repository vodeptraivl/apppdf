// ****************************************************************************************************************************************************************
//common logout when IDL or authen error
function errorlogout() {
	common.logOutOrDenied();
}

// ****************************************************************************************************************************************************************
// common confirm when any change
function doConfirm(messCode, callbackfunction, idtab = null) {
	checkChange(idtab);
	if (isChange) {
		common.showConfirmMessage(common.getMessageWithErrorCode(messCode, message), callbackfunction, null);
	} else {
		callbackfunction();
	}
}
function doQuestion(messCode, callbackfunction, idtab = null) {
	common.showConfirmMessage(common.getMessageWithErrorCode(messCode, message), callbackfunction, null);
}

// ****************************************************************************************************************************************************************
//check value change
function checkChange(idtab) {
	let count = (countEarser(true, idtab) > 0)
	isChange = count;
}

// ****************************************************************************************************************************************************************
//common set attr for html element
function setAttributes(el, attrs) {
	for (var key in attrs) {
		el.setAttribute(key, attrs[key]);
	}
}


// ****************************************************************************************************************************************************************
//count data text or line in display
function countEarser(countLayer = false, idtab) {
	let countData = 0;
	if (idtab) {
		for (let j = 0; j < allTabs.length; j++) {
			if (allTabs[j].idtab == idtab) {
				if (allTabs[j].signaPads) {
					for (let k = 0; k < allTabs[j].signaPads.length; k++) {
						if (allTabs[j].signaPads[k]._data && allTabs[j].signaPads[k]._data.length > 0) {
							countData++
						}
						$('.divPage[tab="' + idtab + '"]').map((ix, x) => {
							if (x.getAttribute('rotate') != "0") countData++
						});
					}
				}
			}
		}
		if (countLayer) {
			countData += coutTextAndImageOnCurrentPage(idtab);
		}
	} else {
		if (allTabs) {
			for (let j = 0; j < allTabs.length; j++) {
				if (allTabs[j].signaPads) {
					for (let k = 0; k < allTabs[j].signaPads.length; k++) {
						if (allTabs[j].signaPads[k]._data && allTabs[j].signaPads[k]._data.length > 0) {
							countData++
						}
					}
				}
			}
		}
		if (signaPads) {
			for (let i = 0; i < signaPads.length; i++) {
				if (signaPads[i]._data && signaPads[i]._data.length > 0) {
					countData++
				}
			}
		}
		$('.divPage').map((ix, x) => {
			if (x.getAttribute('rotate') != "0") countData++
		});

		if (countLayer) {
			countData += coutTextAndImageOnCurrentPage();
		}
	}

	return countData;
}
function coutTextAndImageOnCurrentPage(idtab = null) {
	let countData = 0;
	$(((idtab) ? '.divPage[tab="' + idtab + '"] ' : '') + '.font-container').map((ix, x) => {
		if (x.style.display == null || x.style.display == 'block' || x.style.display == '') countData++
	});
	$(((idtab) ? '.divPage[tab="' + idtab + '"] ' : '') + '.imgContainer').map((ix, x) => {
		if (x.style.display == null || x.style.display == 'block' || x.style.display == '') countData++
	});
	$(((idtab) ? '.divPage[tab="' + idtab + '"] ' : '') + '.FKShape').map((ix, x) => {
		if (x.style.display == null || x.style.display == 'block' || x.style.display == '') countData++
	});
	return countData;

}

// ****************************************************************************************************************************************************************
//SCRIP SET CURSOR
function setCursor() {
	if (canPaint) {
		if (!$('.fa-pencil').hasClass('btn-disable')) {
			$('.updateZoom.zindx2').removeClass('curPen curBrush curRom curText curDrag curDefault').addClass('curPen');
		} else if (!$('.fa-paint-brush').hasClass('btn-disable')) {
			$('.updateZoom.zindx2').removeClass('curPen curBrush curRom curText curDrag curDefault').addClass('curBrush');
		}
	} else if (canEraser) {
		$('.updateZoom.zindx2').removeClass('curPen curBrush curRom curText curDrag curDefault').addClass('curRom');
	} else if (cantText || canDrawShape) {
		$('.updateZoom.zindx2').removeClass('curPen curBrush curRom curText curDrag curDefault').addClass('curText');
	} else {
		$('.updateZoom.zindx2').removeClass('curPen curBrush curRom curText curDrag curDefault').addClass('curDefault');
	}
	if (canPaint || canEraser || cantText) {
		$('.imgContainer').removeClass('zindx1 zindx2 zindx3').addClass('zindx1')
		$('.svg-container').removeClass('active zindx3 zindx1').addClass('zindx1');
	} else {
		$('.imgContainer').removeClass('zindx1 zindx3').addClass('zindx3')
		$('.svg-container').removeClass('active zindx3 zindx1').addClass('zindx3');
	}
}
// END SCRIP SET CURSOR
// ****************************************************************************************************************************************************************

// ****************************************************************************************************************************************************************
//clone file to work folder
function copyToWorkFolder(pathFile, name) {
	// common.deleteFolderRecursive(pathWork);
	fs.copyFileSync(pathFile, path.join(pathWork, name));
}

function checkDateString(value, pattern = "YYYY.MM.DD") {
	let pd = ['((?:19|20)[0-9]{2,2})', '(0[1-9]|1[012])', '(0[1-9]|[12][0-9]|3[01])', '[/]','[-]','[.]'];
	if(value != null && value != ""){
		switch(pattern){
			case "YYYY/MM/DD":
				return (new RegExp(['^', pd[0], pd[3], pd[1], pd[3], pd[2], '$'].join("")).test(value));
			case "YYYY.MM.DD":
				return (new RegExp(['^', pd[0], pd[5], pd[1], pd[5], pd[2], '$'].join("")).test(value));
			case "DD/MM/YYYY":
				return (new RegExp(['^', pd[1], pd[3], pd[2], pd[3], pd[0], '$'].join("")).test(value));
			case "MM/DD/YYYY":
				return (new RegExp(['^', pd[2], pd[3], pd[1], pd[3], pd[0], '$'].join("")).test(value));
			case "YYYYMMDD":
				return (new RegExp(['^', pd[0], pd[1], pd[2], '$'].join("")).test(value));
			case "DDMMYYYY":
				return (new RegExp(['^', pd[1], pd[2], pd[0], '$'].join("")).test(value));
			case "MMDDYYYY":
				return (new RegExp(['^', pd[2], pd[1], pd[0], '$'].join("")).test(value));
			case "YYYY-MM-DD":
				return (new RegExp(['^', pd[0], pd[4], pd[1], pd[4], pd[2], '$'].join("")).test(value));
			case "DD-MM-YYYY":
				return (new RegExp(['^', pd[1], pd[4], pd[2], pd[4], pd[0], '$'].join("")).test(value));
			case "MM-DD-YYYY":
				return (new RegExp(['^', pd[2], pd[4], pd[1], pd[4], pd[0], '$'].join("")).test(value));
		}
	}
	return false
}


function createImage(name,rotate,pathImg,transfrom,textW,textH,position,top,left,ctnTransform){
	let img = document.createElement('img');
	let imgctn = document.createElement('div');
	setAttributes(imgctn, {
		'class':'importLocal',
		'id':'hinhctn'+name,
		'style':'border:none;'+textW+textH+position+'transform:'+ctnTransform+';',
		'src':pathImg
	});
	setAttributes(img, {
		'class':'imgImport',
		'id':'hinh'+name,
		'style':'transform-origin: 0px 0px;border:none;'+transfrom+textW+textH+position+top+left+'',
		'src':pathImg,
		'rotatereal':rotate
	});
	imgctn.append(img);
	return imgctn;
}

function createElementImage(rotate){
	let strRotate = ((rotate == 0 || rotate == 180) ? '' : rotate);
	return ('<div class="dot activeT dotTop'+strRotate+' top topp"></div>'
			+'<div class="dot activeT dotLeft'+strRotate+' left leftt"></div>'
			+'<div class="dot activeT dotBot'+strRotate+' bot bott"></div>'
			+'<div class="dot activeT dotRight'+strRotate+' right rightt"></div>'
			+'<div class="dot activeT dotTopRight'+strRotate+' topright top right"></div>'
			+'<div class="dot activeT dotTopLeft'+strRotate+' topleft top left"></div>'
			+'<div class="dot activeT dotBotRight'+strRotate+' botright bot right"></div>'
			+'<div class="dot activeT dotBotLeft'+strRotate+' botleft bot left"></div>'
			//drag
			+'<div class="dragElem dragElemTop"></div>'
			+'<div class="dragElem dragElemLeft"></div>'
			+'<div class="dragElem dragElemRight"></div>'
			+'<div class="dragElem dragElemBot"></div>'
	);
}

function setWHE(e,w,h){
	let degree = (+e.getAttribute('rotateReal'));
	// let w = e.parentElement.getAttribute('data-w');
	// let h = e.parentElement.getAttribute('data-h')l;
	e.style.width = (degree == 90 || degree == 270) ? (h+'px') : (w+'px') ;
	e.style.height = (degree == 90 || degree == 270) ? (w+'px') : (h+'px') ;
}

function setXYE(e,x,y){
	let degree = (+e.getAttribute('rotateReal'));
	let transfrom = 'rotate(-'+degree+'deg) ';
	switch(degrees){
		case 90:
			transfrom += ('translate(-' + y + 'px, ' + x + 'px)');
			break;
		case 180 : 
			transfrom += ('translate(-' + x + 'px, -' + y + 'px)');
			break;
		case 270:
			transfrom += ('translate(' + y + 'px, -' + x + 'px)');
			break;
	}
	
	e.style.webkitTransform = e.style.transform = transfrom;
}

function calcZP(e,scale = null){
	return ((((e)*2)/(((scale || itemLoadPdf.scale/0.005)/100)*2))*2);
}

function copyImgToWorkFolder(pathFile,name){
	try{
		fs.copyFileSync(pathFile,path.join(pathWork,name));
	} catch(e) {
		console.log(e)
		throw 'E99';
	}
}
function getDimension(imgwidth,imgheight,data,scaleWidth,scaleHeight){
	if(imgwidth <=scaleWidth && imgheight <= scaleHeight){
		data.position[0].width = imgwidth * 2;
		data.position[0].height = imgheight * 2;
		return;
	}

	let RatioImg = imgwidth/imgheight ;
	let ratioScale = scaleWidth/scaleHeight;
	if(RatioImg >= ratioScale){
		data.position[0].width = scaleWidth;
		data.position[0].height = scaleHeight * imgheight / imgwidth;
	}else{
		data.position[0].width = scaleWidth * imgwidth / imgheight;
		data.position[0].height = scaleHeight
	}
	data.position[0].width *= 2;
	data.position[0].height *= 2;
}

function getPositionCopy(pos = false){
	if(pos){
		let rotate = itemLoadPdf.page[(pageCurrent-1)].rotate,
			pageAlign = $('.divMain-'+itemLoadPdf.seqNo+'-page-'+(pageCurrent-1)+'-'+tabCurrent)[0].getAttribute('align'),
			w = pos.width,
			h = pos.height;
		if(pageAlign == "true"){
			switch(rotate){
				case 0:		
					pos.x = 0;
					pos.y = 0;
					break;
				case 90:
					pos.x = 0;
					pos.y = (itemLoadPdf.dataZoom.height*2 - h);
					break;
				case 180:
					pos.x = itemLoadPdf.dataZoom.width*2 - w;
					pos.y = itemLoadPdf.dataZoom.height*2 - h;
					break;
				case 270:
					pos.x = itemLoadPdf.dataZoom.width*2 - w;
					pos.y = 0;
					break;
			}
		}else{
			switch(rotate){
				case 0:		
					pos.x = 0;
					pos.y = 0;
					break;
				case 90:
					pos.x = 0;
					pos.y = (itemLoadPdf.dataZoomVer.height*2 - h);
					break;
				case 180:
					pos.x = itemLoadPdf.dataZoomVer.width*2 - w;
					pos.y = itemLoadPdf.dataZoomVer.height*2 - h;
					break;
				case 270:
					pos.x = itemLoadPdf.dataZoomVer.width*2 - w;
					pos.y = 0;
					break;
			}
		}
	}
}


function createNewPosImg(event,curr){
	return {
		x:(+event.target.getAttribute('data-x')),
		y:(+event.target.getAttribute('data-y')),
		width:(+(event.target.style.width.replace("px",""))),
		height:(+(event.target.style.height.replace("px",""))),
		disp:true
	}
}

function setOnOffDragResize(id,on){
	interact('#'+id).draggable(on);
	interact('#'+id).resizable(on);
}


function createElementTextBox(name,rotate,transfrom,textW,textH,position,top,left,value,color,fontS){
	let strRotate = ((rotate == 0 || rotate == 180) ? '' : rotate);
	return ('<div class="dot activeT dotTop'+strRotate+' top topp"></div>'
			+'<div class="dot activeT dotLeft'+strRotate+' left leftt"></div>'
			+'<div class="dot activeT dotBot'+strRotate+' bot bott"></div>'
			+'<div class="dot activeT dotRight'+strRotate+' right rightt"></div>'
			+'<div class="dot activeT dotTopRight'+strRotate+' topright top right"></div>'
			+'<div class="dot activeT dotTopLeft'+strRotate+' topleft top left"></div>'
			+'<div class="dot activeT dotBotRight'+strRotate+' botright bot right"></div>'
			+'<div class="dot activeT dotBotLeft'+strRotate+' botleft bot left"></div>'
			//drag
			+'<div class="dragElem dragElemTop"></div>'
			+'<div class="dragElem dragElemLeft"></div>'
			+'<div class="dragElem dragElemRight"></div>'
			+'<div class="dragElem dragElemBot"></div>'
			+'<textarea id="'+name+'Text" class="textAreaAddtext" '
			+'style="font-family :'+font+';color:'+color+';'
			+'font-size:'+(fontS)+'px;'
			+transfrom
			+textW
			+textH
			+position
			+top
			+left
			+'" rotate="'+rotate+'" >'+value+'</textarea>'
		);
}

function closeMessageSignStamp(){
    $('#errorInsideSignStamp').removeClass('active');
    $('#modal-messageSignStamp').text('')
	$('.yearFull').remove();
}

function clearHistoryRedo(){
	historyMainRedo = [];
	$('.fa-repeatCustom').removeClass('btn-disable').addClass('btn-disable');
	$('.fa-undoCustom').removeClass('btn-disable');
	clearShapeRedo();
}

// END UNDO REDO HISTORY (UNDO, REDO)
// ****************************************************************************************************************************************************************

function getIndex(item){
	for(let i = historyMain.length-1 ; i >= 0 ; i--){
		if(historyMain[i].data){
			if(historyMain[i].data.id == item.data.id){
				return i;
			}
		}
		
	}
	return -1;
}


// ****************************************************************************************************************************************************************
// ~FKVL : calc and wraptext on textfield 
function wrapText(context, text, x, y, lineHeight, maxWidth) {
	let words = text.split(/\r?\n/);
	let maxW = (maxWidth-2);
	for(var n = 0; n < words.length; n++) {
	  let testLine = words[n];
	  //compare real with of container contain text
	  if(context.measureText(testLine).width <= maxW){
		  	//fill text if oke
			context.fillText(testLine, x, y);
			y += lineHeight;
	  	}else{
			//calculate real width of each character and break line if > with of container
			let chars = testLine.split(' ');
			let linen2 = '';
			for(let n2 = 0 ; n2 < chars.length; n2++){
				if(context.measureText((linen2 + chars[n2])).width <= maxW){
					linen2+=chars[n2]+' ';
				}else if(context.measureText((chars[n2])).width <= maxW){
					context.fillText(linen2, x, y);
					y += lineHeight;
					linen2 = chars[n2];
				}else{
					for(var j = 0; j < chars[n2].length ; j++){
						let xx = linen2 + chars[n2].substring(j,j+1);
						if(context.measureText(xx).width <= maxW){
							linen2 += chars[n2].substring(j,j+1);
						}else{
						context.fillText(linen2, x, y);
						y += lineHeight;
						linen2 = chars[n2].substring(j,j+1);
						}
					}
					if(linen2 != ""){
						linen2 +=' ';
					}
				}
			}
			if(linen2 != ""){
				linen2 +=' ';
				context.fillText(linen2, x, y);
				y += lineHeight;
			}
		}
	}
}
