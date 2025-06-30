const { parse } = require('csv-parse/sync');

function areMobileNumbersFilled(array) {
    return array.every((item) => item.mobile);
}

const parseCSVFile = async (fileData) => {
    try {
        const records = parse(fileData, {
            columns: true,
            skip_empty_lines: true,
            trim: true,
        });
        return records;
    } catch (error) {
        console.error("Error parsing CSV:", error);
        return null;
    }
};

module.exports = {
    areMobileNumbersFilled,
    parseCSVFile,
};
