import React from 'react'
import { useDispatch } from 'react-redux';
import { removeSelectedMedia, setSelectedPreview } from '../state/media';
function SmallPreview({icon,selected=false,mediaId,validationErrors}) {
    const dispatch=useDispatch();
    console.log(icon+" "+mediaId+" "+selected);
  return (
    <div className="relative h-10 w-10">
      <button
        onClick={()=>dispatch(setSelectedPreview(mediaId))}
        className="h-full w-full"
      >
        <img
  src={icon}
 className={`h-full w-full object-cover ${
  selected
    ? "border-2 border-green-500"
    :validationErrors?.length > 0
    ? "border-2 border-red-500"
    : ""
}`}
  alt="Preview"
/>
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation(); 
          dispatch(removeSelectedMedia(mediaId));
        }}
        className="absolute top-1 right-1 z-10 bg-black/50 rounded-full p-1"
      >
        <img
          src="/images/cross.png"
          className="h-2.5 w-2.5"
          alt="Remove"
        />
      </button>
    </div>
  );
}

export default SmallPreview