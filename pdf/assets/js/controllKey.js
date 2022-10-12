function setControllKey(){
	// ****************************************************************************************************************************************************************
	$(window).on('keydown',(e)=>{
		if(isStampOpen){
			e.stopPropagation();
			return;
		}
		if(isMiniMapOpen || isStampOpen){
			e.preventDefault();
			e.stopPropagation();
			return;
		}
		if($('.dotShape').length > 0){
			switch(e.keyCode){
				case 27:
					if(e.target.nodeName == 'TEXTAREA'){
						// e.target.setAttribute('disabled',true);
						if (svgMoveEVent) {
							svgMoveEVent.blurText();
						}
					}else{
						if (svgMoveEVent) {
							svgMoveEVent.destroy(() => { svgMoveEVent = null });
						}
					}

					break;
				case 46:
					let active = $(document.activeElement);
					if(active && active[0].nodeName == 'TEXTAREA') return;
					if (svgMoveEVent) {
						svgMoveEVent.destroyRemove((his) => { 
							svgMoveEVent = null;
							historyMain.push(his);
							clearHistoryRedo();
						 });
					}
			}
			if(e.ctrlKey && e.keyCode == 90 && !e.shiftKey){
				e.preventDefault();
				if(e.target.nodeName == 'TEXTAREA'){
					if (svgMoveEVent) {
						svgMoveEVent.blurText();
					}
				}else{
					undo();
				}
			}

			if(e.ctrlKey && e.keyCode == 89){
				if(e.target.nodeName == 'TEXTAREA'){
					if (svgMoveEVent) {
						svgMoveEVent.blurText();
					}
				}else{
					redo();
				}
			}

			if(e.ctrlKey && e.keyCode == 67){
				if(e.target.nodeName == 'TEXTAREA'){
				}else{
					if (svgMoveEVent) {
						svgMoveEVent.copyShape((copyItem) => { 
							itemcoppy = {type:"shape",item:copyItem};
						 });
					}
				}
			}
			
			if(e.ctrlKey && e.keyCode == 80 && !e.shiftKey){
				e.preventDefault();
				handlePastData(e);
			}
			if(e.keyCode == 17) {
				$('.imgContainer,.svg-container').removeClass('zindx1 zindx2 zindx3').addClass('zindx1');
				return;
			}
			return;
		}
		

		if($('.drawingSearchContent').hasClass('closePopup')){
			if(e.keyCode == 87 && e.ctrlKey) {
				e.preventDefault();
				return;
			}

			if(e.ctrlKey && e.shiftKey && e.keyCode == 83){
				if(onSave) return;
				$('#saveFileLocal').click();
				return;
			}

			if(e.ctrlKey && e.keyCode == 83){
				if(onSave) return;
				$('#saveFileOveride').click();
				return;
			}

			if(e.ctrlKey && e.keyCode == 107 && itemLoadPdf){
				if((itemLoadPdf.scale < zoomRange[1])){
					zoomOut({point:pointZoomKey},0.05);
					currentZoom = parseFloat((currentZoom).toFixed(2));
					currentZoom = (currentZoom == 0.25) ? 0.05 : (currentZoom + 0.05);
				}else{
					currentZoom = 0;
				}
				return;
			}

			if(e.ctrlKey && e.keyCode == 109 && itemLoadPdf){
				
				if(itemLoadPdf.scale > zoomRange[0]){
					zoomIn({point:pointZoomKey},0.05);
					currentZoom = parseFloat((currentZoom).toFixed(2));
					currentZoom = (currentZoom == 0) ? 0.20 : (currentZoom - 0.05);
				}else{
					currentZoom = 0;
				}
				return;
			}

			if(!typeText && !currentPageKeyPress && !textStart && !e.shiftKey){
				if(e.ctrlKey && e.keyCode == 67 && imgFocus != ''){
					e.preventDefault();
					copyImg(true);
					return;
				}

				if(e.ctrlKey && e.keyCode == 88 && imgFocus != '' && !e.shiftKey){
					e.preventDefault();
					copyImg(false);
					delImg();
					return;
				}

				if(e.ctrlKey && e.keyCode == 80 && !e.shiftKey){
					e.preventDefault();
					handlePastData(e);
					return;
				}

				if(e.ctrlKey && e.keyCode == 86 && !e.shiftKey){
					if(!$('#productCode').is(':focus')){
						e.preventDefault();
						if(itemLoadPdf) ipcRenderer.send('checkClipBoard', "checkClipboard"); 
						return;
					}
				}

				if(e.ctrlKey && e.keyCode == 90 && !e.shiftKey){
					e.preventDefault();
					undo();
					return;
				}

				if(e.keyCode == 87 && !e.ctrlKey && !e.shiftKey) {
					$('.rotateLeft').click();
					return;
				}
				if(e.keyCode == 67 && !e.ctrlKey && !e.shiftKey) {
					$('.rotateRight').click();
					return;
				}
				if(e.keyCode == 66 && !e.ctrlKey && !e.shiftKey) {
					$('.addtext').click();
					return;
				}
				if(e.keyCode == 80 && !e.ctrlKey && !e.shiftKey) {
					$('.pencilc').click();
					return;
				}
				if(e.keyCode == 69 && !e.ctrlKey && !e.shiftKey) {
					$('.cucrom').click();
					return;
				}
				if(e.keyCode == 83 && !e.ctrlKey && !e.shiftKey) {
					$('#highLightClick').click();
					return;
				}

				if(e.keyCode == 73 && !e.shiftKey && !e.ctrlKey) {
					$('#addImage').click();
					return;
				}
				
			}

			if(cantText){
				//削除：Delete
				if(selectedText != '' && e.keyCode == 46  && !e.ctrlKey){
					if(!typeText){
						delText();
					}
					return;
				}

				if(e.ctrlKey && e.keyCode == 67 && !typeText && selectedText != ''){
					e.preventDefault();
					copyText(true);
					return;
				}

				if(e.ctrlKey && e.keyCode == 88 && !typeText && itemcoppy != {}){
					e.preventDefault();
					copyText(false);
					delText()
					return;
				}

				// zoom when mouse inside img or text
				if(e.keyCode == 17) {
					$('.font-container,.imgContainer,.svg-container').removeClass('zindx1 zindx2 zindx3').addClass('zindx1');
					return;
				}
			} else {
				//削除：Delete
				if(imgFocus != '' && e.keyCode == 46){
					delImg();
					return;
				}

				if(e.ctrlKey && e.keyCode == 89){
					redo();
					return;
				}

				// zoom when mouse inside img or text
				if(e.keyCode == 17) {
					$('.imgContainer,.svg-container').removeClass('zindx1 zindx2 zindx3').addClass('zindx1');
					return;
				}

			}
		}else{
			if(e.ctrlKey && e.keyCode == 90 && !e.shiftKey){
				e.preventDefault();
				return;
			}
		}
	});

	$(window).on('keyup',(e)=>{
		if(cantText){

			// zoom when mouse inside img or text
			if(e.keyCode == 17) {
				$('.font-container,.imgContainer').removeClass('zindx1 zindx2 zindx3').addClass('zindx3');
				// $('.svg-container').removeClass('zindx1').addClass('zindx3');
			}
		}else{
			// zoom when mouse inside img or text
			if(e.keyCode == 17) {
				$('.svg-container,.imgContainer').removeClass('zindx1 zindx2 zindx3').addClass('zindx3');	
				// $('.imgContainer').removeClass('zindx1 zindx2 zindx3').addClass('zindx3');	
			}
		}
	});

	
	// ****************************************************************************************************************************************************************
	$('body').on('keydown','.textAreaAddtext',function(event) {
		
		if(event.ctrlKey && event.keyCode == 90){
			event.preventDefault();
		}

		//決定：Enter
		if (event.ctrlKey && event.keyCode == 13 && typeText) {
			event.currentTarget.blur();
			textOnfocus = '';
			// selectedText = '';
			// event.currentTarget.parentElement.classList.remove("on");
			typeText = false;
			interact('#'+selectedText.substring(0,selectedText.length-4)).draggable(true);
			interact('#'+selectedText.substring(0,selectedText.length-4)).resizable(true);
			offScroll(false);
		}

		//取り消し：Esc
		if(event.keyCode == 27 && typeText){
			$('.textAreaAddtext').prop('selectionStart', 0).prop('selectionEnd',0).blur(); 
			event.currentTarget.blur();
			event.currentTarget.value = textOnfocus;
			textOnfocus = '';
			// selectedText = '';
			// event.currentTarget.parentElement.classList.remove("on");
			typeText = false;
			interact('#'+selectedText.substring(0,selectedText.length-4)).draggable(true);
			interact('#'+selectedText.substring(0,selectedText.length-4)).resizable(true);
			offScroll(false);
		}
	});

	ipcRenderer.on('responseCheckClipboard',(event,data)=>{
		if(data){
			ipcRenderer.send('saveImageOfClipboard', "saveIamgeFromClipboard"); 
		}
	});


}


