const { json } = require("sequelize");

function formSuccess(data, statusCode = 200) {
  return json(
    {
      success: true,
      ...data,
    },
    statusCode
  );
}

function formRawResponse(data, statusCode = 200) {
  return data;
}

module.exports = {
  formSuccess,
  formRawResponse,
};
