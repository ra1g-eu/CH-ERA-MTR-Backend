const db = require('./database');
const chdb = require('./cardhub-db');
const radiodb = require('./radiorpi-db');
const eddb = require('./endlessdriver-db');
const axios = require("axios");
const bcrypt = require('bcryptjs');
const uuid = require('uuid');
const jwt = require('jsonwebtoken');
const mailer = require("./lib/mailer.js");

const savePlayerScoreDb = (data, result) => {
    eddb.query(`INSERT INTO leaderboard (score, playerName) VALUES (?)`,[[data[0].score, data[0].playerName]], (err, results) =>{
        if (err) {
            return result('Niečo sa pokazilo!', null);
        } else {
            return result(null, 'ScoreSaved');
        }
    });
}

const getLeaderboardTopTen = (result) => {
    eddb.query(`SELECT score, playerName, time_added FROM leaderboard GROUP BY playerName ORDER BY score DESC LIMIT 10`, (err, results) =>{
        if (err) {
            return result('Something went wrong!', null);
        }
        if (!results.length) {
            return result(null, 'NoRankingsYet');
        } else {
            return result(null, results);
        }
    });
}

const editCardWithCodeCH = (data, result) => {
    chdb.query(`SELECT max_users, system_code_limit.system_code AS syscode_id, current_users, system_codes.system_code AS syscode FROM system_code_limit
                    INNER JOIN system_codes ON system_codes.idsystem_codes=system_code_limit.system_code
                    WHERE system_codes.system_code=${chdb.escape(data[0].system_code)}`, (err, results) =>{
        if (err) {
            return result('Niečo sa pokazilo!', null);
        }
        if (!results.length) {
            return result('Takýto kód neexistuje!', null);
        } else {
            chdb.query(`UPDATE system_cards SET card_notes = ?, card_manual_code = ? WHERE card_uid = ?`,[data[0].cardDesc, data[0].cardManualCode, data[0].cardUuid], (err, results) =>{
                if (err) {
                    return result('Niečo sa pokazilo!', null);
                } else {
                    return result(null, 'Karta aktualizovaná!');
                }
            });
        }
    });
}

const registerNewAccountCH = (data, result) => {
    chdb.query(`INSERT INTO system_codes (system_code) VALUES (?)`,[[data[0].system_code]], (err, results) =>{
        if (err) {
            return result('Niečo sa pokazilo!', null);
        } else {
            chdb.query(`INSERT INTO system_code_limit (max_users, system_code, current_users) VALUES (?)`,[[data[0].max_users, results.insertId, 0]], (err, results) =>{
                if (err) {
                    return result('Niečo sa pokazilo!', null);
                } else {
                    return result(null, 'Účet vytvorený');
                }
            });
        }
    });
}

const saveCardWithCodeCH = (data, result) => {
    chdb.query(`SELECT max_users, system_code_limit.system_code AS syscode_id, current_users, system_codes.system_code AS syscode FROM system_code_limit
                    INNER JOIN system_codes ON system_codes.idsystem_codes=system_code_limit.system_code
                    WHERE system_codes.system_code=${chdb.escape(data[0].system_code)}`, (err, results) =>{
        if (err) {
            return result('Niečo sa pokazilo!', null);
        }
        if (!results.length) {
            return result('Takýto kód neexistuje!', null);
        } else {
            chdb.query(`INSERT INTO system_cards (card_uid, card_name, card_image64, card_notes, card_manual_code, system_code, system_shop, system_country) VALUES (?)`,[[uuid.v1().toString(), data[0].cardName, data[0].cardPath, data[0].cardDesc, data[0].cardManualCode, results[0].syscode_id, data[0].cardShop, data[0].cardCountry]], (err, results) =>{
                if (err) {
                    return result('Niečo sa pokazilo!', null);
                } else {
                    return result(null, 'Karta vytvorená!');
                }
            });
        }
    });
}

