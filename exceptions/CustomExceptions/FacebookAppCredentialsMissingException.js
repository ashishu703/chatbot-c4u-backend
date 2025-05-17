const CustomException = require("../CustomException");

class FacebookAppCredentialsMissingException extends CustomException {
    constructor() {
        super("FacebookAppCredentialsMissingException");
    }
}

module.exports = FacebookAppCredentialsMissingException;
