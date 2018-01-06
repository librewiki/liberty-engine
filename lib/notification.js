'use strict';

const notifiers = [];

module.exports.notifiers = notifiers;
module.exports.send = async (data) => {
  await Promise.all(notifiers.map(n => n.send(data)));
};
