import { useEffect } from 'react'
import './App.css'
import { Outlet } from 'react-router-dom'
import { useDispatch ,useSelector} from 'react-redux'
import axios from 'axios'
import {login,logout}  from './features/auth/state/authSlice'
import { connectSocket, disconnectSocket, getSocket } from './socket/socketClient'
function App() {
  const dispatch=useDispatch()
  useEffect(()=>{
      axios.get('/api/user/getProfile').then((res)=>{
        dispatch(login({
          userData:{
                name:res.data.name,
                email:res.data.email
            }
        }))
       
      }).catch(()=>{
        dispatch(logout());
      })
    
    
  },[])
  
  return (
    <>
      <div className='bg-cover bg-center bg-fixed min-h-screen' style={{backgroundImage:"url('/images/backimage.jpg')"}}>
          <Outlet/>
      </div>
    </>
  )
}
export default App

