const nodemailer = require("nodemailer");

let transporter = nodemailer.createTransport({
    host: 'mail.themodern.quest',
    port: 587,
    secure: false,
    auth: {
        user: 'no-reply@themodern.quest',
        pass: 'vgprSTjnQ',
    },
    tls: {
        rejectUnauthorized: false,
    },
});

module.exports = {
    async sendOptInMail(email, userId, token) {
        let activationLink = `https://themodern.quest/verify/${userId}/${token}`;
        let mail = {
            from: 'no-reply@themodern.quest',
            to: email,
            subject: "The Modern - please activate your account",
            text: `To activate your account, please click this link: ${activationLink}`,
            html: `<h2>Verify your new account and receive rewards!</h2><br><p>To activate your account, please click this link: <a href="${activationLink}">${activationLink}</a></p><br><br><p>This email was sent because someone registered with this email address on TheModern.quest.</p><p>If this was not you please ignore this email or contact help@themodern.quest and mention this email.</p><br><br><p>TheModern.quest - 2023</p>`,
        };
        await transporter.sendMail(mail);

        let mailSelf = {
            from: 'no-reply@themodern.quest',
            to: 'no-reply@themodern.quest',
            subject: 'The Modern - new user registered - '+ email,
            text: 'New user <strong>'+ email + '</strong> with user ID <strong>'+userId+'</strong> registered on TheModern.quest at time <strong>'+Date.now().toLocaleString()+'</strong>.'
        };
        await transporter.sendMail(mailSelf);
    },
};