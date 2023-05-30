module.exports = {
    isCorrectHeader: (req, res, next) => {
        if(req.header('App-Request-Header') === 'CardHub/REQ/CH/1.0.0'){
            next();
        } else {
            return res.status(403).send({
                status: 'error',
                message: 'Forbidden access.'
            });
        }
    },
    ifTokenExists: (req, res, next) => {
        try {
            const token = req.headers.authorization.split(' ')[1];
            if(token !== ''){
                next();
            } else {
                return res.status(401).send({
                    status: 'error',
                    message: 'You are already logged in!'
                });
            }
        } catch (err) {
            return res.status(403).send({
                status: 'error',
                message: 'Forbidden access.'
            });
        }
    },
};