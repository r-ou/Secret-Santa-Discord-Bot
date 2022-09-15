const token = process.env['TOKEN'];

const { Client, Intents, MessageEmbed } = require('discord.js');
const keepAlive = require('./server');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]});


let names = [];
let finalAssignment = {};
let drawn = false;

function checkNameDuplicate(nm) {
      for (let i = 0; i < names.length; i++) {
        if (names[i] == nm) {
          return true;
        } 
    }
    return false;
    }
  
client.on('messageCreate', message => {
  if (message.content.startsWith(">")) {
    if(message.content.substring(1) == "hi") {
       message.reply("hello");
    }
  }
  
  if (message.content.startsWith(">addwl")) {
    let item = message.content.slice(7);
    
    //let wList = finalAssignment[nm].wishList;

    function addToList(nm, value) {
      
        finalAssignment[nm].wishList = finalAssignment[nm]['wishList'] || [];
        //let wList = finalAssignment[nm].wishList;
        finalAssignment[nm].wishList.push(value);
        let fullList = finalAssignment[nm].wishList.map(i => '- ' + i);
        if (finalAssignment[nm].wishList.length === 1) {
          return fullList;

        }
        if (finalAssignment[nm].wishList.length > 1) {
            //return finalAssignment.wishList.map(i => '- ' + i).join('\r\n');
            return fullList.join('\r\n');
        }
      }
  if (names.length == 0) {
    message.reply("No names have been added to the draw yet! To add a wishlist, add a name to the draw using /participate.");
  } else if (names.length < 3) {
    message.reply("Not enough names added to draw, at least 3 names need to be added!");

  } else {
  
  let wList = addToList(`${message.author.tag}`, item); 
  
  message.reply("Your current wishlist: \n" + wList);
  }
  }

  if (message.content.startsWith(">deletewl")) {

    if (Object.keys(finalAssignment) == 0) {
      message.reply("To add to your wishlist, please draw the names first! Use /draw to draw the names.");
    } else if (finalAssignment[`${message.author.tag}`].wishList.length == 0) {
      message.reply("Nothing is on your wishlist yet! Use >addwl [item] with the item you want to add to add it to your wishlist.");
    } else {

    let item = message.content.slice(10);
    
    function checkOnWishlist() {
      for (let i = 0; i < finalAssignment[`${message.author.tag}`].wishList.length; i++) {
      if (finalAssignment[`${message.author.tag}`].wishList[i] == item) {
        let start = finalAssignment[`${message.author.tag}`].wishList[0];
        let deleteItem = finalAssignment[`${message.author.tag}`].wishList[i];
        finalAssignment[`${message.author.tag}`].wishList[i] = start;
        finalAssignment[`${message.author.tag}`].wishList[0] = deleteItem;
        finalAssignment[`${message.author.tag}`].wishList.shift();

        return true;
      }  
    }
    return false;
    }

    if (checkOnWishlist()) {
      if (finalAssignment[`${message.author.tag}`].wishList.length > 1) {
      message.reply("Your current wishlist: \n" + finalAssignment[`${message.author.tag}`].wishList.map(i => '- ' + i).join('\r\n')); 
      } else {
        message.reply("Your current wishlist: \n" + finalAssignment[`${message.author.tag}`].wishList.map(i => '- ' + i));
      }
    } else {
      message.reply("The item you want to remove is not in your wishlist!");
    }

  }
  }

});


