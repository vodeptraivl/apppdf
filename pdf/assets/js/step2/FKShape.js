var typeShape = "";
var svg = null;
var idLine = null;
var startPoint = { x: 0, y: 0 };
var shapeSelect = '';
var shapeCopy = null;
var modeShape = 'main'
FKCreateTouchScroll()
$('body')
.on('mouseenter', '.FKShape', function () {
    $('.FKShape,.FKmarker').removeClass('hover');
    $(this).addClass('hover');
    let marker = $(this).attr("marker");
    if (marker) {
        $(`#${marker},#${marker}Left,#${marker}Right`).addClass('hover');
    }
})
.on('mouseleave', '.FKShape', function () {
    $('.FKShape,.FKmarker').removeClass('hover')
})
.on('click', '.FKShape,.FKtextAreaF,.FKtextArea', (e) => {
    if(e.target.classList.value.indexOf('FKtextAreaF') > -1 || e.target.classList.value.indexOf('FKtextArea') > -1){
        let idtarget = e.target.getAttribute('idta');
        if(!$(`#${idtarget}`).hasClass('selectShape')){
            appendFKtoolShape(idtarget,e.target.getAttribute('idsvg'));
        }
        // e.stopPropagation();
       
    }else{
        let idtarget = e.target.getAttribute('id');
        if(!$(`#${idtarget}`).hasClass('selectShape')){
            appendFKtoolShape(idtarget,e.target.parentElement.getAttribute('id'));
        }
        
    }
    
        
})
.off('focus blur','.FKtextArea')
.on('focus','.FKtextArea',()=>{
     callBackShape({type: 'textarea',onOff:true});
    if(modeShape == 'main') offScroll(true);
})
.on('blur','.FKtextArea',(e)=>{
    callBackShape({type: 'textarea',onOff:false});
    e.target.parentElement.querySelector('.FKtextAreaF').innerText = e.target.value;
    if(modeShape == 'main') offScroll(false);
});


function drawShape(params) {
    let divMain = `.divMain-${itemLoadPdf.seqNo}-page-${params.pageNumber}-${tabCurrent}`;
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
            $('.imgContainer').removeClass('zindx1 zindx2 zindx3').addClass('zindx3');
            let item = document.querySelector(`#FKS${idLine}`);
            switch(item.nodeName){
                case 'line':
                    let w = +item.getAttribute('x2')-(+item.getAttribute('x1'));
                    w = w < 0 ? -w : w
                    let h = +item.getAttribute('y2')-(+item.getAttribute('y1'));
                    h = h < 0 ? -h : h
                    if(+h < 40 && +w < 40){
                        $(`#FKS${idLine},#FKS${idLine}[idshape="${idLine}"],#FKSM${idLine},#FKSM${idLine}Left,#FKSM${idLine}Right`).remove();
                        return;
                    }
                    break;
                case 'rect':
                    if(+item.getAttribute('width') < 40 && +item.getAttribute('height') < 40){
                        item.remove();
                        return;
                    }
                    break;
                case 'ellipse':
                    if(+item.getAttribute('rx') < 20 && +item.getAttribute('ry') < 20){
                        item.remove();
                        return;
                    }
                    break
                
            }
            
            historyMain.push({
                type: 'shape',
                element: item.cloneNode(true),
                svg: document.querySelector(`#SVG${params.idSVG}`),
                idShape : `FKS${idLine}`,
                idSvg : `#SVG${params.idSVG}`,
                function:'init'
            });
            $('.fa-undoCustom').removeClass("btn-disable");
	        clearHistoryRedo();
            break;
    }
}


function openShape(e) {
    e.stopPropagation();
    if (itemLoadPdf) {
        $('#line-size-change,#color-change,#highlightchange').css('display','none');
        $('.shapeTypeContainer').toggleClass('active');
        clearSelect(true);
        removeShapeSltor();
        $('.stampProdCon').removeClass('active');
    }
}

function shapeChose(type) {
    typeShape = type;
    canDrawShape = true;
    setPaint(false, false);
    setFont(false);
    setText(false);
    turnDraw(true);
    $('.imgContainer').removeClass('zindx1 zindx2 zindx3').addClass('zindx1')
}

function turnDraw(mode) {
    $('.svg-container').removeClass('zindx3').addClass('zindx1');
    if (allTabs != null && allTabs.length > 0) {
        for (let i = 0; i < allTabs.length; i++) {
            if (allTabs[i].signaPads && allTabs[i].signaPads.length > 0) {
                allTabs[i].signaPads.forEach(function (item, index) {
                    item.setShapeDraw(mode);
                });
            }
        }
    }
}

function appendSvg(params, divMain) {
    idLine = common.UUID();
    let rotate = $(divMain).attr('rotate');
    let idMaker = common.UUID();
    let shapeEle = getShapeEle(params, idMaker,rotate);
    let maker = getShapeEleMK(idMaker);
    if ($(`#SVG${params.idSVG}`) == null || $(`#SVG${params.idSVG}`).length == 0) {
        let svg = `
            <svg id="SVG${params.idSVG}" class="svg-container zindx1" idtab="${tabCurrent}" FKSVG>
                <defs id="defs-${params.idSVG}" class="defsContainer">${maker}</defs>
                ${shapeEle}
            </svg>`;
        $(divMain).append(svg);
    } else {
        document.querySelector(`#SVG${params.idSVG}`).insertAdjacentHTML('beforeend', `${shapeEle}`);
        document.querySelector(`#defs-${params.idSVG}`).insertAdjacentHTML('beforeend', `${maker}`);
    }
    startPoint = { x: params.event.offsetX, y: params.event.offsetY };
}

function getShapeEle(params, idMaker, rotate) {
    let key = getKey(params);
    switch (typeShape) {
        case 'line':
            return `
                <line 
                    id="FKS${idLine}" 
                    idShape="FKS${idLine}"
                    x1="${params.event[key[0]]}" 
                    y1="${params.event[key[1]]}" 
                    x2="${params.event[key[0]]}" 
                    y2="${params.event[key[1]]}"
                    stroke="transparent"
                    stroke-width="30"
                    rotate="${rotate}"
                    class="FKShape" shadow />
                <line 
                    id="FKS${idLine}"
                    x1="${params.event[key[0]]}" 
                    y1="${params.event[key[1]]}" 
                    x2="${params.event[key[0]]}" 
                    y2="${params.event[key[1]]}"
                    stroke="black"
                    stroke-width="2"
                    rotate="${rotate}"
                    class="FKShape" />  
                    
                `;
        case 'arrow':
            return `
                    <line 
                        id="FKS${idLine}" 
                        idShape="FKS${idLine}"
                        x1="${params.event[key[0]]}" 
                        y1="${params.event[key[1]]}" 
                        x2="${params.event[key[0]]}" 
                        y2="${params.event[key[1]]}"
                        stroke="transparent"
                        stroke-width="30"
                        rotate="${rotate}"
                        class="FKShape" shadow />
                    <line 
                        id="FKS${idLine}" 
                        x1="${params.event[key[0]]}" 
                        y1="${params.event[key[1]]}" 
                        x2="${params.event[key[0]]}" 
                        y2="${params.event[key[1]]}" 
                        stroke="black"
                        stroke-width="2"
                        class="FKShape"
                        marker="FKSM${idMaker}"
                        rotate="${rotate}"
                        marker-end="url(#FKSM${idMaker})"/>`;
        case 'twoWayArrow':
            return `
                    <line 
                        id="FKS${idLine}" 
                        idShape="FKS${idLine}"
                        x1="${params.event[key[0]]}" 
                        y1="${params.event[key[1]]}" 
                        x2="${params.event[key[0]]}" 
                        y2="${params.event[key[1]]}"
                        stroke="transparent"
                        stroke-width="30"
                        rotate="${rotate}"
                        class="FKShape" shadow /> 
                    <line 
                        id="FKS${idLine}" 
                        x1="${params.event[key[0]]}" 
                        y1="${params.event[key[1]]}" 
                        x2="${params.event[key[0]]}" 
                        y2="${params.event[key[1]]}" 
                        class="FKShape"
                        stroke="black"
                        stroke-width="2"
                        marker="FKSM${idMaker}"
                        rotate="${rotate}"
                        marker-start="url(#FKSM${idMaker}Left)" 
                        marker-end="url(#FKSM${idMaker}Right)" />`;
        case 'circle':
            return `<ellipse 
                        id="FKS${idLine}" 
                        cx="${params.event[key[0]]}" 
                        cy="${params.event[key[1]]}" 
                        rx="0" 
                        ry="0" 
                        stroke="black"
                        stroke-width="2"
                        fill="white"
                        rotate="${rotate}"
                        class="FKShape"/>`;
        case 'rectangle':
            return `<rect 
                        id="FKS${idLine}" 
                        x="${params.event[key[0]]}" 
                        y="${params.event[key[1]]}" 
                        class="FKShape"
                        stroke="black"
                        stroke-width="2"
                        fill="white"
                        rotate="${rotate}"
                        width="0" height="0" />`;
    }

}

function getShapeEleMK(id) {
    switch (typeShape) {
        case 'arrow':
            return `
                <marker 
                    id="FKSM${id}" 
                    markerWidth="5"
                    markerHeight="5" 
                    refX="2.5" 
                    refY="2.5" 
                    orient="auto" 
                    markerUnits="strokeWidth" 
                    class="FKmarker"
                    fill="black"
                    ><path d="M0,0 L0,5 L5,2.5 z"></path>
                    </marker>`;
        case 'twoWayArrow':
            return `
            <marker 
                id="FKSM${id}Right" 
                markerWidth="5" 
                markerHeight="5" 
                refX="2.5" 
                refY="2.5" 
                orient="auto" 
                markerUnits="strokeWidth"
                class="FKmarker"
                fill="black"
                >
                <path d="M0,0 L0,5 L5,2.5 z"></path>
            </marker>
            <marker 
                id="FKSM${id}Left" 
                markerWidth="5" 
                markerHeight="5" 
                refX="2.5" 
                refY="2.5" 
                orient="auto" 
                markerUnits="strokeWidth" 
                class="FKmarker"
                fill="black"
            ><path d="M5,5 L5,0 L0,2.5 z"></path>
            </marker>`;
        default:
            return '';
    }

}

