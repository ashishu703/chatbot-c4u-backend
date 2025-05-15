const MetaRepository = require('../repositories/MetaRepository');
const { getBusinessPhoneNumber, createMetaTemplet, getAllTempletsMeta, delMetaTemplet, getSessionUploadMediaMeta, uploadFileMeta } = require('../utils/metaApi');
const randomstring = require('randomstring');
const path = require('path');

class MetaService {
  metaRepository;
  constructor() {
    this.metaRepository = new MetaRepository();
  }
  async updateMetaApi(uid, data) {
    const { waba_id, business_account_id, access_token, business_phone_number_id, app_id } = data;
    if (!waba_id || !business_account_id || !access_token || !app_id) {
      throw new Error('Please fill all the fields');
    }

    const resp = await getBusinessPhoneNumber('v18.0', business_phone_number_id, access_token);
    if (resp?.error || !resp?.success) {
      throw new Error(resp?.error?.message || 'Please check your details');
    }

    const existing = await this.metaRepository.findMetaApiByUid(uid);
    if (existing.length > 0) {
      await this.metaRepository.updateMetaApi(uid, data);
    } else {
      await this.metaRepository.insertMetaApi({ uid, ...data });
    }

    return { success: true, msg: 'Your meta settings were updated successfully!' };
  }

  async getMetaKeys(uid) {
    const data = await this.metaRepository.findMetaApiByUid(uid);
    return { success: true, data: data[0] || {} };
  }

  async addMetaTemplet(uid, body) {
    const apiKeys = await this.metaRepository.findMetaApiByUid(uid);
    if (apiKeys.length < 1) {
      throw new Error('Please fill your meta API keys');
    }

    const resp = await createMetaTemplet('v18.0', apiKeys[0].waba_id, apiKeys[0].access_token, body);
    if (resp?.error || !resp?.success) {
      throw new Error(resp?.error?.error_user_msg || resp?.error?.message || 'Failed to create template');
    }

    return { success: true, msg: 'Templet was added and waiting for the review' };
  }

  async getMyMetaTemplets(uid) {
    const meta = await this.metaRepository.findMetaApiByUid(uid);
    if (meta.length < 1) {
      throw new Error('Please check your meta API keys');
    }

    const resp = await getAllTempletsMeta('v18.0', meta[0].waba_id, meta[0].access_token);
    if (resp?.error || !resp?.success) {
      throw new Error(resp?.error?.message || 'Please check your API');
    }

    return { success: true, data: resp?.data || [] };
  }

  async deleteMetaTemplet(uid, name) {
    const meta = await this.metaRepository.findMetaApiByUid(uid);
    if (meta.length < 1) {
      throw new Error('Please check your meta API keys');
    }

    const resp = await delMetaTemplet('v18.0', meta[0].waba_id, meta[0].access_token, name);
    if (resp?.error || !resp?.success) {
      throw new Error(resp?.error?.error_user_title || 'Please check your API');
    }

    return { success: true, data: resp?.data || [], msg: 'Templet was deleted' };
  }

  async returnMediaUrlMeta(uid, templet_name, file, getFileInfo) {
    if (!templet_name) {
      throw new Error('Please give a templet name first');
    }
    if (!file) {
      throw new Error('No files were uploaded');
    }

    const meta = await this.metaRepository.findMetaApiByUid(uid);
    if (meta.length < 1) {
      throw new Error('Please check your meta API keys');
    }

    const randomString = randomstring.generate();
    const filename = `${randomString}.${file.name.split('.').pop()}`;
    const filePath = path.join(__dirname, '../../client/public/media', filename);

    await new Promise((resolve, reject) => {
      file.mv(filePath, err => {
        if (err) reject(err);
        else resolve();
      });
    });

    const { fileSizeInBytes, mimeType } = await getFileInfo(filePath);
    const session = await getSessionUploadMediaMeta('v18.0', meta[0].app_id, meta[0].access_token, fileSizeInBytes, mimeType);
    if (!session?.id) {
      throw new Error('Failed to start upload session');
    }

    const upload = await uploadFileMeta(session.id, filePath, 'v18.0', meta[0].access_token);
    if (!upload?.success) {
      throw new Error('Please check your meta API');
    }

    const url = `${process.env.BACKURI}/media/${filename}`;
    await this.metaRepository.insertMetaTempletMedia(uid, templet_name, upload?.data?.h, filename);

    return { success: true, url, hash: upload?.data?.h };
  }
}

module.exports = MetaService;