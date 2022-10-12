const path = require('path');
const { app, BrowserWindow, dialog, clipboard } = require('electron');
const electron = require('electron');
const fs = require('fs');
const fse = require('fs-extra')
const Observable = require('rxjs').Observable;
const ipcMain = electron.ipcMain;
const loginService = require(__dirname + "/assets/js/loginService");
const service = require(__dirname + "/assets/js/service");
const { autoUpdater } = require('electron-updater');
const modeDev = require(__dirname + '/enviroment.json');
const common = require(__dirname + "/assets/js/common");
const process = require('process');
const os = require('os');

let loginWindow = null;
let otherStampWindow = null;
let mainWindow = null
let userInfo = null;
downloadProgress = 0;
let pathCookies = null;
var dataLogin = {
  templateFolder: path.join(os.homedir(), 'LPW', 'temp'), //
  idleSecond: 3600,
  url: "",
  userid: "",
  uh2: ""
};

user = {
  userid: "",
  uh2: ""
};

message = [
  {
    "code": "LPW0001",
    "contents": "ログイン"
  },
  {
    "code": "LPW0002",
    "contents": "ID"
  },
  {
    "code": "LPW0003",
    "contents": "パスワード"
  },
  {
    "code": "LPW0004",
    "contents": "閉じる"
  },
  {
    "code": "LPW0005",
    "contents": "お知らせ"
  },
  {
    "code": "LPW0006",
    "contents": "図面リスト"
  },
  {
    "code": "LPW0007",
    "contents": "図面リスト欄"
  },
  {
    "code": "LPW0008",
    "contents": "ログアウト"
  },
  {
    "code": "LPW0009",
    "contents": "検索欄"
  },
  {
    "code": "LPW0010",
    "contents": "図面検索"
  },
  {
    "code": "LPW0011",
    "contents": "ファイルを開く"
  },
  {
    "code": "LPW0012",
    "contents": "図面"
  },
  {
    "code": "LPW0013",
    "contents": "ページ"
  },
  {
    "code": "LPW0014",
    "contents": "名前を付けて保存"
  },
  {
    "code": "LPW0015",
    "contents": "上書き保存"
  },
  {
    "code": "LPW0016",
    "contents": "製品情報管理システム"
  },
  {
    "code": "LPW0017",
    "contents": "ファイルダウンロード中。。。"
  },
  {
    "code": "LPW0018",
    "contents": "PDF書き込みアプリ"
  },
  {
    "code": "LPW0019",
    "contents": "保存中。。。"
  },
  {
    "code": "LPW0020",
    "contents": "品番"
  },
  {
    "code": "LPW0021",
    "contents": "検索"
  },
  {
    "code": "LPW0022",
    "contents": "品名"
  },
  {
    "code": "LPW0023",
    "contents": "PDF名称"
  },
  {
    "code": "LPW0024",
    "contents": "更新日"
  },
  {
    "code": "LPW0025",
    "contents": "ダウンロード"
  },
  {
    "code": "LPW0026",
    "contents": "キャンセル"
  },
  {
    "code": "LPWE0001",
    "contents": "例外エラーが発生しました。</br>管理者に連絡してください。"
  },
  {
    "code": "LPWE0002",
    "contents": "DBサーバに接続できません。"
  },
  {
    "code": "LPWE0003",
    "contents": "ログインID、パスワードのいずれかが入力されていません。"
  },
  {
    "code": "LPWE0004",
    "contents": "ログインID、またはパスワードが間違っています。"
  },
  {
    "code": "LPWI0001",
    "contents": "該当データがありません。"
  },
  {
    "code": "LPWI0002",
    "contents": "変更内容を保存しなくても</br>よろしいでしょうか？"
  },
  {
    "code": "LPWI0003",
    "contents": "ファイルを置き換えますか？"
  },
  {
    "code": "LPWI0004",
    "contents": "品番を選択してください。"
  },
  {
    "code": "LPWI0005",
    "contents": "検索データが100行超えています。"
  },
  {
    "code": "LPWI0006",
    "contents": "最新バージョンが見つかりましたが、インストールしましょうか？"
  },
  {
    "code": "LPWI0007",
    "contents": "画像がありません。"
  },
  {
    "code": "LPWW0008",
    "contents": "同じ名前のファイルが開いています。下書きに保存できません。"
  },
  {
    "code": "LPWI0009",
    "contents": "ドラッグ＆ドロップでページを抽出してください。"
  },
  {
    "code": "LPWI0010",
    "contents": "ページを選択してください。"
  },
  {
    "code": "LPWI0011",
    "contents": "選択したべーじを削除しますが、よろしいでしょうか?"
  },
  {
    "code": "LPWI0012",
    "contents": "選択したスタンプを削除しますが、よろしいでしょうか?"
  }
];
autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = false;
minWidth = 350;
minHeight = 90;

