function addDaysToCurrentTimestamp(days) {
  const currentTimestamp = Date.now();
  const millisecondsToAdd = parseInt(days || 0) * 24 * 60 * 60 * 1000;

  const futureDate = new Date(currentTimestamp + millisecondsToAdd);

  if (isNaN(futureDate.getTime())) {
    throw new Error('Invalid date calculation');
  }

  return futureDate.getTime();
}

module.exports = { addDaysToCurrentTimestamp };
