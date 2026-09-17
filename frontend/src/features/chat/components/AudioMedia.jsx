import React, { useEffect, useRef, useState } from "react";
import { CircularProgress } from "./CircularProgress";
import { Play, Pause, Volume2 } from "lucide-react";
import MediaActionButton from "./MediaActionButton";
import { useSelector, useDispatch } from "react-redux";
import {
  getDownloadAbortController,
  deleteDownloadAbortController,
  getUploadAbortController,
  deleteUploadAbortController
} from "../services/abortController";
import { updateStatusDownloadQueue, addDownloadQueue,addUploadQueue,updateStatusUploadQueue } from "../state/media";
import { updateFileStatus } from "../services/indexedDbServices";
import { getSocket } from "../../../socket/socketClient";
import { formatFileSize } from "../services/fileSizeFormatter";
import axios from "axios";
function AudioComponent({ file, uiButton, progress, mediaId }) {
  const dispatch = useDispatch();

  const mediaStore = useSelector(
    (state) => state.media.MediaStore
  );

  const byId = mediaStore.byId;
  const media = byId[mediaId];

  const audioRef = useRef(null);
  const audioUrlRef = useRef(null);

  const [audioUrl, setAudioUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(
    media?.duration || 0
  );
  useEffect(() => {
    if (uiButton !== "openFile" || !file) {
      return;
    }

    const url = URL.createObjectURL(file);

    audioUrlRef.current = url;
    setAudioUrl(url);

    return () => {
      URL.revokeObjectURL(url);
      audioUrlRef.current = null;
    };
  }, [file, uiButton]);

  const handleLoadedMetadata = () => {
    if (!audioRef.current) return;

    setDuration(audioRef.current.duration);
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;

    setCurrentTime(audioRef.current.currentTime);
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handlePlay = (e) => {
    e.stopPropagation();

    if (!audioRef.current) return;

    audioRef.current.play();

    setIsPlaying(true);
  };

  const handlePause = (e) => {
    e.stopPropagation();

    if (!audioRef.current) return;

    audioRef.current.pause();

    setIsPlaying(false);
  };
  const handleSeek = (e) => {
    e.stopPropagation();

    if (!audioRef.current) return;

    const newTime = Number(e.target.value);

    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleDownloadCancel = async () => {
    const controller = getDownloadAbortController(mediaId);
    const socket = getSocket();

    if (!controller) {
      return;
    }

    controller.abort();

    deleteDownloadAbortController(mediaId);

    socket.emit("media:cancel", {
      mediaId: mediaId,
    });

    dispatch(
      updateStatusDownloadQueue({
        mediaId: mediaId,
        status: "cancelled",
      })
    );

    await updateFileStatus(
      "downloadedFiles",
      mediaId,
      "cancelled"
    );
  };

  const handleDownload = () => {
    dispatch(
      addDownloadQueue({
        mediaId: mediaId,
        status: "pending",
        downloadedBytes: 0,
        totalBytes: byId[mediaId].size,
        error: null,
      })
    );
  };
  const handleUpload=()=>{
     dispatch(addUploadQueue({
            mediaId:mediaId,
            status:"pending",
            uploadedBytes:0,
            totalBytes:byId[mediaId].size,
            error: null,
          }))
  }
  const handleUploadCancel=async()=>{
    const controller=getUploadAbortController(mediaId);
    if(!controller){
        return;
    }
    controller.abort();
    deleteUploadAbortController(mediaId);
    dispatch(updateStatusUploadQueue({
        mediaId:mediaId,
        status:"cancelled"
    }))
    await axios.get(`/api/chat/cancelUpload/${mediaId}`);
  }
  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) {
      return "0:00";
    }

    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);

    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };


  let MediaAction = null;

  if (uiButton === "downloadProgress") {
    MediaAction = (
      <CircularProgress
        progress={progress}
        onCancel={(e) => {
          e.stopPropagation();
          handleDownloadCancel();
        }}
      />
    );
  } else if(uiButton === "uploadProgress") {
    MediaAction = (
      <CircularProgress
        progress={progress}
        onCancel={(e) => {
          e.stopPropagation();
          handleUploadCancel();
        }}
      />
    );
  }
  else if (uiButton === "downloadButton") {
    MediaAction = (
      <MediaActionButton
        type="download"
        onClick={(e) => {
          e.stopPropagation();
          handleDownload();
        }}
      />
    );
  } 
  else if (uiButton === "uploadButton") {
    MediaAction = (
      <MediaActionButton
        type="upload"
        onClick={(e) => {
          e.stopPropagation();
          handleUpload();
        }}
      />
    );
  }else if (uiButton === "openFile") {
    MediaAction = isPlaying ? (
      <Pause
        size={20}
        fill="white"
        className="text-white"
        onClick={handlePause}
      />
    ) : (
      <Play
        size={20}
        fill="white"
        className="text-white ml-0.5"
        onClick={handlePlay}
      />
    );
  }

  const size = byId[mediaId]?.size;
  const caption=byId[mediaId]?.caption;
  const isDownloaded = uiButton === "openFile";
  const isDownloading = uiButton === "downloadProgress";

  return (
   <div className="w-[300px] max-w-full">

  {/* Audio Player */}
  <div
    className="
      flex
      items-center
      gap-3
      relative
      w-full
      px-3
      py-2
      rounded-lg
    "
  >
    {/* Play / Download / Progress */}
    <div
      className="
        w-[40px]
        h-[40px]
        flex
        items-center
        justify-center
        shrink-0
      "
    >
      {MediaAction}
    </div>

    {/* Seekbar + Time */}
    <div className="flex-1 min-w-0">

      <input
        type="range"
        min="0"
        max={isDownloading ? 100 : duration || 0}
        value={isDownloading ? progress || 0 : currentTime}
        disabled={isDownloading}
        onChange={handleSeek}
        className="w-full h-1 cursor-pointer"
      />

      <div
        className="
          flex
          items-center
          justify-between
          text-xs
          text-white/70
          mt-1
        "
      >
        {isDownloading ? (
          <span>
            {Math.round(progress || 0)}%
          </span>
        ) : (
          <>
            <span>
              {formatTime(currentTime)}
            </span>

            <span>
              {formatTime(duration)}
            </span>
          </>
        )}
      </div>

    </div>

    {/* Volume */}
    <Volume2
      size={16}
      className="text-white/70 shrink-0"
    />

    {/* Actual Audio */}
    {isDownloaded && audioUrl && (
      <audio
        ref={audioRef}
        src={audioUrl}
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
      />
    )}
  </div>

  {/* Caption */}
  {caption && (
    <div className="px-3 pb-2">
      <p className="text-[14px] leading-5 text-white break-words">
        {caption}
      </p>
    </div>
  )}

</div>
  );
}

export default AudioComponent;