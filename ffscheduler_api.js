const ffdb = require('./ffscheduler_db');

// get player XP
const getSched = (data, result) => {
    ffdb.query(`SELECT calendar_events
                FROM schedule
                WHERE gameworld = ${ffdb.escape(data[0].worldId)}`, (err, results) => {
        if(err){
            return result(err, null);
        }
        if (results.length < 1) {
            return result(err, null);
        } else {
            return result(null, results);
        }
    });
}

const saveSched = (data, result) => {
    ffdb.query(`SELECT gameworld FROM schedule WHERE gameworld = ${ffdb.escape(data[0].worldId)}`, (err, results) => {
        //console.log(results);
        if(err){
            return result(err, null);
            console.log("Save schedule select error: "+err);
        }
        if (results.length < 1) {

            ffdb.query(`INSERT INTO schedule (gameworld, calendar_events) VALUES (${ffdb.escape(data[0].worldId)}, ${JSON.stringify(data[0].schedule)})`, (err) => {
                if (err) {
                    console.log("Save schedule insert error: "+err);
                    return result(err, null);
                } else {
                    return result(null, "Successfully saved schedule!");
                }
            });
        } else {
            ffdb.query(`UPDATE schedule SET calendar_events = ${JSON.stringify(data[0].schedule)} WHERE gameworld = ${ffdb.escape(data[0].worldId)}`, (err) => {
                if (err) {
                    console.log("Save schedule update error: "+err);
                    return result(err, null);
                } else {
                    return result(null, "Successfully updated schedule!");
                }
            });
        }
    });

}

module.exports = {
    saveSched,
    getSched
}