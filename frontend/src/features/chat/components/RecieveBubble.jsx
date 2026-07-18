import React, { use, useEffect } from 'react'
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateSelectedMessagesDeletion,removeSelectedMessagesDeletion ,updateDeleteForEveryOneEnabler} from '../state/chat';
function RecieveBubble({message,messageType,time,id}) {
  // const [checked,setChecked]=useState(false);
  const selectedMessagesDeletion=useSelector(state=>state.chat.selectedMessagesDeletion);
  const checked=selectedMessagesDeletion.includes(id);
  const deleteMode=useSelector(state=>state.chat.deleteMode);
  const dispatch=useDispatch();
  const handleToggle=()=>{
    if(!deleteMode){
      return;
    }
    const newChecked=!checked;
    // setChecked(newChecked);
    if(newChecked){
      dispatch(updateSelectedMessagesDeletion(id));
      dispatch(updateDeleteForEveryOneEnabler(1));
    }
    else{
      dispatch(removeSelectedMessagesDeletion(id));
      dispatch(updateDeleteForEveryOneEnabler(-1));
    }
  }
//   useEffect(() => {
//   if (!deleteMode) {
    
//     setChecked(false);
    
//   }
// }, [deleteMode]);
  return (
    <div   className={`w-full flex justify-between mt-2 mb-2 ml-2 items-center
    ${deleteMode?checked ? "bg-[rgba(61,59,59,0.4)]" : "hover:bg-[rgba(61,59,59,0.4)]":""}
  `} onClick={deleteMode?handleToggle:undefined}>
      <div className=' p-1 mr-1 min-w-[50px] max-w-[50%] rounded-[10px] flex flex-wrap break-all justify-center bg-blue-600'>
        {message}
         <div className='w-full flex justify-end mt-1'>
          <span className='text-[10px] text-gray-200'>
            {time}
          </span>
      </div>
      </div>
      {deleteMode && <input type='checkbox' checked={checked}   onChange={handleToggle} onClick={(e)=>e.stopPropagation()} className='mr-4 h-4 w-4 rounded-md '></input>}
    </div>
  )
}

export default RecieveBubble