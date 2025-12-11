// backend/src/services/memberService.js

const db = require("../db/sqlite");

module.exports = {
  createMember,
  searchMember,
  addPoints,
  usePoints,
  getMemberById,
  updateTierIfNeeded,
  getTierList,
};

// --------------------------------------------------------
// CREATE MEMBER
// --------------------------------------------------------
async function createMember({ name, phone }) {
  const memberCode = "MB" + Date.now(); // simple unique code

  await db.run(
    `
    INSERT INTO members (member_code, name, phone, tier, point, total_spent)
    VALUES (?, ?, ?, 'BRONZE', 0, 0)
  `,
    [memberCode, name, phone]
  );

  return await db.get(`SELECT * FROM members WHERE member_code = ?`, [memberCode]);
}

// --------------------------------------------------------
// SEARCH MEMBER (phone or name or code)
// --------------------------------------------------------
async function searchMember(keyword) {
  const k = `%${keyword}%`;
  return await db.all(
    `
    SELECT *
    FROM members
    WHERE phone LIKE ? OR name LIKE ? OR member_code LIKE ?
    ORDER BY created_at DESC
  `,
    [k, k, k]
  );
}

// --------------------------------------------------------
// GET MEMBER BY ID
// --------------------------------------------------------
async function getMemberById(id) {
  return await db.get(`SELECT * FROM members WHERE id = ?`, [id]);
}

// --------------------------------------------------------
// ADD POINTS (earn points)
// --------------------------------------------------------
async function addPoints(memberId, invoiceId, amount) {
  if (!amount || amount <= 0) return;

  // update point balance
  await db.run(
    `UPDATE members SET point = point + ? WHERE id = ?`,
    [amount, memberId]
  );

  // insert history
  await db.run(
    `
    INSERT INTO member_points_history (member_id, invoice_id, point_change, type)
    VALUES (?, ?, ?, 'earn')
  `,
    [memberId, invoiceId, amount]
  );
}

// --------------------------------------------------------
// USE POINTS (customer uses points to discount)
// --------------------------------------------------------
async function usePoints(memberId, invoiceId, amount) {
  const m = await getMemberById(memberId);
  if (!m) throw new Error("Member not found");

  if (m.point < amount) throw new Error("แต้มไม่พอ");

  await db.run(
    `UPDATE members SET point = point - ? WHERE id = ?`,
    [amount, memberId]
  );

  // insert history
  await db.run(
    `
    INSERT INTO member_points_history (member_id, invoice_id, point_change, type)
    VALUES (?, ?, ?, 'use')
  `,
    [memberId, invoiceId, amount]
  );
}

// --------------------------------------------------------
// GET ALL TIER RULES
// --------------------------------------------------------
async function getTierList() {
  return await db.all(`SELECT * FROM membership_tiers ORDER BY min_spent ASC`);
}

// --------------------------------------------------------
// UPDATE MEMBER TIER (AUTO UPGRADE)
// --------------------------------------------------------
async function updateTierIfNeeded(memberId, newPurchaseAmount) {
  const member = await getMemberById(memberId);
  if (!member) return;

  // update total spent
  const newTotal = member.total_spent + newPurchaseAmount;
  await db.run(
    `UPDATE members SET total_spent = ? WHERE id = ?`,
    [newTotal, memberId]
  );

  // get tiers
  const tiers = await getTierList();

  // find correct tier based on total_spent
  let selectedTier = "BRONZE";
  for (const tier of tiers) {
    if (newTotal >= tier.min_spent) {
      selectedTier = tier.tier_name;
    }
  }

  // update tier
  await db.run(
    `UPDATE members SET tier = ? WHERE id = ?`,
    [selectedTier, memberId]
  );

  return selectedTier;
}
