// ****************************************************************************************************************************************************************
// UNDO REDO HISTORY (UNDO, REDO)
function undo(){
	try{
		if(historyMain.length == 0) return;
		
		setPaint(false, false);
		setFont(false);
		setText(false);
		clearSelect(true);
		removeShapeSltor();
		$('.stampProdCon').removeClass('active');
		if(historyMain.length == 1){
			$('.fa-undoCustom').removeClass('btn-disable').addClass('btn-disable');
		}
		$('.fa-repeatCustom').each(function(index){
			$('.fa-repeatCustom')[index].classList.remove("btn-disable");
		});

		// let size = historyMain.length;
		let itemUndo = historyMain.pop();//JSON.parse(JSON.stringify(historyMain[size-1]));
		if(itemUndo.type == "shape"){
			handleHistoryShape(itemUndo,'undo');
			return;
		}
		let status = itemUndo.status;
		
		historyMainRedo.push(itemUndo);
		let index = getIndex(itemUndo);
		if(itemUndo.type != "his" && itemUndo.type != "del" && itemUndo.type != "rotate"){
			if(index != -1){
				itemUndo = JSON.parse(JSON.stringify(historyMain[index]));
			}
		}
		
		if((itemUndo.page+1) != $('#currentPage').val()){
			let view = document.getElementById(tabCurrent+'-file-'+itemLoadPdf.seqNo+'-page-'+ itemUndo.page);
			view.scrollIntoView({block: "start",behavior: 'smooth'});
			if(itemUndo.type == "text"){
				setTimeout(_=>{sethistoryText(itemUndo.data.id,(index != -1 ) ? itemUndo.idx : index,status,true)},500);
				view.scrollIntoView({block: "start",behavior: 'smooth'});
			} else if (itemUndo.type == "img"){
				setTimeout(_=>{sethistoryImg(itemUndo.data.id,(index != -1 ) ? itemUndo.idx : index,status,true);},500);
				view.scrollIntoView({block: "start",behavior: 'smooth'});
			} else if(itemUndo.type == 'rotate'){
				setTimeout(_=>{sethistoryRotate(itemUndo.status,itemUndo.page);},500);
				view.scrollIntoView({block: "start",behavior: 'smooth'});
			} else {
				setTimeout(_=>{signaPads[itemUndo.page].undo(itemUndo);},500);
				view.scrollIntoView({block: "start",behavior: 'smooth'});
			}
			
		} else {
			if(itemUndo.type == "text"){
				sethistoryText(itemUndo.data.id,(index != -1 ) ? itemUndo.idx : index,status,true);
			} else if(itemUndo.type == "img"){
				sethistoryImg(itemUndo.data.id,(index != -1 ) ? itemUndo.idx : index,status,true);
			} else if(itemUndo.type == 'rotate'){
				sethistoryRotate(itemUndo.status,itemUndo.page);
			} else {
				signaPads[itemUndo.page].undo(itemUndo);
			}
		}
		setCursor();
		if(historyMain && historyMain.length > 0){
			if(itemUndo['FKMulti']){
				let id = itemUndo['FKMulti'];
				let idNext = historyMain[historyMain.length - 1]['FKMulti'];
				if(idNext != null && id == idNext){
					undo();
				}
			}
		}
	} catch (err) {
		console.log(err)
		common.showErrMessage(common.getMessageWithErrorCode('E99',message),null);
		return;
	}
}

function redo(){
	try{
		if(historyMainRedo.length == 0) return;
		setPaint(false, false);
		setFont(false);
		clearSelect(true);
		removeShapeSltor();
		$('.stampProdCon').removeClass('active');
		if(historyMainRedo.length == 1){
			$('.fa-repeatCustom').removeClass('btn-disable').addClass('btn-disable');
		}

		$('.fa-undoCustom').removeClass("btn-disable");
		// let size = historyMainRedo.length;
		let itemRedo = historyMainRedo.pop();//JSON.parse(JSON.stringify(historyMainRedo[size-1]));
		if(itemRedo.type == "shape"){
			handleHistoryShape(itemRedo,'redo');
			return;
		}
		historyMain.push(itemRedo);
		if((itemRedo.page+1) != $('#currentPage').val()){
			let view = document.getElementById(tabCurrent+'-file-'+itemLoadPdf.seqNo+'-page-'+ itemRedo.page);
			view.scrollIntoView({block: "start",behavior: 'smooth'});
			if(itemRedo.type == "text"){
				setTimeout(_=>{
					sethistoryText(itemRedo.data.id,itemRedo.idx,itemRedo.status,false);
					view.scrollIntoView({block: "start",behavior: 'smooth'});
				},500);
			} else if(itemRedo.type == "img"){
				setTimeout(_=>{sethistoryImg(itemRedo.data.id,itemRedo.idx,itemRedo.status,false);},300);
				view.scrollIntoView({block: "start",behavior: 'smooth'});
			} else if(itemRedo.type == 'rotate'){
				setTimeout(_=>{sethistoryRotate(itemRedo.status,itemRedo.page,false);},300);
				view.scrollIntoView({block: "start",behavior: 'smooth'});
			} else {
				setTimeout(_=>{signaPads[itemRedo.page].redo(itemRedo);},300);
				view.scrollIntoView({block: "start",behavior: 'smooth'});
			}
		}else{
			if(itemRedo.type == "text"){
				sethistoryText(itemRedo.data.id,itemRedo.idx,itemRedo.status,false);
			} else if(itemRedo.type == "img"){
				sethistoryImg(itemRedo.data.id,itemRedo.idx,itemRedo.status,false);
			} else if(itemRedo.type == 'rotate'){
				sethistoryRotate(itemRedo.status,itemRedo.page,false);
			} else{
				signaPads[itemRedo.page].redo(itemRedo);
			}
		}
		setCursor();
		if(historyMainRedo && historyMainRedo.length > 0){
			if(itemRedo['FKMulti']){
				let id = itemRedo['FKMulti'];
				let idNext  = historyMainRedo[historyMainRedo.length - 1]['FKMulti'];
				if(idNext != null && id == idNext){
					redo();
				}
			}
		}
	}catch (err){
		console.log(err)
		common.showErrMessage(common.getMessageWithErrorCode('E99',message),null);
		return;
	}
}

