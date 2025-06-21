function formSuccess(res, data, statusCode = 200) {
  return res.status(statusCode).send({
    success: true,
    ...data,
  });
}

function formRawResponse(res, data, statusCode = 200) {
  return res.status(statusCode).send(data);
}

module.exports = {
  formSuccess,
  formRawResponse,
};
