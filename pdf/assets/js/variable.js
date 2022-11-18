const request = require('request');
const common = require("../js/common.js");
const service = require("../js/service");
const pdfjs = require('pdfjs-dist/build/pdf');
const pdfjsWorker = require('pdfjs-dist/build/pdf.worker.entry');
const path = require('path');
const FKPaint = require('../js/FKPaint');
const fs = require('fs');
const Observable = require('rxjs').Observable;
const {ipcRenderer} = require('electron');
const loginService = require('../js/loginService');
const fse = require('fs-extra');
const {interact} = require('../js/interact.min.js');
var sizeOf = require('image-size');
const os = require('os');
// import {fileFromPath} from "formdata-node/file-from-path"
// import {FormData} from "formdata-node"
// import {FormData} from "formdata-node"
// const Blob = require("node-blob");

pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;


// ****************************************************************************************************************************************************************
// VARIABLE
let currentFileMerge = null;
//variable of data login and main
var userInfo = null;
var datalogin = {
	templateFolder:"",
	idleSecond:3600,
	url : "",
	userid : "",
	uh2 : ""
};
var pathSave = "";
var pathHome = path.join(os.homedir(),'LPW');
var pathWork = path.join(os.homedir(),'LPW','work');
var pathMerge = path.join(os.homedir(),'LPW','tempMerge');
var pathRegist = path.join(os.homedir(),'LPW','remask');
var pathStamp = path.join(os.homedir(),'LPW','stamp');
var pathSignStamp = path.join(os.homedir(), 'LPW', 'stamp' , 'sign_stamp');
var pathOtherStamp = path.join(os.homedir(), 'LPW', 'stamp' , 'other_stamp');
var pathAssets = "";
//variable of tool
var colorSelected = '#000000';
var fontSizeSelected = 12;
var font = 'ＭＳ Ｐゴシック'
var selectedText = ""
var positionScroll;
var canPaint = false;
var canEraser = false;
var hLight = false;
var canHLight = false;
var cantText = false;
var dotSize = 2.25;

//variable of zoom and page focus
var zoomDistance = 0;
var pointFocus;
var pageCurrent = 0;
const zoomRange = [0.25, 3];
var isTouchZoom = false;
var zoomEnd = false;

//variable of timeout
var timer,timer2,timer3, currSeconds = 0;

//variable of search
var dataDrawingSearch = [];
var listSelected = [];

//variable of history
var historyMain = [];
var historyMainRedo = [];

//variable of add text
var textStart = false;
var xT = 0,yT = 0,mWT=0,mHT=0;
var textOnBoard = [];
var zDst = null;
var focusText = false;
var isTextAreaOn = false;
var mouseMove = false;
var ctrlDown = false;
var zKey = 90;
var ismax = true;
var toolbar = 0;
var textOnfocus = "";
var typeText = false;
var onDragElement = false;
var onDragELick = false;
var textResizeStart = null;
var extractDrag = null;
//variable of pdf
var __PDF_DOC, __TOTAL_PAGES;
var timeout = 5000;
var itemLoadPdf;
var signaPads = [];
var isChange = false;
var re = new RegExp("^[0-9]{1,}$");
var indexFile = -1;

//variable of image
var imgOnBoard = [];
var setImage = false;
var imgFocus = "";
var onDragResize = false;
var imgOnEneter = false;
var onImgTouchZoom = false;
var resize00 = false;

