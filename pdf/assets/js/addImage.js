function setAddImage() {
	// ADD IMAGE
	document.getElementById("addImage").addEventListener("click", addImage);
	ipcRenderer.on('imagePath', (event, data) => {
		if (data) {
			handleImg(data[0]);
		}
	});

	$('body').on('mouseenter touchstart', '.importLocal,.imgPaintLayer', e => {
		imgOnEneter = true;
		if (imgFocus == "") {
			imgFocus = e.currentTarget.getAttribute('id');
		} else {
			imgFocus = $('.importLocal[current="true"]').attr('id');
		}
	}).on('click', '.importLocal,.imgPaintLayer', e => {
		if (canPaint) {
			setPaint(false);
		}
		if (cantText) {
			setFont(false);
		}
		imgFocus = e.currentTarget.getAttribute('id');
		$('.importLocal').attr('current', false).removeClass('active').addClass('clean');
		e.currentTarget.setAttribute('current', true);
		e.currentTarget.classList.remove('clean')
		$('#' + imgFocus).addClass('active');
		delDragImg();
		setOnOffDragResize(imgFocus, true);
		removeShapeSltor();
		$('.stampProdCon').removeClass('active');
	}).on('mouseleave', '.importLocal,.imgPaintLayer', e => {
		if (!onDragResize) {
			imgOnEneter = false;
		} else {
			resize00 = true;
		}
	}).on('touchstart', '.imgContainer', (e) => {
		if (e.touches.length >= 2) {
			onImgTouchZoom = true;
			let touchs = e.touches;
			let touch1 = {
				x: touchs[0].clientX,
				y: touchs[0].clientY
			};
			let touch2 = {
				x: touchs[1].clientX,
				y: touchs[1].clientY
			};
			zoomFileCallBack({
				touchs: [touch1, touch2],
				endTouch: false
			});
		}
	}).on('touchend', '.imgContainer', (e) => {
		onImgTouchZoom = false;
	}).on('touchmove', '.imgContainer', (e) => {
		if (e.touches.length >= 2) {
			let touchs = e.touches;
			let touch1 = {
				x: touchs[0].clientX,
				y: touchs[0].clientY
			};
			let touch2 = {
				x: touchs[1].clientX,
				y: touchs[1].clientY
			};
			zoomFileCallBack({
				touchs: [touch1, touch2],
				endTouch: false
			});
		}
	}).on("mousedown",'.imgContainer',(event)=>{
		if(event.which==2){
			event.preventDefault();
			event.stopPropagation();
			// scrollFileCallBack({ x: event.clientX, y: event.clientY, scroll: true, which: event.which });
			// $('.imgContainer').removeClass('active zindx3 zindx2 zindx1').addClass('zindx1');
			
		}
	});
}

// END ADD IMAGE
// ****************************************************************************************************************************************************************

function addImage($event = null) {

	if (itemLoadPdf) {
		if (itemLoadPdf.page == null || itemLoadPdf.page.length == 0) {
			return;
		}
		setImage = true;
		setPaint(false, false);
		setFont(false);
		ipcRenderer.send('openFile', 'image');
	}
}

function setOffImage(on = false) {
	setImage = on;
	$('.imgContainer').removeClass('active zindx2 zindx1').addClass(on ? 'zindx2' : 'zindx1');
	$('.svg-container').removeClass('active zindx3 zindx1').addClass(on ? 'zindx3' : 'zindx1');
	return
}

