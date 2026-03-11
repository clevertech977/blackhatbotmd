const axios = require('axios');
const PhoneNumber = require('awesome-phonenumber');

module.exports = {
  name: 'getpp',
  aliases: ['gp', 'getpic'],
  category: 'general',
  description: 'Get profile picture of a user',
  usage: '.getpp (reply, tag, or type number)',
  
  async execute(sock, msg, args, extra) {
    try {
      let targetUser = null;

      // 1️⃣ Reply
      const quotedMessage = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      if (quotedMessage) {
        targetUser = msg.message.extendedTextMessage.contextInfo.participant;
      }

      // 2️⃣ Mention/tag
      const mentionedJid = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
      if (!targetUser && mentionedJid && mentionedJid.length > 0) {
        targetUser = mentionedJid[0];
      }

      // 3️⃣ Typed number (handle spaces)
      if (!targetUser && args.length > 0) {
        let rawNumber = args.join('').replace(/\D/g, ''); // remove all non-digit chars
        if (!rawNumber.startsWith('+' ) && rawNumber.length <= 12) {
          rawNumber = '+' + rawNumber; // assume international format if missing +
        }

        const pn = new PhoneNumber(rawNumber);
        if (pn.isValid()) {
          const e164 = pn.getNumber('e164'); // +2557xxxxxxx
          targetUser = e164.replace('+', '') + '@s.whatsapp.net';
        } else {
          return extra.reply('❌ Invalid phone number.');
        }
      }

      // 4️⃣ Fallback: sender
      if (!targetUser) targetUser = extra.sender;

      // 5️⃣ Get profile picture
      let ppUrl = '';
      try {
        ppUrl = await sock.profilePictureUrl(targetUser, 'image');
      } catch {
        ppUrl = 'https://img.pyrocdn.com/dbKUgahg.png'; // fallback image
      }

      const response = await axios.get(ppUrl, { responseType: 'arraybuffer' });
      const buffer = Buffer.from(response.data);

      // 6️⃣ Caption
      const caption = `👤 Profile picture of @${targetUser.split('@')[0]}`;

      // 7️⃣ Send as forwarded-style message
      await sock.sendMessage(extra.from, {
        image: buffer,
        caption,
        mentions: [targetUser],
        contextInfo: {
          forwardingScore: 999,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: '120363422524788798@newsletter',
            newsletterName: '𝐛𝐥𝐚𝐜𝐤 𝐡𝐚𝐭 𝐛𝐨𝐭 𝐦𝐝'
          }
        }
      }, { quoted: msg });

    } catch (error) {
      console.error(error);
      await extra.reply('❌ Could not fetch profile picture.');
    }
  }
};