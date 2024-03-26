const crypto = require('crypto');


const generateSignature = (secret, message) => {
    const hash = crypto.createHmac('sha256', secret).update(message).digest('hex');
    return hash;
}

const getTimeStamp = () => {
    const d = new Date();
    const epoch = new Date(1970, 0, 1);
    return Math.floor((d - epoch) / 1000).toString();
}

const updateBalanceApi = (data) => {

    try {
        let timestamp = getTimeStamp();
        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: 'https://api.delta.exchange/v2/wallet/balances',
            headers: {
                'Accept': 'application/json',
                'api-key': process.env.API_KEY,
                'signature': generateSignature(process.env.API_SECRET, method + timestamp + path),
                'timestamp': timestamp
              }
        };


        axios.request(config)
            .then((response) => {
                if (response.data.status) {

                    Account.updateOne({ userid: data.userid }, { balance: parseFloat(response.data.result[0].available_balance) }).catch((err) => {
                        console.log(err)
                    }).catch((err) => {
                        console.log(err)
                    });
                }
            })
            .catch((error) => {
                console.log(error);
            });
    } catch (err) {
        console.log(err)
    }
}

const callApi = (data) => {

    let payload = {
        "product_id": 0,
        "limit_price": "string",
        "size": 0,
        "side": "buy",
        "order_type": "limit_order",
        "stop_order_type": "stop_loss_order",
        "stop_price": "string",
        "trail_amount": "string",
        "stop_trigger_method": "mark_price",
        "bracket_stop_loss_limit_price": "string",
        "bracket_stop_loss_price": "string",
        "bracket_take_profit_limit_price": "string",
        "bracket_take_profit_price": "string",
        "time_in_force": "gtc",
        "mmp": "disabled",
        "post_only": "true",
        "reduce_only": "true",
        "close_on_trigger": "true",
        "client_order_id": "string"
      };

    
    let timestamp = getTimeStamp();

    let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://api.delta.exchange/v2/orders',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'api-key': process.env.API_KEY,
            'signature': generateSignature(process.env.API_SECRET, method + timestamp + path),
            'timestamp': timestamp
        },
        data: payload
    };

    axios.request(config)
        .then((response) => {
            console.log(JSON.stringify(response.data));
            // if (data.order === 1) {
            //  Trade.create({ userid: data.userid, symbol: data.tradingsymbol, status: 1, quantity: data.quantity, type: data.type });
            if (data.order == 1) {
                setTimeout( ()=>{updateBoughtPrice(response.data.data.orderId, data.token, data.details)}, 500);

                Account.updateOne({ userid: data.userid, token: data.token }, { $push: { trades: data.instrument_token } }).catch((err) => {
                    console.log(err)
                }).catch((err) => {
                    console.log(err)
                });
            } else if (data.order == 2) {
                Account.updateOne({ userid: data.userid, token: data.token }, { $pull: { trades: data.instrument_token } }).catch((err) => {
                    console.log(err)
                }).catch((err) => {
                    console.log(err)
                });
            }
            setTimeout(() => { updateBalanceApi({ userid: data.userid, token: data.token }) }, 1000);

            // } else if (data.order === 2) {
            // Trade.updateOne({ userid: data.userid, symbol: data.tradingsymbol, status: 1, type: data.type }, { status: 2 });
            //   setTimeout(() => { updateBalanceApi({ userid: data.userid, token: data.token }) }, 2000);
            //   }

        })
        .catch((error) => {
            console.log(error);
        });
}

// const placeOrder = async (data) => {
//     let accounts = await Account.find({ balance: { $gte: 10000 } }).lean();

//     accounts.map((account) => {

//         callApi({
//             exchange_token: symbols[String(data.instrument_token)].exchange_token,
//             instrument_token: data.instrument_token,
//             type: data.type === 1 ? 'BUY' : "SELL",
//             quantity: parseInt((10000 * 4) / (data.boughtAt)),
//             token: account.token,
//             userid: account.userid,
//             order: 1,
//             details: data
//         });

//     });
// }

// const exitTrade = async (data) => {
//     try {
//         let accounts = await Account.find({ trades: { $in: [data.instrument_token] } }).lean();

//         accounts.map((account) => {

//             callApi({
//                 exchange_token: symbols[String(data.instrument_token)].exchange_token,
//                 instrument_token: data.instrument_token,
//                 type: data.type === 1 ? 'SELL' : "BUY",
//                 quantity: parseInt((10000 * 4) / (data.boughtAt)),
//                 token: account.token,
//                 userid: account.userid,
//                 order: 2
//             });

//         });
//     } catch (err) {
//         console.log(err)
//     }
// }

module.exports = {
    //placeOrder,
    //exitTrade,
    generateSignature,
    getTimeStamp
}