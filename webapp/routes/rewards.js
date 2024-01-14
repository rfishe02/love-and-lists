var express = require('express');
var router = express.Router();

var sqlite3 = require('sqlite3').verbose();

var fs = require('fs');
var path = require('path');

var openai = require('../modules/openai.js');

router.post('/create', async function(req, res, next) {
    try {
        const userID = req.body.user_id;
        const charaName = req.body.chara_name;
        const charaHair = req.body.chara_hair;
        const charaEyes = req.body.chara_eyes;
        const charaType = req.body.chara_type;
        const rewardContext = req.body.task_desc;

        const date = Date.now();
        var filename = "";
        var paragraph = "";

        const textContent = await openai.getTextRewardContent(charaName,charaType,rewardContext);
        const imageContent = await openai.getImageRewardContent(charaHair,charaEyes,charaType,rewardContext);

        if(imageContent) {
            try {
                filename = date + ".png";
                const userUploadDir = path.join(__dirname,'..','uploads',userID+"");
                const filePath = path.join(userUploadDir,filename);
                const binaryData = Buffer.from(imageContent.content, 'base64');

                if (!fs.existsSync(userUploadDir)) {
                    fs.mkdirSync(userUploadDir, { recursive: true });
                }
                fs.writeFile(filePath, binaryData, (err) => {
                    if (err) {
                        // TODO: Error logging
                        console.log(err);
                    }
                });
            } catch (err) {
                // TODO: Error logging
                console.log(err);
            }
        }

        if(textContent) {
            paragraph = textContent.content;
        }
        
        // TODO: Insert the reward, regarless of success, so it may be regenerated (with limits)?
        const db = new sqlite3.Database('./webapp.db'); 
        db.serialize(() => {
            const stmt = db.prepare(`insert into rewards (reward_date,reward_context,reward_filename,reward_paragraph,reward_seen,reward_user) values (?,?,?,?,0,?)`);
            stmt.run(date, rewardContext, filename, paragraph, userID, (err) =>{
                if(err == null) {       
                    const rewardID = stmt.lastID;
                    stmt.finalize();
                    res.json({"reward_id":rewardID});      
                } else {
                    // TODO: Error logging
                    next(err);
                }
            });
        });

    } catch (err) {
      next(err);
    }
});

router.get('/get', function(req, res, next) {
    const userID = req.query.user_id;
    const db = new sqlite3.Database('./webapp.db');
    const data = {"rewards":[],"status":""};

    db.serialize(() => {
        db.all(`select * from rewards where reward_user = ?`,userID, (err, rows) => {
            if(rows !== undefined) {
                rows.forEach(row => {
                    var reward = {};

                    reward["reward_id"] = row["reward_id"];
                    reward["reward_filename"] = row["reward_filename"]
                    reward["reward_paragraph"] = row["reward_paragraph"];
                    reward["reward_seen"] = row["reward_seen"];
                    reward["reward_user"] = row["reward_user"];

                    data["rewards"].push(reward);
                });
                data["status"] = "OK";
                res.json(data);
            } else {
                console.log("REWARD GET ERROR: "+err); // TODO: Error logging
                return;
            }
        });
    });

});

router.get('/all', function(req, res, next) {
    const db = new sqlite3.Database('./webapp.db');
    const data = {"rewards":[],"status":""};

    db.serialize(() => {
        db.all(`select * from rewards`,(err, rows) => {
            if(rows !== undefined) {
                rows.forEach(row => {
                    var reward = {};

                    reward["reward_id"] = row["reward_id"];
                    reward["reward_filename"] = row["reward_filename"]
                    reward["reward_paragraph"] = row["reward_paragraph"];
                    reward["reward_seen"] = row["reward_seen"];
                    reward["reward_user"] = row["reward_user"];

                    data["rewards"].push(reward);
                });
                data["status"] = "OK";
                res.json(data);
            } else {
                console.log("REWARD GET ERROR: "+err); // TODO: Error logging
                return;
            }
        });
    });

});

module.exports = router;
