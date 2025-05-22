const jwt = require("jsonwebtoken");
const { User } = require("../models");
const HttpException = require("../utils/HttpException");

const validateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new HttpException("No token found", 400);
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || process.env.JWTKEY
    );

    const user = await User.findOne({ where: { uid: decoded.uid } });

    if (!user) {
      throw new HttpException("User not found", 404);
    }

    req.user = user;
    req.decode = decoded;

    next();
  } catch (err) {
    console.error(err);
    if (err.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ success: false, message: "Token has expired" });
    }
    if (err instanceof HttpException) {
      return res
        .status(err.status)
        .json({ success: false, message: err.message });
    }
    res
      .status(401)
      .json({
        success: false,
        message: err.message || "Authentication Failed",
      });
  }
};

module.exports = validateUser;
