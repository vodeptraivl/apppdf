
//rotate start value ~ FKVL
function setRotate(){
    $('.rotateLeft').on('click',e => {
        if($('#mergePDFcontainer').hasClass('active') && $('.mapPdf1 .imagePage1.active').length == 0){
            return;
        }
        if(itemLoadPdf.page == null || itemLoadPdf.page.length == 0){
            return;
        }
        rotateLeft();
    });
    $('.rotateRight').on('click',e => {
        if($('#mergePDFcontainer').hasClass('active') && $('.mapPdf1 .imagePage1.active').length == 0){
            return;
        }
        
        if(itemLoadPdf.page == null || itemLoadPdf.page.length == 0){
            return;
        }
        rotateRight();
    });
}

function rotateLeft(){
    $('.fa-undoCustom').removeClass('btn-disable');
        if(isRotate){
            if($('.mapPdf1 .imagePage1.active').length > 0){
                let idRotate = common.UUID();
                let pageRotate = $('.mapPdf1 .imagePage1.active');
                for(let i = 0 ; i < pageRotate.length ; i++){
                    RotateValue(true,false,pageRotate[i].parentElement.getAttribute('index'),id = idRotate);
                    RotatePage(pageRotate[i].parentElement.getAttribute('index'));
                    rotateFKMapPage(page = pageRotate[i],true);
                }
                return;
            }
        }
        if(itemLoadPdf)
        {
            RotateValue(true);
            RotatePage();
            if(isRotate) rotateFKMapPage($('.mapPdf1 .imagePage1')[(pageCurrent-1)],true);
        }
}

function rotateRight(){
    $('.fa-undoCustom').removeClass('btn-disable');
    if(isRotate){
        
        if($('.mapPdf1 .imagePage1.active').length > 0){
            let idRotate = common.UUID();
            let pageRotate = $('.mapPdf1 .imagePage1.active');
            for(let i = 0 ; i < pageRotate.length ; i++){
                RotateValue(false,false,pageRotate[i].parentElement.getAttribute('index'),id = idRotate);
                RotatePage(pageRotate[i].parentElement.getAttribute('index'));
                rotateFKMapPage(pageRotate[i],false);
            }
            return;
        }
    }
    if(itemLoadPdf)
    {
        RotateValue(false);
        RotatePage();
        if(isRotate) rotateFKMapPage($('.mapPdf1 .imagePage1')[(pageCurrent-1)],false);
    }
}

//find rotate value ~ FKVL
function RotateValue(left,emulator = false,pages = false,id=null){
    removeShapeSltor()
    $('.stampProdCon').removeClass('active');
    let pageRotate = pages ? pages : (pageCurrent-1),
        rotate = itemLoadPdf.page[pageRotate].rotate;
    let history = {type:'rotate',page:pageRotate, data : 90, status:left ? 'left' : 'right'}
    if(id) history['FKMulti'] = id;
    if(!emulator) {
        historyMain.push(history);
        clearHistoryRedo();
    }
    if(left){
        if(rotate == 0){
            itemLoadPdf.page[pageRotate].rotate = 270;
        }else{
            itemLoadPdf.page[pageRotate].rotate -= 90;
        }
    }else{
        if(rotate == 270){
            itemLoadPdf.page[pageRotate].rotate = 0;
        }else{
            itemLoadPdf.page[pageRotate].rotate += 90;
        }
    }
    
}

