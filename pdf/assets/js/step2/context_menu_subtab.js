

// document.onclick = hideMenu; 
// document.oncontextmenu = rightClick; 

// function hideMenu(e) { 
//     document.getElementById("contextMenu") .style.display = "none" 
// } 

// function rightClick(e) { 
//     e.preventDefault(); 
//     hideMenu(); 
//     if(["itemTab",'sub-tab'].indexOf(e.target.className) > -1){
//         var menu = document.getElementById("contextMenu")    
//         let idtab = e.target.getAttribute('idtab') ;
//         allTabs.map((x)=>{
//             if(x.idtab == idtab && !x.itemLoadPdf.isMergeFile){
//                 menu.style.display = 'block'; 
//                 menu.style.left = e.pageX + "px"; 
//                 menu.style.top = e.pageY + "px"; 
//                 currentFileMerge = x
//             }
//         });
//     }
// } 

function loadingExtract(){
    if($('#tab-btn-01').hasClass('active')){
        $('#tab-btn-01').click();
    }
    
    if(itemLoadPdf){
        openMergePdf(itemLoadPdf);
        $('.btnMapControll').removeAttr('disabled');
    }else{
        $('#mergePDFcontainer').addClass('active');
        setPaint(false,false);
        setFont(false);
        $('.miniMapTab #loaderMerge').css('display', 'none');
        $('.btnMapControll').attr('disabled',true);
    }
    $('#mergePDFcontainer').css('top',(allTabs.length == 0) ? '85px' : '');
    $('#mergePDFcontainer').css('height',(allTabs.length == 0) ? 'calc(100% - 85px)' : '');

}

function openMergePdf(pdfJson = null){
    isMiniMapOpen = true;
    // let param = {
    //     top : $('.containter-tabs')[0].clientHeight + $('#tool-bar-top-bottom')[0].clientHeight + $('.headerPWA')[0].clientHeight,
    //     height : $('.container-pdf')[0].clientHeight,
    //     item : currentFileMerge
    // }
    $('#overlayHidenMain').css('display','block');
    $('#mergePDFcontainer').addClass('active');
    setPaint(false,false);
    setFont(false);
    renderImg(pdfJson || itemLoadPdf);
    // ipcRenderer.send('openMergePdf', param); 

}
// END SCRIPT process loadfile pdf
// ****************************************************************************************************************************************************************

ipcRenderer.on('appendFile',(event,params)=>{
    loadFileAppend(params);
});

ipcRenderer.on('dowloadMergePage',(event,params)=>{
	$('#downloadModal').removeClass('closeModal');
    $('#download-percent').css("width", "1%");
    $('#percentDownload').text("1%");
    let key = params.split(";");
    let pathSave = path.join(pathMerge,key[1])
    downloadPdfAfterUpload(datalogin.url +"/v1/api/download-pdf?downloadToken="+key[0], pathSave);
    
});