function moveShape(params) {
    let key = getKey(params);
    switch (typeShape) {
        case 'line':
        case 'arrow':
        case 'twoWayArrow':
            $(`#FKS${idLine},#FKS${idLine}[idShape="${idLine}"]`).attr('x2', params.event[key[0]]).attr('y2', params.event[key[1]]);
            break;
        case 'circle':
            let rx = (params.event[key[0]] - startPoint.x) / 2;
            let ry = (params.event[key[1]] - startPoint.y) / 2;
            let cx = startPoint.x + rx;
            let cy = startPoint.y + ry;
            $(`#FKS${idLine}`)
                .attr('cx', cx)
                .attr('cy', cy)
                .attr('rx', (rx < 0 ? (-rx) : rx))
                .attr('ry', (ry < 0 ? (-ry) : ry));
            break;
        case 'rectangle':
            let x = params.event[key[0]] < startPoint.x ? params.event[key[0]] : startPoint.x;
            let y = params.event[key[1]] < startPoint.y ? params.event[key[1]] : startPoint.y;
            let width = params.event[key[0]] - startPoint.x;
            let height = params.event[key[1]] - startPoint.y;
            $(`#FKS${idLine}`)
                .attr('width', (width < 0 ? (-width) : width))
                .attr('height', (height < 0 ? (-height) : height))
                .attr('x', (x < 0 ? 0 : x))
                .attr('y', (y < 0 ? 0 : y));
        
            break;
    }
}

function getKey(params) {
    let key = ['offsetX', 'offsetY'];
    if (params.touch) {
        key = ['offsetX', 'offsetY'];
    }

    return key;
}

function appendFKtoolShape(idTar,idSvg) {
    if(itemLoadPdf) offScroll(false);
    if (svgMoveEVent) {
        svgMoveEVent.destroy(() => { svgMoveEVent = null });
    }
  
    idShape = idTar;
    if (svgMoveEVent) {
        svgMoveEVent.destroy(() => { svgMoveEVent = null });
    }
    svgMoveEVent = new FKMoveShape(`#${idSvg}`, 
        {
            idTarget : idTar,
            shapeClass : 'FKShape', shapeSlCls:'selectShape',dotWidth:dotShapeWidth,
            font : {
                color: colorSelected,
                size : (+fontSizeSelected),
                sizeCalc : (+fontSizeSelected*2),
                fontFamify : font,
                modeShape
            }
        }
    , callBackShape);
    // svgMoveEVent.initFKShape(idTar,true);
}

function removeShapeSltor() {
    if (svgMoveEVent) {
        svgMoveEVent.destroy(() => { svgMoveEVent = null });
    }
    $('.dotShape,.rectBorShape,.FKcontainer').remove();
    $('.FKShape').removeClass('selectShape');
}

function callBackShape(e) {
    switch(e.type){
        case 'init':
            clearSelect(true);
            break;
        case 'start':
            if(itemLoadPdf) {
                offScroll(true);
            }
            clearSelect(true)
            break;
        case 'end':
            if(itemLoadPdf) {
                offScroll(false);
            }
            historyMain.push({
                type: 'shape',
                shapeAfter: e.shapeAfter,
                shapeBefore: e.shapeBefore,
                svg: e.svg,
                hasTxt : e.hasTxt,
                txtAfter : e.txtAfter || null,
                txtBefore : e.txtBefore || null,
                idShape : e.id,
                idSvg : e.idSvg,
                function:'dragOrResize'
            });
            clearHistoryRedo();
            break;
        case 'noneAction':
            removeShapeSltor();
            $('.stampProdCon').removeClass('active');
            clearSelect(true);
            break;
        case 'scroll':
            if(itemLoadPdf) zoomFileCallBack(e);
            break;
        case 'textarea':
            setTimeout(_=>{txtShapeFc = e.onOff;},200)
            break;
        case 'style':
            historyMain.push({
                type: 'shape',
                shapeAfter: e.shapeAfter,
                shapeBefore: e.shapeBefore,
                svg: e.svg,
                hasTxt : e.hasTxt,
                idShape : e.id,
                idSvg : e.idSvg,
                markerid : e.markerid || null,
                function:'style'
            });
            clearHistoryRedo();
            break;
        case 'zoom':
            if (svgMoveEVent) {
                svgMoveEVent.destroy(() => { svgMoveEVent = null });
            }
            break;
    }
}

function handleHistoryShape(item,method){
    if(method == 'undo') historyMainRedo.push(item);
    if(method == 'redo') historyMain.push(item);
    item.svg.scrollIntoView({block: "start",behavior: 'smooth'});
    let itemShape = document.querySelector(`#${item.idShape}`);
    if(itemShape.hasAttribute('shadow')){
        itemShape = document.querySelectorAll(`#${item.idShape}`)[1];
    }
    switch(item.function){
        case 'init':
            if(method == 'undo') {
                itemShape.style.display = 'none';
                $(`foreignObject[idta="${item.idShape}"],#${item.idShape}[idShape="${item.idShape}"]`).css('display','none');
            };
            if(method == 'redo') {
                itemShape.style.display = '';
                $(`foreignObject[idta="${item.idShape}"],#${item.idShape}[idShape="${item.idShape}"]`).css('display','');
            }
            break;
        case 'dragOrResize':
        case 'delete':
        case 'style':
            itemShape.replaceWith(
                method == 'undo' ? 
                  item.shapeAfter
                : item.shapeBefore
                );
            if(item.hasTxt){
                let text = $(`.FKtextArea[idta="${item.idShape}"]`).val();
                let itemR = method == 'undo' ? 
                    item.txtAfter
                : item.txtBefore;
                if(itemR){
                    document.querySelector(`foreignObject[idta="${item.idShape}"]`).replaceWith(
                        method == 'undo' ? 
                          item.txtAfter
                        : item.txtBefore);
                }else{
                    $(`foreignObject[idta="${item.idShape}"]`).css('display',method == 'undo' ? '' : 'none');
                }
                $(`.FKtextArea[idta="${item.idShape}"]`).val(text);
                $(`.FKtextAreaF[idta="${item.idShape}"]`).text(text);
            }else{
                $(`foreignObject[idta="${item.idShape}"]`).css('display','none');
            }

            if(item.markerid){
                let fill = method == 'undo' ? item.shapeAfter.getAttribute('stroke') : item.shapeBefore.getAttribute('stroke');
                $(`#${item.markerid},#${item.markerid}Left,#${item.markerid}Right`).attr('fill',fill);
            }
            break;
    }
    repairShadow(item.idShape);
    
    removeShapeSltor();
    $('.stampProdCon').removeClass('active');
}

var scrollSvg = null;
function FKCreateTouchScroll(){
    $('body').off('touchstart touchmove touchend', '.svg-container');
    $('body').on('touchstart', '.svg-container', e =>{
        if (e.touches.length > 1) {
            if (svgMoveEVent) {
                svgMoveEVent.destroy(() => { svgMoveEVent = null });
            }
            scrollSvg = e.target;
            scrollSvg.addEventListener("touchmove",scrollSVGMove);
            scrollSvg.addEventListener("touchend",EndscrollSVGMove);
        }
    });
}

function scrollSVGMove(e){
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
        endTouch: false,
        type: 'scroll'
    });
}

function EndscrollSVGMove(e){
    scrollSvg.removeEventListener('touchmove',scrollSVGMove);
    scrollSvg.removeEventListener('touchend',EndscrollSVGMove);
    scrollSvg = null;
    offScroll(false);
}

function repairShadow(idShape){
    let shadow = document.querySelector(`#${idShape}[idShape="${idShape}"]`);
    if(shadow != null){
        let line = document.querySelectorAll(`#${idShape}`)[1];
        shadow.setAttribute('x1', line.getAttribute('x1'));
        shadow.setAttribute('x2', line.getAttribute('x2'));
        shadow.setAttribute('y1', line.getAttribute('y1'));
        shadow.setAttribute('y2', line.getAttribute('y2'));
    }
}

function clearShapeRedo(){
    // let FKforeign = document.querySelectorAll('.FKforeign');
    // if(FKforeign){
    //     FKforeign.forEach(x=>{
    //         if(x.style.display == 'none') x.remove();
    //     })
    // }
    
    // let FKShape = document.querySelectorAll('.FKShape');
    // if(FKShape){
    //     FKShape.forEach(x=>{
    //         if(x.style.display == 'none') {
    //             let id = x.getAttribute('id');
    //             let markerid = x.getAttribute('marker');
    //             let removeid = `#${id}`;
    //             if(markerid) {
    //                 removeid += `,#${markerid},#${markerid}Left,#${markerid}Right`
    //             }
    //             $(removeid).remove();
    //             // x.remove();
    //         }
    //     })
    // }
}

