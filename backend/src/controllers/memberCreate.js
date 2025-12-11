// backend/src/controllers/memberCreate.js

const memberService = require("../services/memberService");

module.exports = async function memberCreate(req, res) {
  try {
    const { name, phone } = req.body;

    if (!name || !phone) {
      return res.json({
        success: false,
        message: "กรุณากรอกชื่อและเบอร์โทร",
      });
    }

    // สร้างสมาชิกใหม่
    const member = await memberService.createMember({ name, phone });

    return res.json({
      success: true,
      message: "สร้างสมาชิกสำเร็จ",
      member,
    });

  } catch (err) {
    console.error("memberCreate error:", err);
    res.json({
      success: false,
      message: "ไม่สามารถสร้างสมาชิกได้",
      error: err.message,
    });
  }
};