//path
pathHome = path.join(os.homedir(), 'LPW');
pathWork = path.join(os.homedir(), 'LPW', 'work');
pathStamp = path.join(os.homedir(), 'LPW', 'stamp');
pathSignStamp = path.join(os.homedir(), 'LPW', 'stamp' , 'sign_stamp');
pathOtherStamp = path.join(os.homedir(), 'LPW', 'stamp' , 'other_stamp');
pathMerge = path.join(os.homedir(), 'LPW', 'tempMerge');
pathLoginHtml = path.join(__dirname, '/assets/page/login.html');
pathIcon = path.join(__dirname, "assets/app-icon/win/murata.ico");
pathMainHtml = path.join('file://', __dirname, '/assets/page/main.html');
otherStampHTML = path.join(__dirname, '/assets/page/otherStamp.html');
pathAssets = path.join(__dirname, '/assets/');
//CHECK OPEN APP AT ONE
const gotTheLock = app.requestSingleInstanceLock()

// ****************************************************************************************************************************************************************
// SCRIPT PROCESS CLOSE APP
ipcMain.on('closeApp', (event, arg) => {
  mainWindow = null;
  app.quit();
});

// ****************************************************************************************************************************************************************
// SCRIPT PROCESS SEND config.json DATA FOR WINDOW
ipcMain.on('dataLoginRequest', (event, arg) => {
  readConfigProcess().subscribe(data => {
    event.sender.send('dataLoginReply', { datalogin: data, message: message })
  });
});

// ****************************************************************************************************************************************************************
// SCRIPT PROCESS GET INFO OF LOGIN USER
ipcMain.on('dataUserInfoRequest', (event, arg) => {
  event.sender.send('dataUserInfoReply', { userInfo, init: true })
});

// ****************************************************************************************************************************************************************
// SCRIPT PROCESS LOGIN
ipcMain.on('loginSuccess', (event, arg) => {
  user.userid = arg['userid'];
  user.uh2 = arg['uh2'];
  saveDataLogin().subscribe(_ => { checkAuthor(true) });
});

// ****************************************************************************************************************************************************************
// SCRIPT PROCESS WRITE DATA LOGIN UH2
ipcMain.on('saveDataLogin', (event, arg) => {
  if(user){
    user.userid = arg['userid'];
    user.uh2 = arg['uh2'];
    saveDataLogin().subscribe(_ => { });
  }
  
});



// SCRIPT PROCESS OPEND DIALOG OPEN FILE
ipcMain.on('openFile', (event, data) => {
  let name = (data == "pdf") ? 'PDFファイル' : '画像ファイル';
  let ext = (data == "pdf") ? ['pdf'] : ['png', 'jpg'];
  let send = (data == "pdf") ? 'openPath' : 'imagePath';
  let options = {
    title: modeDev.title,
    defaultPath: null,
    filters: [
      { name: name, extensions: ext }
    ], properties: (data == "pdf") ? ['multiSelections'] : ['openFile']
  }
  dialog.showOpenDialog(mainWindow, options, (data) => {
    mainWindow.webContents.send(send, data);
  });
});

