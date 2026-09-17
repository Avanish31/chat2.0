const fileMap = new Map();
export function saveFile(mediaId, file) {
    fileMap.set(mediaId, file);
}
export function getFile(mediaId) {
    return fileMap.get(mediaId);
}
export function deleteFile(mediaId) {
    fileMap.delete(mediaId);
}
export function clearFiles() {
    fileMap.clear();
}