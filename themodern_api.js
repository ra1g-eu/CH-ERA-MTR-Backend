const tmdb = require('./themodern-db');
const bcrypt = require('bcryptjs');
const uuid = require('uuid');
const jwt = require('jsonwebtoken');
const mailer = require("./lib/tm_mailer.js");
const playerInfo = require('./themodern_logic/playerInfo');
const Game = require('./themodern_logic/game');

// get player XP
const getPlayerXP = (data, result) => {
    tmdb.query(`SELECT player_info.player_level, player_info.player_experience,
                       experience_table.experience_intotal,
                       experience_table.experience_neededfornext
                FROM player_info
                         INNER JOIN experience_table ON player_info.player_level = experience_table.experience_level
                WHERE player_info.player_playerid = '${data[0].player_playerid}'`, (err, results) => {
        if(err){
            return result(err, null);
        } else {
            return result(null, results);
        }
    })
}

// fill xp table
const fillXpTable = (result) => {
    tmdb.query(`TRUNCATE TABLE experience_table`);
    for (let i = 0; i < 201; i++) {
        let level = i;
        let scale = 105;
        let XP_BASE = 0.1;
        let XP_TO_LEVEL = ((level * scale) ** 2) * XP_BASE;
        let XP_TO_LEVEL_NEXT = (((level + 1) * scale) ** 2) * XP_BASE;
        //console.log("Current Level: "+level+" - XP needed: " + Math.floor(XP_TO_LEVEL) + " - Needed for next: " + Math.floor(XP_TO_LEVEL_NEXT-XP_TO_LEVEL));

        tmdb.query(`INSERT INTO experience_table (experience_level, experience_intotal, experience_neededfornext)
                    VALUES (${level}, ${Math.floor(XP_TO_LEVEL)}, ${Math.floor(XP_TO_LEVEL_NEXT - XP_TO_LEVEL)})`);
    }
    return result(null, "XP Table filled successfully");
}

//buy item from shop
const buyItemFromShop = (data, result) => {
    let itemPrice;
    tmdb.query(`SELECT item_buyprice
                FROM item_table
                WHERE item_id = ${data[0].item_id}`, (err, results) => {
        if (err) {
            return result(err, null);
        } else {
            itemPrice = results[0].item_buyprice;
            tmdb.query(`SELECT player_cash, player_bank
                        FROM player_info
                        WHERE player_playerid = '${data[0].player_playerid}'`, (err, results) => {
                if (err) {
                    return result(err, null);
                } else {
                    let player_cash = 0;
                    let player_bank = 0;
                    player_cash = results[0].player_cash - itemPrice;
                    player_bank = player_cash < 0 ? results[0].player_bank - Math.abs(player_cash) : results[0].player_bank;
                    player_cash = player_cash < 0 ? 0 : player_cash;
                    //console.log(results[0].player_cash);
                    if (itemPrice > results[0].player_cash && itemPrice > (results[0].player_cash + results[0].player_bank)) {
                        return result("Not enough money", null);
                    } else if (results[0].player_cash >= itemPrice || (results[0].player_cash + results[0].player_bank) >= itemPrice) {
                        addItemToInventory([{
                            "item_id": data[0].item_id,
                            "amount": 1,
                            "player_playerid": data[0].player_playerid
                        }], (err, results) => {
                            if (err) {
                                return result(err, null);
                            } else {
                                tmdb.query(`UPDATE player_info
                                            SET player_cash = ${player_cash},
                                                player_bank = ${player_bank}
                                            WHERE player_playerid = '${data[0].player_playerid}'`, (err, results) => {
                                    if (err) {
                                        return result(err, null);
                                    } else {
                                        return result(null, "Item successfully bought!");
                                    }
                                });
                            }
                        });
                    }
                }
            });
        }
    });
}

//add items to player's inventory
const addItemToInventory = (data, result) => {

    getPlayerInventory([{'player_playerid': data[0].player_playerid}], (err, results) => {
        if (err) {
            console.log("GetPlayerInventory error");
            return result(err, null);
        } else {
            let invItems;
            //console.log(results[0].player_inventory_items);
            invItems = JSON.parse(results[0].player_inventory_items);
            //console.log(Object.keys(invItems).length);
            if (invItems.length < 1 || Object.keys(invItems).length === 0) {
                invItems.push({"item_id": data[0].item_id, "amount": data[0].amount});
            } else {
                const index = invItems.findIndex(x => x.item_id === data[0].item_id);
                if (index === -1) {
                    invItems.push({"item_id": data[0].item_id, "amount": data[0].amount});
                } else {
                    invItems[index].amount += data[0].amount;
                }

                /*for (let i = 0; i < invItems.length; i++) {
                    if(invItems[i].item_id === data[0].item_id){
                        invItems[i].amount += data[0].amount;
                        break;
                    } else {
                        invItems.push({"item_id":data[0].item_id,"amount":data[0].amount});
                    }
                }*/
            }

            tmdb.query(`UPDATE player_inventory
                        SET player_inventory_items = '${JSON.stringify(invItems)}'
                        WHERE player_playerid = '${data[0].player_playerid}'`, (err, results) => {
                if (err) {
                    return result(err, null);
                } else {
                    return result(null, "Item added to inventory");
                }
            });
        }
    });
}

