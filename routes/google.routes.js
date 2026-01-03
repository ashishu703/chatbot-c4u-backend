const express = require('express');
const router = express.Router();
const googleAuthController = require('../controllers/GoogleAuthController');
const validateUser = require('../middlewares/user.middleware');

router.get('/auth', validateUser, (req, res, next) => googleAuthController.initiateAuth(req, res, next));
router.get('/callback', (req, res, next) => googleAuthController.callback(req, res, next));
router.get('/status', validateUser, (req, res, next) => googleAuthController.getConnectionStatus(req, res, next));
router.post('/disconnect', validateUser, (req, res, next) => googleAuthController.disconnect(req, res, next));
router.get('/reviews', validateUser, (req, res, next) => googleAuthController.getReviews(req, res, next));
router.patch('/reviews/:id/status', validateUser, (req, res, next) => googleAuthController.updateReviewStatus(req, res, next));

module.exports = router;

