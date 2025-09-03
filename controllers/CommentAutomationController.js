const CommentAutomationSettingRepository = require("../repositories/CommentAutomationSettingRepository");
const { __t } = require("../utils/locale.utils");
const { formSuccess, formError } = require("../utils/response.utils");

class CommentAutomationController {
  constructor() {
    this.repository = new CommentAutomationSettingRepository();
  }

  // Save or update comment automation settings
  async saveSettings(req, res, next) {
    try {
      const { uid } = req.user;
      const {
        platform,
        privateReplyType,
        privateReplyText,
        privateReplyFlowId,
        publicReplyType,
        publicReplyTexts,
        publicReplyFlowId,
        replyTo,
        equalComments,
        containComments,
        trackComments,
        specificPostId,
        isActive = true
      } = req.body;

      // Validate required fields
      if (!platform || !['facebook', 'instagram'].includes(platform)) {
        return formError(res, __t("invalid_platform"), 400);
      }

      // Prepare data for database
      const settingsData = {
        uid,
        platform,
        private_reply_type: privateReplyType || 'none',
        private_reply_text: privateReplyType === 'text' ? privateReplyText : null,
        private_reply_flow_id: privateReplyType === 'flow' ? privateReplyFlowId : null,
        public_reply_type: publicReplyType || 'none',
        public_reply_texts: publicReplyType === 'text' ? publicReplyTexts : null,
        public_reply_flow_id: publicReplyType === 'flow' ? publicReplyFlowId : null,
        reply_to: replyTo || 'all',
        equal_comments: replyTo === 'equal' ? equalComments : null,
        contain_comments: replyTo === 'contain' ? containComments : null,
        track_comments: trackComments || 'all',
        specific_post_id: trackComments === 'specific' ? specificPostId : null,
        is_active: isActive
      };

      // Save or update settings
      const result = await this.repository.updateOrCreateByUserAndPlatform(settingsData);

      return formSuccess(res, {
        msg: __t("settings_saved_successfully"),
        data: result
      });
    } catch (err) {
      next(err);
    }
  }

  // Get comment automation settings for a user and platform
  async getSettings(req, res, next) {
    try {
      const { uid } = req.user;
      // Extract platform from URL path
      const urlPath = req.path;
      const platform = urlPath.includes('/facebook/') ? 'facebook' : 'instagram';

      const settings = await this.repository.findByUserAndPlatform(uid, platform);

      if (!settings) {
        return formSuccess(res, {
          msg: __t("no_settings_found"),
          data: null
        });
      }

      return formSuccess(res, {
        msg: __t("settings_retrieved_successfully"),
        data: settings
      });
    } catch (err) {
      next(err);
    }
  }

  // Update comment automation settings
  async updateSettings(req, res, next) {
    try {
      const { uid } = req.user;
      const {
        privateReplyType,
        privateReplyText,
        privateReplyFlowId,
        publicReplyType,
        publicReplyTexts,
        publicReplyFlowId,
        replyTo,
        equalComments,
        containComments,
        trackComments,
        specificPostId,
        isActive
      } = req.body;

      // Extract platform from URL path
      const urlPath = req.path;
      const platform = urlPath.includes('/facebook/') ? 'facebook' : 'instagram';

      // Check if settings exist
      const existingSettings = await this.repository.findByUserAndPlatform(uid, platform);
      if (!existingSettings) {
        return formError(res, __t("settings_not_found"), 404);
      }

      // Prepare update data
      const updateData = {
        private_reply_type: privateReplyType,
        private_reply_text: privateReplyType === 'text' ? privateReplyText : null,
        private_reply_flow_id: privateReplyType === 'flow' ? privateReplyFlowId : null,
        public_reply_type: publicReplyType,
        public_reply_texts: publicReplyType === 'text' ? publicReplyTexts : null,
        public_reply_flow_id: publicReplyType === 'flow' ? publicReplyFlowId : null,
        reply_to: replyTo,
        equal_comments: replyTo === 'equal' ? equalComments : null,
        contain_comments: replyTo === 'contain' ? containComments : null,
        track_comments: trackComments,
        specific_post_id: trackComments === 'specific' ? specificPostId : null,
        is_active: isActive
      };

      // Remove null values
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === null || updateData[key] === undefined) {
          delete updateData[key];
        }
      });

      const result = await this.repository.update(updateData, { uid, platform });

      return formSuccess(res, {
        msg: __t("settings_updated_successfully"),
        data: result
      });
    } catch (err) {
      next(err);
    }
  }

  // Delete comment automation settings
  async deleteSettings(req, res, next) {
    try {
      const { uid } = req.user;
      
      // Extract platform from URL path
      const urlPath = req.path;
      const platform = urlPath.includes('/facebook/') ? 'facebook' : 'instagram';

      const deletedSettings = await this.repository.delete({ uid, platform });

      if (!deletedSettings || deletedSettings.length === 0) {
        return formError(res, __t("settings_not_found"), 404);
      }

      return formSuccess(res, {
        msg: __t("settings_deleted_successfully"),
        data: deletedSettings[0]
      });
    } catch (err) {
      next(err);
    }
  }

  // Get all settings for a user
  async getAllUserSettings(req, res, next) {
    try {
      const { uid } = req.user;

      const settings = await this.repository.findByUser(uid);

      return formSuccess(res, {
        msg: __t("settings_retrieved_successfully"),
        data: settings
      });
    } catch (err) {
      next(err);
    }
  }

  // Toggle settings active status
  async toggleActiveStatus(req, res, next) {
    try {
      const { uid } = req.user;
      const { isActive } = req.body;

      // Extract platform from URL path
      const urlPath = req.path;
      const platform = urlPath.includes('/facebook/') ? 'facebook' : 'instagram';

      if (typeof isActive !== 'boolean') {
        return formError(res, __t("invalid_active_status"), 400);
      }

      const existingSettings = await this.repository.findByUserAndPlatform(uid, platform);
      if (!existingSettings) {
        return formError(res, __t("settings_not_found"), 404);
      }

      if (isActive) {
        await this.repository.activateUserSettings(uid, platform);
      } else {
        await this.repository.deactivateUserSettings(uid, platform);
      }

      const updatedSettings = await this.repository.findByUserAndPlatform(uid, platform);

      return formSuccess(res, {
        msg: __t("status_updated_successfully"),
        data: updatedSettings
      });
    } catch (err) {
      next(err);
    }
  }

  // Get analytics for comment automation
  async getAnalytics(req, res, next) {
    try {
      const { uid } = req.user;
      
      // Extract platform from URL path
      const urlPath = req.path;
      const platform = urlPath.includes('/facebook/') ? 'facebook' : 'instagram';

      const settings = await this.repository.findByUserAndPlatform(uid, platform);
      
      if (!settings) {
        return formSuccess(res, {
          msg: __t("no_settings_found"),
          data: {
            totalSettings: 0,
            activeSettings: 0,
            settings: null
          }
        });
      }

      // Get all settings for the user to calculate analytics
      const allSettings = await this.repository.findByUser(uid);
      const activeSettings = allSettings.filter(s => s.is_active);

      const analytics = {
        totalSettings: allSettings.length,
        activeSettings: activeSettings.length,
        currentPlatformSettings: settings,
        platforms: {
          facebook: allSettings.filter(s => s.platform === 'facebook').length,
          instagram: allSettings.filter(s => s.platform === 'instagram').length
        }
      };

      return formSuccess(res, {
        msg: __t("analytics_retrieved_successfully"),
        data: analytics
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = CommentAutomationController;
