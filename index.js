require('dotenv').config()

const TelegramApi = require('node-telegram-bot-api');
const token = process.env.TELEGRAM_TOKEN;
const bot = new TelegramApi(token, {polling: true})
const sequelize = require('./db');
const askQuestion  = require('./helper');
const User = require('./models/User');
const CoinMarketCap = require('./models/CoinMarketCap');
const questions = require('./questions');

bot.setMyCommands([
    {command: '/start', description: 'Приветствие'},
    {command: '/register', description: 'Зарегистрироваться'},
    {command: '/coin', description: 'Получить курс'},
    {command: '/all_coins', description: 'Получить список курса криптовалют'},
    {command: '/stop', description: 'Остановить бот'},
]);

bot.onText(/\/start/,  (msg) => {
    const chatId = msg.chat.id;
    const name = msg.chat.first_name;
    state[chatId] = {};

    bot.sendMessage(chatId, `https://tlgrm.ru/_/stickers/985/bdc/985bdc40-fd5f-3b50-a5b3-80ddaad23565/23.webp`)
    bot.sendMessage(chatId, `Привет, ${name}! \n
        Вас приветствует бот по криптовалютам. \n
        Здесь вы можете узнать текущий курс по всем криптовалютам. \n
        Для того чтобы продолжить зарагестрируйтесь /register`);
});

bot.onText(/\/register/,  async (msg) => {
    const chatId = msg.chat.id;
    const currentState = state[chatId];


    try {
        //const user = User.findOne({ where: { chatId: chatId } });
        const user = await User.findOne({ where: { chatId: chatId } });

        if (user === null) {

            const data = {};
            let i  = 0;
            for (let i = 0; i < questions.length; ++i) {
                data[questions[i].key] = await askQuestion(bot, chatId, questions[i]);
                if (data[questions[i].key] === false) {
                    await bot.sendMessage(chatId, questions[i].error);
                    --i;
                }
            }
            data['chatId'] = chatId;
            if(await User.register(data))
            {
                await bot.sendMessage(chatId, 'Вы успешно зарегистрировались! Посмотреть курс криптовалют /coin или /all_coins');
            }

            //bot.sendMessage(chatId, `Введите своё имя:`);
            // bot.once('message', async (msg) => {
            //     const name = msg.text;
            //
            //     bot.sendMessage(chatId, `Введите свой адрес электронной почты:`);
            //
            //     bot.on('message',  async (msg) => {
            //         const email = msg.text;
            //         if (!/\S+@\S+\.\S+/.test(email)) {
            //             bot.sendMessage(chatId, 'Неправильный формат адреса электронной почты. Пожалуйста, введите его заново:');
            //             bot.sendMessage(chatId, 'Почта: ' + email);
            //
            //             return;
            //         }
            //         bot.sendMessage(chatId, `Введите пароль, минимум 6 символов:`);
            //
            //         bot.once('message',async (msg) => {
            //             const password = msg.text;
            //
            //             if (password.length < 6)
            //             {
            //                 bot.sendMessage(chatId, 'Пароль должен содержать не менее 6 символов');
            //                 return;
            //             }
            //
            //             try {
            //                 const user =  User.register(name, email, chatId, password);
            //                 bot.sendMessage(chatId, 'Вы успешно зарегистрированы.');
            //             } catch (err) {
            //                 bot.sendMessage(chatId, err.message);
            //             }
            //         });
            //     });
            // });

        } else {

            bot.sendMessage(chatId, 'Вы уже зарегистрированы' );
            bot.sendMessage(chatId, `Пользователь: ${user.name}, email: ${user.email}`);

        }
    } catch (err) {
        bot.sendMessage(chatId, "Ошибка: " + err.message);
    }
});

bot.onText(/\/coin/,  async(msg) => {
    const chatId = msg.chat.id;

    try {
        const user = await User.findOne({ where: { chatId: chatId } });
        if (user === null) {
            bot.sendMessage(chatId, 'Для доступа к курсам криптовалют необходимо зарегистрироваться. Введите /register, чтобы зарегистрироваться.');
        } else {
            bot.sendMessage(chatId, `Введите название криптовалюты в таком формате - btc, eth, bnb:`);
            bot.once('message',  async (msg) => {
                const coin = msg.text;
                if (!coin.startsWith('/')) {
                    const name = msg.text;

                    const price = await CoinMarketCap.getCryptoPrice(coin);
                    bot.sendMessage(chatId, `Текущий курс ${coin.toUpperCase()}: ${price} USD`);
                }
            });
        }
    } catch (err) {
        bot.sendMessage(chatId,"Такого названия криптовалюты еще нет) Попробуйте, например: btc, eth, bnb");
    }

});

bot.onText(/\/all_coins/,  async(msg) => {
    const chatId = msg.chat.id;

    try {
        const user = await User.findOne({ where: { chatId: chatId } });
        if (user === null) {
            await bot.sendMessage(chatId, 'Для доступа к курсам криптовалют необходимо зарегистрироваться. Введите /register, чтобы зарегистрироваться.');
        } else {
            const listOfCoins = await CoinMarketCap.getCryptoList();
            await bot.sendMessage(chatId, listOfCoins);
        }
    } catch (err) {
        await bot.sendMessage(chatId,"Такого названия криптовалюты еще нет) Попробуйте, например: btc, eth, bnb");
    }

});

bot.onText(/\/stop/,  (msg) => {
     bot.sendMessage(msg.chat.id, 'Бот остановлен');
    process.exit();
});


 setInterval(async () => {

     await CoinMarketCap.sendAllUsersListOfCoins(bot);
}, 120 * 1000);

