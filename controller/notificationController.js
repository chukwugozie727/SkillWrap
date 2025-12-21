const db = require("../modules/db");

exports.sendNotifications = async (req, res) => {
  try {
    const senderId = req.user?.id;
    if (!senderId)
      return res.status(401).json({ success: false, message: "Not authenticated" });

    const { receiverId, message, metadata, roomCode } = req.body;

    if (!receiverId || !message)
      return res.status(400).json({ success: false, message: "receiverId and message are required" });

    const result = await db.query(
      `INSERT INTO notifications 
       (sender_id, receiver_id, message, roomId, metadata, is_read)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [senderId, receiverId, message, roomCode || null, metadata || null, false]
    );

    res.status(201).json({ success: true, notification: result.rows[0] });
  } catch (error) {
    console.error("error sending notification", error);
    res.status(500).json({ success: false, message: "something went wrong" });
  }
};


// Get user notifications
exports.getUserNotifications = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: "Not authenticated" });

    const result = await db.query(
      `SELECT * FROM notifications WHERE receiver_id = $1 ORDER BY created_at DESC`,
      [userId]
    );

    res.json({ success: true, notifications: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};

// Get unread count
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await db.query(
      "SELECT COUNT(*) AS count FROM notifications WHERE receiver_id = $1 AND is_read = false",
      [userId]
    );

    const count = parseInt(result.rows[0].count, 10) || 0;
    res.json({ success: true, count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};

// Mark all notifications read
exports.markAllRead = async (req, res) => {
  try {
    await db.query("UPDATE notifications SET is_read = true WHERE receiver_id = $1", [req.user.id]);
    res.json({ success: true });
    console.log("sucess")
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};


exports.DeleteNotifications = async (req, res) => {
  try {
    await db.query("DELETE FROM notifications where receiver_id = $1", [req.user.id])
    res.json({sucess: true})
    console.log("succesful delete")
  } catch (error) {
    console.error(err);
    res.status(500).json({ success: false });
  }
}