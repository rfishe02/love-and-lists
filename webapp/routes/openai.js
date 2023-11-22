var express = require('express');
var router = express.Router();

require('dotenv').config();
const { OpenAI } = require('openai');
const openai = new OpenAI({apiKey: process.env.OPENAI_API_KEY});

function getSystem(charaName,charaType) {
  return `You are a writer for an Otome game. You're writing about ${charaName}, a male character with a ${charaType} personality. Don't mention the word ${charaType}, but allude to it.`
}

function createChatPrompt(charaName,taskDesc) {
  return `Write a short paragraph for a moment where ${charaName} offers praise for doing the activity: ${taskDesc}.`
}

function createImagePrompt(charHair,charEyes,charaType,taskDesc) {
  return `anime style illustration, vibrant and detailed, male otome character with ${charHair} hair and ${charEyes} eyes, ${charaType} personality, context of ${taskDesc}, cozy atmosphere`;
}

router.get('/get', async function(req, res, next) {
  const charaName = req.query.chara_name;
  const charaHair = req.query.chara_hair;
  const charaEyes = req.query.chara_eyes;
  const charaType = req.query.chara_type;
  const taskDesc = req.query.task_desc;

  message = [{ role: "system", content: getSystem(charaName,charaType) }];
  message.push({role: "user", content: createChatPrompt(charaName,taskDesc)});

  const chatCompletion = await openai.chat.completions.create({
    messages: message, 
    model: "gpt-3.5-turbo",
  });

  const image = await openai.images.generate({ 
    prompt: createImagePrompt(charaHair,charaEyes,charaType,taskDesc),
    model: "dall-e-3", 
    n:1, 
    quality:'standard',  
    response_format: 'url',
    size: '1024x1024',
    style: 'vivid'
  });

  res.json({"text":chatCompletion.choices[0].message.content,"image":image.data[0].url});
});

module.exports = router;
