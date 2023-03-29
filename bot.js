const Telegram = require("node-telegram-bot-api");
const { OpenAIApi, Configuration } = require("openai");

const OpenAIAPIKey = "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";
const botToken = "5997255712:AAH3HDkyST-jPBpgCmaVKOh7Q5MD7QWqz8w";

const configuration = new Configuration({
  // organization: "org-yR4wdkzoY6o2ibaWM64CusQ5",
  apiKey: OpenAIAPIKey, //process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const bot = new Telegram(botToken, { polling: true });
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
  //bot.sendMessage(message.chat.id, "thinking");
  const chatId = message.chat.id;
  if (!(message.text == "/start")) {
    const reply = await openai.createCompletion({
      max_tokens: 4000,
      model: "text-davinci-003", //"ada",
      prompt: message.text,
      temperature: 0.5,
      /* stop: "\n",
    echo: true,
    n: 1, */
    });

    bot.sendMessage(chatId, reply.data.choices[0].text);
  }
});

/*
import { Configuration, OpenAIApi } from "openai";
const configuration = new Configuration({
    organization: "org-yR4wdkzoY6o2ibaWM64CusQ5",
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);
const response = await openai.listEngines();
 */
