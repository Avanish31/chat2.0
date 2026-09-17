import React from "react";

function LargePreview({
  icon,
  category,
  type,
  preview,
  validationErrors
}) {
  let content = null;

  if (validationErrors.length === 0) {
    switch (category) {
      case "image":
        content = (
          <img
            src={preview}
            className="max-w-[600px] max-h-[400px] w-auto h-auto object-contain"
          />
        );
        break;

      case "video":
        content = (
          <video
            src={preview}
            controls
            className="max-w-[600px] max-h-[400px] w-auto h-auto object-contain"
          />
        );
        break;

      case "audio":
        content = (
          <audio
            src={preview}
            controls
            className="w-[400px] max-w-full"
          />
        );
        break;

      case "document":
        if (type === "pdf") {
          content = (
            <img
              src={preview}
              className="max-w-[400x] max-h-[400px] w-auto h-auto object-contain"
            />
          );
        } else {
          content = (
            <img
              src={icon}
              className="max-w-[300px] max-h-[300px] w-auto h-auto object-contain"
            />
          );
        }
        break;

      default:
        content = (
          <img
            src={icon}
            className="max-w-[300px] max-h-[300px] w-auto h-auto object-contain"
          />
        );
    }
  } else {
    content = (
      <p className="mt-2 rounded-md px-3 py-2 text-sm font-medium">
        {validationErrors[0].message}
      </p>
    );
  }

  return (
    <div className="max-w-[600px] max-h-[500px] flex items-center justify-center overflow-hidden">
      {content}
    </div>
  );
}

export default LargePreview;