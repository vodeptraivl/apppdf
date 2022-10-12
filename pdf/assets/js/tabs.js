
function defaultTabs(){
    $('body').on('click','.itemTab',(e)=>{
        cloneTab();
        removeShapeSltor();
        $('.stampProdCon').removeClass('active');
        tabCurrent = e.currentTarget.parentElement.getAttribute('idtab');
        let item = null,index = -1;countPad=0;
        allTabs.map((x,i)=>{
            if(x.idtab == tabCurrent){item = x;index = i}
            if(x.signaPads && x.signaPads.length > 0){countPad++;}
        });
        $('.prodItem').removeClass('rowSelected');
        if(item && item.itemLoadPdf){
            itemLoadPdf = item.itemLoadPdf;
            pathSave = item.itemLoadPdf.pathSave || null;
            
            $('#pathFile').html(pathSave ? pathSave.toString().split("\\").join("/") : '');
            
            signaPads = item.signaPads;
            textOnBoard = item.textOnBoard;
            imgOnBoard = item.imgOnBoard;
            historyMain = item.historyMain;
            __TOTAL_PAGES = itemLoadPdf.page.length;
            pageCurrent = item.pageCurrent;
            currentZoom = item.currentZoom;
            
            $('#page-number').text(__TOTAL_PAGES);

            if(pageCurrent){
                $('#currentPage').val(pageCurrent);
            }

            if(__TOTAL_PAGES > 1){
                $('#currentPage').removeAttr('disabled');
            }else{
                $('#currentPage').removeAttr('disabled').attr('disabled','disabled');
            }

            $('.fa-repeatCustom,.fa-undoCustom').removeClass('btn-disable').addClass('btn-disable');
            if(historyMain && historyMain.length>0){
                $('.fa-undoCustom').removeClass('btn-disable');
            }
            $('#saveFileOveride,#saveFileLocal').removeAttr('disabled');
            if(itemLoadPdf.seqNo != -1){
                if(!itemLoadPdf.save){
                    setIndexFile(itemLoadPdf.seqNo)
                }else{
                    indexFile = -1;
                    $('#moveDown,#moveUp').attr('disabled','true');
                }
            }else{
                $('#moveDown,#moveUp').attr('disabled','true');
            }
            $('#btn-change-size-tb,#btn-change-color-tb').removeClass('poiterNone');
            if(focusOnBlankTab){
                setPaint(false,false);
                setFont(false);
                focusOnBlankTab = false;
            }
        }else{
            setDefaultVariable();
            focusOnBlankTab = true; 
            if(item.seqNo){
                setIndexFile(item.seqNo)
            }else{
                $('#moveDown,#moveUp').attr('disabled','true');
            }
        }

        if(countPad == 0){
            setDefaultVariable();
        }

        if(historyMain && historyMain.length>0){
            $('.fa-undoCustom').removeClass('btn-disable');
        }else{
            $('.fa-undoCustom').removeClass('btn-disable').addClass('btn-disable');
        }
        $('.sub-tab').removeClass('active');
        e.currentTarget.parentElement.classList.add('active')
        $('.div-pdf').removeClass('off').addClass('off');
        $('#export-div'+tabCurrent).removeClass('off');
        $('.tabs').scrollLeft($('.sub-tab.active')[0].offsetLeft-200);
        ;
    });

    $('body').on('click','.closeTab',(e)=>{
        let idtab = e.currentTarget.parentElement.getAttribute('idtab');
        doConfirm("LPWI0002",() => closeTab(idtab),idtab);
    });
    
}

function selectTabs(){
    
}

function setIndexFile(seqNo){
    indexFile = listSelected.findIndex(x=>x.seqNo == seqNo);
    $('.prodItem[value="'+seqNo+'"]').addClass('rowSelected');
    scrollLeftPanel();
    $('#moveDown,#moveUp').removeAttr('disabled');
}

function cloneTab(){
    if(tabCurrent){
        historyMainRedo = [];
        if(itemLoadPdf){
            itemLoadPdf.pathSave = pathSave;
        }
        for(let i = 0; i<allTabs.length ;i++){
            if(allTabs[i].idtab == tabCurrent){
                allTabs[i].itemLoadPdf = itemLoadPdf;
                allTabs[i].signaPads = signaPads;
                allTabs[i].textOnBoard = textOnBoard;
                allTabs[i].imgOnBoard = imgOnBoard;
                allTabs[i].historyMain = historyMain;
                allTabs[i].pageCurrent = pageCurrent;
                allTabs[i].currentZoom = currentZoom;
            }
        }
        itemLoadPdf = null;
        signaPads = [];
        imgOnBoard = [];
        textOnBoard = [];
        historyMain = [];
        pageCurrent = null;
        currentZoom = 0;
    }
}

function closeTab(idtab){
    $('.stampProdCon').removeClass('active');
    removeShapeSltor();
    if(allTabs.length <= 1){
        $('#export-div'+idtab+',.sub-tab[idtab="'+idtab+'"]').remove();
        clearFile(allTabs[0])
        itemLoadPdf = null;
        allTabs = [];
        setDefaultVariable();
        $('.panel-search,.containter-tabs,.scrollPanel,.panel').removeClass('on');
        $('.prodItem').removeClass('rowSelected');
        
        return;
    }
    let item = {},index = -1;
    let data = [];
    allTabs.map((x,i)=>{
        if(x.idtab == idtab){
            item = x;index = i
        }else{
            data.push(x)
        }
    });
   
    index = index > (data.length-1) ? (data.length-1) : index;
    allTabs = data;
    if(countPads() == 0){
        itemLoadPdf = null;
        setDefaultVariable();
    }
    clearFile(item)
    $('.sub-tab[idtab="'+allTabs[index].idtab+'"] .itemTab').click();
    $('#export-div'+idtab+',.sub-tab[idtab="'+idtab+'"]').remove();
    ;
}

function clearFile(item = null){
    onSave = false;
    try {
        if(item){
            item.textOnBoard.map(x=>{interact('#'+x.id).unset();});
            item.imgOnBoard.map(x=>{interact('#'+x.id).unset();});
            if(item.signaPads && item.signaPads.length > 0){
                item.signaPads.map(pad => {
                    pad.destroy();
                })
            }
            fs.unlinkSync(path.join(pathWork,(item && item.itemLoadPdf && item.itemLoadPdf) ? item.itemLoadPdf.pdfFileName : itemLoadPdf.pdfFileName));
            common.deleteFolderRecursive(path.join(pathMerge,item.idtab));
        }
    } catch (error) {
        console.log(error)
    }
}

function countPads(){
    countPad = 0;
    allTabs.map((x,i)=>{
        if(x.signaPads && x.signaPads.length > 0){countPad++;}
    });
    return countPad;
}

function findTab(name = null,seqNo = null){
    if(allTabs){
        for(let i = 0 ; i < allTabs.length ;i ++){
            if(name && !seqNo){
                if(allTabs[i].itemLoadPdf && allTabs[i].itemLoadPdf.pdfFileName == name) return allTabs[i];
            }else if(name && seqNo){
                if(allTabs[i].itemLoadPdf) {
                    if (allTabs[i].itemLoadPdf.seqNo == seqNo && (allTabs[i].itemLoadPdf.pdfFileName == name)) return allTabs[i];  
                } else if((allTabs[i].seqNo == seqNo)){
                    return allTabs[i];
                }
            }
        }
    }
}