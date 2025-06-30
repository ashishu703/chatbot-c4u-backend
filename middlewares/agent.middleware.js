const jwt = require("jsonwebtoken");
const AgentRepository = require("../repositories/AgentRepository");
const HttpException = require("../utils/http-exception.utils");

const validateAgent = async (req, res, next) => {
  try {
    const token = req.get("Authorization");
    if (!token) {
      throw new HttpException("No token found", 400);
    }

    jwt.verify(token.split(" ")[1], process.env.JWTKEY, async (err, decode) => {
      if (err) {
        throw new HttpException("Invalid token found", 400);
      }

      const { email } = decode;

      if (!email) {
        throw new HttpException("Invalid token payload", 400);
      }

      const agent = await (new AgentRepository()).findByEmail(email, ["owner"]);

      if (!agent) {
        throw new HttpException("Invalid credentials or token", 400);
      }



      if (!agent.is_active) {
        throw new HttpException("You are an inactive agent.", 400);
      }

      req.owner = agent.owner;
      req.decode = decode;
      next();


    });
  } catch (err) {
    console.log(err);
    res.json({ msg: "server error", err });
  }
};

module.exports = validateAgent;