//get player's inventory items
const getPlayerInventory = (data, result) => {
    tmdb.query(
        `SELECT player_inventory_items
         FROM player_inventory
         WHERE player_playerid = '${data[0].player_playerid}'`, (err, results) => {
            if (err) {
                return result('Unexpected error', null);
            } else {
                return result(null, results);
            }
        });
}

// retrieve player info
const getPlayerInfo = (data, result) => {
    let loggedInPlayerInfo = new playerInfo();
    tmdb.query(
        `SELECT *
         FROM player_info
         WHERE player_playerid = '${data[0].playerId}'`, (err, results) => {
            if (err) {
                return result('Unexpected error', null);
            }
            loggedInPlayerInfo.playerId = results[0].player_playerid;
            loggedInPlayerInfo.player_level = results[0].player_level;
            loggedInPlayerInfo.player_cash = results[0].player_cash;
            loggedInPlayerInfo.player_bank = results[0].player_bank;
            loggedInPlayerInfo.player_experience = results[0].player_experience;
            loggedInPlayerInfo.player_special_currency = results[0].player_special_currency;
            loggedInPlayerInfo.player_premium_currency = results[0].player_premium_currency;
            loggedInPlayerInfo.player_health = results[0].player_health;
            loggedInPlayerInfo.player_energy = results[0].player_energy;
            loggedInPlayerInfo.player_energy_max = results[0].player_energy_max;
            return result(null, loggedInPlayerInfo);
        }
    );
}


// get all game items
const getAllGameItems = (result) => {
    tmdb.query('SELECT * from item_table', (err, results) => {
        if (err) {
            return result(err, null);
        }
        let gameItems = new Game();
        gameItems.addAllGameItems(results);
        return result(null, gameItems.getAllGameItems());
    });
}


// Login Register system
const verifyEmail = (data, result) => {
    tmdb.query(
        `SELECT *
         FROM player_table
         WHERE player_playerid = ${tmdb.escape(data[0].userId)}`,
        (err, results) => {
            //console.log(data);
            // user does not exists
            if (err) {
                return result('This user does not exist!', null);
            }
            // no result from database
            if (!results.length) {
                return result('Wrong request!', null);
            }
            // already activated
            if (results[0]["player_isactivated"] === 'yes') {
                return result('Account is already activated!', null);
            }
            // wrong activation token
            if (results[0]["player_activationcode"] !== data[0].token) {
                return result('Wrong activation code!', null);
            }
            // set account active
            tmdb.query(
                `UPDATE player_table
                 SET player_isactivated = 'yes'
                 WHERE player_playerid = ${tmdb.escape(data[0].userId)}`,
                (err, results) => {
                    if (err) {
                        return result(err, null);
                    } else {
                        return result(null, 'Account successfully activated!');
                    }
                }
            );
        }
    );
}

const userLogIn = (data, result) => {
    let playerName = "";
    tmdb.query(
        `SELECT *
         FROM player_table
         WHERE player_name = ${tmdb.escape(data[0].username)}`,
        (err, results) => {
            // user does not exist
            if (err) {
                return result('This user does not exist!', null);
            }
            if (!results.length) {
                return result('This username or password is not correct!', null);
            }
            // check password
            bcrypt.compare(
                data[0].userpassword,
                results[0]['player_pass'],
                (bErr, bResult) => {
                    // wrong password
                    if (bErr) {
                        return result('This username or password is not correct!', null);
                    }
                    if (bResult) {
                        if (results[0]["player_isactivated"] === 'no') {
                            return result('This account is not yet activated! Please check your inbox.', null);
                        } else {
                            const token = jwt.sign({
                                    playerName: results[0].player_name,
                                    playerId: results[0].player_playerid
                                },
                                'f611d149-0a77-46a9-91c8-e106bedd2116', {
                                    expiresIn: '7d'
                                }
                            );
                            tmdb.query(
                                `UPDATE player_table
                                 SET player_lastlogin = now()
                                 WHERE player_playerid = '${results[0].player_playerid}'`
                            );
                            playerName = results[0].player_name;
                            let loggedInPlayerInfo = new playerInfo();
                            tmdb.query(
                                `SELECT *
                                 FROM player_info
                                 WHERE player_playerid = '${results[0].player_playerid}'`, (err, results) => {
                                    if (err) {
                                        return result('Unexpected error', null);
                                    }
                                    console.log(results)
                                    console.log("----^results^----");
                                    loggedInPlayerInfo.playerId = results[0].player_playerid;
                                    loggedInPlayerInfo.player_level = results[0].player_level;
                                    loggedInPlayerInfo.player_cash = results[0].player_cash;
                                    loggedInPlayerInfo.player_bank = results[0].player_bank;
                                    loggedInPlayerInfo.player_experience = results[0].player_experience;
                                    loggedInPlayerInfo.player_special_currency = results[0].player_special_currency;
                                    loggedInPlayerInfo.player_premium_currency = results[0].player_premium_currency;
                                    loggedInPlayerInfo.player_health = results[0].player_health;
                                    loggedInPlayerInfo.player_energy = results[0].player_energy;
                                    loggedInPlayerInfo.player_energy_max = results[0].player_energy_max;

                                    return result(null, {
                                        msg: 'Login successful!',
                                        token,
                                        user: {
                                            'playerName': playerName,
                                            'player_playerid': results[0].player_playerid,
                                        },
                                        loggedInPlayerInfo
                                    });
                                }
                            );
                        }
                    } else {
                        return result('This username or password is not correct!', null);
                    }
                }
            );
        }
    );
}

