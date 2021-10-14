require('dotenv').config();
const Discord = require('discord.js');
const unicode = require('emoji-unicode-map');
const token = process.env.DISCORD_BOT_TOKEN;
const messageIds = process.env.MESSAGE_IDS.split(',');
const client = new Discord.Client({
  autoReconnect: true,
  retryLimit: Infinity,
  intents: [
    'GUILDS',
    'GUILD_MESSAGES',
    'GUILD_MESSAGE_REACTIONS',
    'DIRECT_MESSAGES',
  ],
  partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
});

client.once('ready', () => {});

client.once('reconnecting', () => {
  console.log('Reconnecting!');
});

client.once('disconnect', () => {
  console.log('Disconnect!');
});

client.on('messageReactionAdd', async (reaction, user) => {
  if (reaction.partial) {
    try {
      await reaction.fetch();
    } catch (error) {
      console.error('Something went wrong when fetching the message:', error);
      return;
    }
  }
  if (
    messageIds.includes(reaction.message.id) &&
    unicode.get(reaction.emoji.name) == unicode.get(process.env.EMOJI)
  ) {
    let message = await user.send('Okay what is your email address ?');
    let response = await message.channel.awaitMessages({ max: 1 });
    let privateChannel = await client.channels.fetch(
      process.env.PRIVATE_CHANNEL_ID
    );
    let email = response.first().content;
    let member = await reaction.message.guild.members.fetch(user.id);

    await privateChannel.send(
      `User ID: ${user.id}, Name: ${
        user.username
      }, Email: ${email}, Roles: [${formatUserRoles(member)}] `
    );
    await user.send('Great, All done. Look out for our emails!');
  }
});

const formatUserRoles = (member) => {
  let roles = [];
  member._roles.forEach((role) => {
    roles.push(member.guild.roles.resolve(role).name);
  });
  return roles.join(',');
};

client.login(token);
