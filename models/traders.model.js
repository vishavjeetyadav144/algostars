const mongoose = require('mongoose');

const tradeSchema = mongoose.Schema(
    {
        symbol: {
            type: Number,
            required: true

        },
        userid: {
            type: Number,
            required: true
        },
        quantity:{
            type: Number,
            required: true
        },
        status: {
            type: Number,
            required: true,
            default:0
        },
        type:{
            type:String,
            required:true
        }
    },
    {
        timestamps: false
    }
);

const Candle = mongoose.model('trade', tradeSchema);

module.exports = Candle;
