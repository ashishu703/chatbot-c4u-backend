
const PhonebookService = require('../services/phonebookService');

class PhonebookController {
  async addPhonebook(req, res) {
    try {
      const { name } = req.body;
      const user = req.decode;
      if (!name) {
        return res.json({ success: false, msg: 'Please enter a phonebook name' });
      }
      const result = await PhonebookService.addPhonebook(user.uid, name);
      res.json(result);
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, msg: err.message || 'Something went wrong' });
    }
  }

  async getPhonebooks(req, res) {
    try {
      const user = req.decode;
      const phonebooks = await PhonebookService.getPhonebooks(user.uid);
      res.json({ data: phonebooks, success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, msg: err.message || 'Something went wrong' });
    }
  }

  async deletePhonebook(req, res) {
    try {
      const { id } = req.body;
      const user = req.decode;
      const result = await PhonebookService.deletePhonebook(user.uid, id);
      res.json(result);
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, msg: err.message || 'Something went wrong' });
    }
  }

  async importContacts(req, res) {
    try {
      if (!req.files || !req.files.file) {
        return res.json({ success: false, msg: 'No files were uploaded' });
      }
      const { id, phonebook_name } = req.body;
      const user = req.decode;
      const result = await PhonebookService.importContacts(user.uid, id, phonebook_name, req.files.file.data);
      res.json(result);
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, msg: err.message || 'Something went wrong' });
    }
  }

  async addSingleContact(req, res) {
    try {
      const { id, phonebook_name, mobile, name, var1, var2, var3, var4, var5 } = req.body;
      const user = req.decode;
      if (!mobile) {
        return res.json({ success: false, msg: 'Mobile number is required' });
      }
      const result = await PhonebookService.addSingleContact(user.uid, {
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
      console.error(err);
      res.status(500).json({ success: false, msg: err.message || 'Something went wrong' });
    }
  }

  async getContacts(req, res) {
    try {
      const user = req.decode;
      const contacts = await PhonebookService.getContacts(user.uid);
      res.json({ data: contacts, success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, msg: err.message || 'Something went wrong' });
    }
  }

  async deleteContacts(req, res) {
    try {
      const { selected } = req.body;
      const result = await PhonebookService.deleteContacts(selected);
      res.json(result);
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, msg: err.message || 'Something went wrong' });
    }
  }
}

module.exports = new PhonebookController();