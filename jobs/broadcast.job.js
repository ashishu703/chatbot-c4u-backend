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
      console.log("❌ [BROADCAST JOB] User plan expired:", {
        uid: campaign.uid,
        plan_expiration: user.plan_expiration,
        planDays
      });
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
          delivery_status: [PENDING, FAILED],
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
          resp.messages &&
          resp.messages[0] &&
          resp.messages[0].id
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

          console.log("✅ [BROADCAST JOB] Message sent successfully:", {
            log_id: log.id,
            send_to: log.send_to,
            meta_msg_id: dataGet(resp, "messages.0.id")
          });

          successCount++;
        } else {
          throw new Error(
            "Invalid response from Meta API - no message ID received"
          );
        }
      } catch (err) {
        console.log("❌ [BROADCAST JOB] Failed to send message:", {
          log_id: log.id,
          send_to: log.send_to,
          error: err.message,
          fullError: err
        });

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
      console.log("✅ [BROADCAST JOB] All messages sent successfully, marking as FINISHED:", campaign.broadcast_id);
      await broadcastRepository.updateStatus(
        campaign.broadcast_id,
        FINISHED,
        account.uid
      );
    } else {
      console.log("⚠️ [BROADCAST JOB] Some messages failed, keeping as QUEUE for retry:", campaign.broadcast_id);
    }
  } catch (err) {
    console.log("💥 [BROADCAST JOB] Critical error in processBroadcast:", {
      broadcast_id: campaign.broadcast_id,
      error: err.message,
      fullError: err
    });
  }
}

async function processBroadcasts() {

  const broadcasts = await broadcastRepository.findByStatus(QUEUE);  
  if (broadcasts.length > 0) {
    console.log("📊 [BROADCAST JOB] Found broadcasts in QUEUE:", {
      totalBroadcasts: broadcasts.length,
      broadcastIds: broadcasts.map(b => b.broadcast_id)
    });
  }

  for (const campaign of broadcasts) {
    console.log("🔍 [BROADCAST JOB] Checking campaign schedule:", {
      broadcast_id: campaign.broadcast_id,
      schedule: campaign.schedule,
      timezone: campaign.timezone,
      currentTime: new Date().toISOString()
    });

    if (
      campaign.schedule &&
      hasDatePassedInTimezone(campaign.timezone, campaign.schedule)
    ) {
      console.log("⏰ [BROADCAST JOB] Schedule time has passed, processing campaign:", campaign.broadcast_id);
      await processBroadcast(campaign);
    } else {
      console.log("⏳ [BROADCAST JOB] Campaign not ready yet:", {
        broadcast_id: campaign.broadcast_id,
        schedule: campaign.schedule,
        timezone: campaign.timezone
      });
    }
  }
}

async function runBroadcastJob() {
  console.log("🚀 [BROADCAST JOB] Starting broadcast job service...");
  console.log("⏱️ [BROADCAST JOB] Job will run every 5 seconds with 3-5 second random delays");
  
  setInterval(async () => {
    try {
      await processBroadcasts();
      await delayRandom(3, 5);
    } catch (error) {
      console.log("💥 [BROADCAST JOB] Error in main job loop:", {
        error: error.message,
        fullError: error
      });
    }
  }, 5000);
}

async function sendTemplate(message, account) {
  console.log("🔧 [SEND TEMPLATE] Starting template preparation:", {
    log_id: message.id,
    send_to: message.send_to,
    templet_name: message.templet_name,
    sender_id: message.sender_id
  });

  const template = message.broadcast.templet;
  console.log("📝 [SEND TEMPLATE] Raw template data:", {
    template: typeof template === 'string' ? JSON.parse(template) : template
  });

  console.log("📋 [SEND TEMPLATE] Message example data:", {
    example: message.example
  });

  const messagePayload = await templetService.prepareTemplate(
    template,
    message.example,
    message.dynamic_media
  );
  
  console.log("✅ [SEND TEMPLATE] Prepared message payload for Meta API:", {
    messagePayload: JSON.stringify(messagePayload, null, 2)
  });

  await whatsappTemplateApi.initMeta();
  
  console.log("🔑 [SEND TEMPLATE] Setting up WhatsApp API with credentials:", {
    token: account.token ? "***TOKEN_PRESENT***" : "NO_TOKEN",
    wabaId: account.social_user_id,
    phoneNumber: message?.send_to?.replace("+", "")
  });

  const finalPayload = {
    messaging_product: "whatsapp",
    to: message?.send_to?.replace("+", ""),
    type: "template",
    template: messagePayload
  };

  console.log("🚀 [SEND TEMPLATE] Final payload being sent to Meta API:", {
    finalPayload: JSON.stringify(finalPayload, null, 2)
  });

  const response = await whatsappTemplateApi
    .setToken(account.token)
    .setWabaId(account.social_user_id)
    .sendTemplate(message?.send_to?.replace("+", ""), messagePayload);

  console.log("📨 [SEND TEMPLATE] Meta API response:", {
    response: JSON.stringify(response, null, 2)
  });

  return response;
}

module.exports = { runBroadcastJob };
