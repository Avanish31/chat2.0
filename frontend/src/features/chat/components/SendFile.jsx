import React from 'react'
import { useRef } from 'react'
import { useState,useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  FileText,
  Image,
  Music,
} from "lucide-react";
import { validateMedia } from '../services/validateMedia';
import { clearSelectedMedia, setPreviewMode, setSelectedMedia, setSelectedPreview, setShowError } from '../state/media';
import { generatePreview } from '../services/generatePreview';
function sendFile() {
  const dispatch=useDispatch()
  const [isOpen,setIsOpen]=useState(false);
  const documentRef = useRef(null);
  const mediaRef = useRef(null);
  const audioRef = useRef(null);
  const handleOptionClick = (type) => {
    setIsOpen(false);

    switch (type) {
        case "document":
            documentRef.current.click();
            break;

        case "media":
            mediaRef.current.click();
            break;

        case "audio":
            audioRef.current.click();
            break;
    }
};
const containerRef = useRef(null);

useEffect(() => {
  function handleClickOutside(e) {
    if (
      containerRef.current &&
      !containerRef.current.contains(e.target)
    ) {
      setIsOpen(false);
    }
  }

  document.addEventListener("mousedown", handleClickOutside);
  return () =>
    document.removeEventListener("mousedown", handleClickOutside);
}, []);
const handleFiles=async(e)=>{
  const files=Array.from(e.target.files);
  const validatedFiles=validateMedia(files);
  
 if (
    validatedFiles.errors.length !== 0 ||
    validatedFiles.invalidFiles.length !== 0
) {
    if (validatedFiles.errors.length !== 0) {
        dispatch(setShowError(validatedFiles.errors[0].message));
    } else {
        dispatch(
            setShowError(
                validatedFiles.invalidFiles[0].errors[0].message
            )
        );
    }
}
  else{
    const generatedPreview=await generatePreview(validatedFiles);
    
    console.log(generatedPreview);
    const formatted=generatedPreview.map((prev)=>({
                mediaId:prev.mediaId,
                preview:prev.preview,
                icon:prev.icon,
                category:prev.category,
                type:prev.type,
                name:prev.name,
                size:prev.size,
                caption:prev.caption,
                pages:prev.pages,
                mimeType:prev.mimeType,
                validationErrors:prev.validationErrors,
                extension:prev.extension
            }))
  dispatch(setSelectedMedia(formatted));
  dispatch(setPreviewMode(true));
  dispatch(setSelectedPreview(formatted[0].mediaId));
  }
}
  return (
      <div ref={containerRef}>
      <button type="button" onClick={()=>{setIsOpen(prev=>!prev)}} >
        <img className='w-8 h-8 ' src='/images/sendFile.png'/>
      </button>
      {isOpen &&<div className="absolute bottom-16 left-[30%] h-40 w-48 bg-[#262727] rounded-md shadow-lg flex flex-col justify-evenly" >
            <button className='flex pl-4 h-[33.33%] hover:bg-[rgb(61,59,59)] items-center rounded-md' onClick={() => handleOptionClick("document")}>
              <FileText size={22} className="text-violet-500"/>Documents</button>
            <button className='flex pl-4 h-[33.33%] hover:bg-[rgb(61,59,59)] items-center rounded-md' onClick={() => handleOptionClick("audio")}>
              <FileText size={22} className="text-orange-500"/>Audio</button>
            <button className='flex pl-4 h-[33.33%] hover:bg-[rgb(61,59,59)] items-center rounded-md' onClick={() => handleOptionClick("media")}>
              <FileText size={22} className="text-blue-500"/>Photos and videos</button>
          </div>}
          <input
            ref={documentRef}
            type="file"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
            multiple
            hidden
            onChange={handleFiles}
        />

        <input
            ref={mediaRef}
            type="file"
            accept="image/*,video/*"
            multiple
            hidden
            onChange={handleFiles}
        />

        <input
            ref={audioRef}
            type="file"
            accept="audio/*"
            multiple
            hidden
            onChange={handleFiles}
        />
      </div>
   
    
  )
}

export default sendFile