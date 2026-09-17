import { useEffect } from 'react'
import './App.css'
import { Outlet } from 'react-router-dom'
import { useDispatch ,useSelector} from 'react-redux'
import axios from 'axios'
import {login,logout}  from './features/auth/state/authSlice'
import { initSocket } from './socket/socketEvent'
import { connectSocket, disconnectSocket } from './socket/socketClient'
import { resetSocketInit } from './socket/socketEvent'
import { cleanupIndexedDB } from './features/chat/services/indexedDbServices'
function App() {
  const dispatch=useDispatch()
  const selectedUserId=useSelector((state)=>state.chat.selectedUserId);
  useEffect(()=>{
      axios.get('/api/user/getProfile').then((res)=>{
        dispatch(login({
          userData:{
                name:res.data.name,
                email:res.data.email,
                id:res.data.id
            }
        }))
        
       
      }).catch(()=>{
        dispatch(logout());
      })
    
    
  },[])
  const userData=useSelector((state)=>state.auth.userData);
  const friends=useSelector(state=>state.chat.friends);
  const conversationId=useSelector(state=>state.chat.selectedConversationId);
  const realTimeData=useSelector(state=>state.chat.realTimeData);
  const message=useSelector(state=>state.chat.messages);
  const mediaStore=useSelector(state=>state.media.MediaStore); 
  console.log(mediaStore);
  console.log(message)
  console.log("conversationId "+conversationId);
  useEffect(()=>{
    if(userData){
      const socket=connectSocket();
      initSocket(socket,dispatch);
    }
    else{
      disconnectSocket();
      resetSocketInit();
    }
  },[userData])
  const deleteForEveryOneEnabler=useSelector(state=>state.chat.deleteForEveryOneEnabler);
  console.log(deleteForEveryOneEnabler)
  useEffect(() => {
    cleanupIndexedDB();
}, []);
  return (
    <>
      <div className='bg-cover bg-center bg-fixed min-h-screen' style={{backgroundImage:"url('/images/backimage.jpg')"}}>
          <Outlet/>
      </div>
    </>
  )
}
export default App

