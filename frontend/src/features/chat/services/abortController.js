const uploadAbortController = new Map();
const downloadAbortController = new Map();

export function saveUploadAbortController(mediaId, controller) {
    uploadAbortController.set(mediaId, controller);
}

export function getUploadAbortController(mediaId) {
    return uploadAbortController.get(mediaId);
}

export function deleteUploadAbortController(mediaId) {
    uploadAbortController.delete(mediaId);
}

export function saveDownloadAbortController(mediaId, controller) {
    console.log("DOWNLOAD ABORT SAVED ",mediaId," ",controller);
    downloadAbortController.set(mediaId, controller);
}

export function getDownloadAbortController(mediaId) {
    return downloadAbortController.get(mediaId);
}

export function deleteDownloadAbortController(mediaId) {
    downloadAbortController.delete(mediaId);
}