function initImg(name, img, page) {
	let rotate = itemLoadPdf.page[page].rotate;
	let item = document.getElementById(name),
		idx = imgOnBoard.length - 1;
	let textW = 'width:100%;',
		textH = 'height:100%;',
		transfrom = '',
		top = '',
		left = '',
		position = (rotate == 0 ? '' : 'position:absolute;');
	var
		cw = (parseFloat(item.getAttribute('data-w')) || 0),
		ch = (parseFloat(item.getAttribute('data-h')) || 0);
	switch (rotate) {
		case 0:
			textW = 'width:' + (cw) + 'px;', textH = 'height:' + (ch) + 'px;';
			break;
		case 90:
			item.style.width = ch + 'px';
			item.style.height = cw + 'px';
			item.setAttribute('data-w', ch);
			item.setAttribute('data-h', cw);
			textW = 'width:' + (cw) + 'px;',
				textH = 'height:' + (ch) + 'px;',
				transfrom = 'transform:rotate(-90deg);',
				top = 'top:100%;',
				left = 'left:0;';
			imgOnBoard[idx].position[0].width = ch;
			imgOnBoard[idx].position[0].height = cw;
			break;
		case 180:
			textW = 'width:' + (cw) + 'px;',
				textH = 'height:' + (ch) + 'px;',
				transfrom = 'transform:rotate(-180deg);',
				top = 'top:100%;',
				left = 'left:100%;';
			break;
		case 270:
			item.style.width = ch + 'px';
			item.style.height = cw + 'px';
			item.setAttribute('data-h', cw);
			item.setAttribute('data-w', ch);
			textW = 'width:' + (cw) + 'px;',
				textH = 'height:' + (ch) + 'px;',
				transfrom = 'transform:rotate(-270deg);',
				top = 'top:0;', left = 'left:100%;';
			imgOnBoard[idx].position[0].width = ch;
			imgOnBoard[idx].position[0].height = cw;
			break;
	}
	getPositionCopy(imgOnBoard[idx].position[0]);
	let ctnTransform = 'translate(' + imgOnBoard[idx].position[0].x + 'px, ' + imgOnBoard[idx].position[0].y + 'px)';
	item.style.webkitTransform = item.style.transform = ctnTransform;
	item.setAttribute('data-x', imgOnBoard[idx].position[0].x);
	item.setAttribute('data-y', imgOnBoard[idx].position[0].y);
	item.innerHTML = createElementImage(rotate);
	$('.divMain-' + itemLoadPdf.seqNo + '-page-' + (pageCurrent - 1) + '-' + tabCurrent)[0].append(createImage(name, rotate, path.join(pathWork, img), transfrom, textW, textH, position, top, left, ctnTransform));
	historyMain.push({
		type: 'img',
		page: (pageCurrent - 1),
		data: imgOnBoard[idx],
		idx: 0,
		status: 'init'
	});

	interact('#' + name)
		.draggable({
			restrict: {
				restriction: "parent",
				endOnly: false,
				elementRect: {
					top: 0,
					left: 0,
					bottom: 1,
					right: 1
				}
			},

			autoScroll: false,
			onstart: startDrag,
			onmove: dragMoveListener,
			onend: endMove
		})
		.resizable({
			preserveAspectRatio: false,
			edges: {
				left: '.left',
				right: '.right',
				bottom: '.bot',
				top: '.top'
			},
			restrict: {
				restriction: "parent",
				endOnly: false,
			}

		}).on('resizestart', function (event) {
			onDragResize = true;
			offScroll(true);
			imgOnBoard.map(data => {
				if (data.id == imgFocus) {
					let curr = data.position.find(x => {
						return x.disp
					});
					data.position.map(x => x.disp = false);
					data.position.push(createNewPosImg(event, curr));
				}
			});
		}).on('resizemove', function (event) {
			var target = event.target;
			let rotateReal = (+target.getAttribute('rotateReal'));
			var imgEle = $("#hinh" + target.id)[0] //target.childNodes[12];
			var imgctn = $("#hinhctn" + target.id)[0] //target.childNodes[12];
			var x = (parseFloat(target.getAttribute('data-x')) || 0),
				y = (parseFloat(target.getAttribute('data-y')) || 0),
				w = (parseFloat(target.getAttribute('data-w')) || 0),
				h = (parseFloat(target.getAttribute('data-h')) || 0);
			switch (rotateReal) {
				case 0:
					w = calcZP(event.rect.width);
					h = calcZP(event.rect.height);
					x += calcZP(event.deltaRect.left);
					y += calcZP(event.deltaRect.top);
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
			target.setAttribute('data-w', w);
			target.setAttribute('data-h', h);
			target.setAttribute('data-x', x);
			target.setAttribute('data-y', y);

			if (w > 0 && h > 0) {
				target.style.webkitTransform = target.style.transform =
					imgctn.style.webkitTransform = imgctn.style.transform = 'translate(' + x + 'px,' + y + 'px)';

				target.style.width = imgctn.style.width = w + 'px';
				target.style.height = imgctn.style.height = h + 'px';

				setWHE(imgEle, (w), (h))
				imgOnBoard.map(data => {
					if (data.id == target.id) {
						let idx = data.position.length - 1
						data.position[idx].x = x;
						data.position[idx].y = y;
						data.position[idx].width = w;
						data.position[idx].height = h;
					}
				});
			}

		}).on('resizeend', function (e) {
			onDragResize = false;
			offScroll(false);
			let target = document.getElementById(imgFocus);
			w = (parseFloat(target.getAttribute('data-w')) || 0),
				h = (parseFloat(target.getAttribute('data-h')) || 0);
			if (w < 0) target.setAttribute('data-w', 0);
			if (h < 0) target.setAttribute('data-h', 0);
			let string = target.style.transform;
			let xy = string.substring(string.indexOf("(") + 1, string.lastIndexOf(")")).split(",");
			target.setAttribute('data-x', xy[0].replace("px", ""));
			target.setAttribute('data-y', xy[1].replace("px", ""));
			addHisImg(e.target.id, 'resize');
		});

	function startDrag(event) {
		if (onImgTouchZoom) return;
		offScroll(true);
		imgOnBoard.map(data => {
			if (data.id == imgFocus) {
				let curr = data.position.find(x => {
					return x.disp
				});
				data.position.map(x => {
					x.disp = false;
				});
				data.position.push(createNewPosImg(event, curr));
			}
		});
	}

	function dragMoveListener(event) {
		if (onImgTouchZoom) return;
		var target = event.target,
			x = (parseFloat(target.getAttribute('data-x')) || 0),
			y = (parseFloat(target.getAttribute('data-y')) || 0);
		let rotateReal = (+target.getAttribute('rotateReal'));
		let img = $("#hinh" + target.id)[0];
		let imgctn = $("#hinhctn" + target.id)[0];
		switch (rotateReal) {
			case 0:
				x += calcZP(event.dx);
				y += calcZP(event.dy);
				break;
			case 90:
				x += calcZP(event.dy);
				y += (-calcZP(event.dx));
				break;
			case 180:
				x += (-calcZP(event.dx));
				y += (-calcZP(event.dy));
				break;
			case 270:
				x += (-calcZP(event.dy));
				y += (calcZP(event.dx));
				break;
		}
		target.style.webkitTransform =
			target.style.transform = imgctn.style.webkitTransform = imgctn.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
		target.setAttribute('data-x', x);
		target.setAttribute('data-y', y);
		imgOnBoard.map(data => {
			if (data.id == target.id) {
				let idx = data.position.length - 1
				data.position[idx].x = (+x);
				data.position[idx].y = (+y);
			}
		});
	}

	function endMove(e) {
		offScroll(false);
		onDragResize = false;
		addHisImg(imgFocus, 'move');
	}

	let view = document.getElementById(tabCurrent + '-file-' + itemLoadPdf.seqNo + '-page-' + (pageCurrent - 1));
	view.scrollIntoView({
		behavior: 'smooth',
		block: "start",
		inline: "start"
	});
};

// ****************************************************************************************************************************************************************
// add history off text element
function addHisImg(id, status) {
	let item = imgOnBoard.find(x => {
		return x.id == id;
	});
	let idx = (item.position.length - 1);
	historyMain.push({
		type: 'img',
		page: item.page,
		data: item,
		idx: idx,
		status: status
	});
	clearHistoryRedo();
}

// ****************************************************************************************************************************************************************
//create new position of text element
function handleImg(data, imgOld = false) {
	try {
		let fn = common.UUID();
		let name = data.split('.');
		let pageAddText = itemLoadPdf.page.find(xx => {
			return xx.index == (pageCurrent - 1)
		});
		//copy img to work folder and rename
		copyImgToWorkFolder(data, fn + '.' + name[name.length - 1]);
		let img = {
			id: 'imgCtn' + fn,
			name: fn + '.' + name[name.length - 1],
			typeFile: name[name.length - 1],
			position: imgOld ? imgOld.position : [{
				x: 0,
				y: 0,
				width: 0,
				height: 0,
				disp: true
			}],
			display: 'block',
			page: (pageCurrent - 1),
			degree: pageAddText.rotate,
			align: pageAddText.align,
			paths: path.join(pathWork, fn + '.' + name[name.length - 1])
		};
		if (!imgOld) {
			dimensions = sizeOf(path.join(pathWork, fn + '.' + name[name.length - 1]));
			getDimension(dimensions.width, dimensions.height, img, 200, 200);
		}

		getPositionCopy(imgOld ? false : img.position[0]);
		let div = document.createElement('div');
		let style = 'width:' + img.position[0].width +
			'px;height:' +
			img.position[0].height +
			'px;'

		setAttributes(div, {
			'class': 'imgContainer importLocal active zindx3',
			'id': img.id,
			'style': style,
			'data-x': img.position[0].x,
			'data-y': img.position[0].y,
			'data-w': img.position[0].width,
			'data-h': img.position[0].height,
			'rotateReal': pageAddText.rotate
		});

		$('.importLocal').removeClass('active clean');
		clearSelect(true)
		$('.divMain-' + itemLoadPdf.seqNo + '-page-' + (pageCurrent - 1) + '-' + tabCurrent)[0].append(div);
		imgOnBoard.push(img);
		imgFocus = img.id;
		$('#' + imgFocus).addClass('active');
		$('.importLocal').attr('current', false);
		$('#' + imgFocus).attr('current', true);
		initImg(img.id, fn + '.' + name[name.length - 1], (pageCurrent - 1));
		clearHistoryRedo();
		$('.fa-undoCustom').removeClass('btn-disable');

	} catch (error) {
		console.log(pathAssets)
		common.showErrMessage(common.getMessageWithErrorCode('E99', message), null);
	}
}

function clearSelect(clean = false) {
	$('.importLocal').attr('current', false).removeClass('active');
	imgFocus = '';
	delDragImg();
	if (clean) {
		$('.importLocal').removeClass('clean').addClass('clean');
	}
}

function delDragImg() {
	imgOnBoard.map(x => {
		interact('#' + x.id).draggable(false);
		interact('#' + x.id).resizable(false);
	});
}
