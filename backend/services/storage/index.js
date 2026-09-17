const provider = process.env.STORAGE_PROVIDER || "local";

let storage;

switch (provider) {
    case "firebase":
        storage = require("./firebaseStorage");
        break;

    case "s3":
        storage = require("./s3Storage");
        break;

    case "local":
    default:
        storage = require("./localStorage");
}

module.exports = storage;