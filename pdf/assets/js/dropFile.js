const dropzone  = document.getElementById('dropfilepdf');

dropzone.addEventListener('dragover',e =>{
    e.stopPropagation();
    e.preventDefault();
});

dropzone.addEventListener('drop' , e => {
    e.stopPropagation();
    e.preventDefault();
    const file = e.dataTransfer.files;
    let paths = [];
    if(file && file.length > 0){
        for(let i = 0; i < file.length ;i++){
            if(file[i].type == "application/pdf")
                paths.push(file[i].path);
        }
    }
    processPathFile(paths);
})
