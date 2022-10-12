// ****************************************************************************************************************************************************************
// SCRIPT process loadfile pdf
function loadFilePdf(seqNo,button = false){
	let findPdf = listSelected.find(x=>x.seqNo == seqNo);
	let findTabItem = findTab(findPdf.pdfFileName,seqNo);
	if(findTabItem){
		if(!findTabItem.itemLoadPdf){
			$('.sub-tab[idtab="'+findTabItem.idtab+'"] .itemTab').click();
			return;
		}else{
			let change = (countEarser(true,findTabItem.idtab) > 0);
			if(change){
				doConfirm("LPWI0002",function (){
					$('.sub-tab[idtab="'+findTabItem.idtab+'"] .itemTab').click();
					$('#e-pdf'+findTabItem.idtab).html('');
					loadPdfProcess(seqNo,button,findTabItem.idtab);
				},findTabItem.idtab);
			}else{
				$('.sub-tab[idtab="'+findTabItem.idtab+'"] .itemTab').click();
			}
			
			return;
		}
	}
	cloneTab();
	let idTab = common.UUID();
	createNewPdfHtml(idTab);
	loadPdfProcess(seqNo,button,idTab);
}

function setLoadfilePdfLocal(){
	//3.「ファイルを開く」ボタンクリック
	$('#loadFileLocal').click(function(){
		if($('.drawingSearchContent.showPopup').length > 0){
			return;
		}
		ipcRenderer.send('openFile', 'pdf');
		if($('#panel-list-drawing').css("display") == "block") $('#tab-btn-01').click();
	});
	
	ipcRenderer.on('openPath',(event,data)=>{
		processPathFile(data)
    });
}


function processPathFile(data){
	if(data != null && data != ""){
		let reLoad = []
		for(let i = 0; i < data.length ;i++){
			let x = data[i].toString().split("\\");
			//clone current tab if exist in to allTabs;
			let findTabItem = findTab(x[x.length-1],null);
			if(findTabItem){
				if(!findTabItem.itemLoadPdf){
					$('.sub-tab[idtab="'+findTabItem.idtab+'"] .itemTab').click();
					continue;
				}else{
					checkChange(findTabItem.idtab);
					if(isChange) {
						reLoad.push({idtab : findTabItem.idtab, path : data[i]})
					}else{
						$('.sub-tab[idtab="'+findTabItem.idtab+'"] .itemTab').click();
						$('#e-pdf'+findTabItem.idtab).html('');
						loadFileFromPath(data[i],findTabItem.idtab);
					}
					continue;
				}
			}
			loadFileFromPath(data[i])
		}
		if(reLoad.length > 0){
			doConfirm("LPWI0002", ()=>{
				for(let i = 0 ; i < reLoad.length ;i++){
					$('.sub-tab[idtab="'+reLoad[i].idtab+'"] .itemTab').click();
					$('#e-pdf'+reLoad[i].idtab).html('');
					loadFileFromPath(reLoad[i].path,reLoad[i].idtab);
				}
			});
		}
	}
}
function loadFileFromPath(data,idtab = null){
	if(!idtab)cloneTab();
	let x = data.toString().split("\\");
	itemLoadPdf = {
		pdfFileName:x[x.length-1],
		pdfFilePath:pathWork,
		productCode:"",
		productName:x[x.length-1].replace(".pdf",""),
		seqNo:-1,
		serverName:"",
		updateDate:new Date(),
		scale:0.5,
		percent:100,
		pageAlign:{hoz:0,ver:0},
		page : [],
		pathSave : extractLoading ? "" : data.toString(),
		isMergeFile : extractLoading
	};
	
	//create id tab
	let idTab = (!idtab) ? common.UUID() : idtab;
	if(!idtab){
		createNewPdfHtml(idTab);
	}else{
		$('#percent'+idTab).text('100%');
	}
	indexFile = -1;
	setDefaultVariable();
	// $("#e-pdf").html('');
	$('.prodItem').removeClass('rowSelected');
	common.mkDirByPathSync(datalogin.templateFolder);
	loadPDFLocal(data.toString(),true,idTab,JSON.parse(JSON.stringify(itemLoadPdf))).subscribe(_=>{});
	pathSave = extractLoading ? "" : data.toString();
	$('#pathFile').html(pathSave.split("\\").join("/"));
	extractLoading = false;
	if($('#btn-tab-search').hasClass('active'))$('#btn-tab-search').click();
	$('#moveDown,#moveUp').attr('disabled','true');
}

