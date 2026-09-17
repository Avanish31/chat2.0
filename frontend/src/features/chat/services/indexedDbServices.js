const DB_NAME = "mediaDB";
const DB_VERSION = 1;

export const STORES = {
    UPLOADED_FILES: "uploadedFiles",
    DOWNLOADED_FILES: "downloadedFiles",
    DOWNLOADED_CHUNKS: "downloadedChunks",
};

const openDB = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;

            if (!db.objectStoreNames.contains(STORES.UPLOADED_FILES)) {
                db.createObjectStore(STORES.UPLOADED_FILES, {
                    keyPath: "mediaId",
                });
            }

            if (!db.objectStoreNames.contains(STORES.DOWNLOADED_FILES)) {
                db.createObjectStore(STORES.DOWNLOADED_FILES, {
                    keyPath: "mediaId",
                });
            }
            if (!db.objectStoreNames.contains(STORES.DOWNLOADED_CHUNKS)) {
                db.createObjectStore(STORES.DOWNLOADED_CHUNKS, {
                    keyPath: "id",
                });
            }
        };

        request.onsuccess = () => {
            resolve(request.result);
        };

        request.onerror = () => {
            reject(request.error);
        };
    });
};


export const updateFileStatus = async (storeName, mediaId, status) => {
    const db = await openDB();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, "readwrite");
        const store = transaction.objectStore(storeName);

        const request = store.get(mediaId);

        request.onsuccess = () => {
            const data = request.result;

            if (!data) {
                reject(new Error(`File not found: ${mediaId}`));
                return;
            }

            data.status = status;

            store.put(data);
        };

        request.onerror = () => {
            reject(request.error);
        };

        transaction.oncomplete = () => {
            resolve();
        };

        transaction.onerror = () => {
            reject(transaction.error);
        };
    });
};

export const setFile = async (
    storeName,
    mediaId,
    file,
    totalBytes,
    isDownload = false
) => {
    const db = await openDB();
console.log("setfile CALLED");
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, "readwrite");
        const store = transaction.objectStore(storeName);
        console.log("TOTALbYTES" ,totalBytes);
        const data = {
            mediaId,
            cached: file !== undefined,
            createdAt: Date.now(),
        };

        if (file !== undefined) {
            data.file = file;
            data.lastAccessedAt = Date.now();

        }

        if (totalBytes !== undefined) {
            data.totalBytes = totalBytes;

        }
        if (isDownload) {
            data.downloadedBytes = 0;
        }

        const request = store.put(data);

        request.onerror = () => reject(request.error);

        transaction.oncomplete = () => {
            resolve();
        };

        transaction.onerror = () => {
            reject(transaction.error);
        };
    });
};

export const deleteFile = async (storeName, mediaId) => {
    const db = await openDB();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, "readwrite");
        const store = transaction.objectStore(storeName);

        const request = store.delete(mediaId);

        request.onsuccess = () => {
            resolve(true);
        };

        request.onerror = () => {
            reject(request.error);
        };

        transaction.onerror = () => {
            reject(transaction.error);
        };
    });
};


export const getMediaFile = async (storeName, mediaId) => {
    const db = await openDB();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, "readwrite");
        const store = transaction.objectStore(storeName);

        const request = store.get(mediaId);
        
        request.onsuccess = () => {
            const document = request.result;
            if (!document) {
                resolve(null);
                return;
            }

            if (document.cached) {
                document.lastAccessedAt = Date.now();
                store.put(document);
            }

            resolve(document);
        };

        request.onerror = () => {
            reject(request.error);
        };

        transaction.onerror = () => {
            reject(transaction.error);
        };
    });
};
export const deleteChunksByMediaId = async (mediaId) => {
    const db = await openDB();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(
            STORES.DOWNLOADED_CHUNKS,
            "readwrite"
        );

        const store = transaction.objectStore(
            STORES.DOWNLOADED_CHUNKS
        );

        const request = store.openCursor();

        request.onsuccess = (event) => {
            const cursor = event.target.result;

            if (!cursor) {
                return;
            }

            if (cursor.value.mediaId === mediaId) {
                cursor.delete();
            }

            cursor.continue();
        };

        request.onerror = () => {
            reject(request.error);
        };

        transaction.oncomplete = () => {
            resolve();
        };

        transaction.onerror = () => {
            reject(transaction.error);
        };
    });
};


export const updateCacheStatus = async (
    storeName,
    mediaId,
    cached
) => {
    const db = await openDB();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, "readwrite");
        const store = transaction.objectStore(storeName);

        const request = store.get(mediaId);

        request.onsuccess = () => {
            const document = request.result;

            if (!document) {
                reject(new Error(`Media ${mediaId} not found`));
                return;
            }

            document.cached = cached;

            store.put(document);
        };

        request.onerror = () => {
            reject(request.error);
        };

        transaction.oncomplete = () => {
            resolve();
        };

        transaction.onerror = () => {
            reject(transaction.error);
        };
    });
};



export const getCacheStatus = async (
    storeName,
    mediaId
) => {
    const db = await openDB();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, "readonly");
        const store = transaction.objectStore(storeName);

        const request = store.get(mediaId);

        request.onsuccess = () => {
            resolve(request.result?.cached ?? false);
        };

        request.onerror = () => {
            reject(request.error);
        };
    });
};

