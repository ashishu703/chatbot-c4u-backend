const { json } = require("sequelize");

function formSuccess(data, statusCode = 200) {
  return json({
    success: true,
    ...data,
  }, statusCode);

}
module.exports = {
  formSuccess,
};