import TelegramBot from 'node-telegram-bot-api'

let bot: TelegramBot | null = null

export function getBot(): TelegramBot {
  if (!bot) {
    if (!process.env.TELEGRAM_BOT_TOKEN) {
      throw new Error('TELEGRAM_BOT_TOKEN is not set')
    }
    bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: false })
  }
  return bot
}