function pastShape(){
    if(modeShape == 'main'){
        setPaint(false, false);
        setFont(false);
        setText(false);
    }
    let cloneShape = itemcoppy.item.cloneNode(true);
    cloneShape.classList.remove('selectShape');
    cloneShape.classList.remove('hover');
    let idShape = itemcoppy.item.getAttribute('id');
    let newId = common.UUID();
    cloneShape.setAttribute('id',`FKS`+newId);
    let divMain = document.querySelector(
        (modeShape == 'main') ? ('.divMain-'+itemLoadPdf.seqNo+'-page-'+(pageCurrent-1)+'-'+tabCurrent)
        : '#containerCanvasStamp'
    );
    let rotate = +divMain.getAttribute('rotate');
    let currentTab = allTabs.find(x=>{return x.idtab == tabCurrent});
    let shadow = null;
    let shadowCl = null;
    let marker = [];
    let text = null;
    let idSvg = (currentTab && (modeShape == 'main')) ? currentTab.signaPads[pageCurrent-1].getIdSvg() : otherStampPaint.getIdSvg();
    
    let svg = divMain.querySelector('.svg-container');
    if(svg == null){
        divMain.insertAdjacentHTML('beforeend',`
            <svg id="SVG${idSvg}" class="svg-container zindx1" idtab="${tabCurrent}" FKSVG>
                <defs id="defs-${idSvg}" class="defsContainer"></defs>
            </svg>
        `)
        svg = divMain.querySelector('.svg-container');
    }
    let wc = svg.parentElement.offsetWidth;
    let hc = svg.parentElement.offsetHeight;
    switch(cloneShape.nodeName){
        case 'line':
            shadow = document.querySelector(`#${idShape}[idshape="${idShape}"]`);
            let markerStart = cloneShape.getAttribute('marker-start');
            let markerEnd = cloneShape.getAttribute('marker-end');
            let x1 = cloneShape.getAttribute('x1');
            let x2 = cloneShape.getAttribute('x2');
            let y1 = cloneShape.getAttribute('y1');
            let y2 = cloneShape.getAttribute('y2');
            let wl = +x2-x1,hl = +y2-+y1;
            wl = wl < 0 ? -wl : wl;
            hl = hl < 0 ? -hl : hl;
            x1n = 10;
            y1n = 10;
            x2n = wl;
            y2n = hl;
            switch(rotate){
                case 90:
                    if(+x1 > +x2 && +y1 < +y2){
                        x2n = x1n;
                        x1n = wl+10;
                    }
                    else if(+x1 > +x2 && +y1 > +y2){
                        x2n = 10;
                        y2n = hc-hl+10;   
                        x1n = wl+10;
                        y1n = hc-10;

                    }
                    else if(+x1 < +x2 && +y1 > +y2){
                        y1n = hc-10;
                        x2n = wl+10;
                        x1n = 10;
                        y2n = hc-hl+10;
                    }else{

                        x1n = 10;
                        x2n = wl+10;
                        y1n = hc-hl+10;
                        y2n = hc - 10;
                    }
                    break;
                case 180:
                    if(+x1 > +x2 && +y1 < +y2){
                        x1n = wc-10;
                        y1n = hc-hl+10;
                        x2n = wc-wl+10;
                        y2n = hc-10
                    }
                    else if(+x1 > +x2 && +y1 > +y2){
                        x1n = wc-10;
                        x2n = wc-wl+10;
                        y2n = hc-hl+10;   
                        y1n = hc-10;

                    }
                    else if(+x1 < +x2 && +y1 > +y2){
                        x1n = wc-wl+10;
                        y1n = hc-10;
                        x2n = wc-10;
                        y2n = hc-hl+10;
                    }else{

                        x1n = wc-wl+10;
                        x2n = wc-10;
                        y1n = hc-hl+10;
                        y2n = hc - 10;
                    }
                    break;
                case 270:
                    if(+x1 > +x2 && +y1 < +y2){
                        x1n = wc-10;
                        y1n = 10;
                        x2n = wc-wl-10;
                        y2n = hl-10
                    }
                    else if(+x1 > +x2 && +y1 > +y2){
                        x1n = wc-10;
                        y1n = hl-10;
                        x2n = wc-wl+10;
                        y2n = 10;   

                    }
                    else if(+x1 < +x2 && +y1 > +y2){
                        x1n = wc-wl+10;
                        y1n = hl-10;
                        x2n = wc-10;
                        y2n = 10;
                    }else{
                        x1n = wc-wl+10;
                        y1n = 10;
                        x2n = wc-10;
                        y2n = hl-10;
                    }
                    break;
                default:
                    if(+x1 > +x2 && +y1 < +y2){
                        x2n = x1n;
                        x1n = wl+10;
                    }
                    if(+x1 > +x2 && +y1 > +y2){
                        x2n = 10;
                        y2n = 10;   
                        x1n = wl+10;
                        y1n = hl+10;

                    }
                    if(+x1 < +x2 && +y1 >    +y2){
                        y1n = hl+10;
                        x2n = wl+10;
                        x1n = 10;
                        y2n = 10;
                    }
                    break;
            }
            cloneShape.setAttribute('x1',x1n);
            cloneShape.setAttribute('y1',y1n);
            cloneShape.setAttribute('x2',x2n);
            cloneShape.setAttribute('y2',y2n);
            if(shadow){
                shadowCl = shadow.cloneNode(true);
                shadowCl.setAttribute('x1',x1n);
                shadowCl.setAttribute('y1',y1n);
                shadowCl.setAttribute('x2',x2n);
                shadowCl.setAttribute('y2',y2n);
                shadowCl.setAttribute('id',`FKS`+newId);
                shadowCl.setAttribute('idshape',`FKS`+newId);
            }
            if(markerStart){
                let idMkS = markerStart.replace('url(','').replace(')','');
                let markK = document.querySelector(idMkS);
                if(markK){
                    let markClone = markK.cloneNode(true);
                    let idMaker = `FKSM${newId}Left`
                    markClone.setAttribute('id',idMaker);
                    cloneShape.setAttribute('marker-start',`url(#${idMaker})`);
                    cloneShape.setAttribute('marker',idMaker);
                    marker.push(markClone);
                }
            }
            if(markerEnd){
                let idMkE = markerEnd.replace('url(','').replace(')','');
                let markE = document.querySelector(idMkE);
                if(markE){
                    let markCloneE = markE.cloneNode(true);
                    let idMakerE = `FKSM${newId}Right`
                    markCloneE.setAttribute('id',idMakerE);
                    cloneShape.setAttribute('marker-end',`url(#${idMakerE})`)
                    cloneShape.setAttribute('marker',`FKSM${newId}`);
                    marker.push(markCloneE);
                }
                
            }
            break;
        case 'rect':
            text = document.querySelector(`.FKforeign[idta="${idShape}"]`);
            let x = cloneShape.getAttribute('x');
            let y = cloneShape.getAttribute('y');
            let w = cloneShape.getAttribute('width');
            let h = cloneShape.getAttribute('height');
            let xn = 10,yn = 10;
            switch(rotate){
                case 90:
                    yn = +hc-(+h+10)
                    break;
                case 180:
                    xn = +wc-(+w+10)
                    yn = +hc-(+h+10)
                    break;
                case 270:
                    xn = +wc-(+w+10)
                    break;
            }
            if(text){
                text = text.cloneNode(true);
                text.setAttribute('idta',`FKS`+newId);
                text.children[0].children[1].setAttribute('idta',`FKS`+newId);
                text.children[0].children[0].setAttribute('idta',`FKS`+newId);
                text.children[0].children[0].setAttribute('idsvg',`SVG${idSvg}`);
                text.children[0].setAttribute('idta',`FKS`+newId);
                text.setAttribute('x',xn);
                text.setAttribute('y',yn);
            }
            cloneShape.setAttribute('x',xn);
            cloneShape.setAttribute('y',yn);
        case 'ellipse':
            
            text = document.querySelector(`.FKforeign[idta="${idShape}"]`);
            let cx = cloneShape.getAttribute('cx');
            let cy = cloneShape.getAttribute('cy');
            let rx = cloneShape.getAttribute('rx');
            let ry = cloneShape.getAttribute('ry');
            let cxn = +rx+10,cyn = +ry+10;
            switch(rotate){
                case 90:
                    cyn = +hc-(+ry+10)
                    break;
                case 180:
                    cxn = +wc-(+rx+10)
                    cyn = +hc-(+ry+10)
                    break;
                case 270:
                    cxn = +wc-(+rx+10)
                    break;
            }
            if(text){
                let A = {x: +rx / Math.sqrt(2), y: +ry / Math.sqrt(2)};
                let x1 = +cxn-(+A.x),
                    y1 = +cyn-(+A.y);
                text = text.cloneNode(true);
                text.setAttribute('idta',`FKS`+newId);
                text.children[0].children[1].setAttribute('idta',`FKS`+newId);
                text.children[0].children[0].setAttribute('idta',`FKS`+newId);
                text.children[0].children[0].setAttribute('idsvg',`SVG${idSvg}`);
                text.children[0].setAttribute('idta',`FKS`+newId);
                text.setAttribute('x',+x1);
                text.setAttribute('y',+y1);
            }
            cloneShape.setAttribute('cx',+cxn);
            cloneShape.setAttribute('cy',+cyn);
            break;
    }
    
    
    if(shadowCl) svg.insertAdjacentElement('beforeend',shadowCl);
    svg.insertAdjacentElement('beforeend',cloneShape);
    if(text) svg.insertAdjacentElement('beforeend',text);
    svg.scrollIntoView({block: "start",behavior: 'smooth'})
    if(marker.length > 0){
        marker.map(x=>{document.querySelector(`#defs-${idSvg}`).insertAdjacentElement('beforeend',x)});
    }
    itemcoppy  = {};
    historyMain.push({
        type: 'shape',
        element: cloneShape.cloneNode(true),
        svg,
        idShape : `FKS${newId}`,
        idSvg : `#SVG${idSvg}`,
        function:'init'
    });
    $('.fa-undoCustom').removeClass("btn-disable");
    clearHistoryRedo();
    if(modeShape == 'main') offScroll(false);
}

