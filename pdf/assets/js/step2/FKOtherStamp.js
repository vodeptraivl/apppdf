const html2canvas = require('html2canvas');
var otherStampCannvasMain = document.querySelector('#otherStampCVMain');
var otherStampCannvasDr = document.querySelector('#otherStampCVDraf');
let dotOther = 1;
let isDrawPen = true;
let isDrawHL = false;
let isDelete = false;
let isText = false;
let opacityOST = 0.7;
let isColorOpen = false;
dotShapeWidth = '5';
var imgOnstamp = [];
var textOnstamp = [];
var itemEdit = null;
let otherStampPaint = new FKPaint(
	otherStampCannvasDr,
	otherStampCannvasMain, {
		penColor: colorSelected,
		dotSize: dotOther,
		isOtherStamp: true
	},
	1,
	cbHis,
	null,
	cbOtherStampEraser,
	null,
	null,
	null,
	cbTextOtherStamp,
	cbTextMove,
	cbTextEnd,
	null,
	null,
	drawShape2
);


$(document).ready(() => {
	ipcRenderer.send('checkEditOtherStamp', "");
	modeShape = 'otherStamp';
	$('.manche').addClass('off')
});

ipcRenderer.on('imagePathStamp', (event, data) => {
	if (data) {
		classDivMain = '.conOtherStamp';
		clearSelect(true);
		handleImg(data[0]);
	}
}).on('resultCheckEdit', (event, data) => {
	if (data) {
		let img = document.createElement('img');
		img.style.width = '400px';
		img.style.height = '400px';
		img.style.position = 'absolute';
		img.style.top = '0px';
		img.style.zIndex = -2;
		img.setAttribute('src', data);
		let container = document.querySelector('#containerCanvasStamp');
		container.insertAdjacentElement('beforeend', img);
		itemEdit = data;
	}
});

$('body')
	.on('click', '.hlItem', (e) => {
		opacityOST = +e.currentTarget.getAttribute('value');
		otherStampPaint.setOpacity(opacityOST);
		hidePanelOption()
	})
	.on('click', '.btn-color-popup', (e) => {
		colorSelected = e.currentTarget.getAttribute('value');
		$('.btn-color-popup').removeClass('colorSelected');
		e.currentTarget.classList.add('colorSelected')
		otherStampPaint.setColor({
			penColor: colorSelected
		});
		$('#btn-change-color-tb').css('background-color', colorSelected);
		isColorOpen = false;
		hidePanelOption();
		setColorText();
		if (svgMoveEVent) {
			svgMoveEVent.setColor(colorSelected);
		}
	}).on('click', '.dotContainer', (e) => {
		dotOther = +e.currentTarget.getAttribute('value');
		$('.dotContainer').removeClass('rowSelected');
		e.currentTarget.classList.add('rowSelected')
		otherStampPaint.setDotSize(dotOther);
		hidePanelOption();
	}).on('change', '#setSize', (e) => {
		fontSizeSelected = e.currentTarget.value;
		changeSizeFocusText2();
		if (svgMoveEVent) {
			svgMoveEVent.setFontSize(fontSizeSelected);
		}
	}).on('mouseenter touchstart', '.importLocal,.imgPaintLayer', e => {
		imgOnEneter = true;
		if (imgFocus == "") {
			imgFocus = e.currentTarget.getAttribute('id');
		} else {
			imgFocus = $('.importLocal[current="true"]').attr('id');
		}
	}).on('click', '.importLocal,.imgPaintLayer', e => {
		defaultOption();
		setStatusPannel();
		imgFocus = e.currentTarget.getAttribute('id');
		$('.importLocal').attr('current', false).removeClass('active').addClass('clean');
		e.currentTarget.setAttribute('current', true);
		e.currentTarget.classList.remove('clean')
		$('#' + imgFocus).addClass('active');
		delDragImg();
		setOnOffDragResize(imgFocus, true);
		$('.stampProdCon').removeClass('active');
		// $('.svg-container').removeClass('active zindx3 zindx1').addClass('zindx1');
	}).on('mouseleave', '.importLocal,.imgPaintLayer', e => {
		if (!onDragResize) {
			imgOnEneter = false;
		} else {
			resize00 = true;
		}
	}).on('focus', '.textAreaAddtext', (e) => {
		$('.textAreaAddtext').prop('selectionStart', 0).prop('selectionEnd', 0);
		selectedText = e.currentTarget.getAttribute('id');
		textOnfocus = e.currentTarget.value;
		typeText = true;
		isTextAreaOn = true;
		delDragtext();
		$('.font-container').removeClass('on');
		e.currentTarget.parentElement.classList.add('on');

	}).on('click', '.dragElem,.dot', (e) => {
		$('.textAreaAddtext').blur();
		delDragtext();
		textOnfocus = '';
		typeText = false;
		isTextAreaOn = false;
		interact('#' + e.currentTarget.parentElement.getAttribute('id')).draggable(true);
		interact('#' + e.currentTarget.parentElement.getAttribute('id')).resizable(true);
		$('.font-container').removeClass('on');
		e.currentTarget.parentElement.classList.add('on');
	}).on("click", '.font-container', (e) => {
		let target = e.currentTarget.getAttribute("id");
		selectedText = target + "Text";
		let item = textOnstamp.find(x => {
			return x.id == target
		});
		let pos = item.position.find(y => {
			return y.disp
		});
		$('#setSize').val(pos.size);

	}).on('keydown', '.textAreaAddtext', function (event) {

		if (event.ctrlKey && event.keyCode == 90) {
			event.preventDefault();
		}

		//決定：Enter
		if (event.ctrlKey && event.keyCode == 13 && typeText) {
			event.currentTarget.blur();
			textOnfocus = '';
			delDragtext();
			typeText = false;
			interact('#' + event.currentTarget.parentElement.getAttribute('id')).draggable(true);
			interact('#' + event.currentTarget.parentElement.getAttribute('id')).resizable(true);
		}

		//取り消し：Esc
		if (event.keyCode == 27 && typeText) {
			$('.textAreaAddtext').prop('selectionStart', 0).prop('selectionEnd', 0).blur();
			event.currentTarget.blur();
			event.currentTarget.value = textOnfocus;
			textOnfocus = '';
			typeText = false;
			delDragtext();
			interact('#' + event.currentTarget.parentElement.getAttribute('id')).draggable(true);
			interact('#' + event.currentTarget.parentElement.getAttribute('id')).resizable(true);
		}
	});;


