//author vola
const fs = require('fs');
const process = require('process');
const path = require('path');
const { exec } = require("child_process");
var re = new RegExp("^[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}$");
var cp = require("child_process");


const fse = require('fs-extra')
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
var WAR = "LPW.war";
var pathRelease = '../release';
var twirlTimer;
var h = ['|', '/', '-', '\\'];
var buildOption = -1;

var evi =  JSON.parse(fs.readFileSync(path.join( __dirname,  '/enviroment.json'),{encoding:'utf8', flag:'r'}));
var BuildDir = (evi.dirRelease == null ||  evi.dirRelease == "") ? pathRelease : evi.dirRelease;
var configBe = fs.readFileSync(path.join( evi.pathBE,'/src/main/resources', 'application.properties'),{encoding:'utf8', flag:'r'});
var dirPastBE = path.join(BuildDir,WAR);
var dirCopyBE = path.join(evi.pathBE,'build/libs',WAR);
var dirBuildBE = path.join(evi.pathBE,'build');
var version = '1.0.0';
var mode;
var typeBE;
var PathStatic = path.join(evi.pathBE,'/src/main/resources/static/autoupdate');
var targetDir;
var targetDirYml;
var releaseDir;
var releaseDirYml;

main();
function main(clear = false){
    if(clear) console.clear();
    console.log("\x1b[41m\x1b[30m************************ BUIDING SCRIPT ************************\x1b[0m\n");
    questTionMain();
}

function questTionMain(){
    console.log("\x1b[46m\x1b[30m 1. Build LPW APP ONLY: \x1b[0m\n");
    console.log("\x1b[46m\x1b[30m 2. Build LPW BACKEND : \x1b[0m\n");
    console.log("\x1b[46m\x1b[30m 3. Build LPW FULL : \x1b[0m\n");
    console.log("\x1b[46m\x1b[30m 4. Exit : \x1b[0m\n");
    rl.question('\x1b[41m\x1b[30mChose Builing => : \x1b[0m', (answer) => {
        let pattern  = '^(1)|(2)|(3)|(4)|(5)$';
        question = answer.match(pattern);
        if(!!question){
            buildOption = answer
            switch(question[0]){
                case '1':
                    buildLPWApp();
                    break;
                case '2':
                    buildBEd();
                    break;
                case '3':
                    buildLPWApp(true);
                    break;
                case '4':
                    console.log(`\x1b[41m\x1b[30mThank you, it will terminate after 1 second !\x1b[0m\n`);
                    setTimeout(_=>{rl.close()},1000);
                    break;
            }
        }else{
            main(true);
        }
    }); 
}

function buildLPWApp(buildBe = false){
    rl.question('\x1b[41m\x1b[30mVersion (x.x.x) : \x1b[0m', (answer) => {
        let pattern  = '^[0-9].[0-9].[0-9]$';
        question = answer.match(pattern);
        if(!!question){
            version = answer;
            getModeBuildLPWAPP(buildBe);
        }else{
            buildLPWApp(buildBe);
        }
    }); 
}

function getModeBuildLPWAPP(buildBE = false){
    rl.question('\x1b[41m\x1b[30mMode (prodGH [1] , dev [2] , testGH [3] , prod182 [4]) : \x1b[0m', (answer) => {
        let pattern  = '^(1)|(2)|(3)|(4)$';
        question = answer.match(pattern);
        if(!!question){
            cleanRelease(BuildDir);
            cleanRelease('./release');
            var data = JSON.parse(fs.readFileSync(path.join( __dirname,  '/package.json'),{encoding:'utf8', flag:'r'}));
            var config =  JSON.parse(fs.readFileSync(path.join( __dirname,  '/config/config.json'),{encoding:'utf8', flag:'r'}));
            mode = answer;
            switch(answer){
                case "2":
                    config.url = evi.apiDev;
                    typeBE = 'dev';
                    break;
                case "4":
                    config.url = evi.apiDevProd;
                    typeBE = 'dev';
                    break;
                case "1":
                    config.url = evi.apiProd;
                    typeBE = 'prd';
                    break;
                case "3":
                    config.url = evi.apiProdDev;
                    typeBE = 'acp';
                    break;
            }
            evi.mode = 'prod';
            data.build.publish.url = config.url+"/autoupdate/";
            data.version = version;
            fs.writeFileSync(path.join( __dirname,  '/enviroment.json'),JSON.stringify(evi,null,2));
            fs.writeFileSync(path.join( __dirname,  '/config/config.json'),JSON.stringify(config,null,2));
            fs.writeFileSync(path.join( __dirname,  '/package.json'),JSON.stringify(data,null,2));
            console.log("\x1b[44m\x1b[30m%s\x1b[0m","[BUILDING] : building LPW APP VERSION : "+version+" , MODE "+mode+"!!!")
            printProgress("LPW APP");
            exec("electron-builder",(error, stdout, stderr) => {
                clearInterval(twirlTimer);
                process.stdout.clearLine();
                process.stdout.cursorTo(0);
                if (error) { console.log("\x1b[41m%s\x1b[0m","[ERROR] : "+error.message); return; }
                if (stderr) { console.log("\x1b[41m%s\x1b[0m","[ERROR] : "+stderr); return;}
                if(stdout){ 
                    config.templateFolder = "";
                    fs.writeFileSync(path.join( __dirname,  '/config/config.json'),JSON.stringify(config,null,2));
                    evi.mode = 'dev'; fs.writeFileSync(path.join( __dirname,  '/enviroment.json'),JSON.stringify(evi,null,2));
                    targetDir = path.join(BuildDir,'PDF Writing App Setup '+version+'.exe');
                    releaseDir = path.join('./release','PDF Writing App Setup '+version+'.exe');
                    fs.copyFileSync(releaseDir ,targetDir);
                    targetDirYml = path.join(BuildDir,'latest.yml');
                    releaseDirYml = path.join('./release','latest.yml');
                    fs.copyFileSync(releaseDirYml ,targetDirYml);
                    evi.mode = 'dev';
                    config.url = evi.apiDev;
                    fs.writeFileSync(path.join( __dirname,  '/enviroment.json'),JSON.stringify(evi,null,2));
                    fs.writeFileSync(path.join( __dirname,  '/config/config.json'),JSON.stringify(config,null,2));
                    if(buildBE){
                        buildBEd(buildBE);
                    }else{
                        cleanRelease('./release');
                        questTionMain();
                    }
                }
            });
        }else{
            console.log("\x1b[41m%s\x1b[0m","[ERROR] : <mode : prod , dev , prodDev , devProd> !!!");
            getModeBuildLPWAPP();
        }
    }); 
}

