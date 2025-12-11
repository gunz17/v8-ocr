// backend/src/controllers/posSell.js

const db = require("../db/sqlite");
const memberService = require("../services/memberService");

module.exports = async function posSell(req, res) {
  try {
    const {
      cart,
      pricingTier,
      discountBill,
      member_id,
      points_to_use,
      payment_method
    } = req.body;

    if (!cart || cart.length === 0) {
      return res.json({
        success: false,
        message: "ไม่มีสินค้าในบิล"
      });
    }

    // --------------------------------------------------------
    // 1. คำนวนยอดบิล
    // --------------------------------------------------------
    let subtotal = 0;
    for (const item of cart) {
      const price =
        pricingTier === "member"
          ? item.member
          : pricingTier === "wholesale"
          ? item.wholesale
          : pricingTier === "salon"
          ? item.salon
          : item.retail;

      subtotal += (price - (item.discount || 0)) * item.qty;
    }

    // ใช้แต้มลด
    const pointDiscount = points_to_use ? points_to_use : 0;

    const total = subtotal - discountBill - pointDiscount;

    // --------------------------------------------------------
    // 2. สร้าง invoice
    // --------------------------------------------------------
    const invoiceNo = "POS" + Date.now();

    const invoiceRes = await db.run(
      `
      INSERT INTO pos_invoices
      (invoice_no, member_id, subtotal, discount, total, points_earned, points_used, payment_method)
      VALUES (?, ?, ?, ?, ?, 0, ?, ?)
    `,
      [
        invoiceNo,
        member_id || null,
        subtotal,
        discountBill,
        total,
        pointDiscount,
        payment_method || "cash"
      ]
    );

    const invoiceId = invoiceRes.lastID;

    // --------------------------------------------------------
    // 3. บันทึกรายการสินค้า
    // --------------------------------------------------------
    for (const item of cart) {
      const price =
        pricingTier === "member"
          ? item.member
          : pricingTier === "wholesale"
          ? item.wholesale
          : pricingTier === "salon"
          ? item.salon
          : item.retail;

      const finalPrice = price - (item.discount || 0);

      await db.run(
        `
        INSERT INTO pos_invoice_items
        (invoice_id, sku, name, qty, price, discount, total)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
        [
          invoiceId,
          item.sku,
          item.name,
          item.qty,
          price,
          item.discount || 0,
          finalPrice * item.qty
        ]
      );
    }

    // --------------------------------------------------------
    // 4. MEMBER LOGIC → use points + earn points + update tier
    // --------------------------------------------------------
    if (member_id) {
      // USE POINTS
      if (pointDiscount > 0) {
        await memberService.usePoints(member_id, invoiceId, pointDiscount);
      }

      // EARN POINTS BASED ON TIER
      const member = await memberService.getMemberById(member_id);
      const tiers = await memberService.getTierList();

      const tier = tiers.find((t) => t.tier_name === member.tier);
      const earnRate = tier ? tier.point_rate : 1;

      const earnPoints = (total * earnRate) / 100;

      await memberService.addPoints(member_id, invoiceId, earnPoints);

      // UPDATE TIER
      await memberService.updateTierIfNeeded(member_id, total);
    }

    return res.json({
      success: true,
      invoice_id: invoiceId,
      invoice_no: invoiceNo,
      total
    });

  } catch (err) {
    console.error("posSell error:", err);
    res.json({
      success: false,
      message: err.message
    });
  }
};
