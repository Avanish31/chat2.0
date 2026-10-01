import axios from 'axios'
import { getSocket } from '../../../socket/socketClient'
import { updateStatusDownloadQueue,updateBytesDownloadQueue,setDownloadedBytes} from '../state/media'
import { useDispatch } from 'react-redux'
import { scheduleQueue } from './scheduler'
import store from '../../../store'
import { getMediaFile,saveChunk,updateDownloadedBytes ,deleteFile,deleteChunksByMediaId,getChunks,setFile,markDownloadFailed,updateFileStatus} from './indexedDbServices'
import { saveDownloadAbortController } from './abortController'
export async function startDownload(mediaId){
    const state = store.getState();
    const mediaStore=state.media.MediaStore;
    const downloadQueue=state.media.downloadQueue;
    store.dispatch(updateStatusDownloadQueue({
            mediaId:mediaId,
            status:"downloading"
    }))
    let IndexedMedia=await getMediaFile("downloadedFiles",mediaId);
    if(!IndexedMedia){
        await setFile("downloadedFiles",mediaId,undefined,mediaStore.byId[mediaId].size,true);
        IndexedMedia = await getMediaFile("downloadedFiles", mediaId);
    }
    store.dispatch(setDownloadedBytes({
        mediaId:mediaId,
        downloadedBytes:IndexedMedia.downloadedBytes
    }))
    await updateFileStatus('downloadedFiles',mediaId,"pending");
     const controller=new AbortController();
    const res=await axios.get(`/api/chat/downloadMedia/${mediaId}`);
    saveDownloadAbortController(mediaId,controller);
    if(!res.data.filePath){
        const socket=getSocket();
        socket.emit('downloadMedia',{
            mediaId:mediaId,
            startByte:IndexedMedia.downloadedBytes,
            endByte:mediaStore.byId[mediaId].size-1,
        })
        return;
    }
   
   
    try{
        await downloadFile(mediaId,res.data.filePath,IndexedMedia.downloadedBytes,controller.signal);
        const file=await chunksToFile(mediaId,mediaStore.byId[mediaId].name,mediaStore.byId[mediaId].mimeType);
        if (!file) {
            throw new Error("No chunks found");
        }
        await deleteFile("downloadedFiles",mediaId);
        await deleteChunksByMediaId(mediaId);
        await setFile("downloadedFiles",mediaId,file,mediaStore.byId[mediaId].size);
        store.dispatch(updateStatusDownloadQueue({
            mediaId:mediaId,
            status:"completed"
        }))
        await updateFileStatus('downloadedFiles',mediaId,"completed");

    }
    catch (error) {
    if (error.name !== "AbortError") {
        await deleteChunksByMediaId(mediaId);
        await markDownloadFailed('downloadedFiles',mediaId);
        store.dispatch(updateStatusDownloadQueue({
            mediaId:mediaId,
            status:"failed"
        }))
        await updateFileStatus('downloadedFiles',mediaId,"failed");
    }
    else{
        console.log("DOWNLOAD CANCEL DETECTED");
    }
    }finally{
        scheduleQueue({
            queueType: "download",
            maxParallel: 3,
            activeStatus: "downloading",
            startTask: startDownload
        });
    }
}

async function downloadFile(mediaId,filePath,downloadedBytes,signal){
    const response = await fetch(filePath, {
        method: "GET",
        headers: {
            Range: `bytes=${downloadedBytes}-`
        },
        signal
    });
    if (!response.ok && response.status !== 206) {
        throw new Error(`Download failed: ${response.status}`);
    }
     const reader = response.body.getReader();
    try {
        while (true) {
            const { value, done } = await reader.read();

            if (done) {
                break;
            }
            const startByte = downloadedBytes;
            const endByte = startByte + value.byteLength - 1;
            await saveChunk(mediaId,startByte,endByte,value);
            downloadedBytes += value.byteLength;
            await updateDownloadedBytes("downloadedFiles",mediaId,downloadedBytes);
            store.dispatch(updateBytesDownloadQueue({
                mediaId:mediaId,
                downloadedBytes:downloadedBytes
            }));
        }
    } finally {
        reader.releaseLock();
    }

}
export async function chunksToFile(mediaId, fileName, mimeType){
    const chunks = await getChunks(mediaId);

    if (!chunks.length) {
        return null;
    }

    const blobParts = chunks.map((chunk) => chunk.chunk);

    const blob = new Blob(blobParts, {
        type: mimeType
    });

    return new File([blob], fileName, {
        type: mimeType,
        lastModified: Date.now()
    });
}