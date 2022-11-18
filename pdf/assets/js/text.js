// ****************************************************************************************************************************************************************
// process 20.「テキストボックス」アイコンクリック
function setStartText(){
	//change size
    $('body').on('change','#setSize',(e)=>{
		fontSizeSelected = e.currentTarget.value;
		changeSizeFocusText();
		if(svgMoveEVent){
			svgMoveEVent.setFontSize(fontSizeSelected);
		}
	}).on("mouseenter",'.textAreaAddtext',()=>
		focusText = true
	).on("mouseleave",'.textAreaAddtext',()=>
		focusText = false
	).on("click",'.font-container',(e)=>{
		let target = e.currentTarget.getAttribute("id");
		// if( selectedText == "" || selectedText != (target+"Text")){
		$('.font-container').removeClass('on');
		selectedText = target+"Text";
		e.currentTarget.classList.add("on");
		let item = textOnBoard.find(x=>{return x.id == target});
		let pos = item.position.find(y=>{return y.disp});
		$('#setSize').val(pos.size);
		// }
		
	}).on('click','.dragElem,.dot',(e)=> {
		$('.textAreaAddtext').blur(); 
		// if( selectedText == "" || selectedText != (target+"Text")){
		delDragtext();
		textOnfocus = '';
		typeText = false;
		isTextAreaOn = false;
		interact('#'+e.currentTarget.parentElement.getAttribute('id')).draggable(true);
		interact('#'+e.currentTarget.parentElement.getAttribute('id')).resizable(true);
		offScroll(false);
		// }
	}).on('mouseenter touchstart','.dragElem',()=> {
		onDragElement = true;
	}).on('focus','.textAreaAddtext',(e)=> { 
		if(!typeText){
			$('.textAreaAddtext').prop('selectionStart', 0).prop('selectionEnd',0); 
			selectedText = e.currentTarget.getAttribute('id');
			textOnfocus = e.currentTarget.value;
			typeText = true;
			isTextAreaOn = true;
			delDragtext();
			offScroll(true);
		}
		
	}).on('touchstart','.font-container',(e)=>{
		if(cantText){
			if(e.touches.length >= 2){
				let touchs = e.touches;
				let touch1 = {x:touchs[0].clientX,y:touchs[0].clientY};
				let touch2 = {x:touchs[1].clientX,y:touchs[1].clientY};
				zoomFileCallBack({touchs : [touch1, touch2], endTouch: false});
			}
		}
		
	}).on('touchmove','.font-container',(e)=>{
		if(cantText){
			if(e.touches.length >= 2){
				let touchs = e.touches;
				let touch1 = {x:touchs[0].clientX,y:touchs[0].clientY};
				let touch2 = {x:touchs[1].clientX,y:touchs[1].clientY};
				zoomFileCallBack({touchs : [touch1, touch2], endTouch: false});
			} 
		}
	}).on('touchend','.font-container',(e)=>{
		if(cantText){
			if(e.touches.length >= 2){
				zoomFileCallBack({touchs : [], endTouch: true});
			} else{
				offScroll(false);
			}
		}
		
	}).on("mousedown",'.textAreaAddtext',(event)=>{
			if(event.which==2){
				event.preventDefault();
				event.stopPropagation();
				
				let idtab = event.currentTarget.parentElement.getAttribute('tab');
				let ind = event.currentTarget.parentElement.getAttribute('index');
				turnScroll3(idtab,ind, event);
				// scrollFileCallBack({ x: event.clientX, y: event.clientY, scroll: true, which: event.which });
				// $('.imgContainer').removeClass('active zindx3 zindx2 zindx1').addClass('zindx1');
				
			}
		});
	}

	function turnScroll3(idtab,ind, e) {
		if (allTabs != null && allTabs.length > 0) {
			for (let i = 0; i < allTabs.length; i++) {
				if (allTabs[i].idtab == idtab) {
					allTabs[i].signaPads[ind].setScroll(true);
					$('.textAreaAddtext').prop('selectionStart', 0).prop('selectionEnd',0); 
					e.currentTarget.blur();
					$('.font-container').removeClass('zindx1 zindx2 zindx3 on').addClass('zindx1');
					dragText = true;
					scrollFileCallBack({ x: e.clientX, y: e.clientY, scroll: true, which: e.which });
					return;
				}
			}
		}
	};

