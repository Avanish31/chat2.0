import React from 'react'
import { clearSelectedMedia, setUploadQueue ,addUploadQueue} from '../state/media'
import { useDispatch, useSelector } from 'react-redux'
import { setMediaStore ,addMediaStore} from '../state/media';
import { getImageThumbnail, getPdfThumbnail, getVideoPreview, getVideoThumbnail } from '../services/generatePreview';
import { getFile } from '../services/file';
import { clearFiles } from '../services/file';
import { addMessages ,addLastMessage} from '../state/chat';
import { getSocket } from '../../../socket/socketClient';
import { setFile } from '../services/indexedDbServices';
import { blobToBase64 } from '../services/generatePreview';
import axios from 'axios';
const DEFAULT_CHUNK_SIZE=64*1024;
function SendMedia() {
  const dispatch=useDispatch();
  const selectedMedia=useSelector(state=>state.media.selectedMedia);
  const byId=selectedMedia.byId;
  const allIds=selectedMedia.allIds;
  const conversationId=useSelector(state=>state.chat.selectedConversationId);
  const selectedUserId=useSelector(state=>state.chat.selectedUserId);
  let receiverId=[selectedUserId];
  const user=useSelector(state=>state.auth.userData);
  const senderId=user?.id;
  const conversations=useSelector(state=>state.chat.conversations);
  const conversationType=useSelector(state=>state.chat.selectedConversationType);
  if(conversations[selectedUserId] && conversationType=="group"){
        const participants=conversations[selectedUserId].participants;
        receiverId=participants.filter(id=>id!=senderId);
  }
  let blocked=false;
  const friends=useSelector(state=>state.chat.friends);
  if(conversationType=="dm"){
      blocked=friends?.byId[selectedUserId]?.blockedYou ?? false;
  }
  const socket=getSocket();
  const handleUpload=async()=>{
      for(const id of allIds){
          if(byId[id].validationErrors.length==0){
            const file=getFile(id);
            const totalChunks = Math.ceil(byId[id].size / DEFAULT_CHUNK_SIZE);  
            let thumbnail=null;
            let pageCount=0;
            let duration=0;
            let resolution=null;
            console.log("EXTENSION "+byId[id].extension);
            switch (byId[id].category) {
                case "image":
                    const res=await getImageThumbnail(file);
                    thumbnail=await blobToBase64(res.preview);
                    break;

                case "video": {
                    const res=await getVideoThumbnail(file);
                    thumbnail=await blobToBase64(res.preview);
                    duration=res.duration;
                    resolution={
                        width:res.width,
                        height:res.height
                    }
                    break;
                }
                case "document":
                    if (byId[id].type === "pdf") {
                     const res=await getPdfThumbnail(file);
                     thumbnail=await blobToBase64(res.preview);
                     pageCount=res.pages
                    } 
                    break;
            }

            dispatch(addMediaStore({
              mediaId:id,
              thumbnail:thumbnail,
              category:byId[id].category,
              mimeType:byId[id].mimeType,
              type:byId[id].type,
              name: byId[id].name,
              size: byId[id].size,
              caption:byId[id].caption,
              pages:byId[id].pages,
              extension:byId[id].extension,
              duration:duration,
              resolution: resolution
            }))
            await axios.post('/api/chat/uploadMedia',{
                mediaId: id,
                category: byId[id].category,
                fileName: byId[id].name,
                type:byId[id].type,
                mimeType: byId[id].mimeType,
                fileSize: byId[id].size,
                chunkSize:DEFAULT_CHUNK_SIZE ,
                uploadStatus:"pending",
                totalChunks: totalChunks,
                thumbnail:thumbnail,
                extension: byId[id].extension,
                pageCount: pageCount,
                duration:duration,
                resolution: resolution,
                caption:byId[id].caption
            })
            try{
          await setFile("uploadedFiles",id,file);
            }catch(err){
                console.log(err);
                throw(err);

            }
          const time = new Date();
          const tempId = crypto.randomUUID();
          dispatch(addMessages({
                  conversationId:conversationId,
                  senderId:senderId,
                  receiverId:receiverId,
                  message:id,
                  messageType:"media",
                  messageTime:time.toISOString(),
                  sendTime:time.toISOString(),
                  receiveTime:null,
                  createdAt:new Date().toISOString(),
                  status:false,
                  tempId:tempId,
                  deleteBy:[],
                  deletedForEveryOne:false,
                  dummy:false
          }))

          socket.emit(
    "preSaveMediaMessages",
    {
        conversationId,
        senderId,
        receiverId,
        message: id,
        messageType: "media",
        messageTime: time,
        conversationType,
        tempId,
        blocked,
        dummy: false
    },
    (response) => {

        if (!response?.success) {
            console.error(
                "Failed to pre-save media message:",
                response?.error
            );
            return;
        }

        
        dispatch(addUploadQueue({
            mediaId: id,
            status: "pending",
            uploadedBytes: 0,
            totalBytes: byId[id].size,
            error: null,
        }));

        if (conversationId) {
            dispatch(addLastMessage({
                lastMessage: `${byId[id].category} sent`,
                lastMessageStatus: false,
                lastSenderId: senderId,
                lastMessageTime: new Date().toISOString(),
                lastMessageWaitStatus:true,
                lastMessageId: tempId,
                id: conversationId
            }));
        }
    }
);
         
          }
      }
      clearFiles();
      dispatch(clearSelectedMedia());
  }
  return (
    <button className='h-8 w-8 absolute right-2' onClick={handleUpload}>
            <img src='/images/send.png' />
    </button>
  )
}

export default SendMedia