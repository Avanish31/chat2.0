import {createSlice} from "@reduxjs/toolkit"
import { act } from "react";
const initialState={
    friends:{
    byId:{},
    allIds:[],
    },
    chatMeta:{},
    messages:[],
    searchResult:null,
    selectedUserId:null,
    realTimeData:{
        status:false,
        lastseen:null
    },
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
                byId[user.id]=user,
                allIds.push(user.id);
            })
            state.friends.byId=byId;
            state.friends.allIds=allIds;
        },
        setChatMeta:(state,action)=>{
             const chatMeta={};
             action.payload.forEach(userMeta=>{
                chatMeta[userMeta.id]=userMeta
             })
             state.chatMeta=chatMeta;
        },
        addLastMessage:(state,action)=>{
            state.chatMeta[action.payload.id].lastMessage=action.payload.message
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
        },
        addMessages:(state,action)=>{
             console.log('message added '+ action.payload.message );
            state.messages.push(action.payload);
        },
        setRealTimeData:(state,action)=>{
            state.realTimeData=action.payload
        },
        // setOnlineUsers:(state,action)=>{
        //     state.onlineUsers=action.payload;
        // }
    }
})
export const {setFriends,setChatMeta,addFriend,setSelectedUserId,setSearchResult,setMessages,addMessages,setRealTimeData,addLastMessage,addChatMeta}=chatSlice.actions;
export default chatSlice.reducer;