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
    presence:{}
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
            state.chatMeta[action.payload.id].lastMessage=action.payload.lastMessage
            state.chatMeta[action.payload.id].lastMessageTime=new Date().toISOString()
        },
        addChatMeta:(state,action)=>{
            state.chatMeta[action.payload.id]=action.payload;
        },
        addFriend:(state,action)=>{
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
          console.log(state.messages);
        
        },
        addMessages:(state,action)=>{
            console.log("addMessage fired");
            state.messages.push(action.payload);
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
        }
    }
})
export const {setFriends,setChatMeta,addFriend,setSelectedUserId,setSearchResult,setMessages,addMessages,addPresence,addLastMessage,addChatMeta,setConversations,addConversations,setSelectedConversationId,setSelectedConversationType}=chatSlice.actions;
export default chatSlice.reducer;