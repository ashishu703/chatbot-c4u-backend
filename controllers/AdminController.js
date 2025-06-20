const PasswordNotProvidedException = require("../exceptions/CustomExceptions/PasswordNotProvidedException");
const { formSuccess } = require("../utils/response.utils");
const { __t } = require("../utils/locale.utils");
const AdminAuthService = require("../services/AdminAuthService");
const { validateLoginCredentials } = require("../utils/auth.utils");

class AdminController {
  adminAuthService;
  constructor() {
    this.adminAuthService = new AdminAuthService();
  }
  async initAdminLogin(req, res, next) {
    try {
      const { email, password } = req.body;
      validateLoginCredentials({ email, password });
      const admin = await this.adminAuthService.initAdminLogin({ email, password });
      return formSuccess(res,{ ...admin });
    } catch (err) {
      next(err);
    }
  }

  async sendRecovery(req, res, next) {
    try {
      const { email } = req.body;
      await this.adminAuthService.sendRecoveryEmail(email);
      return formSuccess(res,{
        msg: __t(
          "password_recovery_email_sent"
        ),
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
      await this.adminAuthService.modifyPassword(req.decode, pass);
      return formSuccess(res,{
        msg: __t(
          "password_changed"
        ),
      });
    } catch (err) {
      next(err);
    }
  }

  async getAdmin(req, res, next) {
    try {
      const admin = await this.adminAuthService.getAdmin(req.decode.uid);
      return formSuccess(res,{ data: admin });
    } catch (err) {
      next(err);
    }
  }

  async updateAdmin(req, res, next) {
    try {
      const { email, newpass } = req.body;
      await this.adminAuthService.updateAdminLoginCredentials(req.decode.uid, { email, password: newpass });
      return formSuccess(res,{
        msg: __t(
          "admin_updated"
        ),
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = AdminController;
