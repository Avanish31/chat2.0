import {io} from "socket.io-client"
let socket=null;

export const connectSocket=()=>{
    if(!socket){
       socket=io("http://localhost:8005",{
        withCredentials: true
       });
    }
    return socket;
    
}
export const getSocket=()=>{
    if(socket){
        return socket;
    }
    return null;
}

export const disconnectSocket=()=>{
  
    if(socket){
        socket.disconnect();
        console.log("socket disconnected");
        socket=null;
    }
}