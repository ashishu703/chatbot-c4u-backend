const jwt = require("jsonwebtoken");
const InvalidCredentialsException = require("../exceptions/CustomExceptions/InvalidCredentialsException");
const CredentialsNotProvided = require("../exceptions/CustomExceptions/CredentialsNotProvided");
const TokenExpiredEXception = require("../exceptions/CustomExceptions/TokenExpiredEXception");

function generateToken(payload, expiresIn = "1h") {
  return jwt.sign(payload, process.env.JWTKEY, { expiresIn });
}

const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWTKEY);
    return decoded;
  } catch (err) {
    throw new InvalidCredentialsException();
  }
};

const encryptPassword = async (password) => {
  return bcrypt.hash(password, process.env.SALT_ROUNDS);
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
  const token = sign(
    {
      old_email: email,
      email: email,
      time: moment(new Date()),
      password: password,
      role: "admin",
    },
    process.env.JWTKEY,
    {}
  );
  const recpveryUrl = `${process.env.FRONTENDURI}/recovery-admin/${token}`;
  return recpveryUrl;
};

const validateTimeExpiration = (time) => {
  if (moment(time).diff(moment(new Date()), "hours") > 1) {
    throw new TokenExpiredEXception();
  }
}




module.exports = {
  generateToken,
  verifyToken,
  comparePassword,
  validateLoginCredentials,
  createAdminPasswordRecoveryUrl,
  validateTimeExpiration,
  encryptPassword
};
