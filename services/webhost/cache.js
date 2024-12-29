import _ from 'lodash';
import { pairs } from '../common/config/pairs.js';

const orderBook = pairs.reduce((acc, pair) => {
  acc[pair] = { buy: '', sell: '' };
  return acc;
}, {});

const transactions = pairs.reduce((acc, pair) => {
  acc[pair] = [];
  return acc;
}, {});

const pairClients = _.cloneDeep(transactions);

export { orderBook, transactions, pairClients };
