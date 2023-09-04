const { Bot, InlineKeyboard } = require("grammy");
const dotenv = require('dotenv')
const knex = require('./pg_db/knex.js').default

dotenv.config();

const bot = new Bot(process.env.BOT_KEY); // <- TG bot token here

const firstMenu = "<b>меню окда</b>\n\nмне впадлу будет потом логи чистить...\n\nкогда-нибудь он чему-нибудь научится";
const authorMenu = "<b>whois-бот для ПИН-2023</b> \n\nАвтор - @aafgoomm \t vk.com/h2hell \n\nОбратная связь по работе бота приветствуется :)"
const whoisMenu = "<b>Узнайте что ПИНовец написал о себе</b> \n\nВведите Telegram-тэг человека, о котором желаете узнать: "
const newUserMenu = "<b>Кажется, ты ещё не записан, расскажешь о себе?</b>\n\n\В какой ты группе?"
const nameMenu = "<b>Отлично, теперь напиши как тебе удобнее чтобы тебя называли</b>\n\nэтот вопрос можно пропустить..."
const aboutMenu = "<b>Здесь ты можешь написать что угодно о себе</b>\n\nэтот вопрос можно пропустить..."
const endMenu = "<b>Спасибо за регистрацию в системе, теперь другие ПИНовцы смогут узнать тебя получше!</b>\n\nТеперь ты можешь спокойно вернуться в главное меню"
const deleteAgreeMenu = "<b>Уверен, что хочешь удалить свой профиль из базы данных?</b>"
const deleteFinishMenu = "<b>Профиль удален из базы данных</b>"

const whoisButton = "Узнать о ПИНовце"
const authorButton = "Связаться с автором"
const meButton = "Мой профиль"
const PIN11Button = "ПИН-11"
const PIN12Button = "ПИН-12"
const PIN13Button = "ПИН-13"
const PIN14Button = "ПИН-14"
const PIN15Button = "ПИН-15"
const PIN16Button = "ПИН-16"
const PIN17Button = "ПИН-17"
const curatorButton = "Куратор"
const otherButton = "Другая"
const skipButton = "Пропустить вопрос"
const endButton = "Вернуться в главное меню"
const editButton = "Редактировать профиль"
const deleteButton = "Удалить профиль"
const yesButton = "Да"
const noButton = "Нет"

const mainMenuMarkup = new InlineKeyboard().text(whoisButton).text(meButton).row(InlineKeyboard.text(authorButton))
const groupSelectMarkup = new InlineKeyboard().text(PIN11Button).text(PIN12Button).text(PIN13Button)
                          .row(InlineKeyboard.text(PIN14Button), InlineKeyboard.text(PIN15Button), InlineKeyboard.text(PIN16Button))
                          .row(InlineKeyboard.text(PIN17Button), InlineKeyboard.text(curatorButton), InlineKeyboard.text(otherButton))
const skipQuestionMarkup = new InlineKeyboard().text(skipButton)
const endMarkup = new InlineKeyboard().text(endButton)
const profileMarkup = new InlineKeyboard().text(editButton).row(InlineKeyboard.text(deleteButton))
const deleteAgreeMarkup = new InlineKeyboard().text(yesButton).text(noButton)

let asking = false
let editing_step = 0

bot.command("start", (ctx) => ctx.reply("жесть он работает ну пиши /menu че сказать"));

bot.command("menu", async (ctx) => {
    asking = false
    editing_step = 0
    await ctx.reply(firstMenu, {
        parse_mode: "HTML",
        reply_markup: mainMenuMarkup,
    })
})


bot.callbackQuery(authorButton, async (ctx) => {
    asking = false
    editing_step = 0
    await ctx.reply(authorMenu, {parse_mode: "HTML"})
    await ctx.answerCallbackQuery()
})

bot.callbackQuery(whoisButton, async (ctx) => {
    asking = false
    editing_step = 0
    await ctx.reply(whoisMenu, {parse_mode: "HTML"})
    editing_step = 0
    asking = true
    await ctx.answerCallbackQuery()
})

