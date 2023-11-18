var express = require('express');
var router = express.Router();

var sqlite3 = require('sqlite3').verbose();

router.get('/get', function(req, res, next) {
    const db = new sqlite3.Database('./webapp.db');
    tasks = []

    db.serialize(() => {
        db.all(`select * from tasks`, function (err, rows) {
            if(rows !== undefined) {
                rows.forEach(row => {
                    tasks.push(row);
                });
                res.send(tasks);
            } else {
                console.log(err);
                return;
            }
        });
    });

});

module.exports = router;
