/**
 * Pair Command - Connect number via external pairing API
 */

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

      await extra.reply('⏳ Trying to pair number...');

      // Call your external API
      const response = await axios.post('https://blackhat-bot-pair-code-production-95ea.up.railway.app/pair', {
        number
      });

      if (response.data?.success) {
        return extra.reply(`✅ Number ${number} successfully paired!\nCode: ${response.data.code || 'N/A'}`);
      } else {
        return extra.reply(`❌ Failed to pair number ${number}.\n${response.data?.message || ''}`);
      }

    } catch (error) {
      console.error('Pair command error:', error.message);
      await extra.reply(`❌ Error pairing number: ${error.message}`);
    }
  }
};