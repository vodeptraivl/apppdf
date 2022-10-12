const fs = require('fs');
const path = require('path');
const axios = require('axios');
const Observable = require('rxjs').Observable;
const fse = require('fs-extra')
const archiver = require('archiver');
var domtoimage = require('dom-to-image');

var DecompressZip = require('decompress-zip');
exports.okFnCallBack, exports.cancelFnCallBack;
exports.mkDirByPathSync = function mkDirByPathSync(targetDir) {
  const sep = path.sep;
  const initDir = path.isAbsolute(targetDir) ? sep : '';

  targetDir = targetDir.replace("\\\\", "//");
  targetDir = targetDir.replace(":\\", "://");

  var fullPath = "";
  var arrayPath = targetDir.split(sep);
  for(var i =0; i< arrayPath.length; i++){
    var childDir= arrayPath[i].replace("//", "\\\\").replace("://", ":\\");
    childDir += initDir;

    if(fullPath == ""){
      fullPath = childDir;
    }
    else{
      fullPath = path.join(fullPath, childDir);;
    }
    
    try {
      if(fs.existsSync(fullPath)){
        continue;
      }

      fs.mkdirSync(fullPath);
    } catch (err) {
      if (err.code === 'EEXIST') { // curDir already exists!
        continue;
      }

      // To avoid `EISDIR` error on Mac and `EACCES`-->`ENOENT` and `EPERM` on Windows
      if (err.code === 'ENOENT') { // Throw the original parentDir error on curDir `ENOENT` failure.
        throw err;
      }

      const caughtErr = ['EACCES', 'EPERM', 'EISDIR'].indexOf(err.code) > -1;
      if (!caughtErr || caughtErr && fullPath === path.resolve(fullPath)) {
        throw err;
      }
    }
  }

  return true;
}

exports.showHideLoader = function showHideLoader(value){
  $('#loader').css("display", value == true ? "" : "none");
}

// modal
exports.showMessage = function showMessage(errorCode){
  var message = "";
  switch(errorCode) {
    case "E98":
      message = "DBサーバに接続できません。";
      this.showErrMessage(message, null);

      break;
    case"E99":
      message = "例外エラーが発生しました。<br>管理者に連絡してください。";
      this.showErrMessage(message, null);

      break;
  }

  this.showHideLoader(false);
}

exports.showErrMessage = function showErrMessage(message, cancelCallBack){
  $('#body-error').css('display', '');
  $('#body-info').css('display', 'none');
  $('#modal-message').html(message);
  $('#messageModal').modal('show');
  this.cancelFnCallBack = cancelCallBack;
}

exports.showInfoMessage = function showInfoMessage(message){
  $('#body-error').css('display', 'none');
  $('#body-info').css('display', '');
  $('#modal-message').html(message);
  $('#messageModal').modal('show'); 
  this.showHideLoader(false);
  this.cancelFnCallBack = null;
}

exports.showConfirmMessage = function showConfirmMessage(message, okCallBack, cancelCallBack){
  $('#messageModal').modal('hide');
  $('#modal-confirm-message').html(message);
  $('#confirmModal').modal('show'); 
  this.okFnCallBack = okCallBack;
  this.cancelFnCallBack = cancelCallBack;
  this.showHideLoader(false);
}

exports.uncompressZip = function uncompressZip(ZIP_FILE_PATH, DESTINATION_PATH){
  return new Observable(observer => {
    var unzipper = new DecompressZip(ZIP_FILE_PATH);

    // Add the error event listener
    unzipper.on('error', function (err) {
      observer.next();
      observer.complete();
    });
    
    // Notify when everything is extracted
    unzipper.on('extract', function (log) {
      observer.next();
      observer.complete();
    });
       
    // Unzip !
    unzipper.extract({
        path: DESTINATION_PATH
    });
  });
}

exports.deleteFolderRecursive = function(folderPath) {
  // fse.removeSync(folderPath+"/**");
  try{
    if (fs.existsSync(folderPath)) {
      fs.readdirSync(folderPath).forEach((file, index) => {
        const curPath = path.join(folderPath, file);
        if (fs.lstatSync(curPath).isDirectory()) {
          fse.remove(curPath).then(() => {}).catch(err => {throw err});
        } else { // delete file
          fs.unlinkSync(curPath);
        }
      });
      this.mkDirByPathSync(folderPath);
    }
  }catch(ex){
  }  
};