// ****************************************************************************************************************************************************************
// SCRIPT PROCESS OPEND DIALOG SAVE FILE
ipcMain.on('saveFile', (event, data) => {
  let options = {
    title: modeDev.title,
    defaultPath: data,
    filters: [
      { name: 'PDFファイル', extensions: ['pdf'] }
    ], properties: ['openDirectory', 'createDirectory']
  }
  dialog.showSaveDialog(mainWindow, options, (data) => {
    mainWindow.webContents.send('savePath', data);
  });
});

// ****************************************************************************************************************************************************************
// SCRIPT PROCESS AUTO UPDATE
ipcMain.on('checkupdate', (event, arg) => {
  autoUpdater.checkForUpdates();
});
autoUpdater.on('update-available', (ev, info) => {
  if (loginWindow) {
    loginWindow.webContents.send('update-available-app', {
      msg: '最新バージョンが見つかりましたが、</br>インストールしましょうか？'
    });
  } else {
    mainWindow.webContents.send('update-available-app', {
      msg: '最新バージョンが見つかりましたが、</br>インストールしましょうか？'
    });
  }
});

ipcMain.on('accept-update', () => {
  autoUpdater.downloadUpdate();
});

autoUpdater.on('update-downloaded', () => {
  /*************** SCRIPT ASK UPDATE OR NOT (IT MAYBE CAN USE )***********************/
  // if(loginWindow){
  //   loginWindow.webContents.send('update-downloaded-complete', {
  //     msg: 'ダウンロードが完了しました。インストールしますか？'
  //   });
  // }else{
  //   mainWindow.webContents.send('update-downloaded-complete', {
  //     msg: 'ダウンロードが完了しました。インストールしますか？'
  //   });
  // }
  // autoUpdater.downloadUpdate();
  /*************** SCRIPT ASK UPDATE OR NOT (IT MAYBE CAN USE )***********************/
  autoUpdater.quitAndInstall();
});

/*************** SCRIPT ASK UPDATE OR NOT (IT MAYBE CAN USE )***********************/
// autoUpdater.on('download-progress', (ev, progressObj) => {
//   let log_message = "Download speed: " + progressObj.bytesPerSecond;
//     log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
//     log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
//   if(loginWindow){
//     loginWindow.webContents.send('download-progress-request', {
//       msg: log_message
//     });
//   }else{
//     mainWindow.webContents.send('download-progress-request', {
//       msg: log_message
//     });
//   }
// });
// ipcMain.on("Update-Install",e=>{
//   autoUpdater.quitAndInstall();
// });
/*************** SCRIPT ASK UPDATE OR NOT (IT MAYBE CAN USE )***********************/

// END SCRIPT AUTO UPDATE
// ****************************************************************************************************************************************************************

// ****************************************************************************************************************************************************************
// SCRIPT LOGOUT
ipcMain.on("logout", e => {
  // createWindowLogin();
  if (mainWindow) {
    userInfo.userid = dataLogin.userid = ""; userInfo.uh2 = dataLogin.uh2 = "";
    mainWindow.webContents.send("dataUserInfoReply", null);
  }
});

ipcMain.on("mini", e => {

  mainWindow.minimize();
});

ipcMain.on("minmax", e => {
  if (mainWindow.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow.maximize();
  }
});

ipcMain.on("getMinMax", e => {
  mainWindow.webContents.send('ismax', mainWindow.isMaximized());
});


//clipbroad
ipcMain.on("clearClipboard", e => {
  clipboard.clear();
});

ipcMain.on("checkClipBoard", e => {
  let formats = clipboard.availableFormats();
  mainWindow.webContents.send('responseCheckClipboard', (formats[0] && formats[0].indexOf('image/') > -1) ? true : false);
});

//clipbroad
ipcMain.on("saveImageOfClipboard", (event, param) => {
  saveImageInClipboard();
});


//2021/02/19
ipcMain.on('openLogin', (event, arg) => {
  if (mainWindow) {
    mainWindow.setEnabled(false);
  }
  createWindowLogin();
  // createCombinePDFBrowser();
});

