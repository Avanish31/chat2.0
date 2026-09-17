import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    updateSelectedMessagesDeletion,
    removeSelectedMessagesDeletion,
    updateDeleteForEveryOneEnabler
} from "../state/chat";
import { getMediaUiState } from "../services/getMediaUiState";
import { getMediaFile } from "../services/indexedDbServices";
import PdfMedia from "./PdfMedia";
import Image from "./Image";
import VideoComponent from "./VideoComponent";
import DocumentMedia from "./DocumentMedia";
import AudioMedia from "./AudioMedia";
import { updateMediaError } from "../state/media";
function RecieveBubble({
    message,
    messageType,
    time,
    id,
    deletedForEveryOne
}) {
    const selectedMessagesDeletion = useSelector(
        state => state.chat.selectedMessagesDeletion
    );
    const deleteMode = useSelector(
        state => state.chat.deleteMode
    );
    const mediaStore = useSelector(
        state => state.media.MediaStore
    );
    const downloadItem = useSelector(
        state => state.media.downloadQueue.byId[message]
    );
    const dispatch = useDispatch();
    const [mediaFile, setMediaFile] = useState(null);
    const [uiState, setUiState] = useState(null);
    const mediaId = message;
    const checked =selectedMessagesDeletion.includes(id);
    const handleToggle = () => {
        if (!deleteMode) {
            return;
        }
        const newChecked = !checked;
        if (newChecked) {
            dispatch(
                updateSelectedMessagesDeletion(id)
            );
            dispatch(
                updateDeleteForEveryOneEnabler(1)
            );

        } else {

            dispatch(
                removeSelectedMessagesDeletion(id)
            );

            dispatch(
                updateDeleteForEveryOneEnabler(-1)
            );
        }
    };
    useEffect(() => {

        if (messageType !== "media") {
            return;
        }

        let cancelled = false;

        const loadMediaFile = async () => {

            try {

                const doc = await getMediaFile(
                    "downloadedFiles",
                    mediaId
                );

                if (!cancelled) {
                    setMediaFile(doc);
                }

            } catch (error) {

                console.error(
                    "Failed to load media from IndexedDB:",
                    error
                );

            }
        };

        loadMediaFile();

        return () => {
            cancelled = true;
        };

    }, [mediaId, messageType]);


    useEffect(() => {

        if (messageType !== "media") {
            return;
        }

        let cancelled = false;

        const loadState = async () => {

            if (downloadItem) {

                const downloadedBytes =
                    downloadItem.downloadedBytes ?? 0;

                const totalBytes =
                    downloadItem.totalBytes ?? 0;

                const status =
                    downloadItem.status;

                console.log(
                    "DOWNLOAD:",
                    mediaId,
                    status,
                    downloadedBytes,
                    "/",
                    totalBytes
                );
                if (status === "downloading") {

                    if (!cancelled) {

                        setUiState({
                            type: "downloading",

                            progress:
                                totalBytes > 0
                                    ? downloadedBytes / totalBytes
                                    : 0
                        });
                    }

                    return;
                }


                if (status === "pending") {

                    if (!cancelled) {

                        setUiState({
                            type: "pending",
                            progress: null
                        });
                    }

                    return;
                }

                if (status === "failed") {

                    if (!cancelled) {

                        setUiState({
                            type: "failed"
                        });
                    }

                    return;
                }

                if (status === "cancelled") {

                    if (!cancelled) {

                        setUiState({
                            type: "cancelled"
                        });
                    }

                    return;
                }


                if (status === "completed") {

                    const downloadedFile =
                        await getMediaFile(
                            "downloadedFiles",
                            mediaId
                        );

                    if (cancelled) {
                        return;
                    }

                    if (
                        downloadedFile?.cached === true &&
                        downloadedFile?.file
                    ) {

                        setUiState({
                            type: "completed",
                            available: true,
                            file: downloadedFile.file
                        });

                    } else {

                        setUiState({
                            type: "completed",
                            available: false
                        });
                    }

                    return;
                }
            }

            const downloadedFile =
                await getMediaFile(
                    "downloadedFiles",
                    mediaId
                );

            if (cancelled) {
                return;
            }

            console.log(
                "IDB DOWNLOAD FILE:",
                downloadedFile
            );



            if (
                downloadedFile?.cached === true &&
                downloadedFile?.file
            ) {

                setUiState({
                    type: "completed",
                    available: true,
                    file: downloadedFile.file
                });

                return;
            }



            const state = await getMediaUiState(
                mediaId,
                false,
                downloadedFile?.totalBytes,
                null,
                downloadedFile?.downloadedBytes
            );

            if (!cancelled) {
                setUiState(state);
            }

        };


        loadState();


        return () => {
            cancelled = true;
        };

    }, [
        mediaId,
        messageType,

        downloadItem?.downloadedBytes,
        downloadItem?.totalBytes,
        downloadItem?.status
    ]);


 

    let uiButton = null;
    let progress = null;
    let error = false;
    let errorMessage = null;
    let file = null;




    if (uiState) {

        if (uiState.type === "downloading") {

            uiButton = "downloadProgress";
            progress = uiState.progress;

        }

        else if (uiState.type === "pending") {

            uiButton = "downloadButton";

        }

        else if (uiState.type === "completed") {

            if (uiState.available) {

                uiButton = "openFile";
                file = uiState.file;

            } else {

                uiButton = "downloadButton";

                // error = true;

                // errorMessage =
                //     "This file no longer exists on your system";
            }
        }

        else if (uiState.type === "failed") {

            uiButton = "downloadButton";

            error = true;

            errorMessage = "Download failed";

        }

        else if (uiState.type === "cancelled") {

            uiButton = "downloadButton";
        }
    }



    let content = null;

    if (messageType === "media" && !deletedForEveryOne) {

        const media =
            mediaStore.byId[mediaId];

        if (media) {

            const category =
                media.category;


         
            if (category === "image") {

                content = (
                    <Image
                        file={file}
                        uiButton={uiButton}
                        progress={progress}
                        mediaId={mediaId}
                    />
                );
            }


         

            else if (category === "video") {

                content = (
                    <VideoComponent
                        file={file}
                        uiButton={uiButton}
                        progress={progress}
                        mediaId={mediaId}
                    />
                );
            }
            else if (category === "audio") {

                content = (
                    <AudioMedia
                        file={file}
                        uiButton={uiButton}
                        progress={progress}
                        mediaId={mediaId}
                        color="bg-blue-600"
                    />
                );
            }

            else if (category === "document") {

                const type = media.type;


                if (type === "pdf") {

                    content = (
                        <PdfMedia
                            file={file}
                            uiButton={uiButton}
                            progress={progress}
                            mediaId={mediaId}
                            color="bg-blue-600"
                        />
                    );

                }

                else {

                    content = (
                        <DocumentMedia
                            file={file}
                            uiButton={uiButton}
                            progress={progress}
                            mediaId={mediaId}
                            color="bg-blue-600"
                        />
                    );
                }
            }
        }

    } else {

        content = message;
    }


    

    return (
        <div
            className={`w-full flex justify-between mt-2 mb-2 ml-4 items-center relative ${
                deleteMode
                    ? checked
                        ? "bg-[rgba(61,59,59,0.4)]"
                        : "hover:bg-[rgba(61,59,59,0.4)]"
                    : ""
            }`}
            onClick={
                deleteMode
                    ? handleToggle
                    : undefined
            }
        >

            <div className="p-1 mr-1 min-w-[50px] max-w-[50%] rounded-[10px] flex flex-wrap break-all justify-center bg-blue-600">

                {content}

                <div className="w-full flex justify-end mt-1">

                    <span className="text-[10px] text-gray-200">
                        {time}
                    </span>

                </div>

            </div>
            {error==true &&<button
    onClick={(e) => {
        e.stopPropagation();
        dispatch(updateMediaError({
                    active:true,
                    message:errorMessage,
                    mediaId:mediaId
        }))
    }}
    className="absolute left-0 bottom-0 w-5 h-5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center"
>
    !
</button>}


            {deleteMode && (
                <input
                    type="checkbox"
                    checked={checked}
                    onChange={handleToggle}
                    onClick={(e) =>
                        e.stopPropagation()
                    }
                    className="mr-4 h-4 w-4 rounded-md"
                />
            )}

        </div>
    );
}

export default RecieveBubble;