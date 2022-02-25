const { default: axios } = require("axios");
const BN = require('bn.js')

async function getTWAP() {
    var config = {
        method: 'get',
        url: 'https://api.zilstream.com/rates/HOL?interval=15m&period=1h&currency=USD',
        headers: {}
    };

    try {
        let result = await axios(config);
        let prices = result.data;
        let sum = 0;
        for(let priceData of prices) {
            let price = priceData["close"];
            sum += price;
        }
        return sum/5;
    } catch (e) {
        console.log("error occured from ZilStream===========>", e);
    }

}

async function main() {
    let result = await getTWAP();
    console.log(result);
}
main();