
let fileDragDrop = [];
let mergeContainer = [];
let sortList;
let tabChose = null;
let dropElement = null;
let extractOpen = false;
let callBackFunction = null;

function closeCombine() {
    isMiniMapOpen = false;
    [].forEach.call(document.querySelectorAll('.columnMerge'), removeDropHandle);
    $('#mergePDFcontainer').removeClass('active');
    $('.miniMapContainer').removeClass('heightSmall').addClass('heightSmall');
    $('.mapPdf1,.mapPdf2').html('');
    cancelExtractPDF();
    $('#overlayHidenMain').css('display', 'none');
    if (isJoin) { closeFKJoinFile() }
    if (isRotate) { openFKRotateMerge() }
};



function reRenderMap() {
    let data = fs.readFileSync(pathSave).toString('base64');
    let idtab = itemLoadPdf.idtab;
    common.deleteFolderRecursive(path.join(pathMerge, idtab));
    data = "data:application/pdf;base64," + data;
    let nameFile = pathSave.split("\\");
    itemLoadPdf.detailMerge.image = []
    pdfjs.getDocument(data).then((pdf_doc) => {
        let sizePage = pdf_doc.numPages;
        for (let i = 1; i <= sizePage; i++) {
            pdf_doc.getPage(i).then((page) => {
                let scale = getScale(page.getViewport(1));
                let viewport = page.getViewport(scale);
                var canvas = document.createElement("canvas");
                var context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;
                var renderContext = { canvasContext: context, viewport: viewport };
                let idImg = common.UUID();
                let nameImg = idImg + '.png';
                let pathImg = path.join(pathMerge, idtab, nameImg);
                let height = viewport.height > viewport.width ? 260 : 184;
                let width = viewport.height > viewport.width ? 184 : 260;
                itemLoadPdf.detailMerge.image.push(
                    {
                        idImg,
                        nameImg,
                        index : i-1,
                        pathImg,
                        width,
                        height,
                        pageNumber : i-1,
                        pathFile : pathSave,
                        fileName : nameFile[nameFile.length-1],
                        rotate:0
                    }
                )
                var renderTask = page.render(renderContext);
                renderTask.promise.then(() => {
                    fs.writeFileSync(pathImg, canvas.toDataURL("image/png").replace(/^data:image\/png;base64,/, ""), 'base64');
                });
            });

        }
    }).catch((error) => { });

}

function renderImg(currentMerge, html = null) {
    setTimeout(_ => {
        if (html == null) {
            let htmlCreate = "";
            for (let i = 0; i < currentMerge.detailMerge.image.length; i++) {
                let x = currentMerge.detailMerge.image[i];
                htmlCreate +=
                    `<div class="pageMap columnMerge" 
                        sortable-item="sortable-item" 
                        sortable-handle="sortable-handle" 
                        shadow-child-width="${x.width}"
                        shadow-child-height="${x.height}"
                        imgId="${x.idImg}" index="${x.index}" 
                        style="${getWidthRotate(x, x.rotate)}"
                        rotate="${x.rotate || 0}"
                    >
                        <div class="lineFocus"></div>
                        <img class="imagePage1 rotateV ${getClassRotate(x.rotate)}" src="${x.pathImg}" style="width : ${x.width}px; height : ${x.height}px; margin: 0 auto;">
                    </div>`

            }
            htmlCreate += `<div class="pageMap columnMerge" style="
                                height: 20px;"
                                last="true"
                                index="${currentMerge.detailMerge.image.length - 1}" 
                            "><div class="lineFocus"></div></div>`
            renderImg(currentMerge, htmlCreate);
        } else {
            let count = 0;
            for (let i = 0; i < currentMerge.detailMerge.image.length; i++) {
                let x = currentMerge.detailMerge.image[i];
                let ex = fs.existsSync(x.pathImg);
                if (ex) {
                    count += 1;
                }
            }
            if (count == currentMerge.detailMerge.image.length) {
                $('.mapPdf1').html(html);
                $('.miniMapTab #loaderMerge').css('display', 'none');
                openFKJoinFile();
                openFKRotateMerge();
                mergeContainer.push(currentMerge);
            } else {
                setTimeout(_ => { renderImg(currentMerge, html); }, 100);
            }
        }

    })
};

