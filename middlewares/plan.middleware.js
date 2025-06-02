const jwt = require("jsonwebtoken");
const { query } = require("../database/dbpromise");
const { getNumberOfDaysFromTimestamp } = require("../functions/function");

const checkPlan = async (req, res, next) => {
  try {
    if (req.owner) {
      req.decode.uid = req.owner.uid;
    }

    const getUser = await query(`SELECT * FROM "users" WHERE uid = $1`, [
      req.decode.uid,
    ]);

    // Check if user exists (getUser.rows for pg result)
    const user = getUser[0];
    if (!user || !user.plan) {
      return res.json({
        success: false,
        msg: "Please subscribe a plan to proceed.",
      });
    }

    const numOfDaysLeft = getNumberOfDaysFromTimestamp(user.plan_expire);

    if (numOfDaysLeft < 1) {
      return res.json({
        success: false,
        msg: "Your plan has expired. Please buy a plan.",
      });
    }

    req.plan = JSON.parse(user.plan);
    next();
  } catch (err) {
    console.error("Error in checkPlan:", err);
    res
      .status(500)
      .json({ success: false, msg: "Server error", error: err.message });
  }
};

const checkContactLimit = async (req, res, next) => {
  try {
    const contact_limit = req.plan?.contact_limit || 0;

    const getContacts = await query(`SELECT * FROM contacts WHERE uid = $1`, [
      req.decode.uid,
    ]);

    if (getContacts.length >= contact_limit) {
      return res.json({
        success: false,
        msg: `Your plan allows you to add only ${contact_limit} contacts. Delete some to add new.`,
      });
    }

    next();
  } catch (err) {
    console.error("Error in checkContactLimit:", err);
    res
      .status(500)
      .json({ success: false, msg: "Server error", error: err.message });
  }
};

const checkNote = async (req, res, next) => {
  try {
    if (req.plan?.allow_note > 0) {
      next();
    } else {
      return res.json({
        success: false,
        msg: "Your plan does not allow you to add or edit chat notes.",
      });
    }
  } catch (err) {
    console.error("Error in checkNote:", err);
    res
      .status(500)
      .json({ success: false, msg: "Server error", error: err.message });
  }
};

const checkTags = async (req, res, next) => {
  try {
    if (req.plan?.allow_tag > 0) {
      next();
    } else {
      return res.json({
        success: false,
        msg: "Your plan does not allow you to add or edit chat tags.",
      });
    }
  } catch (err) {
    console.error("Error in checkTags:", err);
    res
      .status(500)
      .json({ success: false, msg: "Server error", error: err.message });
  }
};

module.exports = { checkPlan, checkContactLimit, checkNote, checkTags };
