const Observable = require('rxjs').Observable;
const common = require("./common");
const axios = require('axios');
const {ipcRenderer} = require('electron')

const api = axios.create({
  withCredentials: true,
});

axios.defaults.withCredentials = true;

// ****************************************
// ログイン
exports.login = function login(apiUrl, loginModel){
    return new Observable(observer => {
      api.post(apiUrl+'/v1/api/login',loginModel).then(x=>{
        if(x.status == 200){
          let data = x.data;
          if(!data.error && data.errorMess == null){
            observer.next({error:false,"userid":data.auth.userId,"uh2":data.auth.hashValue});
            observer.complete();
          }else{
            observer.next({error:true,errorMess:data.errorMess});
            observer.complete();
          }
        }
      }).catch((error) => {
          // Error 😨
          if (error.response) {
            if(error.response.status == 403){
              logOutOrDenied();
            }else{
              observer.next({error:true,errorMess:(error.response.status == 403) ? "DENIED" : error.response.data.errorMess});
              observer.complete();
            }
          }else{
            observer.next({error:true,errorMess: "E99"});
            observer.complete();
          }
      });
  });
}
// END ログイン
// ****************************************


// ****************************************
// ハッシュキーログイン
exports.hashkeyLogin = function hashkeyLogin(data){
  return new Observable(observer => {
    api.get(data.url+'/v1/api/hashkey-login',
      {
        headers: {
          userid: data.userid,
          uh2: data.uh2
        }
      }).then(x=>{
        if(x.status == 200){
          let data = x.data;
          if(!data.error && data.errorMess == null){
            observer.next({error:false,"data":data.userInfo});
            observer.complete();
          }else{
            observer.next({error:true,errorMess:data.errorMess});
            observer.complete();
          }
        }
      }).catch((error) => {
          // Error 😨
          if (error.response) {
              observer.next({error:true,errorMess:(error.response.status == 403) ? "DENIED" : error.response.data.errorMess});
              observer.complete();
          }else{
            observer.next({error:true,errorCode: "E99"});
            observer.complete();
          }
      });
  });
}
// END ハッシュキーログイン
// ****************************************


// ****************************************
// メッセージ一覧の取得
exports.getNoitices = function getNoitices(apiUrl){
  return new Observable(observer => {
      api.get(apiUrl+'/v1/api/notices').then(x=>{
        if(x.status == 200){
          let data = x.data;
          if(!data.errorCode){
            observer.next({error:false,"data":data.dataList});
            observer.complete();
          }else{
            observer.next({error:true,errorCode:data.errorCode});
            observer.complete();
          }
        }
      }).catch((error) => {
          // Error 😨
          if (error.response) {
              observer.next({error:true,errorCode: error.response.data.errorCode});
              observer.complete();
          }else{
            observer.next({error:true,errorCode: "E99"});
            observer.complete();
          }
      });
  });
}
// END メッセージ一覧の取得
// ****************************************

// ****************************************
// ログアウト
exports.logout = function logout(datalogin){
  return new Observable(observer => {
      api.delete(datalogin.url+'/v1/api/logout',{headers: {userid: datalogin.userid,uh2:datalogin.uh2}}).then(x=>{
        if(x.status == 200){
          let data = x.data;
          if(!data.errorCode){
            ipcRenderer.send('saveDataLogin', {"userid":"","uh2":""}); 
            observer.next({error:false,errorCode:null,data:"success"});
            observer.complete();
          }else{
            observer.next({error:true,errorCode:data.errorMess});
            observer.complete();
          }
        }
      }).catch((error) => {
          // Error 😨
          if (error.response) {
              if(error.response.status == 403){
                logOutOrDenied();
              }else{
                observer.next({error:true,errorCode: error.response.data.errorMess});
                observer.complete();
              }
          }else{
            observer.next({error:true,errorCode: "E99"});
            observer.complete();
          }
      })
  })
}
// END メッセージ一覧の取得
// ****************************************

function logOutOrDenied(){
  ipcRenderer.send('saveDataLogin', {"userid":"","uh2":""}); 
  ipcRenderer.send('logout', "logout"); 
}

