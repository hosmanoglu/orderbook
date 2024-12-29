import { orderBook, pairClients } from './cache.js';
import { ReceiveMessageQueue } from '../common/rabbitmq/receiveMessage.js';

const ORDER_BOOK_CHANGES_QUEUE = process.env.ORDER_BOOK_CHANGES_QUEUE;

function handleOrderBookChanges(message) {
  return new Promise((resolve, reject) => {
    const { pair, data, type } = message;
    orderBook[pair][type] = data;
    resolve();
    broadcastOrder(message);
  });
}
function broadcastOrder(message) {
  const { pair, data, type } = message;
  pairClients[pair].forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type: 'orderBook', pair, type, data }));
    }
  });
}

new ReceiveMessageQueue(ORDER_BOOK_CHANGES_QUEUE, handleOrderBookChanges);