exports.elementToPngDataUrl = function elementToPngDataUrl(element){
  return new Observable(observer => 
    {
      domtoimage.toPng(element)
        .then(function (dataUrl) {
          observer.next(dataUrl);
          observer.complete();
        })
        .catch(function (error) {
          observer.next(null);
          observer.complete();
        });
    }
  );
}

// Get distance between two points in canvas

exports.diff =  function diff (num1, num2) {
  if (num1 > num2) {
    return (num1 - num2);
  } else {
    return (num2 - num1);
  }
}

exports.distancePointToPoint = function distancePointToPoint(x1, y1, x2, y2) {
  var deltaX = this.diff(x1, x2);
  var deltaY = this.diff(y1, y2);
  var dist = Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2));

  return (dist);
}

exports.diffAverage =  function diffAverage (num1, num2) {
  if (num1 > num2) {
    return ((num1 - num2) / 2) + num2;
  } else {
    return ((num2 - num1)/ 2) + num1;
  }
}

exports.getAveragePoint  = function getAveragePoint(x1, y1, x2, y2){
  var deltaX = this.diffAverage(x1, x2);
  var deltaY = this.diffAverage(y1, y2);
  var average = {x: deltaX, y: deltaY};

  return (average);
}

exports.getMessageWithErrorCode = function getMessageWithErrorCode(a,list = null){
  let mess = "例外エラーが発生しました。</br>管理者に連絡してください。";
  if(list){
    let code = "LPWE0001";
    switch(a){
      case "E98":
        code = "LPWE0002";
        break;
      case "E97":
        code = "LPWI0005";
        break;
      case "E02":
        code = "LPWE0004";
        break;
      case "E99":
        code = "LPWE0001";
        break;
      default:
        code = a;
        break;

    }
    let m = list.find(x=>x.code == code);
    if(m) mess = m.contents;
  } else {
    if(a == "E98") mess = " DBサーバに接続できません。";
  }
  
  return mess;
}

exports.dateFormatToString = function dateFormatToString(d){
	let fm = "";
	if(d != null){
		let date = new Date(d);
		fm = date.getFullYear()+"/"+((date.getMonth()+1).toString().length == 1 ? ("0"+(date.getMonth()+1)) : (date.getMonth()+1)) +"/"+(date.getDate().toString().length == 1 ? ("0"+date.getDate()) : date.getDate()); 
	}
	return fm;
}

exports.dateFormat = function dateFormat(d){
	return (d && d.length>=8) ? d.substring(0,4)+"/"+d.substring(4,6)+"/"+d.substring(6,8) : "";
}

exports.toStringIfnull = function toStringIfnull(d){
	return d == null ? "" : d;
}

exports.UUID = function UUID(){
  var dt = new Date().getTime();
  var uuid = 'xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = (dt + Math.random()*16)%16 | 0;
      dt = Math.floor(dt/16);
      return (c=='x' ? r :(r&0x3|0x8)).toString(16);
  });
  return uuid;
}

exports.logOutOrDenied = function (){
  ipcRenderer.send('saveDataLogin', {"userid":"","uh2":""}); 
  ipcRenderer.send('logout', "logout"); 
  showErrMessage('セッションの有効期限が切れました。</br>再ログインしてください。');
}

 exports.zipFile = function (pathSave,pathZip,fileMain){
  return new Observable(observer => {
    let nm = this.UUID()+'.zip';
    try {
     var output = fs.createWriteStream(pathSave + '\\'+nm);
     var archive = archiver('zip', {
       zlib: { level: 9 }
     });
     output.on('close', function() {
       fse.remove(pathZip).then(() => {}).catch(err => {throw err});
       observer.next(nm);
       observer.complete();
     });
     archive.pipe(output);
     archive.append(fs.createReadStream(path.join(fileMain.path,fileMain.name)), { name: fileMain.name });
     fs.readdirSync(pathZip).forEach((file, index) => {
       let paths = path.join(pathZip, file);
       if (!fs.lstatSync(paths).isDirectory()) {
         archive.append(fs.createReadStream(paths), { name: file });
       } 
     });
     archive.finalize();
    } catch (error) {
      observer.error(error)
      observer.complete();
      fse.remove(pathZip).then(() => {}).catch(err => {throw err});
      throw error;
    } 
  });
}


