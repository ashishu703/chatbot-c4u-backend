function addDaysToCurrentTimestamp(days) {
    const date = new Date();
    date.setDate(date.getDate() + parseInt(days || 0));
    return date.toISOString();
  }
  
  module.exports = { addDaysToCurrentTimestamp };