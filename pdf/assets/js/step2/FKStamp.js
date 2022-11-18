var tampChose = null;
var signStamps = [];
var otherStamps = [];
var isSignStamp = false;
var detailSignStamp = {
    imgName:null,
    department:"XXXX",
    name:"XXXX",
    signdate:null,
    signdateflag:"1",
    dayofweekflag:"1",
    updatedate:null,
}
let pathTop = `<path id="pathTop" d="M5 35 L 95 35 Z" stroke="red" stroke-width="1.5" />`;
let pathMid = `<path id="pathMid" d="M2 50 L 98 50 Z" stroke="red" stroke-width="1.5" />`;
let pathBot = `<path id="pathBot" d="M5 65 L 95 65 Z" stroke="red" stroke-width="1.5" />`;

ipcRenderer.on('reloadDataStamp',()=>{
    otherStamps = readDir();//fs.readdirSync(pathOtherStamp);
    openStampCenter();
});

$('body')
    .on('click', '.stampSignI', (e) => {
        setPaint(false, false);
        setFont(false);
        setText(false);
        $('.shapeTypeContainer').removeClass('active');
        clearSelect(true);
        removeShapeSltor();
        $('.stampProdCon').removeClass('active');
        if(e.currentTarget.getAttribute('nonesign') != null){
            return;
        }
        tampChose = e.currentTarget.querySelector('img');
        turnStamp(true)
    })
    .on('click','.iconStamp',function($e){
        $('.iconStamp').removeClass('active');
        $(this).addClass('active');
        if(this.hasAttribute('sign')|| this.hasAttribute('nonesign')){
            $('#editStamp').removeClass('disabled');
            $('#deleteStamp').addClass('disabled');
        }
        if(this.hasAttribute('other')){
            $('#editStamp,#deleteStamp').removeClass('disabled');
        }
    })
    .on('change','#signdateflag,#dayofweekflag',(e)=>{
        detailSignStamp[e.currentTarget.getAttribute('id')] = (e.currentTarget.checked) ? '1' : '0';
        if(e.currentTarget.getAttribute('id') == 'signdateflag'){
            drawContentSVG();
        }
        drawDateInSVG();
    })

function openStamp(e) {
    if(itemLoadPdf){
        if ($('.stampProdCon').hasClass('active')) {
            $('.stampProdCon').removeClass('active');
            return;
        }
        $('.stampScrollDiv').html('');
        let htmlStamp = "";
        processFileSignJson();
        otherStamps = readDir();
        
        let signExists = false;
        if (detailSignStamp && detailSignStamp.imgName != null) {
            const fileStamp = path.join(pathSignStamp, detailSignStamp.imgName);
            if (fs.existsSync(fileStamp)) {
                if(fileStamp.indexOf('png') > -1 || fileStamp.indexOf('jpg') > -1 ){
                    signExists = true;
                    htmlStamp += `<div class="stampSignI">
                                    <img src="${fileStamp}?t=${common.UUID()}">
                                </div>`;
                }
            }
        }
        if(!signExists){
            htmlStamp += `
            <div class="stampSignI">
                <img src="${__dirname}/../img/stamp/stampDefault.png" >
            </div>`
        }
        if (otherStamps && otherStamps.length > 0) {
            for (let i = 0; i < otherStamps.length; i++) {
                htmlStamp += `<div class="stampSignI">
                                    <img src="${otherStamps[i]}?t=${common.UUID()}">
                                </div>`;
            }
        }
        document.querySelector('.stampScrollDiv').insertAdjacentHTML('beforeend', htmlStamp)
        $('.stampProdCon').addClass('active');
    } 
}

function turnStamp(mode) {
    $('.svg-container').removeClass('zindx3').addClass('zindx1');
    isSignStamp = mode;
    if (allTabs != null && allTabs.length > 0) {
        for (let i = 0; i < allTabs.length; i++) {
            if (allTabs[i].signaPads && allTabs[i].signaPads.length > 0) {
                allTabs[i].signaPads.forEach(function (item, index) {
                    item.setStampMode(mode);
                    item.setShapeDraw(false);
                });
            }
        }
    }
}

