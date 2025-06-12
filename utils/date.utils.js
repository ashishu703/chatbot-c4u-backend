function addDaysToCurrentTimestamp(days) {
  const currentTimestamp = Date.now();
  const millisecondsToAdd = parseInt(days || 0) * 24 * 60 * 60 * 1000;

  const futureDate = new Date(currentTimestamp + millisecondsToAdd);

  if (isNaN(futureDate.getTime())) {
    throw new Error("Invalid date calculation");
  }

  return futureDate.getTime();
}


function secondsToMilliseconds(seconds) {
  return seconds * 1000;
}

function millisecondsToSeconds(milliseconds) {
  return Math.floor(milliseconds / 1000);
}

module.exports = {
  addDaysToCurrentTimestamp,
  secondsToMilliseconds,
  millisecondsToSeconds
};
