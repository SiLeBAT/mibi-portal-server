// core
import * as fs from 'fs';

// npm
import * as handlebars from 'handlebars';
import * as nodemailer from 'nodemailer';

// local
import { mailConfig } from './../config/config';

const fromAddress = mailConfig.fromAddress;
const replyToAddress = mailConfig.replyToAddress;
const host = 'localhost';
const port = 25;

function sendMail(templateData, templateFile, toAddress, subject) {
  let template = handlebars.compile(templateFile);
  let result = template(templateData);

  const transporter = nodemailer.createTransport({
    host: host,
    port: port,
    tls: {
      rejectUnauthorized: false
    }
  });

  const mailOptions = {
    from: fromAddress,
    replyTo: replyToAddress,
    to: toAddress,
    subject: subject,
    html: result
  }

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('error sending mail: ', error);
    } else {
      console.log('Email sent: ', info.response);
    }
  });

}

export {
  sendMail
}

