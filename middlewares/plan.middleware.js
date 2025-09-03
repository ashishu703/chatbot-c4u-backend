const { getNumberOfDaysFromTimestamp } = require("../utils/date.utils");
const UserRepository = require("../repositories/UserRepository");
const UserPlanExpiredException = require("../exceptions/CustomExceptions/UserPlanExpiredException");

const checkPlan = async (req, res, next) => {
  try {
    if (req.owner) {
      req.decode.uid = req.owner.uid;
    }

    const uid = req.decode.uid;

    const user = await (new UserRepository()).findFirst({ where: { uid } }, ["plan"]);


    // Check if user exists (getUser.rows for pg result)
    if (!user || !user.plan) {
      throw new UserPlanExpiredException();
    }

    const numOfDaysLeft = getNumberOfDaysFromTimestamp(user.plan_expiration);

    if (numOfDaysLeft < 1) {
      throw new UserPlanExpiredException();
    }

    // req.plan = JSON.parse(user.plan);
    next();
  } catch (err) {
    next(err);
  }
};



module.exports = { checkPlan };
