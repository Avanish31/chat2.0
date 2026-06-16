import React from 'react'
import SideBar from './SideBar'
import MainBar from './MainBar'

function Chat() {
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