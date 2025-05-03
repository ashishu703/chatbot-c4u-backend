const AuthService = require("../services/authService");
const AdminRepository = require("../repositories/adminRepository");

class AdminController {
   async login(req, res) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.json({ success: false, msg: "Please fill email and password" });
      }
      const user = await AdminRepository.findByEmail(email);
      if (!user) {
        return res.json({ msg: "Invalid credentials found" });
      }
      const token = await AuthService.login(user, password);
      if (!token) {
        return res.json({ msg: "Invalid credentials" });
      }
      res.json({ success: true, token });
    } catch (err) {
      console.error(err);
      res.json({ success: false, msg: "Something went wrong" });
    }
  }

   async sendRecovery(req, res) {
    try {
      const { email } = req.body;
      await AuthService.sendRecoveryEmail(email);
      res.json({
        success: true,
        msg: "We have sent a recovery link if this email is associated with admin account.",
      });
    } catch (err) {
      console.error(err);
      res.json({ success: false, msg: err.message || "Something went wrong" });
    }
  }

   async modifyPassword(req, res) {
    try {
      const { pass } = req.query;
      if (!pass) {
        return res.json({ success: false, msg: "Please provide a password" });
      }
      await AuthService.modifyPassword(req.decode, pass);
      res.json({
        success: true,
        msg: "Your password has been changed. You may login now! Redirecting...",
      });
    } catch (err) {
      console.error(err);
      res.json({ success: false, msg: err.message || "Something went wrong" });
    }
  }

   async getAdmin(req, res) {
    try {
      const admin = await AdminRepository.findById(req.decode.uid);
      res.json({ data: admin, success: true });
    } catch (err) {
      console.error(err);
      res.json({ success: false, msg: "Server error" });
    }
  }

   async updateAdmin(req, res) {
    try {
      const { email, newpass } = req.body;
      await AdminRepository.updateAdmin(req.decode.uid, email, newpass);
      res.json({ success: true, msg: "Admin was updated refresh the page" });
    } catch (err) {
      console.error(err);
      res.json({ success: false, msg: "Server error" });
    }
  }
}

module.exports = AdminController;