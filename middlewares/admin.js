const jwt = require("jsonwebtoken");
const { Admin } = require("../models");
const HttpException = require("./HttpException");

const adminValidator = async (req, res, next) => {
  try {
    const authHeader = req.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ msg: "No token found", logout: true });
    }

    const token = authHeader.split(" ")[1];

    jwt.verify(token, process.env.JWTKEY, async (err, decoded) => {
      if (err) {
        console.error("JWT Error:", err);
        if (err.name === "TokenExpiredError") {
          return res
            .status(401)
            .json({
              msg: "Token has expired. Please log in again.",
              logout: true,
            });
        }
        return res
          .status(401)
          .json({ msg: "Invalid token found", logout: true });
      }
      const admin = await Admin.findOne({ where: { uid: decoded.uid } });
      if (!admin) {
        return res
          .status(403)
          .json({ msg: "Admin not found or unauthorized", logout: true });
      }

      if (decoded.role !== "admin") {
        return res
          .status(403)
          .json({ msg: "Unauthorized token", logout: true });
      }
      req.decode = decoded;
      req.user = decoded;
      next();
    });
  } catch (err) {
    console.error("Server error in adminValidator:", err);
    return res.status(500).json({ msg: "Server error", err });
  }
};

module.exports = adminValidator;