function renderDropPdfMap(dataImage, $this, html = null) {
    [].forEach.call(document.querySelectorAll('.columnMerge'), removeDropHandle);
    setTimeout(_ => {
        if (html == null) {
            let htmlCreate = "";
            for (let i = 0; i < dataImage.length; i++) {
                let x = { ...dataImage[i] };
                htmlCreate += `
                    <div class="pageMap columnMerge" 
                        sortable-item="sortable-item" 
                        sortable-handle="sortable-handle" 
                        shadow-child-width="${x.width}"
                        shadow-child-height="${x.height}"
                        imgId="${x.idImg}" index="${x.index}"
                        style="width : ${x.width}px; height : ${x.height}px;"
                    >
                        <div class="lineFocus"></div>
                        <img class="imagePage1 rotateV" src = "${x.pathImg}" style="width : ${x.width}px; height : ${x.height}px; margin: 0 auto;">
                    </div>`
            }
            renderDropPdfMap(dataImage, $this, htmlCreate)
        } else {
            let count = 0;
            for (let i = 0; i < dataImage.length; i++) {
                let x = { ...dataImage[i] };
                if (fs.existsSync(x.pathImg)) {
                    count += 1;
                }
            }
            if (count == dataImage.length) {
                let last = $this.getAttribute('last');
                $this.insertAdjacentHTML('beforebegin', html);
                $('.miniMapTab #loader').css('display', 'none');
                dropElement = null;
                // if ($('.joinFile').hasClass('join')) {
                [].forEach.call(document.querySelectorAll('.columnMerge'), removeDropHandle);
                [].forEach.call(document.querySelectorAll('.columnMerge'), addDnDHandlers);
                $('.mapPdf1 .columnMerge[last="true"]').removeClass('blankPage')
                if ($('.mapPdf1 .columnMerge').length == 1) {
                    $('.mapPdf1 .columnMerge[last="true"]').addClass('blankPage')
                }
                setTimeout(_ => {
                    $('.mapPdf1 .columnMerge').map((index, x) => {
                        if (x.getAttribute('last') != null) {
                            x.setAttribute('index', index - 1)
                        } else {
                            x.setAttribute('index', index)
                        }
                    });
                }, 500)

                // }
            } else {
                setTimeout(_ => { renderDropPdfMap(dataImage, $this, html); }, 100);
            }
        }
    });
}


function handeFileMergeDrag(fileInfo, $this) {
    if (fileInfo.type.indexOf('pdf') == -1) {
        return;
    }

    let originName = fileInfo.name;
    let folderFileMerge = path.join(pathMerge, 'fileDrop');
    common.mkDirByPathSync(folderFileMerge);
    fs.copyFileSync(fileInfo.path, path.join(folderFileMerge, originName));
    $('.miniMapTab #loader').css('display', 'block');
    dropElement = $this;
    let index = $this.getAttribute("index");
    let last = $this.getAttribute("last");
    loadFileAppend(
        {
            path: path.join(folderFileMerge, originName),
            name: originName,
            indexAppend: $this.getAttribute("index"),
            methodAppend: last == null ? 'beforebegin' : 'afterend'
            // tab :
        }
    );
}

