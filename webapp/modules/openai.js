
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

async function getTextRewardContent(charaName,charaType,taskDesc) {
    const textContent = {"content":"","status":false};

    try {
        message = [{ role: "system", content: getSystem(charaName,charaType) }];
        message.push({role: "user", content: createChatPrompt(charaName,taskDesc)});

        const chatCompletion = await openai.chat.completions.create({
            messages: message, 
            model: "gpt-3.5-turbo",
        });

        textContent.content = chatCompletion.choices[0].message.content;
        textContent.status = true;  

    } catch (err) {
        console.log(err);
    }

    return textContent;
}

async function getImageRewardContent(charaHair,charaEyes,charaType,taskDesc) {
    const imageContent = {"content":"","status":false};

    try {
        const image = await openai.images.generate({ 
            prompt: createImagePrompt(charaHair,charaEyes,charaType,taskDesc),
            model: "dall-e-3", 
            n:1, 
            quality:'standard',  
            response_format: 'b64_json',
            size: '1024x1024',
            style: 'vivid'
        });

        imageContent.content = image.data[0].b64_json;
        imageContent.status = true;

    }catch(err) {
        console.log(err);
    }

    return imageContent
}

module.exports = {
    getTextRewardContent,
    getImageRewardContent,
};