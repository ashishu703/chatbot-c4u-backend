
const express = require('express');
const router = express.Router();
const phonebookController = require('../controllers/phonebookController');
const validateUser = require('../middlewares/user');
const { checkPlan, checkContactLimit } = require('../middlewares/plan');

router.post('/add', validateUser, checkPlan, checkContactLimit, phonebookController.addPhonebook);
router.get('/get_by_uid', validateUser, phonebookController.getPhonebooks);
router.post('/del_phonebook', validateUser, phonebookController.deletePhonebook);
router.post('/import_contacts', validateUser, checkPlan, checkContactLimit, phonebookController.importContacts);
router.post('/add_single_contact', validateUser, checkPlan, checkContactLimit, phonebookController.addSingleContact);
router.get('/get_uid_contacts', validateUser, phonebookController.getContacts);
router.post('/del_contacts', validateUser, phonebookController.deleteContacts);

module.exports = router;