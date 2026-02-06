const PhonebookService = require("../services/PhonebookService");
const NoFilesWereUploadedException = require("../exceptions/CustomExceptions/NoFilesWereUploadedException");
const MobileNumberRequiredException = require("../exceptions/CustomExceptions/MobileNumberRequiredException");
const { formSuccess } = require("../utils/response.utils");
const EnterPhonebookNameException = require("../exceptions/CustomExceptions/EnterPhonebookNameException");
const { __t } = require("../utils/locale.utils");
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
      return formSuccess(res, { msg: __t("phonebook_added") });
    } catch (err) {
      next(err);
    }
  }

  async getPhonebooks(req, res, next) {
    try {
      const user = req.decode;
      const query = req.query;
      const phonebooks = await this.phonebookService.getPhonebooks({
        where: {
          uid: user.uid,
        },
        ...query,
      });
      return formSuccess(res, phonebooks);
    } catch (err) {
      next(err);
    }
  }

  async deletePhonebook(req, res, next) {
    try {
      const { id } = req.body;
      const user = req.decode;
      await this.phonebookService.deletePhonebook(user.uid, id);
      return formSuccess(res, { msg: __t("phonebook_deleted") });
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
      await this.phonebookService.importContacts(
        user.uid,
        id,
        phonebook_name,
        req.files.file.data
      );
      return formSuccess(res, { msg: __t("contacts_inserted") });
    } catch (err) {
      next(err);
    }
  }

  async updateContact(req, res, next) {
    try {
      const { id, name, mobile } = req.body;
      const user = req.decode;
      if (!id || !mobile) throw new MobileNumberRequiredException();
      await this.phonebookService.updateContact(user.uid, id, { name: name || "", mobile });
      return formSuccess(res, { msg: __t("contacts_inserted") });
    } catch (err) {
      next(err);
    }
  }

  async addSingleContact(req, res, next) {
    try {
      const { id, phonebook_name, mobile, name, source } = req.body;
      const user = req.decode;
      if (!mobile) throw new MobileNumberRequiredException();
      await this.phonebookService.addSingleContact(user.uid, {
        phonebook_id: id,
        phonebook_name,
        mobile,
        name,
        source: source || "manual",
      });
      return formSuccess(res, { msg: __t("contacts_inserted") });
    } catch (err) {
      next(err);
    }
  }

  async getContacts(req, res, next) {
    try {
      const query = req.query;
      const user = req.decode;
      const contacts = await this.phonebookService.getContacts({
        where: { uid: user.uid },
        ...query,
      });
      return formSuccess(res, { ...contacts });
    } catch (err) {
      next(err);
    }
  }

  async exportContacts(req, res, next) {
    try {
      const user = req.decode;
      const format = (req.query.format || "csv").toLowerCase();
      const { data, contentType, ext } = await this.phonebookService.exportContacts(user.uid, format);
      res.setHeader("Content-Type", contentType);
      res.setHeader("Content-Disposition", `attachment; filename="contacts.${ext}"`);
      return res.send(data);
    } catch (err) {
      next(err);
    }
  }

  async deleteContacts(req, res, next) {
    try {
      const { selected } = req.body;
      await this.phonebookService.deleteContacts(selected);
      return formSuccess(res, { msg: __t("contacts_deleted") });
    } catch (err) {
      next(err);
    }
  }

  async reassignContactsToTag(req, res, next) {
    try {
      const { contactIds, newPhonebookId } = req.body;
      const user = req.decode;

      if (!contactIds || !Array.isArray(contactIds) || contactIds.length === 0) {
        throw new Error('Contact are required ');
      }

      if (!newPhonebookId) {
        throw new Error('Tag is required');
      }

      const result = await this.phonebookService.reassignContactsToPhonebook(
        user.uid,
        contactIds,
        newPhonebookId
      );

      return formSuccess(res, { 
        msg: __t("contacts_reassigned"),
        data: result
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = PhonebookController;
