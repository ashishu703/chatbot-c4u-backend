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
    });

    return {
      url,
      hash,
    };
  }

  async downloadAndSaveMedia(mediaId) {
    await this.whatsappMediaApi.initMeta();
    const attachment = await this.whatsappMediaApi.getMedia(mediaId);
    const response = await this.whatsappMediaApi.getMediaFromUrl(
      attachment.url
    );
    const ext = response.headers["content-type"].split("/")[1];
    const randomSt = generateUid();
    const savingPath = `${__dirname}/../client/public/meta-media/${randomSt}`;
    saveFileContent(response.data, `${savingPath}.${ext}`);
    return `${randomSt}.${ext}`;
  }
}

module.exports = WhatsappMediaService;
