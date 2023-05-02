//questions for registration
const questions = [
    {
        id: 0,
        text: 'Введите ваше имя:',
        key: 'name'
    },
    {
        id: 1,
        text: 'Введите ваш адрес электронной почты:',
        key: 'email',
        error: 'Неверный формат адреса электронной почты.',
    },
    {
        id: 2,
        text: 'Введите ваш пароль:',
        key: 'password',
        error: 'Пароль должен содержать минимум 6 символов.',
    }
];

module.exports = questions