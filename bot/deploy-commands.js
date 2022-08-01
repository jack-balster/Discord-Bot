//allows us to add slash commands
const {SlashCommandBuilder} = require('@discordjs/builders');
//reference REST package so we can interact with the discord api
const {REST} = require('@discordjs/rest');
//reference routes package to interact with another discord api
const {Routes} = require('discord-api-types/v9');
//reference specific IDs so commands will work (user, server, bot token)
const {clientId, guildId, token} = require('./config.json');

//name of slash command is tictactoe
const commands = [
    new SlashCommandBuilder().setName('tictactoe').setDescription('Play a game of tic-tac-toe'),
]

//defining rest object to interact with api
const rest = new REST({ version: '9' }).setToken(token)

//route object takes client/guild id and generates URL that points to guild commands (body is converted to json)
rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands.map(command => command.toJSON() ) })
    .then(() => console.log('Successfully registered application commands.'))
    .catch(console.error);