//********************************************************************************************************************************************************************************************************************************************************************************************************************************
//********************************************************************************************************************************************************************************************************************************************************************************************************************************
//********************************************************************************************************************************************************************************************************************************************************************************************************************************
//handle shape ( drag, resize, text)
//Author : FKVL

class FKMoveShape {
    constructor(svg, options, callBackDrag = null) {
        this.svg = typeof svg === 'string' ?
            document.querySelector(svg) :
            svg;
        this.svgId = svg.replace("#","");
        this.options = options;
        this.containerWidth = this.svg.parentElement.offsetWidth;
        this.containerHeight = this.svg.parentElement.offsetHeight;
        this.colorTool = options.colors || ['ff0000', 'ffff00', '00ff00', '00ffff', 'ffa500', '008000', '0000ff', 'ff1493', '000000', '808080', '800080', 'ffffff'];
        this.transparents = options.transparents || [0.3,0.5,0.7,1];
        this.thickness = options.thickness || [0.25,0.5,0.75,1,1.5,2.25,3,4.5,6];
        this.dashStyles = options.dashStyles || [{dash : "0,0" },{dash : "5,5"},{dash : ".1,10", style:"round"},{dash : "15,15"},{dash : "30,10"},{dash : "30,10,5,10"},{dash : "30,10,5,5,5,10"}];
        this.dragStart = this.dragStart.bind(this);
        this.dragMove = this.dragMove.bind(this);
        this.dragEnd = this.dragEnd.bind(this);
        this.resizeMove = this.resizeMove.bind(this);
        this.dragResizeEnd = this.dragResizeEnd.bind(this);
        this.scrollTouch = this.scrollTouch.bind(this);
        this.scrollTouchEnd = this.scrollTouchEnd.bind(this);
        this.onContextMenu = this.onContextMenu.bind(this);
        this.svg.addEventListener('touchstart', this.dragStart, false);
        this.svg.addEventListener('mousedown', this.dragStart, false);
        this.svg.addEventListener("contextmenu", this.onContextMenu);

        this.callBackDrag = callBackDrag || null;
        this.font = this.options.font ;
        $('.FKcontainer').remove();
        if (this.callBackDrag) {
            this.callBackDrag({type: 'init'});
        }
        this.padding = 5;
        this.initFKShape(this.options.idTarget,true);      
    }

    dragStart(e) {
        if (
                (e.target.hasAttribute('idta') && e.target.getAttribute('idta') != this.idTarget)
            ||  (e.target.classList.value.indexOf('FKShape') > -1 && e.target.getAttribute('id') != this.idTarget)
            ) {
            if (this.callBackDrag) {
                this.callBackDrag({
                    type:'zoom'
                });
            }
            return;
        }
        $('.colorCtn,.tranpCtn,.dashStyle,.thickness').removeClass('active');
        this.handleRight = '';
        this.txtArea = null;
        if (e.type === 'touchstart' && e.touches.length > 1) {
            if (this.callBackDrag) {
                this.callBackDrag({
                    type:'zoom'
                });
            }
            return;
        }
        if (e.type === 'mousedown' && e.which !== 1) return;
        if (e.type === 'touchstart' && e.touches.length > 1) {
            this.svg.addEventListener('touchmove', this.scrollTouch, {passive: false });
            this.svg.addEventListener('touchend', this.scrollTouchEnd, false);
            return
        };

        let el = e.target;
        let on = false;
        while (el) {
            if (el.hasAttribute('FKSVG') || el.hasAttribute('fksvg')) break;
            if (
                el.classList.value.indexOf(this.options.shapeSlCls) > -1 
                || el.classList.value.indexOf('rectBorShape') > -1
                || el.hasAttribute('fktextarea')
                || el.hasAttribute('fktextareac')
                || el.hasAttribute('shadow')
                || el.classList.value.indexOf('FKtextAreaF') > -1
            ) {
                this.handle = 'dragItem';
                on = true; 
            } else if (el.hasAttribute('dot')) {
                this.itemDot = el;
                this.handle = "resizeShape";
                this.dot = el.getAttribute('dot');
                // this.idTarget = el.getAttribute('idtarget');
                on = true;
            } else if (el.hasAttribute('tool')) {
                this.itemDot = el;
                this.handle = el.getAttribute('tool');
                if(this.handle == 'transparent'){
                    this.toolSub = document.querySelector('.tranpCtn');
                    this.toolSub.classList.add('active');
                }else if(this.handle == 'text'){
                    this.txtArea = document.querySelector(`textarea[idta="${this.idTarget}"]`) ;
                    if(this.txtArea == null){
                        this.addText();
                    }else{
                        if(this.txtArea){
                            $('.FKcontainer').remove();
                            this.txtAreaF = this.txtArea.parentElement.querySelector('.FKtextAreaF');
                            this.focusText()
                            return;
                        }
                    }
                    on = true;
                }else if(this.handle == 'stroke-width'){
                    this.toolSub = document.querySelector('.thickness');
                    this.toolSub.classList.add('active');
                    
                    on = true;
                }else if(this.handle == 'stroke-dasharray'){
                    this.toolSub = document.querySelector('.dashStyle');
                    this.toolSub.classList.add('active');
                    on = true;
                } else{
                    this.toolSub = document.querySelector('.colorCtn');
                    this.toolSub.classList.add('active');
                    this.toolSub.style.top = this.handle == 'stroke' ? '69px' : '140px'
                }
                on = true;
            } else if (el.hasAttribute('crls')) {
                this.toolSub.classList.remove('active');
                this.itemClone = this.item.cloneNode(true);
                this.item.setAttribute([this.handle],`#${el.getAttribute('crls')}`);
                let markerid = this.item.getAttribute('marker');
                if(markerid){
                    $(`#${markerid},#${markerid}Left,#${markerid}Right`).attr('fill',`#${el.getAttribute('crls')}`);
                }
                if (this.callBackDrag) {
                    this.callBackDrag({
                        type:'style',
                        id : this.idTarget,
                        svg : this.svg,
                        hasTxt : false,
                        shapeAfter : this.itemClone,
                        shapeBefore : this.item.cloneNode(true),
                        markerid : markerid
                    });
                }
                on = true;
            } else if (el.hasAttribute('opa')) {
                this.toolSub.classList.remove('active');
                this.itemClone = this.item.cloneNode(true);
                this.item.setAttribute('opacity',el.getAttribute('opa'));
                if (this.callBackDrag) {
                    this.callBackDrag({
                        type:'style',
                        id : this.idTarget,
                        svg : this.svg,
                        hasTxt : false,
                        shapeAfter : this.itemClone,
                        shapeBefore : this.item.cloneNode(true)
                    });
                }
                on = true;
            } else if (el.hasAttribute('thickness')) {
                let strokeWidthNew = +el.getAttribute('thickness')*2;
                let dashStyleOld = this.item.getAttribute('dashchose');
                this.itemClone = this.item.cloneNode(true);
                this.item.setAttribute([this.handle],strokeWidthNew);
                if(dashStyleOld){
                    this.item.setAttribute('stroke-dasharray',dashStyleOld.split(",").map(x=>{
                        let dis = x;
                        if(x%5 == 0) dis = x/5;
                        return (strokeWidthNew*dis)+"";
                    }).join(","));
                }
                this.toolSub.classList.remove('active');
                if (this.callBackDrag) {
                    this.callBackDrag({
                        type:'style',
                        id : this.idTarget,
                        svg : this.svg,
                        hasTxt : false,
                        shapeAfter : this.itemClone,
                        shapeBefore : this.item.cloneNode(true)
                    });
                }
                on = true;
            } else if (el.hasAttribute('dash')) {
                let dashStyle = el.getAttribute('dash');
                let dashLine = el.getAttribute('dashstyle');
                let strokeWidth = this.item.getAttribute('stroke-width');
                strokeWidth = strokeWidth < 5 ? 5 : strokeWidth;
                this.itemClone = this.item.cloneNode(true);
                this.item.setAttribute([this.handle],dashStyle.split(",").map(x=>{
                    let dis = x;
                    if(x%5 == 0) dis = x/5;
                    return (strokeWidth*dis)+"";
                }).join(","));
                this.item.setAttribute('dashchose',dashStyle);
                if(dashLine){
                    this.item.setAttribute('stroke-linecap',dashLine);
                }else{
                    this.item.removeAttribute('stroke-linecap');
                }
                this.toolSub.classList.remove('active');
                if (this.callBackDrag) {
                    this.callBackDrag({
                        type:'style',
                        id : this.idTarget,
                        svg : this.svg,
                        hasTxt : false,
                        shapeAfter : this.itemClone,
                        shapeBefore : this.item.cloneNode(true)
                    });
                }
                on = true;
            } else if (el.hasAttribute('fktext')) {
                $('.FKcontainer').remove();
                on = true;
                break;
            }
            el = el.parentElement;
        }
        if (!on) {
            if (this.callBackDrag) {
                this.callBackDrag({
                    type: 'noneAction'
                })
            }
            return;
        };

        if (['text', 'transparent', 'fill', 'stroke','stroke-dasharray','stroke-width'].indexOf(this.handle) > -1) {
            return;
        }

        this.touch = e.type == 'touchstart';
        let point = this.getDragXY(e);
        this.startPoint = point;
        this.endPoint = null;
        this.itemDotArr = [];
        let totalDot = 2;
        switch (this.item.nodeName) {
            case 'line':
                let x1 = this.item.getAttribute('x1');
                let x2 = this.item.getAttribute('x2');
                let y1 = this.item.getAttribute('y1');
                let y2 = this.item.getAttribute('y2');
                let cx1 = point.x - (+x1);
                let cx2 = point.x - (+x2);
                let cy1 = point.y - (+y1);
                let cy2 = point.y - (+y2);
                this.originPoint = {x1,x2,y1,y2,cx1,cx2,cy1,cy2};
                break;
            case 'rect':
                totalDot = 8;
                let xo = this.item.getAttribute('x');
                let yo = this.item.getAttribute('y');
                let wo = this.item.getAttribute('width');
                let ho = this.item.getAttribute('height');
                let dsx = point.x - (+xo);
                let dsy = point.y - (+yo);
                this.originPoint = {
                    xo,yo,wo,ho,dsx,dsy,x1: xo,y1: yo,
                    x2: +xo + (+wo),y2: yo,x3: xo,y3: +yo + (+ho),
                    x4: +xo + (+wo),y4: +yo + (+ho),x5: +xo + (+wo / 2),
                    y5: yo,x6: +xo + +wo,y6: yo + (+ho) / 2,x7: xo,
                    y7: yo + (+ho) / 2,x8: +xo + (+wo / 2),y8: +yo + +ho
                };
                this.txtArea = document.querySelector(`textarea[idta="${this.idTarget}"]`) ;
                if(this.txtArea){
                    this.txtAreaF = this.txtArea.parentElement.querySelector('.FKtextAreaF');
                    this.txtArea.setAttribute('disabled',true);
                    this.txtArea.blur();
                    
                    this.txtArea.style.display = 'none';
                    this.txtAreaF.style.display = '';
                }
                break;
            case 'ellipse':
                totalDot = 8;
                let cx = this.item.getAttribute('cx');
                let cy = this.item.getAttribute('cy');
                let rx = this.item.getAttribute('rx');
                let ry = this.item.getAttribute('ry');
                let drcx = point.x - (+cx);
                let drcy = point.y - (+cy);
                this.originPoint = {
                    cx,cy, rx,ry,drcx,drcy,x1: cx, y1: +cy - (+ry), x2: +cx + (+rx),
                    y2: cy,x3: +cx - (+rx),y3: +cy,x4: cx,y4: +cy + (+ry),x5: +cx - (+rx),
                    y5: +cy - (ry), x6: +cx + (+rx), y6: +cy - (+ry),
                    x7: +cx - (+rx),y7: +cy + (+ry), x8: +cx + (+rx),y8: +cy + (+ry)
                };
                this.txtArea = document.querySelector(`textarea[idta="${this.idTarget}"]`) ;
                
                if(this.txtArea){
                    this.txtAreaF = this.txtArea.parentElement.querySelector('.FKtextAreaF');
                    this.txtArea.setAttribute('disabled',true);
                    this.txtArea.blur();
                    this.txtArea.style.display = 'none';
                    this.txtAreaF.style.display = '';
                }
                break;
        }
        for (let i = 1; i <= totalDot; i++) {
            this.itemDotArr.push(document.querySelector(`.dot${i}`))
        }
        $('.FKcontainer').remove();
        if (this.handle == "resizeShape") {
            this.svg.addEventListener(this.touch ? 'touchmove' : 'mousemove', this.resizeMove, {
                passive: false
            });
            this.svg.addEventListener(this.touch ? 'touchend' : 'mouseup', this.dragResizeEnd, false);
            this.itemClone = this.item.cloneNode(true);
            if(this.txtArea){
                this.txtAreaClone = this.txtArea.parentElement.parentElement.cloneNode(true);
            }
        } else {
            $('.dotShape,.rectBorShape').css('opacity', '0');
            this.svg.addEventListener(this.touch ? 'touchmove' : 'mousemove', this.dragMove, {
                passive: false
            });
            this.svg.addEventListener(this.touch ? 'touchend' : 'mouseup', this.dragEnd, false);
            this.itemClone = this.item.cloneNode(true);
            if(this.txtArea){
                this.txtAreaClone = this.txtArea.parentElement.parentElement.cloneNode(true);
            }
        }
        if (this.callBackDrag) {
            this.callBackDrag({
                type: 'start'
            })
        }

    }