// ****************************************************************************************************************************************************************
//ON OFF text button
function setFont(e = null){
	if((signaPads && signaPads.length > 0 )){
		// let count = countPads();
		// if(count > 0){
			clearSelect(true);
			removeShapeSltor();
			$('.stampProdCon').removeClass('active');
			$('.textAreaAddtext').blur(); 
			if(e != null){
				if(cantText = false) return;
				cantText = false;
				setText(cantText);
				selectedText = "";
				//for all tabs
				if(allTabs != null && allTabs.length > 0){
					for(let i = 0; i < allTabs.length; i++){
						if(allTabs[i].signaPads && allTabs[i].signaPads.length > 0){
							allTabs[i].signaPads.forEach(function(item, index){
								item.setCanText(cantText);		
							});
						}
					}
				}
				//for current tab
				if(itemLoadPdf){
					signaPads.forEach(function(item, index){
						item.setCanText(cantText);		
					});
				}
			} else{
				selectedText = "";
				setPaint(false,false);
				cantText = !cantText;
				setText(cantText);
				//for all tabs
				if(allTabs != null && allTabs.length > 0){
					for(let i = 0; i < allTabs.length; i++){
						if(allTabs[i].signaPads && allTabs[i].signaPads.length > 0){
							allTabs[i].signaPads.forEach(function(item, index){
								item.setCanText(cantText);		
							});
						}
					}
				}
				//for current tab
				if(itemLoadPdf){
					signaPads.forEach(function(item, index){
						item.setCanText(cantText);		
					});
				}
			}
		// }
		setCursor();
	}
}

// ****************************************************************************************************************************************************************
//process ON OFF text button
function setText(type,zom = null){
	$('.textAreaAddtext').prop('selectionStart', 0).prop('selectionEnd',0).blur(); 
	typeText = false;
	offScroll(false);
	if(zom == null){
		$('.fa-text-width').removeClass('btn-disable');
		$('.font-container').removeClass('on');
	}
	if(!type) {
		if(zom == null){
			$('.fa-text-width').addClass('btn-disable');
		}
		$('.font-container').removeClass('zindx1 zindx2 zindx3').addClass('zindx1');
		$('.font-container,.font-container .dot').removeClass('activeT').addClass('reactiveT');
	}else{
		
		$('.font-container').removeClass('zindx1 zindx2 zindx3').addClass('zindx3');
		$('.font-container,.font-container .dot').removeClass('reactiveT').addClass('activeT');
	}
}

// ****************************************************************************************************************************************************************
//start event
function callbackTextStart(e,e2=null,pageNumer,w = false,h = false){
	if(!cantText) return;
	if(focusText) return;
	textStart = true;
	typeText = false;
	offScroll(false);
	delDragtext();
	let pageAddText = itemLoadPdf.page.find(xx=>{return xx.index == pageNumer});
	$('#setSize').val('12');
	fontSizeSelected = 12;
	$('.font-container').removeClass('on zindx1 zindx2 zindx3').addClass('zindx1');
	$('.imgContainer,.svg-container').removeClass('zindx1 zindx2 zindx3').addClass('zindx1');
	$('.textAreaAddtext').prop('selectionStart', 0).prop('selectionEnd',0).blur(); 
	selectedText = "";
	let id = 'text'+common.UUID();
	let text = {
		id:id,
		position: [
			{
				x:e.offsetX,
				y:(e.offsetY),
				width : 10,
				height : 10,
				color: colorSelected,
				size : (+fontSizeSelected),
				sizeCalc : (+fontSizeSelected*2),
				disp:true
			}
		],
		idT : name+'Text',
		display:'block',
		degree:pageAddText.rotate
	};
	textOnBoard.push(text);
	let div = document.createElement('div');

	setAttributes(div, {
		'class':'font-container on activeT zindx1',
		'id':text.id,
		'style':'width:10px;height:10px;transform: translate('+e.offsetX+'px, '+(e.offsetY)+'px) rotate(-'+pageAddText.rotate+'deg);',
		'data-x':e.offsetX,
		'data-y':e.offsetY,
		'data-w':10,
		'data-h':10,
		'rotate':pageAddText.rotate,
		'rotateReal':pageAddText.rotate,
		'tab':tabCurrent,
		'index' : pageAddText.index
	});

	mWT = w ;mHT = h;
	xT=e.clientX;
	yT=e.clientY;
	if(e2 != null){
		e2.currentTarget.parentElement.appendChild(div);
		
		return;
	}
	e.currentTarget.parentElement.appendChild(div);
}

