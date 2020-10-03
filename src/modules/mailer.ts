import * as nodemailer from 'nodemailer';
import * as handlebars from 'handlebars';
import * as fs from 'fs';

import {from, host, pass, port, user} from "../config/mail.json";

export async function sendEmail(filePath: string, replacements: object, email: string, subject: string, url?: string) {
    const source = fs.readFileSync(filePath, 'utf-8').toString();
    const template = handlebars.compile(source);
    const htmlToSend = template(replacements);
    const transporter = nodemailer.createTransport({
        host,
        port,
        auth: {user, pass}
    });
    const mailOptions = {
        from: from,
        to: email,
        subject: subject,
        text: url,
        html: htmlToSend
    };
    const info = await transporter.sendMail(mailOptions);
    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", "https://mailtrap.io/inboxes/1068413/messages/");
}
