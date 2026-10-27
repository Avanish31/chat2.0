import axios from 'axios'
import { addMediaStore,addUploadQueue,clearSelectedMedia } from '../state/media';
import { addMessages,addLastMessage, setSelectedConversationId } from '../state/chat';
import { getImageThumbnail,getPdfThumbnail,getVideoThumbnail,blobToBase64 } from './generatePreview';
import { getFile,clearFiles } from './file';
import { setFile } from './indexedDbServices';
import store from '../../../store';
const DEFAULT_CHUNK_SIZE = 64 * 1024;
export default async function sendMediaHelper({
        allIds,
        byId,
        dispatch,
        conversationId,
        senderId,
        receiverId,
        conversationType,
        socket,
        forwardMode=false
    }){
        
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
          const selectedConversationId=store.getState().chat.selectedConversationId;
          if(conversationId==selectedConversationId){
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
        }
        if(forwardMode){
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
        const friends=store.getState().chat.friends;
        let blocked=false;
          if(conversationType=="dm"){
            blocked=friends?.byId[receiverId[0]]?.blockedYou ?? false;
          }
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
            conversationId:conversationId,
            conversationType:conversationType,
            forwardMode:forwardMode
        }));

        if (conversationId && !forwardMode) {
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