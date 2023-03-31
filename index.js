require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const Telegram = require("node-telegram-bot-api");
const { OpenAIApi, Configuration } = require("openai");

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY, //,OpenAIAPIKey
});
const openai = new OpenAIApi(configuration);

/*
const bot = new Telegram(process.env.TELEGRAM_BOT_TOKEN, {
  params: { allowed_updates: true, timeout: 60 },
});
bot.onText(/\/start/, (message) => {
  bot.sendMessage(
    message.chat.id,
    "Welcome to DonaldT AI Bot!\n" +
      "This is an AI Assitant base on OPENAI ChatGPT model.\n" +
      "He is here to provide answer to your questions.\n" +
      "Need to create your own bot or any other Software development task? Hire me at https://donaldtPortfolio.netlify.app/#contact/"
  );
});

bot.on("message", async (message) => {
  const chatId = message.chat.id;
  if (!(message.text == "/start")) {
    const reply = await openai.createCompletion({
      max_tokens: 4000,
      model: "text-davinci-003", //"ada",
      prompt: message.text,
      temperature: 0.5,
       stop: "\n",
    echo: true,
    n: 1, 
    });

    bot.sendMessage(chatId, reply.data.choices[0].text);
  }
});
*/
const { SERVER_URL, TELEGRAM_BOT_TOKEN, OPENAI_API_KEY } = process.env;
const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;
const URL = `/webhook/${TELEGRAM_BOT_TOKEN}`;
const WEBHOOK_URL = SERVER_URL + URL;

const app = express();
app.use(bodyParser.json());

const init = async() => {
    const res = await axios.get(`${TELEGRAM_API}/setWebhook?url=${WEBHOOK_URL}`);
    console.log(res.data);
};

// Define your predefined commands and their responses
const commands = {
    "/start": "Welcome to DonaldT AI Bot!\n" +
        "This is an AI Assistant based on OPENAI ChatGPT model.\n" +
        "He is here to provide answers to your questions.\n" +
        "Need to create your own bot or any other software development task? Hire me at https://donaldtPortfolio.netlify.app/#contact/",
    "/help": "Here are the commands you can use:\n" +
        "/start - Start the bot\n" +
        "/help - Show the available commands\n" +
        "/about - Learn more about the bot\n" +
        "/donate - support the development community",
    "/about": "DonaldT AI Bot is a Telegram bot that uses the OpenAI ChatGPT model to provide answers to your questions. It was created by Donald TCHOUMI, a software developer with a passion for artificial intelligence and machine learning.\n /help - Show the available commands \n Feel free to search what so ever you want ",
    "/donate": "If you like this bot and want to support its development, please consider making a donation on the BTC account:\n" +
        "bc1qa6mad79c8ge6rherhpwg6wvmhm\n" +
        "You can copy this address and use it to send a donation. Thank you for your support!",
};

app.post(URL, async(req, res) => {
    // console.log(req.body);
    const text = req.body.message.text;
    const chat_id = req.body.message.chat.id;
    const message_id = req.body.message.message_id;
    const reply_to_message_id = req.body.message.reply_to_message ? .message_id;
    const max_tokens = 4000
    try {
        let sendMessageBody = {
            chat_id: chat_id,
        };
        if (reply_to_message_id) {
            sendMessageBody.reply_to_message_id = reply_to_message_id;
        } else {
            sendMessageBody.reply_to_message_id = message_id; // Set message_id as the default value for reply_to_message_id 
        }
        if (commands[text]) {
            sendMessageBody.text = commands[text];
        } else {
            const prompt = req.body.message.reply_to_message ? .text + " " + text; // Add the previous message's text to the prompt for OpenAI API
            // Check length of prompt
            const prompt_length = prompt.split(" ").length;

            // If prompt length exceeds max_tokens, truncate prompt
            if (prompt_length > max_tokens) {
                const prompt_truncated = prompt.split(" ").slice(0, max_tokens).join(" ");
                const response = await openai.complete({
                    engine: 'davinci',
                    prompt: prompt_truncated,
                    max_tokens: max_tokens
                });
                // Send truncated response to user
                sendMessageBody.text = response.data.choices[0].text;
                await axios.post(`${TELEGRAM_API}/sendMessage`, sendMessageBody);
            } else {
                const response = await openai.complete({
                    engine: 'davinci',
                    prompt: prompt,
                    max_tokens: max_tokens
                });
                // Send response to user
                sendMessageBody.text = response.data.choices[0].text;
                await axios.post(`${TELEGRAM_API}/sendMessage`, sendMessageBody);
            }
            /* const reply = await openai.createCompletion({
                max_tokens: 4000,
                model: "text-davinci-003", //"ada",
                prompt: text,
                temperature: 0.5, */


            //sendMessageBody.text = reply.data.choices[0].text;
        }
    } catch (error) {
        console.error(error);
        await axios.post(`${TELEGRAM_API}/sendMessage`, {
            chat_id: chat_id,
            text: "Sorry, there was an error processing your request.",
        });
    }
    return res.send();
});

/* app.post(URL, async (req, res) => {
  console.log(req.body);
  const text = req.body.message.text;
  const chat_id = req.body.message.chat.id;
  try {
    let sendMessageBody = {
      chat_id: chat_id,
    };
    if (commands[text]) {
      sendMessageBody.text = commands[text];
    } else {
      const prompt = `Generate an image of ${text}`;
      const response = await openai.createImage({
        prompt: prompt,
        n: 1,
        size: "256x256",
        responseFormat: "url",
        model: "image-alpha-001",
      });
      sendMessageBody.photo = response.data.data[0].url;
    }
    await axios.post(`${TELEGRAM_API}/sendPhoto`, sendMessageBody, {
      headers: {
        "Content-Type": "applicationa /json",
      },
    });
  } catch (error) {
    console.error(error);
    await axios.post(`${TELEGRAM_API}/sendMessage`, {
      chat_id: chat_id,
      text: "Oops, something went wrong!",
    });
  }

  return res.send;
}); */

app.listen(process.env.PORT || 5000, async(req, res) => {
    console.log("app running on port ", process.env.PORT || 5000);
    await init();
});