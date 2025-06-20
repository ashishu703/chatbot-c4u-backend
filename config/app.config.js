const defaultAppConfig = {
    currency_code: "USD",
    logo: "",
    app_name: "MyApp",
    custom_home: "",
    is_custom_home: 0,
    meta_description: "Default meta description",
    currency_symbol: "$",
    chatbot_screen_tutorial: "",
    broadcast_screen_tutorial: "",
    home_page_tutorial: "",
    login_header_footer: 0,
    exchange_rate: "1",
    facebook_client_id: "",
    facebook_client_secret: "",
    facebook_graph_version: "",
    facebook_auth_scopes: "",
    meta_webhook_verifcation_key: "",
    instagram_client_id: "",
    instagram_client_secret: "",
    instagram_graph_version: "",
    instagram_auth_scopes: "",
    whatsapp_client_id: "",
    whatsapp_client_secret: "",
    whatsapp_graph_version: "",
    whatsapp_config_id: "",
}

const tokenExpirationTime = "7d"
const passwordEncryptionRounds = process.env.SALT_ROUNDS
const jwtKey = process.env.JWTKEY
const frontendURI = process.env.FRONTENDURI
const backendURI = process.env.BACKURI
const stripeLang = process.env.STRIPE_LANG
const metaApiVersion = "v18.0"
const defaultTimeZone = "Asia/Kolkata";
const paypalUrl = process.env.PAYPAL_URL
const whatsAppAccountPin = process.env.WHATSAPP_ACCOUNT_PIN
const port = process.env.PORT

module.exports = {
    defaultAppConfig,
    tokenExpirationTime,
    passwordEncryptionRounds,
    jwtKey,
    frontendURI,
    backendURI,
    metaApiVersion,
    defaultTimeZone,
    stripeLang,
    paypalUrl,
    whatsAppAccountPin,
    port,
};