bot.callbackQuery(meButton, async (ctx) => {
    asking = false
    let userData = await knex('users').where({id: ctx.from.id}).distinct()
    console.log(userData)
    console.log(ctx.callbackQuery.data) 
    if (Object.values(userData).length == 0) {
        editing_step = 1
        await ctx.reply(newUserMenu, {
          parse_mode: "HTML", 
          reply_markup: groupSelectMarkup
        })
        await knex.insert({
          username: ctx.from.username,
          id: ctx.from.id,
          known_as: ctx.from.first_name,
          message: "не указано",
          name: "не указано",
          group: "не указана"
      }).into('users')
        //TODO USER PROFILE CREATING
    }
    else {
        // let username = await knex('users').where({id: userData[0].id}).distinct('username')
        // console.log(username)
        let existingUserMenu = `<b>Твой профиль, ${userData[0].username}: </b>\n\nИмя: ${userData[0].name}\n\nГруппа: ${userData[0].group}\n\nО себе: ${userData[0].message}`  //TODO REFACTOR
        await ctx.reply(existingUserMenu, {
          parse_mode: "HTML", 
          reply_markup: profileMarkup
        })
    }
    await ctx.answerCallbackQuery()
})

bot.callbackQuery(editButton, async (ctx) => {
  asking = false
  editing_step = 1
  await ctx.reply(newUserMenu, {
    parse_mode: "HTML", 
    reply_markup: groupSelectMarkup
  })
  await ctx.answerCallbackQuery()
})

bot.callbackQuery(deleteButton, async (ctx) => {
  asking = false
  editing_step = 4
  await ctx.reply(deleteAgreeMenu, {
    parse_mode: "HTML",
    reply_markup: deleteAgreeMarkup
  })
  await ctx.answerCallbackQuery()
})

bot.callbackQuery([yesButton, noButton], async (ctx) => {
  asking = false
  if (editing_step == 4) {
    if (ctx.callbackQuery.data == "Да") {
      await knex('users').where({id: ctx.from.id}).del()
      await ctx.reply(deleteFinishMenu, {parse_mode: "HTML", reply_markup: endMarkup})
    }
    else {
      await ctx.reply(firstMenu, {parse_mode: "HTML", reply_markup: mainMenuMarkup})
    }
  }
  editing_step = 0
  await ctx.answerCallbackQuery()
})

bot.callbackQuery([PIN11Button, PIN12Button, PIN13Button, 
                   PIN14Button, PIN15Button, PIN16Button, 
                   PIN17Button, curatorButton, otherButton], async (ctx) => {
    asking = false                
    if (editing_step == 1) {
      await knex('users')
        .where({id: ctx.from.id})
        .update({group: ctx.callbackQuery.data})
      await ctx.reply(nameMenu, {
        parse_mode: "HTML",
        reply_markup: skipQuestionMarkup
      })
      editing_step = 2
    }
    await ctx.answerCallbackQuery()
})

bot.callbackQuery(skipButton, async(ctx) => {
  asking = false
  //TODO ABOUT AND END
  if (editing_step == 2) {
    await ctx.reply(aboutMenu, {
      parse_mode: "HTML",
      reply_markup: skipQuestionMarkup
    })
    editing_step += 1
  }
  else if (editing_step == 3) {
    await ctx.reply(endMenu, {
      parse_mode: "HTML",
      reply_markup: endMarkup
    })
    editing_step = 0
  }
  await ctx.answerCallbackQuery()
})

bot.callbackQuery(endButton, async(ctx) => {
  editing_step = 0
  asking = false
  await ctx.reply(firstMenu, {
    parse_mode: "HTML",
    reply_markup: mainMenuMarkup
  })

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
    let userTag = ctx.message.text
    if (ctx.message.text[0] == '@') {
      userTag = ctx.message.text.slice(1)
    }
    let userData = await knex('users').where({username: userTag}).distinct()
    console.log(userData)
    if (Object.values(userData).length == 0) {
      await ctx.reply(`В моей базе данных нет такого пользователя...`)
    }
    else {
      await ctx.reply(`@${userData[0].username} (${userData[0].known_as})\n\nИмя: ${userData[0].name}\n\nГруппа: ${userData[0].group}\n\nО себе: ${userData[0].message}`) //TODO REFACTOR
    }
  }
  else if (editing_step == 2) {
    await knex('users')
      .where({id: ctx.from.id})
      .update({name: ctx.message.text})
    await ctx.reply(aboutMenu, {
      parse_mode: "HTML",
      reply_markup: skipQuestionMarkup
    })
    editing_step = 3
  }
  else if (editing_step == 3) {
    await knex('users')
      .where({id: ctx.from.id})
      .update({message: ctx.message.text})
    await ctx.reply(endMenu, {
      parse_mode: "HTML",
      reply_markup: endMarkup
    })
    editing_step = 0
  }
});


bot.start();