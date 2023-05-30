const nodemailer = require("nodemailer");

let transporter = nodemailer.createTransport({
    host: '',
    port: 587,
    secure: false,
    auth: {
        user: '',
        pass: '',
    },
    tls: {
        rejectUnauthorized: false,
    },
});

module.exports = {
    async sendOptInMail(email, userId, token) {
        let activationLink = `https://mytankrank.ink/verify/${userId}/${token}`;
        let mail = {
            from: '',
            to: email,
            subject: " - activate your account",
            text: `To activate your account, please click this link: ${activationLink}`,
            html: `<h2>Verify your new account</h2><br><p>To activate your account, please click this link: <a href="${activationLink}">${activationLink}</a></p><br><br><p>This email was sent because someone registered with this email address on .</p><p>If this was not you please ignore this email or contact  and mention this email.</p><br><br><p> - 2022</p>`,
        };
        await transporter.sendMail(mail);

        let mailSelf = {
            from: '',
            to: '',
            subject: ' - new user registered - '+ email,
            text: 'New user '+ email + ' with user ID <strong>'+userId+'</strong> registered on  at time '+Date.now().toLocaleString()+'.'
        };
        await transporter.sendMail(mailSelf);
    },
};