// const multer = require("multer");
// const path = require("path");

// // ✅ Configure multer
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "uploads/skills/");
//     cb(null, "uploads/profiles");

//   },
//   filename: (req, file, cb) => {
//     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     cb(null, uniqueSuffix + path.extname(file.originalname));
//   },
// });

// const upload = multer({ storage });

// module.exports = upload












const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ✅ Configure multer with dynamic destination
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = "uploads/skills"; // default

    // Determine which route or purpose is uploading
    if (req.originalUrl.includes("upload-profile")) {
      uploadPath = "uploads";
    } else if (req.originalUrl.includes("create-skill")) {
      uploadPath = "uploads";
    }

    // Ensure directory exists
    fs.mkdirSync(uploadPath, { recursive: true });

    cb(null, uploadPath);
  },

  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

module.exports = upload;
