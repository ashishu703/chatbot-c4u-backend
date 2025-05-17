const CustomException = require("../CustomException");

class LoginInputMissingException extends CustomException {
    constructor() {
        super("LoginInputMissingException");
    }
}

module.exports = LoginInputMissingException;
