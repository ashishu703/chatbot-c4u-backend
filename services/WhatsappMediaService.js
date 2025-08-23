const WhatsappMediaApi = require("../api/Whatsapp/WhatsappMediaApi");
const FillAllFieldsException = require("../exceptions/CustomExceptions/FillAllFieldsException");
const MetaApiKeysNotfoundException = require("../exceptions/CustomExceptions/MetaApiKeysNotfoundException");
const SocialAccountRepository = require("../repositories/SocialAccountRepository");
const WhatsappTempleteMediaRepository = require("../repositories/WhatsappTempleteMediaRepository");
const { generateUid } = require("../utils/auth.utils");
const { storeMetaFiles, saveFileContent } = require("../utils/file.utils");


class WhatsappMediaService {


    constructor(user = null, accessToken = null) {
        this.accountRepository = new SocialAccountRepository();
        this.whatsappMediaApi = new WhatsappMediaApi(user, accessToken);
        this.whatsappTempleteMediaRepository = new WhatsappTempleteMediaRepository();
    }

    async uploadTempleteMedia(uid, templet_name) {
        if (!templet_name) {
            console.log("templet_name is required",templet_name);
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
        } = await storeMetaFiles(file)

        const { fileSizeInBytes, mimeType } = await getFileInfo(directory);

        const session = await this.whatsappMediaApi.getSessionUploadMediaMeta(fileSizeInBytes, mimeType);

        const uploadedFile = await this.whatsappMediaApi.uploadFileMeta(session.id, directory)

        const url = `${backendURI}/media/${filename}`;

        await this.whatsappTempleteMediaRepository.create({
            uid: uid,
            account_id: account.id,
            templet_name: templet_name,
            meta_hash: uploadedFile?.data?.h,
            file_name: filename
        });

        return {
            url,
            hash: uploadedFile?.data?.h
        }
    }

    async downloadAndSaveMedia(mediaId) {
        await this.whatsappMediaApi.initMeta();
        const attachment = await this.whatsappMediaApi.getMedia(mediaId);
        const response = await this.whatsappMediaApi.getMediaFromUrl(attachment.url);
        const ext = response.headers["content-type"].split("/")[1];
        const randomSt = generateUid();
        const savingPath = `${__dirname}/../client/public/meta-media/${randomSt}`;
        saveFileContent(response.data, `${savingPath}.${ext}`);
        return `${randomSt}.${ext}`;
    }

};


module.exports = WhatsappMediaService
