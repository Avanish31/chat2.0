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
        type:String
    }
},{timestamps:true})
const Conversation=model('conversation',conversationSchema);
conversationSchema.pre("save", function(next) {
    if (this.isNew) {
        this.participants.forEach(id => {
            const key = id.toString();

            if (!this.blocked.has(key))
                this.blocked.set(key, false);

            if (!this.deletedUntil.has(key))
                this.deletedUntil.set(key, null);

            if (!this.lastSeenMessage.has(key))
                this.lastSeenMessage.set(key, null);
        });
    }
    next();
});
module.exports=Conversation;