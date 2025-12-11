// backend/src/controllers/memberPoints.js

const memberService = require("../services/memberService");

module.exports = {
  earnPoints,
  usePoints
};

// --------------------------------------------------------
// CUSTOMER EARNS POINTS FROM POS SALE
// --------------------------------------------------------
async function earnPoints(req, res) {
  try {
    const { member_id, invoice_id, amount } = req.body;

    if (!member_id || !invoice_id || !amount) {
      return res.json({
        success: false,
        message: "ข้อมูลไม่ครบ"
      });
    }

    await memberService.addPoints(member_id, invoice_id, amount);

    return res.json({
      success: true,
      message: "เพิ่มแต้มสำเร็จ"
    });

  } catch (err) {
    console.error("earnPoints error:", err);
    res.json({
      success: false,
      message: "เพิ่มแต้มไม่สำเร็จ",
      error: err.message
    });
  }
}

// --------------------------------------------------------
// CUSTOMER USES POINTS AS DISCOUNT
// --------------------------------------------------------
async function usePoints(req, res) {
  try {
    const { member_id, invoice_id, amount } = req.body;

    if (!member_id || !invoice_id || !amount) {
      return res.json({
        success: false,
        message: "ข้อมูลไม่ครบ"
      });
    }

    await memberService.usePoints(member_id, invoice_id, amount);

    return res.json({
      success: true,
      message: "ใช้แต้มสำเร็จ"
    });

  } catch (err) {
    console.error("usePoints error:", err);
    res.json({
      success: false,
      message: err.message
    });
  }
}
