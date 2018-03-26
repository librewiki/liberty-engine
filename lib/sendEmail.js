'use strict';

const nodemailer = require('nodemailer');
const models = require('./models');

// mailOptions = {
//     from: 'ASDF <asdf@gmail.com>',
//     to: 'qwer@gmail.com',
//     subject: 'EXAMPLE',
//     text: 'EXMAMPLE '
// };

const mailers = {
  smtp({
    from, to, subject, text, emailConfig,
  }) {
    const transporter = nodemailer.createTransport({
      host: emailConfig.host,
      port: emailConfig.port,
      secure: emailConfig.secure,
      auth: {
        user: emailConfig.user,
        pass: emailConfig.password,
      },
    });

    return transporter.sendMail({
      from, to, subject, text,
    });
  },
};

module.exports = async ({
  from, to, subject, text,
}) => {
  const emailConfig = models.Setting.get('email');
  if (!emailConfig) {
    throw Error('No mail config');
  }
  return mailers.smtp({
    from, to, subject, text, emailConfig,
  });
};