function closeOtherStampSign() {
	ipcRenderer.send('closeOtherStampWindow', "close");
}

function setPaint(hl = false) {
	let cl1 = isDrawPen;
	let cl2 = isDrawHL;
	defaultOption();
	isDrawPen = cl1;
	isDrawHL = cl2;
	if (hl) {
		isDrawHL = !isDrawHL;
		isDrawPen = false;
		otherStampPaint.setCanPaint(isDrawHL, true);
		$('#highlightchange').css('display', isDrawHL ? '' : 'none');

	} else {
		isDrawPen = !isDrawPen;
		isDrawHL = false;
		otherStampPaint.setCanPaint(isDrawPen);
		$('#highlightchange').css('display', 'none');
	}
	clearSelect(true);
	setStatusPannel();
}

function setColorOST() {
	isColorOpen = !isColorOpen;
	hidePanelOption();

	if (isColorOpen) {
		$('#color-change').css('display', '');
	}

}

function setStatusPannel() {
	$('.fa-pencil,.fa-text-width,.fa-paint-brush,.fa-eraser').removeClass('btn-disable');
	$('#otherStampCVDraf').removeClass('curPen curBrush curRom curText curDrag curZom curscroll');
	$('.svg-container,.imgContainer').removeClass('zindx1 zindx2 zindx3 zindx4')
	$('#otherStampCVDraf').removeClass('zindx1 zindx2 zindx3 zindx4')
	$('.fa-text-width').removeClass('btn-disable');
	$('.font-container').removeClass('on');
	removeShapeSltor();
	if (!isDrawPen) {
		$('.fa-pencil').addClass('btn-disable');
	} else {
		$('#otherStampCVDraf').addClass('curPen zindx3');
	}
	if (!isDrawHL) {
		$('.fa-paint-brush').addClass('btn-disable').attr('src', '../img/marker.png');
	} else {
		$('.fa-paint-brush').attr('src', '../img/markerActive.png');
		$('#otherStampCVDraf').addClass('curBrush zindx3');
	};
	if (!isDelete) {
		$('.fa-eraser').addClass('btn-disable');
	} else {
		$('#otherStampCVDraf').addClass('curRom zindx3');
	}
	if (!isText) {
		$('.fa-text-width').addClass('btn-disable');
		$('.font-container').removeClass('zindx1 zindx2 zindx3').addClass('zindx1');
		$('.font-container,.font-container .dot').removeClass('activeT').addClass('reactiveT');
	} else {
		$('#otherStampCVDraf').addClass('curText zindx3');
		$('.font-container').removeClass('zindx1 zindx2 zindx3').addClass('zindx3');
		$('.font-container,.font-container .dot').removeClass('reactiveT').addClass('activeT');
	}
	if (canDrawShape) {
		$('#otherStampCVDraf').addClass('curText zindx3');
	}
	if (!isDrawPen && !isDrawHL && !isDelete && !isText && !canDrawShape) {
		$('.svg-container').addClass('zindx3');
		$('.imgContainer').addClass('zindx4');
	}


}

function openChangeSizeDot() {
	hidePanelOption('#line-size-change,');
	if ($('#line-size-change').css('display') == 'none') {
		$('#line-size-change').css('display', '');
	} else {
		$('#line-size-change').css('display', 'none')
	}

}

function hidePanelOption(another = '') {
	let selector = '#line-size-change,#color-change,#highlightchange,.shapeTypeContainer'.replace(another, '');
	$(selector).css('display', 'none');
}

function setEarserOtherStamp() {
	let cl = isDelete;
	defaultOption()
	isDelete = cl;
	if (otherStampPaint._data.length > 0) {
		isDelete = !isDelete;
	} else {
		isDelete = false;
	}
	otherStampPaint.setCanEraser(isDelete);
	removeShapeSltor();
	clearSelect(true);
	setStatusPannel();
}

function openFileChose($event = null) {
	defaultOption();
	setStatusPannel();
	clearSelect(true);
	removeShapeSltor();
	ipcRenderer.send('openFileStamp', 'image');
}

function defaultOption() {
	isDrawPen = false;
	isDrawHL = false;
	isDelete = false;
	isText = false;
	isColorOpen = false;
	canDrawShape = false;
	otherStampPaint.setCanPaint(false, false);
	otherStampPaint.setCanEraser(false);
	otherStampPaint.setCanText(false);
	otherStampPaint.setShapeDraw(false);
	$('.textAreaAddtext').prop('selectionStart', 0).prop('selectionEnd', 0).blur();
	$('.shapeTypeContainer').removeClass('active');
	clearSelect(true);
}

function cbOtherStampEraser($e) {
	clearHistoryRedo();
	$e.status = 'delete';
	$e.type = 'draw';
	historyMain.push($e);
	if (otherStampPaint._data.length == 0) {
		isDelete = false;
		otherStampPaint.setCanEraser(isDelete);
		setStatusPannel();
	}

}

