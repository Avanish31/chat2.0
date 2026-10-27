import {createSlice} from "@reduxjs/toolkit"

import { act } from "react";

const initialState={
    friends:{
    byId:{},
    allIds:[],
    },
    conversations:{
        byId:{},
        allIds:[]
    },
    chatMeta:{},
    messages:[],
    searchResult:null,
    selectedUserId:null,
    selectedConversationId:null,
    selectedConversationType:null,
    presence:{},
    userTyping:false,
    totalNotification:0,
    deleteMode:false,
    deleteMessageConfirmation:false,
    selectedMessagesDeletion:[],
    deleteForEveryOneEnabler:0,
    forwardMode:false,
    forwardConversationSelectionMode:false,
    forwardSelectedMessages:[],
    forwardSelectedConversations:[]
    // onlineUsers:[]
}
const chatSlice=createSlice({
    name:'chat',
    initialState,
    reducers:{
        setFriends:(state,action)=>{
            const byId={};
            const allIds=[];
            action.payload.forEach(user=>{
                byId[user.id]=user
                allIds.push(user.id);
            })
            state.friends.byId=byId;
            state.friends.allIds=allIds;
            console.log(JSON.parse(JSON.stringify(state.friends)));
        },
        setChatMeta:(state,action)=>{
             const chatMeta={};
             action.payload.forEach(userMeta=>{
                chatMeta[userMeta.id]=userMeta
             })
             state.chatMeta=chatMeta;
        },
        addLastMessage:(state,action)=>{
            console.log("last mesage ",action.payload.lastMessage);
            state.chatMeta[action.payload.id].lastMessage=action.payload.lastMessage
            state.chatMeta[action.payload.id].lastMessageTime=new Date().toISOString()
            state.chatMeta[action.payload.id].lastMessageStatus=action.payload.lastMessageStatus,
            state.chatMeta[action.payload.id].lastSenderId=action.payload.lastSenderId,
            state.chatMeta[action.payload.id].lastMessageId=action.payload.lastMessageId;
            
            if(state.chatMeta[action.payload.id]?.lastMessageWaitStatus!=null && action.payload?.lastMessageWaitStatus!=null){
                state.chatMeta[action.payload.id].lastMessageWaitStatus=action.payload?.lastMessageWaitStatus;
            }
        },
        addChatMeta:(state,action)=>{
            state.chatMeta[action.payload.id]=action.payload;
            console.log("added  chatmeta ");
        },
        addFriend:(state,action)=>{
            console.log("freind added");
            const user=action.payload;
            state.friends.byId[user.id]=user;
            state.friends.allIds.push(user.id);
        },
        setSelectedUserId:(state,action)=>{
            console.log("triggered")
            state.selectedUserId=action.payload;
            console.log(action.payload);
        },
        setSearchResult:(state,action)=>{
            console.log("reducer hit")
            state.searchResult=action.payload;
        },
        setMessages:(state,action)=>{
            state.messages=action.payload;
            state.messages.forEach(msg=>{
                console.log(JSON.parse(JSON.stringify(msg)));
            })
        },
        addMessages:(state,action)=>{
            console.log("addMessage fired");
            state.messages.push(action.payload);
            state.messages.forEach(msg=>{
                console.log(JSON.parse(JSON.stringify(msg)));
            })
        },
        addPresence:(state,action)=>{
            console.log("adding Presnece " + action.payload.id);
            state.presence[action.payload.id]=action.payload;
            console.log("Reducer state:", state.presence);
        },
        setConversations:(state,action)=>{
            const byId={};
            const allIds=[];
            action.payload.forEach(conversation=>{
                byId[conversation.id]=conversation
                allIds.push(conversation.id);
            })
            state.conversations.byId=byId;
            state.conversations.allIds=allIds;
        },
        addConversations:(state,action)=>{
            console.log("addConversation fired");
            const conversation=action.payload;
            state.conversations.byId[conversation.id]=conversation;
            state.conversations.allIds.push(conversation.id);
            console.log(JSON.parse(JSON.stringify(state.conversations)));
        },
        setSelectedConversationId:(state,action)=>{
            state.selectedConversationId=action.payload;
            console.log(" selectedConversationId "+ state.selectedConversationId);
        },
        setSelectedConversationType:(state,action)=>{
            state.selectedConversationType=action.payload;
        },
        updateMessageStatus:(state,action)=>{
            console.log("status fired");
            state.messages.forEach((msg)=>{
                if(msg.senderId==action.payload.id && msg.receiveTime!=null){
                    let blocked=false;
                     for(const interval of action.payload.intervals){
                        const end=interval.unblockedAt??new Date(8640000000000000);
                        console.log(interval.blockedAt+" "+end+" "+new Date(msg.createdAt));

                        if(msg.receiveTime>=interval.blockedAt && msg.receiveTime<=end){
                            console.log("bockeeeeeed");
                          blocked=true;
                          break;
                        }
                    }
                    if(!blocked){
                        msg.status=true;
                    }
                    
                }
            })
           
        },
        updateChatMeta:(state,action)=>{
            state.chatMeta[action.payload].unreadCount=state.chatMeta[action.payload].unreadCount+1;
            console.log("update chat meta "+ state.chatMeta[action.payload].unreadCount);
        },
        clearUnreadCount:(state,action)=>{
            console.log(action.payload);
            console.log(state.chatMeta[action.payload]);
            console.log(JSON.parse(JSON.stringify(state.chatMeta)));
            state.chatMeta[action.payload].unreadCount=0
        },
        updateLastMessageStatus:(state,action)=>{
            console.log("updateLastMessageStatus fired",action.payload.conversationId);
            let blocked=false;
            const lastMessageId=state.chatMeta[action.payload.conversationId].lastMessageId;
            console.log('last',lastMessageId);
            const message=state.messages.find(msg=>(msg._id.toString()==lastMessageId || msg?.tempId==lastMessageId));
            if(action.payload?.lastMessageRecieveTime!=null){
            for(const interval of action.payload.intervals){
                const end=interval.unblockedAt??new Date(8640000000000000);
                    if(action.payload.lastMessageRecieveTime>=interval.blockedAt && action.payload?.lastMessageRecieveTime<=end){
                          blocked=true;
                          break;
                    }
                }
                if(!blocked){
                    state.chatMeta[action.payload.conversationId].lastMessageStatus=true;
                }
                else{
                    
                     state.chatMeta[action.payload.conversationId].lastMessageStatus=false;
                }
            }
            
            
        },
        updateMessageId:(state,action)=>{
            console.log("message saved");
            const messages=state.messages.find(msg=>msg.tempId==action.payload.tempId);
            if(messages){
                console.log("IWI-TAVOR",messages.tempId,"  " ,action.payload.tempId);
                messages._id=action.payload.messageId
            }
            for(const [cid,conv] of Object.entries(state.chatMeta)){
                console.log("HK-416 ",conv.lastMessageId," " ,action.payload.tempId);
                if(conv.lastMessageId==action.payload.tempId){
                    state.chatMeta[cid].lastMessageId=action.payload.messageId;
                }
            }
            state.messages.forEach(msg=>{
                console.log(JSON.parse(JSON.stringify(msg)));
            })
        },
        updateUserTyping:(state,action)=>{
            state.userTyping=action.payload;
        },
        updateChatMetaTypingStatus:(state,action)=>{
            state.chatMeta[action.payload.conversationId].isTyping=action.payload.status;
        },
        setTotalNotification:(state,action)=>{
            state.totalNotification=action.payload;
        },
        updateTotalNotificationCount:(state,action)=>{
            state.totalNotification=state.totalNotification+1;
        },
        updateDeleteMode:(state,action)=>{
            state.deleteMode=action.payload;
        },
        updateDeleteMessageConfirmation:(state,action)=>{
            state.deleteMessageConfirmation=action.payload;
        },
        updateSelectedMessagesDeletion:(state,action)=>{
            state.selectedMessagesDeletion.push(action.payload);
        },
        removeSelectedMessagesDeletion:(state,action)=>{
            state.selectedMessagesDeletion=state.selectedMessagesDeletion.filter(id=>id!==action.payload);
        },
        clearSelectedMessagesDeletion:(state,action)=>{
            state.selectedMessagesDeletion=[];
        },
        updateDeleteForEveryOneEnabler:(state,action)=>{
            state.deleteForEveryOneEnabler=state.deleteForEveryOneEnabler+action.payload;
        },
        clearDeleteForEveryOneEnabler:(state,action)=>{
            state.deleteForEveryOneEnabler=0;
        },
        deleteMessageForMe:(state,action)=>{
            state.selectedMessagesDeletion.forEach((id)=>{
                state.messages.forEach((msg)=>{
                    if(msg._id===id){
                        msg.deleteBy.push(action.payload);
                       
                    }
                })
            })
        },
        deleteMessageForEveryOne:(state,action)=>{
            action.payload.forEach((id)=>{
                state.messages.forEach((msg)=>{
                    if(msg._id===id){
                        msg.deletedForEveryOne=true;
                    
                    }
                })
            })
        },
        updateLastMessageContent:(state,action)=>{
            state.chatMeta[action.payload].lastMessage="This message was deleted";
        },
        updateLastMessageDeleteForMe:(state,action)=>{
            console.log('jijutsu kaisen');
            let lastMessage=null;
            let lastMessageId=null;
            let lastMessageTime=null;
            let lastMessageStatus=null;
            let lastSenderId=null;
            let lastMessageWaitStatus=null;
            // state.messages.forEach((msg)=>{
            //     if(!msg.deleteBy.includes(action.payload.userId)){
            //         console.log("yessssssssss");
            //         lastMessage=msg.message;
            //         lastMessageId=msg._id;
            //         lastMessageTime=msg.createdAt;
            //         lastMessageWaitStatus=msg.receiveTime==null?true:false;
            //         lastSenderId=msg.senderId;
            //         lastMessageStatus=msg.status;
                    
            //     }
            // })
            const msg=action.payload.msg;
            if(msg!=null){
                lastMessage=msg.message;
                lastMessageId=msg._id;
                lastMessageTime=msg.createdAt;
                lastMessageWaitStatus=msg.receiveTime==null?true:false;
                lastSenderId=msg.senderId;
                lastMessageStatus=msg.status;
            }
            console.log("MESSAGE CONTENT ",action.payload.category," ",lastMessage);
            if(msg && msg.deletedForEveryOne==true){
                lastMessage='This message was deleted';
            }
            else if(action.payload.category!=null && lastMessageId!=null){
                if(lastSenderId==action.payload.userId){
                    lastMessage=`${action.payload.category} sent`
                }
                else{
                    lastMessage=`${action.payload.category} received`
                }
            }
            state.chatMeta[action.payload.conversationId].lastMessage=lastMessage;
            state.chatMeta[action.payload.conversationId].lastMessageId=lastMessageId;
            state.chatMeta[action.payload.conversationId].lastMessageTime=lastMessageTime;
            state.chatMeta[action.payload.conversationId].lastSenderId=lastSenderId;
            state.chatMeta[action.payload.conversationId].lastMessageStatus=lastMessageStatus;
            if(state.chatMeta[action.payload.conversationId]?.lastMessageWaitStatus!=null && lastMessageWaitStatus!=null){
                state.chatMeta[action.payload.conversationId].lastMessageWaitStatus=lastMessageWaitStatus
            }
            console.log(lastMessage+" "+lastMessageId+" "+lastMessageTime+" "+lastSenderId+" "+lastMessageStatus);
            console.log(action.payload.userId+" "+action.payload.conversationId);
        },
        updateYouBlockstatus:(state,action)=>{
            state.friends.byId[action.payload.id].youBlocked=action.payload.status;
        },
        updateBlockedYoustatus:(state,action)=>{
            console.log("unblockeed");
            console.log(action.payload.status+" "+action.payload.id);
            state.friends.byId[action.payload.id].blockedYou=action.payload.status;
            console.log(JSON.parse(JSON.stringify(state.friends)));
        },
        updateReceiveTimeMessage:(state,action)=>{
            state.messages.forEach((msg)=>{
                if(msg.message==action.payload.id){
                    msg.receiveTime=action.payload.time
                }
            })
        },
        updateLastMessageWaitStatus:(state,action)=>{
            state.chatMeta[action.payload.conversationId].lastMessageWaitStatus=action.payload.status
            
        },
        addSelectedForwardMessages:(state,action)=>{
            state.forwardSelectedMessages.push(action.payload);
            console.log("addSelectedForwardMessages ",JSON.parse(JSON.stringify(state.forwardSelectedMessages)));

        },
        addSelectedForwardConversations:(state,action)=>{
            state.forwardSelectedConversations.push(action.payload);
            console.log("addSelectedForwardConversations ",JSON.parse(JSON.stringify( state.forwardSelectedConversations)));
        },
        removeSelectedForwardMessages:(state,action)=>{
            state.forwardSelectedMessages=state.forwardSelectedMessages.filter(id=>id!==action.payload);
        },
        clearSelectedForwardMessages:(state,action)=>{
            console.log("clearSelectedForwardMessages")
            state.forwardSelectedMessages=[];
        },
        removeSelectedForwardConversations:(state,action)=>{
            state.forwardSelectedConversations=state.forwardSelectedConversations.filter(id=>id!==action.payload);
        },
        clearSelectedForwardConversations:(state,action)=>{
            state.forwardSelectedConversations=[];
        },
        updateForwardMode:(state,action)=>{
            state.forwardMode=action.payload;
        },
        updateForwardConversationSelectionMode:(state,action)=>{
            state.forwardConversationSelectionMode=action.payload;
        }

       
    }
})
export const {
setFriends,setChatMeta,addFriend,setSelectedUserId,setSearchResult,setMessages,addMessages,addPresence,
addLastMessage,addChatMeta,setConversations,addConversations,setSelectedConversationId,
setSelectedConversationType,updateMessageStatus,updateChatMeta,clearUnreadCount,updateLastMessageStatus,
updateMessageId,updateUserTyping,updateChatMetaTypingStatus,updateTotalNotificationCount,setTotalNotification,
updateDeleteMode,updateDeleteMessageConfirmation,updateSelectedMessagesDeletion,removeSelectedMessagesDeletion,
clearSelectedMessagesDeletion,updateDeleteForEveryOneEnabler,deleteMessageForMe,deleteMessageForEveryOne,updateLastMessageContent,
updateLastMessageDeleteForMe,clearDeleteForEveryOneEnabler,updateYouBlockstatus,updateBlockedYoustatus,updateReceiveTimeMessage,updateLastMessageWaitStatus,
addSelectedForwardMessages,addSelectedForwardConversations,removeSelectedForwardMessages,clearSelectedForwardMessages,removeSelectedForwardConversations,
clearSelectedForwardConversations,updateForwardMode,updateForwardConversationSelectionMode
}=chatSlice.actions;
export default chatSlice.reducer;