/**
 * Auto Status View Command
 */

const db = require('../../database');

module.exports = {
  name: 'status',
  aliases: ['autostatus'],
  category: 'admin',
  description: 'Enable/Disable auto view WhatsApp statuses',
  usage: '.status on/off',

  async execute(sock, msg, args, extra) {
    try {
      const action = args[0]?.toLowerCase();
      if (!['on','off'].includes(action)) {
        return extra.reply('⚠️ Usage: .status on/off');
      }

      // Update global bot setting
      db.updateUser('bot', { autoStatus: action === 'on' });
      return extra.reply(`📌 Auto Status Viewer is now *${action.toUpperCase()}*`);

    } catch (error) {
      console.error('Status command error:', error);
      await extra.reply('❌ Something went wrong.');
    }
  }
};