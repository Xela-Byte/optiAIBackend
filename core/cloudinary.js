const cloudinary = require("cloudinary").v2;
require("dotenv").config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_SECRET,
});

const timestamp = new Date().getTime();
const options = {
  resource_type: "auto",
  overwrite: true,
  invalidate: true,
  timestamp: timestamp,
};

async function uploadFileResponse(fileData) {
  const uploadResponse = await cloudinary.uploader.upload(
    fileData.tempFilePath,
    options
  );

  return uploadResponse.secure_url;
}

module.exports = { uploadFileResponse };
