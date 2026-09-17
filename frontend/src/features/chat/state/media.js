import {createSlice} from "@reduxjs/toolkit"
import { act } from "react";
const initialState={
    selectedMedia:{
        byId:{},
        allIds:[]
    },
    uploadQueue:{
        byId:{},
        allIds:[]
    },
    downloadQueue:{
        byId:{},
        allIds:[]
    },
    MediaStore:{
        byId:{},
        allIds:[]
    },
    previewMode:false,
    showError:null,
    selectedPreview:null,
    mediaError:{
        mediaId:null,
        active:false,
        message:null
    },
    showMediaFull:{
        active:false,
        mediaId:null
    }
}
const mediaSlice=createSlice({
    name:"media",
    initialState,
    reducers:{
        setSelectedMedia:(state,action)=>{
            const byId={};
            const allIds=[];
            action.payload.forEach(media=>{
                byId[media.mediaId]=media
                allIds.push(media.mediaId);
            })
            state.selectedMedia.byId=byId;
            state.selectedMedia.allIds=allIds;
            console.log("hiiit");
            

        },
        removeSelectedMedia:(state,action)=>{
         delete state.selectedMedia.byId[action.payload];
           state.selectedMedia.allIds= state.selectedMedia.allIds.filter(id=>id!=action.payload);
           if(state.selectedMedia.allIds.length==0){
            state.selectedMedia.byId={};
            state.selectedMedia.allIds=[];
            state.selectedPreview=null;
            state.previewMode=false;
            state.showError=null;
           }
           else{
            state.selectedPreview=state.selectedMedia.allIds[0];
           }
        },
        updateCaption:(state,action)=>{
            state.selectedMedia.byId[state.selectedPreview].caption=action.payload;
        },
        setPreviewMode:(state,action)=>{
            state.previewMode=action.payload;
        },
        setShowError:(state,action)=>{
            state.showError=action.payload;
        },
        setSelectedPreview:(state,action)=>{
            state.selectedPreview=action.payload
        },
        clearSelectedMedia:(state,action)=>{
            state.selectedMedia.byId={};
            state.selectedMedia.allIds=[];
            state.selectedPreview=null;
            state.previewMode=false;
            state.showError=null;
        },
        setUploadQueue:(state,action)=>{
            const byId={};
            const allIds=[];
            action.payload.forEach(media=>{
                byId[media.mediaId]=media
                allIds.push(media.mediaId);
            })
            state.uploadQueue.byId=byId;
            state.uploadQueue.allIds=allIds;
        },
        updateStatusUploadQueue:(state,action)=>{
            state.uploadQueue.byId[action.payload.mediaId].status=action.payload.status;
        },
        updateBytesUploadQueue:(state,action)=>{
            console.log("hitt achived");
            state.uploadQueue.byId[action.payload.mediaId].uploadedBytes+=action.payload.chunkSize;
        },
        setAbortController:(state,action)=>{
            state.uploadQueue.byId[action.payload.mediaId].abortController=action.payload.abortController
        },
        setMediaStore:(state,action)=>{
            const byId={};
            const allIds=[];
            action.payload.forEach(media=>{
                byId[media.mediaId]=media
                allIds.push(media.mediaId);
            })
            state.MediaStore.byId=byId;
            state.MediaStore.allIds=allIds;
        },
        addMediaStore:(state,action)=>{
            const media=action.payload;
            state.MediaStore.byId[media.mediaId]=action.payload;
            state.MediaStore.allIds.push(media.mediaId);
        },
        setDownloadQueue:(state,action)=>{
            const byId={};
            const allIds=[];
            action.payload.forEach(media=>{
                byId[media.mediaId]=media
                allIds.push(media.mediaId);
            })
            state.downloadQueue.byId=byId;
            state.downloadQueue.allIds=allIds;
        },
        addDownloadQueue:(state,action)=>{
            const queue=action.payload;
            state.downloadQueue.byId[queue.mediaId]=queue;
            state.downloadQueue.allIds.push(queue.mediaId);
        },
        addUploadQueue:(state,action)=>{
            
            const queue=action.payload;
            state.uploadQueue.byId[queue.mediaId]=queue;
            state.uploadQueue.allIds.push(queue.mediaId);
           
            
        },
        updateStatusDownloadQueue:(state,action)=>{
            state.downloadQueue.byId[action.payload.mediaId].status=action.payload.status;
            console.log("download queeee ", JSON.parse(JSON.stringify(state.downloadQueue.byId[action.payload.mediaId])));
        },
        setAbortControllerDownload:(state,action)=>{
            state.downloadQueue.byId[action.payload.mediaId].abortController=action.payload.abortController
        },
        updateBytesDownloadQueue:(state,action)=>{
            console.log("updateBytesDownloadQueue hit");
            state.downloadQueue.byId[action.payload.mediaId].downloadedBytes=action.payload.downloadedBytes;
        },
        setUploadedBytes:(state,action)=>{
            console.log("setUploadedBytes is hitt");
            state.uploadQueue.byId[action.payload.mediaId].uploadedBytes=action.payload.uploadedBytes;
        },
        setDownloadedBytes:(state,action)=>{
            state.downloadQueue.byId[action.payload.mediaId].downloadedBytes=action.payload.downloadedBytes;
        },
        updateMediaError:(state,action)=>{
            console.log("MEDIA ERROR HIT");
            state.mediaError.active=action.payload.active;
            state.mediaError.message=action.payload.message;
            state.mediaError.mediaId=action.payload.mediaId;
        },
        updateShowMediaFull:(state,action)=>{
            state.showMediaFull.active=action.payload.active;
            state.showMediaFull.mediaId=action.payload.mediaId;
        }
    }
})
export const{setPreviewMode,setShowError,setSelectedMedia,setSelectedPreview,removeSelectedMedia,updateCaption,
    clearSelectedMedia,setUploadQueue,updateStatusUploadQueue,updateBytesUploadQueue,setAbortController,
    setMediaStore,setDownloadQueue,updateStatusDownloadQueue,setAbortControllerDownload,updateBytesDownloadQueue,setUploadedBytes,setDownloadedBytes,
addDownloadQueue,addUploadQueue,addMediaStore,updateMediaError,updateShowMediaFull}=mediaSlice.actions;
export default mediaSlice.reducer;