const getShopIdAndNameCH = (result) => {
    chdb.query(`SELECT system_shop AS shopId, shop_name AS shopName, shop_logo AS shopLogo FROM system_shops ORDER BY system_shop ASC`, (err, results) =>{
        if (err) {
            return result('Niečo sa pokazilo!', null);
        }
        if (!results.length) {
            return result(null, 'Žiadne obchody nie sú vytvorené!');
        } else {
            return result(null, results);
        }
    });
}

const removeCardWithCodeCH = (data, result) => {
    chdb.query(`SELECT max_users, system_code_limit.system_code AS syscode_id, current_users, system_codes.system_code AS syscode FROM system_code_limit
                    INNER JOIN system_codes ON system_codes.idsystem_codes=system_code_limit.system_code
                    WHERE system_codes.system_code=${chdb.escape(data[0].system_code)}`, (err, results) =>{
        if (err) {
            return result('Niečo sa pokazilo!', null);
        }
        if (!results.length) {
            return result('Takýto kód neexistuje!', null);
        } else {
            chdb.query(`DELETE FROM system_cards WHERE card_uid = ${chdb.escape(data[0].card_uuid)}`, (err, results) =>{
                if (err) {
                    return result('Niečo sa pokazilo!', null);
                }
                if (!results.length) {
                    return result(null, 'Zatiaľ nemáš žiadne karty!');
                } else {
                    return result(null, 'Karta vymazaná!');
                }
            });
        }
    });
}

const getCardsWithCodeCH = (data, result) => {
    chdb.query(`SELECT max_users, system_code_limit.system_code AS syscode_id, current_users, system_codes.system_code AS syscode FROM system_code_limit
                    INNER JOIN system_codes ON system_codes.idsystem_codes=system_code_limit.system_code
                    WHERE system_codes.system_code=${chdb.escape(data[0].system_code)}`, (err, results) =>{
        if (err) {
            return result('Niečo sa pokazilo!', null);
        }
        if (!results.length) {
            return result('Takýto kód neexistuje!', null);
        } else {
            chdb.query(`SELECT system_cards.card_uid AS card_uuid, system_cards.card_name AS card_name, system_cards.card_image64 AS card_image, system_cards.card_notes AS cardNotes, system_cards.card_manual_code AS manualCode, system_shops.shop_logo AS shopLogo, system_shops.shop_name, system_shops.shop_url_sk AS shopUrlSK, system_shops.shop_url_cz AS shopUrlCZ, system_countries.country_name FROM system_cards
                          INNER JOIN system_codes ON system_codes.idsystem_codes=system_cards.system_code
                          INNER JOIN system_countries ON system_countries.system_country=system_cards.system_country
                          INNER JOIN system_shops ON system_shops.system_shop=system_cards.system_shop
                        WHERE system_codes.system_code=${db.escape(results[0].syscode)}`, (err, results) =>{
                if (err) {
                    return result('Niečo sa pokazilo!', null);
                }

                if (!results.length) {
                    return result(null, 'Zatiaľ nemáš žiadne karty!');
                } else {
                    return result(null, results);
                }
            });
        }
    });
}

const logoutWithCodeCH = (data, result) => {
    chdb.query(`SELECT max_users, system_code_limit.system_code AS syscode_id, current_users, system_codes.system_code AS syscode FROM system_code_limit
                    INNER JOIN system_codes ON system_codes.idsystem_codes=system_code_limit.system_code
                    WHERE system_codes.system_code=${chdb.escape(data[0].system_code)}`, (err, results) =>{
        if (err) {
            return result('Niečo sa pokazilo!', null);
        }
        if (!results.length) {
            return result('Takýto kód neexistuje!', null);
        } else {
            chdb.query(`UPDATE system_code_limit SET current_users = ${results[0].current_users - 1} WHERE system_code = ${results[0].syscode_id}`, (err, results) =>{
                if (err) {
                    return result('Niečo sa pokazilo!', null);
                } else {
                    return result(null, results);
                }
            });
        }
    });
}