    dragMove(e) {
        let point = this.getDragXY(e);
        this.endPoint = point;
        switch (this.item.nodeName) {
            case 'line':
                let nx1 = point.x - (+this.originPoint['cx1']);
                let nx2 = point.x - (+this.originPoint['cx2']);
                let ny1 = point.y - (+this.originPoint['cy1']);
                let ny2 = point.y - (+this.originPoint['cy2']);
                nx1 = nx1 < 0 ? 0 : nx1;
                nx2 = nx2 < 0 ? 0 : nx2;
                ny1 = ny1 < 0 ? 0 : ny1;
                ny2 = ny2 < 0 ? 0 : ny2;
                if (
                    (nx1 - this.padding > 0 && ny1 - this.padding > 0) &&
                    (nx2 - this.padding > 0 && ny2 - this.padding > 0) &&
                    (nx2 + this.padding <= this.containerWidth) &&
                    (ny2 + this.padding <= this.containerHeight) &&
                    (nx1 - this.padding <= this.containerWidth) &&
                    (ny1 - this.padding <= this.containerHeight)
                ) {

                    this.item.setAttribute('x1', nx1);
                    this.item.setAttribute('x2', nx2);
                    this.item.setAttribute('y1', ny1);
                    this.item.setAttribute('y2', ny2);
                    $(`#${this.idTarget}[idShape="${this.idTarget}"]`).attr('x1', nx1).attr('y1', ny1).attr('x2', nx2).attr('y2', ny2);
                }
                break;
            case 'rect':
                let rnx = point.x - (+this.originPoint['dsx']);
                let rny = point.y - (+this.originPoint['dsy']);
                rnx = rnx < 0 ? 0 : rnx;
                rny = rny < 0 ? 0 : rny;
                let rx2 = rnx + (+this.originPoint['wo']);
                let ry3 = rny + (+this.originPoint['ho']);
                if (
                    rx2 + this.padding <= this.containerWidth &&
                    ry3 + this.padding <= this.containerHeight
                ) {
                    this.item.setAttribute('x', rnx);
                    this.item.setAttribute('y', rny);
                    if(this.txtArea){
                        this.txtArea.parentElement.parentElement.setAttribute('x', rnx);
                        this.txtArea.parentElement.parentElement.setAttribute('y', rny);
                    }
                }

                break;
            case 'ellipse':
                let ncx = point.x - (+this.originPoint['drcx']);
                let ncy = point.y - (+this.originPoint['drcy']);
                let d1 = ncy - (+this.originPoint['ry']);
                let d2 = ncx - (+this.originPoint['rx']);
                let d3 = ncx + (+this.originPoint['rx']);
                let d4 = ncy + (+this.originPoint['ry']);
                let A = {x: this.originPoint['rx'] / Math.sqrt(2), y: this.originPoint['ry'] / Math.sqrt(2)};
                let x1 = ncx - A.x,
                    y1 = ncy - A.y;
                if (
                    (d2 - this.padding) > 0 &&
                    (d1 - this.padding) > 0 &&
                    (d3 + this.padding) < this.containerWidth &&
                    (d4 + this.padding) < this.containerHeight
                ) {

                    this.item.setAttribute('cx', ncx);
                    this.item.setAttribute('cy', ncy);
                    if(this.txtArea){
                        this.txtArea.parentElement.parentElement.setAttribute('x', x1);
                        this.txtArea.parentElement.parentElement.setAttribute('y', y1);
                    }
                }
                break;
        }
        if (this.callBackDrag) {
            this.callBackDrag({
                type: 'move'
            })
        }
    }

    dragEnd(e) {
        this.svg.removeEventListener(this.touch ? '   touchmove' : 'mousemove', this.dragMove, { passive: false });
        this.svg.removeEventListener(this.touch ? 'touchend' : 'mouseup', this.dragEnd, false);
        this.initFKShape(null, true);
        $('.dotShape,.rectBorShape').css('opacity', 1);
        this.handle = null;
        // this.item = null;
        this.itemDot = null;
        this.itemDotArr = null;
        this.dot = null;
        // this.idTarget = null;
        this.originPoint = null;
        if( this.endPoint && (JSON.stringify(this.startPoint) != JSON.stringify(this.endPoint))){
            if (this.callBackDrag) {
                this.callBackDrag(this.getModelHistory('end'));
            }
        }else{
            if(this.txtArea){
                this.focusText()
            }
        }
    }
    

    dragResizeEnd(e) {
        this.svg.removeEventListener(this.touch ? 'touchmove' : 'mousemove', this.resizeMove, {
            passive: false
        });
        this.svg.removeEventListener(this.touch ? 'touchend' : 'mouseup', this.dragResizeEnd, false);
        this.initFKShape(null, true);
        this.handle = null;
        // this.item = null;
        this.itemDot = null;
        this.itemDotArr = null;
        this.dot = null;
        // this.idTarget = null;
        this.originPoint = null;
        
        if(this.txtArea){
            this.txtArea.style.display = '';
            this.txtAreaF.style.display = 'none';
            this.txtArea.removeAttribute('disabled');
            this.txtArea.focus();
        }
        if( this.endPoint && (JSON.stringify(this.startPoint) != JSON.stringify(this.endPoint))){
            if (this.callBackDrag) {
                this.callBackDrag(this.getModelHistory('end'));
            }
        }
    }

