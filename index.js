
// setting up secret ids
const token = process.env['TOKEN'];
const client_id = process.env['CLIENT_ID'];
const guild_id = process.env['GUILD_ID'];

// setting up commands
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

const commands = [{
  name: 'ping',
  description: 'Replies with Pong!'
}, {
  name: 'participate',
  description: 'Adds user to the secret santa draw'
}, {
  name: 'draw',
  description: 'Randomly assign secret santas'
}, {
  name: 'gimme',
  description: 'DMs members their secret santa assignment'
}, {
  name: 'user',
  description: "gets users info"
}, {
  name: 'names',
  description: "Gives list of names that have been added to the draw"
}, {
  name: 'help',
  description: 'Commands help!'
}, {
  name: 'mywishlist',
  description: 'Produces your wishlist!'
}, {
  name: 'dmwishlist',
  description: "DMs the wishlist of the person you're giving a gift to"
}, {
  name: 'results',
  description: "Reveals the results of who had who in the draw! Use with caution!!!"
}, {
  name: 'reset',
  description: "Erases names and resets all settings"
}
]; 

const rest = new REST({ version: '9' }).setToken(token);

(async () => {
  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(
      Routes.applicationGuildCommands(client_id, guild_id),

      { body: commands },
    );

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
})();


