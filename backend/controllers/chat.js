const Conversation=require('../models/conversation')
const Message=require('../models/message')
const User=require('../models/user');
const {onlineUsers}=require('../socket');
const {validateToken}=require('../services/auth');
const Media=require('../models/media');
const mediaService=require('../services/mediaService');
const chunkService=require('../services/chunkService');
const storageService=require('../services/storage/index');
const {downloadFile}=require('../services/localDownload');
async function InitialChatLoader(req,res){
    const chats=await Conversation.find({
        participants:req.user._id,
        conversationType:"dm",
        visibility:req.user._id
    }).populate("participants","_id name email profileImage lastseen").sort({updatedAt:-1})
    const unreadMap={};
    const userId=req.user._id.toString();
    for(const chat of chats){
        const lastseenId=chat.lastSeenMessage?.get(userId);
        let message=await Message.find({
            conversationId:chat._id,
            ...(lastseenId && {_id: {$gt:lastseenId}}),
            dummy:false,
            visibility:req.user._id
        });
        const otherId=chat.participants.find(p=>p._id.toString()!==userId)._id;
        const intervals=chat.blocked.filter(b=>b.blockedBy.equals(userId) && b.blockedUser.equals(otherId));
        message=message.filter(msg=>{
            if(msg.senderId.equals(userId)){
                return true;
            }
            for(const interval of intervals){
                const end=interval.unblockedAt??new Date(8640000000000000);
                if(msg.createdAt>=interval.blockedAt && msg.createdAt<=end){
                    return false;
                }
            }
            return true;
        })
        const count=message.length;
        console.log(userId+" "+count);
        unreadMap[chat._id.toString()]=count;
    }
    const formatted=chats.flatMap(chat=>{
        return chat.participants
            .filter(p=>p._id.toString()!==userId)
            .map(p=>{
                const otherId=p._id.toString();
                const youBlocked=chat.blocked.some(b=>b.blockedBy.equals(userId)  && b.blockedUser.equals(otherId) && b.unblockedAt==null);
                const blockedYou=chat.blocked.some(b=>b.blockedBy.equals(otherId)  && b.blockedUser.equals(userId) && b.unblockedAt==null);
                return {
                    id:otherId,
                    name:p.name,
                    email:p.email,
                    profileImage:p.profileImage,
                    lastseen:p.lastseen,
                    youBlocked:youBlocked,
                    blockedYou:blockedYou,
                    conversationId:chat._id
                }
            })
    })
    const chat2=await Conversation.find({
        participants:req.user._id,
        visibility:req.user._id
    }).sort({updatedAt:-1})
    const conversation= await Promise.all(
    chat2.map(async (chat) => {
    let lastMessageStatus=false;    
    let lastMessage=null;
    if(chat.conversationType==="dm"){
        let message=await Message.find({conversationId:chat._id,dummy:false, visibility:req.user._id}).sort({createdAt: -1});
        const otherId=chat.participants.find(id=>id!=userId);
        let intervals=chat.blocked.filter(b=>b.blockedBy.equals(userId) && b.blockedUser.equals(otherId));
        const lastMessageId = message.length ? message[0]._id : null;
        const id=chat.participants.find(id=>id!=userId);
        const lastId = chat.lastSeenMessage?.get(id);
        message=message.filter(msg=>{
            if(msg.senderId.equals(userId)){
                return true;
            }
            for(const interval of intervals){
                const end=interval.unblockedAt??new Date(8640000000000000);
                if(msg.createdAt>=interval.blockedAt && msg.createdAt<=end){
                    return false;
                }
            }
            return true;
        })
        lastMessage= message.find(
    msg => !msg.deleteBy.some(id => id.equals(userId)));
        intervals=chat.blocked.filter(b=>b.blockedBy.equals(otherId) && b.blockedUser.equals(userId));
        let blocked = false;
            if(lastMessage){
            for (const interval of intervals) {
                const end = interval.unblockedAt ?? new Date(8640000000000000);

                if (
                    lastMessage.createdAt >= interval.blockedAt &&
                    lastMessage.createdAt <= end
                ) {
                    blocked = true;
                    break;
                }
            }
        lastMessageStatus=blocked?false:(lastId && lastMessage._id.toString() <= lastId.toString())
        }
    }
    else{
     lastMessage=await Message.findOne({
        conversationId:chat._id,
        deleteBy: { $nin: [userId] },
         visibility:req.user._id
    }).sort({createdAt:-1});
    }   
    console.log("lastMessageStatus "+lastMessageStatus);
    let shownMessage=lastMessage.message;
    if(lastMessage.messageType=="media"){
        const media=await Media.findOne({mediaId:lastMessage.message});
        if(lastMessage.senderId==req.user._id){
            shownMessage=`${media?.category} sent `;
        }
        else{
            shownMessage=`${media?.category} recieved `;
        }
    }
    return {
      conversationId: chat._id,
      participants: chat.participants,
      lastMessage:lastMessage?.deletedForEveryOne?"This message was deleted":shownMessage,
      lastMessageId:lastMessage?._id,
      lastMessageTime: lastMessage?.createdAt??null,
      lastMessageStatus:lastMessageStatus,
      lastSenderId:lastMessage?.senderId,
      unreadCount: unreadMap[chat._id.toString()] || 0,
      deletedUntil: chat.deletedUntil?.get(userId),
      conversationType: chat.conversationType,
      groupName: chat.groupName,
      groupProfilePhoto: chat.groupProfilePhoto,
      groupEmail: chat.groupEmail,
    };
  })
);
    console.log(unreadMap);
    res.status(200).json({
        formatted:formatted,
        conversation:conversation
    });
}
async function searchHandler(req,res){
    const {email}=req.body;
    console.log(email);
    const user=await User.findOne({email:email})
    if(user && user.email!==req.email){
        res.status(200).json({
            name:user.name,
            profileImage:user.profileImage,
            id:user._id
        })
    }else{
        res.status(404).json({message:'user not found'})
    }

}
async function newChatHandler(req,res){
    const {id}=req.body;
    const user=await User.findOne({_id:id});
    res.status(200).json({
        name:user.name,
        profileImage:user.profileImage,
    })
}
async function messageHandler(req,res){
    const convId=req.params.conversationId;
    const token=req.cookies?.token;
    const data=validateToken(token);
    const userId=data._id
    let messages=await Message.find({conversationId:convId, visibility:req.user._id}).sort({ createdAt: 1 });
    const conversation=await Conversation.findById(convId);
    const lastSeenMessage=conversation?.lastSeenMessage;
    const { id, type } = req.query;
    let intervals=conversation.blocked.filter(b=>b.blockedBy.equals(userId) && b.blockedUser.equals(id));
    if(messages.length!=0 && type=="dm"){
        messages=messages.filter(msg=>{
            if(msg.senderId.equals(userId)){
                return true;
            }
            for(const interval of intervals){
                const end=interval.unblockedAt??new Date(8640000000000000);
                if(msg.createdAt>=interval.blockedAt && msg.createdAt<=end){
                    return false;
                }
            }
            if(msg.dummy==false){
            return true;
            }
        })
    }
        const lastId=lastSeenMessage.get(id);
        intervals=conversation.blocked.filter(b=>b.blockedBy.equals(id) && b.blockedUser.equals(userId));
        // messages=messages.map((msg)=>({
        //     ...msg.toObject(),
        //     status: lastId && msg._id.toString() <= lastId.toString()
        // }))
        messages = messages.map(msg => {
            let blocked = false;

            for (const interval of intervals) {
                const end = interval.unblockedAt ?? new Date(8640000000000000);

                if (
                    msg.createdAt >= interval.blockedAt &&
                    msg.createdAt <= end
                ) {
                    blocked = true;
                    break;
                }
            }

            return {
                ...msg.toObject(),
                status: blocked
                    ? false
                    : (lastId && msg._id.toString() <= lastId.toString())
            };
        });

    // messages.forEach((msg)=>{
    //     console.log(msg.message+" "+msg.status+" "+msg.createdAt);
    // })
    res.status(200).json({
        messages:messages
    })
    
}
async function statusHandler(req,res){
    const userId=req.params.id;
   return res.status(200).json({
        status: onlineUsers.has(userId)
    });
}
async function newFriendHandler(req,res) {
    const userId=req.params.id;
    const user=await User.findOne({_id:userId});
    return res.status(200).json({
        name:user.name,
        email:user.email,
        profileImage:user.profileImage
    })
}
async function notificationHandler(req,res){
    const userId=req.params.id;
   const chats=await Conversation.find({
        participants:req.user._id,    
        visibility:req.user._id
    })
    // let sum=0;
    // for(const chat of chats){
    //     const lastseenId=chat.lastSeenMessage?.get(userId);
    //     const count=await Message.countDocuments({
    //         conversationId:chat._id,
    //         ...(lastseenId && {_id: {$gt:lastseenId}})
    //     });
    //     sum+=count;
    // }
    let sum=0;
    for(const chat of chats){
        const lastseenId=chat.lastSeenMessage?.get(userId);
        let message=await Message.find({
            conversationId:chat._id,
            ...(lastseenId && {_id: {$gt:lastseenId}}),
            dummy:false,
             visibility:req.user._id
        });
        const otherId=chat.participants.find(id=>id.toString()!==userId);
        const intervals=chat.blocked.filter(b=>b.blockedBy.equals(userId) && b.blockedUser.equals(otherId));
        message=message.filter(msg=>{
            if(msg.senderId.equals(userId)){
                return true;
            }
            for(const interval of intervals){
                const end=interval.unblockedAt??new Date(8640000000000000);
                if(msg.createdAt>=interval.blockedAt && msg.createdAt<=end){
                    return false;
                }
            }
            return true;
        })
        const count=message.length;
        sum+=count;
    }
    res.status(200).json({
        notificationCount:sum
    })
}
async function deleteMessageForMeHandler(req,res){
    const { selectedMessagesDeletion } = req.body;
    const token=req.cookies?.token;
    const data=validateToken(token);
    const userId=data._id
    console.log(userId);
     for (const id of selectedMessagesDeletion){
         console.log("deleteMessageForMeHandler "+id);
        await Message.findOneAndUpdate(
            {_id:id, visibility:req.user._id},
            {
                $push: { deleteBy: userId } 
            }
            
        )
    }
    return res.status(200).json({
        success: true
    });
}
async function chunkHandler(req, res) {
    const { mediaId ,chunkIndex} = req.body;
    const chunk = req.file.buffer;
    console.log("mediaID "+mediaId);
    console.log("chunkIndex "+chunkIndex);
    try{
    await chunkService.saveChunk(mediaId,chunkIndex, chunk);
    const media = await mediaService.incrementUploadedChunks(mediaId,chunkIndex);
    console.log("media.uploadedChunks ",media.uploadedChunks);
    console.log("media.totalChunks ",media.totalChunks);
    if (media.uploadedChunks === media.totalChunks) {
        console.log("EXTENSIONNN "+media.extension);
        const mergedFilePath=await chunkService.mergeChunks(
            mediaId,
            media.totalChunks,
            media.extension
        );
        console.log("MERGEFILEPATH "+mergedFilePath);
        // await chunkService.deleteAllChunks(mediaId, totalChunks);
        console.log("deleted aALL CHUNKS");
        const rs=await storageService.saveFile(mediaId,mergedFilePath);
        console.log("STORAGE KEY ",rs.storageKey);
        await mediaService.updateStorageKey(mediaId,rs.storageKey);
        console.log("1");
        await mediaService.markUploadComplete(mediaId);
        console.log("2");
        await new Promise(resolve => setTimeout(resolve, 800));
        await chunkService.deleteTempfile(mediaId);
        console.log("3");
    }
    console.log("REACHED END");
    res.sendStatus(200);
    }catch(err){
        console.log("error  ");
        if(await chunkService.deleteTempfile(mediaId)){
            await mediaService.markUploadFailed(mediaId);
        }
        res.sendStatus(500);
    }
    
   
}

