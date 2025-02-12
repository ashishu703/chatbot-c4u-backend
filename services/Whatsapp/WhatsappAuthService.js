const WhatsappSerice = require("./WhatsappSerice");


module.exports = class WhatsappAuthService extends WhatsappSerice {
    pageService;
    constructor(user, accessToken) {
        super(user, accessToken);
    }

    async initiateUserAuth() {
       
    }



    async getLongLiveToken() {
       
    }

    async saveCurrentSession() {
    
    }

}