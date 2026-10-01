import React, { useEffect, useState } from 'react';
import { CircularProgress } from './CircularProgress';
import MediaActionButton from './MediaActionButton';
import { useSelector, useDispatch } from 'react-redux';
import {
    getUploadAbortController,
    getDownloadAbortController,
    deleteDownloadAbortController,
    deleteUploadAbortController
} from '../services/abortController';
import axios from 'axios';
import {
    updateStatusDownloadQueue,
    updateStatusUploadQueue,
    addDownloadQueue,
    addUploadQueue,
    updateShowMediaFull
} from '../state/media';
import { updateFileStatus } from '../services/indexedDbServices';
import { getSocket } from '../../../socket/socketClient';
import { formatFileSize } from '../services/fileSizeFormatter';

function Image({ file, uiButton, progress, mediaId }) {
    let MediaAction = null;

    const [imageLoaded, setImageLoaded] = useState(false);
    const [source, setSource] = useState(null);

    const dispatch = useDispatch();

    const mediaStore = useSelector(
        state => state.media.MediaStore
    );

    const byId = mediaStore.byId;
    const media = byId[mediaId];

    const size = media?.size;
    const caption = media?.caption;
    const thumbnail = media?.thumbnail;

    const handleUploadCancel = async () => {
        const controller = getUploadAbortController(mediaId);

        if (!controller) {
            return;
        }

        controller.abort();
        deleteUploadAbortController(mediaId);

        dispatch(
            updateStatusUploadQueue({
                mediaId,
                status: 'cancelled'
            })
        );

        try {
            await axios.get(
                `/api/chat/cancelUpload/${mediaId}`
            );
        } catch (error) {
            console.error(error);
        }
    };

    const handleDownloadCancel = async () => {
        const controller =
            getDownloadAbortController(mediaId);

        if (!controller) {
            return;
        }

        const socket = getSocket();

        controller.abort();
        deleteDownloadAbortController(mediaId);

        socket.emit('media:cancel', {
            mediaId
        });

        dispatch(
            updateStatusDownloadQueue({
                mediaId,
                status: 'cancelled'
            })
        );

        try {
            await updateFileStatus(
                'downloadedFiles',
                mediaId,
                'cancelled'
            );
        } catch (error) {
            console.error(error);
        }
    };

    const handleDownload = () => {
        if (!media) {
            return;
        }

        dispatch(
            addDownloadQueue({
                mediaId,
                status: 'pending',
                downloadedBytes: 0,
                totalBytes: media.size,
                error: null
            })
        );
    };

    const handleUpload = () => {
        if (!media) {
            return;
        }

        dispatch(
            addUploadQueue({
                mediaId,
                status: 'pending',
                uploadedBytes: 0,
                totalBytes: media.size,
                error: null
            })
        );
    };

    const handleOpen = () => {
        if (uiButton !== 'openFile') {
            return;
        }

        dispatch(
            updateShowMediaFull({
                active: true,
                mediaId
            })
        );
    };

    useEffect(() => {
    setImageLoaded(false);

    if (file) {
        const objectUrl = URL.createObjectURL(file);

        setSource(objectUrl);

        return () => {
            URL.revokeObjectURL(objectUrl);
        };
    }

    if (thumbnail) {
        setSource(
            `data:image/webp;base64,${thumbnail}`
        );

        return;
    }

    setSource(null);
}, [mediaId, file, thumbnail]);

    if (uiButton === 'uploadProgress') {
        MediaAction = (
            <CircularProgress
                progress={progress}
                onCancel={(e) => {
                    e.stopPropagation();
                    handleUploadCancel();
                }}
            />
        );
    } else if (uiButton === 'downloadProgress') {
        MediaAction = (
            <CircularProgress
                progress={progress}
                onCancel={(e) => {
                    e.stopPropagation();
                    handleDownloadCancel();
                }}
            />
        );
    } else if (uiButton === 'downloadButton') {
        MediaAction = (
            <MediaActionButton
                type="download"
                onClick={(e) => {
                    e.stopPropagation();
                    handleDownload();
                }}
            />
        );
    } else if (uiButton === 'uploadButton') {
        MediaAction = (
            <MediaActionButton
                type="upload"
                onClick={(e) => {
                    e.stopPropagation();
                    handleUpload();
                }}
            />
        );
    }

    return (
        <div className="w-full max-w-[300px] min-w-0">
            <div
                className="
                    relative
                    w-full
                    max-w-[300px]
                    aspect-square
                    flex
                    items-center
                    justify-center
                    overflow-hidden
                    rounded-md
                    cursor-pointer
                "
                onClick={handleOpen}
            >
                {!imageLoaded && (
                    <div className="absolute inset-0 shimmer rounded-md" />
                )}

                {source && (
                    <img
                      src={source}
                      alt={media?.fileName || 'image'}
                      onLoad={() => setImageLoaded(true)}
                      onError={() => {
                          setImageLoaded(false);
                          setSource(null);
                      }}
                      className={`
                          block
                          w-full
                          h-full
                          max-w-full
                          object-contain
                          rounded-md
                          ${
                              imageLoaded
                                  ? 'opacity-100'
                                  : 'opacity-0'
                          }
                      `}
                  />
                )}

                <div className="absolute inset-0 flex items-center justify-center">
                    {MediaAction}
                </div>

                {size && (
                    <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                        {formatFileSize(size)}
                    </div>
                )}
            </div>

            {caption && (
                <div className="px-2 py-2 text-white text-sm break-words">
                    {caption}
                </div>
            )}
        </div>
    );
}

export default Image;