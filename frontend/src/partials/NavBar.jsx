import React from "react";
import { Link } from "react-router-dom";
import Logout from "../features/auth/components/Logout";
import ChatLink from "../features/auth/components/ChatLink";
function NavBar({user}) {
  
  return (
  <>
    <div className="flex justify-between items-center  ">
    <div>
      <Link to="/"><img className="w-28"src="/images/logo.png"/></Link>
    </div>
   
    <ul className="nav justify-content-end text-xl flex gap-8 font-bold font-oswald">
       
  <li className="nav-item " >
    
    <ChatLink/>
   
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