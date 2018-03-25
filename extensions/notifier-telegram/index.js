'use strict';

process.env.NTBA_FIX_319 = 1;

const _ = require('lodash');
const TelegramBot = require('node-telegram-bot-api');
const models = require('../../lib/models');

let bot;

const initializeBot = () => {
  const token = models.Setting.get('notifier-telegram:token');
  bot = new TelegramBot(token, { polling: true });
  bot.onText(/\/start/, async (msg) => {
    const chatIds = models.Setting.get('notifier-telegram:chatIds') || [];
    chatIds.push(msg.chat.id);
    await models.Setting.set('notifier-telegram:chatIds', _.uniq(chatIds));
    bot.sendMessage(msg.chat.id, '등록되었습니다.');
  });
};

const notifier = {
  async send(data) {
    const chatIds = models.Setting.get('notifier-telegram:chatIds') || [];
    await Promise.all(chatIds.map(id => bot.sendMessage(id, data.message)));
  },
};

module.exports.import = (helper) => {
  initializeBot();
  helper.addNotifier(notifier);
};

const schema = require('./schema.json');

module.exports.configurator = {
  getFormSchema: async () => schema,
  getCurrentData: async () => ({
    token: models.Setting.get('notifier-telegram:token'),
  }),
  set: async ({ token }) => {
    await models.Setting.set('notifier-telegram:token', token);
    await bot.stopPolling();
    initializeBot();
  },
};
