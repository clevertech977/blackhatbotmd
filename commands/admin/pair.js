const axios = require('axios');

module.exports = {
  name: 'pair',
  aliases: ['connect'],
  category: 'admin',
  description: 'Pair a WhatsApp number via external API',
  usage: '.pair <number>',

  async execute(sock, msg, args, extra) {
    try {
      const number = args[0];
      if (!number) return extra.reply('❌ Usage: .pair <number>');

      await extra.reply('⏳ Generating pairing code...');

      const response = await axios.get(
        `https://clevertech97.qzz.io/pair?number=${number}`
      );

      if (response.data?.code) {
        return extra.reply(`${response.data.code}`);
      }

      return extra.reply('❌ Failed to generate pairing code.');

    } catch (error) {
      console.error('Pair command error:', error.message);
      return extra.reply('❌ Failed to connect to pairing server.');
    }
  }
};
