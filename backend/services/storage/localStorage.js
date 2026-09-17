const fs = require("fs/promises");
const path = require("path");

const STORAGE_DIR = path.join(__dirname, "../../storage");

async function saveFile(
    mediaId,
    mergedFilePath
) {

    const extension = path.extname(mergedFilePath);
    console.log("MERGEDPATH"+mergedFilePath);
    console.log("EXTENSION",extension);
    const destination = path.join(
        STORAGE_DIR,
        `${mediaId}${extension}`
    );
    await fs.rename(mergedFilePath, destination);
    return {
        storageKey: `${mediaId}${extension}`,
        size: (await fs.stat(destination)).size
    };
}
async function getAccessInfo(storageKey) {
    return {
        method: "stream",
        filePath: path.join(STORAGE_DIR, storageKey)
    };
}
async function deleteFile(storageKey) {

    const filePath = path.join(
        STORAGE_DIR,
        storageKey
    );

    await fs.unlink(filePath);
}

module.exports = {
    saveFile,
    deleteFile,
    getAccessInfo
};