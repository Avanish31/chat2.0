import React, { useEffect, useState } from 'react'
import { CircularProgress } from './CircularProgress'
import { Video ,Play} from 'lucide-react';
import MediaActionButton from './MediaActionButton';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { getUploadAbortController,getDownloadAbortController,deleteDownloadAbortController,deleteUploadAbortController } from '../services/abortController';
import axios from 'axios';
import { updateStatusDownloadQueue,updateStatusUploadQueue,addDownloadQueue,addUploadQueue, updateShowMediaFull } from '../state/media';
import { updateFileStatus } from '../services/indexedDbServices';
import { getSocket } from '../../../socket/socketClient';
import { formatFileSize } from '../services/fileSizeFormatter';
import { getVideoPreview } from '../services/generatePreview';
function VideoComponent({file, uiButton, progress,mediaId}) {
  let MediaAction=null;
  const dispatch=useDispatch();
  const mediaStore=useSelector(state=>state.media.MediaStore);
  const byId=mediaStore.byId;
  const media = byId[mediaId];
  const [thumbnail, setThumbnail] = useState(null);


useEffect(() => {
    let cancelled = false;

    const loadThumbnail = async () => {
      

        if (uiButton === "openFile") {
            if (!file) return;

            try {
                const res = await getVideoPreview(file);

                console.log("PREVIEW:", res.preview);
                console.log("PREVIEW LENGTH:", res.preview?.length);

                if (!cancelled) {
                    setThumbnail(res.preview);
                }
            } catch (error) {
                console.error("Preview error:", error);
            }

            return;
        }

        const base64 = media?.thumbnail;

        console.log("BACKEND THUMBNAIL:", base64);

        if (!base64) {
            return;
        }

        if (!cancelled) {
            setThumbnail(`data:image/webp;base64,${base64}`);
            
        }
    };

    loadThumbnail();

    return () => {
        cancelled = true;
    };

}, [uiButton, file, mediaId, media?.thumbnail]);
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
  const duration=byId[mediaId]?.duration;
  const size=byId[mediaId]?.size;
  const caption=byId[mediaId]?.caption;
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
  else if (uiButton === "openFile") {
  MediaAction = 
  <button onClick={(e)=>{ e.stopPropagation(); handleOpen()}}>
    <Play
      size={20}
      fill="white"
      className="text-white ml-0.5"
    />
    </button>
}
console.log("THUMBNAILLL",thumbnail);
    return (
 <div className="max-w-[300px]">

  {/* Video thumbnail */}
  <div
    className="flex items-center justify-center relative max-w-[300px] max-h-[300px]"
    onClick={handleOpen}
  >
    <img
      src={thumbnail}
      style={{
        width: "100%",
        height: "100%",
        objectFit: "contain",
        display: "block",
      }}
    />

    {/* Play / Download / Progress */}
    <div className="absolute inset-0 flex items-center justify-center">
      {MediaAction}
    </div>

    {/* Video information */}
    <div className="absolute bottom-2 left-2 flex items-center gap-2 bg-black/50 text-white text-xs px-2 py-1 rounded font-bold">
      <Video size={14} />
      <span>{duration}</span>
      <span>{formatFileSize(size)}</span>
    </div>
  </div>

  {/* Caption */}
  {caption && (
    <div className="px-2 pt-2 pb-1 text-white text-[14px] leading-5 break-words">
      {caption}
    </div>
  )}

</div>
);
}

export default VideoComponent