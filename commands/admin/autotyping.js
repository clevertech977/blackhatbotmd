/**
 * AutoTyping Command - Global toggle for all chats
 */

const fs = require('fs');
const path = require('path');

// Config path
const configPath = path.join(__dirname, '..', 'data', 'autotyping.json');

// Init config if not exists
function initConfig() {
    const dir = path.dirname(configPath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    if (!fs.existsSync(configPath)) {
        fs.writeFileSync(configPath, JSON.stringify({ enabled: false }, null, 2));
    }

    return JSON.parse(fs.readFileSync(configPath));
}

// -------------------------
// Command: .autotyping on/off
// -------------------------
module.exports = {
    name: 'autotyping',
    aliases: ['typing'],
    category: 'admin',
    description: 'Enable or disable auto-typing globally',
    usage: '.autotyping on/off',
    adminOnly: true, // anyone can use
    groupOnly: false,
    botAdminNeeded: false,

    async execute(sock, msg, args, extra) {
        try {
            const config = initConfig();
            const action = args[0]?.toLowerCase();

            if (!action || !['on','off','enable','disable'].includes(action)) {
                return await extra.reply('❌ Invalid option! Use: .autotyping on/off');
            }

            config.enabled = action === 'on' || action === 'enable';
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

            await extra.reply(`✅ Auto-typing has been ${config.enabled ? 'enabled' : 'disabled'} globally!`);

        } catch (error) {
            console.error('Error toggling autotyping:', error);
            await extra.reply('❌ Failed to toggle auto-typing!');
        }
    }
};

// -------------------------
// Functions to use anywhere
// -------------------------
module.exports.handleAutotypingForMessage = async function(sock, chatId, userMessage) {
    const config = initConfig();
    if (!config.enabled) return false;

    try {
        await sock.presenceSubscribe(chatId);
        await sock.sendPresenceUpdate('available', chatId);
        await new Promise(r => setTimeout(r, 500));

        await sock.sendPresenceUpdate('composing', chatId);
        const delay = Math.max(3000, Math.min(8000, (userMessage?.length || 10) * 150));
        await new Promise(r => setTimeout(r, delay));

        await sock.sendPresenceUpdate('paused', chatId);
        return true;
    } catch (e) {
        console.error('Error showing typing:', e);
        return false;
    }
};

module.exports.showTypingAfterCommand = async function(sock, chatId) {
    const config = initConfig();
    if (!config.enabled) return false;

    try {
        await sock.presenceSubscribe(chatId);
        await sock.sendPresenceUpdate('composing', chatId);
        await new Promise(r => setTimeout(r, 1000));
        await sock.sendPresenceUpdate('paused', chatId);
        return true;
    } catch (e) {
        console.error('Error post-command typing:', e);
        return false;
    }
};