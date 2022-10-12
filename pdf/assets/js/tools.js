
// ****************************************************************************************************************************************************************
//・選択した色がある場合その色を設定する
function setColorPicker(color){
	colorSelected = color;
	$('#btn-change-color-tb').css('background-color',colorSelected);
	setColor();
	setColorText();
}

function setColorText(){
	if(cantText && selectedText != "" ){
		$('#'+selectedText).css('color',colorSelected);
		$('#'+selectedText).focus();
		textOnBoard.map(x=>{
			if((x.id+''+x.idT) == selectedText){
				let pos = {...x.position.find(y => {return y.disp})};
				let idx = x.position.findIndex(z => {return z.disp});
				x.position[idx].disp = false;
				if(pos){
					pos.color = colorSelected;
					x.position.push(pos);
					addHisText(selectedText,'color');
				}
			}
		});
	}
}


// ****************************************************************************************************************************************************************
// 12.「消しゴム」アイコンクリック
function setEraser(value){
	try{
		if(signaPads && signaPads.length > 0){
			clearSelect(true);
			removeShapeSltor();
			$('.stampProdCon').removeClass('active');
			$('.textAreaAddtext').prop('selectionStart', 0).prop('selectionEnd',0).blur(); 
			countData = 0;
			if(signaPads){
				for(let i = 0; i< signaPads.length ;i++){
					if(signaPads[i]._data && signaPads[i]._data.length>0){
						countData++
					}
				}
			}
			canEraser = (countData == 0) ? false : !canEraser;
			setEarser();
		}
		
	}catch{
		common.showErrMessage(common.getMessageWithErrorCode('E99',message),null);
		return;
	}
}

function setEarser(){
	try{
		typeText = false;
		if(canEraser){
			canPaint = !canEraser;
			setFont(false);
			selectedText = ''
			textOnfocus = '';
			typeText = false;
			isTextAreaOn = false;
			$('.fa-pencil,.fa-paint-brush').removeClass("btn-disable").addClass("btn-disable");
			$('#pennew').attr('src','../img/marker.png');
			$('.fa-eraser').removeClass("btn-disable");
		} else {
			$('.fa-eraser').removeClass("btn-disable").addClass("btn-disable");
		}
		//for all tabs
		if(allTabs != null && allTabs.length > 0){
			for(let i = 0; i < allTabs.length; i++){
				if(allTabs[i].signaPads && allTabs[i].signaPads.length > 0){
					allTabs[i].signaPads.forEach(function(item, index){
						item.setCanEraser(canEraser);
					});
				}
			}
		}
		//for current tab
		signaPads.forEach(function(item, index){
			item.setCanEraser(canEraser);
		});
	
		setCursor();
	}catch{
		common.showErrMessage(common.getMessageWithErrorCode('E99',message),null);
		return;
	}
}

function compleText(){
	$('#export-div').off("mousedown mousemove mouseup");
}
// 12.「消しゴム」アイコンクリック
// ****************************************************************************************************************************************************************

// ****************************************************************************************************************************************************************
//9.「ペン」アイコンクリック
function setPaintClick(e,t=null){
	setFont(false);
	setPaint(e);
	typeText = false;
	clearSelect(true);
	removeShapeSltor();
	$('.stampProdCon').removeClass('active');
	$('.textAreaAddtext').prop('selectionStart', 0).prop('selectionEnd',0).blur();
	
}

// ****************************************************************************************************************************************************************
//process set ON OFF paint
function setPaint(highLight, value){
	try{
		canEraser = false;
		$('.fa-eraser').removeClass("btn-disable").addClass("btn-disable");
		if(((signaPads && signaPads.length > 0))){
			// let count = countPads();
			// if(count > 0){
				if(value != null){
					canPaint = value;
				}else{
					if(!highLight && hLight){
						canPaint = true;
					}
					else if(highLight && !hLight){
						canPaint = true;
					}
					else{
						canPaint =  !canPaint;
					}
				}
	
				hLight = highLight;
				//for all tab
				if(allTabs != null && allTabs.length > 0){
					for(let i = 0; i < allTabs.length; i++){
						if(allTabs[i].signaPads && allTabs[i].signaPads.length > 0){
							allTabs[i].signaPads.forEach(function(item, index){
								item.setCanPaint(canPaint, highLight);
								if(canPaint == true){
									item.setColor({
										penColor : colorSelected
									});
								}			
							});
						}
					}
				}
				//for tab
				signaPads.forEach(function(item, index){
					item.setCanPaint(canPaint, highLight);
					if(canPaint == true){
						item.setColor({
							penColor : colorSelected
						});
					}		
				});
				if(canPaint){
					if(highLight){
						$('.fa-paint-brush').removeClass('btn-disable');
						$('#highlightchange').css('display','block')
						$('#pennew').attr('src','../img/markerActive.png');
						$('.fa-pencil').removeClass('btn-disable').addClass('btn-disable');
					}
					else{
						$('.fa-pencil').removeClass('btn-disable');
						$('.fa-paint-brush').removeClass('btn-disable').addClass('btn-disable');
						$('#highlightchange').css('display','none')
						$('#pennew').attr('src','../img/marker.png');
					}
				}
				else{
					$('.fa-paint-brush').removeClass('btn-disable').addClass('btn-disable');
					$('.fa-pencil').removeClass('btn-disable').addClass('btn-disable');
					$('#highlightchange').css('display','none')
					$('#pennew').attr('src','../img/marker.png');
				}
			}else{
				canPaint = false;
				return;
			}
		// }
		setCursor();
	}catch (error){
		common.showErrMessage(common.getMessageWithErrorCode('E99',message),null);
		return;
	}
}	

// ****************************************************************************************************************************************************************
//process set color of app
function setColor(){
	//for all tab
	if(allTabs != null && allTabs.length > 0){
		for(let i = 0; i < allTabs.length; i++){
			if(allTabs[i].signaPads && allTabs[i].signaPads.length > 0){
				allTabs[i].signaPads.forEach(function(item, index){
					item.setColor({
						penColor : colorSelected
					});
				});
			}
		}
	}

	//for current tab
	if(signaPads != null && signaPads.length > 0){
		signaPads.forEach(function(item, index){
			item.setColor({
				penColor : colorSelected
			});
		});
	}
}
//9.「ペン」アイコンクリック
// ****************************************************************************************************************************************************************

// ****************************************************************************************************************************************************************
//14.「線の幅選択」アイコンクリック
function setDotSize(size){
	
	dotSize = size;
	//for all tab
	if(allTabs != null && allTabs.length > 0){
		for(let i = 0; i < allTabs.length; i++){
			if(allTabs[i].signaPads && allTabs[i].signaPads.length > 0){
				allTabs[i].signaPads.forEach(function(item, index){
					item.setDotSize(size);
				});
			}
		}
	}
	//for current tab
	if(signaPads != null && signaPads.length > 0){
		signaPads.forEach(function(item, index){
			item.setDotSize(size);
		});
	}
}
//14.「線の幅選択」アイコンクリック
// ****************************************************************************************************************************************************************

function setOpacity(){
	//for all tab
	if(allTabs != null && allTabs.length > 0){
		for(let i = 0; i < allTabs.length; i++){
			if(allTabs[i].signaPads && allTabs[i].signaPads.length > 0){
				allTabs[i].signaPads.forEach(function(item, index){
					item.setOpacity(hLightOpacity);
				});
			}
		}
	}
	//for current tab
	signaPads.forEach(function(item, index){
		item.setOpacity(hLightOpacity);
	});
}