// ****************************************************************************************************************************************************************
//move text
function callbackText(e){
	if(!textStart) return;
	let x = calcZP((e.clientX-xT));
	let y = calcZP((e.clientY-yT));
	let idx = textOnBoard.length-1;
	if(mWT && mHT) {x = x > mWT ? mWT : x;y = y > mHT ? mHT : y;}
	textOnBoard[idx].position[0].width = x;
	textOnBoard[idx].position[0].height = y;
	$('#'+textOnBoard[idx].id).css({'width':x+'px','height':y+'px'});
	$('#'+textOnBoard[idx].id).attr('data-w',(e.clientX-xT));
	$('#'+textOnBoard[idx].id).attr('data-h',(e.clientY-yT));
	$('#'+textOnBoard[idx].id).attr('data-calW',x);
	$('#'+textOnBoard[idx].id).attr('data-calH',y);
	
}

// ****************************************************************************************************************************************************************
//end move text
function callbackTextEnd(page){
	if(!textStart) return;
	textStart = false;
	let idx = textOnBoard.length-1;
	$('.font-container').removeClass('zindx1 zindx2 zindx3').addClass('zindx3');
	// $('.font-container,.imgContainer').removeClass('zindx1').addClass('zindx2');
	if(textOnBoard[idx].position[0].width <= 10 || textOnBoard[idx].position[0].height <= 10){
		cleanError();
		return;
	}
	initBox(textOnBoard[idx].id,page,idx);
	clearHistoryRedo();
	textOnBoard[idx].page = page;
	$('.fa-undoCustom').removeClass('btn-disable');
}

// ****************************************************************************************************************************************************************
//change size of focus text
function changeSizeFocusText(){
	if(cantText && selectedText != ""){
		$('#'+selectedText).css('font-size',(fontSizeSelected*2)+'px');
		$('#'+selectedText).focus();
		
		textOnBoard.map(x=>{
			if((x.id+''+x.idT) == selectedText){
				let pos = {...x.position.find(y => {return y.disp})};
				let idx = x.position.findIndex(z => {return z.disp});
				x.position[idx].disp = false;
				if(pos){
					pos.size = (+fontSizeSelected);
					pos.sizeCalc = (+fontSizeSelected*2)
					x.position.push(pos);
					addHisText(selectedText,'fontSize');
				}
			}
		});
	}
}

// ****************************************************************************************************************************************************************
//clear text field error when end event rise
function cleanError(){
	$('#'+textOnBoard[textOnBoard.length-1].id+',#'+textOnBoard[textOnBoard.length-1].id+'del').remove();
	textOnBoard.pop();
}

