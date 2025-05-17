const CustomException = require("../CustomException");

class PrivacyTermsUncheckedException extends CustomException {
    constructor() {
        super("PrivacyTermsUncheckedException");
    }
}

module.exports = PrivacyTermsUncheckedException;