function createNewPdfHtml(id){
	//create page container for contain pdf current
	let newPdfHtml = '<div id="export-div'+id+'" class="div-pdf">'
						+'<div id="e-pdf'+id+'">'
						+'</div>'
						+'<div class="percent" id="percent'+id+'">100%</div>'
					+'</div>';
	$('.div-pdf').addClass('off');
	$('.container-pdf').append(newPdfHtml);

	//create event scroll for findpage tabs;
	initScrollForExportDivMain(id);
}
// ****************************************************************************************************************************************************************
//process load file pdf
function loadPdfProcess(seqNo,button = false,idtab){
	let item = listSelected.find(x=>x.seqNo == seqNo);
	let index = listSelected.findIndex(x=>x.seqNo == seqNo);
	if(item){
		itemLoadPdf = JSON.parse(JSON.stringify(item));
		itemLoadPdf.scale = 0.5;
		itemLoadPdf.percent = 100;
		itemLoadPdf.pageAlign = {hoz:0,ver:0}
		itemLoadPdf.page = []
		indexFile = index;
		$('.prodItem').removeClass('rowSelected');
		$('.prodItem[value="'+itemLoadPdf.seqNo+'"]').addClass('rowSelected');
		let pathFile = path.join( datalogin.templateFolder,  item.pdfFileName);
		$('#pathFile').html('');
		pathSave = null;
		setDefaultVariable();
		// $("#e-pdf").html('');
		$('#moveDown,#moveUp').removeAttr('disabled');
		loadPDFLocal(pathFile,false,idtab,JSON.parse(JSON.stringify(itemLoadPdf)),seqNo).subscribe(_=>{});
		if(button) scrollLeftPanel();
	}	
}

