const UserRepository = require("../repositories/userRepository");
const MetaApiRepository = require("../repositories/metaApiRepository");
const {
  sendAPIMessage,
  sendMetatemplet,
  getMetaTempletByName,
  getNumberOfDaysFromTimestamp,
} = require("../functions/function");

const { getBusinessPhoneNumber, createMetaTemplet, getAllTempletsMeta, delMetaTemplet, getSessionUploadMediaMeta, uploadFileMeta } = require('../utils/metaUtils');
const { uploadFile, getFileInfo } = require('../utils/fileUtils');
const path = require('path');

class MetaService {
  static async decodeToken(token) {
    const user = await UserRepository.findByApiKey(token);
    if (!user) {
      throw new Error("Invalid API keys");
    }
    return user;
  }

  static async sendMessage(token, messageObject) {
    const user = await this.decodeToken(token);

    if (!user.plan || !user.plan_expire) {
      throw new Error("You don't have any plan, please buy one.");
    }

    const daysLeft = getNumberOfDaysFromTimestamp(user.plan_expire);
    if (daysLeft < 1) {
      throw new Error("Your plan was expired, please renew your plan.");
    }

    const plan = user.plan;
    if (!plan.allow_api) {
      throw new Error("Your plan does not allow you to use API feature. Please get another plan");
    }

    const metaApi = await MetaApiRepository.findByUid(user.uid);
    if (!metaApi || !metaApi.access_token || !metaApi.business_phone_number_id) {
      throw new Error("Please provide your META API keys in the profile section");
    }

    return await sendAPIMessage(messageObject, metaApi.business_phone_number_id, metaApi.access_token);
  }

  static async sendTemplate({ token, sendTo, templetName, exampleArr, mediaUri }) {
    const user = await this.decodeToken(token);

    if (!user.plan || !user.plan_expire) {
      throw new Error("You don't have any plan, please buy one.");
    }

    const daysLeft = getNumberOfDaysFromTimestamp(user.plan_expire);
    if (daysLeft < 1) {
      throw new Error("Your plan was expired, please renew your plan.");
    }

    const plan = user.plan;
    if (!plan.allow_api) {
      throw new Error("Your plan does not allow you to use API feature. Please get another plan");
    }

    const metaApi = await MetaApiRepository.findByUid(user.uid);
    if (!metaApi || !metaApi.access_token || !metaApi.business_phone_number_id) {
      throw new Error("Please update Api Settings in your user panel");
    }

    const templet = await getMetaTempletByName(templetName, metaApi);
    if (templet.error || !templet?.data?.length) {
      return {
        success: false,
        message: templet.error?.message || "Unable to fetch templet from meta",
        metaResponse: templet,
      };
    }

    const dynamicMedia = mediaUri || null;
    const resp = await sendMetatemplet(
      sendTo.replace("+", ""),
      metaApi.business_phone_number_id,
      metaApi.access_token,
      templet.data[0],
      exampleArr,
      dynamicMedia
    );

    return resp.error
      ? { success: false, metaResponse: resp }
      : { success: true, metaResponse: resp };
  }

 static async updateMeta(uid, { waba_id, business_account_id, access_token, business_phone_number_id, app_id }) {
    if (!waba_id || !business_account_id || !access_token || !business_phone_number_id || !app_id) {
      return { success: false, msg: 'Please fill all the fields' };
    }
    const resp = await getBusinessPhoneNumber('v18.0', business_phone_number_id, access_token);
    if (resp?.error) {
      return { success: false, msg: resp?.error?.message || 'Please check your details' };
    }
    const existingMeta = await metaRepository.findMetaApiByUid(uid);
    const metaData = { waba_id, business_account_id, access_token, business_phone_number_id, app_id, uid };
    if (existingMeta) {
      await metaRepository.updateMetaApi(uid, metaData);
    } else {
      await metaRepository.createMetaApi(metaData);
    }
    return { success: true, msg: 'Your meta settings were updated successfully!' };
  }

 static async getMetaKeys(uid) {
    const meta = await metaRepository.findMetaApiByUid(uid);
    return { success: true, data: meta || {} };
  }

 static async addMetaTemplet(uid, body) {
    const meta = await metaRepository.findMetaApiByUid(uid);
    if (!meta) {
      return { success: false, msg: 'Please fill your meta API keys' };
    }
    const resp = await createMetaTemplet('v18.0', meta.waba_id, meta.access_token, body);
    if (resp.error) {
      return { success: false, msg: resp?.error?.error_user_msg || resp?.error?.message };
    }
    return { success: true, msg: 'Templet was added and waiting for the review' };
  }

 static async getMyMetaTemplets(uid) {
    const meta = await metaRepository.findMetaApiByUid(uid);
    if (!meta) {
      return { success: false, msg: 'Please check your meta API keys' };
    }
    const resp = await getAllTempletsMeta('v18.0', meta.waba_id, meta.access_token);
    if (resp?.error) {
      return { success: false, msg: resp?.error?.message || 'Please check your API' };
    }
    return { success: true, data: resp?.data || [] };
  }

 static async deleteMetaTemplet(uid, name) {
    const meta = await metaRepository.findMetaApiByUid(uid);
    if (!meta) {
      return { success: false, msg: 'Please check your meta API keys' };
    }
    const resp = await delMetaTemplet('v18.0', meta.waba_id, meta.access_token, name);
    if (resp.error) {
      return { success: false, msg: resp?.error?.error_user_title || 'Please check your API' };
    }
    return { success: true, data: resp?.data || [], msg: 'Templet was deleted' };
  }

 static async returnMediaUrlMeta(uid, templet_name, files) {
    if (!templet_name) {
      return { success: false, msg: 'Please give a templet name first' };
    }
    if (!files || !files.file) {
      return { success: false, msg: 'No files were uploaded' };
    }
    const meta = await metaRepository.findMetaApiByUid(uid);
    if (!meta) {
      return { success: false, msg: 'Please check your meta API keys' };
    }
    const { filename, filePath } = await uploadFile(files.file, path.join(__dirname, '..', 'client', 'public', 'media'));
    const { fileSizeInBytes, mimeType } = await getFileInfo(filePath);
    const session = await getSessionUploadMediaMeta('v18.0', meta.app_id, meta.access_token, fileSizeInBytes, mimeType);
    const uploadResult = await uploadFileMeta(session.id, filePath, 'v18.0', meta.access_token);
    if (!uploadResult?.success) {
      return { success: false, msg: 'Please check your meta API' };
    }
    const url = `${process.env.BACKURI}/media/${filename}`;
    await metaRepository.createMetaTempletMedia({ uid, templet_name, meta_hash: uploadResult.data.h, file_name: filename });
    return { success: true, url, hash: uploadResult.data.h };
  }

}

module.exports = MetaService;