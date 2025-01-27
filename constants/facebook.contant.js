const dotenv = require("dotenv");
dotenv.config();
const env = process.env;


module.exports = {
    FACEBOOK_CLIENT_ID: env.FACEBOOK_CLIENT_ID,
    FACEBOOK_CLIENT_SECRET: env.FACEBOOK_CLIENT_SECRET,
    FACEBOOK_DEFAULT_GRAPH_VERSION: env.FACEBOOK_DEFAULT_GRAPH_VERSION,
    FACEBOOK_TYPE_KEY : "facebook"
}