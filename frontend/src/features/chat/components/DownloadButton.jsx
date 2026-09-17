import React from 'react'
import { useDispatch } from 'react-redux'
import { addDownloadQueue } from '../state/media'
import { useSelector } from 'react-redux';
function DownloadButton({mediaId}) {
    const mediaStore=useSelector(state=>state.chat.mediaStore);
    const byId=mediaStore.byId;
    const dispatch=useDispatch();
    const handleDownload=()=>{
      dispatch(addDownloadQueue({
        mediaId:mediaId,
        status:"pending",
        downloadedBytes:0,
        totalBytes:byId[mediaId].size,
        error: null,
      }))
    }
  return (
    <button onClick={handleDownload}>

    </button>
  )
}

export default DownloadButton