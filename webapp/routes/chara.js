var express = require('express');
var router = express.Router();

var sqlite3 = require('sqlite3').verbose();

router.get('/get', function(req, res, next) {
    const charaID = req.query.chara_id;
    const userID = req.query.user_id;

    const db = new sqlite3.Database('./webapp.db');
    const data = {"chara":[],"status":""};

    db.serialize(() => {
        db.all(`select * from characters where chara_id = ? and chara_user = ?`,charaID,userID, (err, rows) => {
            if(rows !== undefined) {
                rows.forEach(row => {
                    var chara = {};
                    chara["chara_id"] = row["chara_id"];
                    chara["chara_name"] = row["chara_name"];
                    chara["chara_type"] = row["chara_archetype"];
                    chara["chara_eyes"] = row["chara_eyes"];
                    chara["chara_hair"] = row["chara_hair"];
                    data["chara"].push(chara);
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

router.post('/update', function(req, res, next) {
    const charaID = req.body.chara_id;
    const userID = req.body.user_id;
    const charaName = req.body.chara_name;
    const charaHair = req.body.hair_color;
    const charaEyes = req.body.eye_color;
    const charaType = req.body.chara_type;

    const db = new sqlite3.Database('./webapp.db');

    db.serialize(() => {
        const stmt = db.prepare(`insert or replace into characters (chara_id,chara_name,chara_hair,chara_eyes,chara_archetype,chara_bond,chara_user) values (?,?,?,?,?,0,?)`);
        stmt.run(charaID,charaName,charaHair,charaEyes,charaType,userID, (err) =>{
            if(err === null) {       

                const charaID = stmt.lastID;
                stmt.finalize();
                res.json({"chara_id":charaID});

            } else {
                console.log("CHARA UPDATE ERROR: "+err); // TODO: Error logging
                return;
            }
        });
    });
});

module.exports = router;