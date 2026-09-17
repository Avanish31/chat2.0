import React from 'react'
import { CircularProgress } from './CircularProgress';
import MediaActionButton from './MediaActionButton';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { getUploadAbortController,getDownloadAbortController,deleteDownloadAbortController,deleteUploadAbortController } from '../services/abortController';
import axios from 'axios';
import { updateStatusDownloadQueue,updateStatusUploadQueue,addDownloadQueue,addUploadQueue } from '../state/media';
import { updateFileStatus } from '../services/indexedDbServices';
import { getSocket } from '../../../socket/socketClient';
import { formatFileSize } from '../services/fileSizeFormatter';
import { Controller } from 'react-hook-form';
function PdfMedia({file, uiButton, progress,mediaId,color}) {
  let MediaAction=null;
  const isBlur = uiButton !== "openFile";
  const dispatch=useDispatch();
  const mediaStore=useSelector(state=>state.media.MediaStore);
  const byId=mediaStore.byId;
  const handleUploadCancel=async()=>{
    const controller=getUploadAbortController(mediaId);
    if(!controller){
        return;
    }
    controller.abort();
    deleteUploadAbortController(mediaId);
    dispatch(updateStatusUploadQueue({
        mediaId:mediaId,
        status:"cancelled"
    }))
    await axios.get(`/api/chat/cancelUpload/${mediaId}`);
  }
  const handledownloadCancel=async()=>{
    console.log("DOWNLOAD CANCEL HITTT");
      const controller=getDownloadAbortController(mediaId);
      console.log("CONTROLLER ",controller);
      const socket=getSocket();
          if(!controller){
            return;
          }
          controller.abort();
          deleteDownloadAbortController(mediaId);
          socket.emit('media:cancel',{
              mediaId:mediaId
          })
          dispatch(updateStatusDownloadQueue({
                  mediaId:mediaId,
                  status:"cancelled"
          }))
      await updateFileStatus('downloadedFiles',mediaId,"cancelled");
  }
  const handleDownload=()=>{
      dispatch(addDownloadQueue({
              mediaId:mediaId,
              status:"pending",
              downloadedBytes:0,
              totalBytes:byId[mediaId].size,
              error: null,
      }))
  }
  const handleUpload=()=>{
     dispatch(addUploadQueue({
            mediaId:mediaId,
            status:"pending",
            uploadedBytes:0,
            totalBytes:byId[mediaId].size,
            error: null,
          }))
  }
  const name=byId[mediaId]?.name;
  const downloadToSystem = async () => {
    if (uiButton !== "openFile") {
        return;
    }
    const url = URL.createObjectURL(file);
    const a = document.createElement("a");
    a.href = url;
    a.download =name;
    document.body.appendChild(a);
    a.click();
    a.remove();

    URL.revokeObjectURL(url);
};
 const thumbnail = byId[mediaId]?.thumbnail
    ? `data:image/webp;base64,${byId[mediaId].thumbnail}`
    : null;
  const pages=byId[mediaId]?.pages;
  const size=byId[mediaId]?.size;
  const caption=byId[mediaId]?.caption;
  console.log("UIBUTTON ",uiButton);
  if(uiButton=="uploadProgress"){
    MediaAction=<CircularProgress progress={progress} onCancel={(e)=>{ e.stopPropagation(); handleUploadCancel()}}/>
  }
  else if(uiButton=="downloadProgress"){
   
    MediaAction=<CircularProgress progress={progress} onCancel={(e)=>{ e.stopPropagation(); handledownloadCancel()}}/>
  }
  else if(uiButton=="downloadButton"){
    MediaAction=<MediaActionButton type={"download"} onClick={(e)=>{ e.stopPropagation(); handleDownload()}}/>
  }
  else if(uiButton=="uploadButton"){
    MediaAction=<MediaActionButton type={"upload"} onClick={(e)=>{ e.stopPropagation(); handleUpload()}}/>
  }
  return (
     <div
    className={`relative w-[350px] max-w-full rounded-lg overflow-hidden ${color} text-white`}
    onClick={downloadToSystem}
  >
    {/* PDF Preview */}
    <div className="h-[150px] w-full bg-white overflow-hidden flex items-center justify-center">
      {thumbnail && (
        <img
          src={thumbnail}
          alt={name}
          className={`w-full h-full object-cover ${
            isBlur ? "blur-md" : ""
          }`}
        />
      )}
    </div>

    {/* File Information */}
    <div className="flex items-center px-4 py-3">
      
      {/* PDF Icon */}
      <div className="w-12 h-12 shrink-0 rounded-md bg-red-600 flex items-center justify-center">
        <span className="text-xs font-bold">
          PDF
        </span>
      </div>

      {/* File Details */}
      <div className="ml-3 min-w-0 flex-1">
        <div className="text-[15px] font-medium truncate">
          {name}
        </div>

        <div className="text-[13px] text-gray-300 truncate">
          {pages} pages · PDF · {formatFileSize(size)}
        </div>
      </div>

      {/* Action */}
      <div
        className="ml-3 shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        {MediaAction}
      </div>
    </div>

    {/* Caption */}
    {caption && (
      <div className="px-4 pb-3">
        <p className="text-[14px] text-white break-words">
          {caption}
        </p>
      </div>
    )}
  </div>
  );
}

export default PdfMedia