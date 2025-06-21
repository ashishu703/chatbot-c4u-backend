const { getNumberOfDaysFromTimestamp } = require("../utils/date.utils");
const UserRepository = require("../repositories/UserRepository");

const checkPlan = async (req, res, next) => {
  try {
    if (req.owner) {
      req.decode.uid = req.owner.uid;
    }

    const uid = req.decode.uid;

    const user = await (new UserRepository()).findFirst({ where: { uid } }, ["plan"]);


    // Check if user exists (getUser.rows for pg result)
    if (!user || !user.plan) {
      return res.json({
        success: false,
        msg: "Please subscribe a plan to proceed.",
      });
    }

    const numOfDaysLeft = getNumberOfDaysFromTimestamp(user.plan_expiration);

    if (numOfDaysLeft < 1) {
      return res.json({
        success: false,
        msg: "Your plan has expired. Please buy a plan.",
      });
    }

    // req.plan = JSON.parse(user.plan);
    next();
  } catch (err) {
    console.error("Error in checkPlan:", err);
    res
      .status(500)
      .json({ success: false, msg: "Server error", error: err.message });
  }
};



module.exports = { checkPlan };