async function onSavePdfPage() {
    let extractMap = document.querySelector('.mapPdf2');
    let pages = Array.from(extractMap.children);
    if (pages.length == 0) {
        openErrorMessage(common.getMessageWithErrorCode("LPWI0009", message));
        return;
    }
    imgSelect = [];
    let files = [];
    let nameFile = [];

    for (let i = 0; i < pages.length; i++) {
        let id = pages[i].getAttribute('imgid');
        let page = itemLoadPdf.detailMerge.image.find(x => x.idImg == id);
        let rotate = pages[i].getAttribute('rotate');
        if (page) {
            imgSelect.push({
                indexSave: i,
                fileName: page.fileName,
                pageNumber: page.pageNumber,
                index: page.index,
                rotate
            });
            if (nameFile.indexOf(page.fileName) == -1) {
                nameFile.push(page.fileName);
                files.push({
                    pathFile: page.pathFile,
                    fileName: page.fileName
                });
            }
        }
    }
    let request2 = {
        files2: [],
        infoMerge: imgSelect
    };
    for (let i = 0; i < files.length; i++) {
        request2.files2.push(
            {
                fileBase64: fs.readFileSync(files[i].pathFile).toString('base64'),
                fileName: files[i].fileName
            }
        )
    }

    try {
        $('.miniMapTab #loaderMerge').css('display', 'block');
        countSaveExtract += 1;
        request2.countPage = countSaveExtract;
        service.extractPdf(request2).subscribe(x => {
            $('.miniMapTab #loaderMerge').css('display', 'none');
            if (x && x.data) {
                // ipcRenderer.send('mergePageSuccess', x.data);
                // loadFileAppend(x.data)
                $('#downloadModal').removeClass('closeModal');
                $('#download-percent').css("width", "1%");
                $('#percentDownload').text("1%");
                let key = x.data.split(";");
                let pathSave = path.join(pathMerge, key[1]);
                closeCombine();
                downloadPdfAfterUpload(datalogin.url + "/v1/api/download-pdf?downloadToken=" + key[0], pathSave);
            }
        }, err => {
            $('.miniMapTab #loaderMerge').css('display', 'none');
            throw err
        });
    } catch (error) {

    } finally {

    }


}

function closeMessageMerge(callCallback = false) {
    if (callCallback && callBackFunction) {
        callBackFunction();
    }
    $('#body-infoMerge').css('display', 'none');
    $('#body-errorMerge').css('display', 'none');
    $('#modal-messageMerge').text('');
    $('#errorContainerMerge').removeClass('active');
}


function openErrorMessage(mesage) {
    $('#body-infoMerge,#onCancel').css('display', 'none');
    $('#body-errorMerge').css('display', 'block');
    $('#modal-messageMerge').text(mesage);
    $('#errorContainerMerge').addClass('active');
}

function openInfoMessage(mesage) {
    $('#body-infoMerge,#onCancel').css('display', 'block');
    $('#body-errorMerge').css('display', 'none');
    $('#modal-messageMerge').text(mesage);
    $('#errorContainerMerge').addClass('active');
}


function getClassRotate(rotate) {
    switch (rotate) {
        case 90:
            return "r90deg";
        case 180:
            return "r180deg";
        case 270:
            return "r270deg";
        default:
            return "";
    }
}

function getWidthRotate(data, rotate) {
    switch (rotate) {
        case 90:
        case 270:
            return `width : ${data.height}px; height : ${data.width}px;`;
        default:
            return `width : ${data.width}px; height : ${data.height}px;`;
    }

}

let isJoin = false;

function showMiniMap(mode = false) {
    $('.registMaskOverlay,.miniMapTab').removeClass('closePopup');
    if (mode) {
        $('.registMaskOverlay,.miniMapTab').addClass('closePopup');
    }
}

function onCancelTXMapp() {
    $('.actMap,.saveMap,.miniMapTab,.mapPdf2,.clearAllMap,.selectAllMap,.rotateMap,.actBtnGround,.miniMapContainer,.pdfMergeMap').removeClass('active');
}

function selectAllMapp(map) {
    $(`.${map} .imagePage1`).removeClass('active').addClass('active');
}

function clearAllMapp(map) {
    $(`.${map} .imagePage1`).removeClass('active');
    if (map == 'mapPdf1') {
        document.getElementById(`${itemLoadPdf.idtab}-file-${itemLoadPdf.seqNo}-page-0`).scrollIntoView({ behavior: 'auto', block: "start" });
    }
}