export const clearAll = async (storeName) => {
    const db = await openDB();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, "readwrite");
        const store = transaction.objectStore(storeName);

        store.clear();

        transaction.oncomplete = () => {
            resolve();
        };

        transaction.onerror = () => {
            reject(transaction.error);
        };
    });
};
const CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000;
export const cleanupOldFiles = async (storeName) => {
    const db = await openDB();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(
            storeName,
            "readwrite"
        );

        const store = transaction.objectStore(storeName);

        const expiryTime = Date.now() - CACHE_EXPIRY;

        const request = store.openCursor();

        request.onsuccess = (event) => {
            const cursor = event.target.result;

            if (!cursor) {
                return;
            }

            const document = cursor.value;

            if (
                document.cached &&
                document.lastAccessedAt &&
                document.lastAccessedAt < expiryTime
            ) {
                document.file = null;
                document.cached = false;
                document.lastAccessedAt=null;
                if(storeName==="downloadedFiles"){
                    document.downloadedBytes=0;
                }
                cursor.update(document);
            }

            cursor.continue();
        };

        request.onerror = () => {
            reject(request.error);
        };

        transaction.oncomplete = () => {
            resolve();
        };

        transaction.onerror = () => {
            reject(transaction.error);
        };
    });
};
export const updateDownloadedBytes = async (
    storeName,
    mediaId,
    downloadedBytes
) => {
    const db = await openDB();
    console.log("updateDownloadedBytes id hitt");
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, "readwrite");
        const store = transaction.objectStore(storeName);

        const request = store.get(mediaId);

        request.onsuccess = () => {
            const data = request.result;

            if (!data) {
                reject(new Error(`File with mediaId ${mediaId} not found`));
                return;
            }

            data.downloadedBytes = downloadedBytes;
            data.lastChunkArrivedAt = Date.now();
            store.put(data);
        };

        request.onerror = () => {
            reject(request.error);
        };

        transaction.oncomplete = () => {
            resolve();
        };

        transaction.onerror = () => {
            reject(transaction.error);
        };
    });
};
export const saveChunk = async (
    mediaId,
    startByte,
    endByte,
    chunk
) => {
    const db = await openDB();
    console.log("chunks saved");
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(
            STORES.DOWNLOADED_CHUNKS,
            "readwrite"
        );

        const store = transaction.objectStore(
            STORES.DOWNLOADED_CHUNKS
        );

        const id = `${mediaId}_${startByte}`;

        const request = store.put({
            id,
            mediaId,
            startByte,
            endByte,
            chunk,
        });

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
        console.log("the eend")
    });
};
export const getChunks = async (mediaId) => {
    const db = await openDB();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(
            STORES.DOWNLOADED_CHUNKS,
            "readonly"
        );

        const store = transaction.objectStore(
            STORES.DOWNLOADED_CHUNKS
        );

        const request = store.openCursor();
        const chunks = [];

        request.onsuccess = (event) => {
            const cursor = event.target.result;

            if (!cursor) {
                // Sort according to their position in the file
                chunks.sort((a, b) => a.startByte - b.startByte);

                resolve(chunks);
                return;
            }

            const data = cursor.value;

            if (data.mediaId === mediaId) {
                chunks.push(data);
            }

            cursor.continue();
        };

        request.onerror = () => {
            reject(request.error);
        };
    });
};
export const markDownloadFailed = async (storeName, mediaId) => {
    const db = await openDB();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, "readwrite");
        const store = transaction.objectStore(storeName);

        const request = store.get(mediaId);

        request.onsuccess = () => {
            const document = request.result;

            if (!document) {
                reject(new Error(`Media ${mediaId} not found`));
                return;
            }

            document.downloadedBytes = 0;
            document.lastChunkArrivedAt = null;

            store.put(document);
        };

        request.onerror = () => {
            reject(request.error);
        };

        transaction.oncomplete = () => {
            resolve();
        };

        transaction.onerror = () => {
            reject(transaction.error);
        };
    });
};
const DOWNLOAD_EXPIRY = 10 * 60 * 1000; // 10 minutes

export const cleanupIncompleteDownloads = async () => {
    const db = await openDB();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(
            [
                STORES.DOWNLOADED_FILES,
                STORES.DOWNLOADED_CHUNKS
            ],
            "readwrite"
        );

        const fileStore = transaction.objectStore(
            STORES.DOWNLOADED_FILES
        );
        const chunkStore = transaction.objectStore(
            STORES.DOWNLOADED_CHUNKS
        );
        const expiryTime = Date.now() - DOWNLOAD_EXPIRY;

        const request = fileStore.openCursor();

        request.onsuccess = (event) => {
            const cursor = event.target.result;

            if (!cursor) {
                return;
            }

            const file = cursor.value;

            if (
                !file.cached &&
                file.lastChunkArrivedAt &&
                file.lastChunkArrivedAt < expiryTime
            ) {
                const mediaId = file.mediaId;

                file.downloadedBytes = 0;
                file.lastChunkArrivedAt = null;
                file.status="failed"
                cursor.update(file);

                
                const chunkRequest = chunkStore.openCursor();

                chunkRequest.onsuccess = (event) => {
                    const chunkCursor = event.target.result;

                    if (!chunkCursor) {
                        return;
                    }

                    if (chunkCursor.value.mediaId === mediaId) {
                        chunkCursor.delete();
                    }

                    chunkCursor.continue();
                };
            }

            cursor.continue();
        };

        request.onerror = () => reject(request.error);

        transaction.oncomplete = () => resolve();

        transaction.onerror = () => {
            reject(transaction.error);
        };
    });
};
export const cleanupIndexedDB = async () => {
    await cleanupOldFiles("uploadedFiles");
    await cleanupOldFiles("downloadedFiles");
    await cleanupIncompleteDownloads();
};