ipcMain.on('closeLoginWindow', (event, arg) => {
  closeLoginWindow();
});


ipcMain.on('checkSearchProduct', (event, arg) => {
  checkSessionTimeOut();
});

/************************************************function********************************************************* */
// SCRIPT MAIN 
function initialize() {
  // common.deleteFolderRecursive(pathHome);
  common.mkDirByPathSync(pathMerge);
  common.mkDirByPathSync(pathWork);
  common.mkDirByPathSync(pathStamp);
  common.mkDirByPathSync(pathSignStamp);
  common.mkDirByPathSync(pathOtherStamp);
 
  //CHECK OPEN APP AT ONE
  if (!gotTheLock) {
    app.quit();
    return;
  } else {
    app.on('ready', () => {
      // createOtherStampHTMLBrowser(null);
      // return
      checkAuthor();
    });

    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });

    app.on('activate', () => {
      if (mainWindow === null) {
        createWindowLogin();
      }
    });
  }
}
// END SCRIPT MAIN 

function saveDataLogin() {
  return new Observable(observer => {
    try {
      fs.writeFileSync(path.join(os.homedir(), 'LPW', 'user.json'), JSON.stringify(user, null, 2));
      observer.next();
      observer.complete();
    } catch (ex) {
      observer.error('E99');
      observer.complete();
    }
  });
}

// SCRIPT READ FILE config.json
function readConfig() {
  return new Observable(observer => {
    try {
      let p1 = path.join(__dirname, (modeDev.mode == "dev") ? (modeDev.pathDev) : (modeDev.pathProd)),
        p2 = path.join(os.homedir(), 'LPW', 'user.json');
      if (fs.existsSync(p1)) {
        let data1 = JSON.parse(fs.readFileSync(p1, { encoding: 'utf8', flag: 'r' }));
        if (data1 != null) {
          if (data1.templateFolder == null || data1.templateFolder == "") { } else {
            dataLogin.templateFolder = data1.templateFolder;
          }
          dataLogin.idleSecond = data1.idleSecond;
          dataLogin.url = data1.url;
        }
      }
      if (fs.existsSync(p2)) {
        let dataUser = JSON.parse(fs.readFileSync(p2, { encoding: 'utf8', flag: 'r' }));
        if (dataUser != null) {
          dataLogin.userid = user.userid = dataUser.userid
          dataLogin.uh2 = user.uh2 = dataUser.uh2;
        }
      }
      observer.next("done");
      observer.complete();
    } catch (ex) {
      observer.error('E99');
    }
  });
}

// SCRIPT PROCESS READ FILE config.json
function readConfigProcess() {
  return new Observable(observer => {
    try {
      readConfig().subscribe(_ => {
        if (fs.existsSync(dataLogin.templateFolder)) {
          common.deleteFolderRecursive(dataLogin.templateFolder);
        } else {
          common.mkDirByPathSync(dataLogin.templateFolder);
        }
      }, error => console.log(error));
      service.getMessages(dataLogin).subscribe(mess => {
        if (!mess.error) {
          message = mess.data;
        }
      });
      observer.next(dataLogin);
      observer.complete();
    } catch (error) {
      console.log(error);
    }

  });
}

//SCRIPT CHECK FOR EACH LICK SEARCH
function checkSessionTimeOut() {
  if (user && user.uh2 != "" && user.userid != "") {
    loginService.hashkeyLogin(dataLogin).subscribe(x => {
      if (x.error) {
        if (mainWindow) mainWindow.webContents.send('haskey-error', x.errorMess);
        userInfo = null;
        dataLogin.userid = ""; dataLogin.uh2 = "";
        mainWindow.webContents.send("searchProduct", { canSearch: false, login: false });
        mainWindow.webContents.send("dataUserInfoReply", { userInfo: null, init: false });
      } else {
        userInfo = x.data;
        userInfo.userid = dataLogin.userid = user.userid; userInfo.uh2 = dataLogin.uh2 = user.uh2;
        mainWindow.webContents.send("searchProduct", { canSearch: userInfo.author, login: true });
      }
    });
  } else {
    mainWindow.webContents.send("searchProduct", { canSearch: false, login: false });
  }
}

