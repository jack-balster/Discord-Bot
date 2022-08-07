//import from discord.js library
const { Client, Intents, MessageButton, MessageActionRow } = require('discord.js');
//contains token for the bot, client id, and guild id
const { token } = require('./config.json');
//import tictactoe database module 
const { TicTacToe } = require('./databaseObjects.js');
//initialize client class and have discord send every event that happens on the server with intents.flags.guilds
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] }); 

//happens once when the code has established a working connection with discord
client.once('ready', () => {
    console.log('Ready!'); //lets me know it's connected
})

//creates message "pong" to respond when a user types "ping" (makes sure I can interact with the bot)
//client.on('messageCreate', (message) => {
  //  if(message.author.id === client.user.id) return; //make sure bot doesn't respond to itself

    //if(message.content === "ping") {
     //   message.reply("pong");
    //}
//})


/* tictactoe */
let EMPTY = Symbol("empty");
let PLAYER = Symbol("player");
let BOT = Symbol("bot");

let tictactoe_state //global

//on client interaction
client.on('interactionCreate', async interaction => {
    //checks if interaction is a command then runs
    if(!interaction.isCommand()) return;

//if command is tictactoe then run code
    const { commandName } = interaction;
//create gameboard
    if (commandName === 'tictactoe') {
        tictactoe_state = [
            [EMPTY, EMPTY, EMPTY],
            [EMPTY, EMPTY, EMPTY],
            [EMPTY, EMPTY, EMPTY]
        ]
//message displayed in discord server while command is running
        await interaction.reply({ content: "Playing a game of tictactoe", components: makeGrid() });
    }
})

//makes grid with clickable buttons for interactive gameplay (fills arrays)
function makeGrid() {
    components = []
    //loop through arrays so that it matches 3x3
    for (let row = 0; row < 3; row++) {
        actionRow = new MessageActionRow()

        for(let col = 0; col < 3; col++) {
            messageButton = new MessageButton()
                 //uses column and row to set custom id for each button
                .setCustomId('tictactoe_' + row + '_' + col) 
            //switch based on button custom id and case based on what selects button (bot or user)
            switch(tictactoe_state[row][col]){
                case EMPTY:
                    messageButton
                    .setLabel(' ') //what appears on button
                    .setStyle('SECONDARY') //how button looks (grey)
                    break;
                case PLAYER:
                    messageButton
                    .setLabel('X')
                    .setStyle('PRIMARY') //blue for user
                    break;
                case BOT:
                    messageButton
                    .setLabel('O')
                    .setStyle('DANGER') //red for bot
                    break;
                }
                
        //add components to the row so they are updated and display properly
            actionRow.addComponents(messageButton)
        }
        components.push(actionRow)
    }
return components
}
/* End tictactoe */

//function to select random number (bot guess)
function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

//function to determine if game is a draw
function isDraw() {
    for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
            //someone can make a move if there is at least 1 empty button left
            if (tictactoe_state[row][col] == EMPTY) { 
                return false;
            }
        }
    }
    return true;
}

//function to determine if the game is over via win or lose (3 in a row)
function isGameOver() {
    for (let i = 0; i < 3; i++) {
        //checking horizontally for 3 in a row
        if (tictactoe_state[i][0] == tictactoe_state[i][1] && tictactoe_state[i][1] == tictactoe_state[i][2] && tictactoe_state[i][2] != EMPTY) {
            return true;
        }
        //checking vertically for 3 in a row
        if (tictactoe_state[0][i] == tictactoe_state[1][i] && tictactoe_state[1][i] == tictactoe_state[2][i] && tictactoe_state[2][i] != EMPTY) {
            return true;
        }
    }
    //checking diagonally for 3 in a row
    if (tictactoe_state[1][1] != EMPTY) {
        if (
            (tictactoe_state[0][0] == tictactoe_state[1][1] && tictactoe_state[1][1] == tictactoe_state[2][2]) || 
            (tictactoe_state[2][0] == tictactoe_state[1][1] && tictactoe_state[1][1] == tictactoe_state[0][2])) {
            return true;
        }
    }
    return false;
}

//on client interaction
client.on('interactionCreate', async interaction => {
    //checks if interaction is a button click
    if(!interaction.isButton()) return;
    //checks if button has one of the custom IDs (is it on the 3x3 grid)
    if(!interaction.customId.startsWith('tictactoe')) return;

    if (isGameOver()) {
        interaction.update({
            components: makeGrid()
        })
        return;
    }

    let parsedFields = interaction.customId.split("_") //update only the button that is being selected
    let row = parsedFields[1] //position 1 in custom id is row
    let col = parsedFields[2] //posititon 2 in custom id is column

    tictactoe_state[row][col] = PLAYER;

    if (isGameOver()) { //check if game is over on player move
        let user = await TicTacToe.findOne({ //get user from tictactoe DB table (only one user)
            where: {
                user_id: interaction.user.id //user id = one that clicked button (using interaction object)
            }
        });
        if(!user) { //if user doesn't exsist, create new row in DB table for them
            user = await TicTacToe.create({ user_id: interaction.user.id });
        }

        await user.increment('score'); //increments score using increment function (score is column name)

        interaction.update({ //retrieve score of user using the 'get' function and display
            content: "You won! You have now won " + (user.get('score') + 1) + " time(s)!",
            components: []
        })
        return;
    }
    if (isDraw()) { //check if game is a draw & display
        interaction.update({
            content: "The game resulted in a draw!",
            components: []
        })
        return;
    }

/* Bot functionality */
    let botRow
    let botCol
    do {
         botRow = getRandomInt(3); //0-2 
         botCol = getRandomInt(3);
         //generate button to select while it has not already been selected
    } while(tictactoe_state[botRow][botCol] != EMPTY); 

    tictactoe_state[botRow][botCol] = BOT;

    if (isGameOver()) { //check if game is over on bot move (bot won)
        interaction.update({
            content: "You lost :(",
            components: makeGrid()
        })
        return;
    }
    if (isDraw()) { //check if game is a draw
        interaction.update({
            content: "The game resulted in a draw!",
            components: []
        })
        return;
    }
/* End bot functionality*/

//update the board based on current interaction (using the makeGrid function to generate the buttons again)
  interaction.update({
      components: makeGrid()
   })
})

client.login(token);

