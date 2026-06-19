import React, { useEffect } from 'react'
import SideBar from './SideBar'
import MainBar from './MainBar'
import { chatAuth } from '../../auth/services/chatAuth'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'

function Chat() {
  const dispatch=useDispatch();
  const navigate=useNavigate();
  useEffect(()=>{
    chatAuth(dispatch,navigate);
  },[])
  return (
    <>
    <div className='w-full flex'>
    <SideBar/>
    <MainBar/>
    </div>
    </>
  )
}

export default Chat