exports.zipFile2 = function (pathSave,pathZip,mainName){
  return new Observable(observer => {
    let nm = this.UUID()+'.zip';
    try {
     var output = fs.createWriteStream(pathSave + '\\'+nm);
     var archive = archiver('zip', {
       zlib: { level: 9 }
     });
     output.on('close', function() {
       fse.remove(pathZip).then(() => {}).catch(err => {throw err});
       observer.next(nm);
       observer.complete();
     });
     archive.pipe(output);
     archive.append(fs.createReadStream(path.join(pathZip,'latest.yml')), { name: 'latest.yml'});
     archive.append(fs.createReadStream(path.join(pathZip,mainName)), { name: mainName});
     archive.finalize();
    } catch (error) {
      observer.error(error)
      observer.complete();
      fse.remove(pathZip).then(() => {}).catch(err => {throw err});
      throw error;
    } 
  });
}

exports.asyncPdfToImg = function (pdfPath,savePath){
    let data = fs.readFileSync(pdfPath).toString('base64');
    data = "data:application/pdf;base64," + data;
    common.mkDirByPathSync(savePath);
    let imgSave = [];
    pdfjs.getDocument(data).then(function (pdf_doc) {
        for(let i = 0; i < pdf_doc.numPages; i++){
            pdf_doc.getPage(i+1).then(function (page) {
				let scale = getScale(page.getViewport(1));
				let viewport = page.getViewport(scale);
                var canvas = document.createElement("canvas");
                var context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;
                var renderContext = { canvasContext: context, viewport: viewport };
                var renderTask = page.render(renderContext);
                renderTask.promise.then(function() {
                    var canvasdata = canvas.toDataURL("image/png");
                    let idImg = common.UUID();
                    let nameImg = idImg+'.png';
                    let pathImg = path.join(savePath,nameImg);
                    imgSave.push(
                        {
                            idImg,
                            nameImg,
                            index : i+1,
                            pathImg
                        }
                    )
                    fs.writeFileSync(pathImg, canvasdata.replace(/^data:image\/png;base64,/, ""), 'base64');
                });
            })
        }
        return imgSave;
    }).catch( (error) =>{
        common.showHideLoader(false);
        common.showErrMessage(common.getMessageWithErrorCode("E99",message),null);
        observer.complete();
    });
    return imgSave
}

exports.toBlob = function(base64,mime = "application/pdf"){
	var bin = atob(base64.replace(/^.*,/, ''));
	var buffer = new Uint8Array(bin.length);
	for (var i = 0; i < bin.length; i++) {
		buffer[i] = bin.charCodeAt(i);
	}
	try {
		var blob = new Blob([buffer.buffer], {
			type: mime
		});
	} catch (e) {
		return false;
	}
	return blob;

}

exports.decode = function (encoded) {
  if (encoded.length % 4 != 0) {
    throw "encoded.length must be a multiple of 4.";
  }
  var decoded = [];
  var map = this.decodeMap;
  for (var i = 0, len = encoded.length; i < len; i += 4) {
    var b0 = map[encoded[i]];
    var b1 = map[encoded[i + 1]];
    var b2 = map[encoded[i + 2]];
    var b3 = map[encoded[i + 3]];
    var d0 = ((b0 << 2) + (b1 >> 4)) & 0xff;
    decoded.push(d0);
    if (b2 == null) break; // encoded[i + 1] == "="
    var d1 = ((b1 << 4) + (b2 >> 2)) & 0xff;
    decoded.push(d1);
    if (b3 == null) break; // encoded[i + 2] == "="
    var d2 = ((b2 << 6) + b3) & 0xff;
    decoded.push(d2);
  }
  //return decoded;

  let uint = new Uint8Array(decoded.length);
  for (let idx = 0; idx < decoded.length; idx++) {
    uint[idx] = decoded[idx];
  }
  return uint;
}