// ****************************************************************************************************************************************************************
//convert page to canvas 
function showAllPages(isFileChose,idtab,itemLoadPdfClone,renewtab = false) {
	common.deleteFolderRecursive(path.join(pathMerge,idtab));
  	common.mkDirByPathSync(path.join(pathMerge,idtab));
	return new Observable(observer => {
		// $('#e-pdf'+idtab).css("width", "");
		itemLoadPdfClone["totalPages"] = __TOTAL_PAGES;
		signaPads = [];
		let fileIndex = itemLoadPdfClone.seqNo, pageNumber = 0;
		let detailMerge ={
			idtab,
			fileIndex,
			pageNumber,
			image : []
		};
		if(pageNumber >= __TOTAL_PAGES){
			common.showHideLoader(false);
		}
		for(let i = 0; i < __TOTAL_PAGES; i++){
			if(i == 0){
				divFile = document.createElement("div");
				divFile.setAttribute("id", "file-" +fileIndex+'-'+idtab);
				divFile.setAttribute("class", "e-pdf");
				$('#e-pdf'+idtab)[0].prepend(divFile);
			}
			__PDF_DOC.getPage(i+1).then((page) => {
				let scale = getScale(page.getViewport(1));
				let viewport1 = page.getViewport(scale);
				let viewport2 = page.getViewport(scale*2);
				let hoz = (viewport1.width > viewport1.height);
				if(hoz) {itemLoadPdfClone.pageAlign.hoz+=1} else {itemLoadPdfClone.pageAlign.ver+=1};
				itemLoadPdfClone.page.push({
					index:i,
					position:[],
					rotate:0,
					align:hoz,
					alignReal:hoz,
					pathFile:path.join(itemLoadPdf.pdfFilePath,itemLoadPdf.pdfFileName),
					fileName:itemLoadPdf.pdfFileName,
                    divMain:'divMain-'+fileIndex+ '-page-' + pageNumber+'-'+idtab,
                    divMainText:'divMainText-'+fileIndex+ '-page-' + pageNumber,
					pageNumber:i
				});
				createCanvas(fileIndex, pageNumber,hoz,idtab);
				let __CANVAS = $("."+idtab+"-file-" +fileIndex+ "-pdf"+pageNumber).get(0);
				__CANVASMain = $("."+idtab+"-file-" +fileIndex+ "-main"+pageNumber).get(0);
				__CANVASDRAF = $("."+idtab+"-file-" +fileIndex+ "-draft"+pageNumber).get(0);
				__CANVAS_CTX = __CANVAS.getContext('2d');

				if(i == 0){
					getDataZoom(viewport1,hoz,idtab,itemLoadPdfClone);
				}
				$("."+idtab+"-file-" +fileIndex+ "-page-" + pageNumber).height(viewport1.height + 20);
				$('.divMain-'+fileIndex+ '-page-' + pageNumber+'-'+idtab).css({'width':(viewport1.width * 2)+'px','height':(viewport1.height * 2)+'px'});
				// $('.divMainText-'+fileIndex+ '-page-' + pageNumber+'').css({'width':(viewport1.width * 2)+'px','height':(viewport1.height * 2)+'px'});
				let renderContext = {
					canvasContext: __CANVAS_CTX,
					viewport:  viewport2
				};
	
				$(__CANVAS).attr({
					width: viewport1.width * 2,
					height: viewport1.height * 2
				});
				$(__CANVASMain).attr({
					width: viewport1.width * 2,
					height: viewport1.height * 2
				});
	
				$(__CANVASDRAF).attr({
					width: viewport1.width * 2,
					height: viewport1.height * 2
				});
	
				// page.render(renderContext);
				let renderImg = page.render(renderContext);
				let idImg = common.UUID();
                let nameImg = idImg+'.png';
                let pathImg = path.join(pathMerge,idtab,nameImg);
				let width = viewport1.height > viewport1.width ? 184 : 260
                let height = viewport1.height > viewport1.width ? 260 : 184
				detailMerge.image.push(
                    {
                        idImg,
                        nameImg,
                        index : i,
                        pathImg,
                        width,
                        height,
						pageNumber,
						pathFile : path.join(itemLoadPdf.pdfFilePath,itemLoadPdf.pdfFileName),
                        fileName : itemLoadPdfClone.pdfFileName,
						rotate:0
                    }
                )
				renderImg.promise.then( async ()=> {
                    fs.writeFileSync(pathImg, __CANVAS.toDataURL("image/png").replace(/^data:image\/png;base64,/, ""), 'base64');
                });
				let fkpaint = new FKPaint(
					__CANVASDRAF, 
					__CANVASMain,
					{
						penColor : colorSelected,
						dotSize: dotSize
					},
					pageNumber,
					setHistoryUndo,
					clearHistoryRedo,
					pageEraserData,
					zoomFileCallBack,
					scrollFileCallBack,
					zoomFileMouseCallBack,
					callbackTextStart,
					callbackText,
					callbackTextEnd,
					0.7,
					callbackMouseEvent,
					drawShape
				);
				signaPads.push(fkpaint);
				pageNumber++;
				if(pageNumber >= __TOTAL_PAGES){
					__PDF_DOC = null;
					
					if(__TOTAL_PAGES > 1) $('#currentPage').removeAttr('disabled');
					// if(flagClick && !isFileChose)$('#tab-btn-01').click();
					common.showHideLoader(false);
					$('#saveFileLocal,#saveFileOveride').removeAttr('disabled');
					$('#btn-change-size-tb,#btn-change-color-tb').removeClass('poiterNone');
					$('#e-pdf'+idtab).css("width", ((screen.width-8) +'px'));
					$('.allToolbar').scrollLeft(0);
					$('#line-size-change').css('left','');
					$('#color-change').css('left','');
					$('.rotateLeft ,.rotateRight').removeClass('btn-disable2');
					$('#setSize').removeAttr('disabled');
					itemLoadPdfClone.detailMerge = detailMerge;
					itemLoadPdfClone.idtab = idtab;
					let data = {
						idtab,
						itemLoadPdf:itemLoadPdfClone,
						signaPads,
						textOnBoard:[],
						imgOnBoard:[],
						historyMain:[],
						__TOTAL_PAGES,
						pageCurrent,
						currentZoom
					};
					itemLoadPdf = itemLoadPdfClone;
					if($('.sub-tab[idtab="'+idtab+'"]').length>0){
						for(let i = 0; i < allTabs.length ; i++){
							if(allTabs[i].idtab == idtab){
								allTabs[i] = data;
							}
						}
						
					}else{
						allTabs.push(data);
						createTabsLabel(idtab,itemLoadPdfClone);
					}
					setPaint(false, true , true);
					setFont(false);
					observer.next();
					observer.complete();
				}
			});
		}
	});
	
}

