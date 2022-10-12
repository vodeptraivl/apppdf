
function setSaveFile(){
// ****************************************************************************************************************************************************************
// SCRIPT 16.「名前をづけて保存」ボタンクリック

	//16.「名前をづけて保存」ボタンクリック
	$('#saveFileLocal').on('click',(e)=> {
		// if(itemLoadPdf.page == null || itemLoadPdf.page.length == 0){
		// 	common.showErrMessage(common.getMessageWithErrorCode("LPWI0007",message));
		// 	return;
		// }
		if(!e.currentTarget.getAttribute('disabled')){
			ipcRenderer.send('saveFile', pathSave); 
		}
	});

	//17.「上書き保存」ボタンクリック
	$('#saveFileOveride').on('click',(e)=>{
		// if(itemLoadPdf.page == null || itemLoadPdf.page.length == 0){
		// 	common.showErrMessage(common.getMessageWithErrorCode("LPWI0007",message));
		// 	return;
		// }
		if(!e.currentTarget.getAttribute('disabled')){
			if(pathSave == null || pathSave == ""){
				ipcRenderer.send('saveFile', pathSave);
				return;
			}else{
				doConfirm("LPWI0003",()=>saveFile());
			}
		}
	});

	ipcRenderer.on('savePath', (event, data) => {
		if(data != null && data != ""){
			let pathArr = data.split("\\");
			if(pathSave != data){
				if(itemLoadPdf.pdfFileName != pathArr[pathArr.length-1] && ($('.sub-tab .itemTab[title="'+pathArr[pathArr.length-1]+'"]').length>0)){
					common.showInfoMessage(common.getMessageWithErrorCode("LPWW0008",message));
					return;
				}else{
					pathSave = data;
					startSavePdf().subscribe(_=>{});
				}
			}else{
				// pathSave = data;
				startSavePdf().subscribe(_=>{});	
			}
		}
	});

// END SCRIPT 16.「名前をづけて保存」ボタンクリック
// ****************************************************************************************************************************************************************
}

function saveFile(){
	startSavePdf().subscribe(_=>{})
}

// ****************************************************************************************************************************************************************
// SCRIPT process uploadfile pdf ~ FKVL
function startSavePdf(){
	return new Observable(observer => 
		{
			if(itemLoadPdf != null &&( itemLoadPdf.page == null || itemLoadPdf.page.length == 0)){
				itemLoadPdf.page = [];
				saveBlankPage().subscribe(_=>{observer.complete()},error=>{throw error});
				observer.complete();
			}else{
				if(signaPads){
					setPaint(false,false);
					setFont(false);
					common.showHideLoader(true);
					onSave = true;
					// console.log(itemLoadPdf.page);
					// return;
					try {
						common.mkDirByPathSync(path.join(datalogin.templateFolder,itemLoadPdf.seqNo.toString()));
						total = 0;
						processSavePdf().subscribe(data =>{
							if(itemLoadPdf.joinFile) coppyFileJoin();
							setTimeout(_=>{
								common.zipFile(
									datalogin.templateFolder, 
									path.join(datalogin.templateFolder,itemLoadPdf.seqNo.toString()),
									{path: pathWork , name :itemLoadPdf.pdfFileName}
								).subscribe(x=>{
									itemLoadPdf.nameZip = x;
									uploadPdf().subscribe(_=>{observer.complete()},error=>{throw error});
								});
							},500);
						});
						
					} catch (error) {
						common.showErrMessage(common.getMessageWithErrorCode("E99".message),null);
						common.showHideLoader(false);
						return;
					}
				}
			}
			
		}
	);
}

