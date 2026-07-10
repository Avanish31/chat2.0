import React from "react";
import { Link } from "react-router-dom";
import Logout from "../features/auth/components/Logout";
import ChatLink from "../features/auth/components/ChatLink";
import { useDispatch, useSelector } from "react-redux";
import { useEffect ,useState} from "react";
import { setTotalNotification } from "../features/chat/state/chat";
import axios from "axios";
function NavBar({user}) {
  const chatMeta=useSelector(state=>state.chat.chatMeta);
  const userData=useSelector((state)=>state.auth.userData);
  const userId=userData?.id;
  const notificationCount=useSelector((state)=>state.chat.totalNotification);
  const dispatch=useDispatch();
  useEffect(()=>{
    if(!userId){
      return;
    }
    const fetchNotification=async()=>{
        const res=await axios.get(`api/chat/getNotification/${userId}`);
       dispatch(setTotalNotification(res.data.notificationCount));
    }
    fetchNotification();
 
  },[notificationCount,userData,dispatch])
  return (
  <>
    <div className="flex justify-between items-center  ">
    <div>
      <Link to="/"><img className="w-28"src="/images/logo.png"/></Link>
    </div>
   
    <ul className="nav justify-content-end text-xl flex gap-8 font-bold font-oswald">
       
  <li className="nav-item  flex" >
    
    <ChatLink/>
     {notificationCount!=0?<span className=" -top-1 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-blue-800 text-xs font-bold text-white">{notificationCount}</span>:null}
  </li>
  {!user?
  <>
  <li className="nav-item">
    <Link className="  text-white" to="/signin">Signin</Link>
  </li>
  <li className="nav-item">
    <Link className=" text-white" to="/signup">Signup</Link>
  </li>
  </>
  :
  <>
  <li className="nav-item">
    <Link className="  text-white" to="/analytics">Analytics</Link>
  </li>
  <li className="nav-item">
    <Link className=" text-white" to="/profile">{user.name}</Link>
  </li>
  </>
  }
  {user &&
  <li className="nav-item mr-3">
    <Logout/>
  </li>
  }
 
</ul>
</div>

</>
  );
}

export default NavBar;