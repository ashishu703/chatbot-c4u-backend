const { default: axios } = require("axios");
const WhatsappApi = require("./WhatsappApi");

class WhatsappMediaApi extends WhatsappApi {
    constructor(user = null, accessToken = null) {
        super(user, accessToken);
    }

    async getSessionUploadMediaMeta(
        fileSize,
        mimeType
    ) {
        return this.post(`/${this.AppId}/uploads`, {}, {
            file_length: fileSize,
            file_type: mimeType
        })
    }

    async uploadFileMeta(sessionId, filePath) {
        const fileData = fs.readFileSync(filePath);
        return this.post(`/${sessionId}`, {}, {}, {
            Authorization: `OAuth ${this.accessToken}`,
            "Content-Type": "application/pdf",
            Cookie: "ps_l=0; ps_n=0",
        }, {
            body: fileData
        })
    }


    async getMedia(mediaId) {
        return this.get(`/${mediaId}`, {}, {
            responseType: "arraybuffer"
        })
    }


    async getMediaFromUrl(url) {
        return axios({
            method: "GET",
            url: url,
            headers: {
                Authorization: `Bearer ${this.accessToken}`,
            },
            responseType: "arraybuffer",
        });

    }

};

module.exports = WhatsappMediaApi
