"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const nodemailer = __importStar(require("nodemailer"));
const handlebars = __importStar(require("handlebars"));
const fs = __importStar(require("fs"));
const mail_json_1 = require("../config/mail.json");
async function sendEmail(filePath, replacements, email, subject, url) {
    const source = fs.readFileSync(filePath, 'utf-8').toString();
    const template = handlebars.compile(source);
    const htmlToSend = template(replacements);
    const transporter = nodemailer.createTransport({
        host: mail_json_1.host,
        port: mail_json_1.port,
        auth: { user: mail_json_1.user, pass: mail_json_1.pass }
    });
    const mailOptions = {
        from: mail_json_1.from,
        to: email,
        subject: subject,
        text: url,
        html: htmlToSend
    };
    const info = await transporter.sendMail(mailOptions);
    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", "https://mailtrap.io/inboxes/1068413/messages/");
}
exports.sendEmail = sendEmail;
//# sourceMappingURL=mailer.js.map