function handleSignStamp(_e) {
    let src = tampChose.getAttribute("src");
    src = src.split('?');
    handleImg(src[0]);
    tampChose = null;
    turnStamp(false);
}

var registerMask = {
    yearRegister: '',
    monthRegister: '',
    dayRegister: '',
    fullDate: "",
    departRegister: "",
    nameRegister: "",
}

function openStampCenter() {
    $('.stampContainer,.registMaskOverlay').addClass('closePopup');
    $('#deleteStamp,#editStamp').addClass('disabled');
    $('.stampProdCon').removeClass('active');
    tampChose = null;
    isStampOpen = true;
    if(isSignStamp) turnStamp(false);
    let htmlStamp = '';
    let signExists = false;
    if (detailSignStamp && detailSignStamp.imgName != null) {
        const fileStamp = path.join(pathSignStamp, detailSignStamp.imgName);
        if (fs.existsSync(fileStamp)) {
            signExists = true;
            htmlStamp += `
            <div class="iconStamp" sign>
                <img src="${fileStamp}?t=${common.UUID()}" file="${fileStamp}" >
            </div>`;
        }
    }
    if(!signExists){
        htmlStamp += `
            <div class="iconStamp" nonesign>
                <img src="../img/stamp/stampDefault.png" >
            </div>`
    }
    if (otherStamps && otherStamps.length > 0) {
        for (let i = 0; i < otherStamps.length; i++) {
            htmlStamp += `<div class="iconStamp" other file="${otherStamps[i]}" >
                            <img src="${otherStamps[i]}?t=${common.UUID()}" file="${otherStamps[i]}" >
                        </div>`;
        }
    }
    $('#stampCenterImg').html(htmlStamp);
}

function closeStampCenter() {
    $('.stampContainer,.registMaskOverlay').removeClass('closePopup');
    $('#stampCenterImg').html('');
    isStampOpen = false;
}

function addStampImage() {
    ipcRenderer.send('openFile', 'image');
}

function toogleMapStamp() {
    $('.navbar.custom-tab-search').toggleClass('panel-search-show');
    $('#panel-search2').css('display', 'block')
}

function deleteStamp($e = false){
    if($('#deleteStamp').hasClass('disabled')) return;
    let stampSelect = document.querySelector('.iconStamp.active');
    if(!$e){
        if(stampSelect){
            $('#errorInsideStamp').addClass('active');
            $('#body-errorMergeStamp').css('display','none')
            $('#modal-messageMergeStamp').text(common.getMessageWithErrorCode('LPWI0012', message))
        }
    }else{
        closeDeleteStamp();
        let img = stampSelect.querySelector('img');
        fs.unlinkSync(img.getAttribute('file'));
        stampSelect.remove();
        $('#deleteStamp,#editStamp').addClass('disabled');
    }
}

function closeDeleteStamp(){
    $('#errorInsideStamp').removeClass('active');
    $('#modal-messageMergeStamp').text('')
    
}

function editStamp($this){
    if($('#editStamp').hasClass('disabled')) return;
    let stampSelect = document.querySelector('.iconStamp.active');
    if(stampSelect.hasAttribute('sign') || stampSelect.hasAttribute('nonesign')){
        initRegsiterMask();
    }else{
        ipcRenderer.send('openOtherStampWindow', {otherStampEdit:stampSelect.getAttribute('file')}); 
    }
}

strSelect = ["#yearInput", "#monthInput", "#dayInput", "#departmentInput", "#nameInput"];
itemClone = {};
function closeSignMark(check = false){
    if(check){
        if(JSON.stringify(itemClone, (k, v) => v && typeof v === 'object' ? v : '' + v) != JSON.stringify(detailSignStamp, (k, v) => v && typeof v === 'object' ? v : '' + v)){
            $('#errorInsideSignStamp').addClass('active');
            $('#body-errorMergeSignStamp').css('display','none')
            $('#modal-messageSignStamp').html(common.getMessageWithErrorCode('LPWI0002', message))
        }else{
            closeMessageSignStamp();
            $('.registMaskContainer').removeClass('closePopup');
        }
    }
    closeMessageSignStamp();
    $('.registMaskContainer').removeClass('closePopup');
}

