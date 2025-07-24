const jwt = require("jsonwebtoken");
const AdminRepository = require("../repositories/AdminRepository");
const { ADMIN } = require("../types/roles.types");
const InvalidCredentialsException = require("../exceptions/CustomExceptions/InvalidCredentialsException");
const { jwtKey } = require("../config/app.config");




const adminValidator = async (req, res, next) => {
  try {
    const authHeader = req.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) throw new Error("No token found");
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, jwtKey);
    if (decoded.role !== ADMIN) throw new InvalidCredentialsException();
    const admin = await (new AdminRepository()).findFirst({ where: { uid: decoded.uid } });
    if (!admin) throw new InvalidCredentialsException();
    req.decode = decoded;
    req.user = decoded;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = adminValidator;
