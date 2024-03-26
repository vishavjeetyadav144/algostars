const mongoose = require('mongoose');

const candleSchema = mongoose.Schema(
    {
        symbol: {
            type: String,
            required: true

        },
        timestamp: {
            type: Number,
            required: true
        },
        open: {
            type: Number,
            required: true
        },
        high: {
            type: Number,
            required: true
        },
        low: {
            type: Number,
            required: true
        },
        close: {
            type: Number,
            required: true
        },
        rsi: {
            type: Number,
            // required:true
        },
        avg_gain: {
            type: Number,
            // required:true
        },
        avg_loss: {
            type: Number,
            // required:true
        }
    },
    {
        timestamps: false
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

candleSchema.post('save', async function (doc) {
    console.log(doc, 'posthook -----------------------------')
});

const Candle = mongoose.model('candle', candleSchema);

module.exports = Candle;
