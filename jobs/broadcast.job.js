const moment = require("moment-timezone");
const BroadcastRepository = require("../repositories/broadcastRepository");
const { QUEUE, ACTIVE_PLAN_NOT_FOUND, FINISHED } = require("../types/broadcast-execution-status.types");
const { getNumberOfDaysFromTimestamp } = require("../utils/date.utils");
const SocialAccountRepository = require("../repositories/SocialAccountRepository");
const BroadcastLogRepository = require("../repositories/broadcastLogRepository");
const { PENDING, SENT, FAILED } = require("../types/broadcast-delivery-status.types");
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

    const account = await socialAccountRepository.getWhatsappAccount(campaign.uid, ["user"]);

    if (!account) {
      return broadcastRepository.updateStatus(
        campaign.broadcast_id,
        META_API_NOT_FOUND,
        account.uid
      );

    }

    const user = account.user;

    const planDays = getNumberOfDaysFromTimestamp(user.plan_expire);
    if (planDays < 1) {
      return broadcastRepository.updateStatus(
        campaign.broadcast_id,
        ACTIVE_PLAN_NOT_FOUND,
        account.uid
      );
    }


    const log = await broadcastLogRepository.findFirst(
      {
        where: {
          broadcast_id: campaign.id,
          delivery_status: PENDING
        }
      },
      ["broadcast"]
    );

    if (!log) {
      return broadcastRepository.updateStatus(
        campaign.broadcast_id,
        FINISHED,
        account.uid
      );
    }

    const resp = await sendTemplate(log, account);

    await broadcastLogRepository.update(
      {
        meta_msg_id: dataGet(resp, "messages.0.id"),
        delivery_time: Date.now(),
        delivery_status: SENT
      }
    );

  } catch (err) {
    console.log({
      err
    })
    await broadcastLogRepository.update(
      {
        delivery_time: Date.now(),
        delivery_status: FAILED,
        err
      }
    );
  }
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
  console.log("Campaign started");
  setInterval(async () => {
    await processBroadcasts();
    await delayRandom(3, 5);
  }, 5000);
}




async function sendTemplate(message, account) {
  const template = JSON.parse(message.broadcast.templet);

  const messagePayload = await templetService.prepareTemplate(
    template,
    message.example,
    message.dynamic_media
  );

  await whatsappTemplateApi.initMeta();
  return whatsappTemplateApi
    .setToken(account.token)
    .setWabaId(account.social_user_id)
    .sendTemplate(
      message?.send_to?.replace("+", ""),
      messagePayload
    );

}








module.exports = { runBroadcastJob };
