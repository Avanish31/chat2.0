const fs = require("fs/promises");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SECRET_KEY
);

const BUCKET = "chat";

async function saveFile(mediaId, mergedFilePath) {

    const extension = path.extname(mergedFilePath);

    console.log("MERGEDPATH", mergedFilePath);
    console.log("EXTENSION", extension);

    const storageKey = `${mediaId}${extension}`;

    
    const stats = await fs.stat(mergedFilePath);

    const fileBuffer = await fs.readFile(mergedFilePath);

    const { data, error } = await supabase
        .storage
        .from(BUCKET)
        .upload(storageKey, fileBuffer, {
            contentType: "application/octet-stream",
            upsert: false
        });

    if (error) {
        console.error("SUPABASE UPLOAD ERROR:", error);
        throw error;
    }
    return {
        storageKey,
        size: stats.size
    };
}


async function getAccessInfo(storageKey) {

    const { data, error } = await supabase
        .storage
        .from(BUCKET)
        .createSignedUrl(
            storageKey,
            60 * 60 
        );

    if (error) {
        console.error("SUPABASE SIGNED URL ERROR:", error);
        throw error;
    }

    return {
        method: "url",
        filePath: data.signedUrl
    };
}


async function deleteFile(storageKey) {

    const { error } = await supabase
        .storage
        .from(BUCKET)
        .remove([storageKey]);

    if (error) {
        console.error("SUPABASE DELETE ERROR:", error);
        throw error;
    }
}


module.exports = {
    saveFile,
    deleteFile,
    getAccessInfo
};