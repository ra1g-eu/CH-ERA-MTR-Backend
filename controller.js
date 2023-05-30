// Import function from Product Model
const model = module.require('./api.js')

// EndlessDriver Save Player Score
const savePlayerScore = (req, res) => {
    const data = {
        "score": req.body.score,
        "playerName": req.body.playerName,
    }
    model.savePlayerScoreDb([data],(err, results) => {
        if (err) {
            res.status(409).send({status: 'error', message: err});
        } else {
            res.status(201).send({status: 'success', message: results});
        }
    })
}


// EndlessDriver GET LEADERBOARD
const getLeaderboard = (req, res) => {
    model.getLeaderboardTopTen((err, results) => {
        if (err) {
            res.status(409).send({status: 'error', message: err});
        } else {
            res.status(201).send({status: 'success', message: results});
        }
    })
}

// Edit card notes and code
const editCardWithCode = (req, res) => {
    const data = {
        'system_code': req.headers.authorization.split(' ')[1].trim(),
        'cardDesc': req.body.cardDesc,
        'cardManualCode': req.body.cardManualCode,
        'cardUuid': req.body.cardUuid,
    }
    console.log(data);
    model.editCardWithCodeCH([data],(err, results) => {
        if (err) {
            res.status(409).send({status: 'error', message: err});
        } else {
            res.status(201).send({status: 'success', message: results});
        }
    })
}

// Remove card for a system code
const registerNewAccount = (req, res) => {
    const data = {
        'system_code': req.body.registrationCode,
        'max_users': 300
    }
    model.registerNewAccountCH([data],(err, results) => {
        if (err) {
            res.status(409).send({status: 'error', message: err});
        } else {
            res.status(201).send({status: 'success', message: results});
        }
    })
}

