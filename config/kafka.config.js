const { Kafka } = require("kafkajs");

const kafkaConfig = {
  brokers: process.env.KAFKA_BROKERS
    ? process.env.KAFKA_BROKERS.split(",")
    : ["localhost:9092"],
  clientId: "chatbot-mbg",
};

const topics = {
  INSTAGRAM_COMMENTS: "instagram-comments",
};

const kafka = new Kafka(kafkaConfig);
const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: "instagram-comment-processors" });
const admin = kafka.admin();

// Auto-create topics
async function createTopics() {
  try {
    const topicList = Object.values(topics);
    const existingTopics = await admin.listTopics();

    const topicsToCreate = topicList.filter(
      (topic) => !existingTopics.includes(topic)
    );

    if (topicsToCreate.length > 0) {
      await admin.createTopics({
        topics: topicsToCreate.map((topic) => ({
          topic,
          numPartitions: 3,
          replicationFactor: 1,
        })),
      });
      console.log("✅ [KAFKA] Created topics:", topicsToCreate);
    }
  } catch (error) {
    console.error("❌ [KAFKA] Failed to create topics:", error);
  }
}

module.exports = {
  kafka,
  producer,
  consumer,
  admin,
  topics,
  createTopics,
};
