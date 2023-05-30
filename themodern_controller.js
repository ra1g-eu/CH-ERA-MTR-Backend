const model = module.require('./themodern_api.js')

//get player XP
const getPlayerXPController = (req, res) => {
    const data = {
        'player_playerid': req.userData.playerId
    }
    model.getPlayerXP([data], (err, results) => {
        if (err) {
            res.status(409).send({status: 'error', message: err});
        } else {
            res.status(201).send({status: 'success', message: results});
        }
    });
}

//fill xp table
const fillXpTableController = (req, res) => {
    model.fillXpTable((err, results) => {
        if (err) {
            res.status(409).send({status: 'error', message: err});
        } else {
            res.status(201).send({status: 'success', message: results});
        }
    });
}

//get player's inventory
const getPlayerInventoryController = (req, res) => {
    const data = {
        'player_playerid': req.userData.playerId,
    }
    model.getPlayerInventory([data], (err, results) => {
        if (err) {
            res.status(409).send({status: 'error', message: err});
        } else {
            res.status(201).send({status: 'success', message: results});
        }
    });
}

//buy item from shop
const buyItemFromShopController = (req, res) => {
    const data = {
        'player_playerid': req.userData.playerId,
        'item_id': req.body.item_id,
        'amount': 1,
    }
    console.log(data);
    model.buyItemFromShop([data], (err, results) => {
        if (err) {
            res.status(409).send({status: 'error', message: err});
        } else {
            res.status(201).send({status: 'success', message: results});
        }
    })
}

//get player info
const getPlayerInfo = (req, res) => {
    const data = {'playerId': req.userData.playerId};
    model.getPlayerInfo([data], (err, results) => {
        if (err) {
            res.status(409).send({status: 'error', message: err});
        } else {
            res.status(201).send({status: 'success', message: results});
        }
    });
}

//get all ingame items
const allItems = (req, res) => {
    model.getAllGameItems((err, results) => {
        if (err) {
            res.status(409).send({status: 'error', message: err});
        } else {
            res.status(201).send({status: 'success', message: results});
        }
    });
}

//player verified email
const verifyEmail = (req, res) => {
    const data = {'playerId': req.params.userId, 'token': req.params.token};
    model.verifyEmail([data], (err, results) => {
        if (err) {
            res.status(409).send({status: 'error', message: err});
        } else {
            res.status(201).send({status: 'success', message: results});
        }
    });
}
// player login
const userLogin = (req, res) => {
    const data = {'username': req.body.username, 'userpassword': req.body.userpassword};
    model.userLogIn([data], (err, results) => {
        if (err) {
            res.status(409).send({status: 'error', message: err});
        } else {
            res.status(201).send({status: 'success', message: results});
        }
    });
}

// player registered
const userRegister = (req, res) => {
    const data = {
        'username': req.body.username,
        'userpassword': req.body.userpassword,
        'useremail': req.body.useremail
    };
    model.userRegister([data], (err, results) => {
        if (err) {
            res.status(409).send({status: 'error', message: err});
        } else {
            res.status(201).send({status: 'success', message: results});
        }
    });
}

module.exports = {
    userLogin,
    userRegister,
    verifyEmail,
    allItems,
    getPlayerInfo,
    buyItemFromShopController,
    getPlayerInventoryController,
    fillXpTableController,
    getPlayerXPController
}