// ****************************************************************************************************************************************************************
// process save file ~ FKVL
function processSavePdf(){
	return new Observable(observer => {
		let l = signaPads.length;
		itemLoadPdf.page.map(x=>{x.position = []});
		FKSaveShape();
		// save img in file
		saveImage().subscribe(x=>{
			for( let ind = 0; ind < signaPads.length ; ind ++){
				let page = JSON.parse(JSON.stringify(signaPads[ind]));
				if(page._data && page._data.length > 0){ 
					for(let index = 0; index < page._data.length ; index ++){
						let line = JSON.parse(JSON.stringify(page._data[index]));
						if(line != null && line.points != null && line.points.length > 0 ){
							//find max x of item in file
							let minx = Math.min.apply(null, line.points.map(item => item.x)), maxx = Math.max.apply(null, line.points.map(item => item.x));
							//find max y of item in file
							let miny = Math.min.apply(null, line.points.map(item => item.y)), maxy = Math.max.apply(null, line.points.map(item => item.y));
							line.points.map(x=>{ x.x -= minx; x.x += 10; x.y -= miny; x.y += 10;});
							//add padding for item value padding ~ with zoom percent
							let w = (maxx-minx)+20, h = (maxy-miny)+20;
							calcPostion(minx,maxx,miny,maxy,false,itemLoadPdf.page[ind].align).subscribe(pos => {
								saveLine(line,w,h).subscribe(t=>{
									pos["nm"]=t;
									pos['type'] = 'line';
								},err => {throw err});
								itemLoadPdf.page[ind].position.push(pos);
							},err => {throw err});
						}
					}
				}
				// save text in file
				saveText(ind,itemLoadPdf.page[ind].align).subscribe(data=>{
					if(data){
						data.map(ii => {
							itemLoadPdf.page[ind].position.push(ii);
						});
					}
					if(ind == (l-1)){
						observer.next();
						observer.complete();
					}
				});
			}
		});
	});
}

// ****************************************************************************************************************************************************************
//convert line to png ~ FKVL
function saveLine(line,w,h){
	return new Observable(observer => {
		try {
			let cv = document.createElement("canvas"),cvm = document.createElement("canvas");
			cv.width = w; cv.height = h; cvm.width = w; cvm.height = h;
			cv.setAttribute("id","xdraf"); cvm.setAttribute("id","xmain");
			$('#tempSave').append(cv); $('#tempSave').append(cvm);
			let i1 = $("#xdraf").get(0), i2 = $("#xmain").get(0);
			//add padd to draw
			let pad = new FKPaint(i1,i2,{ penColor : line.color, dotSize: line.width }); 
			//draw line
			pad.xpv(line);
			let nm = common.UUID()+".png";
			//write pad thanh file
			writeFile(i2.toDataURL("image/png").replace(/^data:image\/png;base64,/, ""),nm).subscribe(_=>{
				//affter write image to file padd will be remove
				i1.remove();
				i2.remove();
				pad.destroy();
				observer.next(nm);observer.complete();
			});
		} catch (error) {
			observer.complete();
			fse.remove(path.join(datalogin.templateFolder,itemLoadPdf.seqNo.toString())).then(() => {}).catch(err => {throw err});
			throw error;
		}
	})
}

// ****************************************************************************************************************************************************************
// convert text to png ~ FKVL
function saveText(ind,hoz){
	return new Observable( async observer => {
		let res = [];
		if(textOnBoard.length >0){
			let textinPage = textOnBoard.filter(x=> {return x.page==ind});
			if(textinPage && textinPage.length >0){
				let l = (textinPage.length-1);
				let i = 0;
				for(; i < textinPage.length ; i++){
					if(textinPage[i].display == 'block'){
						let pos = textinPage[i].position.find(item => {return item.disp});
						if(pos){
							// file rotate value 
							let degree = $('#'+textinPage[i].id+textinPage[i].idT).attr('rotate');
							let text = $('#'+textinPage[i].id+textinPage[i].idT).val();
							let canvas = document.createElement('canvas');
							setAttributes(canvas,{'id':"textPng",'width':((+degree == 90 || +degree == 270 ) ? pos.height :  pos.width)+'px','height':((+degree == 90 || +degree == 270 ) ? pos.width :  pos.height)+'px'});
							let context = canvas.getContext('2d');
							context.font = (pos.sizeCalc)+'px '+font;
							context.fillStyle = pos.color;
							//wrap text to save
							wrapText(context, text ,0 ,(pos.sizeCalc - ( pos.sizeCalc / 100 * 10)),((pos.sizeCalc)),((+degree == 90 || +degree == 270 ) ? pos.height :  pos.width));
							let nm = common.UUID()+".png";
							resetOrientation(canvas,(+degree), path.join(datalogin.templateFolder,itemLoadPdf.seqNo.toString(),nm)) ;
							let maxx = (pos.x+pos.width),
								maxy = (pos.y+pos.height);
							calcPostion(pos.x,maxx,pos.y,maxy,true,hoz,(+degree)).subscribe(poss => {
								poss["nm"] = nm;
								poss['type'] = 'text';
								res.push(poss);
							},err => {throw err});
						}
					}
					l++;
				}
			}
		}
		observer.next(res.length > 0 ? res : null);
		observer.complete();
	});
}