// ****************************************************************************************************************************************************************
//init text field
function initBox(name,page,idx,value = "",copy = false){
	let rotate = itemLoadPdf.page[page].rotate;
	
	let item = document.getElementById(name);
	let textW = '',textH ='',transfrom ='',top='',left='',position=(rotate == 0 ? '' : 'position:absolute;');
	var x = (parseFloat(item.getAttribute('data-x')) || 0),
		y = (parseFloat(item.getAttribute('data-y')) || 0),
		cw = (parseFloat(item.getAttribute('data-calW')) || 0), 
		ch = (parseFloat(item.getAttribute('data-calH')) || 0);
	switch(rotate){
		case 90:
			let yRot90 = (y-cw);
			item.style.width = ch+ 'px';item.style.height = cw + 'px';
			if(!copy) item.style.webkitTransform = item.style.transform = 'translate(' + x + 'px,' + yRot90 + 'px)';
			item.setAttribute('data-y', yRot90);
			item.setAttribute('data-calW', ch);
			item.setAttribute('data-calH', cw);
			textW = 'width:'+cw+'px;',textH ='height:'+ch+'px;',transfrom ='transform:rotate(-90deg);',top='top:100%;',left='left:0';
			textOnBoard[idx].position[0].y = yRot90;
			textOnBoard[idx].position[0].width = ch;
			textOnBoard[idx].position[0].height = cw;
			break;
		case 180:
			let xRot180 = (x-cw);
			let yRot180 = (y-ch);
			if(!copy) item.style.webkitTransform = item.style.transform = 'translate(' + xRot180 + 'px,' + yRot180 + 'px)';
			item.setAttribute('data-x', xRot180);
			item.setAttribute('data-y', yRot180);
			textW = 'width:'+cw+'px;',textH ='height:'+ch+'px;',transfrom ='transform:rotate(-180deg);',top='top:100%;',left='left:100%';
			textOnBoard[idx].position[0].x = xRot180;
			textOnBoard[idx].position[0].y = yRot180;
			break;
		case 270:
			let xRot270 = (x-ch);
			item.style.width = ch + 'px';item.style.height = cw + 'px';
			if(!copy) item.style.webkitTransform = item.style.transform = 'translate(' + xRot270 + 'px,' + (y) + 'px)';
			item.setAttribute('data-x', xRot270);
			item.setAttribute('data-calH', cw);
			item.setAttribute('data-calW', ch);
			textW = 'width:'+cw+'px;',textH ='height:'+ch+'px;',transfrom ='transform:rotate(-270deg);',top='top:0;',left='left:100%';
			textOnBoard[idx].position[0].x = xRot270;
			textOnBoard[idx].position[0].width = ch;
			textOnBoard[idx].position[0].height = cw;
			break;
	}
	historyMain.push({type:'text',page:page, data : textOnBoard[idx] , idx:0 ,status:'init'});
	if(copy){
		getPositionCopy(textOnBoard[idx].position[0]);
		item.style.webkitTransform = item.style.transform = 'translate('+textOnBoard[idx].position[0].x+'px, '+textOnBoard[idx].position[0].y+'px) ';
		item.setAttribute('data-x', textOnBoard[idx].position[0].x);
		item.setAttribute('data-y', textOnBoard[idx].position[0].y);
	}
	item.innerHTML = createElementTextBox(name,rotate,transfrom,textW,textH,position,top,left,value,textOnBoard[idx].position[0].color,textOnBoard[idx].position[0].sizeCalc);
	interact('#'+name)
	.draggable({
		// inertia: true,
		restrict: {
			restriction: "parent",
			endOnly: false,
			elementRect: { top: 0, left: 0, bottom: 1, right: 1 }
		},
		autoScroll: false,
		onstart:startDrag,
		onmove: dragMoveListener,
		onend : endMove
	})
	.resizable({
		preserveAspectRatio: false,
		edges: { left: '.left', right: '.right', bottom: '.bot', top: '.top' },
		restrict: {
			restriction: "parent",
			endOnly: false
		},

  	}).on('resizestart', function (event) {
		let target = event.target;
		textOnBoard.map(data=>{
			if(data.id == target.id) {
				let curr = data.position.find(x=>{return x.disp});
				data.position[data.position.length-1].disp=false;
				data.position.push(createNewPos(event,curr));
			
				// target.setAttribute('')
			}
		});
	})
    .on('resizemove', function (event) {
		offScroll(true);
		touchMove = true;
		var target = event.target;
		var text = target.childNodes[12];
		var x = (parseFloat(target.getAttribute('data-x')) || 0),
			y = (parseFloat(target.getAttribute('data-y')) || 0);
		let rotateReal = (+target.getAttribute('rotateReal'));
		var w = (parseFloat(target.getAttribute('data-calw')) || 0), 
			h = (parseFloat(target.getAttribute('data-calh')) || 0);
		// console.log(event.deltaRect.width,event.dx,event.dy)
		switch(rotateReal){
			case 0:
				w = calcZP(event.rect.width);
				h = calcZP(event.rect.height);
				x +=calcZP(event.deltaRect.left);
				y +=calcZP(event.deltaRect.top);
				break;
			case 90:
				w += calcZP(event.deltaRect.height);
				h += calcZP(-event.deltaRect.width);
				x += calcZP(event.deltaRect.top);
				y += (-calcZP(event.deltaRect.left));
				break;
			case 180:
				w += calcZP(-event.deltaRect.width);
				h += calcZP(-event.deltaRect.height);
				x += (-calcZP(event.deltaRect.left));
				y += (-calcZP(event.deltaRect.top));
				break;
			case 270:
				w += calcZP(-event.deltaRect.height);
				h += calcZP(event.deltaRect.width);
				x += (-calcZP(event.deltaRect.top));
				y += (calcZP(event.deltaRect.left));
				break;
		}
		
		target.setAttribute('data-calw', w);
		target.setAttribute('data-calh', h);
		target.setAttribute('data-x', x);
		target.setAttribute('data-y', y);
		if(w > 0 && h > 0){
			target.style.width = w + 'px';target.style.height = h + 'px';
			target.style.webkitTransform = target.style.transform = 'translate(' + x + 'px,' + y + 'px) ';
			setWHET(text);
			textOnBoard.map(data=>{
				if(data.id == target.id) {
					let idx = data.position.length-1
					data.position[idx].x = x;
					data.position[idx].y = y;
					data.position[idx].width = w;
					data.position[idx].height = h;
				}
			});
		}
	}).on('resizeend' , function(e){
		touchMove = false;
		offScroll(false);
		let target = document.getElementById(selectedText.substring(0,selectedText.length-4));
		w = (parseFloat(target.getAttribute('data-calw')) || 0), 
		h = (parseFloat(target.getAttribute('data-calh')) || 0);
		if(w < 0) target.setAttribute('data-calw', 0);
		if(h < 0) target.setAttribute('data-calh', 0);
		let string = target.style.transform;
		let xy = string.substring(string.indexOf("(")+1,string.lastIndexOf(")")).split(",");
		target.setAttribute('data-x', xy[0].replace("px",""));
		target.setAttribute('data-y', xy[1].replace("px",""));
		addHisText(e.target.id,'resize');
	});

	function startDrag(event){
		if(focusText) return;
		if(onDragElement){
			textOnfocus = '';
			typeText = false;
			isTextAreaOn = false;
		}
		// console.log(event)
		// if(isTextAreaOn) return;
		textOnBoard.map(data=>{
			if(data.id == event.target.id) {
				let curr = data.position.find(x=>{return x.disp});
				data.position.map(x=>{x.disp=false});
				// data.position[data.position.length-1].disp=false;
				data.position.push(createNewPos(event,curr));
			}
		});
	}

	function dragMoveListener (event) {
		if(isTextAreaOn) return;
		mouseMove = true;
		touchMove = true;
		offScroll(true);
		
		var target = event.target;
		let rotate = (+target.getAttribute('rotate'));
		let rotateReal = (+target.getAttribute('rotateReal'));
		// let align = (target.getAttribute('align'));
		var x = (parseFloat(target.getAttribute('data-x')) || 0),
		y = (parseFloat(target.getAttribute('data-y')) || 0);

		switch(rotateReal){
			case 0:
				x+=calcZP(event.dx);
				y+=calcZP(event.dy);
				break;
			case 90:
				x+=calcZP(event.dy);
				y+=(-calcZP(event.dx));
				break;
			case 180:
				x+=(-calcZP(event.dx));
				y+=(-calcZP(event.dy));
				break;
			case 270:
				x+=(-calcZP(event.dy));
				y+=(calcZP(event.dx));
				break;
		}
		
		target.style.webkitTransform = target.style.transform = 'translate(' + x + 'px, ' + y + 'px) ';
		target.setAttribute('data-x', x);
		target.setAttribute('data-y', y);
		textOnBoard.map(data=>{
			if(data.id == target.id) {
				let idx = data.position.length-1
				data.position[idx].x=(+x);
				data.position[idx].y=(+y);
			}
		});
	}
	function endMove(e){
		mouseMove = false;
		touchMove = false;
		offScroll(false);
		addHisText(e.target.id,'move');
		onDragElement = false;
	}

	window.dragMoveListener = dragMoveListener;
	if(!copy) {
		$('#'+name+'Text').focus();
		textOnfocus = '';
		typeText = true;
	}
};

