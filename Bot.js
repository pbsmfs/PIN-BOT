const { Bot, InlineKeyboard } = require("grammy");
const dotenv = require('dotenv')

dotenv.config();

const bot = new Bot(process.env.BOT_KEY); // <- TG bot token here

bot.command("start", (ctx) => ctx.reply("Welcome! Up and running."));

bot.on("message", (ctx) => ctx.reply("Got another message!"));

bot.start();