client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  if (interaction.commandName === 'user') {
		await interaction.reply(`Your tag: ${interaction.user.tag}\nYour id: ${interaction.user.id}`);
	}

  if (interaction.commandName === 'ping') {
    await interaction.reply('Pong!');
  }

  // PARTICIPATE COMMAND --------------------
  if (interaction.commandName === 'participate'){
    if (checkNameDuplicate(`${interaction.user.tag}`)) {
      await interaction.reply(`You are already in, <@${interaction.user.id}>!`);
    } else {
    names.push(`${interaction.user.tag}`);
    await interaction.reply("You're in! \n" + "Here are the current names in the draw: " + names.join(", "));
    }
  }

  // DRAW COMMAND --------------------------
  if (interaction.commandName === 'draw') {
  
    if (names.length < 3) {
      await interaction.reply("Not enough names have been added to the draw! At least 3 names need to be added to assign secret santas. Add another user by using the /participate command!")
    } else {
  
    await interaction.reply("Drawing names...");
    
    assigned = names.map((x) => x); // duplicating names array
    
    // function removes a name from assigned
    function removeName(nm){
        for (let i = 0; i < assigned.length; i++) {
            if (assigned[i] == nm) {
                let start = assigned[0];
                let deleteItem = assigned[i];
                assigned[i] = start;
                assigned[0] = deleteItem;
                assigned.shift();
            }
        }
    }
    // puts the name back into the "hat"(into assigned again)
    function restartDraw() {
    assigned = names.map((x) => x);
    finalAssignment = {};
    i = 0;
    }
    
      i = 0;
      while(i < names.length) {
        giver = names[i];
        getter = assigned[Math.floor(Math.random() * assigned.length)];

        // case : picked ur own name -> putBack into hat and redraw
        if (getter == giver && assigned.length === 1){
            restartDraw();
            continue;
        }
        while (getter == giver) {
            getter = assigned[Math.floor(Math.random() * assigned.length)];
        }
        removeName(getter); // removes the name from assigned
        
        const getterObj = {
          userTag: giver,
          assignedName: getter,
          wishList: []
        };

        finalAssignment[giver] = getterObj; // adding property into object
        i++;
    }
    drawn = true;
    await interaction.followUp("Finished assigning names! Use the /gimme command to get your assignment DMed to you!");
    }
  }

  // GIMME COMMAND---------------------------------
  if (interaction.commandName === 'gimme') {
    if (Object.keys(finalAssignment).length == 0) {
      await interaction.reply("The names haven't been drawn yet! Use the /draw command to draw names and the person who you'll be giving a gift to will be DMed to you! Remember, there needs to be at least 3 names to create a Secret Santa Draw.");
    } else if (!checkNameDuplicate(`${interaction.user.tag}`)){
      await interaction.reply("Your name hasn't been added to the draw yet! Use /participate to add yourself to the draw.");
    }
    else {
    // messaging people their assignments
    let userAssignment = finalAssignment[`${interaction.user.tag}`]['assignedName'];
    interaction.user.send("You're giving a gift to: @" + userAssignment + "!");
    await interaction.reply("The name of the person you're giving a gift to has been DMed to you!");
    };
}

// NAMES COMMAND --------------------------
if (interaction.commandName === 'names') {
  if (names.length == 0) {
    await interaction.reply("No names have been added to the draw yet! Use the /participate command to add yourself into the draw!");
  } else {
  await interaction.reply("Current names in the draw: " + names.toString());
  }
}

