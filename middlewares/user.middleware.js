const jwt = require("jsonwebtoken");
const UserRepository = require("../repositories/UserRepository");
const InvalidCredentialsException = require("../exceptions/CustomExceptions/InvalidCredentialsException");
const { jwtKey } = require("../config/app.config");
const { USER } = require("../types/roles.types");

const validateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) throw new Error("No token found");
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, jwtKey);
    if (decoded.role !== USER) throw new Error("Invalid token found");
    const user = await (new UserRepository()).findFirst({ where: { uid: decoded.uid } });
    if (!user) throw new Error("User not found");
    req.user = user;
    req.decode = decoded;
    next();
  } catch (err) {
    console.error("Server error in validateUser:", err);
    throw new InvalidCredentialsException();
  }
};

module.exports = validateUser;