// ****************************************************************************************************************************************************************
//set history of text field
function sethistoryText(id,idx,status,t){
	textOnBoard.map(x => {
		if(x.id == id){
			if(idx == -1 || (idx == 0 && !t) || status == 'delete'){
				if(x.display == 'none'){
					$('#'+id).css('display','block');
					x.display = 'block';
					x.position[idx == -1 ? 0 : idx].disp = true;
				}else{
					$('#'+id).css('display','none');
					x.display = 'none';
					x.position.map(ii=>ii.disp = false);
				}
			}
			if(idx == -1) return;
			let pos = x.position[idx];
			x.position.map(ii=>ii.disp = false);
			x.position[idx].disp = true;
			let target = $('#'+id)[0];
			let tar1 = $('#'+id+x.idT)[0];
			target.style.webkitTransform = target.style.transform = 'translate(' + pos.x + 'px,' + pos.y + 'px)';
			target.setAttribute('data-x', pos.x);
			target.setAttribute('data-y', pos.y);
			target.style.width = tar1.style.width = pos.width + 'px';
			target.style.height = tar1.style.height = pos.height + 'px';
			tar1.style.fontSize = pos.sizeCalc+'px';
			tar1.style.color = pos.color;

		}
	});
}

function sethistoryImg(id,idx,status,t){
	imgOnBoard.map(x => {
		if(x.id == id){
			if(idx == -1 || (idx == 0 && !t) || status == 'delete'){
				if(x.display == 'none'){
					$('#'+id+',#hinhctn'+id).css('display','block');
					x.display = 'block';
					x.position[idx == -1 ? 0 : idx].disp = true;
				}else{
					$('#'+id+',#hinhctn'+id).css('display','none');
					x.display = 'none';
					x.position.map(ii=>ii.disp = false);
				}
			}
			if(idx == -1) return;
			let pos = x.position[idx];
			x.position.map(ii=>ii.disp = false);
			x.position[idx].disp = true;
			let target = $('#'+id)[0];
			let imgEle = $("#hinh"+target.id)[0];
			let imgctn = $("#hinhctn"+target.id)[0];
			target.style.webkitTransform = target.style.transform = imgctn.style.webkitTransform = imgctn.style.transform  = 'translate(' + pos.x + 'px,' + pos.y + 'px)';
			target.setAttribute('data-x', pos.x);target.setAttribute('data-y', pos.y);
			target.style.width  = pos.width + 'px';target.style.height = pos.height + 'px';
			setWHE(imgEle,pos.width,pos.height);
			setWHE(imgctn,pos.width,pos.height);
		}
	});
}

function sethistoryRotate(type,page,action = true){
	let left = type == 'left';
	RotateValue(action ? !left : left,true,page);
	RotatePage(page);
}

// ****************************************************************************************************************************************************************
//clear history of redo


// ****************************************************************************************************************************************************************
//push history after eraser line
function pageEraserData(info){
	clearHistoryRedo();
	historyMain.push(info);
	let countData = countEarser();
	if(countData == 0){
		canEraser = false;
		signaPads.forEach(function(item, index){
			item.setCanEraser(canEraser);
		});
		$('.fa-eraser').removeClass("btn-disable").addClass("btn-disable");
		setCursor();
	}
}

// ****************************************************************************************************************************************************************
//push history data after  drawing line
function setHistoryUndo(pageNumber){
	let le = signaPads[pageNumber]._data.length
	if(signaPads[pageNumber]._data[le-1].points){
		let points = signaPads[pageNumber]._data[le-1].points;
		let points1 = [];
		points.map(x=>{
			if(x.x.toString() != 'NaN' && x.y.toString() != 'NaN') points1.push(x);
		});
		signaPads[pageNumber]._data[le-1].points = points1;
	}
	historyMain.push({type:'his',page:pageNumber,data :signaPads[pageNumber]._data[le-1]});
	$('.fa-undoCustom').removeClass("btn-disable");
	clearHistoryRedo();
}
