const express = require("express");
const router = express.Router();
const upload = require("..//middleware/multerConfig")
const skillController = require("../controller/skillController")
const {ensureAuth} = require("../middleware/auth");




// const multer = require("multer");
// const path = require("path");

// // ✅ Configure multer
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "uploads/skills");
//   },
//   filename: (req, file, cb) => {
//     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     cb(null, uniqueSuffix + path.extname(file.originalname));
//   },
// });

// const upload = multer({ storage });

router.get("/", skillController.home)
router.get("/search", skillController.search)
router.post("/create-skill", ensureAuth, upload.single("image"), skillController.createSkill)
router.get("/skills/:id", skillController.oneskill)
router.get("/skills", skillController.getSkills);
router.get("/view-skill", skillController.viewSkill)
router.patch("/skill/:skillId/edit-skill", skillController.edit_skill);
router.delete("/skill/:skillId", skillController.delete_skill)

// router.post("/create-skill", upload.single("file"), createSkill);
// router.post("/create-skill", ensureAuth, skillController.createSkill)

module.exports = router