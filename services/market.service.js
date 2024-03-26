const { handleOrder, executeOrder } = require("./order.service");
const redisClient = require('../redis');

const index_map = {
    ".DEXBTUSDT" : "BTCUSDT",
    ".DEETHUSDT" : "ETHUSDT",
    ".DESOLUSDT" : "SOLUSDT",
    ".DEAVAXUSDT" : "AVAXUSDT",
    ".DEMATICUSDT" : "MATICUSDT",
    ".DEBCHUSDT" : "BCHUSDT",
    ".DEDOGEUSDT" : "DOGEUSDT",
    ".DELINKUSDT" : "LINKUSDT",
    ".DEDYDXUSDT" : "DYDXUSDT",
    ".DEDOTUSDT" : "DOTUSDT",
    ".DEADAUSDT" : "ADAUSDT",
    ".DEXRPUSDT" : "XRPUSDT",
    ".DEATOMUSDT" : "ATOMUSDT",
    ".DENEARUSDT" : "NEARUSDT",
    ".DEAAVEUSDT" : "AAVEUSDT",
    ".DETRXUSDT" : "TRXUSDT"
  }

const handleTicksCheck = async (data) => {

    let orderCheck = await redisClient.get(`order:${index_map[data.s]}`);
    if (orderCheck) {
        handleOrder(JSON.parse(orderCheck), data);
    }else {
        let candleCheck = await redisClient.get(`alertCandle:${index_map[data.s]}`);
        if (candleCheck) {
            candleCheck = JSON.parse(candleCheck);
            if ((data.p > candleCheck.high && candleCheck.rsi >= 56) || (data.p < candleCheck.low && candleCheck.rsi <= 40)) {
                executeOrder(candleCheck, candleCheck.rsi >= 56 ? 1 : 2);
            }
            else if (((data.p <= candleCheck.low) && candleCheck.rsi >= 56) || ((data.p >= candleCheck.high) && candleCheck.rsi <= 40)) {
                await redisClient.del(`alertCandle:${index_map[data.s]}`);
            }
        }
    }
}

module.exports = {
    handleTicksCheck
}