// control key variable
var itemcoppy = {};
var currentPageKeyPress = false;
var imgInterval;
var hLightOpacity = 0.7;
var onSave = false;
var pointZoomKey;
var currentZoom = 0;
var extractLoading = false;
var isRotate = false;
// tabs
var allTabs = [];
var tabCurrent = "";
var focusOnBlankTab = false;
var countSaveExtract = 0;
var sortAble = null;
var txtShapeFc = false;
var dotShapeWidth = '10';
var PAGE_SIZE = {
	A1 : ["^16((7[1-9]{1,1})|(8[0-9]{1,1}))$", "^23((7[1-9]{1,1})|(8[0-9]{1,1}))$"],
	A2 : ["^16((7[1-9]{1,1})|(8[0-9]{1,1}))$","^11((8[1-9]{1,1})|(9[0-9]{1,1}))$"],
	A3 : ["^8((3[1-9]{1,1})|(4[0-9]{1,1}))$","^11((8[1-9]{1,1})|(9[0-9]{1,1}))$"],
	A4 : ["^8((3[1-9]{1,1})|(4[0-9]{1,1}))$","^5((8[1-9]{1,1})|(9[0-9]{1,1}))$"],
	A5 : ["^5((8[1-9]{1,1})|(9[0-9]{1,1}))$","^4((0[1-9]{1,1})|(1[0-9]{1,1}))$"]
}
var isMiniMapOpen = false;
var interValCheckUpdate = setInterval(_=>{
	ipcRenderer.send('checkupdate'); 
},20000);
var canDrawShape = false;
var svgMoveEVent = null;
var isStampOpen = false;
var dragText = false;
// END VARIABLE
// ****************************************************************************************************************************************************************
function getScale(viewPortNor){
	let page = [
		{size : 'A1',scale : 0.425},
		{size : 'A2',scale : 0.6},
		{size : 'A3',scale : 0.85},
		{size : 'A4',scale : 1.2},
		{size : 'A5',scale : 1.7}
	]
	let widthNor = (""+viewPortNor.width).substring(0,(""+viewPortNor.width).indexOf(".")),
	heightNor = (""+viewPortNor.height).substring(0,(""+viewPortNor.height).indexOf("."));
	for(let i = 0; i < page.length ; i++){
		let size1 = new RegExp(PAGE_SIZE[page[i].size][0]);
		let size2 = new RegExp(PAGE_SIZE[page[i].size][1])
		if((widthNor.match(size1) || widthNor.match(size2)) && (heightNor.match(size1) || heightNor.match(size2))){
			return page[i].scale;
		}
	}
	return 1.2;
	
}

// ****************************************************************************************************************************************************************
// reset variable
function setDefaultVariable(save = false){
	canPaint = false;
	canEraser = false;
	zoomDistance = 0;
	zoomDistancePinchi = 0;
	pointFocus = null;
	topValue = 0;
	leftValue = 0;
	dotSize = 2.25;
	signaPads = [];
	historyMain = [];
	historyMainRedo = [];
	colorSelected = "#000000";
	pathSave="";
	xT = 0;yT = 0;mWT=0;mHT=0;
	textOnBoard.map(x=>{interact('#'+x.id).unset();});
	imgOnBoard.map(x=>{interact('#'+x.id).unset();});
	setPaint(false, false);
	setFont(false);
	textOnBoard = [];
	imgOnBoard = [];
	fontSizeSelected = 12;
	hLightOpacity = 0.7;
	
	$('#setSize').val('12');
	$('#setSize').attr('disabled',true);
	$('#currentPage').val('');
	$('#page-number').text('');
	$('#percent').text('100%');
	$('#pathFile').html('');
	$('#btn-change-color-tb').css('background-color','');
	$('#messageModal').modal('hide');
	$('.dotContainer').removeClass('rowSelected');
	$('.btn-color-popup').removeClass('colorSelected');
	$('.dotContainer[value="2.25"]').addClass('rowSelected');
	$('.btn-color-popup[value="#000000"]').addClass('colorSelected');
	$('#btn-change-size-tb,#btn-change-color-tb').removeClass('poiterNone').addClass('poiterNone');
	$('.fa-pencil,.fa-eraser,.fa-repeatCustom,.fa-undoCustom,.fa-paint-brush,.fa-picture-o,.fa-text-width').removeClass('btn-disable').addClass('btn-disable');
	$('.rotateLeft ,.rotateRight').removeClass('btn-disable2').addClass('btn-disable2');
	$('#pennew').attr('src','../img/marker.png');
	$('#btn-change-size-tb,#btn-change-color-tb').removeClass('poiterNone').addClass('poiterNone');
	$('#moveDown,#moveUp,#currentPage,#saveFileLocal,#saveFileOveride').attr('disabled','true');
	$('.hlItem').removeClass('rowSelected');
	$('.hlItem[value="0.7"]').addClass('rowSelected');
}
// end reset variable
// ****************************************************************************************************************************************************************
