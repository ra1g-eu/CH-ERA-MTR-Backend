const jwt = require('jsonwebtoken');
const validator = require("email-validator");
module.exports = {
    validateRegister: (req, res, next) => {
        // username min length 3
        if (!req.body.username || req.body.username.length < 3) {
            console.log(req.body);
            return res.status(400).send({
                status: 'error',
                message: 'Please enter a username with min. 3 chars.'
            });
        }
        // password min 6 chars
        if (!req.body.userpassword || req.body.userpassword.length < 5) {
            return res.status(400).send({
                status: 'error',
                message: 'Please enter a password with min. 6 chars.'
            });
        }
        // password (repeat) does not match
        if (
            !req.body.userpassword_repeat ||
            req.body.userpassword != req.body.userpassword_repeat
        ) {
            return res.status(400).send({
                status: 'error',
                message: 'Both passwords must match.'
            });
        }
        if (!req.body.useremail || !validator.validate(req.body.useremail)) {
            return res.status(400).send({
                status: 'error',
                message: 'Invalid email address.'
            });
        }
        next();
    },
    isLoggedIn: (req, res, next) => {
        try {
            const token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(
                token,
                'f611d149-0a77-46a9-91c8-e106bedd2116'
            );
            req.userData = decoded;
            next();
        } catch (err) {
            return res.status(401).send({
                status: 'error',
                message: 'Your session is not valid!'
            });
        }
    },
    ifTokenExists: (req, res, next) => {
        try {
            const token = req.headers.authorization.split(' ')[1];
            jwt.verify(
                token,
                'f611d149-0a77-46a9-91c8-e106bedd2116'
            );
            return res.status(401).send({
                status: 'error',
                message: 'You are already logged in!'
            });
        } catch (err) {
            next();
        }
    },
};