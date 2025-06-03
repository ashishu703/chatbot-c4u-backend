const jwt = require("jsonwebtoken");
const InvalidCredentialsException = require("../exceptions/CustomExceptions/InvalidCredentialsException");
const CredentialsNotProvided = require("../exceptions/CustomExceptions/CredentialsNotProvided");
const TokenExpiredEXception = require("../exceptions/CustomExceptions/TokenExpiredEXception");
const Randomstring = require("randomstring");
const { passwordEncryptionRounds, jwtKey, tokenExpirationTime, frontendURI } = require("../config/app.config");

function generateToken(payload, expiresIn = tokenExpirationTime) {
  return jwt.sign(payload, jwtKey, { expiresIn });
}

const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, jwtKey);
    return decoded;
  } catch (err) {
    throw new InvalidCredentialsException();
  }
};

const encryptPassword = async (password) => {
  return bcrypt.hash(password, passwordEncryptionRounds);
}

const comparePassword = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};

const validateLoginCredentials = (credentials) => {
  const { email, password } = credentials;
  if (!email || !password) {
    throw new CredentialsNotProvided();
  }
};

const createAdminPasswordRecoveryUrl = (admin) => {
  const { email, password } = admin;
  const token = generateToken({
    old_email: email,
    email: email,
    time: moment(new Date()),
    password: password,
    role: "admin",
  })
  return `${frontendURI}/recovery-admin/${token}`;
};

const validateTimeExpiration = (time) => {
  if (moment(time).diff(moment(new Date()), "hours") > 1) {
    throw new TokenExpiredEXception();
  }
}

const generateUid = () => {
  return Randomstring.generate();;
}

const decodeToken = (token) => {
  return jwt.decode(token, { complete: true });
}



module.exports = {
  generateToken,
  verifyToken,
  comparePassword,
  validateLoginCredentials,
  createAdminPasswordRecoveryUrl,
  validateTimeExpiration,
  encryptPassword,
  generateUid,
  decodeToken,
};
