import { validateMedia ,getFileCategory} from "./validateMedia";
import { saveFile } from "./file";
import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;
const FILE_ICONS = {
    pdf: "/images/pdf.png",
    doc: "/images/word.png",
    docx: "/images/docx.png",
    xls: "/images/xls.png",
    xlsx: "/images/sheet.png",
    ppt: "/images/ppt.png",
    pptx: "/images/pptx.png",
    txt: "/images/defaultdoc.png",
    csv:"/images/csv.png",
    json:"/images/json.png",
    rar:"/images/rar.png",
    zip7:"/images/7z.png",
    zip: "/images/zip.png",
    audio:"/images/audio.png",
    video:"/images/video.png",
    unknown:"/images/defaultdoc.png"
};
export function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onloadend = () => {
            const base64 = reader.result.split(",")[1];
            resolve(base64);
        };

        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}
export async function getVideoThumbnail(file) {
    return new Promise((resolve, reject) => {
        const video = document.createElement("video");
        const url = URL.createObjectURL(file);

        video.src = url;
        video.preload = "auto";
        video.muted = true;
        video.playsInline = true;

        video.onloadedmetadata = () => {
            try {
                const width = video.videoWidth;
                const height = video.videoHeight;

                console.log("METADATA LOADED");
                console.log("dimensions:", width, height);
                console.log("duration:", video.duration);

                // Seek to an actual frame
                video.currentTime = Math.min(1, video.duration);

            } catch (error) {
                URL.revokeObjectURL(url);
                reject(error);
            }
        };

        video.onseeked = async () => {
            try {
                console.log("SEEKED");
                console.log("currentTime:", video.currentTime);
                console.log("readyState:", video.readyState);

                const width = video.videoWidth;
                const height = video.videoHeight;

                const canvas = document.createElement("canvas");

                canvas.width = width;
                canvas.height = height;

                const context = canvas.getContext("2d");

                // Blur the captured frame
                context.filter = "blur(4px)";

                context.drawImage(
                    video,
                    0,
                    0,
                    width,
                    height
                );

                // Check whether an actual frame was drawn
                const pixel = context.getImageData(
                    Math.floor(width / 2),
                    Math.floor(height / 2),
                    1,
                    1
                ).data;

                console.log("CENTER PIXEL:", pixel);

                const preview = await new Promise((resolve, reject) => {
                    canvas.toBlob(
                        blob => {
                            if (blob) {
                                resolve(blob);
                            } else {
                                reject(
                                    new Error("Failed to create preview")
                                );
                            }
                        },
                        "image/webp",
                        0.3
                    );
                });

                URL.revokeObjectURL(url);

                resolve({
                    preview,
                    duration: video.duration,
                    width,
                    height
                });

            } catch (error) {
                URL.revokeObjectURL(url);
                reject(error);
            }
        };

        video.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error("Failed to load video."));
        };
    });
}
export async function getImageThumbnail(file) {
    return new Promise((resolve, reject) => {
        const image = new Image();
        const url = URL.createObjectURL(file);

        image.src = url;

        image.onload = async () => {
            try {
                // Keep original image dimensions
                const width = image.naturalWidth;
                const height = image.naturalHeight;

                const canvas = document.createElement("canvas");

                canvas.width = width;
                canvas.height = height;

                const context = canvas.getContext("2d");

                context.filter = "blur(50px)";

                context.drawImage(
                    image,
                    0,
                    0,
                    width,
                    height
                );

                const preview = await new Promise((resolve, reject) => {
                    canvas.toBlob(
                        blob => blob
                            ? resolve(blob)
                            : reject(new Error("Failed to create preview")),
                        "image/webp",
                        0.3
                    );
                });

                URL.revokeObjectURL(url);

                resolve({
                    preview,
                    width,
                    height
                });

            } catch (error) {
                URL.revokeObjectURL(url);
                reject(error);
            }
        };

        image.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error("Failed to load image."));
        };
    });
}
export async function getPdfThumbnail(file) { 
    const buffer = await file.arrayBuffer(); 
 
    const pdf = await pdfjsLib.getDocument({ 
        data: buffer 
    }).promise; 
 
    const page = await pdf.getPage(1); 
 
    const viewport = page.getViewport({ scale: 1.5 }); 
 
    const canvas = document.createElement("canvas"); 
    const context = canvas.getContext("2d"); 
 
    canvas.width = viewport.width; 
    canvas.height = viewport.height; 
 
    await page.render({ 
        canvasContext: context, 
        viewport 
    }).promise; 
 
    const preview = await new Promise((resolve, reject) => {
        canvas.toBlob(
            blob => blob
                ? resolve(blob)
                : reject(new Error("Failed to create preview")),
            "image/webp",
            0.3
        );
    });

    return { 
        preview, 
        pages: pdf.numPages 
    }; 
}
async function getPdfPreview(file) {
    const buffer = await file.arrayBuffer();

    const pdf = await pdfjsLib.getDocument({
        data: buffer
    }).promise;

    const page = await pdf.getPage(1);

    const viewport = page.getViewport({ scale: 1.5 });

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({
        canvasContext: context,
        viewport
    }).promise;

    return {
        preview: canvas.toDataURL("image/png"),
        pages: pdf.numPages
    };
}
export async function getVideoPreview(file) {
    return new Promise((resolve, reject) => {
        const video = document.createElement("video");
        const url = URL.createObjectURL(file);

        video.src = url;
        video.preload = "metadata";
        video.muted = true;

        video.onloadedmetadata = () => {
    console.log("METADATA LOADED");
    console.log("duration:", video.duration);
    console.log("dimensions:", video.videoWidth, video.videoHeight);

    // Jump into the actual video
    video.currentTime = 1;
};

video.onseeked = () => {
    console.log("SEEKED");
    console.log("currentTime:", video.currentTime);
    console.log("readyState:", video.readyState);

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");

    context.drawImage(
        video,
        0,
        0,
        canvas.width,
        canvas.height
    );

    const pixel = context.getImageData(
        Math.floor(canvas.width / 2),
        Math.floor(canvas.height / 2),
        1,
        1
    ).data;

    console.log("CENTER PIXEL:", pixel);

    const preview = canvas.toDataURL("image/png");

    console.log("PREVIEW LENGTH:", preview.length);

    resolve({
        preview,
        duration: video.duration,
        width: video.videoWidth,
        height: video.videoHeight
    });

    URL.revokeObjectURL(url);
};

        video.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error("Failed to load video."));
        };
    });
}
export function getIcon(category,type){
    let icon=null;
    switch (category) {
        case "image":
            icon=null;
            break;

        case "video": {
            icon=null;
            break;
        }
        case "audio":
            icon=FILE_ICONS[category];
            break;

        case "document":
            if (type === "pdf") {
                icon = FILE_ICONS.pdf;
            } else {
                icon = FILE_ICONS[type] ?? FILE_ICONS.unknown;
                
            }
            break;

        default:
            icon = FILE_ICONS.unknown;
            
    }
    return icon;
}
function getExtension(filename) {
    const lastDot = filename.lastIndexOf(".");
    const lastSlash = Math.max(
        filename.lastIndexOf("/"),
        filename.lastIndexOf("\\")
    );

    if (lastDot <= lastSlash || lastDot === filename.length - 1) {
        return "";
    }

    return filename.slice(lastDot).toLowerCase();
}
export async function generatePreview(validatedFiles) {
    const files = [
        ...validatedFiles.validFiles,
        ...validatedFiles.invalidFiles
    ];

    const formatted = await Promise.all(
        files.map(async (file) => {
            const tempId = crypto.randomUUID();

            const { category, type } = getFileCategory(file);

            let preview = null;
            let icon = null;
            let dimensions = null;
            let duration = null;
            let pages = null;
            let validationErrors = [];

            if (!file.errors) {
                try {
                    switch (category) {
                        case "image":
                            preview = URL.createObjectURL(file);
                            icon=preview;
                            break;

                        case "video": {
                            preview = URL.createObjectURL(file);
                            icon=FILE_ICONS[category];
                            break;
                        }
                        case "audio":
                            preview = URL.createObjectURL(file);
                            icon=FILE_ICONS[category];
                            break;

                        case "document":
                            if (type === "pdf") {
                                const metaData = await getPdfPreview(file);
                                preview = metaData.preview;
                                pages = metaData.pages;
                                icon = FILE_ICONS.pdf;
                            } else {
                                icon = FILE_ICONS[type] ?? FILE_ICONS.unknown;
                                preview = icon;
                            }
                            break;

                        default:
                            icon = FILE_ICONS.unknown;
                            preview = icon;
                    }
                
                } catch (err) {
                    console.error(err);
                    preview = FILE_ICONS.unknown;
                    icon = FILE_ICONS.unknown;
                }
                saveFile(tempId,file);
            } else {
                preview =  FILE_ICONS.unknown;
                icon =  FILE_ICONS.unknown;
                validationErrors = file.errors;
            }
            console.log("EXTENSION ",getExtension(file.name));
            return {
                mediaId:tempId,
                preview,
                icon,
                category,
                type,
                name: file.name,
                size: file.size,
                mimeType:file.Type,
                caption:"",
                pages,
                validationErrors,
                extension:getExtension(file.name)
            };

        })
    );

    return formatted;
}