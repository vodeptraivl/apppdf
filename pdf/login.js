const {ipcRenderer} = require('electron')
const common = require("../js/common");
const remote = require('electron').remote;
const loginService = require('../js/loginService');


// ****************************************************************************************************************************************************************
// Run script when document ready
// ****************************************************************************************************************************************************************

window.onload = function() {
	setTimeout(_=>{$('.manche').addClass('off')},500);
};

$(document).ready(function(){
    datalogin={};
    message=[];
    common.showHideLoader(true);
    // ****************************************
	// script get config
    ipcRenderer.send('dataLoginRequest', null); 
    ipcRenderer.on('dataLoginReply',(event,data)=>{
        datalogin=data.datalogin;
        message=data.message;
        
        loginService.getNoitices(datalogin.url).subscribe(data=>{
            common.showHideLoader(false);
            let table = "";
            if(!data.error){
                if(data.data && data.data.length>0){
                    table = 
                        '<div class="headerTableDetailPWA">お知らせ</div>'
                        +'<div class="bodyTableDetailPWA" id="bodyTableDetailPWA">'
                        +'<table class="tableDetailPWA">'
                    for(let i = 0 ; i<data.data.length;i++){
                        table += '<tr><td style="border-top: none;">'+common.dateFormat(data.data[i].dySet)+'</td><td style="border-top: none;">'+data.data[i].contents+'</td></tr>'
                    }
                    table +='</table>'+'</div>';
                }
            } else {
                $('#drawingSearchOverlay').css('display','block');
                $('#errorContainer').css('display','block');
                $('#modal-message').html(common.getMessageWithErrorCode(data.errorCode,message));
            }
            $('#tablePWA').html(table);
        });
    });


    $("#closeQuit").on("click",function(){
        ipcRenderer.send('closeLoginWindow', "close"); 
    });

    $('#onOk').click(function(){
        $('#drawingSearchOverlay').css('display','none');
        $('#errorContainer').css('display','none');
        $('#modal-message').html('');
    });

    ipcRenderer.on('haskey-error',(event,data)=>{
        $('#drawingSearchOverlay').css('display','block');
        $('#errorContainer').css('display','block');
        $('#modal-message').html(common.getMessageWithErrorCode(data,message));
        return;
    })
    // END script get config
    // ****************************************
	
    // ****************************************
	// script login
    $('#loginForm').on('submit', function(e){
        e.preventDefault();
        let userid = document.getElementById("userid").value;
        let password = document.getElementById("password").value;
        if(userid == "" || password == ""){
            let mess = common.getMessageWithErrorCode("LPWE0003",message);
            $('#lable-message-error').text(mess);
            return;
        }

        common.showHideLoader(true);
        let data = new FormData();
        data.append('userid',userid);
        data.append('password',password);
        loginService.login(datalogin.url,data).subscribe(x=>{
            common.showHideLoader(false);
            if(x.error){
                let mess = common.getMessageWithErrorCode(x.errorMess,message);
                $('#lable-message-error').text(mess);

                return;
            }else{
                ipcRenderer.send('loginSuccess', {"userid":x.userid,"uh2":x.uh2}); 
            }
        });
    });
    // END script login
    // ****************************************

    // ****************************************
	// script autoupdate
    ipcRenderer.on('update-available-app', (event, arg) => {
        $("#updater").css("transform","translateX(0%)");
        $('#updatecontent').html(arg.msg);
    });
    $('#onUpdateCancel').on('click', function(e){
        $("#updater").css("transform","translateX(-200%)");
    });

    $('#onUpdate').on('click', function(e){
        // $('#updatecontent').text("download....");
        $("#updater").css("transform","translateX(-200%)");
        // $('#onUpdate').css("pointer-events","none");
        ipcRenderer.send('accept-update', "accept"); 
        $('.manche').removeClass('off');
    });

    // ipcRenderer.on('download-progress-request',(event,data)=>{
    //     $('#updatecontent').text(data.msg);
    // });

    // ipcRenderer.on('update-downloaded-complete',(event,data)=>{
    //     $('#updatecontent').text(data.msg);
    //     $('#onUpdate').css("display","none");
    //     $('#onInstall').css("display","inline-block")
    // });

    // $('#onInstall').on('click', function(e){
    //     ipcRenderer.send('Update-Install', "accept"); 
    // });
    // END script autoupdate
    // ****************************************
})
