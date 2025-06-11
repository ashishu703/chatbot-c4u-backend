
const PhonebookService = require('../services/PhonebookService');
const NoFilesWereUploadedException = require('../exceptions/CustomExceptions/NoFilesWereUploadedException');
const MobileNumberRequiredException = require('../exceptions/CustomExceptions/MobileNumberRequiredException');
const { formSuccess } = require('../utils/response.utils');
const EnterPhonebookNameException = require('../exceptions/CustomExceptions/EnterPhonebookNameException');
const { __t } = require('../utils/locale.utils');
class PhonebookController {
  phonebookService;
  constructor() {
    this.phonebookService = new PhonebookService();
  }
  async addPhonebook(req, res, next) {
    try {
      const { name } = req.body;
      const user = req.decode;
      if (!name) {
        throw new EnterPhonebookNameException();
      }
      await this.phonebookService.addPhonebook(user.uid, name);
      return formSuccess(res,{msg : __t("phonebook_added")});
    } catch (err) {
      next(err);
    }
  }

  async getPhonebooks(req, res, next) {
    try {
      const user = req.decode;
      const phonebooks = await this.phonebookService.getPhonebooks(user.uid);
      return formSuccess(res,{ data: phonebooks });
    } catch (err) {
      next(err);
    }
  }

  async deletePhonebook(req, res, next) {
    try {
      const { id } = req.body;
      const user = req.decode;
      await this.phonebookService.deletePhonebook(user.uid, id);
      return formSuccess(res,{msg : __t("phonebook_deleted")});
    } catch (err) {
      next(err);
    }
  }

  async importContacts(req, res, next) {
    try {
      if (!req.files || !req.files.file) {
        throw new NoFilesWereUploadedException();
      }
      const { id, phonebook_name } = req.body;
      const user = req.decode;
       await this.phonebookService.importContacts(user.uid, id, phonebook_name, req.files.file.data);
      return formSuccess(res,{msg: __t("contacts_inserted")});
    } catch (err) {
      next(err);
    }
  }

  async addSingleContact(req, res, next) {
    try {
      const { id, phonebook_name, mobile, name, var1, var2, var3, var4, var5 } = req.body;
      const user = req.decode;
      if (!mobile) {
       throw new MobileNumberRequiredException();
      }
    await this.phonebookService.addSingleContact(user.uid, {
        phonebook_id: id,
        phonebook_name,
        mobile,
        name,
        var1,
        var2,
        var3,
        var4,
        var5,
      });
      return formSuccess(res,{msg: __t("contacts_inserted")});
    } catch (err) {
      next(err);
    }
  }

  async getContacts(req, res, next) {
    try {
      const user = req.decode;
      const contacts = await this.phonebookService.getContacts(user.uid);
      return formSuccess(res,{ data: contacts });
    } catch (err) {
      next(err);
    }
  }

  async deleteContacts(req, res, next) {
    try {
      const { selected } = req.body;
       await this.phonebookService.deleteContacts(selected);
      return formSuccess(res,{msg: __t("contacts_deleted")});
    } catch (err) {
      next(err);
    }
  }
}

module.exports = PhonebookController;