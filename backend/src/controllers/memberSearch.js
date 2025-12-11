// backend/src/controllers/memberSearch.js

const memberService = require("../services/memberService");

module.exports = async function memberSearch(req, res) {
  try {
    const { keyword } = req.query;

    if (!keyword || keyword.trim() === "") {
      return res.json({
        success: false,
        message: "กรุณากรอกคำค้นหา",
        members: [],
      });
    }

    const members = await memberService.searchMember(keyword);

    return res.json({
      success: true,
      members,
    });

  } catch (err) {
    console.error("memberSearch error:", err);
    return res.json({
      success: false,
      message: "ค้นหาสมาชิกไม่สำเร็จ",
      error: err.message,
    });
  }
};