const loginWithSystemCodeCH = (data, result) => {
    chdb.query(`SELECT max_users, system_code_limit.system_code AS syscode_id, current_users, system_codes.system_code AS syscode FROM system_code_limit
                    INNER JOIN system_codes ON system_codes.idsystem_codes=system_code_limit.system_code
                    WHERE system_codes.system_code=${chdb.escape(data[0].system_code)}`, (err, results) =>{
        if (err) {
            return result('Niečo sa pokazilo!', null);
        }
        if (!results.length) {
            return result('Takýto kód neexistuje!', null);
        }
        if(results[0].current_users + 1 > results[0].max_users){
            return result('Maximálny počet použití kódu dosiahnutý!', null);
        } else {
            chdb.query(`UPDATE system_code_limit SET current_users = ${results[0].current_users + 1} WHERE system_code = ${results[0].syscode_id}`);
            chdb.query(`SELECT system_cards.card_uid AS card_uuid, system_cards.card_name AS card_name, system_cards.card_image64 AS card_image, system_cards.card_notes AS cardNotes, system_cards.card_manual_code AS manualCode, system_shops.shop_logo AS shopLogo, system_shops.shop_name, system_shops.shop_url_sk AS shopUrlSK, system_shops.shop_url_cz AS shopUrlCZ, system_countries.country_name FROM system_cards
                           INNER JOIN system_codes ON system_codes.idsystem_codes=system_cards.system_code
                           INNER JOIN system_countries ON system_countries.system_country=system_cards.system_country
                           INNER JOIN system_shops ON system_shops.system_shop=system_cards.system_shop
                        WHERE system_codes.system_code=${db.escape(results[0].syscode)}`, (err, results) =>{
                if (err) {
                    return result('Niečo sa pokazilo!', null);
                }

                if (!results.length) {
                    return result(null, 'Zatiaľ nemáš žiadne karty!');
                } else {
                    return result(null, results);
                }
            });
        }
    });
}

const getAllRates = (result) => {
    db.query(`SELECT curr_from, curr_to, rate AS currencyRate from exchange_rates_table`, (err, results) =>{
        if (err) {
            return result('Something went wrong!', null);
        }
        if (!results.length) {
            return result('There are no exchange rates that match this condition.', null);
        }
        return result(null, results);
    });
}

const getConversionRate = (data, result) => {
    db.query(`SELECT curr_from, curr_to, rate AS currencyRate from exchange_rates_table WHERE curr_from = ${db.escape(data[0].currencyFrom)} AND curr_to = ${db.escape(data[0].currencyTo)} LIMIT 1`, (err, results) =>{
        if (err) {
            return result('Something went wrong!', null);
        }
        if (!results.length) {
            return result('There are no exchange rates that match this condition.', null);
        }
        return result(null, results);
    });
}

const pushLastNotif = (data, result) => {
    db.query('SELECT * FROM mtr_notifications ORDER BY id DESC LIMIT 1', (err, results) => {
        if (err) {
            return result('Something went wrong!', null);
        }
        if (!results.length) {
            return result('There are no notifications.', null);
        }
        if (results[0].id > data[0].lastNotifCheck) {
            return result(null, results);
        } else if (results[0].id <= data[0].lastNotifCheck) {
            return result(null, 'There are no new notifications.');
        }
    })
}

const checkIfAdmin = (data, result) => {
    if(!data[0].userId){
        return result('Unauthorized access!', null);
    } else {
        let query = `SELECT role FROM user_role WHERE uniqueid = ${db.escape(data[0].userId)}`;
        db.query(query, (err, results) => {
            if (err) {
                return result('Unauthorized access', null);
            }
            if(!results.length){
                return result('Unauthorized access', null);
            } if (results[0].role === 'superadmin') {
                return result('', null);
            } else {
                return result('Unauthorized access', null);
            }
        });
    }

}

const checkIfModerator = (data, result) => {

}

