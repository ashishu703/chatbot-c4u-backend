const AuthService = require("../services/authService");
const AdminRepository = require("../repositories/adminRepository");
const PasswordNotProvidedException = require("../exceptions/CustomExceptions/PasswordNotProvidedException");
const InvalidCredentialsException = require("../exceptions/CustomExceptions/InvalidCredentialsException");
const FillAllFieldsException = require("../exceptions/CustomExceptions/FillAllFieldsException");
class AdminController {
  adminRepository;
  constructor() {
    this.adminRepository = new AdminRepository();
  }
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        throw new FillAllFieldsException();
      }
      const user = await this.adminRepository.findByEmail(email);
      if (!user) {
        throw new InvalidCredentialsException();
      }
      const token = await AuthService.login(user, password);
      if (!token) {
       throw new InvalidCredentialsException();
      }
      res.json({ success: true, token });
    } catch (err) {
      next(err);
    }
  }

  async sendRecovery(req, res, next) {
    try {
      const { email } = req.body;
      await AuthService.sendRecoveryEmail(email);
      res.json({
        success: true,
        msg: "We have sent a recovery link if this email is associated with admin account.",
      });
    } catch (err) {
      next(err);
    }
  }

  async modifyPassword(req, res, next) {
    try {
      const { pass } = req.query;
      if (!pass) {
        throw new PasswordNotProvidedException();
      }
      await AuthService.modifyPassword(req.decode, pass);
      res.json({
        success: true,
        msg: "Your password has been changed. You may login now! Redirecting...",
      });
    } catch (err) {
      next(err);
    }
  }

  async getAdmin(req, res, next) {
    try {
      const admin = await this.adminRepository.findById(req.decode.uid);
      res.json({ data: admin, success: true });
    } catch (err) {
      next(err);
    }
  }

  async updateAdmin(req, res, next) {
    try {
      const { email, newpass } = req.body;
      await this.adminRepository.updateAdmin(req.decode.uid, email, newpass);
     res.json({ success: true, msg: "Admin was updated refresh the page" });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = AdminController;
