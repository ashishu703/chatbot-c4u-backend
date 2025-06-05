
function formSuccess(data, statusCode = 200) {
  return (
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
