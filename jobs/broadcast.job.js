const moment = require("moment-timezone");
const BroadcastRepository = require("../repositories/BroadcastRepository");
const {
  QUEUE,
  ACTIVE_PLAN_NOT_FOUND,
  FINISHED,
} = require("../types/broadcast-execution-status.types");
const { getNumberOfDaysFromTimestamp } = require("../utils/date.utils");
const SocialAccountRepository = require("../repositories/SocialAccountRepository");
const BroadcastLogRepository = require("../repositories/BroadcastLogRepository");
const {
  PENDING,
  SENT,
  FAILED,
} = require("../types/broadcast-delivery-status.types");
const WhatsappTemplateApi = require("../api/Whatsapp/WhatsappTemplateApi");
const { dataGet } = require("../utils/others.utils");
const TempletService = require("../services/TempletService");

const broadcastRepository = new BroadcastRepository();
const broadcastLogRepository = new BroadcastLogRepository();
const socialAccountRepository = new SocialAccountRepository();
const templetService = new TempletService();
const whatsappTemplateApi = new WhatsappTemplateApi();

// Delay function for random wait between requests
function delayRandom(fromSeconds, toSeconds) {
  const randomSeconds = Math.random() * (toSeconds - fromSeconds) + fromSeconds;
  return new Promise((resolve) => {
    setTimeout(() => resolve(), randomSeconds * 1000);
  });
}

function hasDatePassedInTimezone(timezone, date) {
  const momentDate = moment.tz(date, timezone);
  const currentMoment = moment.tz(timezone);
  return momentDate.isBefore(currentMoment);
}

async function processBroadcast(campaign) {
  try {
    const account = await socialAccountRepository.getWhatsappAccount(
      campaign.uid,
      ["user"]
    );

    if (!account) {
      return broadcastRepository.updateStatus(
        campaign.broadcast_id,
        META_API_NOT_FOUND,
        campaign.uid
      );
    }

    const user = account.user;
    const planDays = getNumberOfDaysFromTimestamp(user.plan_expiration);
    if (planDays < 1) {
      return broadcastRepository.updateStatus(
        campaign.broadcast_id,
        ACTIVE_PLAN_NOT_FOUND,
        account.uid
      );
    }
    const logs = await broadcastLogRepository.find(
      {
        where: {
          broadcast_id: campaign.id,
          delivery_status: PENDING,
        },
      },
      ["broadcast"]
    );
    let successCount = 0;
    let failureCount = 0;

    for (const log of logs) {
      try {
        const resp = await sendTemplate(log, account);
        if (
          resp &&
          resp.data &&
          resp.data.messages &&
          resp.data.messages[0] &&
          resp.data.messages[0].id
        ) {
          await broadcastLogRepository.update(
            {
              meta_msg_id: dataGet(resp, "messages.0.id"),
              delivery_time: Date.now(),
              delivery_status: SENT,
            },
            {
              id: log.id,
            }
          );

          successCount++;
        } else {
          throw new Error(
            "Invalid response from Meta API - no message ID received"
          );
        }
      } catch (err) {
        await broadcastLogRepository.update(
          {
            delivery_time: Date.now(),
            delivery_status: FAILED,
            err: err.message,
          },
          {
            id: log.id,
          }
        );
        failureCount++;
      }
    }

    // Only mark as FINISHED if ALL messages were sent successfully
    if (successCount === logs.length && failureCount === 0) {
      await broadcastRepository.updateStatus(
        campaign.broadcast_id,
        FINISHED,
        account.uid
      );
    }
  } catch (err) {}
}

async function processBroadcasts() {
  const broadcasts = await broadcastRepository.findByStatus(QUEUE);
  for (const campaign of broadcasts) {
    if (
      campaign.schedule &&
      hasDatePassedInTimezone(campaign.timezone, campaign.schedule)
    ) {
      await processBroadcast(campaign);
    }
  }
}

async function runBroadcastJob() {
  setInterval(async () => {
    try {
      await processBroadcasts();
      await delayRandom(3, 5);
    } catch (error) {
      // Error handling
    }
  }, 5000);
}

async function sendTemplate(message, account) {
  const template = message.broadcast.templet;
  const messagePayload = await templetService.prepareTemplate(
    template,
    message.example,
    message.dynamic_media
  );
  await whatsappTemplateApi.initMeta();
  const finalPayload = {
    messaging_product: "whatsapp",
    to: message?.send_to?.replace("+", ""),
    type: "template",
    template: messagePayload,
  };
  const response = await whatsappTemplateApi
    .setToken(account.token)
    .setWabaId(account.social_user_id)
    .sendTemplate(message?.send_to?.replace("+", ""), messagePayload);
  return response;
}

module.exports = { runBroadcastJob };
