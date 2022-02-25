const { default: axios } = require("axios");


async function getTWAP() {
    var config = {
        method: 'get',
        url: 'https://api.zilstream.com/rates/HOL?interval=5m&period=1h',
        headers: {}
    };

    try {
        let result = await axios(config);
        console.log(result.data);
    } catch (e) {
        console.log("error occured from ZilStream===========>", e);
    }

}

async function getZilPrice() {
    var config = {
        method: 'get',
        url: 'https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/latest?convert=USD&symbol=ZIL',
        headers: {
            'X-CMC_PRO_API_KEY': '60a32cab-af95-4f29-82ef-8bb3c64b179f'
        }
    };
    try {
        let result = await axios(config);
        let price = result.data.data["ZIL"][0]["quote"]["USD"]["price"];
        console.log(price);

    } catch(e) {
        console.log("Error occured from CMC=============>", e)
    }
}
