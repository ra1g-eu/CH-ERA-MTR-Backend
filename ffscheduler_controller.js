const model = module.require('./ffscheduler_api.js')


//fill xp table
const getSchedule = (req, res) => {
    const data = {'worldId': req.params.worldId};
    model.getSched([data], (err, results) => {
        if (err) {
            res.status(409).send({status: 'error', message: err});
        } else {
            res.status(201).send({status: 'success', message: results});
        }
    });
}

// player registered
const saveSchedule = (req, res) => {
    const data = {
        'schedule': req.body.events,
        'worldId': req.body.worldId,
    };
    model.saveSched([data], (err, results) => {
        if (err) {
            res.status(409).send({status: 'error', message: err});
        } else {
            res.status(201).send({status: 'success', message: results});
        }
    });
}

module.exports = {
    getSchedule,
    saveSchedule
}