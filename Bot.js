const { Bot, InlineKeyboard } = require("grammy");
const dotenv = require('dotenv')
const knex = require('./pg_db/knex.js').default

dotenv.config();

const bot = new Bot(process.env.BOT_KEY); // <- TG bot token here

const firstMenu = "<b>меню окда</b>\n\nмне впадлу будет потом логи чистить...\n\nкогда-нибудь он чему-нибудь научится";

const whoisButton = "Узнать о ПИНовце"
const authorButton = "Связаться с автором"
const meButton = "Мой профиль"

const mainMenuMarkup = new InlineKeyboard().text(whoisButton).text(meButton).row(InlineKeyboard.text(authorButton))

bot.command("start", (ctx) => ctx.reply("Welcome! Up and running."));

bot.command("menu", async (ctx) => {
    await ctx.reply(firstMenu, {
        parse_mode: "HTML",
        reply_markup: mainMenuMarkup,
    })
})

bot.on("message", async (ctx) => { await knex.insert({
    username:ctx.from.username,
    id: ctx.from.id,
    message: ctx.message.text,
  }).into('users');
  console.log(
    `${ctx.from.first_name} wrote ${
      "text" in ctx.message ? ctx.message.text : ""
    }`,
  )});
bot.start();