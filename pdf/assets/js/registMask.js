
let 
    registerMask = {
        yearRegister : '',
        monthRegister : '',
        dayRegister : '',
        fullDate : "",
        departRegister : "",
        nameRegister:"",
    }
    strSelect = ["#yearRegisterInput","#monthRegisterInput","#dayRegisterInput","#departRegisterInput","#nameRegisterInput"];

$('#closeRegistMask').on('click',()=>{
    $('#registMaskOverlay,.registMaskContainer').removeClass('closePopup')
});

function initRegsiterMask(){
    $('#registMaskOverlay,.registMaskContainer').addClass('closePopup');
    registerMask.nameRegister = userInfo ? userInfo.userName : registerMask.nameRegister;
    convertYear(true);
    $('#departRegisterFull').text(registerMask.departRegister);
    $('#nameRegisterFull').text(registerMask.nameRegister);
    let selector = strSelect.join(",");
    $('body').off('keyup',selector)
    $('body').on('keyup',selector,e=>{
        let key = e.target.id.replace("Input","");
        registerMask[key] = e.target.value;
        if(e.target.id.indexOf('year') > -1 || e.target.id.indexOf('month') > -1 ||e.target.id.indexOf('day') > -1 ){
            convertYear();
        }else{
            $('#'+e.target.id.replace("Input","Full")).text(registerMask[key]);
        }
    })
}

function convertYear(getCurrDay = false){
    if(getCurrDay){
        let date = new Date();
        registerMask.yearRegister = date.getFullYear();
        registerMask.monthRegister = (date.getMonth()+1);
        registerMask.monthRegister = (registerMask.monthRegister+"").length == 1 ? "0"+registerMask.monthRegister : registerMask.monthRegister;
        registerMask.dayRegister = date.getDate();
        $('#yearRegisterInput').val(registerMask.yearRegister);
        $('#monthRegisterInput').val(registerMask.monthRegister);
        $('#dayRegisterInput').val(registerMask.dayRegister);
    }
    registerMask.fullDate = registerMask.yearRegister + "/" + registerMask.monthRegister + "/" +registerMask.dayRegister;
    $('#yearRegisterFull').text(registerMask.fullDate);
}

function saveRegistMaskToCanvas(){
    var dom = document.getElementById("reviewRegistMask");
    var image = document.getElementById("world");
    img = new Image(),
    serializer = new XMLSerializer(),
    svgStr = serializer.serializeToString(dom);
    data = 'data:image/svg+xml;base64,' + window.btoa(unescape(encodeURIComponent(svgStr)))
    var canvas = document.createElement("canvas");
    canvas.width = 400;
    canvas.height = 400;
    context = canvas.getContext("2d");
    img.src = data;
    img.onload = function() {
        context.drawImage(img, 0, 0, 400, 400);
        var canvasdata = canvas.toDataURL("image/png");
        // var pngimg = '<img src="' + canvasdata + '">';
        let nameMask = 'mask'+common.UUID()+'.png';
        let pathMask = path.join(pathRegist,nameMask);
        fs.writeFileSync(pathMask, canvasdata.replace(/^data:image\/png;base64,/, ""), 'base64');
        handleImg(pathMask);
        $('#registMaskOverlay,.registMaskContainer').removeClass('closePopup')
    };
}

function toggleStamp(){
    $('.stampContainer,.registMaskOverlay').toggleClass('closePopup')
}

function addStampImage(){
    ipcRenderer.send('openFile', 'image');
}

function toogleMapStamp(){
    $('.navbar.custom-tab-search').toggleClass('panel-search-show');
    $('#panel-search2').css('display','block')
}