function loadFileAppend(params){
    common.showHideLoader(true);
	let data = fs.readFileSync(params.path).toString('base64');
    data = "data:application/pdf;base64," + data;
    let idtab = itemLoadPdf.idtab;
    let fileIndex = itemLoadPdf.seqNo;
    // console.log(itemLoadPdf,allTabs);
    let newSignaPads = [];
    pageNew = [];
    // common.mkDirByPathSync(savePath);
    newImage = [];+
    pdfjs.getDocument(data).then((pdf_doc) => {
        let sizePage = pdf_doc.numPages;
        for(let i = 1; i <= sizePage; i++){
            pdf_doc.getPage(i).then((page) => {
                let scale = getScale(page.getViewport(1));
				let viewport1 = page.getViewport(scale);
				let viewport2 = page.getViewport(scale*2);
				let hoz = (viewport1.width > viewport1.height);
                let indexPre = itemLoadPdf.page.length+i
                appendCanvas(fileIndex, indexPre ,hoz,idtab,params);
                let __CANVAS = $("#"+idtab+"-file-" +fileIndex+ "-pdf"+indexPre).get(0);
                __CANVASMain = $("."+idtab+"-file-" +fileIndex+ "-main"+indexPre).get(0);
				__CANVASDRAF = $("."+idtab+"-file-" +fileIndex+ "-draft"+indexPre).get(0);
				__CANVAS_CTX = __CANVAS.getContext('2d');
                
				$("#"+idtab+"-file-" +fileIndex+ "-page-" + indexPre).height(viewport1.height + 20);
				$('.divMain-'+fileIndex+ '-page-' + indexPre +'-'+idtab).css({'width':(viewport1.width * 2)+'px','height':(viewport1.height * 2)+'px'});
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
	
                let fkpaint = new FKPaint(
					__CANVASDRAF, 
					__CANVASMain,
					{
						penColor : colorSelected,
						dotSize: dotSize
					},
					i,
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
                fkpaint.setCanPaint(false);
				newSignaPads.push(fkpaint);
                
                pageNew.push({
					index:indexPre,
					position:[],
					rotate:0,
					align:hoz,
					alignReal:hoz,
                    pathFile:params.path,
                    fileName:params.name,
                    divMain:'divMain-'+fileIndex+ '-page-' +indexPre+'-'+idtab,
                    divMainText:'divMainText-'+fileIndex+ '-page-'+indexPre,
					pageNumber:i-1,
                    isJoinPage : true
				});
                 
				// page.render(renderContext);
				let renderImg = page.render(renderContext);
                let idImg = common.UUID();
                let nameImg = idImg+'.png';
                let pathImg = path.join(pathMerge,idtab,nameImg);
				let width = viewport1.height > viewport1.width ? 184 : 260
                let height = viewport1.height > viewport1.width ? 260 : 184
                newImage.push(
                    {
                        idImg,
                        nameImg,
                        index : i-1,
                        pathImg,
                        width,
                        height,
                        pageNumber : i-1,
                        pathFile : params.path,
                        fileName : params.name,
                        rotate:0
                    }
                )
                renderImg.promise.then( async ()=> {
                    fs.writeFileSync(pathImg, __CANVAS.toDataURL("image/png").replace(/^data:image\/png;base64,/, ""), 'base64');
                });
                if(i == sizePage){
                    mergControllPanel(params,idtab,params.indexAppend,pageNew,newSignaPads,newImage);
                }
            });
           
        }
    }).catch( (error) =>{
        common.showHideLoader(false);
    });
}

function appendCanvas(fileIndex, pageIndex,hoz,idtab,params){
    let isBlank = (itemLoadPdf.page == null || itemLoadPdf.page.length == 0)
    let idAppend = isBlank ? `file-${fileIndex}-${idtab}` : `${idtab}-file-${fileIndex}-page-${params.indexAppend}`;
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
            "class":"col-sm-12 col-xs-12 col-lg-12 custom-col sandwich none-padding lpwScroll-"+ (hoz ? 'hoz' : 'ver'),
            
        }
    );

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
    if(isBlank){
        document.getElementById(idAppend).append(div);
    }else{
        document.getElementById(idAppend).insertAdjacentElement(params.methodAppend,div);
    }

}

function mergControllPanel(params,idtab,indexAppend,pageNew,newSignaPads,newImage){
    setTimeout(_=>{
        allTabs.map(x=>{
            if(x.idtab == idtab){
                x.itemLoadPdf.joinFile = true;
                if(params.methodAppend == 'afterend'){
                    x.signaPads.push(...newSignaPads);
                    x.itemLoadPdf.page.push(...pageNew);
                    x.itemLoadPdf.detailMerge.image.push(...newImage);
                }else{
                    x.signaPads.splice(indexAppend,0,...newSignaPads);
                    x.itemLoadPdf.page.splice(indexAppend,0,...pageNew);
                    x.itemLoadPdf.detailMerge.image.splice(indexAppend,0,...newImage);
                }
                updateClassJoin()
            }
        });

        zoomContent().subscribe(_=>{renderDropPdfMap(newImage,dropElement);});
        common.showHideLoader(false);
    },000)
    
}


function FKPrepareRemovePage(listIndex){
    setTimeout(_=>{
        if(listIndex){
            allTabs.map(x=>{
                if(x.idtab == itemLoadPdf.idtab){
                    x.itemLoadPdf.joinFile = true;
                    let countRM = 0;
                    for(let i = 0;i < listIndex.length;i++){
                        let idexRM = listIndex[i]-countRM;
                        countRM+=1;
                        x.itemLoadPdf.page.splice(idexRM,1);
                        x.itemLoadPdf.detailMerge.image.splice(idexRM,1);
                        x.signaPads.splice(idexRM,1);
                        $(`#${x.idtab}-file-${x.itemLoadPdf.seqNo}-page-${listIndex[i]}`).remove();
                        
                    }
                    updateClassJoin()
                }
            });
            
            $('.mapPdf1 .columnMerge .imagePage1.active').parent().remove();
            $('.mapPdf1 .columnMerge').map((index,x)=>{
                x.setAttribute('index',index)
            });
            $('.mapPdf1 .columnMerge[last="true"]').removeClass('blankPage')
            if($('.mapPdf1 .columnMerge').length == 1){
                $('.mapPdf1 .columnMerge[last="true"]').addClass('blankPage')
            }
        }
    },000)
    
}

