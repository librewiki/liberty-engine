'use strict';

process.env.NTBA_FIX_319 = 1;

const _ = require('lodash');
const TelegramBot = require('node-telegram-bot-api');
const models = require('../../lib/models');

const env = process.env.NODE_ENV || 'development';
const config = require('../../config/config.json')[env];

if (config['notifier-telegram'] && config['notifier-telegram'].token) {
  const bot = new TelegramBot(config['notifier-telegram'].token, { polling: true });

  bot.onText(/\/start/, async (msg) => {
    const chatIds = models.Setting.get('notifier-telegram:chatIds') || [];
    chatIds.push(msg.chat.id);
    await models.Setting.set('notifier-telegram:chatIds', _.uniq(chatIds));
    bot.sendMessage(msg.chat.id, '등록되었습니다.');
  });


  const notifier = {
    async send(data) {
      const chatIds = models.Setting.get('notifier-telegram:chatIds') || [];
      await Promise.all(chatIds.map(id => bot.sendMessage(id, data.message)));
    },
  };

  module.exports.import = (helper) => {
    helper.addNotifier(notifier);
  };
} else {
  module.exports.import = () => {};
}

