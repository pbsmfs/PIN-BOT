const { Bot, InlineKeyboard } = require("grammy");
const dotenv = require('dotenv')
const knex = require('./pg_db/knex.js').default

dotenv.config();

const bot = new Bot(process.env.BOT_KEY); // <- TG bot token here

const firstMenu = "<b>меню окда</b>\n\nмне впадлу будет потом логи чистить...\n\nкогда-нибудь он чему-нибудь научится";
const authorMenu = "<b>whois-бот для ПИН-2023</b> \n\nАвтор - @aafgoomm \t vk.com/h2hell \n\n Обратная связь по работе бота приветствуется :)"
const whoisMenu = "<b>Узнайте что ПИНовец написал о себе</b> \n\nВведите Telegram-тэг человека, о котором желаете узнать: "
const newUserMenu = "<b>Кажется, ты ещё не записан, расскажешь о себе?</b>\n\n\В какой ты группе?"


const whoisButton = "Узнать о ПИНовце"
const authorButton = "Связаться с автором"
const meButton = "Мой профиль"

const mainMenuMarkup = new InlineKeyboard().text(whoisButton).text(meButton).row(InlineKeyboard.text(authorButton))

let asking = false
let editing_step = 0

bot.command("start", (ctx) => ctx.reply("Welcome! Up and running."));

bot.command("menu", async (ctx) => {
    editing_step = 0
    await ctx.reply(firstMenu, {
        parse_mode: "HTML",
        reply_markup: mainMenuMarkup,
    })
})


bot.callbackQuery(authorButton, async (ctx) => {
    editing_step = 0
    await ctx.reply(authorMenu, {parse_mode: "HTML"})
    await ctx.answerCallbackQuery()
})

bot.callbackQuery(whoisButton, async (ctx) => {
    await ctx.reply(whoisMenu, {parse_mode: "HTML"})
    editing_step = 0
    asking = true
    await ctx.answerCallbackQuery()
})

bot.callbackQuery(meButton, async (ctx) => {
    let userId = await knex('users').where({id: ctx.from.id}).select('id')
    console.log(userId)
    console.log(userId[0].id)
    if (Object.values(userId).length == 0) {
        await knex.insert({
            username: ctx.from.username,
            id: ctx.from.id,
            name: ctx.from.first_name
        }).into('users')
        await ctx.reply(newUserMenu, {parse_mode: "HTML"})
        editing_step = 1
        //TODO USER PROFILE CREATING
    }
    else {
        let username = await knex('users').where({id: userId[0].id}).distinct('username')
        // console.log(username)
        const existingUserMenu = `<b>Твой профиль, ${username[0].username}: </b>\n\nпринтер`
        await ctx.reply(existingUserMenu, {parse_mode: "HTML"})
    }
    await ctx.answerCallbackQuery()
})


bot.on("message", async (ctx) => { 
//     await knex.insert({
//     username:ctx.from.username,
//     id: ctx.from.id,
//     message: ctx.message.text,
//   }).into('users');
// TODO LOGGING
  console.log(
    `${ctx.from.first_name} wrote ${
      "text" in ctx.message ? ctx.message.text : ""
    }`,)
  if (asking == true) {
    ctx.reply("xd")
    asking = false
  }
});


bot.start();