function copyText(type){
	let textCopy = $('#'+selectedText)[0],
		value = textCopy.value;
		id = textCopy.parentElement.getAttribute('id');
	let textCop = JSON.parse(JSON.stringify(textOnBoard.find(x=>{return x.id == id}))),
		pos = JSON.parse(JSON.stringify(textCop.position.find(y=>{return y.disp})));
		switch(textCop.degree){
			case 90:
			case 270:
				let w = pos.width,
					h = pos.height;
				pos.width = h;pos.height = w;
				break;
		}
		textCop.position = [] ;
		textCop.position.push(pos);
	let cop = {type:"text",data:textCop,value,copy:type};
	itemcoppy = cop;
}

function delText(){
	let textDel = $('#'+selectedText)[0],
		id = textDel.parentElement.getAttribute('id');
		textDel.parentElement.style.display = 'none';
		
	textOnBoard.map(x=>{
		if(x.id == id) {
			x.display = 'none';
			addHisText(x.id,'delete');
			x.position.map(y=>{y.disp=false})
		}
	});
}

function copyImg(type){
	let img = JSON.parse(JSON.stringify(imgOnBoard.find(x=>{return x.id == imgFocus}))),
		pos = JSON.parse(JSON.stringify(img.position.find(y=>{return y.disp})));
		img.position = [] ;
		switch(img.degree){
			case 90:
			case 270:
				let w = pos.width,
					h = pos.height;
				pos.width = h;pos.height = w;
				break;
		}
		img.position.push(pos);
	let cop = {type:"img",data:img,copy:type};
	itemcoppy = cop;
}

