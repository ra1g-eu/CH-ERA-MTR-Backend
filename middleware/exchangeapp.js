module.exports = {
    isCorrectHeader: (req, res, next) => {
        if(req.header('App-Request-Header') === 'ExchangeRatesApp/REQ/ERA/1.0.0'){
            next();
        } else {
            return res.status(403).send({
                status: 'error',
                message: 'Forbidden access.'
            });
        }
    }
};