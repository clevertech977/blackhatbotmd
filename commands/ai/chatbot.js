/**
 * GOD-Level Chatbot Command for WhatsApp MD
 * Features:
 * - Personal recognition
 * - Persistent memory (users + groups)
 * - GPT-5 personalized replies
 * - Auto reactions and context-aware responses
 * - Follows discussion automatically
 */

const db = require('../../db'); // JSON DB module
const axios = require('axios');

module.exports = {
  name: 'chatbot',
  aliases: ['bot'],
  category: 'ai',
  description: 'Enable/Disable intelligent chatbot in the group',
  usage: '.chatbot on/off',

  async execute(sock, msg, args, extra) {
    try {
      if (!msg.key.remoteJid.endsWith('@g.us'))
        return await extra.reply('❌ This command only works in groups.');

      const groupId = msg.key.remoteJid;
      const action = args[0]?.toLowerCase();

      if (!action || !['on', 'off'].includes(action))
        return await extra.reply('⚠️ Usage: .chatbot on/off');

      // Update group settings in DB
      db.updateGroupSettings(groupId, { chatbot: action === 'on' });
      await extra.reply(`💬 Chatbot is now *${action.toUpperCase()}* in this group.`);

    } catch (error) {
      console.error('Chatbot command error:', error);
      await extra.reply('❌ Something went wrong. Please try again.');
    }
  },

  // Main auto-reply handler
  async handleMessage(sock, msg) {
    try {
      const groupId = msg.key.remoteJid;
      const isGroup = groupId.endsWith('@g.us');
      const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text;
      if (!text || !isGroup) return;

      const groupSettings = db.getGroupSettings(groupId);
      if (!groupSettings.chatbot) return; // chatbot off

      // Identify user
      const userId = msg.key.participant || msg.key.remoteJid.split('@')[0];
      let user = db.getUser(userId);

      // Update user chat history
      if (!user.chatHistory) user.chatHistory = [];
      user.chatHistory.push({ timestamp: Date.now(), message: text });
      db.updateUser(userId, user);

      // Prepare GPT-5 context
      const context = {
        user: { ...user, id: userId },
        group: { ...groupSettings, id: groupId }
      };

      // Call GPT-5 API
      const response = await axios.get('https://api.malvin.gleeze.com/ai/gpt-5', {
        params: { query: text, context }
      });

      const replyText = response.data?.msg || '🤖 I did not understand that.';

      // Save topic history
      if (!groupSettings.topicHistory) groupSettings.topicHistory = [];
      groupSettings.topicHistory.push({ timestamp: Date.now(), message: text });
      db.updateGroupSettings(groupId, groupSettings);

      // Auto reactions example
      if (replyText.includes('😂')) {
        await sock.sendMessage(groupId, { react: { text: '😂', key: msg.key } });
      } else {
        await sock.sendMessage(groupId, { text: replyText, quoted: msg });
      }

    } catch (error) {
      console.error('Chatbot auto-reply error:', error.message);
    }
  }
};