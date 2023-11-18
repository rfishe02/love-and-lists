var express = require('express');
var router = express.Router();

var sqlite3 = require('sqlite3').verbose();

router.get('/get', function(req, res, next) {
    const userID = req.query.userID;
    const db = new sqlite3.Database('./webapp.db');
    const data = {"tasks":[],"status":""};

    db.serialize(() => {
        db.all(`select * from tasks where task_user = ?`,userID, (err, rows) => {
            if(rows !== undefined) {
                rows.forEach(row => {
                    var task = {};
                    task["task_desc"] = row["task_desc"];
                    task["task_staus"] = row["task_status"];
                    
                    data["tasks"].push(task);
                });
                data["status"] = "OK";
                res.json(data);
            } else {
                console.log(err); // TODO: Error logging
                data["status"] = "ERROR";
                return;
            }
        });
    });

});



module.exports = router;
