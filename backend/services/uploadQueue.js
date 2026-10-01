let queue=[];
const {getIO}=require('../exportHelper');
const fs=require('fs/promises');
const fsSync = require("fs");
const path=require("path");
const TEMP_DIR=path.join(__dirname,"../temp");
let processingQueue=false;
function add(obj) {
    queue.push(obj);
}
function dequeue() {
    if (queue.length === 0) {
        return null;
    }

    return queue.shift();
}
function peekAvailable(currentStorage) {
    return queue.find(item =>
        item.status === "queued" &&
        currentStorage + item.fileSize <=process.env.MAX_TEMP_STORAGE
    );
}
function queueSize() {
    let cnt=0;
   queue.forEach((item)=>{
        if(item.status==='active' || item.status==="reserved"){
            cnt++;
        }
   })
   return cnt;
}
function getAll() {
    return queue;
}
function removeByMediaId(mediaId) {
    const index = queue.findIndex(item => item.mediaId === mediaId);

    if (index === -1) {
        return null;
    }

    queue.splice(index, 1)[0];
}

function removeByUserId(userId) {
    queue = queue.filter(item => item.userId !== userId);
}
function updateStatusByMediaId(mediaId, status) {
    const item = queue.find(item => item.mediaId === mediaId);

    if (!item) {
        return null;
    }

    item.status = status;

    
}
function checkQueue(userId,mediaId){
    const io=getIO();
    io.to(userId).timeout(10000).emit('startUpload',{
            mediaId:mediaId
       },(err,responses)=>{
        if(err){
            removeByMediaId(mediaId);
            processQueue(io);
            return;
        }
        const response=responses[0];
        if(response?.accepted==true){
            console.log("ACTIVATED ");
            updateStatusByMediaId(mediaId,"active");
        }
        else{
            removeByMediaId(mediaId);
            processQueue(io);
        }
       })
}
async function processQueue() {
    if (processingQueue) return;

    processingQueue = true;

    try {
        while (
            getActiveAndReservedMediaIds().length< Number(process.env.MAX_UPLOAD_SLOT)
        ) {
            const currentStorage = await getTempStorageUsage();

            const next = peekAvailable(currentStorage);

            if (!next) {
                break;
            }
            next.fileSize=next.originalSize;
            updateStatusByMediaId(
                next.mediaId,
                "reserved"
            );

            checkQueue(next.userId, next.mediaId);
        }
    } finally {
        processingQueue = false;
    }
}
function getActiveAndReservedMediaIds() {
    return queue
        .filter(item =>
            item.status === "active" ||
            item.status === "reserved"
        )
        .map(item => item.mediaId);
}
async function getDirectorySize(directoryPath) {
    let totalSize = 0;

    try {
        const entries = await fs.readdir(directoryPath, {
            withFileTypes: true
        });

        for (const entry of entries) {
            const entryPath = path.join(directoryPath, entry.name);

            if (entry.isDirectory()) {
                totalSize += await getDirectorySize(entryPath);
            } else if (entry.isFile()) {
                const stats = await fs.stat(entryPath);
                totalSize += stats.size;
            }
        }
    } catch (err) {
        if (err.code === "ENOENT") {
            return 0;
        }

        throw err;
    }

    return totalSize;
}
async function getPausedTempStorageSize() {

    const activeAndReservedIds =
        getActiveAndReservedMediaIds();

    let totalSize = 0;

    const entries = await fs.readdir(TEMP_DIR, {
        withFileTypes: true
    });

    for (const entry of entries) {

        if (!entry.isDirectory()) {
            continue;
        }

        const mediaId = entry.name;

        if (activeAndReservedIds.includes(mediaId)) {
            continue;
        }

        totalSize += await getDirectorySize(
            path.join(TEMP_DIR, mediaId)
        );
    }

    return totalSize;
}
async function getTempStorageUsage() {

    const activeAndReservedSize = queue
        .filter(item =>
            item.status === "active" ||
            item.status === "reserved"
        )
        .reduce(
            (total, item) => total + item.fileSize,
            0
        );

    const pausedSize = await getPausedTempStorageSize();

    return activeAndReservedSize + pausedSize;
}
module.exports={
    add,
    dequeue,
    queueSize,
    getAll,
    removeByMediaId,
    removeByUserId,
    updateStatusByMediaId,
    processQueue,
    getTempStorageUsage
    
}