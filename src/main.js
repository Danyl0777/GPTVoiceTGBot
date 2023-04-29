import { Telegraf, session } from 'telegraf'
import { message } from 'telegraf/filters'
import { code } from 'telegraf/format'
import config from 'config'
import { ogg } from './ogg.js'
import { openai } from './openai.js'

const INITIAL_SESSION = {
    messages: [],
}

const bot = new Telegraf(config.get('TELEGRAM_TOKEN'))

bot.use(session())

bot.command('new', async ctx => {
    ctx.session = INITIAL_SESSION
    await ctx.reply('Жду сообщение от Вас.')
})

bot.on(message('voice'), async ctx => {
    try {
        await ctx.reply(code('Сообщение принято. Ожидание сервера...'))
        const link = await ctx.telegram.getFileLink(ctx.message.voice.file_id)
        const userId = String(ctx.message.from.id) 
        const oggPath = await ogg.create(link.href, userId)
        const mp3Path = await ogg.toMp3(oggPath, userId)

        const text = await openai.transcription(mp3Path)
        await ctx.reply(code(`Ваше запрос: ${text}`))
        
        const messages = [{ role: openai.roles.USER, content: text }]
        const response = await openai.chat(messages)
        
        await ctx.reply(response.content)

    } catch(e) {
      console.log('Error Voice!', e.message)
    }
})

bot.command('start', async ctx => {
    try {
        await ctx.reply("Запиши голосовое сообщение.")
    } 
    catch(e) {
        console.log('Error Command', e.message)
    }
})

bot.launch()

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))

