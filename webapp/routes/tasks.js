var express = require('express');
var router = express.Router();

var sqlite3 = require('sqlite3').verbose();

router.get('/get', function(req, res, next) {
    const userID = req.query.user_id;
    const db = new sqlite3.Database('./webapp.db');
    const data = {"tasks":[],"status":""};

    db.serialize(() => {
        db.all(`select * from tasks where task_user = ? order by task_done asc, task_created asc`,userID, (err, rows) => {
            if(rows !== undefined) {
                rows.forEach(row => {
                    var task = {};
                    task["task_id"] = row["task_id"];
                    task["task_desc"] = row["task_desc"];
                    task["task_created"] = row["task_created"];
                    task["task_completed"] = row["task_completed"];
                    task["task_done"] = row["task_done"];
                    task["task_used"] = row["task_used"];

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
    const userID = req.body.user_id;
    const taskDesc = req.body.task_desc;
    const taskDate = Date.now();

    const db = new sqlite3.Database('./webapp.db');

    db.serialize(() => {
        const stmt = db.prepare(`insert into tasks (task_desc,task_created,task_done,task_used,task_user) values (?,?,0,0,?)`);
        stmt.run(taskDesc,taskDate,userID, (err) =>{
            if(err === null) {       

                const taskID = stmt.lastID;
                stmt.finalize();

                res.json({"task_id":taskID});

            } else {
                console.log("TASK CREATE ERROR: "+err); // TODO: Error logging
                return;
            }
        });
        
    });
});

router.patch('/open', function(req, res, next) {
    res.send(`Marked task as still in progress.`); // TODO: task open?
});

router.patch('/closed', function(req, res, next) {
    const taskID = req.body.task_id;
    const userID = req.body.user_id;
    const taskDate = Date.now();

    const db = new sqlite3.Database('./webapp.db');

    db.serialize(() => {
        const stmt = db.prepare(`update tasks set task_completed = ?, task_done = 1 where task_id = ? and task_user = ?`);
        stmt.run(taskDate,taskID,userID, (err) =>{
            if(err === null) {       

                stmt.finalize();
                res.json({"status":"OK"});

            } else {
                console.log("TASK CREATE ERROR: "+err); // TODO: Error logging
                return;
            }
        });
        
    });
});

router.delete('/delete', function(req, res, next) {
    const taskID = req.body.task_id;
    const userID = req.body.user_id;

    const db = new sqlite3.Database('./webapp.db');

    db.serialize(() => {
        const stmt = db.prepare(`delete from tasks where task_id = ? and task_user = ?`);
        stmt.run(taskID,userID, (err) =>{
            if(err === null) {       

                stmt.finalize();
                res.json({"status":"OK"});

            } else {
                console.log("TASK CREATE ERROR: "+err); // TODO: Error logging
                return;
            }
        });
        
    });
});

module.exports = router;
