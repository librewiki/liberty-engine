'use strict';

const nodemailer = require('nodemailer');
const models = require('./models');

// mailOptions = {
//     from: 'ASDF <asdf@gmail.com>',
//     to: 'qwer@gmail.com',
//     subject: 'EXAMPLE',
//     text: 'EXMAMPLE '
// };

module.exports = (emailOptions) => {
  const emailConfig = models.Setting.get('email');
  if (!emailConfig) {
    throw Error('No mail config');
  }
  const transporter = nodemailer.createTransport({
    host: emailConfig.host,
    port: emailConfig.port,
    secure: emailConfig.secure,
    auth: {
      user: emailConfig.user,
      pass: emailConfig.password,
    },
  });

  return transporter.sendMail(emailOptions);
};