    resizeMove(e) {
        let point = this.getDragXY(e);
        this.endPoint = point;
        var x = 0;
        var y = 0;
        var w = 0;
        var h = 0;
        var A = {};
        let sos = (this.dot < 5) ? 5 : 13;
        switch (this.item.nodeName) {
            case 'line':
                if (point && point.x > 0 && point.y > 0 && point.x <= this.containerWidth && point.y <= this.containerHeight) {
                    this.item.setAttribute(`x${this.dot}`, point.x);
                    this.item.setAttribute(`y${this.dot}`, point.y);
                    $(`#${this.idTarget}[idShape="${this.idTarget}"]`).attr(`x${this.dot}`, point.x).attr(`y${this.dot}`, point.y);
                }
                break;
            case 'rect':
                x = point.x > this.originPoint[`x${sos - this.dot}`] ? this.originPoint[`x${sos - this.dot}`] : point.x;
                y = point.y > this.originPoint[`y${sos - this.dot}`] ? this.originPoint[`y${sos - this.dot}`] : point.y;
                w = +this.originPoint[`x${sos - this.dot}`] - point.x;
                h = +this.originPoint[`y${sos - this.dot}`] - point.y;
                switch (this.dot) {
                    case '1':
                    case '2':
                    case '3':
                    case '4':
                        this.item.setAttribute('x', (x < 0 ? 0 : x));
                        this.item.setAttribute('y', (y < 0 ? 0 : y));
                        this.item.setAttribute('width', (w < 0 ? (-w) : w));
                        this.item.setAttribute('height', (h < 0 ? (-h) : h));
                        if(this.txtArea){
                            this.txtArea.parentElement.parentElement.setAttribute('x', (x < 0 ? 0 : x));
                            this.txtArea.parentElement.parentElement.setAttribute('y', (y < 0 ? 0 : y));
                            this.txtArea.parentElement.parentElement.setAttribute('width', (w < 0 ? (-w) : w));
                            this.txtArea.parentElement.parentElement.setAttribute('height', (h < 0 ? (-h) : h));
                        }
                        break;
                    case '5':
                    case '8':
                        this.item.setAttribute('y', (y < 0 ? 0 : y));
                        this.item.setAttribute('height', (h < 0 ? (-h) : h));
                        if(this.txtArea){
                            this.txtArea.parentElement.parentElement.setAttribute('y', (y < 0 ? 0 : y));
                            this.txtArea.parentElement.parentElement.setAttribute('height', (h < 0 ? (-h) : h));
                        }
                        break;
                    case '6':
                    case '7':
                        this.item.setAttribute('x', (x < 0 ? 0 : x));
                        this.item.setAttribute('width', (w < 0 ? (-w) : w));
                        if(this.txtArea){
                            this.txtArea.parentElement.parentElement.setAttribute('x', (x < 0 ? 0 : x));
                            this.txtArea.parentElement.parentElement.setAttribute('width', (w < 0 ? (-w) : w));
                        }
                        break;
                }
                if(this.txtArea){
                    this.resizeTxtArea(w,h);
                }
                break;
            case 'ellipse':
                let cx = ((point.x - +this.originPoint[`x${sos - this.dot}`]) / 2);
                let rx = +cx;
                let cy = (point.y - +this.originPoint[`y${sos - this.dot}`]) / 2;
                let ry = +cy;
                
                switch (this.dot) {
                    case '5':
                    case '6':
                    case '7':
                    case '8':
                        cx = cx + +this.originPoint[`x${sos - this.dot}`];
                        cy = cy + +this.originPoint[`y${sos - this.dot}`];
                        cx = (cx < 0 ? (-cx) : cx);
                        cy = (cy < 0 ? (-cy) : cy);
                        rx = (rx < 0 ? (-rx) : rx);
                        ry = (ry < 0 ? (-ry) : ry);
                        A = {x: rx / Math.sqrt(2), y: ry / Math.sqrt(2)};
                        x = cx - A.x,
                        y = cy - A.y;
                        w = A.x*2;
                        h = A.y*2;
                        this.item.setAttribute('cx', cx);
                        this.item.setAttribute('cy', cy);
                        this.item.setAttribute('rx', rx);
                        this.item.setAttribute('ry', ry);
                        
                        if(this.txtArea){
                            this.txtArea.parentElement.parentElement.setAttribute('x', x);
                            this.txtArea.parentElement.parentElement.setAttribute('y', y);
                            this.txtArea.parentElement.parentElement.setAttribute('width', +w);
                            this.txtArea.parentElement.parentElement.setAttribute('height', +h);
                        }
                        break;
                    case '2':
                    case '3':
                        cx = cx + +this.originPoint[`x${sos - this.dot}`];
                        cx = (cx < 0 ? (-cx) : cx);
                        rx = (rx < 0 ? (-rx) : rx);
                        A = {x: rx / Math.sqrt(2), y: ry / Math.sqrt(2)};
                        x = cx - A.x;
                        w = A.x*2;
                        h = A.y*2;
                        this.item.setAttribute('cx', cx);
                        this.item.setAttribute('rx', rx);
                        if(this.txtArea){
                            this.txtArea.parentElement.parentElement.setAttribute('x', x);
                            this.txtArea.parentElement.parentElement.setAttribute('width', w);
                        }
                        break;
                    case '1':
                    case '4':
                        cy = cy + +this.originPoint[`y${sos - this.dot}`];
                        cy = (cy < 0 ? (-cy) : cy);
                        ry = (ry < 0 ? (-ry) : ry);
                        A = {x: rx / Math.sqrt(2), y: ry / Math.sqrt(2)};
                        y = cy - A.y;
                        w = A.x*2;
                        h = A.y*2;
                        this.item.setAttribute('cy', (cy < 0 ? (-cy) : cy));
                        this.item.setAttribute('ry', (ry < 0 ? (-ry) : ry));
                        if(this.txtArea){
                            this.txtArea.parentElement.parentElement.setAttribute('y', y);
                            this.txtArea.parentElement.parentElement.setAttribute('height', +h);
                        }
                        break;
                }
                if(this.txtArea){
                    this.resizeTxtArea(w,h);
                }
                break;
        }
        
        this.initFKShape();

    }

    getDragXY(e) {
        let sx = 0,sy = 0;
        if (e.touches) {
            sx = e.touches[0].clientX;
            sy = e.touches[0].clientY;
        } else {
            sx = e.clientX;
            sy = e.clientY;
        }
        return this.getPostionTouch(sx,sy);
    }

    getPostionTouch(sx,sy) {
        var rect = this.svg.getBoundingClientRect();
        let degree = (+this.svg.parentElement.getAttribute('rotate')),
            cale = (+this.svg.parentElement.getAttribute('scale')),
            currentScale = 1 / cale,
            realX = (sx - rect.left) * currentScale,
            realY = (sy - rect.top) * currentScale,
            w = rect.width * currentScale - realX,
            h = rect.height * currentScale - realY,
            res = {};
        switch (degree) {
            case 0:
                res = {x: realX,y: realY,w,h};
                break;
            case 90:
                res = {x: realY,y: (rect.width * currentScale - realX),w,h};
                break;
            case 180:
                res = {x: (rect.width * currentScale - realX),y: (rect.height * currentScale - realY), w,h};
                break;
            case 270:
                res = {x: (rect.height * currentScale - realY),y: realX,w,h};
                break;
        }
        return res;
    };

    destroy(callBack = null) {
        this.svg.removeEventListener('touchstart', this.dragStart);
        this.svg.removeEventListener('mousedown', this.dragStart);
        this.svg.removeEventListener('mousemove', this.resizeMove);
        this.svg.removeEventListener('touchmove', this.resizeMove);
        this.svg.removeEventListener('mouseup', this.dragResizeEnd);
        this.svg.removeEventListener('touchend', this.dragResizeEnd);
        this.svg.removeEventListener('mousemove', this.dragMove);
        this.svg.removeEventListener('touchmove', this.dragMove);
        this.svg.removeEventListener('mouseup', this.dragEnd);
        this.svg.removeEventListener('touchend', this.dragEnd);
        $('.dotShape,.rectBorShape,.FKcontainer').remove();
        $('.colorCtn,.tranpCtn,.dashStyle,.thickness').removeClass('active');
        $('.FKShape').removeClass('selectShape');
        this.handle = null;
        this.item = null;
        this.itemDot = null;
        this.itemDotArr = null;
        this.dotEffect = null;
        this.idTarget = null;
        this.originPoint = null;
        this.svg = null;
        $('.FKtextArea').css('display','none');
        $('.FKtextAreaF').css('display','');
        if (callBack) {
            callBack();
        }
    }

    destroyRemove(callBack = null) {
        this.svg.removeEventListener('touchstart', this.dragStart, false);
        this.svg.removeEventListener('mousedown', this.dragStart, false);
        $('.dotShape,.rectBorShape,.FKcontainer').remove();
        $('.colorCtn,.tranpCtn,.dashStyle,.thickness').removeClass('active');
        $('.FKShape').removeClass('selectShape');
        this.txtArea = document.querySelector(`.FKtextArea[idta="${this.idTarget}"]`);
        let his = {
            type: 'shape',
            shapeAfter: this.item.cloneNode(true),
            shapeBefore: null,
            svg: this.svg,
            hasTxt : false,
            idShape : this.idTarget,
            idSvg : this.idSvg,
            function:'delete'
        }
        if(this.txtArea){
            this.txtArea.parentElement.parentElement.style.display = 'none'//.remove();
            his.hasTxt = true;
        }
        this.item.style.display = 'none'//.remove();
        his.shapeBefore = this.item.cloneNode(true);
        this.handle = null;
        this.item = null;
        this.itemDot = null;
        this.itemDotArr = null;
        this.dotEffect = null;
        this.idTarget = null;
        this.originPoint = null;
        this.svg = null;
        if (callBack) {
            callBack(his);
        }
    }

