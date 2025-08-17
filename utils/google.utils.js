const { OAuth2Client } = require('google-auth-library');
const GoogleLoginFailedException = require('../exceptions/CustomExceptions/GoogleLoginFailedException');

/**
 * Verify Google ID Token
 * @param {string} idToken - Google ID token from frontend
 * @param {string} clientId - Google Client ID from database
 * @returns {Promise<Object>} - Decoded token payload
 */
async function verifyGoogleToken(idToken, clientId) {
  try {
    if (!idToken || !clientId) {
      throw new GoogleLoginFailedException();
    }

    const client = new OAuth2Client(clientId);
    
    const ticket = await client.verifyIdToken({
      idToken: idToken,
      audience: clientId
    });

    const payload = ticket.getPayload();
    
    if (!payload) {
      throw new GoogleLoginFailedException();
    }

    return payload;
  } catch (error) {
    console.error('Google token verification failed:', error.message);
    throw new GoogleLoginFailedException();
  }
}

/**
 * Extract user information from Google token payload
 * @param {Object} payload - Google token payload
 * @returns {Object} - User information
 */
function extractGoogleUserInfo(payload) {
  return {
    email: payload.email,
    name: payload.name,
    picture: payload.picture,
    googleId: payload.sub,
    emailVerified: payload.email_verified
  };
}

module.exports = {
  verifyGoogleToken,
  extractGoogleUserInfo
}; 