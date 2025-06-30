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


}

module.exports = WhatsappWebhookDto;