// Save new card to DB
const saveNewCardWithCode = (req, res) => {
    let data;
    if(req.body.cardManualCode === '--'){
        data = {
            'system_code': req.headers.authorization.split(' ')[1].trim(),
            'cardPath': "https://" + req.hostname + '/cardhub/cards/' + req.file.filename.replace(/#/g, ''),
            'cardName': req.body.cardName,
            'cardCountry': req.body.cardCountry == 'Slovensko' ? '1' : '2',
            'cardShop': req.body.shopId,
            'cardDesc': req.body.cardDesc,
            'cardManualCode': '--'
        }
    } else {
        data = {
            'system_code': req.headers.authorization.split(' ')[1].trim(),
            'cardPath': "--",
            'cardName': req.body.cardName,
            'cardCountry': req.body.cardCountry == 'Slovensko' ? '1' : '2',
            'cardShop': req.body.shopId,
            'cardDesc': req.body.cardDesc,
            'cardManualCode': req.body.cardManualCode
        }
    }
    console.log(data);
    model.saveCardWithCodeCH([data],(err, results) => {
        if (err) {
            res.status(409).send({status: 'error', message: err});
        } else {
            res.status(201).send({status: 'success', message: results});
        }
    })
}

// Get shops from DB
const getShopsWithCode = (req, res) => {
    model.getShopIdAndNameCH((err, results) => {
        if (err) {
            res.status(409).send({status: 'error', message: err});
        } else {
            res.status(201).send({status: 'success', message: results});
        }
    })
}

// Remove card for a system code
const removeCardWithCode = (req, res) => {
    const data = {
        'system_code': req.params.syscode + "#" + req.params.suffix,
        'card_uuid': req.params.carduuid
    }
    model.removeCardWithCodeCH([data],(err, results) => {
        if (err) {
            res.status(409).send({status: 'error', message: err});
        } else {
            res.status(201).send({status: 'success', message: results});
        }
    })
}

// Get cards for a system code
const getCardsWithCode = (req, res) => {
    const data = {
        'system_code': req.params.syscode + "#" + req.params.suffix,
    }
    model.getCardsWithCodeCH([data],(err, results) => {
        if (err) {
            res.status(409).send({status: 'error', message: err});
        } else {
            res.status(201).send({status: 'success', message: results});
        }
    })
}

// Log Out with system code and decrease number of current users
const logoutWithCode = (req, res) => {
    const data = {
        'system_code': req.params.syscode + "#" + req.params.suffix,
    }
    model.logoutWithCodeCH([data],(err, results) => {
        if (err) {
            res.status(409).send({status: 'error', message: err});
        } else {
            res.status(201).send({status: 'success', message: results});
        }
    })
}

// Login with system code and return all cards
const loginAndReturnCards = (req, res) => {
    const data = {
        'system_code': req.params.syscode + "#" + req.params.suffix,
    }
    console.log(data);
    model.loginWithSystemCodeCH([data],(err, results) => {
        if (err) {
            res.status(409).send({status: 'error', message: err});
        } else {
            res.status(201).send({status: 'success', message: results});
        }
    })
}

// Get all conversion rates for all currencies
const getAllConversionRates = (req, res) => {
    model.getAllRates((err, results) => {
        if (err) {
            res.status(409).send({status: 'error', message: err});
        } else {
            res.status(201).send({status: 'success', message: results});
        }
    })
}

// Get conversion rate for 2 currencies
const getConversionRates = (req, res) => {
    const data = {
        'currencyFrom': req.params.cfrom,
        'currencyTo': req.params.cto
    }
    model.getConversionRate([data], (err, results) => {
        if (err) {
            res.status(409).send({status: 'error', message: err});
        } else {
            res.status(201).send({status: 'success', message: results});
        }
    });
}

// Get last notification ID and push to user
const pushLastNotification = (req, res) => {
    const data = {
        'lastNotifCheck': req.body.lastClientNotif
    };
    model.pushLastNotif([data], (err, results) => {
        if (err) {
            res.status(409).send({status: 'error', message: err});
        } else {
            res.status(201).send({status: 'success', message: results});
        }
    });
}

// Check if user is SuperAdmin
const checkIfAdmin = (req, res) => {
    if(req.userData == null || !req.userData.userId){
        res.status(403).send({status: 'error', message: 'Unauthorized access.'});
    } else {
        const data = {
            'userId': req.userData.userId
        }
        model.checkIfAdmin([data], (err, results) => {
            if (err) {
                res.status(403).send({status: 'error', message: results});
            } else {
                res.status(201).send({status: 'success', message: results});
            }
        });
    }

}

// Show shared tanks
const getTanksFromSharedLink = (req, res) => {
    const data = {
        'share_code': req.params.sharecode
    }
    model.getTanksFromSharedLink([data], (err, results) => {
        if (err) {
            res.status(409).send({status: 'error', message: err});
        } else {
            res.status(201).send({status: 'success', message: results});
        }
    });
}

// Generate share link
const generateShareLink = (req, res) => {
    const data = {
        'userId': req.userData.userId
    }
    model.generateShareLink([data], (err, results) => {
        if (err) {
            res.status(409).send({status: 'error', message: err});
        } else {
            res.status(201).send({status: 'success', message: results});
        }
    });
}

// Update tank in garage
const saveNewRanking = (req, res) => {
    const data = {
        'tankId': req.body.tankId,
        'description': req.body.description,
        'ranking': req.body.ranking,
        'userId': req.userData.userId
    }
    model.saveNewRanking([data], (err, results) => {
        if (err) {
            res.status(409).send({status: 'error', message: err});
        } else {
            res.status(201).send({status: 'success', message: results});
        }
    });
}

// Remove tank from garage
const removeTankFromGarage = (req, res) => {
    const data = {
        'tankId': req.body.tankId,
        'userId': req.userData.userId
    }
    model.removeTankFromGarage([data], (err, results) => {
        if (err) {
            res.status(409).send({status: 'error', message: err});
        } else {
            res.status(201).send({status: 'success', message: results});
        }
    });
}

// Load tanks from users' garage
const loadFromGarage = (req, res) => {
    const data = {
        'userId': req.userData.userId
    }
    model.loadFromMyGarage([data], (err, results) => {
        if (err) {
            res.status(409).send({status: 'error', message: err});
        } else {
            res.status(201).send({status: 'success', message: results});
        }
    });
}

// Add tank to garage
const addToGarage = (req, res) => {
    const data = {
        'tankId': req.body.wg_tank_id,
        'userId': req.userData.userId,
        'ranking': req.body.ranking,
        'desc': req.body.description
    }
    model.addToGarage([data], (err, results) => {
        if (err) {
            res.status(409).send({status: 'error', message: err});
        } else {
            res.status(201).send({status: 'success', message: results});
        }
    });
}

// Get tanks with scores from DB according to filters
const browseRankings = (req, res) => {
    model.browseRankings((err, results) => {
        if (err) {
            res.status(409).send({status: 'error', message: err});
        } else {
            res.status(201).send({status: 'success', message: results});
        }
    });
}

// Search Tanks in database
const searchTanks = (req, res) => {
    const data = {
        'tankName': req.body.tankName,
        'is_premium': req.body.isPremium
    };
    model.searchTanks([data], (err, results) => {
        if (err) {
            res.status(409).send({status: 'error', message: err});
        } else {
            res.status(201).send({status: 'success', message: results});
        }
    });
}

// Verify User Email
const verifyEmail = (req, res) => {
    const data = {'userId': req.params.userId, 'token': req.params.token};
    model.verifyEmail([data], (err, results) => {
        if (err) {
            res.status(409).send({status: 'error', message: err});
        } else {
            res.status(201).send({status: 'success', message: results});
        }
    });
}

// Login User
const loginUser = (req, res) => {
    const data = {'username': req.body.username, 'userpassword': req.body.userpassword};
    model.loginUser([data], (err, results) => {
        if (err) {
            res.status(409).send({status: 'error', message: err});
        } else {
            res.status(201).send({status: 'success', message: results});
        }
    });
}

// Register user
const registerUser = (req, res) => {
    const data = {
        'username': req.body.username,
        'userpassword': req.body.userpassword,
        'useremail': req.body.useremail
    };
    model.registerUser([data], (err, results) => {
        if (err) {
            res.status(409).send({status: 'error', message: err});
        } else {
            res.status(201).send({status: 'success', message: results});
        }
    });
}

// Get All Users
const showUsers = (req, res) => {
    model.getUsers((err, results) => {
        if (err) {
            res.json({status: 'error', 'message': err});
        } else {
            res.json({status: 'success', 'message': results});
        }
    });
}

const getArticleById = (req, res) => {
    model.getArticleAsMarkdown(req.params.id.trim(), (err, results) => {
        if (err) {
            res.json({status: 'error', 'message': err});
        } else {
            res.json({status: 'success', 'message': results});
        }
    })
}

const saveArticle = (req, res) => {
    const data = req.body.article_core;
    model.saveArticleAsMarkdown(data, (err, results) => {
        if (err) {
            res.json({status: 'error', 'message': err});
        } else {
            res.json({status: 'success', 'message': results});
        }
    });
}

const saveRadios = (req, res) => {
    model.fetchRadios((err, results) => {
        if (err) {
            res.json({status: 'error', 'message': err});
        } else {
            res.json({status: 'success', 'message': results});
        }
    });
}

const getSpecificRadio = (req, res) => {
    model.getSpecificRadio(req.params.id.trim(), (err, results) => {
        if (err) {
            res.json({status: 'error', 'message': err});
        } else {
            res.json({status: 'success', 'message': results});
        }
    })
}

const getRadiosByCountry = (req, res) => {
    model.getRadiosByCountry(req.params.name, (err, results) => {
        if (err) {
            res.json({status: 'error', 'message': err});
        } else {
            res.json({status: 'success', 'message': results});
        }
    })
}

const getAllRadios = (req, res) => {
    model.fetchRadios((err, results) => {
        if (err) {
            res.json({status: 'error', 'message': err});
        } else {
            res.json({status: 'success', 'message': results});
        }
    })
}

module.exports = {
    showUsers, saveRadios, getRadiosByCountry, getAllRadios, getSpecificRadio, saveArticle, getArticleById,
    registerUser, loginUser, verifyEmail, searchTanks,
    pushLastNotification, browseRankings, addToGarage,loadFromGarage,removeTankFromGarage,saveNewRanking,
    generateShareLink,getTanksFromSharedLink, checkIfAdmin, getConversionRates, getAllConversionRates,
    loginAndReturnCards, logoutWithCode, getCardsWithCode, removeCardWithCode, saveNewCardWithCode,
    getShopsWithCode, registerNewAccount, editCardWithCode, getLeaderboard, savePlayerScore
}