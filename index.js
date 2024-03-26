const express = require("express")
const WebSocket = require('ws');
const { Queue } = require('bullmq');
const path = require('path');
const dotenv = require("dotenv");
const mongoose = require('mongoose');
const hbs = require('hbs');
const morgan = require('./config/morgan');

dotenv.config({ path: path.join(__dirname, './.env') });
const { startCandleConsumerService } = require('./consumers/candles.consumer');
const { startSpotConsumerService } = require('./consumers/spot_price.consumer');
const { getTimeStamp, generateSignature } = require("./services/traders.service");
const { indicatorController } = require("./controller");


const spotPriceQueue = new Queue('spotPriceQueue', {
    connection: {
        host: process.env.RedisHost,
        port: 6379
    }
});

const candlestick_15m = new Queue('candlestick_15m', {
    connection: {
        host: process.env.RedisHost,
        port: 6379
    }
});

const handleSocketData = async (data) => {


    if (data.type == "candlestick_5m") {

        await candlestick_15m.add('candlestick_5m', data);

    } else if (data.type == "v2/spot_price") {

        await spotPriceQueue.add('spotPriceQueue', data);

    }
}

const socketConnection = () => {
    const method = 'GET';
    const timestamp = getTimeStamp();
    const path = '/live';
    const signature_data = method + timestamp + path;
    const signature = generateSignature(process.env.API_SECRET, signature_data);

    const ws = new WebSocket('wss://socket.delta.exchange');

    ws.on('open', function open() {

        console.log('WebSocket connected successfully.');

        ws.send(JSON.stringify({
            type: 'auth',
            payload: {
                'api-key': process.env.API_KEY,
                signature: signature,
                timestamp: timestamp
            }
        }));

        ws.send(JSON.stringify({
            type: 'subscribe',
            payload: {
                "channels": [
                    {
                        "name": "v2/spot_price",
                        "symbols": [
                            ".DEXBTUSDT",".DEETHUSDT"
                        ]
                    },
                    {
                        "name": "candlestick_5m",
                        "symbols": ["BTCUSDT", "ETHUSDT"]
                    }
                ]
            }
        }));
    });

    ws.on('message', function incoming(data) {
        const message = data.toString('utf-8');
        handleSocketData(JSON.parse(message));
    });
}

const app = express()

app.use(morgan.successHandler);
app.use(morgan.errorHandler);

app.set("view engine", "hbs");
// parse json request body
app.use(express.json());
app.set("views", path.join(__dirname,"/public"));

app.get('/candle', indicatorController.getCandle);
app.get('/order',indicatorController.getOrders)

mongoose.connect(process.env.MongoURL).then(() => {
    console.log('Connected to MongoDB');
    app.listen(8000, () => {
        console.log("server started");
        startCandleConsumerService();
        startSpotConsumerService();
        socketConnection();
    })
  });