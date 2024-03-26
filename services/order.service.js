const { Order } = require("../models");
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

const handleOrder = async (orderDetails, data) => {

    if (orderDetails.type === 1) {
        handleBuyOrder(orderDetails, data);
    }
    else if (orderDetails.type === 2) {
        handleSellorder(orderDetails, data);
    }
}

const executeOrder = async (data, type) => {
    await redisClient.del(`alertCandle:${data.instrument_token}`);
    let multiplier = 1;
    let stoploss = type === 1 ? data.high - (data.high - data.low) : data.low + (data.high - data.low);

    let order = {
        symbol: data.symbol,
        type: type,
        boughtAt: type === 1 ? data.high : data.low,
        target: type === 1 ? data.high + multiplier * (data.high - data.low) : data.low - multiplier * (data.high - data.low),
        stoploss: stoploss,
        points: data.high - data.low,
        status: 1,
        multiplier: multiplier / 2,
        trailingCount: 1,
        trailingData: []
    }

    await Order.create(order)
    await redisClient.set(`order:${data.symbol}`, JSON.stringify(order));


}

const handleBuyOrder = async (orderDetails, data) => {

    if (data.p >= orderDetails.target) {
        //tradeService.exitTrade(orderDetails);
        await Order.updateOne({
            symbol: index_map[data.s],
            type: 1,
            status: 1
        }, {
            status: 2,
            soldAt: orderDetails.target
        });

        await redisClient.del(`order:${index_map[data.s]}`);

    }

    else if (tick.last_price <= orderDetails.stoploss) {

        //tradeService.exitTrade(orderDetails);

        await Order.updateOne({
            symbol: index_map[data.s],
            type: 1,
            status: 1
        }, {
            status: 2,
            soldAt: orderDetails.stoploss
        });

        await redisClient.del(`order:${index_map[data.s]}`);
    }
    // else {

    //     if (orderDetails.trailingCount === 1) {

    //         if (tick.last_price >= orderDetails.boughtAt + orderDetails.points * orderDetails.multiplier) {

    //             await Order.updateOne({
    //                 instrument_token: tick.instrument_token,
    //                 type: 1,
    //                 status: 1
    //             }, {
    //                 stoploss: orderDetails.boughtAt + orderDetails.points * orderDetails.multiplier * 0.25,
    //                 trailingCount: 2,
    //                 $push: {
    //                     trailingData: {
    //                         time: Date.now(),
    //                         lastStopLoss: orderDetails.stoploss,
    //                         lastTarget: orderDetails.target
    //                     }
    //                 }
    //             });

    //             let updatedOrder = JSON.parse(JSON.stringify(orderDetails));
    //             updatedOrder.stoploss = orderDetails.boughtAt + orderDetails.points * orderDetails.multiplier * 0.25;
    //             updatedOrder.trailingCount = 2;
    //             await redisClient.set(`order:${tick.instrument_token}`, JSON.stringify(updatedOrder));
    //         }

    //     } else {

    //         if (tick.last_price >= orderDetails.boughtAt + orderDetails.points * orderDetails.multiplier * (orderDetails.trailingCount / 2 + 0.5)) {

    //             // modify api //
    //             await Order.updateOne({
    //                 instrument_token: tick.instrument_token,
    //                 type: 1,
    //                 status: 1
    //             }, {
    //                 stoploss: orderDetails.boughtAt + orderDetails.points * orderDetails.multiplier * (orderDetails.trailingCount / 2),
    //                 target: orderDetails.target + orderDetails.points * orderDetails.multiplier * 0.5,
    //                 $inc: {
    //                     trailingCount: 1
    //                 },
    //                 $push: {
    //                     trailingData: {
    //                         time: Date.now(),
    //                         lastStopLoss: orderDetails.stoploss,
    //                         lastTarget: orderDetails.target
    //                     }
    //                 }
    //             });

    //             let updatedOrder = JSON.parse(JSON.stringify(orderDetails));
    //             updatedOrder.stoploss = orderDetails.boughtAt + orderDetails.points * orderDetails.multiplier * (orderDetails.trailingCount / 2);
    //             updatedOrder.target = orderDetails.target + orderDetails.points * orderDetails.multiplier * 0.5
    //             updatedOrder.trailingCount = orderDetails.trailingCount + 1;
    //             await redisClient.set(`order:${tick.instrument_token}`, JSON.stringify(updatedOrder));
    //         }
    //     }
    // }
}

