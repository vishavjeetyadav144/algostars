const { Worker } = require('bullmq');
const { Candle } = require('../models');
const redisClient = require('../redis');

const redisConfiguration = {
    connection: {
        host: process.env.RedisHost,
        port: process.env.RedisPort
    }
}

const candlestick_15m = async (job) => {

    let data = job.data
    let last_candle = await redisClient.get(`last_candle:${data.symbol}`);
    last_candle = last_candle ? JSON.parse(last_candle): null;
    avg_gain = last_candle ? (data.close - last_candle.close) >= 0 ?  ((data.close - last_candle.close) + last_candle.avg_gain * 13) / 14 : last_candle.avg_gain * 13 / 14 : 1
    avg_loss = last_candle ? (data.close - last_candle.close) < 0 ? ((last_candle.close - data.close) + last_candle.avg_loss * 13) / 14 : last_candle.avg_loss * 13 / 14: 1
    let candle = { 
        symbol:data.symbol, 
        timestamp: data.candle_start_time, 
        open: data.open, close:data.close, low:data.low, high: data.high,
        avg_gain: avg_gain,
        avg_loss: avg_loss,
        rsi: 100 - 100 / (1 + (avg_gain / avg_loss))
    }

    await Candle.findOneAndUpdate({timestamp: data.candle_start_time, symbol: data.symbol }, candle , { upsert:true, new:true});
    await redisClient.set(`last_candle:${data.symbol}`, JSON.stringify(candle))

    if(last_candle + 900000000 == candle.timestamp ){

        if (candle.rsi >= 56) {
            let candleCheck = await redisClient.get(`alertCandle:${candle.symbol}`);
            if (!candleCheck && last_candle.rsi < 56) {
                redisClient.set(`alertCandle:${candle.symbol}`, JSON.stringify(candle));
            }
        }
        else if (candle.rsi <= 40 ) {
            let candleCheck = await redisClient.get(`alertCandle:${candle.symbol}`);
            if (!candleCheck && last_candle.rsi > 40) {
                redisClient.set(`alertCandle:${candle.symbol}`, JSON.stringify(candle));
            }
        }
    }
    

    return;
}

const startCandleConsumerService = () => {

    const worker = new Worker('candlestick_15m', candlestick_15m, redisConfiguration);

    worker.on('completed', async (job) => {
        await job.remove();
    });

    worker.on('failed', async (job, err) => {
        console.error(`${job.id} has failed with ${err.message}`);
    });
}

module.exports = {
    startCandleConsumerService
}