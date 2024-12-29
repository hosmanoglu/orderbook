import { sendMessageQueue } from './rabitmq/orderBookChanges.js';
import { getTopBuyOrders, getTopSellOrders } from './db/getOrderBook.js';

import { pairs } from '../common/config/pairs.js';
const orderBook = pairs.reduce((acc, pair) => {
  acc[pair] = { buy: '', sell: '' };
  return acc;
}, {});

async function interval() {
  for (const pair of pairs) {
    getTopBuyOrders(pair).then((newTopBuys) => {
      if (newTopBuys !== orderBook[pair].buy) {
        sendMessageQueue.send(JSON.stringify({ type: 'orderBook', pair, type: 'buy', data: newTopBuys }));
        orderBook[pair].buy = newTopBuys;
      }
    });
    getTopSellOrders(pair).then((newTopSell) => {
      if (newTopSell !== orderBook[pair].sell) {
        sendMessageQueue.send(JSON.stringify({ type: 'orderBook', pair, type: 'sell', data: newTopSell }));
        orderBook[pair].sell = newTopSell;
      }
    });
  }
}

setInterval(interval, 500);
