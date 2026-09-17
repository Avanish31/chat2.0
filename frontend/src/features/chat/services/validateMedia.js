const MAX_FILES=10;
const MAX_TOTAL_SIZE=250*1024*1024;
const FILE_LIMITS={
    image:10*1024*1024,
    video:100*1024*1024,
    audio:25*1024*1024,
    document:100*1024*1024,
    archive: 50 * 1024 * 1024,
    unknown: 0 
}
export function getFileCategory(file) {
    const type = file.type || "";

    
    if (type.startsWith("image/")) {
        return {
            category: "image",
            type: type.split("/")[1],
        }; 
    }

    
    if (type.startsWith("video/")) {
        return {
            category: "video",
            type: type.split("/")[1], 
        };
    }

   
    if (type.startsWith("audio/")) {
        return {
            category: "audio",
            type: type.split("/")[1], 
        };
    }

    switch (type) {
        case "application/pdf":
            return {
                category: "document",
                type: "pdf",
            };

        case "application/msword":
            return {
                category: "document",
                type: "doc",
            };

        case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
            return {
                category: "document",
                type: "docx",
            };

        case "application/vnd.ms-excel":
            return {
                category: "document",
                type: "xls",
            };

        case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
            return {
                category: "document",
                type: "xlsx",
            };

        case "application/vnd.ms-powerpoint":
            return {
                category: "document",
                type: "ppt",
            };

        case "application/vnd.openxmlformats-officedocument.presentationml.presentation":
            return {
                category: "document",
                type: "pptx",
            };

        case "text/plain":
            return {
                category: "document",
                type: "txt",
            };

        case "text/csv":
            return {
                category: "document",
                type: "csv",
            };

        case "application/json":
            return {
                category: "document",
                type: "json",
            };

        case "application/zip":
        case "application/x-zip-compressed":
            return {
                category: "archive",
                type: "zip",
            };

        case "application/x-rar-compressed":
            return {
                category: "archive",
                type: "rar",
            };

        case "application/x-7z-compressed":
            return {
                category: "archive",
                type: "zip7",
            };

        default:
            return {
                category: "unknown",
                type: "unknown",
            };
    }
}

function validateMaxFiles(files){

    if(files.length<=MAX_FILES){

        return null;
    }

    return {

        code:"MAX_FILES",

        message:`Maximum ${MAX_FILES} files allowed.`
    };
}
function validateTotalSize(files){
    const total=files.reduce((sum,file)=>sum+file.size,0);
    if(total<=MAX_TOTAL_SIZE){
        return null;
    }
     return{

        code:"TOTAL_SIZE",

        message:`Total upload size exceeded.Total allowed size is${MAX_TOTAL_SIZE} .`
    };
}
function validateFileSize(file){

    const category = getFileCategory(file);
    if(category.category ==="unknown"){
        return null;
    }

    const limit = FILE_LIMITS[category.category];

    if(file.size<=limit)
        return null;

    return{

        code:"FILE_TOO_LARGE",

        message:`${file.name} exceeds ${limit / 1024 / 1024} MB.`

    };
}

export function validateMedia(files){
    const errors=[];
    const validFiles=[];
    const invalidFiles=[];
    let error=validateMaxFiles(files);
    if(error){
        errors.push(error);
    }
    error=validateTotalSize(files);
    if(error){
        errors.push(error);
    }
    for(const file of files){
        const err=validateFileSize(file);
        if(err){
            invalidFiles.push({
                file,
                errors:[err]
            })
        }
        else{
            validFiles.push(file);
        }
    }
    return {
        isValid:errors.length==0 && invalidFiles.length==0,
        errors,
        validFiles,
        invalidFiles
    };

}