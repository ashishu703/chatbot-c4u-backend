function replacePlaceholders(template, data) {
   
    return template.replace(/{{{([^}]+)}}}/g, (match, key) => {
        key = key.trim();

        // Handle `JSON.stringify()` calls
        if (key.startsWith('JSON.stringify(') && key.endsWith(')')) {
            const innerKey = key.slice(15, -1).trim(); // Extract what's inside the parentheses
            const keys = innerKey.split(/[\.\[\]]/).filter(Boolean);

            let value = data;
            for (const k of keys) {
                if (value && (Array.isArray(value) ? value[parseInt(k, 10)] !== undefined : Object.prototype.hasOwnProperty.call(value, k))) {
                    value = Array.isArray(value) ? value[parseInt(k, 10)] : value[k];
                } else {
                    return "NA";
                }
            }

            return JSON.stringify(value);
        }

        // Split the key to handle both array and object properties
        const keys = key.split(/[\.\[\]]/).filter(Boolean);

        let value = data;
        for (const k of keys) {
            if (value && (Array.isArray(value) ? value[parseInt(k, 10)] !== undefined : Object.prototype.hasOwnProperty.call(value, k))) {
                value = Array.isArray(value) ? value[parseInt(k, 10)] : value[k];
            } else {
                return "NA"; // Return 'NA' if key or index is not found
            }
        }

        return value !== undefined ? value : "NA"; // Return 'NA' if value is undefined
    });
}


module.exports = { replacePlaceholders };