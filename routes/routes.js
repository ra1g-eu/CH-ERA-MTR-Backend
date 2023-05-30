const express = require('express');
const router = express.Router();
const controller = module.require('../controller.js')

const userMiddleware = require('../middleware/users.js');
const tanksMiddleware = require('../middleware/tanks');

const theModernMiddleware = require('../middleware/themodern');
const theModernController = module.require('../themodern_controller.js');

const ffSchedulerController = module.require('../ffscheduler_controller.js');

const exchangeMiddleware = require('../middleware/exchangeapp');
const cardHubMiddleware = require('../middleware/cardhub');
const radiorpiMiddleware = require('../middleware/radiorpi');
const endlessDriverMiddleware = require('../middleware/endlessdriver');
const multer = require('multer');
const cors = require("cors");
const imageStorage = multer.diskStorage({
    // Destination to store image
    destination: 'cardhub_uploads/cards/',
    filename: (req, file, cb) => {
        cb(null,  Date.now() + '_' +file.originalname.replace(/#/g, ''));
        // file.fieldname is name of the field (image)
        // path.extname get the uploaded file extension
    }
});
const imageUpload = multer({
    storage: imageStorage,
    limits: {
        fileSize: 5000000 // 1000000 Bytes = 1 MB
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(png|jpg|jpeg)$/)) {
            // upload only png and jpg format
            return cb(new Error('Nahrať môžeš len obrázok (png, jpg, jpeg).'))
        }
        cb(undefined, true)
    }
});
const imageOrCode = (req, res, next) => {
    if(req.body.cardManualCode != '--') {
        imageUpload.single('file');
    } else {
        next();
    }
}

//ROUTES
router.get('/', function(req, res, next) {
    res.send(401);
});

/*
Radio RPi API routes
 */
router.get('/fetchRadios', radiorpiMiddleware.isCorrectHeader, controller.saveRadios);
router.get('/getAllRadios', controller.getAllRadios);
router.get('/getRadiosByCountry/:name', controller.getRadiosByCountry);
router.get('/getSpecificRadio/:id', controller.getSpecificRadio);

/*
Test routes
 */
router.post('/saveArticle', controller.saveArticle);
router.get('/getArticle/:id', controller.getArticleById);


/*
MyTankRank.ink API routes
 */
router.post('/api/mtr/login', tanksMiddleware.isCorrectHeader, userMiddleware.ifTokenExists, controller.loginUser);
router.post('/api/mtr/register', tanksMiddleware.isCorrectHeader, userMiddleware.ifTokenExists, userMiddleware.validateRegister, controller.registerUser);
router.get('/api/mtr/verify/:userId/:token', controller.verifyEmail);
router.post('/api/mtr/searchTanks', tanksMiddleware.isCorrectHeader, userMiddleware.isLoggedIn, tanksMiddleware.containsIllegalCharacters, tanksMiddleware.isPremiumSpoofed, controller.searchTanks);
router.post('/api/mtr/pushLastNotification', tanksMiddleware.isCorrectHeader, userMiddleware.isLoggedIn, controller.pushLastNotification);
router.get('/api/mtr/browseRankings', tanksMiddleware.isCorrectHeader, controller.browseRankings);
router.post('/api/mtr/addToGarage', tanksMiddleware.isCorrectHeader, userMiddleware.isLoggedIn, controller.addToGarage);
router.get('/api/mtr/loadTanksFromGarage', tanksMiddleware.isCorrectHeader, userMiddleware.isLoggedIn, controller.loadFromGarage);
router.post('/api/mtr/removeTankFromGarage', tanksMiddleware.isCorrectHeader, userMiddleware.isLoggedIn, controller.removeTankFromGarage);
router.put('/api/mtr/saveNewRanking', tanksMiddleware.isCorrectHeader, userMiddleware.isLoggedIn, controller.saveNewRanking);
router.get('/api/mtr/generateShareLink', tanksMiddleware.isCorrectHeader, userMiddleware.isLoggedIn, controller.generateShareLink);
router.get('/api/mtr/getTanksFromSharedLink/:sharecode', tanksMiddleware.isCorrectHeader, controller.getTanksFromSharedLink);
router.get('/api/mtr/checkIfAdmin', userMiddleware.isLoggedIn, controller.checkIfAdmin);

