const { default: axios } = require("axios");
const WhatsappApi = require("./WhatsappApi");
const fs = require("fs");
class WhatsappMediaApi extends WhatsappApi {
  constructor(user = null, accessToken = null) {
    super(user, accessToken);
  }

  async getSessionUploadMediaMeta(fileSize, mimeType) {
    return this.post(
      `/${this.AppId}/uploads`,
      {},
      {
        file_length: fileSize,
        file_type: mimeType,
      }
    );
  }

  async uploadFileMeta(sessionId, filePath) {
    try {
      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
      }
      const fileData = fs.readFileSync(filePath);
      const fileExtension = filePath.split(".").pop().toLowerCase();
      const contentType =
        {
          jpg: "image/jpeg",
          jpeg: "image/jpeg",
          png: "image/png",
          gif: "image/gif",
          pdf: "application/pdf",
          doc: "application/msword",
          docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          txt: "text/plain",
          mp4: "video/mp4",
          avi: "video/x-msvideo",
          mov: "video/quicktime",
        }[fileExtension] || "application/octet-stream";
      return await this.post(
        `/${sessionId}`,
        fileData,
        {},
        {
          Authorization: `OAuth ${this.accessToken}`,
          "Content-Type": contentType,
          Cookie: "ps_l=0; ps_n=0",
        }
      );
    } catch (error) {
      throw error;
    }
  }

  async getMedia(mediaId) {
    return this.get(
      `/${mediaId}`,
      {},
      {
        responseType: "arraybuffer",
      }
    );
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
}

module.exports = WhatsappMediaApi;
