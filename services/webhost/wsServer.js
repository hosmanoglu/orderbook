import { WebSocketServer } from 'ws';
import { validateOrder } from './validation/order.js';
import { validateSubscribe } from './validation/subscribe.js';
import { generateUniqueId } from '../common/utils/idGenerator.js';
import { orderBook, transactions ,pairClients} from './cache.js';
import { SendMessageQueue } from '../common/rabbitmq/sendMessage.js';

const ORDER_QUEUE = process.env.ORDER_QUEUE;

const sendMessageQueue = new SendMessageQueue(ORDER_QUEUE);


const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', function connection(ws) {
  ws.id = generateUniqueId();

  ws.on('message', async function incoming(message) {
    try {
      const { type, data } = JSON.parse(message);
      if (type === 'order') {
        const validOrder = await validateOrder(data);
        sendMessageQueue.send(JSON.stringify(validOrder));
      } else if (type === 'subscribe') {
        const validSub = await validateSubscribe(data);
        for (const pair of validSub.pairs) {
          if (pairClients[pair].findIndex((x) => x.id === ws.id) === -1) {
            pairClients[pair].push(ws);
          }

          ws.send(JSON.stringify({ type: 'transactions', pair, data: transactions[pair] }));
          ws.send(JSON.stringify({ type: 'orderBook', pair, data: orderBook[pair] }));
        }
      } else if (type === 'unsubscribe') {
        const validSub = await validateSubscribe(data);
        for (const pair of validSub.pairs) {
          let index = pairClients[pair].findIndex((x) => x.id === ws.id);
          if (index !== -1) {
            pairClients[pair].splice(index, 1);
          }
        }
      }
    } catch (error) {
      ws.send(JSON.stringify({ type: 'error', data: JSON.stringify(error) }));
    }
  });

  ws.on('close', function () {
    for (const pair in pairClients) {
      let index = pairClients[pair].findIndex((x) => x.id === ws.id);
      if (index !== -1) {
        pairClients[pair].splice(index, 1);
      }
    }
  });
});
