const router = require("express").Router();
const validateUser = require("../middlewares/user.js");

const AuthController = require("../controllers/Facebook/FacebookAuthController");
const authController = new AuthController();

router.post("/auth-init", validateUser, authController.initiateUserAuth.bind(authController));

module.exports = router;