function buildBEd(buildFontAfter = false){
    if(!typeBE){
        rl.question('\x1b[41m\x1b[30mType BACKEND (acp , prd , dev) : \x1b[0m', (answer) => {
            let pattern  = '^(acp)|(prd)|(dev)$';
            question = answer.match(pattern);
            if(!!question){
                typeBE = answer;
            }
            buildBEd();
        });
        return;
    }
    cleanRelease(PathStatic);
    cleanRelease(dirBuildBE);
    if(buildFontAfter){
        console.log("\x1b[44m\x1b[30m%s\x1b[0m","[COPY APP TO BACKEND] : copy LPW APP to : "+PathStatic+" !!!")
        fs.copyFileSync(releaseDir ,path.join(PathStatic,'PDF Writing App Setup '+version+'.exe'));
        fs.copyFileSync(releaseDirYml ,path.join(PathStatic,'latest.yml'));
        console.log("\x1b[42m\x1b[30m%s\x1b[0m","[COPY APP TO BACKEND] : complete !!! => dir : "+PathStatic+"**");
    }else{
        cleanRelease(BuildDir);
    }
    configBe = configBe.replace(/=dev|=prd|=acp/, ('='+typeBE));
    fs.writeFileSync(path.join( evi.pathBE,'/src/main/resources', 'application.properties'),configBe);
    console.log("\x1b[44m\x1b[30m%s\x1b[0m","[BUILDING] : building LPW BACKEND VERSION : "+version+" , MODE "+typeBE+"!!!")
    printProgress("LPW BACKEND");
    cp.exec("gradle war", {cwd: evi.pathBE}, function(error,stdout,stderr){
        clearInterval(twirlTimer);
        process.stdout.clearLine();
        process.stdout.cursorTo(0);
        if(stdout){
            fs.copyFileSync(dirCopyBE ,dirPastBE);
            configBe = configBe.replace(/=dev|=prd|=acp/, ('=dev'));

            fs.writeFileSync(path.join( evi.pathBE,'/src/main/resources', 'application.properties'),configBe);
            console.log("\x1b[42m\x1b[30m%s\x1b[0m","[COMPLETE] : build BE complete !!! => dir : "+dirPastBE);
            questTionMain();
        }
        if(error){
            console.log("\x1b[41m%s\x1b[0m","[ERROR] : error : "+error+" !!!");
            questTionMain();
        }
    });   
}

function printProgress(name){
    let k = 1, o = 1;
    process.stdout.write("\x1b[46m"+h[k] +" "+name+" building ...\x1b[0m");
    twirlTimer = setInterval(_=>{k = (k > 3) ? 0 : k;process.stdout.clearLine();process.stdout.cursorTo(0);process.stdout.write(h[k]+h[k]+h[k]+h[k]+h[k]+h[k]+h[k]+h[k]+h[k]+" "+name+" building "+h[k]+h[k]+h[k]+h[k]+h[k]+h[k]+h[k]+h[k]+h[k]);k++; o++;},50);  
}

function cleanRelease(folderPath) {
    try{
        if (fs.existsSync(folderPath)) {
          fs.readdirSync(folderPath).forEach((file, index) => {
            const curPath = path.join(folderPath, file);
            if (fs.lstatSync(curPath).isDirectory()) {
              fse.remove(curPath).then(() => {}).catch(err => {});
            } else { // delete file
              fs.unlinkSync(curPath);
            }
          });
        }else{
            fs.mkdirSync(folderPath)
        }
      }catch(ex){
    }
}