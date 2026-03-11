/**
 * TTS - Text to Speech Command using google-tts-api
 */

const gTTS = require('google-tts-api'); // npm i google-tts-api
const axios = require('axios');

module.exports = {
  name: 'tts',
  aliases: ['speak', 'say'],
  category: 'general',
  description: 'Convert text to speech using Google TTS',
  usage: '.tts <text>',
  
  async execute(sock, msg, args, extra) {
    try {
      const chatId = extra.from;
      const text = args.join(' ');

      if (!text) {
        return extra.reply(
          '❌ Please provide text to convert to speech.\nExample: .tts hi how are you'
        );
      }

      // Generate TTS URL
      // Change lang to 'sw' for Kiswahili or any ISO language code
      const lang = 'en';
      const ttsUrl = gTTS.getAudioUrl(text, {
        lang: lang,
        slow: false,
        host: 'https://translate.google.com',
      });

      // Download audio into buffer
      const response = await axios.get(ttsUrl, { responseType: 'arraybuffer' });
      const audioBuffer = Buffer.from(response.data);

      // Send as voice note (PTT)
      await sock.sendMessage(chatId, {
        audio: audioBuffer,
        mimetype: 'audio/mpeg',
        ptt: true, // true = voice note, false = normal audio
      }, { quoted: msg });

    } catch (error) {
      console.error('TTS command error:', error);
      await extra.reply(`❌ Failed to generate speech: ${error.message}`);
    }
  }
};