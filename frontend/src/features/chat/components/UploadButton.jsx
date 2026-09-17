import React from 'react'
import { useDispatch } from 'react-redux'
import { addUploadQueue } from '../state/media'
import { useSelector } from 'react-redux';
function UploadButton({mediaId}) {
    const mediaStore=useSelector(state=>state.chat.mediaStore);
    const byId=mediaStore.byId;
    const dispatch=useDispatch();
    const handleUpload=()=>{
      dispatch(addUploadQueue({
        mediaId:mediaId,
        status:"pending",
        uploadedBytes:0,
        totalBytes:byId[mediaId].size,
        error: null,
      }))
    }
  return (
    <button onClick={handleUpload}>

    </button>
  )
  
}

export default UploadButton