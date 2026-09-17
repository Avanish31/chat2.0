import { configureStore } from "@reduxjs/toolkit";
import authSlice from './features/auth/state/authSlice'
import chatSlice from './features/chat/state/chat'
import mediaSlice from './features/chat/state/media'
import { mediaQueueListener } from "./features/chat/state/listeners/mediaQueueListener";
const store=configureStore({
    reducer:{
        auth:authSlice,
        chat:chatSlice,
        media:mediaSlice,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().prepend(
            mediaQueueListener.middleware
        )
})
export default store