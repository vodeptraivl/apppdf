###########################################################################################################################
config templateFolder in config.json file 
{
  "templateFolder": "", <- if that config is null or empty temp will save in C:\\user\\{login window user}\LPW\temp
}
###########################################################################################################################

###########################################################################################################################
folder work on C:\\user\\{login window user}\LPW\work use for save file current used.
###########################################################################################################################

###########################################################################################################################
login hash and id will save in C:\\user\\{login window user}\LPW\user.json
###########################################################################################################################

###########################################################################################################################
***************************************************** BUIDING SCRIPT ******************************************************
cmd : ./ npm run release
  1. Build LPW APP ONLY: 

  2. Build LPW BACKEND WITH NOT APP INCLUDE : 

  3. Build LPW BACKEND WITH APP INCLUDE : 

  4. Exit :
   
* mode : <prod> Production 本番環境
         <prodDev> Production 試験環境
         <dev> debug local
         <devProd> Production release another computer
* version : x.x.x (exp : 1.1.1)
* Type BACKEND : <acp> Production with enviproment dev
                 <prd> Production real
                 <dev> developer enviroment
###########################################################################################################################