async function uploadHandler(req,res){
    console.log("EXTENSION "+req.body.extension);
     const media = await Media.findOneAndUpdate(
        { mediaId: req.body.mediaId },
        {
            $setOnInsert: {
                mediaId: req.body.mediaId,
                storageProvider: process.env.STORAGE_PROVIDER,
                category: req.body.category,
                fileName: req.body.fileName,
                mimeType: req.body.mimeType,
                type:req.body.type,
                fileSize: req.body.fileSize,
                chunkSize: req.body.chunkSize,
                totalChunks: req.body.totalChunks,
                uploadStatus: req.body.uploadStatus,
                thumbnail: req.body.thumbnail,
                extension: req.body.extension,
                pageCount: req.body.pageCount ?? 0,
                duration: req.body.duration ?? 0,
                resolution: req.body.resolution,
                caption:req.body.caption || null
            }
        },
        {
            upsert: true,
            new: true
        }
    );
    return res.sendStatus(200);
}
async function chunkIndexHandler(req,res){
    console.log("chunk index hit ");
    const mediaId=req.params.mediaId;
    const index=await mediaService.getLargestUploadedChunkIndex(mediaId);
    const media=await Media.findOne({mediaId:mediaId});
    console.log("index "+index);
    console.log("totalChunks "+media.totalChunks);
    res.status(200).json({
        index:index,
        totalChunks:media.totalChunks
    })

}
async function downloadHandler(req,res){
    const mediaId=req.params.mediaId;
    const rese=await Media.findOne({mediaId:mediaId});
    const access = await storageService.getAccessInfo(rese.storageKey);
    if (access.method === "stream") {
        return res.status(200).json({
            method:access.method,
            filePath:null
        })
    } else {
        return res.status(200).json({
            method:access.method,
            filePath:access.filePath
        })
    }
}
async function MediaDetailsHandler(req,res){
    const mediaId=req.params.mediaId;
    console.log("MEIDAI ID ",mediaId);
    const doc=await mediaService.getMediaById(mediaId);
    console.log("DOC",doc);
    const thumbnailBase64 = doc.thumbnail
        ? doc.thumbnail.toString("base64")
        : null;
    res.status(200).json({
        mediaId:mediaId,
        thumbnail:thumbnailBase64,
        category:doc.category,
        mimeType:doc.mimeType,
        type:doc.type,
        name: doc.fileName,
        size: doc.fileSize,
        caption:doc.caption,
        pages:doc.pageCount,
        extension:doc.extension,
        duration:doc.duration,
        resolution:doc.resolution,
    })

}
async function cancelUploadHandler(req, res) {

    const mediaId = req.params.mediaId;

    await Media.findOneAndUpdate(
        {
            mediaId: mediaId,
            $expr: {
                $lt: ["$uploadedChunks", "$totalChunks"]
            }
        },
        {
            $set: {
                uploadStatus: "cancelled"
            }
        }
    );

    return res.sendStatus(200);
}
async function updateUploadStatusHandler(req,res){
    console.log("UPDATESATTUS HITT");
    const mediaId=req.params.mediaId;
    await Media.findOneAndUpdate(
        {mediaId:mediaId},
        {uploadStatus:"pending"}
    )
    return res.sendStatus(200);
}
async function statusDetailHandler(req,res){
    const mediaId=req.params.mediaId;
    const es=await Media.findOne({mediaId:mediaId});
    return res.status(200).json({
        status:es.uploadStatus
    })
}
async function markFailedHandler(req,res){
    console.log("MARKFAILED TRUGGRERED");
    const mediaId=req.params.mediaId;
    if(await chunkService.deleteTempfile(mediaId)){
        await mediaService.markUploadFailed(mediaId);
    }
    res.sendStatus(200);
    
}
async function handleBytes(req,res){
    console.log("HIT REQUESTED");
    const mediaId=req.params.mediaId;
    const media=await Media.findOne({mediaId:mediaId});
    const uploadedBytes=Math.min(media.fileSize,(media.uploadedChunks)*media.chunkSize);
    console.log("uploadedbytes ",uploadedBytes);
    console.log("totalBytes",media.fileSize);
    res.status(200).json({
        uploadedBytes:uploadedBytes,
        totalBytes:media.fileSize
    })
}

module.exports={
    InitialChatLoader,
    searchHandler,
    newChatHandler,
    messageHandler,
    statusHandler,
    newFriendHandler,
    notificationHandler,
    deleteMessageForMeHandler,
    chunkHandler,
    uploadHandler,
    chunkIndexHandler,
    downloadHandler,
    MediaDetailsHandler,
    cancelUploadHandler,
    updateUploadStatusHandler,
    statusDetailHandler,
    markFailedHandler,
    handleBytes,
    
}
