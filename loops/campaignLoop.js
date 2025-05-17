const moment = require("moment-timezone");
const { Pool } = require("pg");
const { getUserPlayDays } = require("../functions/function");
const { sendMessage } = require("./loopFunctions");

// PostgreSQL connection pool configuration
const pool = new Pool({
  user: process.env.DBUSER,
  host: process.env.DBHOST,
  database: process.env.DBNAME,
  password: process.env.DBPASS,
  port: process.env.DBPORT,
  logging: false,
});

// Delay function for random wait between requests
function delayRandom(fromSeconds, toSeconds) {
  const randomSeconds = Math.random() * (toSeconds - fromSeconds) + fromSeconds;
  return new Promise((resolve) => {
    setTimeout(() => resolve(), randomSeconds * 1000);
  });
}

// Function to check if the scheduled date has passed in the provided timezone
function hasDatePassedInTimezone(timezone, date) {
  const momentDate = moment.tz(date, timezone);
  const currentMoment = moment.tz(timezone);
  return momentDate.isBefore(currentMoment);
}

// Function to update the broadcast status in the database
async function updateBroadcastDatabase(status, broadcastId) {
  try {
    // Correct table name to lowercase "broadcasts"
    await pool.query(
      "UPDATE broadcasts SET status = $1 WHERE broadcast_id = $2",
      [status, broadcastId]
    );
  } catch (err) {
    console.error("Error updating broadcast:", err);
  }
}

// Function to process each individual broadcast
async function processBroadcast(campaign) {
  try {
    // Check user plan days
    const planDays = await getUserPlayDays(campaign?.uid);
    if (planDays < 1) {
      await updateBroadcastDatabase(
        "ACTIVE PLAN NOT FOUND",
        campaign?.broadcast_id
      );
      return;
    }

    // Fetch meta API keys for the campaign
    const metaKeys = await pool.query("SELECT * FROM meta_api WHERE uid = $1", [
      campaign?.uid,
    ]);
    if (metaKeys.rows.length < 1) {
      await updateBroadcastDatabase(
        "META API NOT FOUND",
        campaign?.broadcast_id
      );
      return;
    }

    // Fetch pending broadcast log entries
    const log = await pool.query(
      "SELECT * FROM broadcast_log WHERE broadcast_id = $1 AND delivery_status = $2 LIMIT 1",
      [campaign?.broadcast_id, "PENDING"]
    );

    // If no pending log entry, update the broadcast status to "FINISHED"
    if (log.rows.length < 1) {
      await updateBroadcastDatabase("FINISHED", campaign?.broadcast_id);
      return;
    }

    const message = log.rows[0];
    const getObj = await sendMessage(message, metaKeys.rows[0]);
    const curTime = Date.now();

    if (getObj.success) {
      await pool.query(
        "UPDATE broadcast_log SET meta_msg_id = $1, delivery_status = $2, delivery_time = $3 WHERE id = $4",
        [getObj?.msgId, getObj.msg, curTime, message?.id]
      );
    } else {
      console.log({ getObj: JSON.stringify(getObj) });
      await pool.query(
        "UPDATE broadcast_log SET delivery_status = $1 WHERE id = $2",
        [getObj.msg, message?.id]
      );
    }
  } catch (err) {
    console.error("Error processing broadcast:", err);
  }
}

// Function to process all broadcasts in the queue
async function processBroadcasts() {
  try {
    // Fetch broadcasts from the queue
    const broadcasts = await pool.query(
      "SELECT * FROM broadcasts WHERE status = $1",
      ["QUEUE"]
    );
    for (const campaign of broadcasts.rows) {
      // Check if the scheduled date has passed
      if (
        campaign.schedule &&
        hasDatePassedInTimezone(campaign?.timezone, campaign?.schedule)
      ) {
        await processBroadcast(campaign);
      }
    }
  } catch (err) {
    console.error("Error in processBroadcasts:", err);
  }
}

// Function to run the campaign repeatedly
async function runCampaign() {
  console.log("Campaign started");
  setInterval(async () => {
    await processBroadcasts();
    await delayRandom(3, 5); // Random delay between 3 to 5 seconds
  }, 5000); // Run every 5 seconds
}

// Export the runCampaign function to be used elsewhere
module.exports = { runCampaign };
