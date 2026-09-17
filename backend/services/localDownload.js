const fs = require("fs");

const DEFAULT_CHUNK_SIZE = 64 * 1024; // 64 KB

const activeDownloads = new Map();
function sendChunkWithAck(socket, data, signal) {
    return new Promise((resolve, reject) => {

        let finished = false;

        const cleanup = () => {
            signal.removeEventListener("abort", abortHandler);
        };

        const abortHandler = () => {
            if (finished) return;

            finished = true;
            cleanup();

            reject(new DOMException("Download aborted", "AbortError"));
        };

        signal.addEventListener("abort", abortHandler);

        socket.emit("media:chunk", data, (response) => {

            if (finished) return;

            finished = true;
            cleanup();

            if (response?.error) {
                reject(new Error(response.error));
                return;
            }

            resolve();
        });
    });
}
async function downloadFile({
    mediaId,
    filePath,
    socket,
    startByte,
    endByte,
    chunkSize = DEFAULT_CHUNK_SIZE

}) {
     const controller = new AbortController();

    activeDownloads.set(mediaId, controller);

    console.log(
        "DOWNLOAD START",
        mediaId,
        activeDownloads
    );

    const cleanup = () => {

        console.log("🔥 CLEANUP:", mediaId);

        if (activeDownloads.get(mediaId) === controller) {
            activeDownloads.delete(mediaId);
        }

        console.log(
            "🔥 AFTER CLEANUP:",
            [...activeDownloads.keys()]
        );
    };

    const disconnectHandler = () => {
        console.log("SOCKET DISCONNECTED:", mediaId);
        controller.abort();
    };

    socket.once("disconnect", disconnectHandler);

    let currentByte = startByte;

    try {

        const stream = fs.createReadStream(filePath, {
            start: startByte,
            end: endByte,
            highWaterMark: chunkSize,
            signal: controller.signal
        });

        for await (const chunk of stream) {

            // Check cancellation
            if (controller.signal.aborted) {
                console.log("DOWNLOAD CANCELLED:", mediaId);
                break;
            }

            console.log(
                "SENDING CHUNK:",
                currentByte,
                "-",
                currentByte + chunk.length - 1
            );

            await sendChunkWithAck(socket, {
                mediaId,
                startByte: currentByte,
                endByte: currentByte + chunk.length - 1,
                chunk
            }, controller.signal);

            currentByte += chunk.length;

            console.log(
                "ACK RECEIVED:",
                currentByte
            );
        }


        if (controller.signal.aborted) {

            console.log(
                "🔥 DOWNLOAD ABORTED:",
                mediaId
            );

            return;
        }

        

        if (socket.connected) {

            socket.emit("media:complete", {
                mediaId,
                startByte,
                endByte
            });

            console.log(
                "🔥 DOWNLOAD COMPLETE:",
                mediaId
            );
        }

    } catch (err) {

        if (
            err.name === "AbortError" ||
            controller.signal.aborted
        ) {

            console.log(
                "🔥 DOWNLOAD ABORTED:",
                mediaId
            );

            return;
        }

        console.log(
            "🔥 DOWNLOAD ERROR:",
            mediaId,
            err.name,
            err.message
        );

        if (socket.connected) {

            socket.emit("media:error", {
                mediaId,
                error: err.message || "Download failed"
            });
        }

        throw err;

    } finally {

        cleanup();

        socket.off(
            "disconnect",
            disconnectHandler
        );
    }
}

module.exports = {
    downloadFile,
    activeDownloads
};