const handleSellorder = async (orderDetails, data) => {

    if (data.p <= orderDetails.target) {
        //tradeService.exitTrade(orderDetails);
        await Order.updateOne({
            symbol: index_map[data.s],
            type: 2,
            status: 1
        }, {
            status: 2,
            soldAt: orderDetails.target
        });

        await redisClient.del(`order:${index_map[data.s]}`);
    }
    else if (data.p >= orderDetails.stoploss) {

        //tradeService.exitTrade(orderDetails);
        await Order.updateOne({
            symbol: index_map[data.s],
            type: 2,
            status: 1
        }, {
            status: 2,
            soldAt: orderDetails.stoploss
        });

        await redisClient.del(`order:${index_map[data.s]}`);
    } 
    // else {

    //     if (orderDetails.trailingCount === 1) {

    //         if (tick.last_price <= orderDetails.boughtAt - orderDetails.points * orderDetails.multiplier) {

    //             await Order.updateOne({
    //                 instrument_token: tick.instrument_token,
    //                 type: 2,
    //                 status: 1
    //             }, {
    //                 stoploss: orderDetails.boughtAt - orderDetails.points * orderDetails.multiplier * (0.25),
    //                 trailingCount: 2,
    //                 $push: {
    //                     trailingData: {
    //                         time: Date.now(),
    //                         lastStopLoss: orderDetails.stoploss,
    //                         lastTarget: orderDetails.target
    //                     }
    //                 }
    //             });

    //             let updatedOrder = JSON.parse(JSON.stringify(orderDetails));
    //             updatedOrder.stoploss = orderDetails.boughtAt - orderDetails.points * orderDetails.multiplier * 0.25;
    //             updatedOrder.trailingCount = 2;
    //             await redisClient.set(`order/${tick.instrument_token}`, JSON.stringify(updatedOrder));
    //         }



    //     } else {

    //         if (tick.last_price <= orderDetails.boughtAt - orderDetails.points * orderDetails.multiplier * (orderDetails.trailingCount / 2 + 0.5)) {

    //             // modify api //
    //             await Order.updateOne({
    //                 instrument_token: tick.instrument_token,
    //                 type: 2,
    //                 status: 1
    //             }, {
    //                 stoploss: orderDetails.boughtAt - orderDetails.points * orderDetails.multiplier * (orderDetails.trailingCount / 2),
    //                 target: orderDetails.target - orderDetails.points * orderDetails.multiplier * 0.5,
    //                 $inc: {
    //                     trailingCount: 1
    //                 },
    //                 $push: {
    //                     trailingData: {
    //                         time: Date.now(),
    //                         lastStopLoss: orderDetails.stoploss,
    //                         lastTarget: orderDetails.target
    //                     }
    //                 }
    //             });

    //             let updatedOrder = JSON.parse(JSON.stringify(orderDetails));
    //             updatedOrder.stoploss = orderDetails.boughtAt - orderDetails.points * orderDetails.multiplier * (orderDetails.trailingCount / 2);
    //             updatedOrder.target = orderDetails.target - orderDetails.points * orderDetails.multiplier * 0.5;
    //             updatedOrder.trailingCount = orderDetails.trailingCount + 1;
    //             await redisClient.set(`order/${tick.instrument_token}`, JSON.stringify(updatedOrder));
    //         }
    //     }
    // }
}

module.exports ={
    handleOrder,
    executeOrder
}