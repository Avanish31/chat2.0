import { useEffect } from 'react'
import './App.css'
import { Outlet } from 'react-router-dom'
import { useDispatch ,useSelector} from 'react-redux'
import axios from 'axios'
import {login,logout}  from './features/auth/state/authSlice'
import { initSocket } from './socket/socketEvent'
import { connectSocket, disconnectSocket } from './socket/socketClient'
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
  console.log("selecteduserId "+selectedUserId);
  const realTimeData=useSelector(state=>state.chat.realTimeData);

  
  useEffect(()=>{
    if(userData){
      const socket=connectSocket();
      initSocket(socket,selectedUserId,dispatch,friends);
    }
    else{
      disconnectSocket()
    }
  },[userData])
  
  return (
    <>
      <div className='bg-cover bg-center bg-fixed min-h-screen' style={{backgroundImage:"url('/images/backimage.jpg')"}}>
          <Outlet/>
      </div>
    </>
  )
}
export default App

