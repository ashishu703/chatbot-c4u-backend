const { kafka, producer, consumer, topics, createTopics } = require("../config/kafka.config");
const fs = require("fs");
const path = require("path");

class KafkaManager {
  constructor() {
    this.isConnected = false;
    this.consumers = new Map();
    this.consumersConfig = [];
  }

  async initialize() {
    try {
      console.log("🔌 [KAFKA MANAGER] Initializing...");
      await producer.connect();
      await createTopics();
      this.isConnected = true;
      console.log("✅ [KAFKA MANAGER] Connected successfully");
    } catch (error) {
      console.error("❌ [KAFKA MANAGER] Connection failed:", error);
      throw error;
    }
  }

  loadConsumersFromConfig() {
    try {
      const configPath = path.join(__dirname, "../config/kafka-consumers.json");
      if (fs.existsSync(configPath)) {
        const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
        this.consumersConfig = config.consumers || [];
        console.log(
          `📝 [KAFKA MANAGER] Loaded ${this.consumersConfig.length} consumers from config`
        );
      }
    } catch (error) {
      console.log(
        "ℹ️ [KAFKA MANAGER] No consumer config found, using manual registration"
      );
    }
  }

  async autoRegisterConsumers() {
    this.loadConsumersFromConfig();

    for (const consumerConfig of this.consumersConfig) {
      try {
        const handlerPath = path.join(
          __dirname,
          "..",
          consumerConfig.handlerPath
        );
        const handlerModule = require(handlerPath);
        const handler = handlerModule[consumerConfig.handlerFunction];

        this.registerConsumer(
          consumerConfig.name,
          consumerConfig.topic,
          handler
        );
      } catch (error) {
        console.error(
          `❌ [KAFKA MANAGER] Failed to register consumer ${consumerConfig.name}:`,
          error
        );
      }
    }
  }

  registerConsumer(consumerName, topicName, handler) {
    const consumerInstance = kafka.consumer({
      groupId: `${consumerName}-group`,
    });

    this.consumers.set(consumerName, {
      name: consumerName,
      topic: topicName,
      consumer: consumerInstance,
      handler: handler,
    });

    console.log(
      `📥 [KAFKA MANAGER] Consumer registered: ${consumerName} for topic: ${topicName}`
    );
  }

  async startAllConsumers() {
    try {
      console.log("🚀 [KAFKA MANAGER] Starting all consumers...");

      const startPromises = Array.from(this.consumers.keys()).map(
        (consumerName) => this.startConsumer(consumerName)
      );

      await Promise.all(startPromises);
      console.log("✅ [KAFKA MANAGER] All consumers started");
    } catch (error) {
      console.error("❌ [KAFKA MANAGER] Failed to start consumers:", error);
      throw error;
    }
  }

  async startConsumer(consumerName) {
    try {
      const consumerData = this.consumers.get(consumerName);
      if (!consumerData) {
        throw new Error(`Consumer ${consumerName} not found`);
      }

      await consumerData.consumer.connect();
      await consumerData.consumer.subscribe({
        topic: consumerData.topic,
        fromBeginning: false,
      });

      await consumerData.consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          try {
            const data = JSON.parse(message.value.toString());
            await consumerData.handler(data, topic, partition, message);
          } catch (error) {
            console.error(
              `❌ [${consumerName}] Error processing message:`,
              error
            );
          }
        },
      });

      console.log(`✅ [KAFKA MANAGER] Consumer started: ${consumerName}`);
    } catch (error) {
      console.error(
        `❌ [KAFKA MANAGER] Failed to start consumer ${consumerName}:`,
        error
      );
      throw error;
    }
  }

  async sendMessage(topicName, message, key = null) {
    try {
      if (!this.isConnected) {
        throw new Error("Kafka not connected");
      }

      await producer.send({
        topic: topicName,
        messages: [
          {
            key: key || Date.now().toString(),
            value: JSON.stringify(message),
          },
        ],
      });

      console.log(`📤 [KAFKA MANAGER] Message sent to ${topicName}`);
      return true;
    } catch (error) {
      console.error(
        `❌ [KAFKA MANAGER] Failed to send message to ${topicName}:`,
        error
      );
      throw error;
    }
  }

  async stopAllConsumers() {
    try {
      console.log("🛑 [KAFKA MANAGER] Stopping all consumers...");

      for (const [consumerName, consumerData] of this.consumers) {
        await consumerData.consumer.disconnect();
      }

      await producer.disconnect();
      this.isConnected = false;
      console.log("✅ [KAFKA MANAGER] All consumers stopped");
    } catch (error) {
      console.error("❌ [KAFKA MANAGER] Error stopping consumers:", error);
    }
  }
}

const kafkaManager = new KafkaManager();

module.exports = kafkaManager;
