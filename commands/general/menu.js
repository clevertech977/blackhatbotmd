/**
 * Menu Command - Display all available commands
 */

const config = require('../../config');
const { loadCommands } = require('../../utils/commandLoader');

module.exports = {
  name: 'menu',
  aliases: ['help', 'commands'],
  category: 'general',
  description: 'Show all available commands',
  usage: '.menu',
  
  async execute(sock, msg, args, extra) {
    try {
      const commands = loadCommands();
      const categories = {};

      // Group commands by category
      commands.forEach((cmd, name) => {
        if (cmd.name === name) { // Only main command names
          if (!categories[cmd.category]) categories[cmd.category] = [];
          categories[cmd.category].push(cmd);
        }
      });

      // Owner info
      const ownerNames = Array.isArray(config.ownerName) ? config.ownerName : [config.ownerName];
      const displayOwner = ownerNames[0] || 'Bot Owner';

      // 1️⃣ Premium check
      const premiumNumber = config.ownerNumber; // premium number
      const senderNumber = extra.sender.split('@')[0];
      const isPremium = senderNumber === premiumNumber;
      const premiumText = isPremium ? '💎 You are a Premium user' : '❌ You are not Premium';

      // 2️⃣ Menu header
      let menuText = `╭━━『 *${config.botName || 'Bot'}* 』━━╮\n\n`;
      menuText += `👋 Hello @${senderNumber}!\n`;
      menuText += `${premiumText}\n\n`; // show premium status
      menuText += `⚡ Prefix: ${config.prefix || '.'}\n`;
      menuText += `📦 Total Commands: ${commands.size}\n`;
      menuText += `👑 Owner: ${displayOwner}\n\n`;

      // General Commands
      if (categories.general) {
        menuText += `╭━━━━━━━━━━━━━━━❍\n`;
        menuText += `┃ 🧭 GENERAL COMMAND\n`;
        menuText += `╰━━━━━━━━━━━━━━━⬣\n`;
        categories.general.forEach(cmd => {
          menuText += `│ ➜ ${config.prefix}${cmd.name}\n`;
        });
        menuText += `\n`;
      }
      
      // AI Commands
      if (categories.ai) {
        menuText += `╭━━━━━━━━━━━━━━━❍\n`;
        menuText += `┃ 🤖 AI COMMAND\n`;
        menuText += `╰━━━━━━━━━━━━━━━⬣\n`;
        categories.ai.forEach(cmd => {
          menuText += `│ ➜ ${config.prefix}${cmd.name}\n`;
        });
        menuText += `\n`;
      }
      
      // Group Commands
      if (categories.group) {
        menuText += `╭━━━━━━━━━━━━━━━❍\n`;
        menuText += `┃ 🔵 GROUP COMMAND\n`;
        menuText += `╰━━━━━━━━━━━━━━━⬣\n`;
        categories.group.forEach(cmd => {
          menuText += `│ ➜ ${config.prefix}${cmd.name}\n`;
        });
        menuText += `\n`;
      }
      

      // Admin Commands (premium only)
      if (categories.admin) {
        if (isPremium) {
          menuText += `╭━━━━━━━━━━━━━━━❍\n`;
          menuText += `┃ 🛡️ ADMIN COMMAND\n`;
          menuText += `╰━━━━━━━━━━━━━━━⬣\n`;
          categories.admin.forEach(cmd => {
            menuText += `│ ➜ ${config.prefix}${cmd.name}\n`;
          });
          menuText += `\n`;
        } else {
          menuText += `⚠️ Admin commands are for Premium users only.\n\n`;
        }
      }
      
      // Owner Commands (premium only)
      if (categories.owner) {
        if (isPremium) {
          menuText += `╭━━━━━━━━━━━━━━━❍\n`;
          menuText += `┃ 👑 OWNER COMMAND\n`;
          menuText += `╰━━━━━━━━━━━━━━━⬣\n`;
          categories.owner.forEach(cmd => {
            menuText += `│ ➜ ${config.prefix}${cmd.name}\n`;
          });
          menuText += `\n`;
        } else {
          menuText += `⚠️ Owner commands are for Premium users only.\n\n`;
        }
      }
      
      // Media Commands
      if (categories.media) {
        menuText += `╭━━━━━━━━━━━━━━━❍\n`;
        menuText += `┃ 🎞️ MEDIA COMMAND\n`;
        menuText += `╰━━━━━━━━━━━━━━━⬣\n`;
        categories.media.forEach(cmd => {
          menuText += `│ ➜ ${config.prefix}${cmd.name}\n`;
        });
        menuText += `\n`;
      }
      
      // Fun Commands
      if (categories.fun) {
        menuText += `╭━━━━━━━━━━━━━━━❍\n`;
        menuText += `┃ 🎭 FUN COMMAND\n`;
        menuText += `╰━━━━━━━━━━━━━━━⬣\n`;
        categories.fun.forEach(cmd => {
          menuText += `│ ➜ ${config.prefix}${cmd.name}\n`;
        });
        menuText += `\n`;
      }
      
      // Utility Commands
      if (categories.utility) {
        menuText += `╭━━━━━━━━━━━━━━━❍\n`;
        menuText += `┃ 🔧 UTILITY COMMAND\n`;
        menuText += `╰━━━━━━━━━━━━━━━⬣\n`;
        categories.utility.forEach(cmd => {
          menuText += `│ ➜ ${config.prefix}${cmd.name}\n`;
        });
        menuText += `\n`;
      }

       // Anime Commands
       if (categories.anime) {
        menuText += `╭━━━━━━━━━━━━━━━❍\n`;
        menuText += `┃ 👾 ANIME COMMAND\n`;
        menuText += `╰━━━━━━━━━━━━━━━⬣\n`;
        categories.anime.forEach(cmd => {
          menuText += `│ ➜ ${config.prefix}${cmd.name}\n`;
        });
        menuText += `\n`;
      }

       // Textmaker Commands
       if (categories.utility) {
        menuText += `╭━━━━━━━━━━━━━━━❍\n`;
        menuText += `┃ 🖋️ TEXTMAKER COMMAND\n`;
        menuText += `╰━━━━━━━━━━━━━━━⬣\n`;
        categories.textmaker.forEach(cmd => {
          menuText += `│ ➜ ${config.prefix}${cmd.name}\n`;
        });
        menuText += `\n`;
      }
      
      menuText += `╰━━━━━━━━━━━━━━━━━\n\n`;
      menuText += `💡 Type ${config.prefix}help <command> for more info\n`;
      menuText += `🌟 Bot Version: 1.0.0\n`;
      
      // Send menu with image
      const fs = require('fs');
      const path = require('path');
      const imagePath = path.join(__dirname, '../../utils/bot_image.jpg');
      
      if (fs.existsSync(imagePath)) {
        // Send image with newsletter forwarding context
        const imageBuffer = fs.readFileSync(imagePath);
        await sock.sendMessage(extra.from, {
          image: imageBuffer,
          caption: menuText,
          mentions: [extra.sender],
          contextInfo: {
            forwardingScore: 1,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
              newsletterJid: config.newsletterJid || '120363422524788798@newsletter',
              newsletterName: config.botName,
              serverMessageId: -1
            }
          }
        }, { quoted: msg });
      } else {
        await sock.sendMessage(extra.from, {
          text: menuText,
          mentions: [extra.sender]
        }, { quoted: msg });
      }
      
    } catch (error) {
      await extra.reply(`❌ Error: ${error.message}`);
    }
  }
};
