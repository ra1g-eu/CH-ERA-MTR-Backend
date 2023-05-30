module.exports = {
    containsIllegalCharacters: (req, res, next) => {
        const specialChars = `/[!@#$%^&*()_+\=\[\]{};':"\\|,<>\/?]+/;`
        const isSpecialCharsPresent = specialChars.split('').some(char =>
            req.body.tankName.includes(char));
        if (!req.body.tankName || req.body.tankName.length <= 1 || req.body.tankName.length > 10) {
            return res.status(400).send({
                status: 'error',
                message: 'Searched tank name needs to be longer than 1 and smaller than 11 characters.'
            });
        }
        if(isSpecialCharsPresent){
            return res.status(400).send({
                status: 'error',
                message: 'Searched tank name contains illegal characters.'
            });
        }
        next();
    },
    isPremiumSpoofed: (req, res, next) => {
        const allowedNums = ['0', '1', '2'];
        if(!allowedNums.includes(req.body.isPremium)){
            return res.status(400).send({
                status: 'error',
                message: 'Please modify your search parameters, or refresh the page.'
            });
        }
        next();
    },
    isCorrectHeader: (req, res, next) => {
        if(req.header('App-Request-Header') === 'MyTankRank.ink/REQ/MTR/1.0.0'){
            next();
        } else {
            return res.status(403).send({
                status: 'error',
                message: 'Forbidden access.'
            });
        }
    }
};