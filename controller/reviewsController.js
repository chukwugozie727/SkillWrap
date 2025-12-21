const db = require("../modules/db");

exports.createReview = async (req, res) => {
  try {
    const reviewerId = req.user?.id;
    const { exchange_id, rating, review_text } = req.body;

    if (!reviewerId || !exchange_id || !rating || !review_text) {
      return res.status(400).json({ message: "Missing fields" });
    }

    // 1️⃣ Get exchange info
    const exchangeRes = await db.query(
      `SELECT * FROM exchange_skills 
       WHERE id = $1 AND status = 'accepted'`,
      [exchange_id]
    );

    if (exchangeRes.rows.length === 0) {
      return res.status(404).json({ message: "Invalid exchange" });
    }

    const exchange = exchangeRes.rows[0];

    // 2️⃣ Security check (only participants can review)
    if (
      exchange.from_user_id !== reviewerId &&
      exchange.to_user_id !== reviewerId
    ) {
      return res.status(403).json({ message: "Not allowed" });
    }

    // 3️⃣ Determine who is being reviewed
    const toUserId =
      reviewerId === exchange.from_user_id
        ? exchange.to_user_id
        : exchange.from_user_id;

    // 4️⃣ Insert review
    const result = await db.query(
      `
      INSERT INTO reviews (
        exchange_id,
        from_user_id,
        to_user_id,
        skill_offered_id,
        skill_requested_id,
        rating,
        review_text
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7)
      RETURNING *
      `,
      [
        exchange.id,
        reviewerId,
        toUserId,
        exchange.skill_offered_id,
        exchange.skill_requested_id,
        rating,
        review_text,
      ]
    );

    res.status(201).json({
      success: true,
      review: result.rows[0],
    });
  } catch (error) {
    console.error("Review error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
