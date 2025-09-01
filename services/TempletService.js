const { backendURI } = require("../config/app.config");
const TempletRepository = require("../repositories/TempletRepository");

class TempletService {
  constructor() {
    this.templetRepository = new TempletRepository();
  }

  async addTemplate(uid, { title, type, content }) {
    if (typeof content !== "string") {
      content = JSON.stringify(content);
    }

    return this.templetRepository.create({ uid, title, type, content });
  }

  async getTemplates(query) {
    return this.templetRepository.paginate(query);
  }

  async deleteTemplates(ids) {
    return this.templetRepository.deleteByIds(ids);
  }


  async prepareTemplate(
    template,
    example,
    dynamicMedia
  ) {
    console.log("bhai 31 line me",template.components, example, dynamicMedia);
    const checkBody = template?.components?.filter((i) => i.type === "BODY");
    const getHeader = template?.components?.filter((i) => i.type === "HEADER");
    const headerFormat = getHeader?.length > 0 ? getHeader[0]?.format : "";



    let templ = {
      name: template?.name,
      language: { code: template?.language },
      components: [],
    };

    if (checkBody.length > 0) {
      const comp = checkBody[0]?.example?.body_text[0]?.map((i, key) => ({
        type: "text",
        text: example[key] || i,
      }));
      if (comp) {
        templ.components.push({ type: "body", parameters: comp });
      }
    }

    if (headerFormat === "IMAGE" && getHeader.length > 0) {
      const media = await MetaTempletMedia.findOne({
        where: { templet_name: template?.name },
      });
      templ.components.unshift({
        type: "header",
        parameters: [
          {
            type: "image",
            image: {
              link: dynamicMedia
                ? dynamicMedia
                : media
                  ? `${backendURI}/media/${media.file_name}`
                  : getHeader[0].example?.header_handle[0],
            },
          },
        ],
      });
    }

    if (headerFormat === "VIDEO" && getHeader.length > 0) {
      const media = await MetaTempletMedia.findOne({
        where: { templet_name: template?.name },
      });
      templ.components.unshift({
        type: "header",
        parameters: [
          {
            type: "video",
            video: {
              link: dynamicMedia
                ? dynamicMedia
                : media
                  ? `${backendURI}/media/${media.file_name}`
                  : getHeader[0].example?.header_handle[0],
            },
          },
        ],
      });
    }

    if (headerFormat === "DOCUMENT" && getHeader.length > 0) {
      const media = await MetaTempletMedia.findOne({
        where: { templet_name: template?.name },
      });
      templ.components.unshift({
        type: "header",
        parameters: [
          {
            type: "document",
            document: {
              link: dynamicMedia
                ? dynamicMedia
                : media
                  ? `${backendURI}/media/${media.file_name}`
                  : getHeader[0].example?.header_handle[0],
              filename: "document",
            },
          },
        ],
      });
    }
    return templ;



  }

}

module.exports = TempletService;