    initFKShape(id = null, move = false) {
        if (id) {
            this.item = document.querySelector(`#${id}`);
            if(this.item.hasAttribute('shadow')){
                this.item = document.querySelectorAll(`#${id}`)[1];
            }
            this.idTarget = id;
            $('.dotShape,.rectBorShape').remove();
        }
        let x1 = 0,
            rx = 0,
            ry = 0,
            y1 = 0,
            w = 0,
            h = 0,
            x2 = 0,y2 = 0;
        let dotItem = "";
        let idTar = this.item.getAttribute('id');
        let pos = {};
        let totalDot = 8;
        switch (this.item.nodeName) {
            case 'line':
                totalDot = 2;
                x1 = +this.item.getAttribute('x1');
                x2 = +this.item.getAttribute('x2');
                y1 = +this.item.getAttribute('y1');
                y2 = +this.item.getAttribute('y2');
                this.pos = pos = {x1,x2,y1, y2,x3: x2,y3: y1,x4: x1,y4: y2,xb: (x1 > x2 ? x2 : x1),yb: (y1 > y2 ? y2 : y1),wb: (x2-(+x1)),hb: (y2-(+y1))}
                break;
            case 'rect':
                w = (+this.item.getAttribute('width'));
                h = (+this.item.getAttribute('height'));
                x1 = +this.item.getAttribute('x'),
                    y1 = +this.item.getAttribute('y'),
                    this.pos = pos = {
                        w,h,x1,y1,x2: +x1 + +w,y2: y1,x3: x1,y3: +y1 + +h,x4: +x1 + +w,
                        y4: +y1 + +h,x5: +x1 + (+w / 2),y5: y1,
                        x6: +x1 + +w,y6: y1 + (+h) / 2,x7: x1,
                        y7: y1 + (+h) / 2,x8: +x1 + (+w / 2),y8: +y1 + +h
                    }

                break;
            case 'ellipse':
                x1 = +this.item.getAttribute('cx');
                y1 = +this.item.getAttribute('cy');
                rx = +this.item.getAttribute('rx');
                ry = +this.item.getAttribute('ry');
                this.pos = pos = {
                    cx: x1,cy: y1,rx,ry,x1,y1: +y1 - (+ry),
                    x2: +x1 + (+rx),y2: +y1, x3: +x1 - (+rx),
                    y3: +y1,x4: +x1,y4: +y1 + (+ry),x5: +x1 - (+rx),
                    y5: +y1 - (ry),x6: +x1 + (+rx),y6: +y1 - (+ry),x7: +x1 - (+rx),
                    y7: +y1 + (+ry),x8: +x1 + (+rx),y8: +y1 + (+ry)
                }

                break;
        }
        if (id) {
            for (let i = 1; i <= totalDot; i++) {
                dotItem += this.getElElls(`class="dotShape dot${i}" cx="${+pos[`x${i}`]}" cy="${+pos[`y${i}`]}" dot="${i}"`, idTar)
            }
            if (this.item.nodeName == "ellipse") {
                this.item.insertAdjacentHTML('beforebegin', `<rect class="rectBorShape" x="${pos.x5}" y="${pos.y5}" width="${rx*2}" height="${ry*2}"/>`);
            }
            if (this.item.nodeName == "line") {
                let wb = pos.wb < 0 ? -pos.wb : pos.wb;
                let hb = pos.hb < 0 ? -pos.hb : pos.hb;
                this.item.insertAdjacentHTML('beforebegin', `<rect class="rectBorShape" x="${pos.xb}" y="${pos.yb}" width="${wb}" height="${hb}"/>`);
            }
            this.svg.insertAdjacentHTML('beforeend', `${dotItem}`);
            $(`.${this.options.shapeClass}`).removeClass(this.options.shapeSlCls);
            this.item.classList.add(this.options.shapeSlCls);
            
        } else {
            if (this.itemDotArr) {
                this.itemDotArr.map((x, idx) => {
                    x.setAttribute('cx', +pos['x' + (idx + 1)]);
                    x.setAttribute('cy', +pos['y' + (idx + 1)]);
                });
            }
            if (this.item.nodeName == "ellipse") {
                $('.rectBorShape').attr('x', pos.x5).attr('y', pos.y5).attr('width', rx * 2).attr('height', ry * 2);
            }
            if (this.item.nodeName == "line") {
                let wb = pos.wb < 0 ? -pos.wb : pos.wb;
                let hb = pos.hb < 0 ? -pos.hb : pos.hb;
                $('.rectBorShape').css('opacity',1).attr('x', pos.xb).attr('y', pos.yb).attr('width', wb).attr('height', hb);
            }
        }
    }

    getElElls(include, id) {
        return `<ellipse ${include} rx="${this.options.dotWidth}" ry="${this.options.dotWidth}" idtarget="${id}" />`
    }


    scrollTouchEnd(e) {
        this.svg.removeEventListener('touchmove', this.scrollTouch, false);
        this.svg.removeEventListener('touchend', this.scrollTouchEnd, false);
    }

    scrollTouch(e) {
        let touchs = e.touchs;
        let touch1 = {
            x: touchs[0].clientX,
            y: touchs[0].clientY
        };
        let touch2 = {
            x: touchs[1].clientX,
            y: touchs[1].clientY
        };
        this.callBackDrag({
            touchs: [touch1, touch2],
            endTouch: false,
            type: 'scroll'
        });
    }

    FKtoolctn(pos) {
        let xt = 0,
            yt = 0;
        let scale = (+this.svg.parentElement.getAttribute('scale'));
        let rotate = (+this.svg.parentElement.getAttribute('rotate'));
        // let rotateI = (+this.item.getAttribute('rotate'));
        // let rotate = rotateC - rotateI;
        rotate = rotate < 0 ? -rotate : rotate;
        let right = true;
        let dotRot = this.getDotRot(+rotate);
        xt = (+pos[`x${dotRot}`]);
        yt = (+pos[`y${dotRot}`]);
        return `
            <foreignObject fksvg x="${+xt}" y="${+yt}" width="84" class="FKcontainer FKforeign" >
                <div class="fcontainer" style="transform:scale(${this.FKgetScaleStool(scale)}) rotate(-${rotate}deg)">
                        <div class="colorCtn" style="position:relative;width:100%;height:100%">
                            <div class="shapeColor" style="${right ? 'right: -195px;' : 'right: 74px;'}">
                                ${this.colorTool.map(x=>{return `<div class="iShapeColor" crls="${x}" style="background-color: #${x};"></div>`}).join("")}
                            </div>
                        </div>
                        <div class="tranpCtn" style="${right ? 'right: -90px;' : 'right: 74px;'}">
                            ${this.transparents.map(x=>{return `<div class="tranpI" opa="${x}">${x*100}%</div>`}).join("")}
                        </div>

                        <div class="thickness" >
                            ${this.thickness.map(x=>{return `<div class="thickI" thickness="${x}">${x}pt <span class="thickSp" style="height:${x*2}px"></span></div>`}).join("")}
                        </div>

                        <div class="dashStyle" >
                            ${this.dashStyles.map(x=>{return `
                            <div class="dashI" dash="${x.dash}" ${x.style ? `dashstyle="${x.style}"` : ''}>
                                <svg height="8" width="70">
                                    <line x1="5" x2="185" y1="4" y2="4" stroke="black" stroke-width="5" stroke-dasharray="${x.dash}" ${x.style ? `stroke-linecap="${x.style}"` : ''}></line>
                                </svg>
                            </div>`}).join("")}
                        </div>
                ${this.FKRenderTool()}
                </div>
            </foreignObject>
        `;
    }

    FKMapColor() {
        return this.colorTool.map(x => {
            color += `<div class="iShapeColor" crls="${x}" style="background-color: #${x};"></div>`
        });
    }

    FKRenderTool() {
        let tool = `
            <div class="FkTool" tool="stroke">
                <img src="../img/shape/stroke.png">
            </div>
            ${(this.item.nodeName) != "line" ? `
                <div class="FkTool" tool="fill">
                    <img src="../img/shape/paint.png">
                </div>
                <div class="FkTool" tool="transparent">
                    <img src="../img/shape/transparent.png">
                </div>
                ` : `
                    <div class="FkTool" tool="stroke-width">
                        <img src="../img/shape/thickness.png">
                    </div>
                    <div class="FkTool" tool="stroke-dasharray">
                        <img src="../img/shape/borderStyle.png">
                    </div>
                `}
           `;
        switch (this.item.nodeName) {
            case 'rect':
            case 'ellipse':
                let xt = document.querySelector(`textarea[idta="${this.idTarget}"]`) ;
                tool = `<div class="FkTool ${(xt) ? 'active' : ''}" tool="text">
                            <img src="../img/shape/text-option.png">
                        </div>
                        ${tool}`;
                break;
        }
        return tool;
    }


    FKgetScaleStool(scale) {
        switch (scale) {
            case 0.25:return 2;
            case 0.375:return 1.375;
            case 0.625:return 0.8;
            case 0.75:return 0.675;
            case 0.875:return 0.575;
            case 1:return 0.5;
            case 1.125:return 0.45;
            case 1.25:return 0.4;
            case 1.375:return 0.375;
            case 1.5:return 0.325;
            case 1.625:return 0.325;
            case 1.75:return 0.29;
            case 1.875:return 0.26;
            case 2:return 0.24;
            case 2.125:return 0.23;
            case 2.25:return 0.22;
            case 2.375:return 0.21;
            case 2.5:return 0.2;
            case 2.625:return 0.19;
            case 2.75:
            case 2.875:return 0.18;
            case 3:return 0.175;
        }
        return 1;
    }

