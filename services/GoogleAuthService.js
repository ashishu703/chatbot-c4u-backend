const { google } = require('googleapis');
const { GoogleToken, GoogleReview, AiIntegration, WebPublic } = require('../models');
const { OpenAI } = require('openai');
const moment = require('moment');

class GoogleAuthService {
  constructor() {
    this.oauth2Client = null;
    this.configCache = null;
  }

  async initClient() {
    const config = await WebPublic.findOne({ where: { id: 1 } });
    if (!config || !config.google_client_id || !config.google_client_secret) {
      throw new Error('Google API credentials not configured in admin panel');
    }

    const configKey = `${config.google_client_id}-${config.google_redirect_uri}`;
    if (this.configCache !== configKey || !this.oauth2Client) {
      this.oauth2Client = new google.auth.OAuth2(
        config.google_client_id,
        config.google_client_secret,
        config.google_redirect_uri || `${process.env.BACKEND_URL}/api/google/callback`
      );
      this.configCache = configKey;
    }

    return this.oauth2Client;
  }

  async generateAuthUrl(userId) {
    const client = await this.initClient();
    const scopes = [
      'https://www.googleapis.com/auth/business.manage',
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
    ];

    return client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      state: userId.toString(),
      prompt: 'consent',
    });
  }

  async handleCallback(code, userId) {
    const client = await this.initClient();
    const { tokens } = await client.getToken(code);
    client.setCredentials(tokens);

    // Get user info
    const oauth2 = google.oauth2({ version: 'v2', auth: client });
    const { data: userInfo } = await oauth2.userinfo.get();

    // Store tokens
    const [googleToken, created] = await GoogleToken.findOrCreate({
      where: { userId },
      defaults: {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiryDate: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
        profileId: userInfo.id,
        profileName: userInfo.name,
        profileEmail: userInfo.email,
        profilePicture: userInfo.picture,
        isConnected: true,
      },
    });

    if (!created) {
      await googleToken.update({
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token || googleToken.refreshToken,
        expiryDate: tokens.expiry_date ? new Date(tokens.expiry_date) : googleToken.expiryDate,
        profileName: userInfo.name,
        profileEmail: userInfo.email,
        profilePicture: userInfo.picture,
        isConnected: true,
      });
    }

    return googleToken;
  }

  async getClient(userId) {
    const client = await this.initClient();
    const token = await GoogleToken.findOne({ where: { userId, isConnected: true } });
    if (!token) throw new Error('Google account not connected');

    client.setCredentials({
      access_token: token.accessToken,
      refresh_token: token.refreshToken,
      expiry_date: token.expiryDate ? token.expiryDate.getTime() : null,
    });

    // Handle token refresh
    client.on('tokens', async (tokens) => {
      if (tokens.access_token) {
        await token.update({
          accessToken: tokens.access_token,
          expiryDate: tokens.expiry_date ? new Date(tokens.expiry_date) : token.expiryDate,
        });
      }
    });

    return client;
  }

  async fetchAndProcessReviews(userId) {
    try {
      const auth = await this.getClient(userId);
   
    } catch (error) {
      console.error('Error fetching reviews:', error);
      throw error;
    }
  }

  async handleNewReview(userId, reviewData) {
    const { reviewId, reviewerName, reviewerPhotoUrl, rating, comment, reviewTime } = reviewData;

    const [review, created] = await GoogleReview.findOrCreate({
      where: { reviewId },
      defaults: {
        userId,
        reviewerName,
        reviewerPhotoUrl,
        rating,
        comment,
        isPositive: rating >= 4,
        reviewTime: new Date(reviewTime),
        reviewStatus: rating >= 4 ? 'resolved' : 'new',
      },
    });

    if (created && rating >= 4) {
      await this.autoReplyToReview(userId, review);
    }

    return review;
  }

  async autoReplyToReview(userId, review) {
    try {
      const aiConfig = await AiIntegration.findOne({ where: { userId, isActive: true } });
      if (!aiConfig) return;

      const openai = new OpenAI({ apiKey: aiConfig.apiKey });
      const prompt = `Generate a polite, professional, short reply for a ${review.rating}-star Google review.
      Review: "${review.comment}"
      Tone: Friendly & thankful`;

      const completion = await openai.chat.completions.create({
        model: aiConfig.model || "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
      });

      const replyText = completion.choices[0].message.content;


      await review.update({
        replyText,
        replyStatus: 'replied',
      });
    } catch (error) {
      console.error('Auto-reply failed:', error);
      await review.update({ replyStatus: 'failed' });
    }
  }
}

module.exports = new GoogleAuthService();

