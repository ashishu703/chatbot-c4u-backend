const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

const isValidEmail = (email) => {
  return validateEmail(email);
};

const getFileExtension = (filename) => {
  return filename.split('.').pop();
};

// Placeholder for executeQueries
const executeQueries = async (queries, connection) => {
  for (const query of queries) {
    await connection.query(query);
  }
};

module.exports = { validateEmail, isValidEmail, getFileExtension, executeQueries };