const Observable = require('rxjs').Observable;
const common = require("./common");
const axios = require('axios');

const api = axios.create({
  withCredentials: true,
});

axios.defaults.withCredentials = true;

// ****************************************************************************************************************************************************************
// 品番情報一覧の取得
exports.getproducts = function getproducts(datalogin,productCode){
  return new Observable(observer => {
    api.get(datalogin.url+'/v1/api/products'+(productCode != null ? ('?productCode='+ encodeURI(productCode)) :''),
    {
      headers: {
        userid: datalogin.userid,
        uh2:datalogin.uh2,
        
      }
    }).then(x=>{
      if(x.status == 200){
        observer.next({error:false,data:x.data.data.searchInfo,count:x.data.data.count});
        observer.complete();
      }
    }).catch((error) => {
        // Error 😨
        if (error.response) {
          if(error.response.status == 403){
            common.logOutOrDenied();
          }else{
            observer.next({error:true,errorCode: error.response.data.errorCode});
            observer.complete();
          }
        }else{
          observer.next({error:true,errorCode: "E99"});
          observer.complete();
        }
    });
  });
}
// END 品番情報一覧の取得
// ****************************************************************************************************************************************************************

// ****************************************************************************************************************************************************************
// メッセージ一覧の取得
exports.getMessages = function getMessages(datalogin){
  return new Observable(observer => {
    api.get(datalogin.url+'/v1/api/messages').then(x=>{
      if(x.status == 200){
        observer.next({error:false,data:x.data.dataList});
        observer.complete();
      }
    }).catch((error) => {
        // Error 😨
        if (error.response) {
          if(error.response.status == 403){
            common.logOutOrDenied();
          }else{
            observer.next({error:true,errorCode: error.response.data.errorCode});
            observer.complete();
          }
        }else{
          observer.next({error:true,errorCode: "E99"});
          observer.complete();
        }
    });
  });
}
// END メッセージ一覧の取得
// ****************************************************************************************************************************************************************

// ****************************************************************************************************************************************************************
// PDFファイル一覧のダウンロードトークンの取得
exports.getDownloadPdfTokenLPW = function getDownloadPdfTokenLPW(datalogin, data){
  return new Observable(observer => {
    api.post(datalogin.url+'/v1/api/pdf-download-token',data,
    { headers: {
        userid: datalogin.userid,
        uh2: datalogin.uh2
      }
    }).then(x=>{
      if(x.status == 200){
        observer.next({error:false,data:x.data.data});
        observer.complete();
      }
    }).catch((error) => {
        // Error 😨
        if (error.response) {
          if(error.response.status == 403){
            common.logOutOrDenied();
          }else{
            observer.next({error:true,errorCode: error.response.data.errorCode});
            observer.complete();
          }
        }else{
          observer.next({error:true,errorCode: "E99"});
          observer.complete();
        }
    });
  });
}
// END PDFファイル一覧のダウンロードトークンの取得
// ****************************************************************************************************************************************************************

// ****************************************************************************************************************************************************************
// ファイルのアップロード
exports.pdfCombinationUpload = function (datalogin, data){
  return new Observable(observer => {
    api.post(datalogin.url+'/v1/api/pdf-combination-upload', data ,
    { headers: {
        userid: datalogin.userid,
        uh2: datalogin.uh2
      }
    }).then(x=>{
      observer.next({error:false,data:x.data.data});
      observer.complete();
    }).catch((error) => {
        // Error 😨
        if (error.response) {
          if(error.response.status == 403){
            common.logOutOrDenied();
          }else{
            observer.next({error:true,errorCode: error.response.data.errorCode});
            observer.complete();
          }
        }else{
          observer.next({error:true,errorCode: "E99"});
          observer.complete();
        }
    });
  });
}
// END ファイルのアップロード
// ****************************************************************************************************************************************************************


exports.extractPdf = function (data){
  return new Observable(observer => {
    api.post(datalogin.url+'/v1/api/pdf-extracts', data ).then(x=>{
      observer.next({error:false,data:x.data.data});
      observer.complete();
    }).catch((error) => {
        // Error 😨
        if (error.response) {
          if(error.response.status == 403){
            common.logOutOrDenied();
          }else{
            observer.next({error:true,errorCode: error.response.data.errorCode});
            observer.complete();
          }
        }else{
          observer.next({error:true,errorCode: "E99"});
          observer.complete();
        }
    });
  });
}