function updateClassJoin(){
    for(let i = 0; i < itemLoadPdf.page.length ; i++){
        if(i != itemLoadPdf.page[i].index){
            updateChildren(i);
        }
    }
    let pageHtml = $(`#file-${itemLoadPdf.seqNo}-${itemLoadPdf.idtab}`).children()
    if(pageHtml != null){
        for(let i = 0; i < pageHtml.length ; i++){
            if(i != itemLoadPdf.page[i].index){
                pageHtml[i].setAttribute('id',`${itemLoadPdf.idtab}-file-${itemLoadPdf.seqNo}-page-${i}`);
                itemLoadPdf.page[i].index = i;
                itemLoadPdf.detailMerge.image[i].index = i;
                signaPads[i].setFKPageNumber(i);
                signaPads[i].updateCanvas(
                    $(`#${itemLoadPdf.idtab}-file-${itemLoadPdf.seqNo}-draft${i}`)[0],
                    $(`#${itemLoadPdf.idtab}-file-${itemLoadPdf.seqNo}-main${i}`)[0]
                )
            }
        }
    }
}

function updateChildren(idx){
    let oldInex = itemLoadPdf.page[idx].index;
    let id = `${itemLoadPdf.idtab}-file-${itemLoadPdf.seqNo}-page-${oldInex}`;
    let items = $(`#${id}`).children();
    if(items && items.children.length > 0){
        for( let i = 0 ; i < items.length ; i++){
            let classList = items[i].classList.value;
            if(classList.indexOf("divMain-") > -1){
                items[i].classList.remove(`divMain-${itemLoadPdf.seqNo}-page-${oldInex}-${itemLoadPdf.idtab}`);
                items[i].classList.add(`divMain-${itemLoadPdf.seqNo}-page-${idx}-${itemLoadPdf.idtab}`);
                let childCanvas = items[i].children;
                if(childCanvas){
                    for( let j = 0 ; j < childCanvas.length ; j++){
                        let classListCanvas = childCanvas[j].classList.value;
                        if(classListCanvas.indexOf("-pdf") > -1){
                            childCanvas[j].classList.remove(`${itemLoadPdf.idtab}-file-${itemLoadPdf.seqNo}-pdf${oldInex}`);
                            childCanvas[j].classList.add(`${itemLoadPdf.idtab}-file-${itemLoadPdf.seqNo}-pdf${idx}`);
                            childCanvas[j].setAttribute('id',`${itemLoadPdf.idtab}-file-${itemLoadPdf.seqNo}-pdf${idx}`);
                        }
                        if(classListCanvas.indexOf("-main") > -1){
                            childCanvas[j].classList.remove(`${itemLoadPdf.idtab}-file-${itemLoadPdf.seqNo}-main${oldInex}`);
                            childCanvas[j].classList.add(`${itemLoadPdf.idtab}-file-${itemLoadPdf.seqNo}-main${idx}`);
                            childCanvas[j].setAttribute('id',`${itemLoadPdf.idtab}-file-${itemLoadPdf.seqNo}-main${idx}`);
                        }
                        if(classListCanvas.indexOf("-draft") > -1){
                            childCanvas[j].classList.remove(`${itemLoadPdf.idtab}-file-${itemLoadPdf.seqNo}-draft${oldInex}`);
                            childCanvas[j].classList.add(`${itemLoadPdf.idtab}-file-${itemLoadPdf.seqNo}-draft${idx}`);
                            childCanvas[j].setAttribute('id',`${itemLoadPdf.idtab}-file-${itemLoadPdf.seqNo}-draft${idx}`);
                        }
                    }
                }
            }
            if(classList.indexOf("divMainText-") > -1){
                items[i].classList.remove(`divMainText-${itemLoadPdf.seqNo}-page-${oldInex}`);
                items[i].classList.add(`divMainText-${itemLoadPdf.seqNo}-page-${idx}`);
                items[i].setAttribute('id',`${itemLoadPdf.idtab}-text-${itemLoadPdf.seqNo}-${idx}`);
            }          
        }
    }
}