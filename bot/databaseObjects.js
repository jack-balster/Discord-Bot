//all database objects used to interact with the models

const Sequelize = require('sequelize');

const sequelize = new Sequelize('discordbot', 'username', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    storage: 'database.sqlite',
});

const TicTacToe = require('./models/tictactoe.js')(sequelize, Sequelize.DataTypes);

module.exports = {
    TicTacToe
};
