class MetaApiHelpers {
  static buildGraphApiUrl(version, endpoint, params = {}) {
    const baseUrl = `https://graph.facebook.com/${version}/${endpoint}`;
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        queryParams.append(key, value);
      }
    });
    
    return queryParams.toString() ? `${baseUrl}?${queryParams.toString()}` : baseUrl;
  }

  static async fetchGraphApi(url, options = {}) {
    let body = undefined;
    let headers = options.headers || {};

    if (options.body) {
      if (options.method === 'POST' && options.useFormData) {
        const formData = new URLSearchParams();
        Object.entries(options.body).forEach(([key, value]) => {
          if (value !== null && value !== undefined && value !== '') {
            formData.append(key, String(value));
          }
        });
        body = formData.toString();
        headers['Content-Type'] = 'application/x-www-form-urlencoded';
      } else {
        body = JSON.stringify(options.body);
        headers['Content-Type'] = 'application/json';
      }
    }

    const response = await fetch(url, {
      method: options.method || 'GET',
      headers: headers,
      body: body
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      const error = errorData.error || {};
      
      throw {
        code: error.code,
        subcode: error.error_subcode,
        message: error.message,
        fbtrace_id: error.fbtrace_id,
        type: error.type,
        status: response.status
      };
    }
    
    return await response.json();
  }

  static sanitizeCatalogId(catalogId) {
    if (!catalogId || typeof catalogId !== "string") {
      throw new Error("Invalid catalog ID: must be a non-empty string");
    }
    return catalogId.trim();
  }

  static parsePrice(priceString) {
    if (!priceString) return 0;
    const numericString = priceString.replace(/[^\d.]/g, "");
    return parseFloat(numericString) || 0;
  }

  static normalizeAvailability(availability) {
    const normalized = (availability || "").toLowerCase();
    return normalized === "in stock" || normalized === "available" ? "active" : "inactive";
  }
}

module.exports = MetaApiHelpers;
