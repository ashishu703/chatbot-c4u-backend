const CustomException = require("../CustomException");

class GoogleLoginFailedException extends CustomException {
    constructor() {
        super("GoogleLoginFailedException");
    }
}

module.exports = GoogleLoginFailedException;