function createTabsLabel(idtab,itemLoadPdfClone){
	$('.sub-tab').removeClass('active');
	let htmlTab = '<div class="sub-tab active"  idtab="'+idtab+'"><span class="itemTab" idtab="'+idtab+'" title="'+itemLoadPdfClone.pdfFileName+'">'+itemLoadPdfClone.pdfFileName+'</span><i class="fa fa-times closeTab" aria-hidden="true"></i></div>';
	$('.tabs').append(htmlTab);
	tabCurrent = idtab;
	$('.panel-search,.containter-tabs').removeClass('on').addClass('on');
	$('.tabs').scrollLeft($('.sub-tab.active')[0].offsetLeft);
}

function getDataZoom(viewport1,hoz,idtab,item){
	if(hoz) {
		item.dataZoom = {
			width:viewport1.width,
			widthContainer:(viewport1.width),
			widthContainerOld:(viewport1.width),
			heightContainer:(viewport1.height+20),
			heightContainerOld:(viewport1.height+20),
			height:viewport1.height,
			percentWidth:(((viewport1.width*2)*0.51)-viewport1.width),
			percentHeight:(((viewport1.height*2)*0.51)-viewport1.height),
			scale:0.5,
			// top:20,
			screen:window.innerWidth,
			parentHeight:$('#export-div'+idtab)[0].offsetHeight,
			offsetX:0,
			offsetY:0,
			percent : 100,
			pointCenter : null,
			widthWin : $(window).width()
		}

		item.dataZoomVer = {
			width:viewport1.height,
			widthContainer:(viewport1.height),
			widthContainerOld:(viewport1.height),
			heightContainer:(viewport1.width+20),
			heightContainerOld:(viewport1.width+20),
			height:viewport1.width,
			percentWidth:(((viewport1.height*2)*0.51)-viewport1.height),
			percentHeight:(((viewport1.width*2)*0.51)-viewport1.width),
			scale:0.5,
			// top:20,
			screen:window.innerWidth,
			parentHeight:$('#export-div'+idtab)[0].offsetHeight,
			offsetX:0,
			offsetY:0,
			percent : 100,
			pointCenter : null,
			widthWin : $(window).width()
		}
	} else {
		item.dataZoomVer = {
			width:viewport1.width,
			widthContainer:(viewport1.width),
			widthContainerOld:(viewport1.width),
			heightContainer:(viewport1.height+20),
			heightContainerOld:(viewport1.height+20),
			height:viewport1.height,
			percentWidth:(((viewport1.width*2)*0.51)-viewport1.width),
			percentHeight:(((viewport1.height*2)*0.51)-viewport1.height),
			scale:0.5,
			// top:20,
			screen:window.innerWidth,
			parentHeight:$('#export-div'+idtab)[0].offsetHeight,
			offsetX:0,
			offsetY:0,
			percent : 100,
			pointCenter : null,
			widthWin : $(window).width()
		}

		item.dataZoom = {
			width:viewport1.height,
			widthContainer:(viewport1.height),
			widthContainerOld:(viewport1.height),
			heightContainer:(viewport1.width+20),
			heightContainerOld:(viewport1.width+20),
			height:viewport1.width,
			percentWidth:(((viewport1.height*2)*0.51)-viewport1.height),
			percentHeight:(((viewport1.width*2)*0.51)-viewport1.width),
			scale:0.5,
			// top:20,
			screen:window.innerWidth,
			parentHeight:$('#export-div'+idtab)[0].offsetHeight,
			offsetX:0,
			offsetY:0,
			percent : 100,
			pointCenter : null,
			widthWin : $(window).width()
		}
	}
}



