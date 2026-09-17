import axios from 'axios'
import store from '../../../store';
import { getMediaFile } from './indexedDbServices';
export async function getMediaUiState(mediaId,send,totalBytes,uploadedBytes,downloadedBytes){
    console.log("getMediaUISTATE is hit");
    const state = store.getState();
    if(send==true){
        const res=await axios.get(`/api/chat/getStatusDetail/${mediaId}`);
        console.log("ress",res.data);
        console.log("status details fetched ",res.data.uploadStatus);
        const uploadStatus=res.data.status;
        const uploadQueue=state.media.uploadQueue;
        if(uploadStatus==="pending"){
            const doc=uploadQueue.byId[mediaId];
            if(doc){
                const progress=uploadedBytes/totalBytes;
                console.log("RETURNED");
                return{
                    type:"uploading",
                    progress:progress
                }
                
            }
            else{
                console.log("RETURNED");
                return {
                    type:"pending",
                    progress:null
                }
            }
        }
        else if(uploadStatus==="completed"){
            console.log("completed ",mediaId);
            try{
            const doc=await getMediaFile("uploadedFiles",mediaId);
            const cachedStatus=doc.cached;
            console.log("hi");
            if(cachedStatus==true){
                return{
                    type:"completed",
                    available:true,
                    file:doc.file,
                }
            }
            else{
                return{
                    type:"completed",
                    available:false
                }
            }
        }catch(err){
            return{
                    type:"completed",
                    available:false
            }
        }
        }
        else if(uploadStatus==="failed"){
            return{
                type:"failed"
            }
        }
        else if(uploadStatus==="cancelled"){
            return{
                type:"cancelled"
            }
        }
    }
    else{
       const downloadedFile = await getMediaFile(
        "downloadedFiles",
        mediaId
    );

    const uploadedFile = await getMediaFile(
        "uploadedFiles",
        mediaId
    );

   console.log("downloadedFile",downloadedFile);

    if (
        downloadedFile?.cached === true ||
        uploadedFile?.cached === true
    ) {
        let file=null;
        if(downloadedFile.cached==true){
            file=downloadedFile.file;
        }
        else{
            file=uploadedFile.file;
        }
        return {
            type: "completed",
            available: true,
            file:file
        };
    }

    const downloadStatus = downloadedFile?.status;
    const downloadQueue = state.media.downloadQueue;
    console.log("download status ",downloadStatus);
    if (downloadStatus === "pending") {
        const doc = downloadQueue.byId[mediaId];

        if (doc) {
            return {
                type: "downloading",
                progress: downloadedBytes / totalBytes
            };
        }

        return {
            type: "pending",
            progress: null
        };
    }

    if (downloadStatus === "failed") {
        return {
            type: "failed"
        };
    }

    if (downloadStatus === "cancelled") {
        return {
            type: "cancelled"
        };
    }

    return {
        type: "pending",
        progress: null
    };
    }
}