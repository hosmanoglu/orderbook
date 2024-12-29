import Redis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL;
const redisClient = new Redis(REDIS_URL);

redisClient.on('connect', () => {
  console.log('Redis client connected');
});

redisClient.on('error', (err) => {
  console.error('Redis client error:', err);
});

export  { redisClient };