// ****************************************************************************************************************************************************************
//calc position of text field

function setPosition(target){
	target.style.webkitTransform = target.style.transform = 'translate(' + x + 'px, ' + y + 'px) rotate(-'+rotate+'deg)';
	target.setAttribute('data-x', x);
	target.setAttribute('data-y', y);
	textOnBoard.map(data=>{
		if(data.id == target.id) {
			let idx = data.position.length-1
			data.position[idx].x=(+x);
			data.position[idx].y=(+y);
		}
	});
}
// ****************************************************************************************************************************************************************
//turn off or turn on parent element when use ( zoom , drag , move, zoom ) text filed
function offScroll(t){
	if(itemLoadPdf){
		$("#export-div"+tabCurrent).css('overflow',(t || typeText) ? 'hidden' : 'auto');
	}
}

// ****************************************************************************************************************************************************************
// add history off text element
function addHisText(id,status){
	let item = textOnBoard.find(x => {
		if(status == 'color' || status == 'fontSize'){
			return (x.id+''+x.idT) == id;
		}else{
			return x.id == id;
		}
	});
	let idx = (item.position.length-1);
	historyMain.push({type:'text',page:item.page, data : item,idx : idx,status:status});
	clearHistoryRedo();

}

// ****************************************************************************************************************************************************************
//create new position of text element
function createNewPos(event,curr){
	return {
		x: (+event.target.getAttribute('data-x')),
		y: (+event.target.getAttribute('data-y')),
		width: (+(event.target.style.width.replace("px",""))),
		height: (+(event.target.style.height.replace("px",""))),
		color:curr.color,
		size : curr.size,
		sizeCalc : curr.sizeCalc,
		disp:true
	}
}



