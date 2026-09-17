import { createListenerMiddleware } from "@reduxjs/toolkit";

import { scheduleQueue } from "../../services/scheduler";
import { startupload } from "../../services/uploader";
import { startDownload } from "../../services/downloader";

export const mediaQueueListener = createListenerMiddleware();
const  MAX_PARALLEL_UPLOADS=3;
const MAX_PARALLEL_DOWNLOADS=3;
mediaQueueListener.startListening({
    predicate: () => true,

    effect: async (_, listenerApi) => {
        const state = listenerApi.getState();

        const uploadQueue = state.media.uploadQueue;
        const downloadQueue = state.media.downloadQueue;

        const hasPendingUpload = uploadQueue.allIds.some(
            id => uploadQueue.byId[id].status === "pending"
        );

        const hasPendingDownload = downloadQueue.allIds.some(
            id => downloadQueue.byId[id].status === "pending"
        );

        if (hasPendingUpload) {
            scheduleQueue({
                queueType: "upload",
                maxParallel: MAX_PARALLEL_UPLOADS,
                activeStatus: "uploading",
                startTask: startupload
            });
        }

        if (hasPendingDownload) {
            scheduleQueue({
                queueType: "download",
                maxParallel: MAX_PARALLEL_DOWNLOADS,
                activeStatus: "downloading",
                startTask: startDownload
            });
        }
    }
});