function toggleSelectAll(map) {
    if ($(`.${map} .imagePage1`).length > 0 && ($(`.${map} .imagePage1.active`).length == $(`.${map} .imagePage1`).length)) {
        $(`.deselect${map}`).css('display', 'block');
        $(`.select${map}`).css('display', 'none');
    } else {
        $(`.deselect${map}`).css('display', 'none');
        $(`.select${map}`).css('display', 'block');
    }
}
var dragSrcEl = null;

function handleDragStart(e) {
    dragSrcEl = this;
    if (e.dataTransfer.types[0] == 'Files') {
        e.dataTransfer.effectAllowed = 'move';
        this.classList.add('dragEleme');
    }
}

function handleDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault();
    }
    if (e.dataTransfer.types[0] == 'Files') {
        this.classList.add('over');

        e.dataTransfer.dropEffect = 'move';
    }
    return false;
}

function handleDragLeave(e) {
    this.classList.remove('over');
}

function handleDrop(e) {
    if (e.dataTransfer.types[0] == 'Files') {
        let file = e.dataTransfer.files;
        if (file != null && file.length > 0) {
            handeFileMergeDrag(file[0], this);
        }
    }
    this.classList.remove('over');
    return false;
}

function handleDragEnd(e) {
    this.classList.remove('over');
    this.classList.remove('dragEleme');
}

function addDnDHandlers(elem) {
    elem.addEventListener('dragstart', handleDragStart, false);
    elem.addEventListener('dragover', handleDragOver, false);
    elem.addEventListener('dragleave', handleDragLeave, false);
    elem.addEventListener('drop', handleDrop, false);
    elem.addEventListener('dragend', handleDragEnd, false);
}

function removeDropHandle(elem) {
    elem.removeEventListener('dragstart', handleDragStart, false);
    elem.removeEventListener('dragover', handleDragOver, false);
    elem.removeEventListener('dragleave', handleDragLeave, false);
    elem.removeEventListener('drop', handleDrop, false);
    elem.removeEventListener('dragend', handleDragEnd, false);
}

function extractPdfOpen() {
    extractOpen = true;
    if (isJoin) { closeFKJoinFile() }
    if (isRotate) { openFKRotateMerge() }
    $('#mergePDFcontainer').css('width', '610px')
    $('.mapPdf2').css('display', 'block');
    $('.mapPdf1 .imagePage1').removeClass('active');
    $('.actMap,.saveMap').addClass('active');
    $('.miniMapContainer').removeClass('heightSmall');
    $('.errorContainer').addClass('heightSmall');
    if (extractDrag) {
        extractDrag.destroy(() => {
            extractDrag = null;
        });
    }
    extractDrag = new FKDragDropMBVL('.mapPdf1', '.mapPdf2', null);
}

function cancelExtractPDF() {
    extractOpen = false;
    // ipcRenderer.send('cancelExtractPDF', 310); 
    $('#mergePDFcontainer').css('width', '310px');
    $('.actMap,.saveMap').removeClass('active');
    $('.mapPdf2').css('display', 'none').html('');
    $(`.deselectmapPdf2,.selectmapPdf2`).css('display', 'none');
    $('.miniMapContainer').addClass('heightSmall');
    $('.errorContainer').removeClass('heightSmall');
    openFKRotateMerge();
    openFKJoinFile();
    if (extractDrag) {
        extractDrag.destroy(() => {
            extractDrag = null;
        });
    }
}

$('body').on('click', '.mapPdf2 .imagePage1', function ($event, item = itemLoadPdf) {
    if (extractOpen == true) {
        if ($event.ctrlKey || $event.shiftKey) {
            item.ctrMap2 = true;
            $(this).toggleClass('active')
        } else {
            let has = $(this).hasClass('active');
            $('.mapPdf2 .imagePage1').removeClass('active');
            if (!has || item.ctrMap2) {
                item.ctrMap2 = false;
                $(this).addClass('active')
            }
        }
    }
});

