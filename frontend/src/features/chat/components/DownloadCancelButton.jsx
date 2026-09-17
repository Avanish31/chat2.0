import React from 'react'
import { getSocket } from '../../../socket/socketClient'
import store from '../../../store'
import { updateFileStatus } from '../services/indexedDbServices'
import { useDispatch } from 'react-redux'
import { updateStatusDownloadQueue } from '../state/media'
import { getDownloadAbortController,deleteDownloadAbortController } from '../services/abortController'
function DownloadCancel({mediaId}) {
  const dispatch=useDispatch();
  const controller=getDownloadAbortController(mediaId);
  const handleCancelDownload=async()=>{
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
  return (
    <button onClick={handleCancelDownload}>downloadCancel</button>
  )
}

export default DownloadCancel