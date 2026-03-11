/**
 * Anti-Delete Command + GOD-Level Handler
 * Features:
 * - Toggle anti-delete ON/OFF per group
 * - Capture deleted messages (text + media)
 * - Forward everything to owner inbox automatically
 */

const db = require('../../database');
const fs = require('fs');
const path = require('path');
const config = require('../../config');

module.exports = {
  name: 'antidelete',
  aliases: ['ad'],
  category: 'admin',
  description: 'Toggle Anti-Delete protection in group',
  usage: '.antidelete on/off',
  groupOnly: true,
  adminOnly: true,
  botAdminNeeded: true,

  async execute(sock, msg, args, extra) {
    try {
      if (!args[0] || !['on','off'].includes(args[0].toLowerCase()))
        return extra.reply('⚠️ Usage: .antidelete on/off');

      const action = args[0].toLowerCase();
      db.updateGroupSettings(extra.from, { antidelete: action === 'on' });
      await extra.reply(`🛡️ Anti-Delete is now *${action.toUpperCase()}* in this group.`);

    } catch (error) {
      console.error('Anti-Delete Command Error:', error.message);
      await extra.reply(`❌ Something went wrong: ${error.message}`);
    }
  },

  // GOD-level auto-reply handler for deleted messages
  async handleDeletedMessage(sock, key) {
    try {
      const groupId = key.remoteJid;
      if (!groupId || !groupId.endsWith('@g.us')) return;

      const settings = db.getGroupSettings(groupId);
      if (!settings.antidelete) return; // Anti-delete OFF

      const original = await sock.loadMessage(groupId, key.id).catch(() => null);
      if (!original) return;

      const sender = key.participant || key.remoteJid.split('@')[0];
      const ownerJid = config.ownerNumber[0] + '@s.whatsapp.net';
      const groupMeta = await sock.groupMetadata(groupId).catch(() => ({ subject: 'Unknown Group' }));
      const time = new Date().toLocaleString();

      // Build header message
      let messageText = `📝 *Deleted Message Detected*\n\n` +
                        `👤 From: @${sender.split('@')[0]}\n` +
                        `💬 Group: ${groupMeta.subject || groupId}\n` +
                        `🕒 Time: ${time}\n\n`;

      // Send text if available
      if (original.message.conversation || original.message.extendedTextMessage?.text) {
        const text = original.message.conversation || original.message.extendedTextMessage?.text;
        await sock.sendMessage(ownerJid, { text: messageText + text, mentions: [sender] });
      }

      // Handle media
      const mediaTypes = ['imageMessage','videoMessage','audioMessage','documentMessage','stickerMessage'];
      for (const type of mediaTypes) {
        if (original.message[type]) {
          const media = original.message[type];
          const buffer = await sock.downloadMediaMessage({ message: { [type]: media } }).catch(() => null);
          if (!buffer) continue;

          // Save temp file
          const extMap = {
            imageMessage: '.jpg',
            videoMessage: '.mp4',
            audioMessage: '.mp3',
            documentMessage: media.fileName?.includes('.') ? '' : '.bin',
            stickerMessage: '.webp'
          };
          const ext = extMap[type] || '.bin';
          const tmpPath = path.join(__dirname, '..','..','tmp', `${Date.now()}${ext}`);
          fs.mkdirSync(path.dirname(tmpPath), { recursive: true });
          fs.writeFileSync(tmpPath, buffer);

          // Forward to owner inbox
          await sock.sendMessage(ownerJid, {
            caption: messageText,
            [type.replace('Message','')]: fs.readFileSync(tmpPath)
          });

          // Cleanup
          fs.unlinkSync(tmpPath);
        }
      }

    } catch (error) {
      console.error('Anti-Delete Handler Error:', error.message);
    }
  }
};