const getTanksFromSharedLink = (data, result) => {
    let query = `SELECT user_tanks.wg_tank_id,
                        user_tanks.ranking AS avgrank,
                        user_tanks.description AS tankDesc,
                        tank_list.short_name,
                        tank_list.nation,
                        tank_list.is_premium,
                        tank_list.tier,
                        tank_list.tank_icon,
                        tank_list.type
                 FROM user_tanks
                          INNER JOIN tank_list ON tank_list.wg_tank_id = user_tanks.wg_tank_id
                          INNER JOIN user_share ON user_share.uniqueid = user_tanks.uniqueid
                 WHERE user_share.share_code = ${db.escape(data[0].share_code)}
                 ORDER BY user_tanks.ranking DESC;`;
    db.query(query, (err, results) => {
        if (err) {
            console.log(err);
            return result('Something went wrong!', null);
        }
        if (!results.length) {
            return result('This account has no tanks in garage!', null);
        } else {
            return result(null, results);

        }
    });
}

const generateShareLink = (data, result) => {
    let query = `SELECT shareLink
                 FROM user_share
                 WHERE uniqueid = ${db.escape(data[0].userId)}`;
    db.query(query, (err, results) => {
        if (err) {
            console.log(err);
            return result('Something went wrong!', null);
        }
        if (results.length) {
            return result('You already have an active share link: ' + results[0].shareLink, null);
        } else {
            let shareCode = uuid.v4().substring(0, 9);
            let newShareLink = 'https://mytankrank.ink/share/' + shareCode;
            let insertLink = `INSERT INTO user_share (uniqueid, share_code, visits, shareLink)
                              VALUES (?)`;
            db.query(insertLink, [[data[0].userId.trim(), shareCode, 0, newShareLink]], (err, results) => {
                if (err) {
                    console.log(err);
                    return result('Something went wrong!', null);
                } else {
                    return result(null, {'sharedLink': newShareLink});
                }
            });
        }
    });
}

const saveNewRanking = (data, result) => {
    if(0 > data[0].ranking > 10){
        return result('Please select rank between 0 and 10.', null);
    }
    let query = `UPDATE user_tanks
                 SET ranking     = ${db.escape(data[0].ranking)},
                     description = ${db.escape(data[0].description).trim()}
                 WHERE wg_tank_id = ${db.escape(data[0].tankId)}
                   and uniqueid = ${db.escape(data[0].userId)}`;
    db.query(query, (err, results) => {
        if (err) {
            console.log(err);
            return result('Something went wrong!', null);
        }
        if (results.affectedRows > 0) {
            return result(null, 'Tank updated successfully.');
        } else {
            return result('This tank could not be updated!', null);
        }
    });
}

const removeTankFromGarage = (data, result) => {
    let query = `DELETE
                 FROM user_tanks
                 WHERE uniqueid = ${db.escape(data[0].userId)}
                   AND wg_tank_id = ${db.escape(data[0].tankId)}`;
    db.query(query, (err, results) => {
        if (err) {
            console.log(err);
            return result('Something went wrong!', null);
        }
        //console.log(results);
        if (!results.length) {
            return result(null, 'Tank removed successfully.');
        } else {
            return result('This tank could not be removed!', null);
        }
    });
}

const loadFromMyGarage = (data, result) => {
    let queryAccount = `SELECT COUNT(wg_tank_id) as tankCount, AVG(ranking) as avgRank
                        FROM user_tanks
                        WHERE uniqueid = ${db.escape(data[0].userId)}`;
    db.query(queryAccount, (err, resultsAcc) => {
        if (err) {
            console.log(err);
            return result('Something went wrong!', null);
        }
        if (!resultsAcc.length) {
            return result('You current have no tanks in garage.', null);
        } else {
            let query = `SELECT user_tanks.wg_tank_id,
                                user_tanks.ranking,
                                user_tanks.description,
                                user_tanks.updated_at,
                                tank_list.short_name,
                                tank_list.nation,
                                tank_list.is_premium,
                                tank_list.tier,
                                tank_list.tank_icon,
                                tank_list.type
                         FROM user_tanks
                                  INNER JOIN tank_list ON tank_list.wg_tank_id = user_tanks.wg_tank_id
                         WHERE user_tanks.uniqueid = ${db.escape(data[0].userId)}
                         ORDER BY user_tanks.ranking DESC`;
            db.query(query, (err, results) => {
                if (err) {
                    console.log(err);
                    return result('Something went wrong!', null);
                }
                if (!results.length) {
                    return result('You currently have no tanks in garage.', null);
                } else {
                    return result(null, {'tanks': results, 'account': resultsAcc});

                }
            });
        }
    });
}

