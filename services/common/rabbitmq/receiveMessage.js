import { mq } from './config.js';

class ReceiveMessageQueue {
  constructor(queueName, handler) {
    this.queueName = queueName;
    this.handler = handler;
    this.channel = null;
    this.initialize();
  }

  async initialize() {
    try {
      const connection = await mq;
      if (!connection) {
        throw new Error('Not connected to MQ Server');
      }
      this.channel = await connection.createChannel();
      await this.channel.assertQueue(this.queueName, { durable: true });
      console.log(this.queueName, "connected");

      this.consume();
    } catch (error) {
      console.error('Failed to initialize:', error);
    }
  }

  async consume() {
    try {
      if (!this.channel) {
        await this.initialize();
      }

      this.channel.consume(this.queueName, async (msg) => {
        try {
          if (msg !== null) {
            await this.handler(JSON.parse(msg.content.toString()));
            this.channel.ack(msg);
          }
        } catch (error) {
          console.error('Wrong Message:', error);
        }
      }, { noAck: false }); // Otomatik onaylama kapalı, manuel onaylama yapılacak
    } catch (error) {
      console.error('Failed to consume message:', error);
    }
  }
}

export { ReceiveMessageQueue };
