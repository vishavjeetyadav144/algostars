const { indicatorService } = require("../services");

const register = (req, res) => {
    console.log(req.body);

    res.status(200).send({ message: "checked" })
}

const getCandleById = async (req,res) =>{
    if(!req.params.id){
        res.status(400).send({success:false});
    }

    let id = req.params.id;
    let response = await indicatorService.getCandleById(id);
    if (response.success) {
        res.status(200).send(response);
    } else {
        res.status(400).send(response);
    }

}

const getCandle = async(req, res) => {
     let response = await indicatorService.getCandle();
    if (response.success) {
        //res.status(200).send(response);
        res.render("candle", {
            data: response.data
        });
    } else {
        res.status(400).send(response);
    }
  
}

const getOrders = async(req, res) => {
    let response = await indicatorService.getOrders();
    if (response.success) {
         res.render("index", {
            order: response.data
        });
    } else {
        res.status(400).send(response);
    }
}

module.exports = {
    register,
    getCandle,
    getOrders,
    getCandleById
}