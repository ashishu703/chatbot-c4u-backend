const express = require("express");
const router = express.Router();
const PhonebookController = require("../controllers/PhonebookController");
const validateUser = require("../middlewares/user.middleware");
const { checkPlan } = require("../middlewares/plan.middleware");

const phonebookController = new PhonebookController();

router.post(
  "/add",
  validateUser,
  checkPlan,
  phonebookController.addPhonebook.bind(phonebookController)
);
router.get(
  "/get_by_uid",
  validateUser,
  phonebookController.getPhonebooks.bind(phonebookController)
);
router.post(
  "/del_phonebook",
  validateUser,
  phonebookController.deletePhonebook.bind(phonebookController)
);
router.post(
  "/import_contacts",
  validateUser,
  checkPlan,
  phonebookController.importContacts.bind(phonebookController)
);
router.post(
  "/add_single_contact",
  validateUser,
  checkPlan,
  phonebookController.addSingleContact.bind(phonebookController)
);
router.put(
  "/update_contact",
  validateUser,
  checkPlan,
  phonebookController.updateContact.bind(phonebookController)
);
router.get(
  "/get_uid_contacts",
  validateUser,
  phonebookController.getContacts.bind(phonebookController)
);
router.get(
  "/export_contacts",
  validateUser,
  phonebookController.exportContacts.bind(phonebookController)
);
router.post(
  "/del_contacts",
  validateUser,
  phonebookController.deleteContacts.bind(phonebookController)
);

router.post(
  "/reassign_contacts",
  validateUser,
  checkPlan,
  phonebookController.reassignContactsToTag.bind(phonebookController)
);

module.exports = router;
