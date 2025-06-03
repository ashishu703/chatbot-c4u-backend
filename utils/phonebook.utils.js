function areMobileNumbersFilled(array) {
    return array.every((item) => item.mobile);
}


const parseCSVFile = async (fileData) => {
    try {
        return csv.parse(fileData, { columns: true, skip_empty_lines: true });
    } catch (error) {
        console.error("Error parsing CSV:", error);
        return null;
    }
};

module.exports = {
    areMobileNumbersFilled,
    parseCSVFile,
};