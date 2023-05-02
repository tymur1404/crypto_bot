const axios = require('axios');
const User = require("./User");
async function getCryptoPrice(symbol) {
    const response = await axios.get(`https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=${symbol.toUpperCase()}&convert=USD`, {
        headers: {
            'X-CMC_PRO_API_KEY': process.env.API_KEY_COINMAERKETCAP
        }
    });

    return response.data.data[symbol.toUpperCase()].quote.USD.price.toFixed(2);
}

async function getCryptoList() {
    const response = await axios.get(`https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest`, {
        headers: {
            'X-CMC_PRO_API_KEY': process.env.API_KEY_COINMAERKETCAP
        }
    });
    const data = response.data.data;
    let coins = '';
    for (let i = 0; i < data.length; i++) {
        const crypto = data[i];
        const name = crypto.name;
        const price = crypto.quote.USD.price.toFixed(2);
        console.log(`${name}: ${price}`);
        coins +=`${name}: ${price} \n`
    }

    return coins
}

async function sendAllUsersListOfCoins(bot) {

    const coins = await getCryptoList();

    User.findAll()
        .then(users => {
            users.forEach(user => {
                const chatId = user.chatId; // Получаем ID чата пользователя
                bot.sendMessage(chatId, coins); // Отправляем сообщение каждому пользователю
            });
        })
        .catch(error => {
            console.log(error);
        });
}

module.exports = {
    getCryptoPrice,
    getCryptoList,
    sendAllUsersListOfCoins
};
