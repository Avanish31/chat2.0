const Media=require('../models/media');
async function getMediaById(mediaId) {
    return await Media.findOne({ mediaId });
}
async function updateUploadedChunks(mediaId, uploadedChunks) {
    return await Media.findOneAndUpdate(
        { mediaId },
        { uploadedChunks },
        { new: true }
    );
}
async function markUploadComplete(mediaId) {
    return await Media.findOneAndUpdate(
        { mediaId },
        {
            $set: {
                uploadStatus: "completed"
            }
        },
        { new: true }
    );
}
async function markUploadFailed(mediaId) {
    return await Media.findOneAndUpdate(
        { mediaId },
        {
            $set: {
                uploadStatus: "failed",
                uploadedChunks: 0,
                uploadedChunkIndexes: [],
                lastChunkAt: null
            }
        },
        { new: true }
    );
}
async function deleteMedia(mediaId) {
    return await Media.findOneAndDelete({ mediaId });
}
async function findExpiredUploads(expiryTime) {
    return await Media.find({
        uploadStatus: "pending",
        lastChunkAt: { $lt: expiryTime }
    });
}
async function incrementUploadedChunks(mediaId, chunkIndex) {
    const media = await Media.findOneAndUpdate(
        {
            mediaId,
            uploadedChunkIndexes: { $ne: chunkIndex }
        },
        {
            $inc: {
                uploadedChunks: 1
            },
            $push: {
                uploadedChunkIndexes: chunkIndex
            },
            $set: {
                lastChunkAt: new Date()
            }
        },
        {
            new: true
        }
    );

    if (media) {
        return media;
    }
    return await Media.findOne({ mediaId });
}
async function updateStorageKey(mediaId, storageKey) {
    return await Media.findOneAndUpdate(
        { mediaId },
        {
            $set: {
                storageKey
            }
        },
        { new: true }
    );
}
async function getLargestUploadedChunkIndex(mediaId) {
    const result = await Media.aggregate([
        {
            $match: { mediaId }
        },
        {
            $project: {
                largestIndex: {
                    $max: "$uploadedChunkIndexes"
                }
            }
        }
    ]);

    if (result.length === 0 || result[0].largestIndex === null) {
        return -1;
    }

    return result[0].largestIndex;
}
module.exports = {
    getMediaById,
    updateUploadedChunks,
    markUploadComplete,
    markUploadFailed,
    deleteMedia,
    findExpiredUploads,
    incrementUploadedChunks,
    updateStorageKey,
    getLargestUploadedChunkIndex
};