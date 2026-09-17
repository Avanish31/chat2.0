import React, { useEffect, useState } from 'react'
import { useParams,useSearchParams } from 'react-router-dom'
import LastSeen from './LastSeen'
import Block from './Block'
import DeleteChat from './DeleteChat'
import ChatWindow from './ChatWindow'
import SendMessage from './SendMessage'
import {useSelector} from 'react-redux'
import { useDispatch } from 'react-redux'
import axios from 'axios'
import {fetchData} from '../services/newChatHandle'
import { addPresence, setSelectedUserId,setMessages ,setSelectedConversationType,setSelectedConversationId,clearUnreadCount} from '../state/chat'
import { getSocket } from '../../../socket/socketClient'
import SmallPreview from './SmallPreview'
import SendMedia from './SendMedia'
import LargePreview from './LargePreview'
import { clearFiles } from '../services/file'
import { updateCaption ,clearSelectedMedia, addMediaStore} from '../state/media'
function MainBar() {
  const [conv,setConv]=useState(null);
  const {id}=useParams();
  const [searchParams] = useSearchParams();
  const type = searchParams.get("type");
  const dispatch=useDispatch();
  const friends=useSelector(state=>state.chat.friends);
  const userData=useSelector((state)=>state.auth.userData);
  const userId=userData?.id;
  const conversations=useSelector(state=>state.chat.conversations);
  const conversationId=useSelector(state=>state.chat.selectedConversationId)
  const chatMeta=useSelector(state=>state.chat.chatMeta);
  console.log("yeag "+conversationId)
  const cbyId=conversations.byId;
  const fbyId=friends.byId;
  const userTyping=useSelector(state=>state.chat.userTyping);
  const youblocked=friends?.byId[id]?.youBlocked ?? false;
    console.log(friends?.byId[id]?.name+" has been blocked "+youblocked);
 useEffect(() => {
  console.log("inside useffect");
  dispatch(setSelectedUserId(id));
  dispatch(setSelectedConversationType(type));
  console.log(friends);
  if(fbyId[id] && type=="dm"){
    dispatch(setSelectedConversationId(fbyId[id]?.conversationId));
    setConv({
      name:fbyId[id].name,
      profileImage:fbyId[id].profileImage
    });
  }
  else if(cbyId[id] && type=="group"){
    dispatch(setSelectedConversationId(id));
    setConv({
      name:cbyId[id].groupName,
      profileImage:cbyId[id].groupProfilePhoto
    });
  }
  else{
  dispatch(setSelectedConversationId(null));
  const loadUser = async () => {
    if (id && type=="dm") {
      console.log("inside loadUser");
      const data = await fetchData(id);
      console.log(data);
      setConv(data); 
    }
  };
  loadUser();
}
  const loadRealTimeData=async()=>{
    const res=await axios.get(`/api/chat/status/${id}`);
    if(res.data.status){
      dispatch(addPresence({
        id:id,
        status:true,
        lastseen:null
      }))
    }
    else{
      await axios.get(`/api/user/lastseen/${id}`).then((res)=>{
          dispatch(addPresence({
              id:id,
              status:false,
              lastseen:res.data.lastseen
          }))
      })
    }
  }
  if(type=="dm"){
  loadRealTimeData();
  }
  dispatch(clearSelectedMedia());
}, [id,friends,conversations,dispatch]);
console.log(conversationId);

useEffect(() => {
    // if (conversationId) {
    //     axios
    //         .get(`/api/chat/getMessages/${conversationId}?id=${id}&type=${type}`)
    //         .then(async(res) => {
    //             dispatch(setMessages(res.data.messages));
    //             const messages=res.data.messages;
    //             const mediaMessags=messages.filter((msg)=>msg.messageType==="media");
    //             for(const media of mediaMessags){
    //               const mediaDetails=await axios.get(`/api/chat/getMediaDetails/${media.message}`);
    //               dispatch(addMediaStore(mediaDetails.data));
    //             }
    //         });
        
    // } else {
    //     dispatch(setMessages([]));
    // }
    
    if (!conversationId) {
        dispatch(setMessages([]));
        return;
    }
    const controller = new AbortController();
    const loadMessages = async () => {
        try {
            const res = await axios.get(
                `/api/chat/getMessages/${conversationId}?id=${id}&type=${type}`,
                { signal: controller.signal }
            );

            const messages = res.data.messages;
            const mediaMessages = messages.filter(
                (msg) => msg.messageType === "media"
            );

            const mediaDetails = await Promise.all(
                mediaMessages.map((media) =>
                    axios.get(
                        `/api/chat/getMediaDetails/${media.message}`,
                        { signal: controller.signal }
                    )
                )
            );
            console.log(mediaDetails);
            mediaDetails.forEach((res) => {
                console.log("MediaDetails through main  bar");
                console.log(res.data);
                dispatch(addMediaStore(res.data));
            });
            dispatch(setMessages(messages));
        } catch (error) {
            if (error.code !== "ERR_CANCELED") {
                console.error("Failed to load conversation:", error);
            }
        }
    };

    loadMessages();

    return () => {
        controller.abort();
    };

    //[friends,conversations,conversationId]
}, [conversationId]);
useEffect(() => {
    if (!conversationId) return;

    if (!chatMeta[conversationId]) return;

    const socket = getSocket();
    const participants=conversations.byId[conversationId].participants.filter(id=>id!==userId);
  if(!youblocked){
      console.log("conversation opennned "+conversationId);
    socket.emit("openedConv", {
        conversationId,
        conversationType: type,
        participants:participants
    });
    }

    dispatch(clearUnreadCount(conversationId));
}, [conversationId, chatMeta, type]);
useEffect(() => {
    return () => {
      dispatch(setSelectedConversationId(null));
      dispatch(setSelectedConversationType(null));
      dispatch(setSelectedUserId(null));
      
    };
  }, []);
const presence=useSelector(state=>state.chat.presence);
const lastseen=presence[id]?.lastseen;
const status=presence[id]?.status;
const blocked=friends?.byId[id]?.blockedYou ?? false;
const previewMode=useSelector(state=>state.media.previewMode);
const selectedMedia=useSelector(state=>state.media.selectedMedia);
const mbyId=selectedMedia.byId;
const mallIds=selectedMedia.allIds;
const selectedPreview=useSelector(state=>state.media.selectedPreview);
console.log(mallIds);
console.log(selectedPreview);
console.log("blocked status "+blocked);

  return (
    <div className='w-[65%] h-screen text-white bg-[#0B141A] flex flex-col'>
      {(conv)?(
        <>
      <div className='w-full h-[10%]  bg-[#161717] border-b border-b-blue-400  flex '>
        <div className=' w-[60%] flex items-center gap-2 '>
          {!blocked?<img className="w-16 h-16 rounded-full" src={conv.profileImage}/>:<img className="w-16 h-16 rounded-full" src='/images/blockedProfilePhoto.png'/>}
          <div className='flex flex-col justify-center'>
            <p>{conv.name}</p>
            
          {!blocked?(type=="dm" && userTyping?<p className="text-[#25D366] font-medium">typing...</p>:(<>{!status&& lastseen?<>{lastseen}</>:null}</>)):null}
          </div>
        </div>
        <div className=' w-[40%] flex items-center justify-evenly  '>
         {
            type === "dm" ? (
              <>
                {!blocked?(status ? (
                  <img className="w-8 h-8 rounded-full" src="/images/online.png" />
                ) : (
                  <img className="w-8 h-8 rounded-full" src="/images/offline.png" />
                )):null}
                {conversationId && !previewMode && <Block />}
              </>
            ) : null
          }
          {!previewMode &&<DeleteChat />}
        </div>
      </div>
      {!previewMode?(<><ChatWindow /> <SendMessage/></>):
      <>
      <div className='w-[100%] h-screen text-white bg-[#0B141A] flex flex-col justify-evenly'>
        <div className='relative h-[15%] flex flex-col justify-center items-center'>
          <button className="absolute top-2 left-2" onClick={()=>{dispatch(clearSelectedMedia()); clearFiles();}}>
            <img src="/images/cross.png" className="h-5 w-5" alt="Close" />
          </button>

           <p>{mbyId[selectedPreview].name}</p>
           {mbyId[selectedPreview].pages && <p>{mbyId[selectedPreview].pages}</p>}
        </div>
        <div className='  h-[50%] flex justify-center items-center'>
          <div className={` h-[100%] w-[50%] flex justify-center items-center ${mbyId[selectedPreview].validationErrors.length>0?"border-4 border-red-500 rounded-lg":""}`}>
              <LargePreview icon={mbyId[selectedPreview].icon} category={mbyId[selectedPreview].category} type={mbyId[selectedPreview].type} preview={mbyId[selectedPreview].preview} validationErrors={mbyId[selectedPreview].validationErrors}/> 
          </div>
        </div>
        <form className='  h-[15%] flex justify-center items-center'>
         <input type='text' className='ml-[4px] rounded-md bg-[#161717] h-[40%] w-[80%] outline-none focus:outline-none focus:ring-0'
         value={mbyId[selectedPreview].caption}
         onChange={(e)=>{dispatch(updateCaption(e.target.value))}}
         ></input>
        </form>
        <div className='relative   h-[15%] flex justify-center items-center'>
          <div className='flex  gap-2'>
            {mallIds.map(mediaId=>(
              <SmallPreview  icon={mbyId[mediaId].icon}  selected={selectedPreview===mediaId} mediaId={mediaId} validationErrors={mbyId[mediaId].validationErrors}/>
            ))}
          </div>
          <SendMedia/>
          
        </div>
      </div>
      </>
      }
      
      </>
      ):(<div className='w-full  font-oswald font-bold text-6xl text-white h-[100%]  flex justify-center items-center'>
          START CHATING
      </div>)}
      
    </div>
  )
}

export default MainBar