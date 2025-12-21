const express = require("express");
const router = express.Router();
const { ensureAuth } = require("../middleware/auth");
const notificationController = require("../controller/notificationController");

// Send notification
router.post("/send-notification", notificationController.sendNotifications);

// Get all notifications for user
router.get("/notification", ensureAuth, notificationController.getUserNotifications);

// Get unread count
router.get("/notification/unread-count", ensureAuth, notificationController.getUnreadCount);

// Mark all notifications as read
router.put("/notification/mark-all-read", ensureAuth, notificationController.markAllRead);

router.delete("/delete/notification", ensureAuth, notificationController.DeleteNotifications)

module.exports = router;
