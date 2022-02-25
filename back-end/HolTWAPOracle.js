const { default: axios } = require("axios");


async function getZilPrice() {
    var config = {
        method: 'get',
        url: 'https://api.zilstream.com/rates/HOL?interval=1m&period=1h',
        headers: { }
      };

      try {
        await axios(config)
      } catch(e) {
        console.log(e);
      }
    
}

getZilPrice();