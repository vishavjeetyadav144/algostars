const mongoose = require('mongoose');

const orderSchema = mongoose.Schema(
    {
        symbol: {
            type: String,
            required: true

        },
        type: {
            type: Number,
            required: true
        },
        boughtAt: {
            type: Number,
            //  required: true
        },
        soldAt: {
            type: Number,
            //required: true
        },
        target: {
            type: Number,
            required: true
        },
        stoploss: {
            type: Number,
            required: true
        },
        points: {
            type: Number,
            required: true
        },
        multiplier: {
            type: Number,
            required: true
        },
        status: {
            type: Number,
            required: true
        },
        trailingCount:{
            type:Number,
            default:1
        },
        trailingData: {
            type: [],
            default: []
        }
    },
    {
        timestamps: true
    }
);

// candleSchema.pre('save', async function (next) {
//     const candle = this;

//     next();
// });

// candleSchema.pre("save", function(next) {

//     var self = this;
//     self.rsi = 100 - 100/(1+(self.avg_gain/self.avg_loss));
//     console.log()
//     next();

// });

orderSchema.post('save', async function (doc) {
    console.log(doc, 'posthook -----------------------------')
});

const Order = mongoose.model('order', orderSchema);

module.exports = Order;
