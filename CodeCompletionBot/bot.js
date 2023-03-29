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
app.post(URL, async (req, res) => {
  console.log(req.body);
  const text = req.body.message.text;
  const chat_id = req.body.message.chat.id;
  try {
    let sendMessageBody = {
      chat_id: chat_id,
    };
    if (text == "/start") {
      sendMessageBody.text =
        "Welcome to DonaldT AI Bot!\n" +
        "This is an AI Assitant base on OPENAI Codex model.\n" +
        "He is here to help you code faster, he provide answers to your questions.\n" +
        "Need to create your own bot or any other Software development task? Hire me at https://donaldtPortfolio.netlify.app/#contact/";
    } else {
      const reply = await openai.createCompletion({
        max_tokens: 4000,
        model: "davinci-002", //"ada",
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