function createTextCopy(textCop,value){
	let pageAddText = itemLoadPdf.page.find(xx=>{return xx.index == (pageCurrent-1)});
	$('#setSize').val('12');
	fontSizeSelected = 12;
	$('.font-container').removeClass('on zindx1 zindx2 zindx3').addClass('zindx1');
	$('.textAreaAddtext').prop('selectionStart', 0).prop('selectionEnd',0).blur(); 
	selectedText = "";
	let id = 'text'+textOnBoard.length;
	let text = {
		id:id,
		position: textCop.position,
		idT : name+'Text',
		display:'block',
		page :(pageCurrent-1),
		degree:pageAddText.rotate
	};
	// getPositionCopy(text.position[0]);
	textOnBoard.push(text);
	let div = document.createElement('div');
	setAttributes(div, {
		'class':'font-container on activeT zindx1',
		'id':text.id,
		'style':'width:'+text.position[0].width+'px;height:'+text.position[0].height+'px;',
		'data-w':text.position[0].width,
		'data-h':text.position[0].height,
		'data-calW':text.position[0].width,
		'data-calH':text.position[0].height,
		'rotate':pageAddText.rotate,
		'rotateReal':pageAddText.rotate,
		'tab':tabCurrent,
		'index' : pageAddText.index
	});

	$('.divMain-'+itemLoadPdf.seqNo+'-page-'+(pageCurrent-1)+'-'+tabCurrent)[0].append(div);
	delDragtext();
	initBox(id,(pageCurrent-1),(textOnBoard.length-1),value,true);
	selectedText = id+'Text';
	let view = document.getElementById(tabCurrent+'-file-'+itemLoadPdf.seqNo+'-page-'+ (pageCurrent-1));
	view.scrollIntoView({behavior: 'smooth',block: "start",inline:"start"});
	// e.currentTarget.parentElement.appendChild(divDel);
}


function setWHET(e){
	let degree = (+e.getAttribute('rotate'));
	let w = e.parentElement.getAttribute('data-calw')-6;
	let h = e.parentElement.getAttribute('data-calh')-6;
	e.style.width = (degree == 90 || degree == 270) ? (h+'px') : (w+'px') ;
	e.style.height = (degree == 90 || degree == 270) ? (w+'px') : (h+'px') ;
}

function delDragtext(){
	textOnBoard.map(x=>{
		interact('#'+x.id).draggable(false);
		interact('#'+x.id).resizable(false);
	});
	// $('.textAreaAddtext').css('user-select','none')
}

function getPositionReal(target,sx, sy){
	var rect = target.getBoundingClientRect();
	let degree = (+target.parentElement.getAttribute('rotate')),
		cale = (+target.parentElement.getAttribute('scale')),
		currentScale = 1 / cale,
		realX = (sx-rect.left) * currentScale,
		realY = (sy-rect.top) * currentScale,
		w = rect.width*currentScale-realX,
		h = rect.height*currentScale-realY,
		res = {};
	switch(degree){
		case 0:
			res = {x:realX, y:realY, w, h};
			break;
		case 90:
			res = {x:realY,y:(rect.width*currentScale-realX),w,h};
			break;
		case 180:
			res = {x:(rect.width*currentScale - realX),y:(rect.height*currentScale-realY),w,h};
			break;
		case 270:
			res = {x:(rect.height*currentScale - realY),y:realX,w,h};
			break;
	} 
	return res;
};

// END 20.「テキストボックス」アイコンクリック
// ****************************************************************************************************************************************************************
