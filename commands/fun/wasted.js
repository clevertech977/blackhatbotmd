const axios = require('axios');
const { channelInfo } = require('../../lib/messageConfig'); // adjust path if needed

module.exports = {
  name: 'wasted',
  aliases: ['wst', 'rip'],
  category: 'fun',
  desc: 'Make someone look WASTED 💀',
  usage: '.wasted @user or reply',

  async exec(sock, message, args, extra) {
    const chatId = extra.from;

    let userToWaste;

    // 1️⃣ Check mentioned user
    if (message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
      userToWaste = message.message.extendedTextMessage.contextInfo.mentionedJid[0];
    }
    // 2️⃣ Check replied user
    else if (message.message?.extendedTextMessage?.contextInfo?.participant) {
      userToWaste = message.message.extendedTextMessage.contextInfo.participant;
    }

    if (!userToWaste) {
      return await extra.reply('⚠️ Please mention someone or reply to their message to use `.wasted`!');
    }

    try {
      // 3️⃣ Get profile picture
      let profilePic;
      try {
        profilePic = await sock.profilePictureUrl(userToWaste, 'image');
      } catch {
        profilePic = 'https://i.imgur.com/2wzGhpF.jpeg'; // fallback
      }

      // 4️⃣ Call Wasted API
      const wastedResponse = await axios.get(
        `https://some-random-api.com/canvas/overlay/wasted?avatar=${encodeURIComponent(profilePic)}`,
        { responseType: 'arraybuffer' }
      );

      // 5️⃣ Send image back
      await sock.sendMessage(chatId, {
        image: Buffer.from(wastedResponse.data),
        caption: `⚰️ *Wasted* : ${userToWaste.split('@')[0]} 💀\n\nRest in pieces!`,
        mentions: [userToWaste],
        ...channelInfo
      }, { quoted: message });

    } catch (err) {
      console.error('Wasted command error:', err);
      await extra.reply('❌ Failed to generate wasted image! Try again later.');
    }
  }
};