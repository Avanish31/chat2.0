const fs=require('fs/promises');
const fsSync = require("fs");
const path=require("path");
const TEMP_DIR=path.join(__dirname,"../temp");
const { pipeline } = require('stream/promises');
const mediaService=require('./mediaService');
const { processQueue, removeByMediaId } = require('./uploadQueue');
async function saveChunk(mediaId,chunkIndex,buffer){
    const mediaFolder = path.join(TEMP_DIR, mediaId);
    await fs.mkdir(mediaFolder, { recursive: true });
    const chunkPath = path.join(mediaFolder, `${chunkIndex}.chunk`);
    try {
        await fs.access(chunkPath);
        console.log("chunkpath",chunkPath);
        return chunkPath; 
    } catch {
        await fs.writeFile(chunkPath, buffer);
        console.log("chunkpath",chunkPath);
        return chunkPath;
    }
}

async function deleteTempfile(mediaId){
    console.log("DELETE TEMPFILE TRIGGERED");
    const mediaFolder=path.join(TEMP_DIR,mediaId);
     try {
        await fs.access(mediaFolder);
    } catch {
        return false; 
    }
    await fs.rm(mediaFolder,{recursive:true,force:true});
    return true;
}
async function deleteAllChunks(mediaId, totalChunks) {
    const mediaFolder = path.join(TEMP_DIR, mediaId);

    for (let i = 0; i < totalChunks; i++) {
        const chunkPath = path.join(mediaFolder, `${i}.chunk`);
        await fs.rm(chunkPath, { force: true });
    }
}
async function deleteChunkByIndex(mediaId, index) {
    const chunkPath = path.join(
        TEMP_DIR,
        mediaId,
        `${index}.chunk`
    );

    try {
        await fs.unlink(chunkPath);
        console.log(`Deleted chunk ${index}`);
    } catch (err) {
        if (err.code !== "ENOENT") {
            throw err;
        }
    }
}

async function mergeChunks(mediaId, totalChunks, extension) {

    const mediaFolder = path.join(TEMP_DIR, mediaId);

    const outputPath = path.join(
        mediaFolder,
        `${mediaId}${extension}`
    );

    // Create/clear output file
    await fs.writeFile(outputPath, Buffer.alloc(0));
    for (let i = 0; i < totalChunks; i++) {

        const chunkPath = path.join(
            mediaFolder,
            `${i}.chunk`
        );

        await fs.access(chunkPath);

        
        const chunk = await fs.readFile(chunkPath);

        
        await fs.appendFile(outputPath, chunk);
        await deleteChunkByIndex(mediaId, i);
        console.log(`Merged chunk ${i}`);
    }

    console.log("MERGE COMPLETED");

    return outputPath;
}
async function cleanupExpiredUploads() {
  
    const expiryTime = new Date(Date.now() - Number(process.env.UPLOAD_TIMEOUT));
    console.log("EXPIRY TIME",expiryTime);
    const expiredUploads = await mediaService.findExpiredUploads(expiryTime);
    let storageFreed = false;
    console.log("EXPIRED UPLOADS",expiredUploads);
    for (const media of expiredUploads) {
        if(await deleteTempfile(media.mediaId)){
            await mediaService.markUploadFailed(media.mediaId);
            storageFreed = true;
            removeByMediaId(media.mediaId);
        }
        
    }
   if (storageFreed) {
    console.log("freed");
        await processQueue();
    }
}

module.exports={
    saveChunk,
    deleteTempfile,
    deleteAllChunks,
    mergeChunks,
    cleanupExpiredUploads,
}