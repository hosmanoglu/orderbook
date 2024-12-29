import { transactions, pairClients } from './cache.js';
import { ReceiveMessageQueue } from '../common/rabbitmq/receiveMessage.js';

const MAX_TRANSACTIONS_SIZE = 50;
const BUFFER_TIME = 500;
const TRANSACTIONS_QUEUE = process.env.TRANSACTIONS_QUEUE;
const buffer = {};
const bufferTimers = {};

function handleExecutedOrder(order) {
  return new Promise((resolve, reject) => {
    transactions[order.pair].push(order);
    if (transactions[order.pair].length > MAX_TRANSACTIONS_SIZE) {
      transactions[order.pair].shift();
    }
    if (!buffer[order.pair]) {
      buffer[order.pair] = [order];
    } else {
      buffer[order.pair].push(order);
    }
    if (!bufferTimers[order.pair]) {
      bufferTimers[order.pair] = setTimeout(() => {
        bufferHandler(order.pair);
      }, BUFFER_TIME);
    }

    resolve();
  });
}
function bufferHandler(pair) {
  const payload = buffer[pair].splice(0, MAX_TRANSACTIONS_SIZE);
  broadcastOrder(payload, pair);
  if (buffer[pair].length > 0) {
    bufferTimers[pair] = setTimeout(() => {
      bufferHandler(pair);
    }, BUFFER_TIME);
  }else{
    bufferTimers[pair] = undefined
  }
}

function broadcastOrder(orders, pair) {
  pairClients[pair].forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type: 'transactions', pair, data: orders }));
    }
  });
}

new ReceiveMessageQueue(TRANSACTIONS_QUEUE, handleExecutedOrder);