// ****************************************************************************************************************************************************************
//calc position save file ~ 10px ~ FKVL
function calcPostion(minx,maxx,miny,maxy,text,hoz,degree = 0){
	return new Observable(observer => {
		let pageHeight = ((hoz ? itemLoadPdf.dataZoom.height : itemLoadPdf.dataZoomVer.height) * 2),
			pageWidth = ((hoz ? itemLoadPdf.dataZoom.width : itemLoadPdf.dataZoomVer.width) * 2),
			percentW = (((pageWidth) - 16.5) / 100),
			percentH = (((pageHeight)) / 100),
			width = (maxx - minx),
			height = (maxy - miny),
			padding = (text ? 0 : 20),
			x = ((minx - padding) / percentW),
			y = ((((pageHeight)) - (maxy + padding)) / percentH),
			w = (((width) + padding) / percentW),
			h = (((height) + padding) / percentH);
		observer.next({x , y , w , h ,degree});
		observer.complete();
	})
}

// ****************************************************************************************************************************************************************
//③APIを呼び出し、編集した内容をまとめてファイルを作成する
function uploadPdf(){
	return new Observable(observer => {
		itemLoadPdf.zipFile = fs.readFileSync(path.join(datalogin.templateFolder,itemLoadPdf.nameZip)).toString('base64');
		service.pdfCombinationUpload(datalogin,itemLoadPdf).subscribe(x=>{
			common.showHideLoader(false);
			if(x.errorCode && x.error){
				return;
			}
			fs.unlinkSync(path.join(datalogin.templateFolder,itemLoadPdf.nameZip));
			$('#downloadModal').removeClass('closeModal');
			$('#download-percent').css("width", "1%");
			$('#percentDownload').text("1%");
			downloadPdfAfterUpload(datalogin.url +"/v1/api/download-pdf?downloadToken="+x.data);
			// closeTab(tabCurrent);
			cleanSave();
			onSave = false;
			observer.next();
			observer.complete();
		},err => { throw err});
	});
}

function saveBlankPage(){
	return new Observable(observer => {
		// itemLoadPdf.zipFile = fs.readFileSync(path.join(datalogin.templateFolder,itemLoadPdf.nameZip)).toString('base64');
		service.pdfCombinationUpload(datalogin,itemLoadPdf).subscribe(x=>{
			common.showHideLoader(false);
			if(x.errorCode && x.error){
				return;
			}
			// fs.unlinkSync(path.join(datalogin.templateFolder,itemLoadPdf.nameZip));
			$('#downloadModal').removeClass('closeModal');
			$('#download-percent').css("width", "1%");
			$('#percentDownload').text("1%");
			downloadPdfAfterUpload(datalogin.url +"/v1/api/download-pdf?downloadToken="+x.data);
			// closeTab(tabCurrent);
			cleanSave();
			onSave = false;
			observer.next();
			observer.complete();
		},err => { throw err});
	});
}




// ****************************************************************************************************************************************************************
//④保存処理ポップアップを表示し、画面の操作ができないように設定する　※例外エラーが発生する時閉じる
function downloadPdfAfterUpload(url,pathNew = null){
	let receivedBytes = 0
	let total_size = 0;

	request.get(url,{ headers: { userid: datalogin.userid,uh2: datalogin.uh2 }}).on('response', (response) => {
        if (response.statusCode == 403){
			common.logOutOrDenied();
			return;
		} else if (response.statusCode != 200) {
			$('#downloadModal').addClass('closeModal'); 
			common.showErrMessage(common.getMessageWithErrorCode("E99",message),null);
			return;
		}
		
		total_size = Number(response.headers['content-length']);
    }).on('data', (chunk) => {
		receivedBytes += chunk.length;
		downloadProgressSave(receivedBytes, total_size, pathNew);
    }).pipe(
		fs.createWriteStream(pathNew || pathSave).on('close',()=>{
			
			if(pathNew){
				extractLoading = true;
				processPathFile([pathNew])
			}else{
				reRenderMap();
			}
		})
	).on('error', (err) => {
		try{
			fs.unlinkSync(pathNew || pathSave)
			$('#downloadModal').addClass('closeModal');
			common.showMessage("E99");
		}catch(e){
			$('#downloadModal').addClass('closeModal');
			common.showMessage("E99");
		}
	}).on('end', () => {
        $('#downloadModal').addClass('closeModal'); 
		
    });
}

