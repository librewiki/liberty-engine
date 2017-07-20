'use strict';

const nodemailer = require('nodemailer');
const models = require('./models');

// mailOptions = {
//     from: 'ASDF <asdf@gmail.com>',
//     to: 'qwer@gmail.com',
//     subject: 'EXAMPLE',
//     text: 'EXMAMPLE '
// };

module.exports = (mailOptions) => {
  const mailConfig = models.Setting.get('mail');
  if (!mailConfig) {
    throw Error('No mail config');
  }

  const transporter = nodemailer.createTransport({
    host: mailConfig.host,
    port: mailConfig.port,
    secure: mailConfig.secure,
    auth: {
      user: mailConfig.user,
      pass: mailConfig.password,
    },
  });

  return transporter.sendMail(mailOptions);
};
