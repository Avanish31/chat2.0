import axios from 'axios';
import { useSelector } from 'react-redux';
import store from '../../../store';
import { getVideoPreview } from './generatePreview';
import { getMediaFile } from './indexedDbServices';
import { updateStatusUploadQueue,updateBytesUploadQueue,setUploadedBytes} from '../state/media';
import { addLastMessage } from '../state/chat';
import { useDispatch } from 'react-redux';
import { Controller } from 'react-hook-form';
import { scheduleQueue } from './scheduler';
import { getCacheStatus,updateCacheStatus } from './indexedDbServices';
import { getSocket } from '../../../socket/socketClient';
import { saveUploadAbortController } from './abortController';
const DEFAULT_CHUNK_SIZE=64*1024;
export async function startupload(mediaId){
    const state = store.getState();
    const conversationId=state.chat.selectedConversationId;
    const userData=state.auth.userData;
    const senderId=userData?.id;
    const selectedUserId=state.chat.selectedUserId;
    const conversationType=state.chat.selectedConversationType
    const conversations=state.chat.conversations;
    const mediaStore=state.media.MediaStore;
    const friends=state.chat.friends
    let receiverId=[selectedUserId];
    let tempId =null;
    if(conversations[selectedUserId]){
        const participants=conversations[selectedUserId].participants;
        receiverId=participants.filter(id=>id!=senderId);
    }
    const time = new Date().toLocaleTimeString([], {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    }).toLowerCase();
    let blocked=false;
    if(conversationType=="dm"){
        blocked=friends?.byId[selectedUserId]?.blockedYou ?? false;
    }
    const socket=getSocket();
    const controller=new AbortController();
    saveUploadAbortController(mediaId,controller);
    store.dispatch(updateStatusUploadQueue({
        mediaId:mediaId,
        status:"uploading"
    }))
    const messages=state.chat.messages;
    messages.forEach(msg => {
            if(msg.message==mediaId){
                tempId=msg.tempId
            }
    });
    await axios.get(`/api/chat/updateUploadStatus/${mediaId}`);
    try{
        await uploadFile(mediaId,controller.signal);
        console.log("CONVERSSSATIONID",conversationId);
        socket.emit('sendMessage',{
            conversationId:conversationId,
            senderId:senderId,
            receiverId:receiverId,
            message:mediaId,
            messageType:"media",
            messageTime:time,
            conversationType:conversationType,
            tempId:tempId,
            blocked:blocked,
            dummy:false
        })
        store.dispatch(updateStatusUploadQueue({
            mediaId:mediaId,
            status:"completed"
        }))
        

    }catch(err){
        if(controller.signal.aborted){
           return;
        }
        else{
            store.dispatch(updateStatusUploadQueue({
                mediaId:mediaId,
                status:"failed"
            }))
        }
        await axios.get(`/api/chat/markUploadFailed/${mediaId}`);
        
    }
    finally{
        scheduleQueue({
        queueType: "upload",
        maxParallel: 3,
        activeStatus: "uploading",
        startTask: startupload
        });
    }
}

async function uploadFile(mediaId,signal){
    console.log("UPLOAD FILE TRIGERRED");
    const res=await getCacheStatus("uploadedFiles",mediaId);
    console.log("CACHED STATUS "+res);
    if(res){
        const document=await getMediaFile("uploadedFiles",mediaId);
       
        const file=document.file;
        console.log("trying to hittt");
        const rs=await axios.get(`/api/chat/getLargestUploadedChunkIndex/${mediaId}`);
        console.log("response by backend "+rs);
        const largestChunkIndex=rs.data.index;
        const totalChunks=rs.data.totalChunks;
        const startChunk = largestChunkIndex + 1;
        console.log("STARTCHUNK ",startChunk);
        console.log("totalChunk "+totalChunks);
        const uploadedBytes = Math.min((largestChunkIndex + 1) * DEFAULT_CHUNK_SIZE,file.size);
        store.dispatch(setUploadedBytes({
            mediaId:mediaId,
            uploadedBytes:uploadedBytes
        }))
        console.log("ABOUT TO ENTER LOOP");
        for (let chunkIndex = startChunk; chunkIndex < totalChunks; chunkIndex++) {
             console.log("chunks getting uploaded "+chunkIndex);
            if (signal.aborted) {
                throw new DOMException("Aborted", "AbortError");
            }
            const start = chunkIndex * DEFAULT_CHUNK_SIZE;
            const end = Math.min(start + DEFAULT_CHUNK_SIZE, file.size);
            const chunk = file.slice(start, end);
            const chunkSize=end-start
            const formData = new FormData();
            formData.append("mediaId", mediaId);
            formData.append("chunkIndex", chunkIndex);
            formData.append("chunk", chunk);
            await axios.post(
                "/api/chat/mediaChunks",
                formData,
                {signal}
            );
            console.log(
                "reacheddd"
            )
            store.dispatch(updateBytesUploadQueue({
                mediaId:mediaId,
                chunkSize:chunkSize
            }));
        }
    }
}