function cbHis($e) {
	let le = otherStampPaint._data.length
	if (otherStampPaint._data[le - 1].points) {
		let points = otherStampPaint._data[le - 1].points;
		let points1 = [];
		points.map(x => {
			if (x.x.toString() != 'NaN' && x.y.toString() != 'NaN') points1.push(x);
		});
		otherStampPaint._data[le - 1].points = points1;
	}
	historyMain.push({
		type: 'draw',
		data: otherStampPaint._data[le - 1],
		status: 'init'
	});
	$('.fa-undoCustom').removeClass("btn-disable");
	clearHistoryRedo();
}

function openShape2(e) {
	e.stopPropagation();
	$('#line-size-change,#color-change,#highlightchange').css('display', 'none');
	$('.shapeTypeContainer').toggleClass('active');
	removeShapeSltor();
	$('.stampProdCon').removeClass('active');
}

function shapeChose2(type) {
	typeShape = type;
	defaultOption();
	canDrawShape = true;
	turnDraw2(true);
	clearSelect(true);
	$('.shapeTypeContainer').removeClass('active');
}

function turnDraw2(mode) {
	$('.svg-container,.imgContainer').removeClass('zindx3').addClass('zindx1');
	$('#otherStampCVDraf').removeClass('zindx1').addClass('zindx3')
	otherStampPaint.setCanPaint(false, false);
	otherStampPaint.setCanEraser(false);
	otherStampPaint.setCanText(false);
	otherStampPaint.setShapeDraw(mode);
	setStatusPannel();
}

function drawShape2(params) {
	let divMain = `.conOtherStamp`;
	switch (params.type) {
		case 'mouseDown':
		case 'touchStart':
			appendSvg(params, divMain)
			break;
		case 'mouseMove':
		case 'touchMove':
			moveShape(params);
			break;
		case 'mouseUp':
		case 'touchEnd':
			turnDraw(false);
			canDrawShape = false;
			setStatusPannel();
			let item = document.querySelector(`#FKS${idLine}`);
			switch (item.nodeName) {
				case 'line':
					let w = +item.getAttribute('x2') - (+item.getAttribute('x1'));
					w = w < 0 ? -w : w;
					let h = +item.getAttribute('y2') - (+item.getAttribute('y1'));
					h = h < 0 ? -h : h;
					if (+h < 40 && +w < 40) {
						$(`#FKS${idLine},#FKS${idLine}[idshape="${idLine}"],#FKSM${idLine},#FKSM${idLine}Left,#FKSM${idLine}Right`).remove();
						return;
					}
					break;
				case 'rect':
					if (+item.getAttribute('width') < 40 && +item.getAttribute('height') < 40) {
						item.remove();
						return;
					}
					break;
				case 'ellipse':
					if (+item.getAttribute('rx') < 20 && +item.getAttribute('ry') < 20) {
						item.remove();
						return;
					}
					break;
			}

			historyMain.push({
				type: 'shape',
				element: item.cloneNode(true),
				svg: document.querySelector(`#SVG${params.idSVG}`),
				idShape: `FKS${idLine}`,
				idSvg: `#SVG${params.idSVG}`,
				function: 'init'
			});
			$('.fa-undoCustom').removeClass("btn-disable");
			clearHistoryRedo();
			break;
	}
}

function handleImg(data, dataCopy = null) {
	try {
		let fn = common.UUID();
		let name = data.split('.');
		let pageAddText = document.querySelector('.conOtherStamp');
		//copy img to work folder and rename
		copyImgToWorkFolder(data, fn + '.' + name[name.length - 1]);
		let img = {
			id: 'imgCtn' + fn,
			name: fn + '.' + name[name.length - 1],
			typeFile: name[name.length - 1],
			position: [
				dataCopy == null ? {
					x: 0,
					y: 0,
					width: 0,
					height: 0,
					disp: true
				} :
				{
					x: 0,
					y: 0,
					width: dataCopy.position[0].width,
					height: dataCopy.position[0].height,
					disp: true
				}
			],
			display: 'block',
			page: (pageCurrent - 1),
			degree: pageAddText.getAttribute('rotate'),
			align: pageAddText.getAttribute('align'),
			paths: path.join(pathWork, fn + '.' + name[name.length - 1])
		};

		if (dataCopy == null) {
			dimensions = sizeOf(path.join(pathWork, fn + '.' + name[name.length - 1]));
			getDimension(dimensions.width, dimensions.height, img, 70, 70);
		}
		img.position[0].x = 0;
		img.position[0].y = 0;
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
			'rotateReal': pageAddText.getAttribute('rotate')
		});
		$('.conOtherStamp')[0].append(div);
		imgOnstamp.push(img);
		imgFocus = img.id;
		$('#' + imgFocus).addClass('active');
		$('.importLocal').attr('current', false);
		$('#' + imgFocus).attr('current', true);

		initImg(img.id, fn + '.' + name[name.length - 1]);
		clearHistoryRedo();
		$('.fa-undoCustom').removeClass('btn-disable');
	} catch (error) {
		console.log(error);
		common.showErrMessage(common.getMessageWithErrorCode('E99', message), null);
	}
}

var scale = 1;

