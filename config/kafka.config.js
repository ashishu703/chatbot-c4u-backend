const { Kafka, Partitioners } = require("kafkajs");

const kafkaConfig = {
  brokers: process.env.KAFKA_BROKERS
    ? process.env.KAFKA_BROKERS.split(",")
    : ["localhost:9092"],
  clientId: "chatbot-mbg",
};

// Topic configurations with partition count
const topicConfigs = {
  "instagram-comments": {
    partitions: 10,
    consumerGroup: "instagram-comment-processors",
    handlerPath: "services/InstagramCommentAutomationService.js",
    handlerFunction: "processComment",
  },
  "facebook-comments": {
    partitions: 10,
    consumerGroup: "facebook-comment-processors",
    handlerPath: "services/FacebookCommentAutomationService.js",
    handlerFunction: "processComment",
  },
  "contacts": {
    partitions: 3,
    consumerGroup: "contact-event-processors",
    handlerPath: "services/ContactEventService.js",
    handlerFunction: "processContactEvent",
  },
  "contact-leads": {
    partitions: 3,
    consumerGroup: "contact-lead-processors",
    handlerPath: "services/ContactLeadEventService.js",
    handlerFunction: "processLeadEvent",
  },
};

const kafka = new Kafka(kafkaConfig);
const producer = kafka.producer({
  createPartitioner: Partitioners.LegacyPartitioner
});
const admin = kafka.admin();

// Auto-create topics based on configuration
async function createTopics() {
  try {
    const existingTopics = await admin.listTopics();
    
    for (const [topicName, config] of Object.entries(topicConfigs)) {
      if (!existingTopics.includes(topicName)) {
        await admin.createTopics({
          topics: [{
            topic: topicName,
            numPartitions: config.partitions,
            replicationFactor: 1,
          }],
        });
      }
    }
  } catch (error) {
    console.error("❌ [KAFKA] Failed to create topics:", error);
  }
}

// Generate consumer configurations from topic configs
function generateConsumerConfigs() {
  const consumers = [];
  
  for (const [topicName, config] of Object.entries(topicConfigs)) {
    consumers.push({
      name: `${topicName}-processor`,
      topic: topicName,
      consumerGroup: config.consumerGroup,
      partitions: config.partitions,
      handlerPath: config.handlerPath,
      handlerFunction: config.handlerFunction
    });
  }
  
  return consumers;
}

module.exports = {
  kafka,
  producer,
  admin,
  topicConfigs,
  createTopics,
  generateConsumerConfigs,
};
