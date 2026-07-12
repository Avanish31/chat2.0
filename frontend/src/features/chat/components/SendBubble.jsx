import React from 'react'
import BlueTickIcon from '../../../assets/bluetick'
import WhiteTickIcon from '../../../assets/whitetick'
import { useState ,useEffect} from 'react';
import { useSelector ,useDispatch} from 'react-redux';
import { updateSelectedMessagesDeletion,removeSelectedMessagesDeletion } from '../state/chat';
function SendBubble({message,messageType,status,time, id}) {
  const [checked,setChecked]=useState(false);
   const deleteMode=useSelector(state=>state.chat.deleteMode);
  const dispatch=useDispatch();
  const handleToggle=()=>{
    if(!deleteMode){
      return;
    }
    const newChecked=!checked;
    setChecked(newChecked);
    if(newChecked){
       dispatch(updateSelectedMessagesDeletion(id));
    }
    else{
      dispatch(removeSelectedMessagesDeletion(id));
    }
  }
  useEffect(() => {
  if (!deleteMode) {
    setChecked(false);
  }
}, [deleteMode]);
  return (
    <div
  className={`w-full flex flex-row-reverse justify-between mb-2 mt-2 items-center ${
    deleteMode
      ? checked
        ? "bg-[rgba(61,59,59,0.4)]"
        : "hover:bg-[rgba(61,59,59,0.4)]"
      : ""
  }`}
  onClick={deleteMode ? handleToggle : undefined}
>
  <div className="p-1 mr-1 min-w-[50px] max-w-[50%] rounded-[10px] bg-gray-600 break-all">
    <div>{message}</div>

    <div className="flex justify-end items-center gap-1 mt-1">
      <span className="text-[10px] text-gray-200">
        {time}
      </span>

      {status ? (
        <BlueTickIcon/>
      ) : (
        <WhiteTickIcon/>
      )}
    </div>
  </div>
   {deleteMode && <input type='checkbox' checked={checked}   onChange={handleToggle}  onClick={(e)=>e.stopPropagation()}className='h-4 w-4 rounded-md ml-3'></input>}
</div>
  )
}

export default SendBubble