const MetaRepository = require("../repositories/MetaRepository");
const {
  getBusinessPhoneNumber,
  createMetaTemplet,
  getAllTempletsMeta,
  delMetaTemplet,
  getSessionUploadMediaMeta,
  uploadFileMeta,
} = require("../utils/meta-api.utils");
const randomstring = require("randomstring");
const path = require("path");
const FillAllFieldsException = require("../exceptions/CustomExceptions/FillAllFieldsException");
const CheckYourDetailsException = require("../exceptions/CustomExceptions/CheckYourDetailsException");
const FillMetaApiKeysException = require("../exceptions/CustomExceptions/FillMetaApiKeysException");
const TemplateCreationFailedException = require("../exceptions/CustomExceptions/TemplateCreationFailedException");
const CheckMetaApiKeysException = require("../exceptions/CustomExceptions/CheckMetaApiKeysException");
const CheckApiException = require("../exceptions/CustomExceptions/CheckApiException");
const TemplateNameRequiredException = require("../exceptions/CustomExceptions/TemplateNameRequiredException");
const NoFilesWereUploadedException = require("../exceptions/CustomExceptions/NoFilesWereUploadedException");
const UploadSessionFailedException = require("../exceptions/CustomExceptions/UploadSessionFailedException");
const CheckMetaApiException = require("../exceptions/CustomExceptions/CheckMetaApiException");

class MetaService {
  metaRepository;
  constructor() {
    this.metaRepository = new MetaRepository();
  }
  async updateMetaApi(uid, data) {
    const {
      waba_id,
      business_account_id,
      access_token,
      business_phone_number_id,
      app_id,
    } = data;
    if (!waba_id || !business_account_id || !access_token || !app_id) {
      throw new FillAllFieldsException();
    }

    const resp = await getBusinessPhoneNumber(
      "v18.0",
      business_phone_number_id,
      access_token
    );
    if (resp?.error || !resp?.success) {
      throw new CheckYourDetailsException();
    }

    const existing = await this.metaRepository.findMetaApiByUid(uid);
    if (existing.length > 0) {
      await this.metaRepository.updateMetaApi(uid, data);
    } else {
      await this.metaRepository.insertMetaApi({ uid, ...data });
    }

    return true;
  }

  async getMetaKeys(uid) {
    const data = await this.metaRepository.findMetaApiByUid(uid);
    return { data: data[0] || {} };
  }

  

  async returnMediaUrlMeta(uid, templet_name, file, getFileInfo) {
    if (!templet_name) {
      throw new TemplateNameRequiredException();
    }
    if (!file) {
      throw new NoFilesWereUploadedException();
    }

    const meta = await this.metaRepository.findMetaApiByUid(uid);
    if (meta.length < 1) {
      throw new CheckMetaApiKeysException();
    }

    const randomString = randomstring.generate();
    const filename = `${randomString}.${file.name.split(".").pop()}`;
    const filePath = path.join(
      __dirname,
      "../../client/public/media",
      filename
    );

    await new Promise((resolve, reject) => {
      file.mv(filePath, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    const { fileSizeInBytes, mimeType } = await getFileInfo(filePath);
    const session = await getSessionUploadMediaMeta(
      "v18.0",
      meta[0].app_id,
      meta[0].access_token,
      fileSizeInBytes,
      mimeType
    );
    if (!session?.id) {
      throw new UploadSessionFailedException();
    }

    const upload = await uploadFileMeta(
      session.id,
      filePath,
      "v18.0",
      meta[0].access_token
    );
    if (!upload?.success) {
      throw new CheckMetaApiException();
    }

    const url = `${process.env.BACKURI}/media/${filename}`;
    await this.metaRepository.insertMetaTempletMedia(
      uid,
      templet_name,
      upload?.data?.h,
      filename
    );

    return { url, hash: upload?.data?.h };
  }
}

module.exports = MetaService;
