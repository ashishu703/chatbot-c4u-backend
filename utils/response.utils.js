function formSuccess(res, data, statusCode = 200) {
  return res.status(statusCode).send({
    success: true,
    ...data,
  });
}

function formRawResponse(res, data, statusCode = 200) {
  return res.status(statusCode).send(data);
}

function formWebhookResponse(res) {
  return res.status(200).send('EVENT_RECEIVED');
}

module.exports = {
  formSuccess,
  formRawResponse,
  formWebhookResponse
};