//roatate current page ~ FKVL
function RotatePage(pages = false){
    let pageRotate = pages ? pages :  (pageCurrent-1);
    let rotate = itemLoadPdf.page[pageRotate].rotate;
    let target = $('.divMain-'+itemLoadPdf.seqNo+'-page-'+pageRotate+'-'+tabCurrent)[0];
    target.setAttribute('rotate',rotate)
    let hoz = target.getAttribute('align');
    target.style.webkitTransform = target.style.transform = 'translate(-50%,-50%) scale('+itemLoadPdf.scale+') rotate('+rotate+'deg)'
    if(hoz == 'true'){
        if(rotate == 90 || rotate == 270 ){
            $('#'+tabCurrent+'-file-'+itemLoadPdf.seqNo+'-page-'+pageRotate).css('height',(itemLoadPdf.dataZoom.widthContainer+20)+'px');
        }else{
            $('#'+tabCurrent+'-file-'+itemLoadPdf.seqNo+'-page-'+pageRotate).css('height',(itemLoadPdf.dataZoom.heightContainer)+'px');
        }
    }else{
        if(rotate == 90 || rotate == 270 ){
            $('#'+tabCurrent+'-file-'+itemLoadPdf.seqNo+'-page-'+pageRotate).css('height',(itemLoadPdf.dataZoomVer.widthContainer+20)+'px');
        }else{
            $('#'+tabCurrent+'-file-'+itemLoadPdf.seqNo+'-page-'+pageRotate).css('height',(itemLoadPdf.dataZoomVer.heightContainer)+'px');
        }
    }
    $('.divMain-'+itemLoadPdf.seqNo+'-page-'+pageRotate+'-'+tabCurrent+' .font-container').attr('rotateReal',rotate);
    $('.divMain-'+itemLoadPdf.seqNo+'-page-'+pageRotate+'-'+tabCurrent+' .imgContainer').attr('rotateReal',rotate);
    calcWidthHeightContainer();
    removeClassDot(rotate,pageRotate);
    
}

//calculate with and height off container containt page rotate ~ FKVL
function calcWidthHeightContainer(){
    calcPageHozVer().subscribe(dataAlign =>{
        //calculate with container of page current rotate ~FKVL
        let width = (itemLoadPdf.dataZoom) ? (itemLoadPdf.dataZoom.widthContainer) : (itemLoadPdf.dataZoomVer.widthContainer);
        //calculate height container of page current rotate ~FKVL
        let height = (itemLoadPdf.dataZoom) ? (itemLoadPdf.dataZoom.heightContainer) : (itemLoadPdf.dataZoomVer.heightContainer);
        if(dataAlign.hoz > 0 ){
            $('#e-pdf'+tabCurrent).css({'width':(width > screen.width)?((width+20)+'px') : (screen.width - 8)+'px'});
            
        }else{
            $('#e-pdf'+tabCurrent).css({'width':(height > screen.width)?((height+20)+'px') : (screen.width - 8)+'px'});
        }
    });
}

//calculate with and height off container containt page rotate ~ FKVL
function calcPageHozVer(){
    return new Observable(observer => {
        let hoz = 0,ver = 0;
        itemLoadPdf.page.map(x=>{
            if(x.align){
                if(x.rotate == 90 || x.rotate == 270 ){
                    ver += 1; x.alignReal = false;
                }else{
                    hoz +=1; x.alignReal = true;
                }
            }else{
                if(x.rotate == 90 || x.rotate == 270 ){
                    hoz +=1; x.alignReal = true;
                }else{
                    ver += 1; x.alignReal = false;
                }
            }
        });
        itemLoadPdf.pageAlign.hoz = hoz;
        itemLoadPdf.pageAlign.ver = ver;
        observer.next({hoz,ver});
        observer.complete();
    });
}

