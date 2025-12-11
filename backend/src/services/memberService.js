const db = require("../db/sqlite");

module.exports = {
  // 1) ค้นหาสมาชิก
  searchMember: (keyword) => {
    return db.get(
      `SELECT * FROM members WHERE phone LIKE ? OR name LIKE ? LIMIT 20`,
      [`%${keyword}%`, `%${keyword}%`]
    );
  },

  // 2) สมัครสมาชิกใหม่
  createMember: ({ name, phone }) => {
    return db.run(
      `INSERT INTO members (name, phone, tier, points)
       VALUES (?, ?, 'Normal', 0)`,
      [name, phone]
    );
  },

  // 3) เพิ่มแต้ม
  addPoints: async ({ member_id, points }) => {
    await db.run(
      `UPDATE members SET points = points + ? WHERE id = ?`,
      [points, member_id]
    );

    await db.run(
      `INSERT INTO member_points (member_id, points, source)
       VALUES (?, ?, ?)`,
      [member_id, points, "POS"]
    );

    return db.get(`SELECT * FROM members WHERE id = ?`, [member_id]);
  },

  // 4) เลื่อน Tier อัตโนมัติ
  updateTierIfNeeded: async (member_id) => {
    const member = await db.get(
      `SELECT * FROM members WHERE id = ?`,
      [member_id]
    );

    const tiers = await db.all(`SELECT * FROM member_tiers ORDER BY min_points ASC`);

    let newTier = member.tier;
    for (const t of tiers) {
      if (member.points >= t.min_points) newTier = t.tier;
    }

    if (newTier !== member.tier) {
      await db.run(
        `UPDATE members SET tier = ? WHERE id = ?`,
        [newTier, member_id]
      );
    }

    return newTier;
  },
};