    getDotRot(rotate){
        switch(this.item.nodeName){
            case 'line':
                switch(rotate){
                    case 90:
                        if(this.pos.x1 < this.pos.x2 && this.pos.y1 > this.pos.y2){
                            return 1;
                        }
                        if(this.pos.x1 > this.pos.x2 && this.pos.y1 < this.pos.y2){
                            return 2;
                        }
                        if(this.pos.x1 > this.pos.x2 && this.pos.y1 > this.pos.y2){
                            return 3;
                        }
                        return 4;
                    case 180:
                        if(this.pos.x1 > this.pos.x2 && this.pos.y1 > this.pos.y2){
                            return 1;
                        }
                        if(this.pos.x1 < this.pos.x2 && this.pos.y1 > this.pos.y2){
                            return 3;
                        }
                        if(this.pos.x1 > this.pos.x2 && this.pos.y1 < this.pos.y2){
                            return 4;
                        }
                        return 2;
                    case 270:
                        
                        if(this.pos.x1 > this.pos.x2 && this.pos.y1 < this.pos.y2){
                            return 1;
                        }
                        if(this.pos.x1 < this.pos.x2 && this.pos.y1 > this.pos.y2){
                            return 2;
                        }
                        if(this.pos.x1 > this.pos.x2 && this.pos.y1 > this.pos.y2){
                            return 4;
                        }
                        return 3;
                    default:
                        if(this.pos.x1 > this.pos.x2 && this.pos.y1 > this.pos.y2){
                            return 2;
                        }
                        if(this.pos.x1 > this.pos.x2 && this.pos.y1 < this.pos.y2){
                            return 3;
                        }
                        if(this.pos.x1 < this.pos.x2 && this.pos.y1 > this.pos.y2){
                            return 4;
                        }
                        return 1;
                }
            case 'rect':
                switch(rotate){
                    case 90:return 3;
                    case 180:return 4;
                    case 270:return 2;
                    default:return 1;
                }
            case 'ellipse':
                switch(rotate){
                    case 90:return 7;
                    case 180:return 8;
                    case 270:return 6;
                    default:return 5;
                }
        }
    }

    addText(){
        let rotate = (+this.svg.parentElement.getAttribute('rotate'));
        switch(this.item.nodeName){
            case 'rect':
                this.item.insertAdjacentHTML('afterend', `
                    <foreignObject class="FKforeign" idta="${this.idTarget}" fktext x="${+this.pos.x1}" y="${+this.pos.y1}" width="${this.pos.w}" height="${this.pos.h}" style="overflow:hidden;position:relative">
                        <div idta="${this.idTarget}" class="FKtextAreac" style="position:relative;width:100%;height:100%">
                            <div class="FKtextAreaF" 
                                style="
                                    font-size:${this.font.size * (this.options.modeShape == "main" ? 2 : 1)}px;
                                    color:${this.font.color};
                                    font-family :'${this.font.fontFamify}';
                                    text-align:left;
                                    ${this.getStyleFKAreaF()}
                                    ${this.getRotTransTextArea2(rotate,this.pos.w,this.pos.h)}"
                                    idsvg="${this.svgId}" idta="${this.idTarget}"
                                    ></div> 
                            <textarea 
                                class="FKtextArea" style="
                                font-size:${this.font.size * (this.options.modeShape == "main" ? 2 : 1)}px;
                                color:${this.font.color};
                                font-family :'${this.font.fontFamify}';
                                ${this.getRotTransTextArea(rotate,this.pos.w,this.pos.h)}" 
                                idta="${this.idTarget}" fktextarea ></textarea>
                        </div>
                    </foreignObject>
                `)
                setTimeout(_=>{
                    this.txtArea = document.querySelector(`textarea[idta="${this.idTarget}"]`);
                    if(this.txtArea){
                        this.txtArea.focus();
                    }
                },200)
                
                break;
            case 'ellipse':
                let A = {x: this.pos.rx / Math.sqrt(2), y: this.pos.ry / Math.sqrt(2)};
                let x1 = this.pos.cx - A.x,
                    y1 = this.pos.cy - A.y;
                this.item.insertAdjacentHTML('afterend', `
                    <foreignObject class="FKforeign" idta="${this.idTarget}" fktext x="${+x1}" y="${+y1}" width="${+A.x*2}" height="${+A.y*2}" style="overflow:hidden;position:relative">
                       <div idta="${this.idTarget}" class="FKtextAreac" style="position:relative;width:100%;height:100%" fktextareac>
                            <div class="FKtextAreaF" 
                                style="
                                    font-size:${this.font.size  * (this.options.modeShape == "main" ? 2 : 1)}px;
                                    color:${this.font.color};
                                    font-family :'${this.font.fontFamify}';
                                    text-align:left;
                                    ${this.getStyleFKAreaF()}
                                    ${this.getRotTransTextArea2(rotate,+A.x*2,+A.y*2)}" idsvg="${this.svgId}" idta="${this.idTarget}"></div> 
                            <textarea 
                                class="FKtextArea" 
                                rotate="${rotate || 0}"
                                style="
                                    font-size:${this.font.size  * (this.options.modeShape == "main" ? 2 : 1)}px;
                                    color:${this.font.color};
                                    font-family :'${this.font.fontFamify}';
                                    ${this.getRotTransTextArea(rotate,+A.x*2,+A.y*2)}" 
                                idta="${this.idTarget}" fktextarea ></textarea>
                       </div>
                    </foreignObject>
                `)
                setTimeout(_=>{
                    this.txtArea = document.querySelector(`textarea[idta="${this.idTarget}"]`);
                    if(this.txtArea){
                        this.txtArea.focus();
                    }
                },200)
                
                break;
        }
        $('.FKcontainer').remove();
    }

    resizeTxtArea(w,h){
        let rotate = +this.txtArea.getAttribute('rotate');
        switch(rotate){
            case 90: 
            case 270: 
                this.txtArea.style.width = `${h < 0 ? -h : h}px`;
                this.txtArea.style.height = `${w < 0 ? -w : w}px`;
                this.txtAreaF.style.width = `${h < 0 ? -h-20 : h-20}px`;
                this.txtAreaF.style.height = `${w < 0 ? -w-20 : w-20}px`;
                break;
        }
    }

    getRotTransTextArea(rotate=0,w,h){
        switch(rotate){
            case 90: return `transform: rotate(-${rotate}deg) translateX(-100%) ; width: ${h}px; height: ${w}px;`;
            case 180: return `transform: rotate(-${rotate}deg) translate(-100% , -100%);`;
            case 270: return `transform: rotate(-${rotate}deg) translateY(-100%) ; width: ${h}px; height: ${w}px;`;
            default: return ``;
        }
    }
    getRotTransTextArea2(rotate=0,w,h){
        switch(rotate){
            case 90: return `transform: rotate(-${rotate}deg) translateX(-100%) ; width: ${h-20}px; height: ${w-20}px;`;
            case 180: return `transform: rotate(-${rotate}deg) translate(-100% , -100%);`;
            case 270: return `transform: rotate(-${rotate}deg) translateY(-100%) ; width: ${h-20}px; height: ${w-20}px;`;
            default: return ``;
        }
    }

    setColor(colorSelected){
        this.font.color = colorSelected;
        this.txtArea = document.querySelector(`textarea[idta="${this.idTarget}"]`);
        if(this.txtArea){
            this.txtArea.style.color = colorSelected
            this.txtArea.parentElement.querySelector('.FKtextAreaF').style.color = colorSelected;
        }
    }

    setFontSize(fontSize){
        this.font.size = fontSize;
        this.txtArea = document.querySelector(`textarea[idta="${this.idTarget}"]`);
        if(this.txtArea){
            this.txtArea.style.fontSize = `${fontSize*2}px`;
            this.txtArea.parentElement.querySelector('.FKtextAreaF').style.fontSize = `${fontSize*2}px`;
        }
    }

   getStyleFKAreaF(){
        return `width: calc(100% - ${modeShape == 'main' ? '20px' : '10px'});
        height: calc(100% - ${modeShape == 'main' ? '20px' : '10px'});
        resize: none;
        background: transparent;
        outline: none;
        border: none;
        white-space: pre-line;
        overflow: hidden;
        padding: 0px;
        line-height: 1;
        transform-origin: 0 0;
        padding: 0px;
        position: absolute;
        top: ${modeShape == 'main' ? '10px' : '5px'};
        left: ${modeShape == 'main' ? '10px' : '5px'};
        word-wrap: break-word;
        display: none;`;
   } 

   getModelHistory(type){
    return {
        type,
        id : this.idTarget,
        svg : this.svg,
        hasTxt : this.txtArea != null,
        shapeAfter : this.itemClone,
        shapeBefore : this.item.cloneNode(true),
        txtAfter : this.txtAreaClone || null,
        txtBefore : this.txtArea == null ? null : this.txtArea.parentElement.parentElement.cloneNode(true)
    }
   }

   onContextMenu(e){
        $('.FKcontainer').remove();
        let el = e.target;
        while (el) {
            if (el.hasAttribute('FKSVG') || el.hasAttribute('fksvg')) break;
            if (el.classList.value.indexOf(this.options.shapeSlCls) > -1 
            || el.classList.value.indexOf('rectBorShape') > -1
            || el.hasAttribute('fktextarea')
            || el.hasAttribute('fktextareac')
            || el.classList.value.indexOf('FKtextAreaF') > -1
            ) {
                this.handleRight = 'okela';
            } 
            el = el.parentElement;
        }
        if(this.handleRight == 'okela' && $('.dotShape') && ('.dotShape').length > 0){
            if(this.svg) this.svg.insertAdjacentHTML('beforeend', this.FKtoolctn(this.pos));
            
        }
        return;
   }

   blurText(){
        $('.FKtextArea').css('display','none');
        $('.FKtextAreaF').css('display','');
   }

   focusText(){
    this.txtArea.removeAttribute('disabled');
    this.txtArea.style.display = '';
    this.txtAreaF.style.display = 'none';
    this.txtArea.focus();
   }

   copyShape(callback){
    callback(this.item.cloneNode(true));
   }
}
