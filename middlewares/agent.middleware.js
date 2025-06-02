const jwt = require("jsonwebtoken");
const { query } = require("../database/dbpromise");

const validateAgent = async (req, res, next) => {
  try {
    const token = req.get("Authorization");
    if (!token) {
      return res.json({ msg: "No token found", logout: true });
    }

    jwt.verify(token.split(" ")[1], process.env.JWTKEY, async (err, decode) => {
      if (err) {
        return res.json({
          success: false,
          msg: "Invalid token found",
          logout: true,
        });
      }

      const { email, password } = decode;

      if (!email || !password) {
        return res.json({
          success: false,
          msg: "Invalid token payload",
          logout: true,
        });
      }

      const getAgent = await query(
        "SELECT * FROM agents WHERE email = $1 AND password = $2",
        [email, password]
      );

      if (getAgent.length < 1) {
        return res.json({
          success: false,
          msg: "Invalid credentials or token",
          logout: true,
        });
      }

      if (getAgent[0]?.is_active < 1) {
        return res.json({
          msg: "You are an inactive agent.",
          logout: true,
          success: false,
        });
      }

      const getOwner = await query("SELECT * FROM users WHERE uid = $1", [
        getAgent[0]?.owner_uid,
      ]);

      if (getOwner.length < 1) {
        return res.json({
          msg: "Agent Owner not found",
          success: false,
        });
      }

      if (getAgent[0].role === "agent") {
        req.owner = getOwner[0];
        req.decode = decode;
        next();
      } else {
        return res.json({
          success: false,
          msg: "Unauthorized token",
          logout: true,
        });
      }
    });
  } catch (err) {
    console.log(err);
    res.json({ msg: "server error", err });
  }
};

module.exports = validateAgent;
