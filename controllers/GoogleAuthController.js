const googleAuthService = require('../services/GoogleAuthService');
const { GoogleReview, GoogleToken } = require('../models');
const { formSuccess, formError } = require('../utils/response.utils');

class GoogleAuthController {
  async initiateAuth(req, res, next) {
    try {
      const userId = req.user.id;
      const url = await googleAuthService.generateAuthUrl(userId);
      return formSuccess(res, { url });
    } catch (err) {
      next(err);
    }
  }

  async callback(req, res, next) {
    try {
      const { code, state: userId } = req.query;
      await googleAuthService.handleCallback(code, userId);
      return res.redirect(`${process.env.FRONTEND_URL}/dashboard?view=settings&tab=channels&google=connected`);
    } catch (err) {
      next(err);
    }
  }

  async getReviews(req, res, next) {
    try {
      const userId = req.user.id;
      const { status, isPositive } = req.query;
      
      const where = { userId };
      if (status) where.reviewStatus = status;
      if (isPositive !== undefined) where.isPositive = isPositive === 'true';

      const reviews = await GoogleReview.findAll({
        where,
        order: [['reviewTime', 'DESC']],
      });

      return formSuccess(res, { data: reviews });
    } catch (err) {
      next(err);
    }
  }

  async updateReviewStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const review = await GoogleReview.findByPk(id);
      if (!review) return formError(res, 'Review not found', 404);

      await review.update({ reviewStatus: status });
      return formSuccess(res, review);
    } catch (err) {
      next(err);
    }
  }

  async getConnectionStatus(req, res, next) {
    try {
      const userId = req.user.id;
      const token = await GoogleToken.findOne({ where: { userId } });
      return formSuccess(res, { 
        isConnected: !!(token && token.isConnected),
        profile: token ? {
          name: token.profileName,
          email: token.profileEmail,
          picture: token.profilePicture
        } : null
      });
    } catch (err) {
      next(err);
    }
  }

  async disconnect(req, res, next) {
    try {
      const userId = req.user.id;
      await GoogleToken.update({ isConnected: false }, { where: { userId } });
      return formSuccess(res, { message: 'Disconnected successfully' });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new GoogleAuthController();

