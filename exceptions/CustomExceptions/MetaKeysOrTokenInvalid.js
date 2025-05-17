const CustomException = require("../CustomException");

class MetaKeysOrTokenInvalid extends CustomException {
    constructor() {
        super("MetaKeysOrTokenInvalid");
    }
}

module.exports = MetaKeysOrTokenInvalid;