function initRegsiterMask() {
    $('.registMaskContainer').addClass('closePopup');
    processFileSignJson()
    itemClone = JSON.parse(JSON.stringify(detailSignStamp));
    reprareSignStamp();
    let selector = strSelect.join(",");
    $('body').off('change', selector)
    $('body').on('change', selector, e => {
        let key = e.target.id.replace("Input", "");
        if (['year','month','day'].indexOf(key) > -1) {
            let dateClone = {...detailSignStamp.signdate};
            dateClone[key] = e.target.value;
            detailSignStamp.signdate = dateClone;
            drawDateHtml();
        } else {
            detailSignStamp[key]=e.target.value;
            drawName();
        }
    })
}

function getDate(dayFormat = null){
    try{
        let date = new Date();
        if(dayFormat){
            if(checkDateString(dayFormat)){
                date = new Date(dayFormat);
            }else{
                return;
            }
        }
        let year = date.getFullYear();
        let month = (date.getMonth() + 1);
        month = (month + "").length == 1 ? "0" + month : month;
        let day = date.getDate();
        day = (day + "").length == 1 ? "0" + day : day;
        let dayOfWeek = date.getDay();
        return {year,month,day,dayOfWeek}
    }catch(e){
        return null;
    }
    
}

function reprareSignStamp(){
    drawContentSVG();
    drawDateHtml();
    drawName();
}

function drawContentSVG(){
    $('#pathTop,#pathMid,#pathBot').remove();
    let pannel = document.querySelector('#signMarkPannel');
    pannel.insertAdjacentHTML('beforeend',(detailSignStamp.signdateflag == '1') ? `${pathTop}${pathBot}` : pathMid);
    $('#signdateflag').prop('checked', (detailSignStamp.signdateflag == '1'));
    $('#dayofweekflag').prop('checked', (detailSignStamp.dayofweekflag == '1'));
    transformSignLayout();
}

function transformSignLayout(){
    if((detailSignStamp.signdateflag == '1')){
        let nodeDepartment = document.querySelector('#departmentFull');
        nodeDepartment.insertAdjacentHTML('afterend',`<text id="yearFull" class="yearFull" x="50" y="51" dominant-baseline="middle" text-anchor="middle" fill="red" style="font-size: 14px;font-family: 'ＭＳ Ｐゴシック';font-weight: 600;"></text>`)
        $('#departmentFull').attr('x',10).attr('y',5.5).attr('width',80).attr('height',28);
        $('#nameFull').attr('x',10).attr('y',65).attr('width',80).attr('height',28);
    }else{
        $('.yearFull').remove();
        $('#departmentFull').attr('x',5).attr('y',5).attr('width',90).attr('height',45);
        $('#nameFull').attr('x',5).attr('y',50).attr('width',90).attr('height',45);
    }
}

function drawDateHtml(){
    drawDateInSVG();
    $('#yearInput').val(detailSignStamp.signdate.year || '');
    $('#monthInput').val(detailSignStamp.signdate.month || '');
    $('#dayInput').val(detailSignStamp.signdate.day || '');
}

function drawDateInSVG(seperate = "."){
    if(detailSignStamp.signdate && detailSignStamp.signdateflag == '1'){
        let strDate = `${[detailSignStamp.signdate.year,detailSignStamp.signdate.month,detailSignStamp.signdate.day].join(seperate)}`;
        let dateFormat = getDate(strDate);
        if(dateFormat){
            if(detailSignStamp.dayofweekflag == '1'){
                strDate += getJpDayOfWeek(+detailSignStamp.signdate.dayOfWeek);
            }
        }else{
            strDate = (detailSignStamp.signdateflag == '1') ? '****.**.**(*)' : '****.**.**';
        }
        $('#yearFull').text(strDate);
    }
}

