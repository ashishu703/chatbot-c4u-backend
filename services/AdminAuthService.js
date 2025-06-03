const { Op } = require("sequelize");
const InvalidCredentialsException = require("../exceptions/CustomExceptions/InvalidCredentialsException");
const PasswordRequiredException = require("../exceptions/CustomExceptions/PasswordRequiredException");
const UserNotFoundException = require("../exceptions/CustomExceptions/UserNotFoundException");
const AdminRepository = require("../repositories/AdminRepository");
const { generateToken, comparePassword, createAdminPasswordRecoveryUrl, validateTimeExpiration, encryptPassword } = require("../utils/auth.utils");
const EmailService = require("./emailService");
const UserAlreadyExistException = require("../exceptions/CustomExceptions/UserAlreadyExistException");
const { ADMIN } = require("../types/roles.types");


class AdminAuthService {
  constructor() {
    this.adminRepository = new AdminRepository();
    this.emailService = new EmailService();
  }

  async initAdminLogin(credentials) {
    const { email, password } = credentials;

    const admin = await this.adminRepository.findByEmail(email);

    if (!admin) {
      throw new InvalidCredentialsException();
    }

    const isValidated = await comparePassword(password, admin.password);

    if (!isValidated) {
      throw new InvalidCredentialsException();
    }

    const token = generateToken({ uid: admin.uid, role: ADMIN });

    return {
      token,
      admin: { id: admin.uid, email: admin.email },
    };

  }

  async sendRecoveryEmail(email) {

    const admin = await this.adminRepository.findByEmail(email);

    if (!admin) {
      return UserNotFoundException();
    }

    const url = createAdminPasswordRecoveryUrl(admin);

    return this.emailService.sendRecoveryEmail(email, url);
  }


  async modifyPassword(decoded, pass) {
    if (!pass) {
      throw new PasswordRequiredException();
    }

    validateTimeExpiration(decoded.time);

    const hashpassword = await encryptPassword(pass);

    return this.adminRepository.updatePassword(decoded.old_email, hashpassword);
  }


  async getAdmin(uid) {
    return this.adminRepository.findByUid(uid);
  }

  async updateAdminLoginCredentials(id, credentials) {
    const { email, password } = credentials;
    await this.throwIfAlreadyExists(id, email);
    return this.adminRepository.updateAdmin(id, email, password);
  }

  async throwIfAlreadyExists(id, email) {
    const isAlreadyExist = await this.adminRepository.findFirst({
      where: {
        email: credentials.email,
        uid: { [Op.ne]: id },
      }
    });
    if (isAlreadyExist) {
      throw new UserAlreadyExistException();
    }
  }


}

module.exports = AdminAuthService;
