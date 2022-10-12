function setAutoUpdate(){
    // ****************************************************************************************************************************************************************
// SCRIPT 2.自動更新
	ipcRenderer.on('update-available-app', (event, arg) => {
        $("#updater").css("transform","translateX(0%)");
        $('#updatecontent').html(arg.msg);
	});

	$('#onUpdateCancel').on('click', (e)  => {
        $("#updater").css("transform","translateX(-200%)");
        if(interValCheckUpdate) clearInterval(interValCheckUpdate);
    });

    $('#onUpdate').on('click', (e) => {
		// $('#updatecontent').text("download....");
        $("#updater").css("transform","translateX(-200%)");
        $('.manche').removeClass('off');
        // $('#onUpdate').css("pointer-events","none");
        ipcRenderer.send('accept-update', "accept"); 
        if(interValCheckUpdate) clearInterval(interValCheckUpdate);
    });

	//******************** NOT DELETE MAYBE CAN USE AT SOMETIME (ASK WHEN UPDATE ) **************************/
    // ipcRenderer.on('download-progress-request',(event,data) => {
    //     $('#updatecontent').text(data.msg);
    // });

    // ipcRenderer.on('update-downloaded-complete',(event,data) => {
    //     $('#updatecontent').text(data.msg);
    //     $('#onUpdate').css("display","none");
    //     $('#onInstall').css("display","inline-block")
    // });

    // $('#onInstall').on('click', (e) => {
    //     ipcRenderer.send('Update-Install', "accept"); 
	// });
	//******************** NOT DELETE MAYBE CAN USE AT SOMETIME (ASK WHEN UPDATE ) **************************/
// END  SCRIPT 2.自動更新
// ****************************************************************************************************************************************************************
// ****************************************************************************************************************************************************************
// SCRIPT 7.「▲」「▼」ボタンクリック
$('body').on('click','#moveDown', () => {
    if(indexFile>-1 && listSelected.length>0){
        if (indexFile < listSelected.length - 1) {
            loadFilePdf(listSelected[indexFile+1].seqNo,true);
        }
    }
});


$('body').on('click','#moveUp', () => {
    if(indexFile>-1 && listSelected.length>0){
        if (indexFile > 0) {
            loadFilePdf(listSelected[indexFile-1].seqNo,true);
        }
    }
});
// END SCRIPT 7.「▲」「▼」ボタンクリック
// ****************************************************************************************************************************************************************

}

function scrollLeftPanel(){
    
    if($('.prodItem.rowSelected')[0]){
        let Height = $('.scrollPanel').height() / 3;
        if($('.prodItem.rowSelected')[0].offsetTop > Height){
            let x = $('.prodItem.rowSelected')[0].offsetTop - Height;
            $('.scrollPanel').scrollTop(x);
        }else{
            $('.scrollPanel').scrollTop(0);
        }
       
    }
}