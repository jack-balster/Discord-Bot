//creates all our database tables whenever it is run
//import sequelize package
const Sequelize = require('sequelize');

//instance of sequelize name, username, password for database
const sequelize = new Sequelize('discordbot', 'username', 'password', {
    host: 'localhost', //database stored on computer
    dialect: 'sqlite',
    logging: false,
    storage: 'database.sqlite', //name of file to store database contents (file is binary)
});

//import tictactoe model
require('./models/tictactoe.js')(sequelize, Sequelize.DataTypes);

//make sure database matches model specified (helpful if future changes are made to tictactoe model)
sequelize.sync().then(async () => {
    console.log('Database synced');
    sequelize.close();
}).catch(console.error);
