const { Worker } = require('bullmq');
const { handleTicksCheck } = require('../services/market.service');

const redisConfiguration = {
    connection: {
        host: process.env.RedisHost,
        port: process.env.RedisPort
    }
}

const handleSpotPrice = async (job) => {

    await handleTicksCheck(job.data)    
    return { success: true };
}

const startSpotConsumerService = () => {

    const worker = new Worker('spotPriceQueue', handleSpotPrice, redisConfiguration);

    worker.on('completed', async (job) => {

        await job.remove();

    });

    worker.on('failed', async (job, err) => {

        console.error(`${job.id} has failed with ${err.message}`);

    });
}

module.exports = {
    startSpotConsumerService
}