const { dataGet } = require("../../utils/others.utils");
const WhatsappMessageChangeDto = require("./WhatsappMessageChangeDto");

class WhatsappWebhookDto {
    constructor(data = {}) {
        this.data = data;
    }

    getWabaId() {
        return dataGet(this.data, "id");
    }

    getChanges() {
        const changes = dataGet(this.data, "changes");
        return changes.map((change) => new WhatsappMessageChangeDto(change));
    }

    isSubscriptionEvent(){
        return dataGet(this.data, "changes.0.value.event") === 'PARTNER_APP_INSTALLED';
    }


}

module.exports = WhatsappWebhookDto;