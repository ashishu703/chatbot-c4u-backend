const FacebookException = require("./../exceptions/FacebookException");

 async function handleApiResponse(response) {
   
    if (!response.ok) {
        const errorData = await response.json();
        const { code, message, type } = errorData.error || {};
        throw new FacebookException(message || "An error occurred", type || "Unknown", code || response.status);
    }
    return await response.json();
}

module.exports ={
    handleApiResponse
}