const userRegister = (data, result) => {
    let activationCode = uuid.v1();
    let playerId = uuid.v4();
    tmdb.query(
        `SELECT player_name
         FROM player_table
         WHERE LOWER(player_name) = LOWER(${tmdb.escape(
                 data[0].username
         )});`,
        (err, results) => {
            if (results.length) {
                return result('This username is already in use!', null);
            } else {
                tmdb.query(
                    `SELECT player_email
                     FROM player_table
                     WHERE LOWER(player_email) = LOWER(${tmdb.escape(
                             data[0].useremail
                     )});`,
                    (err, results) => {
                        if (results.length) {
                            return result('This email is already in use!', null);
                        } else {
                            // username is available
                            bcrypt.hash(data[0].userpassword, 10, (err, hash) => {
                                if (err) {
                                    return result(err, null);
                                } else {
                                    // has hashed pw => add to database
                                    tmdb.query(
                                        `INSERT INTO player_table (player_name, player_email, player_pass,
                                                                   player_createdat,
                                                                   player_activationcode, player_playerid)
                                         VALUES (${tmdb.escape(
                                                 data[0].username
                                         )}, ${tmdb.escape(
                                                 data[0].useremail
                                         )}, ${tmdb.escape(hash)}, now(), '${activationCode}', '${playerId}')`,
                                        async (err, results) => {
                                            if (err) {
                                                return result(err, null);
                                            }
                                            /*try {
                                                await mailer.sendOptInMail(
                                                    data[0].useremail,
                                                    playerId,
                                                    activationCode
                                                );
                                            } catch (err) {
                                                console.log(err);
                                                return result(err, null);
                                            }*/
                                        }
                                    );
                                    tmdb.query(`INSERT INTO player_inventory (player_playerid, player_inventory_items)
                                                VALUES ('${playerId}', '{}')`)
                                    let newPlayerInfo = new playerInfo(playerId, 1, 0, 0, 0, 0, 0, 100, 100, 100);
                                    console.log(newPlayerInfo);
                                    tmdb.query(`INSERT INTO player_info (player_playerid, player_level,
                                                                         player_cash, player_bank,
                                                                         player_experience,
                                                                         player_special_currency,
                                                                         player_premium_currency, player_health,
                                                                         player_energy, player_energy_max)
                                                VALUES ('${newPlayerInfo.playerId}',
                                                        ${newPlayerInfo.player_level},
                                                        ${newPlayerInfo.player_cash},
                                                        ${newPlayerInfo.player_bank},
                                                        ${newPlayerInfo.player_experience},
                                                        ${newPlayerInfo.player_special_currency},
                                                        ${newPlayerInfo.player_premium_currency},
                                                        ${newPlayerInfo.player_health},
                                                        ${newPlayerInfo.player_energy},
                                                        ${newPlayerInfo.player_energy_max})`,
                                        async (err, results) => {
                                            console.log(err);
                                            if (err) {
                                                return result(err, null);
                                            }
                                        });
                                    return result(null, 'Your account has been created! Please activate your account by clicking on the link in your inbox.');
                                }
                            });
                        }
                    }
                );
            }
        }
    );
}

module.exports = {
    userLogIn,
    userRegister,
    verifyEmail,
    getAllGameItems,
    getPlayerInfo,
    buyItemFromShop,
    getPlayerInventory,
    fillXpTable,
    getPlayerXP
}