// ****************************************************************************************************************************************************************
// show percent of download for upload pdf
function downloadProgressSave(received,total,pathNew = null){
	try{
		let percentage = (received * 100) / total;
		$('#download-percent').css("width", percentage +"%");
		$('#percentDownload').text(Math.round(percentage) +"%");
		if(percentage == 100){
			$('#downloadModal').addClass('closeModal');
		}

	}catch(e){
		$('#downloadModal').addClass('closeModal'); 
		common.showErrMessage(common.getMessageWithErrorCode("E99",message),null);
	}
}



// ****************************************************************************************************************************************************************
// set rotate text to write file ~FKVL
function resetOrientation(clone,degrees, pathS) {
	if(degrees > 0){
		let canvas = document.createElement('canvas'),
		ctx = canvas.getContext("2d");
		canvas.width = ((degrees == 90 || degrees == 270 )) ? clone.height : clone.width;
		canvas.height = ((degrees == 90 || degrees == 270 )) ? clone.width : clone.height;
		let x=0,y=0;
		switch(degrees){
			case 90:
				x = -canvas.height;
				break;
			case 180 : 
				x = -canvas.width;
				y = -canvas.height;
				break;
			case 270:
				y = -canvas.width;
				break;
		}
		ctx.translate(0, 0);
		ctx.rotate(-degrees * Math.PI / 180);
		ctx.drawImage(clone, x,y);
		fs.writeFileSync(pathS, canvas.toDataURL("image/png").replace(/^data:image\/png;base64,/, ""), 'base64');
		return;
	}

	fs.writeFileSync(pathS, clone.toDataURL("image/png").replace(/^data:image\/png;base64,/, ""), 'base64');
}

// ****************************************************************************************************************************************************************
//save image to temp path ~FKVL
function saveImage(){
	return new Observable(observer => {
		let l = imgOnBoard.length;
		let count = 0;
		try {
			if(l > 0){
				imgOnBoard.map((img,indx)=>{
					let position =  img.position.find(x=>{return x.disp})
					if(position){
						let fileName = common.UUID()+'.png',
						pathSave = path.join(datalogin.templateFolder,itemLoadPdf.seqNo.toString(),fileName);
						resetOrienImage(img.id,img.degree,pathSave,position.width,position.height);
						calcPostion(position.x,(position.x+position.width),position.y,(position.y+position.height),true,img.align,(+img.degree)).subscribe(poss => {
							poss["nm"] = fileName;
							poss['type'] = 'img';
							itemLoadPdf.page[img.page].position.push(poss);
							count += 1;
							if(l == count){
								observer.next();
								observer.complete();
							}
						},err => {throw err});
					}else{
						count += 1;
						if(l == count){
							observer.next();
							observer.complete();
						}
					}
					
				});
			}else{
				observer.next();
				observer.complete();
			}	
		} catch (error) {
			throw error
		}
	});
}

// ****************************************************************************************************************************************************************
// set rotate text to write file ~FKVL
function resetOrienImage(id, degrees, pathS,w,h) {
	let img = document.getElementById('hinh'+id);
	let canvas = document.createElement('canvas'),
			ctx = canvas.getContext("2d"),
			x = 0,
			y = 0,
			ww = ((degrees == 90 || degrees == 270 )) ? h : w,
			hh = ((degrees == 90 || degrees == 270 )) ? w : h;
	canvas.width = w;
	canvas.height = h;
	switch(degrees){
		case 90:
			x = -canvas.height;
			break;
		case 180 : 
			x = -canvas.width;
			y = -canvas.height;
			break;
		case 270:
			y = -canvas.width;
			break;
	}
	ctx.translate(0,0);
	ctx.rotate(-degrees * Math.PI / 180);
	ctx.drawImage(img,x,y,ww,hh);
	fs.writeFileSync(pathS, canvas.toDataURL("image/png").replace(/^data:image\/png;base64,/, ""), 'base64');
}

