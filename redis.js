const redis = require('redis');

const redisClient = redis.createClient({
    socket: {
        host: process.env.RedisHost,
        port: process.env.RedisPort
    }
});

redisClient.connect();
redisClient.on('error', err => console.log('Redis error: ', err.message));
redisClient.on('connect', () => console.log('Connected to redis server'));
module.exports = redisClient;