/*
ExchangeRatesApp API routes
 */
//router.get('/api/exchange/getConversionRate/:cfrom/:cto', exchangeMiddleware.isCorrectHeader, controller.getConversionRates);
router.get('/api/exchange/getAllConversionRates', exchangeMiddleware.isCorrectHeader, controller.getAllConversionRates);

/*
CardHub API routes
 */
router.get('/api/cardhub/enterSystemWithCode/:syscode/:suffix', cardHubMiddleware.isCorrectHeader, cardHubMiddleware.ifTokenExists, controller.loginAndReturnCards);
router.get('/api/cardhub/logOut/:syscode/:suffix', cardHubMiddleware.isCorrectHeader, cardHubMiddleware.ifTokenExists, controller.logoutWithCode);
router.get('/api/cardhub/getCards/:syscode/:suffix', cardHubMiddleware.isCorrectHeader, cardHubMiddleware.ifTokenExists, controller.getCardsWithCode);
router.get('/api/cardhub/removeCardWithCode/:syscode/:suffix/:carduuid', cardHubMiddleware.isCorrectHeader, cardHubMiddleware.ifTokenExists, controller.removeCardWithCode);
router.options('/api/cardhub/uploadCardWithCode/', cors());
router.post('/api/cardhub/uploadCardWithCode/', imageUpload.single('file'), cardHubMiddleware.isCorrectHeader, cardHubMiddleware.ifTokenExists, controller.saveNewCardWithCode);
router.get('/api/cardhub/getShops/', cardHubMiddleware.isCorrectHeader, cardHubMiddleware.ifTokenExists, controller.getShopsWithCode);
router.options('/api/cardhub/registerNewAccount/', cors());
router.post('/api/cardhub/registerNewAccount/', cardHubMiddleware.isCorrectHeader, controller.registerNewAccount);
router.options('/api/cardhub/editCard/', cors());
router.post('/api/cardhub/editCard/', cardHubMiddleware.isCorrectHeader, cardHubMiddleware.ifTokenExists, controller.editCardWithCode);


/*
EndlessDriver API routes
 */
router.get('/api/endlessdriver/getLeaderboard', endlessDriverMiddleware.isCorrectHeader, controller.getLeaderboard);
router.post('/api/endlessdriver/savePlayerScore', endlessDriverMiddleware.isCorrectHeader, controller.savePlayerScore);

/*
TheModern API routes
 */
router.post('/api/themodern/login', theModernMiddleware.isCorrectHeader, userMiddleware.ifTokenExists, theModernController.userLogin);
router.post('/api/themodern/register', theModernMiddleware.isCorrectHeader, userMiddleware.ifTokenExists, userMiddleware.validateRegister, theModernController.userRegister);
router.get('/api/themodern/verify/:playerId/:token', theModernController.verifyEmail);
router.get('/api/themodern/getallgameitems', theModernMiddleware.isCorrectHeader, userMiddleware.isLoggedIn, theModernController.allItems);
router.get('/api/themodern/getplayerinfo', theModernMiddleware.isCorrectHeader, userMiddleware.isLoggedIn, theModernController.getPlayerInfo);
router.post('/api/themodern/buyitemfromshop', theModernMiddleware.isCorrectHeader, userMiddleware.isLoggedIn, theModernController.buyItemFromShopController);
router.get('/api/themodern/getplayerinventory', theModernMiddleware.isCorrectHeader, userMiddleware.isLoggedIn, theModernController.getPlayerInventoryController);
router.get('/api/themodern/fillxptable', theModernController.fillXpTableController);
router.get('/api/themodern/getplayerxp', theModernMiddleware.isCorrectHeader, userMiddleware.isLoggedIn, theModernController.getPlayerXPController);

/*
FFScheduler API routes
 */
router.get('/api/ffscheduler/getschedule/:worldId',ffSchedulerController.getSchedule);
router.post('/api/ffscheduler/saveschedule', ffSchedulerController.saveSchedule);

module.exports = router;