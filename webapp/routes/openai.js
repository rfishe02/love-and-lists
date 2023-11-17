var express = require('express');
var router = express.Router();

require('dotenv').config();
const { OpenAI } = require('openai');
const openai = new OpenAI({apiKey: process.env.OPENAI_API_KEY});

router.get('/chat', async function(req, res, next) {

  message = [{ role: "system", content: "You are a helpful AI assistant." }];
  message.push({role: "user", content: "Hello."});

  const chatCompletion = await openai.chat.completions.create({
    messages: message,
    model: "gpt-3.5-turbo",
  });

  res.send(chatCompletion.choices[0]);

});

router.get('/image', async function(req, res, next) {

  const image = await openai.images.generate({ model: "dall-e-3", prompt: "A cute baby sea otter" });
  res.send(image.data);

});

module.exports = router;