$('body').on('click', '.mapPdf1 .imagePage1', function ($event, item = itemLoadPdf) {
    if (extractOpen == false) {
        let has = $(this).hasClass('active');
        if ($event.ctrlKey|| $event.shiftKey) {
            item.ctrMap = true;
            $(this).toggleClass('active')
        } else {
            $('.mapPdf1 .imagePage1').removeClass('active');
            if (!has || item.ctrMap) {
                item.ctrMap = false;
                $(this).addClass('active');
            }
        }
        let view = null;
        if (!has) {
            view = document.getElementById(`${item.idtab}-file-${itemLoadPdf.seqNo}-page-${$(this).parent().attr('index')}`)
        } else {
            let all = $('.mapPdf1 .imagePage1.active');
            if (all.length == 0) {
                view = document.getElementById(`${item.idtab}-file-${itemLoadPdf.seqNo}-page-0`)
            } else {
                let index = all[all.length - 1].parentElement.getAttribute('index');
                view = document.getElementById(`${item.idtab}-file-${itemLoadPdf.seqNo}-page-${index}`)
            }
        }
        if (view) {
            view.scrollIntoView({ behavior: 'auto', block: "start" });
        }
    }

});

function deletePage() {
    $('.mapPdf2 .columnMerge .imagePage1.active').parent().remove();

}

function openFKJoinFile() {
    $('.joinFile').toggleClass('join');
    isJoin = true;
    setTimeout(_ => {
        [].forEach.call(document.querySelectorAll('.columnMerge'), addDnDHandlers);
    }, 200)
}

function closeFKJoinFile() {
    $('.joinFile').toggleClass('join');
    isJoin = false;
    setTimeout(_ => {
        [].forEach.call(document.querySelectorAll('.columnMerge'), removeDropHandle);
    }, 200)
}


function openFKRotateMerge() {
    if (isJoin) { openFKJoinFile() }
    $('.rotateImage').toggleClass('rot');
    $('#hiddenScroll,.overlayHidenMain,#scrollLeftFK,#scrollRightFK').toggleClass('active');
    $('.mapPdf1 .imagePage1').removeClass('active');
    isRotate = !isRotate

}

function rotateFKBehind(left) {
    if (left) rotateLeft();
    if (!left) rotateRight();
}

function rotateFKMapPage(page, rotLeft) {
    let parent = page.parentElement;
    let width = parent.getAttribute('shadow-child-width');;
    let height = parent.getAttribute('shadow-child-height');;
    let rotate = +parent.getAttribute('rotate');
    if (rotLeft) {
        rotate -= 90;
    } else {
        rotate += 90;
    }
    if (rotate < 0) rotate = 270;
    if (rotate > 270) rotate = 0;
    parent.setAttribute('rotate', rotate);
    parent.style.width = `${(rotate == 90 || rotate == 270) ? height : width}px`;
    parent.style.height = `${(rotate == 90 || rotate == 270) ? width : height}px`;
    ['r90deg', 'r180deg', 'r270deg'].forEach(item => page.classList.remove(item));
    page.classList.add(`r${rotate}deg`);
}

function deletePage1() {
    if ($('.mapPdf1 .columnMerge .imagePage1.active').length == 0) {
        openErrorMessage(common.getMessageWithErrorCode('LPWI0010', message));
        return;
    } else {
        callBackFunction = null;
        openInfoMessage(common.getMessageWithErrorCode('LPWI0011', message));
        callBackFunction = () => {
            let containers = $('.mapPdf1 .columnMerge .imagePage1.active').parent();
            let indexs = [];
            if (containers) {
                for (let i = 0; i < containers.length; i++) {
                    indexs.push(containers[i].getAttribute('index'))
                }
                FKPrepareRemovePage(indexs);

            }
        }
    }
}
