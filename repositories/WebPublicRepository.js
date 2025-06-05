const { WebPublic } = require("../models");
const Repository = require("./Repository");
const { defaultAppConfig } = require("../config/app.config");

class WebPublicRepository extends Repository {
  
  constructor() {
    super(WebPublic);
  }


  async initConfig() {
    return this.createIfNotExists(defaultAppConfig, { id: 1 });
  }

  async getWebPublic() {
    return this.initConfig();
  }

  async updateGoogleLoginCredentials(google_client_id, google_login_active) {
    this.update({ google_client_id, google_login_active }, { id: 1 });
  }

}

module.exports = WebPublicRepository;