// SCRIPT PROCESS CHECK AUTHOR
function checkAuthor(login = false) {
  if (!login) createWindowMain();
  // createWindowLogin();
  readConfigProcess().subscribe(data => {
    if (data.uh2 == null || data.uh2 == "") {
      // createWindowLogin();
    } else {
      loginService.hashkeyLogin(data).subscribe(x => {
        if (x.error) {
          // if(loginWindow == null){
          //   createWindowLogin();
          //   return;
          // }else{
          if (login && loginWindow) loginWindow.webContents.send('haskey-error', x.errorMess);
          //   return;
          // }

        } else {
          userInfo = x.data;
          userInfo.uh2 = data.uh2;
          userInfo.userid = data.userid;
          if (login && loginWindow) closeLoginWindow();
          mainWindow.webContents.send("dataUserInfoReply", { userInfo, init: false,pathAssets });
          if (login) mainWindow.webContents.send("searchProduct", { canSearch: userInfo.author, login: true });
          // createWindowMain();
        }
      });
    }
  })
}

function saveImageInClipboard() {
  let 
    fileName = 'imgClipBoard' + common.UUID() + '.png',
    pathSave = path.join(pathWork, fileName);
  console.log('clip')
  fs.writeFile(pathSave, clipboard.readImage().toPNG(), function (err) {
    if (err) {
      mainWindow.webContents.send('errorFromClipBoard', 'E99');
      return;
    }
    mainWindow.webContents.send('imagePath', [pathSave]);
  });
}

function closeLoginWindow() {
  if (loginWindow) {
    loginWindow.hide();
  }
  if (mainWindow) {
    mainWindow.setEnabled(true);
    mainWindow.show();
  }
}

// ****************************************************************************************************************************************************************
// SCRIPT CREATE LOGIN WINDOW 画面詳細仕様書_ログイン画面
function createWindowLogin(error = null) {
  const windowOptions = {
    icon: pathIcon,
    width: 450,
    height: 550,
    title: app.getName(),
    webPreferences: {
      nodeIntegration: true,
      devTools : (modeDev.mode == "dev")
    },
    frame: false,
    resizable: false
  }

  loginWindow = new BrowserWindow(windowOptions);
  loginWindow.loadURL(pathLoginHtml);
  loginWindow.setMenuBarVisibility(false);
  if (modeDev.mode == "dev") {
    loginWindow.webContents.openDevTools();
  }
  loginWindow.on('closed', () => {
    loginWindow = null
  });

  // if(mainWindow){
  //   mainWindow.close();
  // }

  loginWindow.webContents.once('did-finish-load', () => {
    autoUpdater.checkForUpdates();
    if (error) loginWindow.webContents.send('haskey-error', error);
  });
}

// END SCRIPT CREATE LOGIN WINDOW 画面詳細仕様書_ログイン画面
// ****************************************************************************************************************************************************************

// ****************************************************************************************************************************************************************
// SCRIPT CREATE MAIN WINDOW 画面詳細仕様書_PDF書き込み
function createWindowMain() {
  const windowOptions = {
    icon: pathIcon,
    resizable: true,
    title: app.getName(),
    webPreferences: {
      nodeIntegration: true,
      devTools : (modeDev.mode == "dev")
    },
    frame: false,
    width: 1280,
    show: false,
    height: 1024,
    minWidth: minWidth,
    minHeight: minHeight
  }

  mainWindow = new BrowserWindow(windowOptions);
  mainWindow.maximize();
  mainWindow.loadURL(pathMainHtml);
  mainWindow.setMenuBarVisibility(false);

  if (modeDev.mode == "dev") {
    mainWindow.webContents.openDevTools();
  }


  mainWindow.on('focus', () => {
    if (loginWindow) {
      loginWindow.focus();
    }
    if (otherStampWindow) {
      otherStampWindow.focus();
    }
  });

  // if(loginWindow){
  //   loginWindow.close();
  // }

  // mainWindow.webContents.once('did-finish-load', () => {
  //   autoUpdater.checkForUpdates();
  // });

  mainWindow.on('closed', function () {
    fse.remove(pathWork).then(() => { }).catch(err => { });
    fse.remove(dataLogin.templateFolder).then(() => { }).catch(err => { });
    fse.remove(pathMerge).then(() => { }).catch(err => { });
    app.quit();
  });
}

