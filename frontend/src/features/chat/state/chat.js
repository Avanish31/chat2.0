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
        userTyping:false,
        lastSeen:false
    },
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
        addFriend:(state,action)=>{
            const user=action.payload;
            state.friends.byId[user.id]=user;
            state.freinds.allIds.push(user.id);
        },
        setSelectedUserId:(state,action)=>{
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
            state.messages.push(action.payload);
        },
        setRealTimeData:(state,action)=>{
            state.realTimeData=action.payload
        }
    }
})
export const {setFriends,setChatMeta,addFriend,setSelectedUserId,setSearchResult,setMessages,addMessages,setRealTimeData}=chatSlice.actions;
export default chatSlice.reducer;