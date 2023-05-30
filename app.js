var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require('cors');
const Router = require('./routes/routes');
const bodyParser = require("body-parser");
const schedule = require('node-schedule');
const db = require('./database');
const radiorpi = require('./radiorpi-db');
const axios = require("axios");

const app = express();

app.use(logger('dev'));
app.use(cors({origin: '*'}));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use('/cardhub/cards/',express.static('cardhub_uploads/cards/'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(Router);

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

schedule.scheduleJob('50 23 * * 7', function(){
    db.query('TRUNCATE TABLE user_share', (err) => {
        if (err) {
            console.log('Error when purging shared links');
        } else {
            let date = new Date();
            console.log('=== Purged shared links at ' + date.toLocaleTimeString() + '===');
        }
    })
});

schedule.scheduleJob('0 0 */3 * *', function(){
    let date = new Date();
    db.query('TRUNCATE TABLE exchange_rates_table', (err) => {
        if (err) {
            console.log('Error when purging shared links');
        } else {
            let date = new Date();
            console.log('=== Purged exchange rates table at ' + date.toLocaleTimeString() + '===');
        }
    });
    const config = {
        headers:{
            apikey: "SvlYuOD0hfnvxxu4lxKpn9Yl2pxCIb1w"
        }
    };

    axios.get("https://api.apilayer.com/exchangerates_data/latest?symbols=USD%2CGBP%2CCZK%2CTRY&base=EUR", config)
        .then(res => {
            let rates = res.data;
            for (let i = 0; i < Object.keys(rates.rates).length; i++) {
                console.log(Object.values(rates.rates)[i]);
                db.query(`INSERT INTO exchange_rates_table (curr_from, curr_to, rate) VALUES ('EUR', ${db.escape(Object.keys(rates.rates)[i])}, ${db.escape(Object.values(rates.rates)[i])})`);
            }
            console.log('=== Inserted TRY exchange rates at ' + date.toLocaleTimeString() + '===');
        })
        .catch(err=> console.log(err));

    setTimeout(function() {
        axios.get("https://api.apilayer.com/exchangerates_data/latest?symbols=USD%2CGBP%2CEUR%2CTRY&base=CZK", config)
            .then(res => {
                let rates = res.data;
                for (let i = 0; i < Object.keys(rates.rates).length; i++) {
                    console.log(Object.values(rates.rates)[i]);
                    db.query(`INSERT INTO exchange_rates_table (curr_from, curr_to, rate) VALUES ('CZK', ${db.escape(Object.keys(rates.rates)[i])}, ${db.escape(Object.values(rates.rates)[i])})`);
                }
                console.log('=== Inserted TRY exchange rates at ' + date.toLocaleTimeString() + '===');
            })
            .catch(err=> console.log(err));
    }, 1000);

    axios.get("https://api.apilayer.com/exchangerates_data/latest?symbols=USD%2CEUR%2CCZK%2CTRY&base=GBP", config)
        .then(res => {
            let rates = res.data;
            for (let i = 0; i < Object.keys(rates.rates).length; i++) {
                console.log(Object.values(rates.rates)[i]);
                db.query(`INSERT INTO exchange_rates_table (curr_from, curr_to, rate) VALUES ('GBP', ${db.escape(Object.keys(rates.rates)[i])}, ${db.escape(Object.values(rates.rates)[i])})`);
            }
            console.log('=== Inserted TRY exchange rates at ' + date.toLocaleTimeString() + '===');
        })
        .catch(err=> console.log(err));

    setTimeout(function() {
        axios.get("https://api.apilayer.com/exchangerates_data/latest?symbols=EUR%2CGBP%2CCZK%2CTRY&base=USD", config)
            .then(res => {
                let rates = res.data;
                for (let i = 0; i < Object.keys(rates.rates).length; i++) {
                    console.log(Object.values(rates.rates)[i]);
                    db.query(`INSERT INTO exchange_rates_table (curr_from, curr_to, rate) VALUES ('USD', ${db.escape(Object.keys(rates.rates)[i])}, ${db.escape(Object.values(rates.rates)[i])})`);
                }
                console.log('=== Inserted TRY exchange rates at ' + date.toLocaleTimeString() + '===');
            })
            .catch(err=> console.log(err));
    }, 1000);

    axios.get("https://api.apilayer.com/exchangerates_data/latest?symbols=USD%2CGBP%2CCZK%2CEUR&base=TRY", config)
        .then(res => {
            let rates = res.data;
            for (let i = 0; i < Object.keys(rates.rates).length; i++) {
                console.log(Object.values(rates.rates)[i]);
                db.query(`INSERT INTO exchange_rates_table (curr_from, curr_to, rate) VALUES ('TRY', ${db.escape(Object.keys(rates.rates)[i])}, ${db.escape(Object.values(rates.rates)[i])})`);
            }
            console.log('=== Inserted TRY exchange rates at ' + date.toLocaleTimeString() + '===');
        })
        .catch(err=> console.log(err));

});

// RADIO RPI - REFRESH STATIONS EVERY 5 DAYS AND SAVE TO DB
schedule.scheduleJob('0 0 */5 * *', function(){
    let date = new Date();
    console.log('Fetching radios...');
    let stations = [];
    const truncateTable = 'TRUNCATE TABLE radiorpi';
    const query = 'INSERT INTO radiorpi (stationuuid, name, url, homepage, tags, country, countrycode, bitrate, votes, icon) VALUES (?)';
    const saveRadioStatusQuery = 'INSERT INTO radio_status (status_code, status_created_at, description) VALUES (?);';
    const config = {
        headers:{
            userAgent: "RadioRPi-APP/1.0"
        }
    };
    axios.get(`https://de1.api.radio-browser.info/json/stations/bycountrycodeexact/cz?order=votes&reverse=true&hidebroken=true&limit=80`, config)
        .then(responseCz => {
            if (responseCz.data) {
                axios.get(`https://de1.api.radio-browser.info/json/stations/bycountrycodeexact/sk?order=votes&reverse=true&hidebroken=true&limit=80`, config)
                    .then(responseSk => {
                        if (responseSk.data) {
                            stations = stations.concat(responseCz.data, responseSk.data);
                            radiorpi.query(truncateTable);
                            for (let i = 0; i < stations.length; i++) {
                                if (!stations[i].tags.includes('rfe-rl')) {
                                    if (stations[i].favicon == null || stations[i].favicon == "") {
                                        stations[i].favicon = 'mstile-150x150.png';
                                    }
                                    const bindings = [[stations[i].stationuuid, stations[i].name, stations[i].url_resolved, stations[i].homepage, stations[i].tags, stations[i].country, stations[i].countrycode, stations[i].bitrate, stations[i].votes, stations[i].favicon]];
                                    radiorpi.query(query, bindings);
                                }
                            }
                            //save fetch status
                            radiorpi.query(saveRadioStatusQuery, [['stations_fetched_success', date.toISOString(), 'no_desc']], (err, results) => {
                                if (err) {
                                    console.log('=== Failed to insert Radio status code SUCCESS at ' + date.toISOString() + '===');
                                    console.log(err);
                                } else {
                                    console.log('=== Fetched Radio stations successfully at ' + date.toISOString() + '===');
                                }
                            });
                        } else {
                            radiorpi.query(saveRadioStatusQuery, [['stations_fetched_failed_apierror', date.toISOString(), 'no_desc']], (err, results) => {
                                if (err) {
                                    console.log('=== Failed to insert Radio status code APIERROR at ' + date.toISOString() + '===');
                                } else {
                                    console.log('=== Could not fetch Radio stations at ' + date.toISOString()+ '===');
                                }
                            });
                        }
                    })
                    .catch(function (error) {
                        radiorpi.query(saveRadioStatusQuery, [['stations_fetched_failed_internalerror', date.toISOString(), error]], (err, results) => {
                            if (err) {
                                console.log('=== Failed to insert Radio status code INTERNALERROR at ' + date.toISOString() + '===');
                            } else {
                                console.log('=== Internal error while fetching Radio stations at ' + date.toISOString() + '===');
                            }
                        });
                    });
            } else {
                radiorpi.query(saveRadioStatusQuery, [['stations_fetched_failed_apierror', date.toISOString(), 'no_desc']], (err, results) => {
                    if (err) {
                        console.log('=== Failed to insert Radio status code APIERROR at ' + date.toISOString() + '===');
                    } else {
                        console.log('=== Could not fetch Radio stations at ' + date.toISOString() + '===');
                    }
                });
            }
        })
        .catch(function (error) {
            radiorpi.query(saveRadioStatusQuery, [['stations_fetched_failed_internalerror', date.toISOString(), error]], (err, results) => {
                if (err) {
                    console.log('=== Failed to insert Radio status code INTERNALERROR at ' + date.toISOString() + '===');
                } else {
                    console.log('=== Internal error while fetching Radio stations at ' + date.toISOString() + '===');
                }
            });
        });
});

module.exports = app;
