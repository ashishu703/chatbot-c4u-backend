const generateWhatsAppURL = (number, message) => {
  const baseURL = "https://wa.me/";
  const encodedMessage = encodeURIComponent(message);
  return `${baseURL}${number}?text=${encodedMessage}`;
};

// Placeholder for returnWidget
const returnWidget = (logoUrl, size, url, place) => {
  // Replace with your implementation
  return `<div>Widget: ${url}</div>`;
};

module.exports = { generateWhatsAppURL, returnWidget };
