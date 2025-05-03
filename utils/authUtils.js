
const jwt = require('jsonwebtoken');

function generateToken(payload, expiresIn = '1h') {
  return jwt.sign(payload, process.env.JWTKEY, { expiresIn });
}


const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWTKEY);
    return decoded;
  } catch (err) {
    throw new Error('Invalid token');
  }
};

module.exports = { generateToken, verifyToken };