// ****************************************************************************************************************************************************************
// clean file after save file
function cleanSave(){
	itemLoadPdf.page.map(x=>{x.position=[]});
	// delete itemLoadPdf.zipFile;
	delete itemLoadPdf.nameZip;
	delete itemLoadPdf.fileNames
	$('#pathFile').html(pathSave.toString().split("\\").join("/"));
	$('.prodItem').removeClass('rowSelected');
	$('#moveDown,#moveUp').attr('disabled','true');
	indexFile = -1;
	let fileName = pathSave.split("\\");
	itemLoadPdf.save = true;
	$(".sub-tab[idtab='"+tabCurrent+"'] .itemTab").text(fileName[fileName.length -1]).attr('title',fileName[fileName.length -1]);
	// }
}

// ****************************************************************************************************************************************************************
//write file ~ FKVL
function writeFile(data,nm){
	return new Observable(observer => {
		fs.writeFile(path.join(datalogin.templateFolder,itemLoadPdf.seqNo.toString(),nm), data, 'base64',(err)=>{if(err) throw err} );
		observer.next();
		observer.complete();
	});
}

function coppyFileJoin(){
	if(itemLoadPdf.joinFile){
		let pathTemp = path.join(datalogin.templateFolder,itemLoadPdf.seqNo.toString());
		let fileName = [itemLoadPdf.pdfFileName];
		let lengthPage = itemLoadPdf.page.length;
		for(let i =0 ;i < lengthPage ; i++){
			let fileNm = itemLoadPdf.page[i].fileName;
			let filePath = itemLoadPdf.page[i].pathFile;
			if(fileName.indexOf(fileNm) == -1){
				fileName.push(fileNm);
				fs.copyFileSync(filePath, path.join(pathTemp, fileNm));
			}
		}
		itemLoadPdf.fileNameJoin = fileName.join(";");
	}
}

function FKSaveShape(){
	removeShapeSltor();
	$('.stampProdCon').removeClass('active');
	let divMain = $(`.divMain[tab="${tabCurrent}"]`);
	let pathTemp = path.join(datalogin.templateFolder,itemLoadPdf.seqNo.toString());
	divMain.map((i,x) => {
		let svg = x.querySelector(".svg-container");
		if(svg){
			let nameShape = 'shape'+common.UUID()+'.png';
			let pathS = path.join(pathTemp, nameShape);
			let txtAreas = svg.querySelectorAll('.FKtextArea');
			let txtAreaFs = svg.querySelectorAll('.FKtextAreaF');
			if(txtAreas && txtAreas.length > 0){
				txtAreas.forEach(x=>{x.remove()});
				txtAreaFs.forEach(x=>{x.style.display = ''});
			}
			toPNG(svg,pathS,()=>{
				if(txtAreas && txtAreas.length > 0){
					txtAreas.forEach(x=>{
						let idta = x.getAttribute('idta');
						document.querySelector(`.FKtextAreac[idta="${idta}"]`).insertAdjacentElement('beforeend',x);
					});
					txtAreaFs.forEach(x=>{x.style.display = ''});
				}
			});
			itemLoadPdf.page[i].position.push({type:'shape',nm:nameShape,x:0,y:0,h:100,w:100});
			
		}
	});
}

function toPNG(svg, pathSave,callBack = null){
	let img = new Image(),
    serializer = new XMLSerializer(),
    svgStr = serializer.serializeToString(svg),
    data = 'data:image/svg+xml;base64,' + window.btoa(unescape(encodeURIComponent(svgStr)))
    var canvas = document.createElement("canvas");
	let w = svg.clientWidth;
	let h = svg.clientHeight;
    canvas.width = w;
    canvas.height = h;
    let context = canvas.getContext("2d");
	
    img.src = data;
    img.onload = () => {
        context.drawImage(img, 0, 0, w, h);
        var canvasdata = canvas.toDataURL("image/png");
        fs.writeFileSync(pathSave, canvasdata.replace(/^data:image\/png;base64,/, ""), 'base64');
		if(callBack){
			callBack();
		}
    };
}

// END SCRIPT process uploadfile pdf
// ****************************************************************************************************************************************************************


