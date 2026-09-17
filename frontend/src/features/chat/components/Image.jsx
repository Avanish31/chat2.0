import React, { useEffect, useState } from 'react'
import { CircularProgress } from './CircularProgress'
import MediaActionButton from './MediaActionButton'
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { getUploadAbortController ,getDownloadAbortController,deleteDownloadAbortController,deleteUploadAbortController} from '../services/abortController';
import axios from 'axios';
import { updateStatusDownloadQueue,updateStatusUploadQueue,addDownloadQueue,addUploadQueue } from '../state/media';
import { updateFileStatus } from '../services/indexedDbServices';
import { getSocket } from '../../../socket/socketClient';
import { formatFileSize } from '../services/fileSizeFormatter';
import { updateShowMediaFull } from '../state/media';
function Image({file, uiButton, progress,mediaId}) {
  let MediaAction=null;
  const [source, setSource] = useState(null);
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
      const controller=getDownloadAbortController(mediaId);
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
  const handleOpen=()=>{
    if (uiButton !== "openFile") {
        return;
    }
    dispatch(updateShowMediaFull({
          active:true,
          mediaId:mediaId
        }))
  }
  const size=byId[mediaId]?.size;
  const caption=byId[mediaId]?.caption;


useEffect(() => {

    if (uiButton === "openFile") {

        if (!file) {
            setSource(null);
            return;
        }

        const objectUrl = URL.createObjectURL(file);

        setSource(objectUrl);

        return () => {
            URL.revokeObjectURL(objectUrl);
        };
    }

    const base64 = byId[mediaId]?.thumbnail;

    if (!base64) {
        setSource(null);
        return;
    }

    const dataUrl = `data:image/webp;base64,${base64}`;

    setSource(dataUrl);

}, [uiButton, mediaId, file, byId[mediaId]?.thumbnail]);
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
     <div className="max-w-[300px]">
  
  {/* Image */}
  <div
    className="flex items-center justify-center relative max-w-[300px] max-h-[300px]"
    onClick={handleOpen}
  >
    <img
      src={source}
      className="w-full h-full object-contain rounded-md"
    />

    {/* Media Action */}
    <div className="absolute inset-0 flex items-center justify-center">
      {MediaAction}
    </div>

    {/* File Size */}
    <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
      {formatFileSize(size)}
    </div>
  </div>

  {/* Caption */}
  {caption && (
    <div className="px-2 py-2 text-white text-sm break-words">
      {caption}
    </div>
  )}

</div>
  )
}

export default Image