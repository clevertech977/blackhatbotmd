const database = require('../../database');

module.exports = {
  name: 'unsl',
  aliases: ['unsilence'],
  category: 'admin',
  description: 'Unsilence a user',
  usage: '.unsl @user',
  adminOnly: true,
  botAdminNeeded: true,
  groupOnly: true,

  async execute(sock, msg, args, extra) {
    try {
      const target = msg.mentionedJid?.[0] || extra.replyId;
      if (!target) return extra.reply('*Please mention a user or reply to their message*');

      const settings = database.getGroupSettings(extra.from);
      const silencedUsers = settings.silencedUsers || {};

      if (!silencedUsers[target]) return extra.reply('*User is not silenced*');

      delete silencedUsers[target];
      database.updateGroupSettings(extra.from, { silencedUsers });
      await extra.reply('✅ User has been unsilenced.');
    } catch (error) {
      await extra.reply(`❌ Error: ${error.message}`);
    }
  }
};