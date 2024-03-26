const { Order, Candle } = require("../models")

const getCandle = async() => {
    try {
        let res = await Candle.aggregate([
            {
                $group:{
                    _id:"$symbol",
                    candles:{
                        $push: "$$ROOT"
                    }
                }
            },
            {
                $unwind: "$candles" // Unwind the candles array to operate on individual documents
            },
            {
                $sort: { "candles.timestamp": -1 } // Sort based on the timestamp field within the candles subdocuments
            },
            {
                $limit: 10
            },
            {
                $group: {
                    _id: "$_id",
                    candles: { $push: "$candles" } // Push the sorted candles back into an array
                }
            }
        ]);
        if (!res) {
            return { success: false, message: "Candles not found" }
        }
        return { success: true, data: res }

    } catch (err) {
        console.log(err);
        return { success: false, message: "Order not found" }
    }
}

const getCandleById = async(symbol) => {
    try {
        let res = await Candle.find({symbol:parseInt(symbol)}).sort({_id:-1}) ;
        if (!res) {
            return { success: false, message: "Candles not found" }
        }
        return { success: true, data: res }

    } catch (err) {
        console.log(err);
        return { success: false, message: "Order not found" }
    }
}

const getOrders = async () => {
    try {
        let res = await Order.find({}).sort({ _id: -1 }).lean();
        if (!res) {
            return { success: false, message: "Order not found" }
        }
        return { success: true, data: res }
    } catch (err) {
        console.log(err);
        return { success: false, message: "Order not found" }
    }
}

module.exports = {
    getCandle,
    getOrders,
    getCandleById
}