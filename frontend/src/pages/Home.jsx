import  { useState } from 'react'
import NavBar from '../partials/NavBar';
import  Container  from '../partials/Container';
import { useSelector } from 'react-redux';
function Home() {
    const user=useSelector((state)=>state.auth.userData);
    console.log(user);
  return (
      <>
      <NavBar user={user}/>
      <Container>
      <div className="w-full min-h-screen  flex justify-center items-center">
          <div className=" min-w-[435px] w-1/2 h-[435px]   flex items-center gap-2">
          <div className=" w-1/2  flex justify-center items-center ">
              <img src="/images/logo.png"/>
          </div>
          <div>

          <p className="font-oswald font-bold text-6xl text-white">{user?"Welcome Back":"Get started"}</p>
          <p className="font-oswald font-bold text-6xl mt-4 text-white">{user?`${user.name}`:"Let's Chat"}</p>
          </div>
          </div> 
      </div>
      </Container>
      </>
   
  )
}

export default Home