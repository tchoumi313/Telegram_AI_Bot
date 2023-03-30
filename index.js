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

const init = async () => {
  const res = await axios.get(`${TELEGRAM_API}/setWebhook?url=${WEBHOOK_URL}`);
  console.log(res.data);
};

// Define your predefined commands and their responses
const commands = {
  "/start":
    "Welcome to DonaldT AI Bot!\n" +
    "This is an AI Assistant based on OPENAI ChatGPT model.\n" +
    "He is here to provide answers to your questions.\n" +
    "Need to create your own bot or any other software development task? Hire me at https://donaldtPortfolio.netlify.app/#contact/",
  "/help":
    "Here are the commands you can use:\n" +
    "/start - Start the bot\n" +
    "/help - Show the available commands\n" +
    "/about - Learn more about the bot" +
    "/donate - support the development community",
  "/about":
    "DonaldT AI Bot is a Telegram bot that uses the OpenAI ChatGPT model to provide answers to your questions. It was created by Donald TCHOUMI, a software developer with a passion for artificial intelligence and machine learning.\n /help - Show the available commands \n Feel free to search what so ever you want ",
  "/donate":
    "If you like this bot and want to support its development, please consider making a donation on the BTC account:" +
    "`bc1qa6mad79c8ge6rherhpwg6wvmhm`" +
    "You can copy this address and use it to send a donation. Thank you for your support!",
};

app.post(URL, async (req, res) => {
  // console.log(req.body);
  const text = req.body.message.text;
  const chat_id = req.body.message.chat.id;
  try {
    let sendMessageBody = {
      chat_id: chat_id,
    };
    if (commands[text]) {
      sendMessageBody.text = commands[text];
    } else {
      const reply = await openai.createCompletion({
        max_tokens: 4000,
        model: "text-davinci-003", //"ada",
        prompt: text,
        temperature: 0.5,
        /*  stop: "\n",
          echo: true,
          n: 1, */
      });

      sendMessageBody.text = reply.data.choices[0].text;
    }
    await axios.post(`${TELEGRAM_API}/sendMessage`, sendMessageBody);
  } catch (error) {
    console.error(error);
    await axios.post(`${TELEGRAM_API}/sendMessage`, {
      chat_id: chat_id,
      text: "Oops, something went wrong!",
    });
  }

  return res.send();
});

app.listen(process.env.PORT || 5000, async (req, res) => {
  console.log("app running on port ", process.env.PORT || 5000);
  await init();
});
