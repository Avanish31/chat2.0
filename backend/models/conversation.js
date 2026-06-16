const {Schema,model}=require('mongoose');
const conversationSchema=new Schema({
    participants:[{
        type:Schema.Types.ObjectId,
        ref:'user'
    }],
    lastMessage:{
        type:String,
        required:true
    },
    blocked:{
        type:Map,
        of:Boolean,
        default:{}
    },
    deletedUntil: {
        type: Map,
        of: Date,
        default: {}
    },
    lastSeenMessage:{
        type:Map,
        of:{
            type:Schema.Types.ObjectId,
            ref:"message"
        },
    },
    lastMessageTime:{
        type:Date
    }
},{timestamps:true})
const Conversation=model('conversation',conversationSchema);
module.exports=Conversation;