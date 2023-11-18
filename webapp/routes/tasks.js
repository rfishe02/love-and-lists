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
                    task["task_id"] = row["task_id"];
                    task["task_desc"] = row["task_desc"];
                    task["task_staus"] = row["task_status"];

                    data["tasks"].push(task);
                });
                data["status"] = "OK";
                res.json(data);
            } else {
                console.log("TASK GET ERROR: "+err); // TODO: Error logging
                return;
            }
        });
    });

});

router.post('/create', function(req, res, next) {

    const userID = req.body.userID;
    const taskDesc = req.body.taskDesc;

    const db = new sqlite3.Database('./webapp.db');

    db.serialize(() => {
        const stmt = db.prepare(`insert into tasks (task_desc,task_status,task_user) values (?,0,?)`);
        stmt.run(taskDesc,userID, (err) =>{
            if(err === null) {       

                const taskID = stmt.lastID;
                stmt.finalize();

                res.json({"task_id":taskID});

            } else {
                console.log("TASK REATE ERROR: "+err); // TODO: Error logging
                return;
            }
        });
        
    });

});

router.patch('/finish', function(req, res, next) {
    res.send(`Marked task as complete.`);
});

router.delete('/delete', function(req, res, next) {

    const taskID = req.body.taskID;
    const userID = req.body.userID;

    const db = new sqlite3.Database('./webapp.db');

    db.serialize(() => {
        const stmt = db.prepare(`delete from tasks where task_id = ? and task_user = ?`);
        stmt.run(taskID,userID, (err) =>{
            if(err === null) {       

                stmt.finalize();
                res.json({"status":"OK"});

            } else {
                console.log("TASK REATE ERROR: "+err); // TODO: Error logging
                return;
            }
        });
        
    });
    
});

module.exports = router;
