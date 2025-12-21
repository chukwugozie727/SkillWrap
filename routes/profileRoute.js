// // routes/profileRoutes.js
// const express = require("express");
// const router = express.Router();
// const profileController = require("../controllers/profileController");

// router.get("/profile/:userId", profileController.getUserProfile);

// module.exports = router;








// // routes/profileRoutes.js
// const express = require("express");
// const router = express.Router();
// const profileController = require("../controller/profileController");

// router.get("/profile/:userId", profileController.getUserProfile);

// module.exports = router;



 const express = require("express");
const router = express.Router();
const profileController = require("../controller/profileController");

/**
 * GET /api/profile/:username
 */
router.get("/profile/:username", profileController.getUserProfile);


module.exports = router;