function delImg(){
	$('#'+imgFocus+',#hinhctn'+imgFocus).css('display','none');
	imgOnBoard.map(x=>{
		if(x.id == imgFocus) {
			x.display = 'none';
			addHisImg(imgFocus,'delete');
			x.position.map(y=>{y.disp=false})
		}
	});
	imgOnEneter = false;
	imgFocus = "";
}

function handlePastData(e){
	if(itemcoppy != {}){
		if(itemcoppy.type && itemcoppy.type == 'img'){
			let cop = JSON.parse(JSON.stringify(itemcoppy));
			handleImg(cop.data.paths,cop.data);
			if(!itemcoppy.copy){
				itemcoppy = {};
			}
		}

		if(itemcoppy.type && itemcoppy.type == 'text' && cantText){
			let cop = JSON.parse(JSON.stringify(itemcoppy));
			createTextCopy(cop.data,cop.value);
			if(!itemcoppy.copy){
				itemcoppy = {};
			}
		}

		if(itemcoppy && itemcoppy.type == 'shape'){
			if(e.target.nodeName == 'TEXTAREA'){}else{
				if (svgMoveEVent) {
					svgMoveEVent.destroy(() => { svgMoveEVent = null });
				}
				pastShape();
				
			}
		}
		return;
	}
}
