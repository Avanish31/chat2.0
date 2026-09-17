import React from 'react'
import { useDispatch } from 'react-redux'
import { getUploadAbortController,deleteUploadAbortController } from '../services/abortController'
import axios from 'axios'

function UploadCancelButton({mediaId}) {
    const dispatch=useDispatch();
    const handleCancelUpload=async()=>{
    const controller=getUploadAbortController(mediaId);
    if(!controller){
        return;
    }
    controller.abort();
    dispatch(updateStatusUploadQueue({
        mediaId:mediaId,
        status:"cancelled"
    }))
    deleteUploadAbortController(mediaId);
    await axios.get(`/api/chat/cancelUpload/${mediaId}`);
    }
  return (
     <button onClick={handleCancelUpload}>UploadCancel</button>
  )
}

export default UploadCancelButton