// HELP COMMAND -------------------------
if (interaction.commandName === 'help') {

  const helpEmbed = new MessageEmbed()
	      .setColor('#2c8246')
	      .setTitle('Secret Santa Results!')
      	.setAuthor({ name: 'Secret Santa Bot', iconURL: 'https://i.imgur.com/Zjv5ffu.png'})
        .setThumbnail('https://i.imgur.com/Zjv5ffu.png')
        .addFields(
		      { name: '/participate:', value: 'Use this command to add your name to the list of names in the draw.' },
		      { name: '/names:', value: 'Displays the usernames of the users in the draw so far.' },
		      { name: '/draw: ', value: 'Randomizes and assigns names for the draw. (Keep using /draw to redraw names, you can do this as many times as you want!)'},
          { name: '/gimme: ', value: 'Bot DMs you the name of person you will be giving a gift to.'},
          { name: '/reset: ', value: 'Resets the current names in the draw.'},
          { name: '/dmwishlist: ', value: 'Bot DMs you the wishlist of the person you will be giving a gift to.'},
          { name: '/mywishlist: ', value: 'Displays your current wishlist'},
          { name: '>addwl [item]: ', value: 'Adds an item to your wishlist. Replace [item] with the name of the item you want to your wishlist.'},
          { name: '>deletewl [item]: ', value: 'Deletes an item from your wishlist. Replace [item] with the name of the item on your wishlist to remove it. '},
	)
        .setDescription("Description of the commands")
        .setTimestamp()
      	
  await interaction.reply({ embeds: [helpEmbed] }); 

  //await interaction.reply()


}
// MYWISHLIST COMMAND --------------------------
if (interaction.commandName === 'mywishlist') {
  if (Object.keys(finalAssignment) == 0) {
    await interaction.reply("Names haven't been drawn yet! Use /draw to draw the names!");
  } else if (finalAssignment[`${interaction.user.tag}`].wishList.length > 1) {

     let fullList = finalAssignment[`${interaction.user.tag}`].wishList.map(i => '- ' + i);
    const wishlistEmbed = new MessageEmbed()
	      .setColor('#2c8246')
	      .setTitle(`${interaction.user.tag}'s wishlist!`)
      	.setAuthor({ name: 'Secret Santa Bot', iconURL: 'https://i.imgur.com/Zjv5ffu.png'})
        .setThumbnail('https://i.imgur.com/Zjv5ffu.png')
        .setDescription("Your current wishlist: \n" + fullList.join('\r\n'))
        .setTimestamp()
      	
    await interaction.reply({ embeds: [wishlistEmbed] });      

    
  } else if (finalAssignment[`${interaction.user.tag}`].wishList.length == 0) {
    await interaction.reply("You have no items on your wishlist so far. Use >addwl [item] to add something to your wishlist");

  } else {
    let fullList = finalAssignment[`${interaction.user.tag}`].wishList.map(i => '- ' + i);
    const wishlistEmbed = new MessageEmbed()
	      .setColor('#2c8246')
	      .setTitle(`${interaction.user.tag}'s wishlist!`)
      	.setAuthor({ name: 'Secret Santa Bot', iconURL: 'https://i.imgur.com/Zjv5ffu.png'})
        .setThumbnail('https://i.imgur.com/Zjv5ffu.png')
        .setDescription("Your current wishlist: \n" + fullList)
        .setTimestamp()
      	
    await interaction.reply({ embeds: [wishlistEmbed] });  
   
  }
}

// DMWISHLIST COMMAND --------------------------
if (interaction.commandName === 'dmwishlist') {
  if (!drawn) {
    await interaction.reply("Names haven't been drawn yet! Use /draw to draw the names!"); 
  } else {
    let givingToPerson = finalAssignment[`${interaction.user.tag}`].assignedName;
    let getterList = finalAssignment[givingToPerson].wishList.map(i => '- ' + i);
    if (finalAssignment[givingToPerson].wishList.length > 1) {
    
    interaction.user.send("Here's " + givingToPerson + "'s wishlist: \n" + getterList.join('\r\n'));

    await interaction.reply("The wishlist of the person you're giving a gift to has been DMed to you!");


  } else if (finalAssignment[givingToPerson].wishList.length == 0) {
    interaction.user.send(givingToPerson + " does not have anything on their wishlist yet!");

    await interaction.reply("The wishlist of the person you're giving a gift to has been DMed to you!");

  } else {
    interaction.user.send("Here's " + givingToPerson + "'s wishlist: \n" + getterList);

    await interaction.reply("The wishlist of the person you're giving a gift to has been DMed to you!");
  }
  }
  }
  // RESULTS COMMAND --------------------------
  if (interaction.commandName === 'results') {
    if (Object.keys(finalAssignment) == 0) {
      await interaction.reply("The names haven't been drawn yet! Use /draw to draw the names first!");
    } else {
      let resultsTable = [];
      function finalResults () {
      for (let i = 0; i < names.length; i++) {
         resultsTable.push(finalAssignment[names[i]].userTag + " had " + finalAssignment[names[i]].assignedName + "!");
       } 
      }
      finalResults();

      const resultsEmbed = new MessageEmbed()
	      .setColor('#2c8246')
	      .setTitle('Secret Santa Results!')
      	.setAuthor({ name: 'Secret Santa Bot', iconURL: 'https://i.imgur.com/Zjv5ffu.png'})
        .setDescription(resultsTable.join('\r\n'))
        .setThumbnail('https://i.imgur.com/Zjv5ffu.png')
        .setImage('https://i.imgur.com/Zjv5ffu.png')
        .setTimestamp()
      	
      await interaction.reply({ embeds: [resultsEmbed] });         
    }
  }
  if (interaction.commandName === 'reset') {
    names = [];
    finalAssignment = {};
    assigned = [];
    drawn = false;
    await interaction.reply("Names have been reset!");
  }
});


keepAlive();

client.login(token);