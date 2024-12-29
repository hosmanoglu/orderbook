import { mq } from "./config.js";

class SendMessageQueue {
  constructor(queueName) {
    this.queueName = queueName;
    this.channel = null;
    this.initialize();
  }

  async initialize() {
    const connection = await mq;
    if (!connection) {
      throw new Error("Not connected to MQ Server");
    }
    this.channel = await connection.createChannel();
    await this.channel.assertQueue(this.queueName, { durable: true });
    console.log(this.queueName, "connected");
  }

  async send(message) {
    try {
      if (!this.channel) {
        await this.initialize();
      }

      this.channel.sendToQueue(this.queueName, Buffer.from(message), {
        persistent: true,
      });
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  }
}

export { SendMessageQueue };
