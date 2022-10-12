function addResize(){
    $(window).resize(e=>{
		ipcRenderer.send('getMinMax', null); 
		$('.allToolbar').scrollLeft(0);
		$('#line-size-change').css('left','');
		$('#color-change').css('left','');
		if(window.innerWidth <= 520 && window.innerWidth > 430){
			if(userInfo){
				$("#usrInfo").text(userInfo.usrId +"...");
			}
		}else if (window.innerWidth <= 430){
			if(userInfo){
				$("#usrInfo").text('');
			}
		}else{
			if(userInfo){
				$("#usrInfo").text((userInfo.usrId || "") + " : " + (userInfo.usrNm || ""));
			}
		}
		$('#tabTop').css('display',((window.innerWidth <= 550) ? 'none' : 'flex'));
		$('#tabLeft,#percent').css('display', ((window.innerHeight <= 260) ? 'none' :'block'));
		
    });

	$('.scrollRight').on('click',e=>{
		$('.allToolbar').scrollLeft($('.allToolbar')[0].scrollLeft+25);
		$('#line-size-change').css('left',(335-$('.allToolbar')[0].scrollLeft)+'px');
		$('#highlightchange').css('left',(270-$('.allToolbar')[0].scrollLeft)+'px');
		$('#color-change').css('left',(370-$('.allToolbar')[0].scrollLeft)+'px');
    });
    
	$('.scrollLeft').on('click',e=>{
		$('.allToolbar').scrollLeft($('.allToolbar')[0].scrollLeft-25);
		$('#line-size-change').css('left',(335-$('.allToolbar')[0].scrollLeft)+'px');
		$('#highlightchange').css('left',(270-$('.allToolbar')[0].scrollLeft)+'px');
		$('#color-change').css('left',(370-$('.allToolbar')[0].scrollLeft)+'px');
	});
} 