function initImg(name, img) {
	let cont = document.querySelector('.conOtherStamp');
	let rotate = +cont.getAttribute('rotate');
	let item = document.getElementById(name),
		idx = imgOnstamp.length - 1;
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

	}

	imgOnstamp[idx].position[0].x = 0;
	imgOnstamp[idx].position[0].y = 0;
	let ctnTransform = 'translate(' + imgOnstamp[idx].position[0].x + 'px, ' + imgOnstamp[idx].position[0].y + 'px)';
	item.style.webkitTransform = item.style.transform = ctnTransform;
	item.setAttribute('data-x', imgOnstamp[idx].position[0].x);
	item.setAttribute('data-y', imgOnstamp[idx].position[0].y);
	item.innerHTML = createElementImage(rotate);
	$('.conOtherStamp')[0].append(createImage(name, rotate, path.join(pathWork, img), transfrom, textW, textH, position, top, left, ctnTransform));
	historyMain.push({
		type: 'img',
		data: imgOnstamp[idx],
		idx: 0,
		status: 'init'
	});
	$('.svg-container,.imgContainer').removeClass('zindx1 zindx2 zindx3 zindx4').addClass('zindx3');
	$('#otherStampCVDraf').removeClass('zindx1 zindx2 zindx3 zindx4').addClass('zindx1');
	removeShapeSltor();
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
			imgOnstamp.map(data => {
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
					w = event.rect.width;
					h = event.rect.height;
					x += event.deltaRect.left;
					y += event.deltaRect.top;
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
				imgOnstamp.map(data => {
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
			// offScroll(false);
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
		imgOnstamp.map(data => {
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
		let imgctn = $("#hinhctn" + target.id)[0];
		x += event.dx;
		y += event.dy;
		target.style.webkitTransform =
			target.style.transform = imgctn.style.webkitTransform = imgctn.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
		target.setAttribute('data-x', x);
		target.setAttribute('data-y', y);
		imgOnstamp.map(data => {
			if (data.id == target.id) {
				let idx = data.position.length - 1
				data.position[idx].x = (+x);
				data.position[idx].y = (+y);
			}
		});
	}

	function endMove(e) {
		onDragResize = false;
		addHisImg(imgFocus, 'move');
	}
};

function clearSelect(clean = false) {
	$('.importLocal').attr('current', false).removeClass('active');
	imgFocus = '';
	delDragImg();
	if (clean) {
		$('.importLocal').removeClass('clean').addClass('clean');
	}
}

function addHisImg(id, status) {
	let item = imgOnstamp.find(x => {
		return x.id == id;
	});
	let idx = (item.position.length - 1);
	historyMain.push({
		type: 'img',
		data: item,
		idx: idx,
		status: status
	});
	clearHistoryRedo();
}

function delDragImg() {
	imgOnstamp.map(x => {
		interact('#' + x.id).draggable(false);
		interact('#' + x.id).resizable(false);
	});
}

function addText() {
	let isTextClone = isText;
	defaultOption();
	isText = !isTextClone;
	otherStampPaint.setCanText(isText);
	$('.svg-container,.imgContainer').removeClass('zindx3').addClass('zindx1');
	$('#otherStampCVDraf').removeClass('zindx1').addClass('zindx3');
	setStatusPannel();
}

function cbTextOtherStamp(e, e2 = null, pageNumer, w = false, h = false) {
	if (!isText) return;
	if (focusText) return;
	textStart = true;
	typeText = false;
	delDragtext();
	$('#setSize').val('12');
	fontSizeSelected = 12;
	$('.font-container').removeClass('on zindx1 zindx2 zindx3').addClass('zindx1');
	$('.imgContainer,.svg-container').removeClass('zindx1 zindx2 zindx3').addClass('zindx1');
	$('.textAreaAddtext').prop('selectionStart', 0).prop('selectionEnd', 0).blur();
	selectedText = "";
	let id = 'text' + common.UUID();
	let text = {
		id: id,
		position: [{
			x: e.offsetX,
			y: (e.offsetY),
			width: 10,
			height: 10,
			color: colorSelected,
			size: (+fontSizeSelected),
			sizeCalc: (+fontSizeSelected),
			disp: true
		}],
		idT: name + 'Text',
		display: 'block',
		degree: 0
	};
	textOnstamp.push(text);
	let div = document.createElement('div');
	setAttributes(div, {
		'class': 'font-container on activeT zindx1',
		'id': text.id,
		'style': 'width:10px;height:10px;transform: translate(' + e.offsetX + 'px, ' + (e.offsetY) + 'px)',
		'data-x': e.offsetX,
		'data-y': e.offsetY,
		'data-w': 10,
		'data-h': 10,
		'rotate': 0,
		'rotateReal': 0,
	});

	mWT = w;
	mHT = h;
	xT = e.clientX;
	yT = e.clientY;
	e.target.parentElement.appendChild(div);
}

function cbTextMove(e) {
	if (!textStart) return;
	let x = e.clientX - xT;
	let y = e.clientY - yT;
	let idx = textOnstamp.length - 1;
	if (mWT && mHT) {
		x = x > mWT ? mWT : x;
		y = y > mHT ? mHT : y;
	}
	textOnstamp[idx].position[0].width = x;
	textOnstamp[idx].position[0].height = y;
	$('#' + textOnstamp[idx].id).css({
		'width': x + 'px',
		'height': y + 'px'
	});
	$('#' + textOnstamp[idx].id).attr('data-w', (e.clientX - xT));
	$('#' + textOnstamp[idx].id).attr('data-h', (e.clientY - yT));
	$('#' + textOnstamp[idx].id).attr('data-calW', x);
	$('#' + textOnstamp[idx].id).attr('data-calH', y);

}

// ****************************************************************************************************************************************************************
//end move text
function cbTextEnd(page) {
	if (!textStart) return;
	textStart = false;
	let idx = textOnstamp.length - 1;
	$('.font-container').removeClass('zindx1 zindx2 zindx3').addClass('zindx3');
	// $('.font-container,.imgContainer').removeClass('zindx1').addClass('zindx2');
	if (textOnstamp[idx].position[0].width <= 10 || textOnstamp[idx].position[0].height <= 10) {
		cleanError();
		return;
	}
	initBox(textOnstamp[idx].id, idx);
	clearHistoryRedo();
	textOnstamp[idx].page = page;
	$('.fa-undoCustom').removeClass('btn-disable');
}

function cleanError() {
	$('#' + textOnstamp[textOnstamp.length - 1].id + ',#' + textOnstamp[textOnstamp.length - 1].id + 'del').remove();
	textOnstamp.pop();
}

function delDragtext() {
	textOnstamp.map(x => {
		interact('#' + x.id).draggable(false);
		interact('#' + x.id).resizable(false);
	});
}

function initBox(name, idx, value = "", copy = false) {
	let item = document.getElementById(name);
	let textW = '',
		textH = '',
		transfrom = '',
		top = '',
		left = '',
		position = '';

	historyMain.push({
		type: 'text',
		data: textOnstamp[idx],
		idx: 0,
		status: 'init'
	});
	item.innerHTML = createElementTextBox(name, 0, transfrom, textW, textH, position, top, left, value, textOnstamp[idx].position[0].color, textOnstamp[idx].position[0].sizeCalc);
	interact('#' + name)
		.draggable({
			// inertia: true,
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
				endOnly: false
			},

		}).on('resizestart', function (event) {
			let target = event.target;
			textOnstamp.map(data => {
				if (data.id == target.id) {
					let curr = data.position.find(x => {
						return x.disp
					});
					data.position[data.position.length - 1].disp = false;
					data.position.push(createNewPos(event, curr));
				}
			});
		})
		.on('resizemove', function (event) {
			// offScroll(true);
			touchMove = true;
			var target = event.target;
			var text = target.querySelector('textarea');
			var x = (parseFloat(target.getAttribute('data-x')) || 0),
				y = (parseFloat(target.getAttribute('data-y')) || 0);
			var w = (parseFloat(target.getAttribute('data-calw')) || 0),
				h = (parseFloat(target.getAttribute('data-calh')) || 0);
			w = event.rect.width;
			h = event.rect.height;
			x += event.deltaRect.left;
			y += event.deltaRect.top;
			target.setAttribute('data-calw', w);
			target.setAttribute('data-calh', h);
			target.setAttribute('data-x', x);
			target.setAttribute('data-y', y);
			if (w > 0 && h > 0) {
				target.style.width = w + 'px';
				target.style.height = h + 'px';
				target.style.webkitTransform = target.style.transform = 'translate(' + x + 'px,' + y + 'px) ';
				setWHET2(text);
				textOnstamp.map(data => {
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
			touchMove = false;
			addHisText(e.target.id, 'resize');
		});

	function startDrag(event) {
		if (focusText) return;
		if (onDragElement) {
			textOnfocus = '';
			typeText = false;
			isTextAreaOn = false;
		}
		textOnstamp.map(data => {
			if (data.id == event.target.id) {
				let curr = data.position.find(x => {
					return x.disp
				});
				data.position.map(x => {
					x.disp = false
				});
				data.position.push(createNewPos(event, curr));
			}
		});
	}

	function dragMoveListener(event) {
		if (isTextAreaOn) return;
		mouseMove = true;
		touchMove = true;
		var target = event.target;
		var x = (parseFloat(target.getAttribute('data-x')) || 0),
			y = (parseFloat(target.getAttribute('data-y')) || 0);
		x += +event.dx;
		y += +event.dy;
		target.style.webkitTransform = target.style.transform = 'translate(' + x + 'px, ' + y + 'px) ';
		target.setAttribute('data-x', x);
		target.setAttribute('data-y', y);
		textOnstamp.map(data => {
			if (data.id == target.id) {
				let idx = data.position.length - 1
				data.position[idx].x = (+x);
				data.position[idx].y = (+y);
			}
		});
	}

	function endMove(e) {
		mouseMove = false;
		touchMove = false;
		addHisText(e.target.id, 'move');
		onDragElement = false;
	}

	window.dragMoveListener = dragMoveListener;
	if (!copy) {
		$('#' + name + 'Text').focus();
		textOnfocus = '';
		typeText = true;
	}
};

//create new position of text element
function createNewPos(event, curr) {
	return {
		x: (+event.target.getAttribute('data-x')),
		y: (+event.target.getAttribute('data-y')),
		width: (+(event.target.style.width.replace("px", ""))),
		height: (+(event.target.style.height.replace("px", ""))),
		color: curr.color,
		size: curr.size,
		sizeCalc: curr.sizeCalc,
		disp: true
	}
}

function setWHET2(e) {
	let w = e.parentElement.getAttribute('data-calw') - 6;
	let h = e.parentElement.getAttribute('data-calh') - 6;
	e.style.width = (w + 'px');
	e.style.height = (h + 'px');
}

function changeSizeFocusText2() {
	if (selectedText != "") {
		$('#' + selectedText).css('font-size', (fontSizeSelected) + 'px');
		$('#' + selectedText).focus();

		textOnstamp.map(x => {
			if ((x.id + '' + x.idT) == selectedText) {
				let pos = {
					...x.position.find(y => {
						return y.disp
					})
				};
				let idx = x.position.findIndex(z => {
					return z.disp
				});
				x.position[idx].disp = false;
				if (pos) {
					pos.size = (+fontSizeSelected);
					pos.sizeCalc = (+fontSizeSelected)
					x.position.push(pos);
					addHisText(selectedText, 'fontSize');
				}
			}
		});
	}
}

function setColorText() {
	if (selectedText != "") {
		$('#' + selectedText).css('color', colorSelected);
		$('#' + selectedText).focus();
		textOnstamp.map(x => {
			if ((x.id + '' + x.idT) == selectedText) {
				let pos = {
					...x.position.find(y => {
						return y.disp
					})
				};
				let idx = x.position.findIndex(z => {
					return z.disp
				});
				x.position[idx].disp = false;
				if (pos) {
					pos.color = colorSelected;
					x.position.push(pos);
					addHisText(selectedText, 'color');
				}
			}
		});
	}
}

function checkChange() {
	if (textOnstamp.length > 0) return true;
	if (imgOnstamp.length > 0) return true;
	if (otherStampPaint._data.length > 0) return true;
	return false;
}

function cancelOtherStamp() {
	if (checkChange()) {
		$('#errorInsideSignStamp').addClass('active');
		$('#body-errorMergeSignStamp').css('display', 'none')
		$('#modal-messageSignStamp').html(`変更内容を保存しなくてもよろしいでしょうか？`)
	} else {
		closeOtherStampSign();
	}
}

function saveOtherStamp() {
	defaultOption();
	setStatusPannel();
	processText();
	var svgElements = document.body.querySelector('svg');
	toImg(svgElements, (pathSvgTemp = null) => {
		setTimeout(() => {
			html2canvas(document.querySelector("#containerCanvasStamp"), {
				backgroundColor: 'rgba(0, 0, 0, 0)'
			}).then(canvas => {
				let pathSaveOtherStamp = itemEdit || path.join(pathOtherStamp, common.UUID() + ".png");
				fs.writeFileSync(pathSaveOtherStamp, canvas.toDataURL("image/png").replace(/^data:image\/png;base64,/, ""), 'base64');
				if (pathSvgTemp) fs.unlinkSync(pathSvgTemp);
				closeOtherStampSign();
			});
		}, 200);
	});

}

function toImg(svg, callBack) {
	if (svg == null) {
		if (callBack) {
			callBack();
		}
		return;
	}
	let img = new Image(),
		serializer = new XMLSerializer(),
		svgStr = serializer.serializeToString(svg),
		data = 'data:image/svg+xml;base64,' + window.btoa(unescape(encodeURIComponent(svgStr)))
	var canvas = document.createElement("canvas");
	canvas.width = 400;
	canvas.height = 400;
	let context = canvas.getContext("2d");

	img.src = data;
	img.onload = () => {
		context.drawImage(img, 0, 0, 400, 400);
		var canvasdata = canvas.toDataURL("image/png");
		let pathSvgTemp = path.join(pathOtherStamp, common.UUID() + ".png");
		fs.writeFileSync(pathSvgTemp, canvasdata.replace(/^data:image\/png;base64,/, ""), 'base64');

		let imgs = document.createElement('img');
		imgs.style.width = '400px';
		imgs.style.height = '400px';
		imgs.style.position = 'absolute';
		imgs.style.top = '0px';
		imgs.style.zIndex = -1;
		imgs.setAttribute('src', pathSvgTemp);
		let container = document.querySelector('#otherStampCVMain');
		container.insertAdjacentElement('afterend', imgs);
		svg.remove();
		if (callBack) {
			callBack(pathSvgTemp);
		}
	};
}

function addHisText(id, status) {
	let item = textOnstamp.find(x => {
		if (status == 'color' || status == 'fontSize') {
			return (x.id + '' + x.idT) == id;
		} else {
			return x.id == id;
		}
	});
	let idx = (item.position.length - 1);
	historyMain.push({
		type: 'text',
		data: item,
		idx: idx,
		status: status
	});
	clearHistoryRedo();
}

function undo() {
	defaultOption();
	setStatusPannel();
	$('.stampProdCon').removeClass('active');
	if (historyMain.length == 1) {
		$('.fa-undoCustom').removeClass('btn-disable').addClass('btn-disable');
	}
	$('.fa-repeatCustom').each(function (index) {
		$('.fa-repeatCustom')[index].classList.remove("btn-disable");
	});
	let itemUndo = historyMain.pop();
	historyMainRedo.push(itemUndo);
	if (itemUndo.type == "shape") {
		handleHistoryShape(itemUndo, 'undo');
		return;
	}
	if (itemUndo.type == "draw") {
		otherStampPaint.undo(itemUndo);
	}
	let index = getIndex(itemUndo)
	if (itemUndo.type != "his" && itemUndo.type != "del" && itemUndo.type != "rotate") {
		if (index != -1) {
			itemUndo = JSON.parse(JSON.stringify(historyMain[index]));
		}
	}
	if (itemUndo.type == "img") {
		sethistoryImg(itemUndo.data.id, (index != -1) ? itemUndo.idx : index, status, true);
	}

	if (itemUndo.type == "text") {
		sethistoryText(itemUndo.data.id, (index != -1) ? itemUndo.idx : index, status, true);
	}
}

function redo() {
	defaultOption();
	setStatusPannel();
	if (historyMainRedo.length == 0) return;
	$('.stampProdCon').removeClass('active');
	if (historyMainRedo.length == 1) {
		$('.fa-repeatCustom').removeClass('btn-disable').addClass('btn-disable');
	}
	$('.fa-undoCustom').removeClass("btn-disable");
	let itemRedo = historyMainRedo.pop();
	historyMain.push(itemRedo);
	if (itemRedo.type == "shape") {
		handleHistoryShape(itemRedo, 'redo');
		return;
	}
	if (itemRedo.type == "draw") {
		otherStampPaint.redo(itemRedo);
	}

	if (itemRedo.type == "img") {
		sethistoryImg(itemRedo.data.id, itemRedo.idx, itemRedo.status, false);
	}

	if (itemRedo.type == "text") {
		sethistoryText(itemRedo.data.id, itemRedo.idx, itemRedo.status, false);
	}
}

function sethistoryImg(id, idx, status, t) {
	imgOnstamp.map(x => {
		if (x.id == id) {
			if (idx == -1 || (idx == 0 && !t) || status == 'delete') {
				if (x.display == 'none') {
					$('#' + id + ',#hinhctn' + id).css('display', 'block');
					x.display = 'block';
					x.position[idx == -1 ? 0 : idx].disp = true;
				} else {
					$('#' + id + ',#hinhctn' + id).css('display', 'none');
					x.display = 'none';
					x.position.map(ii => ii.disp = false);
				}
			}
			if (idx == -1) return;
			let pos = x.position[idx];
			x.position.map(ii => ii.disp = false);
			x.position[idx].disp = true;
			let target = $('#' + id)[0];
			let imgEle = $("#hinh" + target.id)[0];
			let imgctn = $("#hinhctn" + target.id)[0];
			target.style.webkitTransform = target.style.transform = imgctn.style.webkitTransform = imgctn.style.transform = 'translate(' + pos.x + 'px,' + pos.y + 'px)';
			target.setAttribute('data-x', pos.x);
			target.setAttribute('data-y', pos.y);
			target.style.width = pos.width + 'px';
			target.style.height = pos.height + 'px';
			setWHE(imgEle, pos.width, pos.height);
			setWHE(imgctn, pos.width, pos.height);
		}
	});
}

function sethistoryText(id, idx, status, t) {
	textOnstamp.map(x => {
		if (x.id == id) {
			if (idx == -1 || (idx == 0 && !t) || status == 'delete') {
				if (x.display == 'none') {
					$('#' + id).css('display', 'block');
					x.display = 'block';
					x.position[idx == -1 ? 0 : idx].disp = true;
				} else {
					$('#' + id).css('display', 'none');
					x.display = 'none';
					x.position.map(ii => ii.disp = false);
				}
			}
			if (idx == -1) return;
			let pos = x.position[idx];
			x.position.map(ii => ii.disp = false);
			x.position[idx].disp = true;
			let target = $('#' + id)[0];
			let tar1 = $('#' + id + x.idT)[0];
			target.style.webkitTransform = target.style.transform = 'translate(' + pos.x + 'px,' + pos.y + 'px)';
			target.setAttribute('data-x', pos.x);
			target.setAttribute('data-y', pos.y);
			target.style.width = tar1.style.width = pos.width + 'px';
			target.style.height = tar1.style.height = pos.height + 'px';
			tar1.style.fontSize = pos.sizeCalc + 'px';
			tar1.style.color = pos.color;

		}
	});
}

$(window).on('keydown', (e) => {
	if (isStampOpen) {
		e.stopPropagation();
		return;
	}
	if (isMiniMapOpen || isStampOpen) {
		e.preventDefault();
		e.stopPropagation();
		return;
	}
	if ($('.dotShape').length > 0) {
		switch (e.keyCode) {
			case 27:
				if (e.target.nodeName == 'TEXTAREA') {
					// e.target.setAttribute('disabled',true);
					if (svgMoveEVent) {
						svgMoveEVent.blurText();
					}
				} else {
					if (svgMoveEVent) {
						svgMoveEVent.destroy(() => {
							svgMoveEVent = null
						});
					}
				}

				break;
			case 46:
				let active = $(document.activeElement);
				if (active && active[0].nodeName == 'TEXTAREA') return;
				if (svgMoveEVent) {
					svgMoveEVent.destroyRemove((his) => {
						svgMoveEVent = null;
						historyMain.push(his);
						clearHistoryRedo();
					});
				}
		}
		if (e.ctrlKey && e.keyCode == 90 && !e.shiftKey) {
			e.preventDefault();
			if (e.target.nodeName == 'TEXTAREA') {
				if (svgMoveEVent) {
					svgMoveEVent.blurText();
				}
			} else {
				undo();
			}
		}

		if (e.ctrlKey && e.keyCode == 89) {
			if (e.target.nodeName == 'TEXTAREA') {
				if (svgMoveEVent) {
					svgMoveEVent.blurText();
				}
			} else {
				redo();
			}
		}

		if (e.ctrlKey && e.keyCode == 67) {
			if (e.target.nodeName == 'TEXTAREA') {} else {
				if (svgMoveEVent) {
					svgMoveEVent.copyShape((copyItem) => {
						itemcoppy = {
							type: "shape",
							item: copyItem
						};
					});
				}
			}
		}

		if (e.ctrlKey && e.keyCode == 80 && !e.shiftKey) {
			e.preventDefault();
			handlePastData(e);
		}

		return;
	}


	if (!typeText && !currentPageKeyPress && !textStart && !e.shiftKey) {
		if (e.ctrlKey && e.keyCode == 67 && imgFocus != '') {
			e.preventDefault();
			copyImg(true);
			return;
		}

		if (e.ctrlKey && e.keyCode == 88 && imgFocus != '' && !e.shiftKey) {
			e.preventDefault();
			copyImg(false);
			delImg();
			return;
		}

		if (e.ctrlKey && e.keyCode == 80 && !e.shiftKey) {
			e.preventDefault();
			handlePastData(e);
			return;
		}

		if (e.ctrlKey && e.keyCode == 86 && !e.shiftKey) {
			if (!$('#productCode').is(':focus')) {
				e.preventDefault();
				if (itemLoadPdf) ipcRenderer.send('checkClipBoard', "checkClipboard");
				return;
			}
		}

		if (e.ctrlKey && e.keyCode == 90 && !e.shiftKey) {
			e.preventDefault();
			undo();
			return;
		}

		if (e.keyCode == 66 && !e.ctrlKey && !e.shiftKey) {
			$('.addtext').click();
			return;
		}
		if (e.keyCode == 80 && !e.ctrlKey && !e.shiftKey) {
			$('.pencilc').click();
			return;
		}
		if (e.keyCode == 69 && !e.ctrlKey && !e.shiftKey) {
			$('.cucrom').click();
			return;
		}
		if (e.keyCode == 83 && !e.ctrlKey && !e.shiftKey) {
			$('#highLightClick').click();
			return;
		}

		if (e.keyCode == 73 && !e.shiftKey && !e.ctrlKey) {
			$('#addImage').click();
			return;
		}

	}

	if (isText) {
		//削除：Delete
		if (selectedText != '' && e.keyCode == 46 && !e.ctrlKey) {
			if (!typeText) {
				delText();
			}
			return;
		}

		if (e.ctrlKey && e.keyCode == 67 && !typeText && selectedText != '') {
			e.preventDefault();
			copyText(true);
			return;
		}

		if (e.ctrlKey && e.keyCode == 88 && !typeText && itemcoppy != {}) {
			e.preventDefault();
			copyText(false);
			delText()
			return;
		}
	} else {
		//削除：Delete
		if (imgFocus != '' && e.keyCode == 46) {
			delImg();
			return;
		}

		if (e.ctrlKey && e.keyCode == 89) {
			redo();
			return;
		}

	}
});


function copyImg(type) {
	let img = JSON.parse(JSON.stringify(imgOnstamp.find(x => {
			return x.id == imgFocus
		}))),
		pos = JSON.parse(JSON.stringify(img.position.find(y => {
			return y.disp
		})));
	img.position = [];
	img.position.push(pos);
	let cop = {
		type: "img",
		data: img,
		copy: type
	};
	itemcoppy = cop;
}

function delImg() {
	$('#' + imgFocus + ',#hinhctn' + imgFocus).css('display', 'none');
	imgOnstamp.map(x => {
		if (x.id == imgFocus) {
			x.display = 'none';
			addHisImg(imgFocus, 'delete');
			x.position.map(y => {
				y.disp = false
			})
		}
	});
	imgOnEneter = false;
	imgFocus = "";
}

function copyText(type) {
	let textCopy = $('#' + selectedText)[0],
		value = textCopy.value;
	id = textCopy.parentElement.getAttribute('id');
	let textCop = JSON.parse(JSON.stringify(textOnstamp.find(x => {
			return x.id == id
		}))),
		pos = JSON.parse(JSON.stringify(textCop.position.find(y => {
			return y.disp
		})));
	textCop.position = [];
	textCop.position.push(pos);
	let cop = {
		type: "text",
		data: textCop,
		value,
		copy: type
	};
	itemcoppy = cop;
}

function delText() {
	let textDel = $('#' + selectedText)[0],
		id = textDel.parentElement.getAttribute('id');
	textDel.parentElement.style.display = 'none';

	textOnstamp.map(x => {
		if (x.id == id) {
			x.display = 'none';
			addHisText(x.id, 'delete');
			x.position.map(y => {
				y.disp = false
			})
		}
	});
}

function handlePastData(e) {
	if (itemcoppy != {}) {
		if (itemcoppy.type && itemcoppy.type == 'img') {

			defaultOption();
			setStatusPannel();
			let cop = JSON.parse(JSON.stringify(itemcoppy));
			handleImg(cop.data.paths, cop.data);
			itemcoppy = {};
		}

		if (itemcoppy.type && itemcoppy.type == 'text' && isText) {
			let cop = JSON.parse(JSON.stringify(itemcoppy));
			createTextCopy(cop.data, cop.value);
			itemcoppy = {};
		}

		if (itemcoppy && itemcoppy.type == 'shape') {
			if (e.target.nodeName == 'TEXTAREA') {} else {
				if (svgMoveEVent) {
					svgMoveEVent.destroy(() => {
						svgMoveEVent = null
					});
				}
				pastShape();

			}
		}
		return;
	}
}

function createTextCopy(textCop, value) {
	$('#setSize').val('12');
	fontSizeSelected = 12;
	$('.font-container').removeClass('on');
	$('.textAreaAddtext').prop('selectionStart', 0).prop('selectionEnd', 0).blur();
	selectedText = "";
	let id = 'text' + textOnstamp.length;
	let text = {
		id: id,
		position: textCop.position,
		idT: name + 'Text',
		display: 'block',
		page: 1,
		degree: 0
	};
	// getPositionCopy(text.position[0]);
	textOnstamp.push(text);
	let div = document.createElement('div');
	setAttributes(div, {
		'class': 'font-container on activeT zindx1',
		'id': text.id,
		'style': 'width:' + text.position[0].width + 'px;height:' + text.position[0].height + 'px;',
		'data-w': text.position[0].width,
		'data-h': text.position[0].height,
		'data-calW': text.position[0].width,
		'data-calH': text.position[0].height,
		'rotate': 0,
		'rotateReal': 0,
		'tab': tabCurrent
	});
	text.position[0].x = 0;
	text.position[0].y = 0;
	let conainerOtherStamp = document.querySelector('#containerCanvasStamp');
	if (conainerOtherStamp) {
		conainerOtherStamp.insertAdjacentElement('beforeend', div);
	}
	delDragtext();
	initBox(id, (textOnstamp.length - 1), value);
	selectedText = id + 'Text';
}

function processText(){
	if(textOnstamp != null && textOnstamp.length > 0){
		for(let i = 0; i< textOnstamp.length; i++){
			if(textOnstamp[i].position.find(x=>{return x.disp}) != null)
				text2Canvas(document.querySelector(`#${textOnstamp[i].id}Text`))
		}
	}
}

function text2Canvas(elText){
	let parent = elText.parentElement;
	let canvas = document.createElement('canvas');
	let width = (parent.style.width || "").replace("px","");
	let height = (parent.style.height || "").replace("px","");
	canvas.setAttribute("width",`${+width-6}px`);
	canvas.setAttribute("height",`${+height-6}px`);
	let context = canvas.getContext('2d');
	let fontSize = (elText.style.fontSize || "").replace("px","");
	context.font = fontSize +'px '+elText.style.fontFamily;
	context.fillStyle = elText.style.color;
	//wrap text to save
	wrapText(context, elText.value ,0 ,(fontSize - ( fontSize / 100 * 10)),+fontSize,width);
	parent.innerHTML = '';
	parent.insertAdjacentElement('beforeend',canvas);
}