const WhatsappMediaApi = require("../api/Whatsapp/WhatsappMediaApi");
const FillAllFieldsException = require("../exceptions/CustomExceptions/FillAllFieldsException");
const MetaApiKeysNotfoundException = require("../exceptions/CustomExceptions/MetaApiKeysNotfoundException");
const SocialAccountRepository = require("../repositories/SocialAccountRepository");
const MetaTempleteMediaRepository = require("../repositories/MetaTempleteMediaRepository");
const { generateUid } = require("../utils/auth.utils");

const {
  storeMetaFiles,
  saveFileContent,
  getFileInfo,
} = require("../utils/file.utils");
const { backendURI } = require("../config/app.config");

class WhatsappMediaService {
  constructor(user = null, accessToken = null) {
    this.accountRepository = new SocialAccountRepository();
    this.whatsappMediaApi = new WhatsappMediaApi(user, accessToken);
    this.metaTempleteMediaRepository = new MetaTempleteMediaRepository();
  }

  async uploadTempleteMedia(uid, templet_name, file) {
    if (!templet_name) {
      throw new FillAllFieldsException();
    }

    if (!file) {
      throw new FillAllFieldsException();
    }

    const account = await this.accountRepository.getWhatsappAccount(uid);
    if (!account) {
      throw new MetaApiKeysNotfoundException();
    }

    const { filename, directory } = await storeMetaFiles(file);

    const { fileSizeInBytes, mimeType } = await getFileInfo(directory);

    await this.whatsappMediaApi.setToken(account.token).initMeta();

    const session = await this.whatsappMediaApi.getSessionUploadMediaMeta(
      fileSizeInBytes,
      mimeType
    );

    const { h: hash } = await this.whatsappMediaApi.uploadFileMeta(
      session.id,
      directory
    );

    const url = `${backendURI}/media/${filename}`;

    await this.metaTempleteMediaRepository.create({
      uid: uid,
      account_id: account.id,
      template_name: templet_name,
      meta_hash: hash,
      file_name: filename,
      message_id: hash || `tmpl_${Date.now()}`,
    });

    return {
      url,
      hash,
    };
  }

  async downloadAndSaveMedia(mediaId) {
    try {
      await this.whatsappMediaApi.initMeta();

      const attachment = await this.whatsappMediaApi.getMedia(mediaId);
      const mediaUrl =
        attachment?.url ||
        attachment?.data?.url ||
        attachment?.data?.url?.[0] ||
        null;

      if (!mediaUrl) {
        console.error("[WHATSAPP_MEDIA] No media URL returned for id:", mediaId);
        return null;
      }

      const response = await this.whatsappMediaApi.getMediaFromUrl(mediaUrl);

      const contentType =
        response.headers?.["content-type"] ||
        response.headers?.["Content-Type"] ||
        "application/octet-stream";

      const ext = (contentType.split(";")[0].split("/")[1] || "bin").toLowerCase();

      const randomSt = generateUid();
      const savingPath = `${__dirname}/../client/public/meta-media/${randomSt}`;

      saveFileContent(response.data, `${savingPath}.${ext}`);

      return `${randomSt}.${ext}`;
    } catch (error) {
      console.error("[WHATSAPP_MEDIA] Failed to download/save media:", {
        mediaId,
        error,
      });
      return null;
    }
  }
}

module.exports = WhatsappMediaService;
