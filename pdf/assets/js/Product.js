function setSearch(){
    $('#openDrawingSearch').on('click',()=>{
		common.showHideLoader(true);
		ipcRenderer.send('checkSearchProduct','check');
		
	});

	ipcRenderer.on('searchProduct',(event,data)=>{
		common.showHideLoader(false);
		if(data.login){
			if(data.canSearch){
				if($('#panel-list-drawing').css("display") == "block") $('#tab-btn-01').click();
				createEventDrawingSearch();
				triggerDrawingSearch(true);
			}else{
				common.showErrMessage("アクセス権限がありません。");
			}
		}else{
			ipcRenderer.send('openLogin', null); 
		}
	});

	$('#searchProducts').on('click', e => {
		let val = $('#productCode').val();
		common.showHideLoader(true);
		service.getproducts(datalogin,val).subscribe(x=>{
			
			if(!x.error){
				dataDrawingSearch = x.data;
				setRowTableSearchDrawing();
				createEventDrawingSearch();
				$('#labelnew').css('display',(x.count != null && x.count > 100) ? 'block' : 'none');
				
			} else {
				common.showErrMessage(common.getMessageWithErrorCode(x.errorCode,message),null);
				common.showHideLoader(false);
			}
		});
	});

// ****************************************************************************************************************************************************************
// SCRIPT 5.図面リストの詳細クリック
	$('body').on('click','.prodItem',e => {
		let value = e.currentTarget.getAttribute('value');
		loadFilePdf(value);
	});
// END SCRIPT 5.図面リストの詳細クリック
// ****************************************************************************************************************************************************************
}

// ****************************************************************************************************************************************************************
//show list drawing after search
function setRowTableSearchDrawing(){
	let html = '<table class="tableBody">'
		+'<thead>'
			+'<tr>'
				+'<th style="width: 25px;min-width:  25px; max-width: 25px;"></th>'
				+'<th class="width150"></th>'
				+'<th class="width280"></th>'
				+'<th class="width280"></th>'
				+'<th style="width: 120px;min-width: 120px;max-width: 120px;"></th>'
			+'</tr>'
	   +' </thead>';
	if(dataDrawingSearch != null && dataDrawingSearch.length > 0){
		let i = 0;
		for(;i < dataDrawingSearch.length;){
			let name = common.toStringIfnull(dataDrawingSearch[i].productName);
			let fileN = common.toStringIfnull(dataDrawingSearch[i].pdfFileName);
			html += '<tr>'
			html += '<td ><input type="checkbox" class="checkRowSearchDrawing" value ="'+i+'"/></td>'
			html += '<td class="rowSearch width150">'+common.toStringIfnull(dataDrawingSearch[i].productCode)+'</td>'
			html += '<td class="rowSearch width280" title="'+name+'" >'+name+'</td>'
			html += '<td class="rowSearch width280" title="'+fileN+'" >'+fileN+'</td>'
			html += '<td class="rowSearch">'+common.dateFormatToString(dataDrawingSearch[i].updateDate)+'</td>'
			html+= '</tr>';
			i++
		}
		html +='</table>';
		$('#bodyTableSearchDrawing').html(html);
		$('#containerCheckAll').html('<input id="checkAllRow" type="checkbox" style="vertical-align: middle;"/>');
	}else{
		html +='</table>';
		$('#bodyTableSearchDrawing').html(html);
		$('#containerCheckAll').html('');
		common.showInfoMessage(common.getMessageWithErrorCode("LPWI0001",message));
	}
	common.showHideLoader(false);
}

// ****************************************************************************************************************************************************************
// create event for button of dialog drawing search
function createEventDrawingSearch(){
	$('#labelnew').css('display','none');
	$('#onSelectSearch,#drawingSearchOverlay,#onDrawingSearchCancel,#closeDrawingSearch,.checkRowSearchDrawing,#checkAllRow,.rowSearch').off("click");
	$('#onDrawingSearchCancel,#closeDrawingSearch').on('click',()=>triggerDrawingSearch(false));
	$('.checkRowSearchDrawing').on('click' , (e) => {
		e.currentTarget.parentElement.parentElement.setAttribute('class',(e.currentTarget.checked) ? 'rowSelected':'');
		checkAllorNotAll();
	});

	$('#checkAllRow').on('click',(e) => {
		let allRow = document.getElementsByClassName('checkRowSearchDrawing');
		if(allRow != null && allRow.length > 0){
			for(let i = 0; i < allRow.length ; i ++){
				allRow[i].checked = (e.currentTarget.checked);
				allRow[i].parentElement.parentElement.setAttribute('class',(e.currentTarget.checked) ? 'rowSelected':'');
			}
		}
	});

	$('.rowSearch').on('click',(e) => {
		e.currentTarget.parentElement.children[0].children[0].click();
		checkAllorNotAll();
	});

	$('#onSelectSearch').on('click', (e) =>{
		let allRow = document.getElementsByClassName('checkRowSearchDrawing');
		let count = 0;
		let list = [];
		if(allRow != null && allRow.length > 0){
			for(let i = 0; i < allRow.length ; i ++){
				if(allRow[i].checked){
					// let itemSelected =  dataDrawingSearch.find(x => x.seqNo == allRow[i].value);
					// if(itemSelected) list.push(itemSelected);
					list.push(dataDrawingSearch[allRow[i].value]);
					count += 1;
				}
			}
		}
		if(count == 0){
			common.showErrMessage(common.getMessageWithErrorCode('LPWI0004',message),null);
		} else {
			onSelectAccept(list);
		}
	});

	

}// ****************************************************************************************************************************************************************
// SCRIPT PROCESS 1.5.テキストボックスのサイズの設定
// ****************************************************************************************************************************************************************

