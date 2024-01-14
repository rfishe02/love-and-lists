var express = require('express');
var router = express.Router();

var openai = require('../modules/openai.js');

router.get('/get', async function(req, res, next) {
  const charaName = req.query.chara_name;
  const charaHair = req.query.chara_hair;
  const charaEyes = req.query.chara_eyes;
  const charaType = req.query.chara_type;
  const taskDesc = req.query.task_desc;

  const textContent = await openai.getTextRewardContent(charaName,charaType,taskDesc);
  const imageContent = await openai.getImageRewardContent(charaHair,charaEyes,charaType,taskDesc);

  res.json({"text":textContent.content,"image":imageContent.content});
});

module.exports = router;
