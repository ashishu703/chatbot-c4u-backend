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

    const uid = decoded.uid || decoded.id;

    const user = await (new UserRepository()).findFirst({ where: { uid } });
    if (!user) throw new Error("User not found");

    req.user = user;
    req.decode = { ...decoded, uid }; 

    next();
  } catch (err) {
    throw new InvalidCredentialsException();
  }
};

module.exports = validateUser;
