import React from 'react'
import ChatCard from './ChatCard'
import { useSelector } from 'react-redux'
function SearchResultBox({searchResult,email}) {
  
  return (
    <div className=' w-full p-2 text-white flex justify-center rounded-[10px] bg-[rgb(61,59,59)] mb-2'>
      {email?searchResult?<ChatCard name={searchResult.name} profileImage={searchResult.profileImage} id={searchResult.id} lastMessage={searchResult?.lastMessage} unreadCount={searchResult?.unreadCount}/ >:'No user found':'Search your friend'}
      
    </div>
  )
}

export default SearchResultBox