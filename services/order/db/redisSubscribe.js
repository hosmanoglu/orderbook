import Redis from 'ioredis';
import { SendMessageQueue } from '../../common/rabbitmq/sendMessage.js';

const ORDER_EXECUTED_QUEUE = process.env.ORDER_EXECUTED_QUEUE;
const TRANSACTIONS_QUEUE = process.env.TRANSACTIONS_QUEUE;

const sendMessageQueue = new  SendMessageQueue(TRANSACTIONS_QUEUE);

const REDIS_URL = process.env.REDIS_URL;
const redisSubscribeClient = new Redis(REDIS_URL);

redisSubscribeClient.on('connect', () => {
  console.log('redisSubscribeClient connected');
});

redisSubscribeClient.on('error', (err) => {
  console.error('redisSubscribeClient error:', err);
});

redisSubscribeClient.subscribe(ORDER_EXECUTED_QUEUE, (err, count) => {
  if (err) {
    console.error('Failed to subscribe:', err);
  } else {
    console.log(`Subscribed to ${ORDER_EXECUTED_QUEUE} channel(s).`);
  }
});

redisSubscribeClient.on('message', (channel, message) => {
  //console.log(`Received message from ${channel}: ${message}`);
  sendMessageQueue.send( message);
});
