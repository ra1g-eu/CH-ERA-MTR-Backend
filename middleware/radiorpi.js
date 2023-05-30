module.exports = {
    isCorrectHeader: (req, res, next) => {
        if(req.header('App-Request-Header') === 'RadioRPi/Application/VueJS/Flutter'){
            next();
        } else {
            return res.status(403).send({
                status: 'error',
                message: 'Forbidden access.'
            });
        }
    }
};