//set controll of text and img in page current rotate
function removeClassDot(rotate,pages){
    $('.divMain-'+itemLoadPdf.seqNo+'-page-'+pages+'-'+tabCurrent+' .font-container .topp').removeClass('dotTop dotTop90 dotTop270').addClass('dotTop'+((rotate == 0 || rotate == 180) ? '' : rotate));
    $('.divMain-'+itemLoadPdf.seqNo+'-page-'+pages+'-'+tabCurrent+' .font-container .leftt').removeClass('dotLeft dotLeft90 dotLeft270').addClass('dotLeft'+((rotate == 0 || rotate == 180) ? '' : rotate));
    $('.divMain-'+itemLoadPdf.seqNo+'-page-'+pages+'-'+tabCurrent+' .font-container .rightt').removeClass('dotRight dotRight90 dotRight270').addClass('dotRight'+((rotate == 0 || rotate == 180) ? '' : rotate));
    $('.divMain-'+itemLoadPdf.seqNo+'-page-'+pages+'-'+tabCurrent+' .font-container .bott').removeClass('dotBot dotBot90 dotBot270').addClass('dotBot'+((rotate == 0 || rotate == 180) ? '' : rotate));
    $('.divMain-'+itemLoadPdf.seqNo+'-page-'+pages+'-'+tabCurrent+' .font-container .topright').removeClass('dotTopRight dotTopRight90 dotTopRight270').addClass('dotTopRight'+((rotate == 0 || rotate == 180) ? '' : rotate));
    $('.divMain-'+itemLoadPdf.seqNo+'-page-'+pages+'-'+tabCurrent+' .font-container .topleft').removeClass('dotTopLeft dotTopLeft90 dotTopLeft270').addClass('dotTopLeft'+((rotate == 0 || rotate == 180) ? '' : rotate));
    $('.divMain-'+itemLoadPdf.seqNo+'-page-'+pages+'-'+tabCurrent+' .font-container .botleft').removeClass('dotBotLeft dotBotLeft90 dotBotLeft270').addClass('dotBotLeft'+((rotate == 0 || rotate == 180) ? '' : rotate));
    $('.divMain-'+itemLoadPdf.seqNo+'-page-'+pages+'-'+tabCurrent+' .font-container .botright').removeClass('dotBotRight dotBotRight90 dotBotRight270').addClass('dotBotRight'+((rotate == 0 || rotate == 180) ? '' : rotate));
    
    $('.divMain-'+itemLoadPdf.seqNo+'-page-'+pages+'-'+tabCurrent+' .imgContainer .topp').removeClass('dotTop dotTop90 dotTop270').addClass('dotTop'+((rotate == 0 || rotate == 180) ? '' : rotate));
    $('.divMain-'+itemLoadPdf.seqNo+'-page-'+pages+'-'+tabCurrent+' .imgContainer .leftt').removeClass('dotLeft dotLeft90 dotLeft270').addClass('dotLeft'+((rotate == 0 || rotate == 180) ? '' : rotate));
    $('.divMain-'+itemLoadPdf.seqNo+'-page-'+pages+'-'+tabCurrent+' .imgContainer .rightt').removeClass('dotRight dotRight90 dotRight270').addClass('dotRight'+((rotate == 0 || rotate == 180) ? '' : rotate));
    $('.divMain-'+itemLoadPdf.seqNo+'-page-'+pages+'-'+tabCurrent+' .imgContainer .bott').removeClass('dotBot dotBot90 dotBot270').addClass('dotBot'+((rotate == 0 || rotate == 180) ? '' : rotate));
    $('.divMain-'+itemLoadPdf.seqNo+'-page-'+pages+'-'+tabCurrent+' .imgContainer .topright').removeClass('dotTopRight dotTopRight90 dotTopRight270').addClass('dotTopRight'+((rotate == 0 || rotate == 180) ? '' : rotate));
    $('.divMain-'+itemLoadPdf.seqNo+'-page-'+pages+'-'+tabCurrent+' .imgContainer .topleft').removeClass('dotTopLeft dotTopLeft90 dotTopLeft270').addClass('dotTopLeft'+((rotate == 0 || rotate == 180) ? '' : rotate));
    $('.divMain-'+itemLoadPdf.seqNo+'-page-'+pages+'-'+tabCurrent+' .imgContainer .botleft').removeClass('dotBotLeft dotBotLeft90 dotBotLeft270').addClass('dotBotLeft'+((rotate == 0 || rotate == 180) ? '' : rotate));
    $('.divMain-'+itemLoadPdf.seqNo+'-page-'+pages+'-'+tabCurrent+' .imgContainer .botright').removeClass('dotBotRight dotBotRight90 dotBotRight270').addClass('dotBotRight'+((rotate == 0 || rotate == 180) ? '' : rotate));
   
    
}