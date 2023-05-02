const sequelize = require('../db');
const {DataTypes} = require("sequelize");
const bcrypt = require('bcrypt');

const User = sequelize.define('users', {
    id:{
        type: DataTypes.INTEGER,
        primaryKey: true,
        unique: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    chatId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    salt: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

User.register = async function(data) {
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(data.password, salt);

    try {
        return await User.create({
            name: data.name,
            email: data.email,
            chatId: data.chatId,
            password: hashedPassword,
            salt: salt
        });
    } catch (err) {
        console.error(err);
        throw new Error('Произошла ошибка при регистрации. Попробуйте ещё раз позже.');
    }
}

sequelize.sync();

module.exports = User;
