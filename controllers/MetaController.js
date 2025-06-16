const WhatsappMediaApi = require('../api/Whatsapp/WhatsappMediaApi');
const { backendURI } = require('../config/app.config');
const FillAllFieldsException = require('../exceptions/CustomExceptions/FillAllFieldsException');
const MetaApiKeysNotfoundException = require('../exceptions/CustomExceptions/MetaApiKeysNotfoundException');
const SocialAccountRepository = require('../repositories/SocialAccountRepository');
const WhatsappTempleteMediaRepository = require('../repositories/WhatsappTempleteMediaRepository');
const MetaService = require('../services/MetaService');
const { generateUid } = require('../utils/auth.utils');
const { uploadMetaFiles, getFileInfo } = require('../utils/file.utils');
const { formSuccess } = require('../utils/response.utils');

class MetaController {
  metaService;
  constructor() {
    this.metaService = new MetaService();
    this.accountRepository = new SocialAccountRepository();
    this.whatsappMediaApi = new WhatsappMediaApi();
    this.whatsappTempleteMediaRepository = new WhatsappTempleteMediaRepository();
  }
  

  async returnMediaUrlMeta(req, res, next) {
    try {
      const { uid } = req.decode;
      const { templet_name } = req.body;

      if (!templet_name) {
        throw new FillAllFieldsException();
      }

      const file = req.files?.file;

      if (!file) {
        throw new FillAllFieldsException();
      }

      const account = this.accountRepository.getWhatsappAccount(uid);
      if (!account) {
        throw new MetaApiKeysNotfoundException();
      }

      const {
        filename,
        directory
      } = await uploadMetaFiles(file)

      const { fileSizeInBytes, mimeType } = await getFileInfo(directory);

      const session = await this.whatsappMediaApi.getSessionUploadMediaMeta(fileSizeInBytes, mimeType);

      const uploadedFile = await this.whatsappMediaApi.uploadFileMeta(session.id, directory)

      console.log({
        uploadedFile
      })

      const url = `${backendURI}/media/${filename}`;

      await this.whatsappTempleteMediaRepository.create({
        uid: uid,
        account_id: account.id,
        templet_name: templet_name,
        meta_hash: uploadedFile?.data?.h,
        file_name: filename
      });

      return formSuccess(res, { url, hash: uploadedFile?.data?.h });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = MetaController;