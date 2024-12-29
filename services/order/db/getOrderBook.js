import { redisClient } from './redis.js';
async function getTopBuyOrders(pair) {
  const script = `
  local result = {}
  local result_count = 0
  local orders = redis.call('ZREVRANGEBYSCORE', KEYS[1], '+inf', '-inf')
  for _, order in ipairs(orders) do
      local parsed_order = cjson.decode(order)
      local price = parsed_order.price
      
      if result[price] == nil then
          result[price] = parsed_order
          result_count = result_count + 1
      else
          result[price].quantity = result[price].quantity + parsed_order.quantity
      end
  
      if result_count == 10 then
          break
      end
  end
  
  local top_orders = {}
  for price, data in pairs(result) do
      table.insert(top_orders, {price = price, quantity = data.quantity})
  end
  
  table.sort(top_orders, function(a, b) return tonumber(a.price) > tonumber(b.price) end)
  
  return cjson.encode(top_orders)
    `;

  try {
    return  redisClient.eval(script, 1, `${pair}:buy`);
  } catch (error) {
    console.error('Failed to get top orders:', error);
  }
}

async function getTopSellOrders(pair) {
  const script = `
    local result = {}
    local result_count = 0
    local orders = redis.call('ZRANGEBYSCORE', KEYS[1], '-inf', '+inf')
    for _, order in ipairs(orders) do
        local parsed_order = cjson.decode(order)
        local price = parsed_order.price
        
        if result[price] == nil then
            result[price] = parsed_order
            result_count = result_count + 1
        else
            result[price].quantity = result[price].quantity + parsed_order.quantity
        end
    
        if result_count == 10 then
            break
        end
    end
    
    local top_orders = {}
    for price, data in pairs(result) do
        table.insert(top_orders, {price = price, quantity = data.quantity})
    end
    
    table.sort(top_orders, function(a, b) return tonumber(a.price) > tonumber(b.price) end)
    
    return cjson.encode(top_orders)
      `;

  try {
    return  redisClient.eval(script, 1, `${pair}:sell`);
  } catch (error) {
    console.error('Failed to get top orders:', error);
  }
}

export { getTopBuyOrders, getTopSellOrders };
