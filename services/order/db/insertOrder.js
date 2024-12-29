import { redisClient } from './redis.js';
import { ReceiveMessageQueue } from '../../common/rabbitmq/receiveMessage.js';

const ORDER_QUEUE = process.env.ORDER_QUEUE;
const ORDER_EXECUTED_QUEUE = process.env.ORDER_EXECUTED_QUEUE;

async function insertNewOrder(message) {
  const { pair, type, price, quantity } = message;
  const luaScript = `
      local pair = KEYS[1]
      local type = ARGV[1]
      local price = tonumber(ARGV[2])
      local quantity = tonumber(ARGV[3])
  
      local key = pair .. ':' .. type
  
      local function execute_and_publish(key, order)
        redis.call('ZREM', key, order)
        local parsed_order = cjson.decode(order) 
        parsed_order.pair = pair
        redis.call('PUBLISH', '${ORDER_EXECUTED_QUEUE}', cjson.encode(parsed_order))
      end
  
      if type == 'sell' then
        local buy_key = pair .. ':buy'
        local buy_orders = redis.call('ZRANGEBYSCORE', buy_key, price, '+inf')
        for _, order in ipairs(buy_orders) do
          local parsed_order = cjson.decode(order)
          if parsed_order.quantity == quantity then
            execute_and_publish(buy_key, order)
            quantity = 0
            break
          elseif parsed_order.quantity < quantity then
            execute_and_publish(buy_key, order)
            quantity = quantity - parsed_order.quantity
          else
            redis.call('ZREM', buy_key, order)
            parsed_order.quantity = parsed_order.quantity - quantity
            redis.call('ZADD', buy_key, parsed_order.price, cjson.encode(parsed_order))
            parsed_order.pair = pair
            redis.call('PUBLISH','${ORDER_EXECUTED_QUEUE}', cjson.encode(parsed_order))
            quantity = 0
            break
          end
        end
      else
        local sell_key = pair .. ':sell'
        local sell_orders = redis.call('ZRANGEBYSCORE', sell_key, '-inf', price)
        for _, order in ipairs(sell_orders) do
          local parsed_order = cjson.decode(order)
          if parsed_order.quantity == quantity then
            execute_and_publish(sell_key, order)
            quantity = 0
            break
          elseif parsed_order.quantity < quantity then
            execute_and_publish(sell_key, order)
            quantity = quantity - parsed_order.quantity
          else
            redis.call('ZREM', sell_key, order)
            parsed_order.quantity = parsed_order.quantity - quantity
            redis.call('ZADD', sell_key, parsed_order.price, cjson.encode(parsed_order))
            parsed_order.pair = pair
            redis.call('PUBLISH','${ORDER_EXECUTED_QUEUE}', cjson.encode(parsed_order))
            quantity = 0
            break
          end
        end
      end
  
      if quantity > 0 then
        local new_order = cjson.encode({ type = type, price = price, quantity = quantity })
        redis.call('ZADD', key, price, new_order)
      end
  
      return quantity
    `;

  await redisClient.eval(luaScript, 1, pair, type, price.toString(), quantity.toString());
}

redisClient.on('connect', async () => {
  new ReceiveMessageQueue(ORDER_QUEUE, insertNewOrder);
});