const addToGarage = (data, result) => {
    if(0 > data[0].ranking > 10){
        return result('Please select rank between 0 and 10.', null);
    }
    let checkIfAlreadyAdded = `SELECT uniqueid, wg_tank_id
                               FROM user_tanks
                               WHERE uniqueid = ${db.escape(data[0].userId)}
                                 AND wg_tank_id = ${db.escape(data[0].tankId)}`;
    db.query(checkIfAlreadyAdded, (err, results) => {
        if (err) {
            console.log(err);
            return result('Something went wrong!', null);
        }
        if (!results.length) {
            let query = `INSERT INTO user_tanks (uniqueid, wg_tank_id, ranking, description)
                         VALUES (?);`
            db.query(query, [[data[0].userId.trim(), data[0].tankId, data[0].ranking, data[0].desc == null ? '' : data[0].desc.trim()]], (err, results) => {
                if (err) {
                    console.log(err);
                    return result('Something went wrong!', null);
                } else {
                    return result(null, results);
                }
            });
        } else {
            return result('You already ranked this tank!', null);
        }
    })
}

const browseRankings = (result) => {
    let query = `SELECT AVG(user_tanks.ranking)   as avgrank,
                            COUNT(user_tanks.ranking) as numOfRankings,
                            tank_list.short_name,
                            tank_list.nation,
                            tank_list.is_premium,
                            tank_list.tier,
                            tank_list.tank_icon,
                            tank_list.type
                     FROM user_tanks
                              INNER JOIN tank_list ON tank_list.wg_tank_id = user_tanks.wg_tank_id
                     GROUP BY tank_list.wg_tank_id`;
        db.query(query, (err, results) => {
        if (err) {
            return result('Something went wrong!', null);
        }
        if (!results.length) {
            return result('No tanks have been found!', null);
        } else {
            return result(null, results);
        }
    });
}

const searchTanks = (data, result) => {
    let searchQuery;
    if (data[0].is_premium === '1') {
        searchQuery = 'SELECT * FROM tank_list WHERE name LIKE ? AND is_premium = 1';
    }
    if (data[0].is_premium === '0') {
        searchQuery = 'SELECT * FROM tank_list WHERE name LIKE ? AND is_premium = 0';
    }
    if (data[0].is_premium === '2') {
        searchQuery = 'SELECT * FROM tank_list WHERE name LIKE ?';
    }
    db.query(searchQuery, ['%' + data[0].tankName.trim() + '%'], (err, results) => {
        if (err) {
            return result('Something went wrong!', null);
        }
        if (!results.length) {
            return result('Could not find this tank.', null);
        } else {
            return result(null, results);
        }
    })
}

