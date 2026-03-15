const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');

async function getQuotedOrOwnImage(message) {
    const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    let imageMessage = quoted?.imageMessage || message.message?.imageMessage;
    if (!imageMessage) return null;

    const stream = await downloadContentFromMessage(imageMessage, 'image');
    const chunks = [];
    for await (const chunk of stream) chunks.push(chunk);
    return Buffer.concat(chunks);
}

module.exports = {
    name: 'removebg',
    alias: ['rmbg', 'nobg'],
    category: 'admin',
    desc: 'Remove background from images',
    async execute(sock, message, args, extra) {
        const chatId = message.key.remoteJid;

        try {
            let imageBuffer = await getQuotedOrOwnImage(message);

            if (!imageBuffer) {
                return await sock.sendMessage(chatId, {
                    text: '📸 Reply to an image with `.removebg`'
                }, { quoted: message });
            }

            const formData = new FormData();
            formData.append('image_file', imageBuffer, {
                filename: 'image.png'
            });

            const response = await axios.post(
                'https://api.remove.bg/v1.0/removebg',
                formData,
                {
                    headers: {
                        ...formData.getHeaders(),
                        'X-Api-Key': 'SbjibtuwvtFPyf9Vvv1bUog9'
                    },
                    responseType: 'arraybuffer'
                }
            );

            const resultBuffer = Buffer.from(response.data);

            await sock.sendMessage(chatId, {
                image: resultBuffer,
                caption: '✨ Background removed successfully!\n\n_*𝗣𝗥𝗢𝗖𝗘𝗦𝗦𝗘𝗗 𝗕𝗬 𝑩𝑳𝑨𝑪𝑲 𝑯𝑨𝑻*_'
            }, { quoted: message });

        } catch (error) {
            console.error('RemoveBG Error:', error.response?.data || error.message);

            await sock.sendMessage(chatId, {
                text: '❌ Failed to remove background.\nCheck API key or image format.'
            }, { quoted: message });
        }
    }
};
