import React, { useState, useEffect } from "react";
import BlueTickIcon from "../../../assets/bluetick";
import WhiteTickIcon from "../../../assets/whitetick";

import { useSelector, useDispatch } from "react-redux";
import {
    updateSelectedMessagesDeletion,
    removeSelectedMessagesDeletion,
    updateDeleteForEveryOneEnabler
} from "../state/chat";
import { updateMediaError } from "../state/media";
import { getMediaUiState } from "../services/getMediaUiState";

import Image from "./Image";
import VideoComponent from "./VideoComponent";
import AudioMedia from "./AudioMedia";
import PdfMedia from "./PdfMedia";
import DocumentMedia from "./DocumentMedia";

import axios from "axios";

function SendBubble({
    message,
    messageType,
    status,
    time,
    id,
    deletedForEveryOne
}) {
    
    const dispatch = useDispatch();
    const selectedMessagesDeletion = useSelector(
        state => state.chat.selectedMessagesDeletion
    );

    const deleteMode = useSelector(
        state => state.chat.deleteMode
    );

    const mediaStore = useSelector(
        state => state.media.MediaStore
    );

    const uploadedQueue = useSelector(
        state => state.media.uploadQueue
    );

  

    const [uiState, setUiState] = useState(null);

    
    const [serverBytes, setServerBytes] = useState(null);

    

    const mediaId = message;

    const checked = selectedMessagesDeletion.includes(id);

    const uploadItem = uploadedQueue.byId[mediaId];
    const errorBubbleStatus=false;
   
    const handleToggle = () => {
        if (!deleteMode) {
            return;
        }
        const newChecked = !checked;
        if (newChecked) {
            dispatch(
                updateSelectedMessagesDeletion(id)
            );

            if (deletedForEveryOne) {
                dispatch(
                    updateDeleteForEveryOneEnabler(1)
                );
            }

        } else {
            dispatch(
                removeSelectedMessagesDeletion(id)
            );
            if (deletedForEveryOne) {
                dispatch(
                    updateDeleteForEveryOneEnabler(-1)
                );
            }
        }
    };

   

    useEffect(() => {

        if (messageType !== "media") {
            return;
        }

        if (uploadItem) {
            return;
        }

        let cancelled = false;

        const loadUploadedBytes = async () => {

            try {

                console.log(
                    "GETTING SERVER BYTES:",
                    mediaId
                );

                const res = await axios.get(
                    `/api/chat/getBytes/${mediaId}`
                );

                if (cancelled) {
                    return;
                }

                console.log(
                    "SERVER BYTE RESPONSE:",
                    res.data
                );

                setServerBytes({
                    uploadedBytes: res.data.uploadedBytes,
                    totalBytes: res.data.totalBytes
                });

            } catch (error) {

                if (!cancelled) {
                    console.error(
                        "Failed to get uploaded bytes:",
                        error
                    );
                }
            }
        };

        loadUploadedBytes();

        return () => {
            cancelled = true;
        };

    }, [mediaId, messageType, uploadItem]);

   

    const uploadedBytes =
        uploadItem?.uploadedBytes ??
        serverBytes?.uploadedBytes ??
        null;

    const totalBytes =
        uploadItem?.totalBytes ??
        serverBytes?.totalBytes ??
        null;

   

    useEffect(() => {

        if (messageType !== "media") {
            return;
        }

        if (
            uploadedBytes == null ||
            totalBytes == null
        ) {
            return;
        }


        if (uploadItem) {

            const uploadStatus = uploadItem.status;

            console.log(
                "UPLOAD UPDATE:",
                mediaId,
                uploadStatus,
                uploadedBytes,
                "/",
                totalBytes
            );

            if (uploadStatus === "uploading") {

                setUiState({
                    type: "uploading",
                    progress:
                        totalBytes > 0
                            ? uploadedBytes / totalBytes
                            : 0
                });

                return;
            }

            if (uploadStatus === "pending") {

                setUiState({
                    type: "pending",
                    progress: null
                });

                return;
            }

            if (uploadStatus === "failed") {

                setUiState({
                    type: "failed"
                });

                return;
            }

            if (uploadStatus === "cancelled") {

                setUiState({
                    type: "cancelled"
                });

                return;
            }

          
            if (uploadStatus === "completed") {

                const loadCompletedState = async () => {

                    const state = await getMediaUiState(
                        mediaId,
                        true,
                        totalBytes,
                        null,
                        uploadedBytes
                    );

                    setUiState(state);
                };

                loadCompletedState();

                return;
            }

            return;
        }


        const loadState = async () => {

            const state = await getMediaUiState(
                mediaId,
                true,
                totalBytes,
                null,
                uploadedBytes
            );

            setUiState(state);
        };

        loadState();

    }, [
        mediaId,
        messageType,
        uploadedBytes,
        totalBytes,
        uploadItem?.status
    ]);

    

    let uiButton = null;
    let progress = null;
    let error = false;
    let content = null;
    let errorMessage = null;
    let file = null;

    if (uiState) {

        if (uiState.type === "uploading") {

            uiButton = "uploadProgress";
            progress = uiState.progress;

        } else if (uiState.type === "pending") {

            uiButton = "uploadButton";

        } else if (uiState.type === "completed") {

            if (uiState.available) {

                uiButton = "openFile";
                file = uiState.file;

            } else {

                error = true;
                errorMessage =
                    "This file no longer exists on your device, re-upload it";
            }

        } else if (uiState.type === "failed") {

            uiButton = "uploadButton";

            error = true;

            errorMessage = "Upload failed";

        } else if (uiState.type === "cancelled") {

            uiButton = "uploadButton";
        }
    }

    if (messageType === "media" && !deletedForEveryOne) {

        const media = mediaStore.byId[mediaId];
        if (media) {

            const category = media.category;

            if (category === "image") {

                content = (
                    <Image
                        file={file}
                        uiButton={uiButton}
                        progress={progress}
                        mediaId={mediaId}
                    />
                );

            } else if (category === "video") {

                content = (
                    <VideoComponent
                        file={file}
                        uiButton={uiButton}
                        progress={progress}
                        mediaId={mediaId}
                    />
                );

            } else if (category === "audio") {

                content = (
                    <AudioMedia
                        file={file}
                        uiButton={uiButton}
                        progress={progress}
                        mediaId={mediaId}
                        color="bg-gray-600"
                    />
                );

            } else if (category === "document") {

                const type = media.type;

                if (type === "pdf") {

                    content = (
                        <PdfMedia
                            file={file}
                            uiButton={uiButton}
                            progress={progress}
                            mediaId={mediaId}
                            color="bg-gray-600"
                        />
                    );

                } else {

                    content = (
                        <DocumentMedia
                            file={file}
                            uiButton={uiButton}
                            progress={progress}
                            mediaId={mediaId}
                            color="bg-gray-600"
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
            className={`w-full flex flex-row-reverse justify-between mb-2 mt-2 items-center relative${
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

           <div className="p-1 mr-4 min-w-[50px] max-w-[50%] rounded-[10px] bg-gray-600 break-all overflow-hidden">

                <div>
                    {content}
                </div>

                <div className="flex justify-end items-center gap-1 mt-1">

                    <span className="text-[10px] text-gray-200">
                        {time}
                    </span>

                    {status ? (
                        <BlueTickIcon />
                    ) : (
                        <WhiteTickIcon />
                    )}

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
    className="absolute right-0 bottom-0 w-5 h-5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center"
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
                    className="h-4 w-4 rounded-md ml-3"
                />
            )}

        </div>
    );
}

export default SendBubble;