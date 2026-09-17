import React from 'react'
import { useSelector } from 'react-redux'
import { useEffect } from 'react'
import { useState } from 'react'
import { getMediaFile } from '../services/indexedDbServices'
import { useDispatch } from 'react-redux'
import { updateShowMediaFull } from '../state/media'
function Viewer({ mediaId}) {
    console.log("INSIDE THE VIEWER");
    const doc = useSelector(state => state.media.MediaStore)
    const media = doc.byId[mediaId]
    const dispatch=useDispatch();
    const category = media?.category
    const [file, setFile] = useState(null);
    const [url, setUrl] = useState(null);   
    useEffect(()=>{
    const loader=async()=>{
    let tempFile=await getMediaFile("uploadedFiles",mediaId);
   
    if(!tempFile){
        tempFile=await getMediaFile("downloadedFiles",mediaId);
    }
     console.log("FILE",file);
    if(tempFile){
       let tempUrl = URL.createObjectURL(tempFile.file)
       setFile(tempFile.file);
       setUrl(tempUrl);
    }
    }
    loader();
    },[mediaId])
    
    let content = null

    switch (category) {

        case "image":
            content = (
                <img
                    src={url}
                    alt="media"
                    className="max-w-[90vw] max-h-[90vh] object-contain"
                />
            )
            break

        case "video":
            content = (
                <video
                    src={url}
                    controls
                    className="max-w-[90vw] max-h-[90vh] object-contain"
                />
            )
            break
    }

   const handleDownload = () => { 
    console.log("download clicked");
    const name=media?.name;
    const a = document.createElement("a");
    a.href = url;
    a.download =name;
    document.body.appendChild(a);
    a.click();
    a.remove();

    URL.revokeObjectURL(url);
    }
   
   

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">

            {/* Close Button */}
            <button
                onClick={()=>{
                    dispatch(updateShowMediaFull({
                        active:false,
                        mediaId:null
                    }))
                }}
                className="absolute top-5 left-5 w-10 h-10 rounded-full bg-gray-800 text-white text-2xl flex items-center justify-center hover:bg-gray-700"
            >
                ×
            </button>

            {/* Download Button */}
            <button
                onClick={()=>{handleDownload()}}
                className="absolute top-5 right-5 w-10 h-10 rounded-full bg-gray-800 text-white flex items-center justify-center hover:bg-gray-700"
            >
                ↓
            </button>

            {/* Media */}
            {content}

        </div>
    )
}

export default Viewer