// 
ipcMain.on('openFileMap', (event, data) => {
  let name = 'PDFファイル';
  let ext = ['pdf'];
  let send = 'openPathMap';
  let options = {
    title: modeDev.title,
    defaultPath: null,
    filters: [
      { name: name, extensions: ext }
    ], properties: ['openFile']
  }
  dialog.showOpenDialog(mainWindow, options, (data) => {
    mainWindow.webContents.send(send, data);
  });
});

// END SCRIPT CREATE MAIN WINDOW 画面詳細仕様書_PDF書き込み
// ****************************************************************************************************************************************************************

/************************************************function********************************************************* */


// ***************************************************************************************************************************
/************************************************2022/07/ phase 1 ********************************************************* */
mainWindowFocus = -1;
itemMerge = null;
itemOtherStampEdit = null;

ipcMain.on('openOtherStampWindow', (event, arg) => {
  console.log(arg)
  itemOtherStampEdit = arg.otherStampEdit;
  createOtherStampHTMLBrowser(arg);
});

ipcMain.on('closeOtherStampWindow', (event, arg) => {
  closeOtherStampWindow();
});




function closeOtherStampWindow() {
  if (otherStampWindow) {
    otherStampWindow.hide();
  }
  if (mainWindow) {
    mainWindow.setEnabled(true);
    mainWindow.show();
    mainWindow.webContents.send('reloadDataStamp')
  }
}


function createOtherStampHTMLBrowser(config) {

  const windowOptions = {
    icon: pathIcon,
    width: 550,
    height: 500,
    title: app.getName(),
    webPreferences: {
      nodeIntegration: true,
      devTools : (modeDev.mode == "dev")
    },
    frame: false,
    resizable: false,
    
  }

  otherStampWindow = new BrowserWindow(windowOptions);
  otherStampWindow.loadURL(otherStampHTML);
  otherStampWindow.setMenuBarVisibility(false);
  if (modeDev.mode == "dev") {
    otherStampWindow.webContents.openDevTools();
  }

  // otherStampWindow.on('focus', () => {
  //   if (mainWindow && mainWindowFocus == -1) {
  //     mainWindowFocus += 1;
  //     mainWindow.show();
  //     setTimeout(_ => { mainWindowFocus = -1 }, 1000)
  //   }
  // });
  // itemMerge = config.item;
  if (mainWindow) {
    mainWindow.setEnabled(false);
  }

  otherStampWindow.on('closed', () => {
    otherStampWindow = null;
    if (mainWindow) {
      mainWindow.show();
      mainWindow.setEnabled(true);
    }
  });

}



// SCRIPT PROCESS OPEND DIALOG OPEN FILE
ipcMain.on('openFileStamp', (event, data) => {
  let name = '画像ファイル';
  let ext = ['png', 'jpg'];
  let send = 'imagePathStamp';
  let options = {
    title: modeDev.title,
    defaultPath: null,
    filters: [
      { name: name, extensions: ext }
    ], properties: (data == "pdf") ? ['multiSelections'] : ['openFile']
  }
  dialog.showOpenDialog(otherStampWindow, options, (data) => {
    otherStampWindow.webContents.send(send, data);
  });
});

ipcMain.on('checkEditOtherStamp',()=>{
  console.log('check',itemOtherStampEdit)
  otherStampWindow.webContents.send('resultCheckEdit',
  itemOtherStampEdit
  )
})

/************************************************2022/07/ phase 1 ********************************************************* */
// ***************************************************************************************************************************


initialize();
