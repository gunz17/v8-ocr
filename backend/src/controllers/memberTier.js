// backend/src/controllers/memberTier.js

const memberService = require("../services/memberService");

module.exports = async function memberTier(req, res) {
  try {
    const { member_id, new_purchase_amount } = req.body;

    if (!member_id || !new_purchase_amount) {
      return res.json({
        success: false,
        message: "ข้อมูลไม่ครบ"
      });
    }

    const newTier = await memberService.updateTierIfNeeded(
      member_id,
      new_purchase_amount
    );

    return res.json({
      success: true,
      new_tier: newTier
    });

  } catch (err) {
    console.error("memberTier error:", err);
    res.json({
      success: false,
      message: "ไม่สามารถอัปเดต Tier ได้",
      error: err.message
    });
  }
};
