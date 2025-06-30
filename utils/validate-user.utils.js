const { verifyToken } = require("../utils/authUtils");
const HttpException = require("./HttpException");

const validateUser = async (req, res, next) => {
  try {
    let token = req.headers.authorization;
    if (!token) {
      throw new HttpException("Invalid token provided", 400);
    }
    token = token.split(" ")[1];
    const decoded = verifyToken(token);
    req.decode = decoded;
    next();
  } catch (error) {
    res.status(400).json({ message: "Token expired" });
  }
};

module.exports = validateUser;
