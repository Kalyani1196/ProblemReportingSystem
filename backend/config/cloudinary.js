const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const path = require("path");

const isCloudinaryConfigured = () => {
  return (
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET &&
    process.env.CLOUDINARY_CLOUD_NAME.trim() !== "" &&
    process.env.CLOUDINARY_CLOUD_NAME !== "your_cloudinary_cloud_name"
  );
};

if (isCloudinaryConfigured()) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME.trim(),
    api_key: process.env.CLOUDINARY_API_KEY.trim(),
    api_secret: process.env.CLOUDINARY_API_SECRET.trim(),
  });
}

/**
 * Uploads a file buffer to Cloudinary (or local storage fallback if credentials not set)
 * @param {Buffer} buffer - File buffer from multer
 * @param {string} originalname - Original file name
 * @param {string} folder - Destination subfolder (e.g. 'evidence', 'resolution')
 * @param {object} req - Express request object (used to build URL in local fallback mode)
 * @returns {Promise<{ url: string, publicId: string }>}
 */
const uploadImageBuffer = async (buffer, originalname, folder = "general", req = null) => {
  if (isCloudinaryConfigured()) {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `problem_reporting/${folder}`,
          resource_type: "image",
        },
        (error, result) => {
          if (error) {
            return reject(new Error(`Cloudinary upload failed: ${error.message}`));
          }
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
          });
        }
      );
      uploadStream.end(buffer);
    });
  }

  // Fallback for local development when Cloudinary keys are not yet configured
  const uploadsDir = path.join(__dirname, "..", "uploads", folder);
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  const ext = path.extname(originalname) || ".jpg";
  const filename = `${folder}-${uniqueSuffix}${ext}`;
  const filePath = path.join(uploadsDir, filename);

  fs.writeFileSync(filePath, buffer);

  const host = req ? `${req.protocol}://${req.get("host")}` : `http://localhost:${process.env.PORT || 5000}`;
  return {
    url: `${host}/uploads/${folder}/${filename}`,
    publicId: `local_${folder}_${uniqueSuffix}`,
  };
};

module.exports = {
  cloudinary,
  isCloudinaryConfigured,
  uploadImageBuffer,
};
