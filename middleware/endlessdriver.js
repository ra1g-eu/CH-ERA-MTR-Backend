module.exports = {
    isCorrectHeader: (req, res, next) => {
        if(req.header('App-Request-Header') === 'EndlessDriver/REQUEST/LEADERBOARD/1.0'){
            next();
        } else {
            return res.status(403).send({
                status: 'error',
                message: 'Forbidden access.'
            });
        }
    },
};