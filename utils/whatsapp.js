const createWhatsAppLink = (mobileNumber, message = "") => {
  const baseURL = "https://wa.me/";
  const encodedMessage = encodeURIComponent(message);
  const url = `${baseURL}${mobileNumber}?text=${encodedMessage}`;
  return url;
};

module.exports = { createWhatsAppLink };
