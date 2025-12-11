// backend/src/routes/member.js

const express = require("express");
const router = express.Router();

const memberCreate = require("../controllers/memberCreate");
const memberSearch = require("../controllers/memberSearch");
const memberPoints = require("../controllers/memberPoints");
const memberTier = require("../controllers/memberTier");

// CREATE MEMBER
router.post("/create", memberCreate);

// SEARCH MEMBER
router.get("/search", memberSearch);

// EARN POINTS
router.post("/earn", memberPoints.earnPoints);

// USE POINTS
router.post("/use", memberPoints.usePoints);

// AUTO-TIER UPDATE
router.post("/update-tier", memberTier);

module.exports = router;
