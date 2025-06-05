const express = require("express");
const router = express.Router();
const PhonebookController = require("../controllers/phonebookController");
const validateUser = require("../middlewares/user.middleware");
const { checkPlan, checkContactLimit } = require("../middlewares/plan.middleware");

const phonebookController = new PhonebookController();

router.post(
  "/add",
  validateUser,
  checkPlan,
  checkContactLimit,
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
  checkContactLimit,
  phonebookController.importContacts.bind(phonebookController)
);
router.post(
  "/add_single_contact",
  validateUser,
  checkPlan,
  checkContactLimit,
  phonebookController.addSingleContact.bind(phonebookController)
);
router.get(
  "/get_uid_contacts",
  validateUser,
  phonebookController.getContacts.bind(phonebookController)
);
router.post(
  "/del_contacts",
  validateUser,
  phonebookController.deleteContacts.bind(phonebookController)
);

module.exports = router;
