const {Schema,model}=require('mongoose');
const mediaSchema=new Schema({
    mediaId:{
        type:String,
        unique:true,
        required:true
    },
    storageProvider:{
        type: String,
        enum: ["local", "aws-s3", "cloudinary", "firebase"],
        default: "local",
        required: true
    },
    storageKey:{
        type:String,
    },
    category:{
        type: String,
        enum: ["image", "video", "audio", "document", "archive"],
        required: true
    },
    fileName:{
        type:String,
        required:true
    },
    mimeType:{
        type:String,
        required:true
    },
    type:{
        type:String,
        required:true
    },
    fileSize:{
        type:Number,
        required:true
    },
    chunkSize:{
        type:Number,
        required:true
    },
    totalChunks:{
        type:Number,
        required:true
    },
    uploadStatus:{
        type: String,
        enum: ["pending", "completed", "failed", "cancelled"],
        default: "pending",
        required: true
    },
    uploadedChunkIndexes:{
        type:[Number],
        default:[]
    },
    lastChunkAt: {
        type: Date,
    },
    uploadedChunks:{
        type: Number,
        default:0
    },
    thumbnail:{
        type:String,
       default:null
    },
    extension:{
        type:String,
        required:true,
    },
    pageCount:{
        type:Number,
        default:0
    },
    duration:{
        type:Number,
        default:0
    },
    resolution: {
        width: {
            type: Number,
            default: null
        },
        height: {
            type: Number,
            default: null
        }
    },
    caption:{
        type:String,
        default:null
    }

},{timestamps:true})
const Media=model('media',mediaSchema);
module.exports=Media;