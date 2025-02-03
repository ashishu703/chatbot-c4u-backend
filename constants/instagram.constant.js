const dotenv = require("dotenv");
dotenv.config();
const env = process.env;


module.exports = {
    INSTAGRAM_CLIENT_ID: env.INSTAGRAM_CLIENT_ID,
    INSTAGRAM_CLIENT_SECRET: env.INSTAGRAM_CLIENT_SECRET,
    INSTAGRAM_DEFAULT_GRAPH_VERSION: env.INSTAGRAM_DEFAULT_GRAPH_VERSION,
    META_WEBHOOK_VERIFICATION_KEY: env.META_WEBHOOK_VERIFICATION_KEY,
    INSTAGRAM_TYPE_KEY : "instagram",
    INSTAGRAM_REDIRECT_URI: "https://omnichat.karobar.org/auth-code-manager"
}