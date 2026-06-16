import { configureStore } from "@reduxjs/toolkit";
import authSlice from './features/auth/state/authSlice'
import chatSlice from './features/chat/state/chat'
const store=configureStore({
    reducer:{
        auth:authSlice,
        chat:chatSlice
    }
})
export default store