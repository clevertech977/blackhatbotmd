const database = require('../../database');

module.exports = {
  name: 'sl',
  aliases: ['silence'],
  category: 'admin',
  description: 'Silence a user for X minutes (all messages auto-delete)',
  usage: '.sl @user 5',
  adminOnly: true,
  botAdminNeeded: true,
  groupOnly: true,

  async execute(sock, msg, args, extra) {
    try {
      const target = msg.mentionedJid?.[0] || extra.replyId;
      if (!target) return extra.reply('*Please mention a user or reply to their message*');

      const minutes = parseInt(args[1]) || 5;
      const durationMs = minutes * 60 * 1000;

      const settings = database.getGroupSettings(extra.from);
      const silencedUsers = settings.silencedUsers || {};
      silencedUsers[target] = Date.now() + durationMs;

      database.updateGroupSettings(extra.from, { silencedUsers });
      await extra.reply(`✅ User has been silenced for ${minutes} minute(s).`);
    } catch (error) {
      await extra.reply(`❌ Error: ${error.message}`);
    }
  }
};