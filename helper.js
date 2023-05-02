async function askQuestion(bot, chatId, question) {
    return new Promise((resolve) => {
        bot.sendMessage(chatId, question.text).then(() => {
            bot.once('message', (msg) => {
                if((question.key === 'email' && !isValidEmail(msg.text)) ||
                   (question.key === 'password' && msg.text.length < 6) ){
                    resolve(false)
                } else {
                    resolve(msg.text);
                }
            });
        });
    });
}

function isValidEmail(email) {
    // Проверка по регулярному выражению на корректность email-адреса
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}


module.exports = askQuestion