const verifyEmail = (data, result) => {
    db.query(
        `SELECT *
         FROM users
         WHERE uniqueid = ${db.escape(data[0].userId)}`,
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
            if (results[0]["activated"] == 'yes') {
                return result('Account is already activated!', null);
            }
            // wrong activation token
            if (results[0]["activation_code"] !== data[0].token) {
                return result('Wrong activation code!', null);
            }
            // set account active
            db.query(
                `UPDATE users SET activated = 'yes' WHERE uniqueid = ${db.escape(data[0].userId)};INSERT INTO user_role (uniqueid, role) VALUES (${db.escape(data[0].userId)}, 'basicuser');`,
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

const loginUser = (data, result) => {
    db.query(
        `SELECT * FROM users
             INNER JOIN user_role ON user_role.uniqueid=users.uniqueid
             WHERE users.username = ${db.escape(data[0].username)}`,
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
                results[0]['userpassword'],
                (bErr, bResult) => {
                    // wrong password
                    if (bErr) {
                        return result('This username or password is not correct!', null);
                    }
                    if (bResult) {
                        if (results[0]["activated"] == 'no') {
                            return result('This account is not yet activated! Please check your inbox.', null);
                        } else {
                            const token = jwt.sign({
                                    username: results[0].username,
                                    userId: results[0].uniqueid
                                },
                                'f611d149-0a77-46a9-91c8-e106bedd2116', {
                                    expiresIn: '7d'
                                }
                            );
                            db.query(
                                `UPDATE users
                                 SET last_login = now()
                                 WHERE uniqueid = '${results[0].uniqueid}'`
                            );
                            return result(null, {
                                msg: 'Login successful!',
                                token,
                                user: {
                                    'username': results[0].username,
                                    'email': results[0].useremail,
                                    'role': results[0].role,
                                    'activated': results[0].activated,
                                    'uniqueid': results[0].uniqueid,
                                    'created_at': results[0].created_at,
                                    'last_login': results[0].last_login
                                }
                            });
                        }
                    } else {
                        return result('This username or password is not correct!', null);
                    }
                }
            );
        }
    );
}

const registerUser = (data, result) => {
    let activationCode = uuid.v1();
    let userId = uuid.v4();
    db.query(
        `SELECT *
         FROM users
         WHERE LOWER(username) = LOWER(${db.escape(
                 data[0].username
         )});`,
        (err, results) => {
            if (results.length) {
                return result('This username is already in use!', null);
            } else {
                db.query(
                    `SELECT *
                     FROM users
                     WHERE LOWER(useremail) = LOWER(${db.escape(
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
                                    db.query(
                                        `INSERT INTO users (username, useremail, userpassword, created_at,
                                                            activation_code, uniqueid)
                                         VALUES (${db.escape(
                                                 data[0].username
                                         )}, ${db.escape(
                                                 data[0].useremail
                                         )}, ${db.escape(hash)}, now(), '${activationCode}', '${userId}')`,
                                        async (err, results) => {
                                            if (err) {
                                                return result(err, null);
                                            }
                                            try {
                                                await mailer.sendOptInMail(
                                                    data[0].useremail,
                                                    userId,
                                                    activationCode
                                                );
                                            } catch (err) {
                                                console.log(err);
                                                return result(err, null);
                                            }

                                            return result(null, 'Your account has been created! Please activate your account by clicking on the link in your inbox.');
                                        }
                                    );
                                }
                            });
                        }
                    }
                );
            }
        }
    );
}

const getUsers = (result) => {
    db.query("SELECT username, useremail FROM users", (err, results) => {
        if (err) {
            console.log(err);
            result(err, null);
        } else {
            result(null, results);
        }
    });
}

const saveArticleAsMarkdown = (data, result) => {
    db.query("INSERT INTO articles (article) VALUES (?)", [data], (err, results) => {
        if (err) {
            console.log(err);
            result(err, null);
        } else {
            result(null, results);
        }
    });
}

const getArticleAsMarkdown = (id, result) => {
    const query = 'SELECT * from articles WHERE id = ? LIMIT 1';
    db.query(query, [id], (err, results) => {
        if (err) {
            result(err, null);
        } else {
            result(null, results);
        }
    });
}

const getRadiosByCountry = (name, result) => {
    const query = 'SELECT * from radiorpi WHERE country LIKE ? AND bitrate > 64 ORDER BY votes DESC';
    radiodb.query(query, ['%' + name.trim() + '%'], (err, results) => {
        if (err) {
            result(err, null);
        } else {
            result(null, results);
        }
    });
}

const getAllRadios = (result) => {
    const query = 'SELECT * from radiorpi ORDER BY votes DESC';
    radiodb.query(query, (err, results) => {
        if (err) {
            result(err, null);
        } else {
            result(null, results);
        }
    });
}

const getSpecificRadio = (id, result) => {
    const query = 'SELECT * from radiorpi WHERE id = ? LIMIT 1';
    radiodb.query(query, [id], (err, results) => {
        if (err) {
            result(err, null);
        } else {
            result(null, results);
        }
    });
}

const fetchRadios = (result) => {
    const getLastRadioStatusQuery = 'SELECT * from radio_status ORDER BY id DESC LIMIT 1';
    radiodb.query(getLastRadioStatusQuery, (err, results) => {
        if (err) {
            result(err, null);
        } else {
            const getAllRadios = 'SELECT * from radiorpi ORDER BY votes DESC';
            if(results[0].status_code.includes('success')){
                radiodb.query(getAllRadios, (err, results) => {
                    if (err) {
                        result(err, null);
                    } else {
                        result(null, results);
                    }
                });
            } else {
                radiodb.query(getAllRadios, (err, results) => {
                    if (err) {
                        result(err, null);
                    } else {
                        result(null, results);
                    }
                });
            }
        }
    });
}

/*const fetchRadios = (result) => {
    let stations = [];
    let refreshInterval = 129600000;//36 hodin
    let currTimestamp = Date.now();
    const lastRefreshTime = 'SELECT last_radio_refresh AS lrf FROM tracking_table';
    const insertLRT = 'UPDATE tracking_table SET last_radio_refresh = ?';
    const truncateTable = 'TRUNCATE TABLE radiorpi';
    const query = 'INSERT INTO radiorpi (stationuuid, name, url, homepage, tags, country, countrycode, bitrate, votes, icon) VALUES (?)';
    db.query(lastRefreshTime, (err, results) => {
        if (err) {
            result('error', null);
        } else if (!results.length || !results[0] || ((currTimestamp - parseInt(results[0].lrf)) >= refreshInterval)) {
            axios.get(`https://de1.api.radio-browser.info/json/stations/bycountrycodeexact/cz?order=votes&reverse=true&hidebroken=true&limit=80`)
                .then(responseCz => {
                    if (responseCz.data) {
                        axios.get(`https://de1.api.radio-browser.info/json/stations/bycountrycodeexact/sk?order=votes&reverse=true&hidebroken=true&limit=80`)
                            .then(responseSk => {
                                if (responseSk.data) {
                                    stations = stations.concat(responseCz.data, responseSk.data);
                                    db.query(insertLRT, [currTimestamp]);
                                    db.query(truncateTable);
                                    for (let i = 0; i < stations.length; i++) {
                                        if (!stations[i].tags.includes('rfe-rl')) {
                                            if (stations[i].favicon == null || stations[i].favicon == "") {
                                                stations[i].favicon = 'mstile-150x150.png';
                                            }
                                            const bindings = [[stations[i].stationuuid, stations[i].name, stations[i].url_resolved, stations[i].homepage, stations[i].tags, stations[i].country, stations[i].countrycode, stations[i].bitrate, stations[i].votes, stations[i].favicon]];
                                            db.query(query, bindings);
                                        }
                                    }
                                    result(null, 'stationsRefreshed'); //added successfully
                                } else {
                                    result('APIerror', null); //could not fetch from API - error
                                }
                            })
                            .catch(function (error) {
                                console.error(error);
                                result('internalError', null);
                            });
                    } else {
                        result('APIerror', null); //could not fetch from API - error
                    }
                })
                .catch(function (error) {
                    console.error(error);
                    result('internalError', null);
                });
        } else {
            result('refreshTooSoon', null); //not enough time has passed
        }
    })
}*/

module.exports = {
    getUsers,
    fetchRadios,
    getRadiosByCountry,
    getAllRadios,
    getSpecificRadio,
    saveArticleAsMarkdown,
    getArticleAsMarkdown,
    loginUser,
    registerUser,
    verifyEmail,
    searchTanks,
    pushLastNotif,
    browseRankings,
    addToGarage,
    loadFromMyGarage,
    removeTankFromGarage,
    saveNewRanking,
    generateShareLink,
    getTanksFromSharedLink,
    checkIfAdmin,
    getConversionRate,
    getAllRates,
    loginWithSystemCodeCH,
    logoutWithCodeCH,
    getCardsWithCodeCH,
    removeCardWithCodeCH,
    getShopIdAndNameCH,
    saveCardWithCodeCH,
    registerNewAccountCH,
    editCardWithCodeCH,
    getLeaderboardTopTen,
    savePlayerScoreDb
}