// ****************************************************************************************************************************************************************
//load file pdf
function loadPDFLocal(filePath, isFileChose = false,idtab,itemLoadPdfClone,seqNo = null){
	return new Observable(observer => {
		common.showHideLoader(true);
		canPaint = false;canEraser = false;
		$('.fa-paint-brush,.fa-eraser').removeClass('btn-disable').addClass('btn-disable');
		$('#pennew').attr('src','../img/marker.png');
		__TOTAL_PAGES = 0;
		if(!fs.existsSync(filePath)) {
			createTabsLabel(idtab,itemLoadPdfClone);
			$("#e-pdf"+idtab).html('<div class="notItem">'+common.getMessageWithErrorCode("LPWI0007",message)+'</div>');
			common.showHideLoader(false);
			itemLoadPdf = null;
			allTabs.push({idtab,seqNo});
			setPaint(false, false);
			setFont(false);
			focusOnBlankTab = true;
			$('.tabs').scrollLeft($('.sub-tab.active')[0].offsetLeft);
			;
			return;
		}

		copyToWorkFolder(filePath,itemLoadPdf.pdfFileName);

		itemLoadPdf.pdfFilePath = pathWork;
		let data = fs.readFileSync(filePath).toString('base64');
		data = "data:application/pdf;base64," + data;
		pdfjs.getDocument(data).then(function (pdf_doc) {
			__PDF_DOC = pdf_doc;
			__TOTAL_PAGES = __PDF_DOC.numPages;
			pageCurrent = 1;
			$("#page-number").text(__PDF_DOC.numPages);
			$('#currentPage').val(pageCurrent);

			showAllPages(isFileChose,idtab,itemLoadPdfClone).subscribe(_=>{
				observer.complete();
			});
		}).catch( (error) =>{
			common.showHideLoader(false);
			common.showErrMessage(common.getMessageWithErrorCode("E99",message),null);
			observer.complete();
		});
	});
}

// ****************************************************************************************************************************************************************
//create page canvas
function createCanvas(fileIndex, pageIndex,hoz,idtab){
	let div = document.createElement("div"),
		divMain = document.createElement("div"),
		pdf = document.createElement("canvas"), 
		cvd = document.createElement("canvas"), 
		cv = document.createElement("canvas");
		divText = document.createElement("div");
	divMain.appendChild(pdf); 
	divMain.appendChild(cv); 
	divMain.appendChild(cvd); 
	div.appendChild(divMain);
	div.appendChild(divText);
	setAttributes(div, 
		{
			"id":idtab+"-file-" +fileIndex+ "-page-" + pageIndex,
			"class":`col-sm-12 col-xs-12 col-lg-12 custom-col sandwich none-padding ${idtab}-file-${fileIndex}-page-${pageIndex} lpwScroll-${(hoz ? 'hoz' : 'ver')}`
		})
	setAttributes(pdf, 
		{
			"id":idtab+"-file-" +fileIndex+ "-pdf"+ pageIndex,
			"class":`updateZoom ${idtab}-file-${fileIndex}-pdf${pageIndex}`
		}
	);

	setAttributes(cv, 
		{
			"id":idtab+"-file-" +fileIndex+ "-main"+ pageIndex,
			"class":`updateZoom ${idtab}-file-${fileIndex}-main${pageIndex} zindx1`
		}
	);

	setAttributes(cvd, 
		{
			"id":idtab+"-file-" +fileIndex+ "-draft"+ pageIndex,
			"class":`updateZoom ${idtab}-file-${fileIndex}-draft${pageIndex} zindx2`
		}
	);

	setAttributes(divText, 
		{
			"id":idtab+"-text-" +fileIndex+'-'+pageIndex,
			"class":'divMain divMainText-'+fileIndex+ '-page-' + pageIndex+' available paint lpwScroll-item zindx1 lpwScroll-item-'+ (hoz ? 'hoz' : 'ver')
		}
	);
	
	setAttributes(divMain,
		{
			"class":`divPage divMain divMain-${fileIndex}-page-${pageIndex}-${idtab} available paint lpwScroll-item zindx2 lpwScroll-item-${(hoz ? 'hoz' : 'ver')}`,
			"align":hoz,
			"scale":itemLoadPdf.scale,
			"rotate":0,
			"tab":idtab
		}
	);
	$("#file-" +fileIndex+'-'+idtab).append(div);
}

function renderImgMain(){
	let count = 0;
	for(let i = 0; i < itemLoadPdf.detailMerge.image.length ; i++){
		if(fs.existsSync(itemLoadPdf.detailMerge.image[i].pathImg)){
			count += 1;
		}
		
	}
	if(count == itemLoadPdf.detailMerge.image.length){
		for(let i = 0; i < itemLoadPdf.detailMerge.image.length ; i++){
			let x = itemLoadPdf.detailMerge.image[i];
			let classDiv = `.divMain-${itemLoadPdf.detailMerge.fileIndex}-page-${x.pageNumber}-${itemLoadPdf.detailMerge.idtab}`
			let path = x.pathImg.replace(/\//g, "")
			$(classDiv).append(`<img src="${path}" class="updateZoom"/>`)
		}
	}else{
		setTimeout(_=>{renderImgMain()},200)
		
	}
}

