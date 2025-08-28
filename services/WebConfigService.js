const PleaseProvideAppNameException = require("../exceptions/CustomExceptions/PleaseProvideAppNameException");
const WebConfigRepository = require("../repositories/WebPublicRepository");
const { getFileExtension } = require("../utils/file.utils");
const path = require("path");
const { generateUid } = require("../utils/auth.utils");

class WebConfigService {

  constructor() {
    this.webConfigRepository = new WebConfigRepository();
  }

  async updateWebConfig(req) {
    const {
      app_name,
      custom_home,
      is_custom_home,
      meta_description,
      currency_code,
      currency_symbol,
      home_page_tutorial,
      chatbot_screen_tutorial,
      broadcast_screen_tutorial,
      login_header_footer,
      exchange_rate,
      facebook_client_id,
      facebook_client_secret,
      facebook_graph_version,
      facebook_auth_scopes,
      meta_webhook_verifcation_key,
      instagram_client_id,
      instagram_client_secret,
      instagram_graph_version,
      instagram_auth_scopes,
      whatsapp_client_id,
      whatsapp_client_secret,
      whatsapp_graph_version,
      whatsapp_config_id,
    } = req.body;

    let filename = req.body.logo || "";

    if (req.files?.file) {
      const file = req.files.file;
      const randomName = generateUid();
      filename = `${randomName}.${getFileExtension(file.name)}`;
      const savePath = path.join(
        __dirname,
        "..",
        "client",
        "public",
        "media",
        filename
      );

      await new Promise((resolve, reject) => {
        file.mv(savePath, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }

    if (!app_name) throw new PleaseProvideAppNameException();

    const configData = {
      logo: filename,
      app_name,
      custom_home,
      is_custom_home: parseInt(is_custom_home) || 0,
      meta_description,
      currency_code,
      currency_symbol,
      home_page_tutorial,
      chatbot_screen_tutorial,
      broadcast_screen_tutorial,
      login_header_footer: parseInt(login_header_footer) || 0,
      exchange_rate: exchange_rate || "",
      facebook_client_id,
      facebook_client_secret,
      facebook_graph_version,
      facebook_auth_scopes,
      meta_webhook_verifcation_key,
      instagram_client_id,
      instagram_client_secret,
      instagram_graph_version,
      instagram_auth_scopes,
      whatsapp_client_id,
      whatsapp_client_secret,
      whatsapp_graph_version,
      whatsapp_config_id,
    };
    const cleanedData = Object.fromEntries(
      Object.entries(configData).filter(([_, v]) => v !== undefined)
    );
    return await this.webConfigRepository.update(cleanedData, {
      id: 1
    });
  }

  async getWebPublic() {
    return this.webConfigRepository.initConfig();
  }
}

module.exports = WebConfigService;
