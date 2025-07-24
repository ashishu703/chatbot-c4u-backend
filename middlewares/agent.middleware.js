const jwt = require("jsonwebtoken");
const AgentRepository = require("../repositories/AgentRepository");
const HttpException = require("../utils/http-exception.utils");
const InvalidCredentialsException = require("../exceptions/CustomExceptions/InvalidCredentialsException");

const validateAgent = async (req, res, next) => {
  try {
    const token = req.get("Authorization");
    if (!token) {
      throw new InvalidCredentialsException();
    }

    jwt.verify(token.split(" ")[1], process.env.JWTKEY, async (err, decode) => {
      if (err) {
        throw new InvalidCredentialsException();
      }

      const { email } = decode;

      if (!email) {
        throw new InvalidCredentialsException();
      }

      const agent = await (new AgentRepository()).findByEmail(email, ["owner"]);

      if (!agent) {
        throw new InvalidCredentialsException();
      }



      if (!agent.is_active) {
        throw new InvalidCredentialsException();
      }

      req.owner = agent.owner;
      req.decode = decode;
      next();


    });
  } catch (err) {
    next(err);
  }
};

module.exports = validateAgent;
