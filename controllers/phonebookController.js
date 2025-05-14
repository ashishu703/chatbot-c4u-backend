
const PhonebookService = require('../services/phonebookService');
const NoFilesWereUploadedException = require('../exceptions/CustomExceptions/NoFilesWereUploadedException');
const MobileNumberRequiredException = require('../exceptions/CustomExceptions/MobileNumberRequiredException');

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
        return res.json({ success: false, msg: 'Please enter a phonebook name' });
      }
      const result = await this.phonebookService.addPhonebook(user.uid, name);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async getPhonebooks(req, res, next) {
    try {
      const user = req.decode;
      const phonebooks = await this.phonebookService.getPhonebooks(user.uid);
      res.json({ data: phonebooks, success: true });
    } catch (err) {
      next(err);
    }
  }

  async deletePhonebook(req, res, next) {
    try {
      const { id } = req.body;
      const user = req.decode;
      const result = await this.phonebookService.deletePhonebook(user.uid, id);
      res.json(result);
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
      const result = await this.phonebookService.importContacts(user.uid, id, phonebook_name, req.files.file.data);
      res.json(result);
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
      const result = await this.phonebookService.addSingleContact(user.uid, {
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
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async getContacts(req, res, next) {
    try {
      const user = req.decode;
      const contacts = await this.phonebookService.getContacts(user.uid);
      res.json({ data: contacts, success: true });
    } catch (err) {
      next(err);
    }
  }

  async deleteContacts(req, res, next) {
    try {
      const { selected } = req.body;
      const result = await this.phonebookService.deleteContacts(selected);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = PhonebookController;