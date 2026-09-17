function MediaActionButton({ type, onClick }) {
  const isUpload = type === "upload";

  return (
    <button
      onClick={onClick}
      title={isUpload ? "Upload" : "Download"}
      className="w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm
                 text-white flex items-center justify-center
                 hover:bg-black/70 transition"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
      >
        {isUpload ? (
          <>
            {/* Upload arrow */}
            <path
              d="M12 20V8"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />

            <path
              d="M7 12L12 7L17 12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </>
        ) : (
          <>
            {/* Download arrow */}
            <path
              d="M12 4V16"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />

            <path
              d="M7 12L12 17L17 12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </>
        )}
      </svg>
    </button>
  );
}

export default MediaActionButton;