function drawName(){
    $('#departmentInput').val(detailSignStamp.department);
    $('#nameInput').val(detailSignStamp.name);
    $('#departmentFull p').text(detailSignStamp.department);
    $('#nameFull p').text(detailSignStamp.name);
    resizeTextStamp();
}

function resizeTextStamp(){
    if(detailSignStamp.department.length < 4){
        $('#departmentFull p').css('font-size','17px');
    }
    if(detailSignStamp.department.length == 4){
        $('#departmentFull p').css('font-size','13px');
    }
    if(detailSignStamp.department.length > 4){
        $('#departmentFull p').css('font-size','9px');
    }

    if(detailSignStamp.name.length < 4){
        $('#nameFull p').css('font-size','17px');
    }
    if(detailSignStamp.name.length == 4){
        $('#nameFull p').css('font-size','13px');
    }
    if(detailSignStamp.name.length > 4){
        $('#nameFull p').css('font-size','9px');
    }

}

function getJpDayOfWeek(day){
    switch(day){
        case 0: return "(月)";
        case 1: return "(火)";
        case 2: return "(水)";
        case 3: return "(木)";
        case 4: return "(金)";
        case 5: return "(土)";
        case 6: return "(日)";
    }
}

function getToday(){
    detailSignStamp.signdate = getDate();
    drawDateHtml();
}

function processFileSignJson(save = false){
    let pathFile = path.join(pathSignStamp,'signstamp.json');
    if(!save){
        if (fs.existsSync(pathFile)) {
            detailSignStamp = JSON.parse(fs.readFileSync(pathFile, { encoding: 'utf8', flag: 'r' }));
            detailSignStamp.updatedate=getDate();
        }else{
            detailSignStamp = {
                imgName:null,
                department:"XXXX",
                name:"XXXX",
                signdate:getDate(),
                signdateflag:"1",
                dayofweekflag:"1",
                updatedate:getDate(),
            }
        }
    }else{
        fs.writeFileSync(pathFile, JSON.stringify(detailSignStamp, null, 2));
    }
}

function saveRegistMaskToCanvas() {
    var dom = document.getElementById("reviewRegistMask");
    img = new Image(),
    serializer = new XMLSerializer(),
    svgStr = serializer.serializeToString(dom);
    data = 'data:image/svg+xml;base64,' + window.btoa(unescape(encodeURIComponent(svgStr)));
    var canvas = document.createElement("canvas");
    canvas.width = 400;
    canvas.height = 400;
    context = canvas.getContext("2d");
    img.src = data;
    img.onload = function () {
        context.drawImage(img, 0, 0, 400, 400);
        var canvasdata = canvas.toDataURL("image/png");
        let nameMask = detailSignStamp.imgName || ('mask' + common.UUID() + '.png');
        if(detailSignStamp.imgName == null){
            detailSignStamp.imgName = nameMask;
        }
        let pathMask = path.join(pathSignStamp, nameMask);
        fs.writeFileSync(pathMask, canvasdata.replace(/^data:image\/png;base64,/, ""), 'base64');
        processFileSignJson(true);
        closeSignMark();
        openStampCenter();
    };
}

function onAddStamp(){
    ipcRenderer.send('openOtherStampWindow', {otherStampEdit:null}); 
}

function readDir(){
    let listFile = fs.readdirSync(pathOtherStamp);
    if (listFile && listFile.length > 0) {
        let imgsOther = [];
        for (let i = 0; i < listFile.length; i++) {
            let file = listFile[i];
            const fileStamp = path.join(pathOtherStamp, file);
            if (fs.lstatSync(fileStamp).isDirectory()) {

            } else {
                if(fileStamp.indexOf('png') > -1 || fileStamp.indexOf('jpg') > -1 ){
                    imgsOther.push({
                        path:fileStamp,
                        createMs:fs.statSync(fileStamp).mtimeMs
                    })
                }
            }
        }
        return imgsOther.sort((a,b)=>{return b.createMs - a.createMs}).map(x=>x.path);
    }
    return [];
}