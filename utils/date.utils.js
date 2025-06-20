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

function getCurrentTimeStampInSeconds() {
  return Math.floor(Date.now() / 1000);
}

function getNumberOfDaysFromTimestamp(timestamp) {
  if (!timestamp || isNaN(timestamp)) {
    return 0;
  }

  const currentTimestamp = Date.now();
  if (timestamp <= currentTimestamp) {
    return 0;
  }

  const millisecondsInADay = 1000 * 60 * 60 * 24;
  return Math.ceil((timestamp - currentTimestamp) / millisecondsInADay);
}

module.exports = {
  addDaysToCurrentTimestamp,
  secondsToMilliseconds,
  millisecondsToSeconds,
  getNumberOfDaysFromTimestamp,
  getCurrentTimeStampInSeconds
};
