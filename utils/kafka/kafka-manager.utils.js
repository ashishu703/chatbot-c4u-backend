const { kafka, producer, createTopics, generateConsumerConfigs } = require("../../config/kafka.config");
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
      await producer.connect();
      await createTopics();
      this.isConnected = true;
    } catch (error) {
      console.error("❌ [KAFKA MANAGER] Connection failed:", error);
      throw error;
    }
  }

  loadConsumersFromConfig() {
    try {
      const configPath = path.join(__dirname, "../../config/kafka-consumers.json");
      if (fs.existsSync(configPath)) {
        const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
        this.consumersConfig = config.consumers || [];
      }
    } catch (error) {
    }
  }

  async autoRegisterConsumers() {
    const consumerConfigs = generateConsumerConfigs();
    for (const consumerConfig of consumerConfigs) {
      try {
        const handlerPath = path.join(
          __dirname,
          "../..",
          consumerConfig.handlerPath
        );
        const handlerModule = require(handlerPath);
        const handler = handlerModule[consumerConfig.handlerFunction];
        this.registerConsumer(
          consumerConfig.name,
          consumerConfig.topic,
          consumerConfig.consumerGroup,
          consumerConfig.partitions,
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

  registerConsumer(consumerName, topicName, consumerGroup, partitionCount, handler) {
    const consumers = [];
    for (let i = 0; i < partitionCount; i++) {
      const consumerInstance = kafka.consumer({
        groupId: consumerGroup,
      });
      
      consumers.push({
        name: `${consumerName}-${i}`,
        topic: topicName,
        consumer: consumerInstance,
        handler: handler,
      });
    }

    this.consumers.set(consumerName, consumers);
  }

  async startAllConsumers() {
    try {
      const startPromises = [];
      
      for (const [consumerName, consumers] of this.consumers) {
        for (const consumerData of consumers) {
          startPromises.push(this.startConsumer(consumerName, consumerData));
        }
      }

      await Promise.all(startPromises);
      console.log("✅ [KAFKA] Started successfully");
    } catch (error) {
      console.error("❌ [KAFKA MANAGER] Failed to start consumers:", error);
      throw error;
    }
  }

  async startConsumer(consumerName, consumerData) {
    try {
      if (!consumerData) {
        throw new Error(`Consumer ${consumerName} not found`);
      }

      await consumerData.consumer.connect();
      await consumerData.consumer.subscribe({
        topic: consumerData.topic,
        fromBeginning: false,
      });

      await consumerData.consumer.run({
        eachBatch: async ({ batch, resolveOffset, heartbeat, isRunning, isStale }) => {
          for (const message of batch.messages) {
            if (!isRunning() || isStale()) break;
            
            try {
              const data = JSON.parse(message.value.toString());
              const result = await consumerData.handler(data, batch.topic, batch.partition, message);
              
              if (result && result.success) {
                resolveOffset(message.offset);
              }
            } catch (error) {
              console.error(
                `❌ [${consumerData.name}] Error processing message:`,
                error
              );
            }
            
            await heartbeat();
          }
        },
      });
    } catch (error) {
      console.error(
        `❌ [KAFKA MANAGER] Failed to start consumer ${consumerData.name}:`,
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
      for (const [, consumerData] of this.consumers) {
        await consumerData.consumer.disconnect();
      }

      await producer.disconnect();
      this.isConnected = false;
    } catch (error) {
      console.error("❌ [KAFKA MANAGER] Error stopping consumers:", error);
    }
  }
}

const kafkaManager = new KafkaManager();

module.exports = kafkaManager;