// ****************************************************************************************************************************************************************
//process ON OFF dialog drawing search
function triggerDrawingSearch(mode){
	//・図面検索画面に遷移する
	if(!mode){
		$('.drawingSearchContent').removeClass('showPopup');
		$('.drawingSearchContent').addClass('closePopup');
		setTimeout(x=>{
			$('.drawingSearchOverlay').addClass('closePopup');
			$('#bodyTableSearchDrawing').html("");
			$('#containerCheckAll').html('')
			$('#productCode').val('');
			dataDrawingSearch = [];
		},500);
	}else{
		$('.drawingSearchOverlay').removeClass('closePopup')
		setTimeout(x=>{
			$('.drawingSearchContent').removeClass('closePopup');
			$('.drawingSearchContent').addClass('showPopup');
		},100);
	}
} 

// ****************************************************************************************************************************************************************
//process after confirm change
function onSelectAccept(list){
	listSelected = list;
	common.showHideLoader(true);
	common.deleteFolderRecursive(datalogin.templateFolder);
	indexFile = -1;
	$('#drawingSearchOverlay').off("click");
	service.getDownloadPdfTokenLPW(datalogin,{productList : list,userId : datalogin.userid , programId : "LPW"}).subscribe(response => {
		common.showHideLoader(false);
		if(!response.error){
			
			createListProduct();
			triggerDrawingSearch(false);
			setTimeout(_=>{
				if(response.data == null || response.data.length == 0 ){
					return;
				}
				$('#downloadModal').removeClass('closeModal');
				$('#download-percent').css("width", "1%");
				$('#percentDownload').text("1%");
				let urlDl = datalogin.url + "/v1/api/download-pdf?downloadToken="+response.data;
				downloadMain(urlDl, path.join(datalogin.templateFolder, response.data +".zip"));
			},500)
		}else{
			common.showErrMessage(common.getMessageWithErrorCode(response.errorCode,message),null);
		}
	});
}

// ****************************************************************************************************************************************************************
//convert list product to html
function createListProduct(){
	let htmlListDrawing = "";
	for(let i = 0; i< listSelected.length; i++){
		let name = common.toStringIfnull(listSelected[i].productCode) +' '+common.toStringIfnull(listSelected[i].productName);
		if(listSelected[i].seqNo == null) listSelected[i].seqNo = common.UUID();
		htmlListDrawing +='<tr class="prodItem" value="'+listSelected[i].seqNo+'" >'
			+'<td class="td-product" title="'+name+'">'+name+'</td>'
		+'</tr>';
	}

	$('#list-drawing').html(htmlListDrawing);
}
// END SCRIPT PROCESS 1.5.テキストボックスのサイズの設定
// ****************************************************************************************************************************************************************

function checkAllorNotAll(){
	let allRow = document.getElementsByClassName('checkRowSearchDrawing');
	let count = 0;
	if(allRow != null && allRow.length > 0){
		for(let i = 0; i < allRow.length ; i ++){
			if(allRow[i].checked){
				count += 1;
			}
		}
	}

	$('#checkAllRow')[0].checked =(count ==  allRow.length)
}

// ****************************************************************************************************************************************************************
// SCRIPT process download pdf
function downloadMain(url, filePath){
    let receivedBytes = 0
	let total_size = 0;

	request.get(url,{ headers: { userid: datalogin.userid,uh2: datalogin.uh2 }}).on('response', (response) => {
        if (response.statusCode == 403){
			common.logOutOrDenied();
			return;
		} else if (response.statusCode !== 200) {
			$('#downloadModal').addClass('closeModal'); 
			common.showErrMessage(common.getMessageWithErrorCode("E99",message),null);
			return;
		}
		total_size = Number(response.headers['content-length']);
    }).on('data', (chunk) => {
		receivedBytes += chunk.length;
		downloadProgress(receivedBytes, total_size, filePath);
    })
    .pipe(fs.createWriteStream(filePath))
    .on('error', (err) => {
		fs.unlinkSync(filePath);
		$('#downloadModal').addClass('closeModal');
		common.showErrMessage(common.getMessageWithErrorCode("E99",message),null);

	})
	.on('end', function() {
        $('#downloadModal').addClass('closeModal'); 
    });
}

// ****************************************************************************************************************************************************************
// show percent of download file of drawing search
function downloadProgress(received,total, filePath){
    let percentage = (received * 100) / total;
	
	$('#download-percent').css("width", percentage +"%");
	$('#percentDownload').text(Math.round(percentage) +"%");
	if(percentage == 100){
		$('#downloadModal').addClass('closeModal');
		savePFDrawingFiles(filePath);
	}
}

// ****************************************************************************************************************************************************************
//save file to temp path after download
function savePFDrawingFiles(zipfilePath){
	$('#savingModal').removeClass('closeModal'); 
	common.uncompressZip(zipfilePath, datalogin.templateFolder).subscribe(()=>{
		fs.unlinkSync(zipfilePath);
		if($('#panel-search').css('display') == "block") $('#btn-tab-search').click();
		$('#tab-btn-01').click();
		$('#savingModal').addClass('closeModal'); 
	});
}
// END SCRIPT process download pdf
// ****************************************************************************************************************************************************************
