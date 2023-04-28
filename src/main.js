import { Telegraf } from 'telegraf'
import { message } from 'telegraf/filters'
import config from 'config'
import { ogg } from './ogg.js'
import { openai } from './openai.js'

const bot = new Telegraf(config.get('TELEGRAM_TOKEN'))

bot.on(message('voice'), async ctx => {
    try {
        const link = await ctx.telegram.getFileLink(ctx.message.voice.file_id)
        const userId = String(ctx.message.from.id) 
        const oggPath = await ogg.create(link.href, userId)
        const mp3Path = await ogg.toMp3(oggPath, userId)

        const text = await openai.transcription(mp3Path)
        const response = await openai.chat(text)

        await ctx.reply(mp3Path)
    } catch(e) {
      console.log('Error Voice', e.message)
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

