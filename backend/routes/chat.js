const express=require('express');
const multer=require('multer');
const upload = multer({
    storage: multer.memoryStorage()
});
const router=express.Router();
const {InitialChatLoader,searchHandler,newChatHandler,messageHandler,
    statusHandler,newFriendHandler,notificationHandler,deleteMessageForMeHandler,
    chunkHandler,uploadHandler,chunkIndexHandler,downloadHandler,MediaDetailsHandler,
    cancelUploadHandler,updateUploadStatusHandler,statusDetailHandler,markFailedHandler,
    handleBytes,
}=require('../controllers/chat')
router.get('/',InitialChatLoader);
router.post('/search',searchHandler)
router.post('/newChat',newChatHandler)
router.get('/getMessages/:conversationId',messageHandler);
router.get('/status/:id',statusHandler)
router.get('/newFriendSend/:id',newFriendHandler);
router.get('/newFriendReceive/:id',newFriendHandler);
router.get('/getNotification/:id',notificationHandler)
router.post('/deleteMessageForMe',deleteMessageForMeHandler)
router.post('/mediaChunks', upload.single("chunk"),chunkHandler)
router.post('/uploadMedia',uploadHandler);
router.get('/getLargestUploadedChunkIndex/:mediaId',chunkIndexHandler)
router.get('/downloadMedia/:mediaId',downloadHandler)
router.get('/getMediaDetails/:mediaId',MediaDetailsHandler)
router.get('/cancelUpload/:mediaId',cancelUploadHandler);
router.get('/updateUploadStatus/:mediaId',updateUploadStatusHandler);
router.get('/getStatusDetail/:mediaId',statusDetailHandler);
router.get('/markUploadFailed/:mediaId',markFailedHandler)
router.get('/getBytes/:mediaId',handleBytes)
module.exports=router;