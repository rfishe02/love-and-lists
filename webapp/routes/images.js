
var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');

router.get('/get', async function(req, res, next) {
    try {
      const user_id = req.query.user_id + "";
      const filename = req.query.filename + "";

      const filePath = path.join(__dirname,'..','uploads',user_id,filename);
      res.sendFile(filePath);
    } catch(err) {
      next(err);
    }
});

module.exports = router