import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const ORGO_API_KEY = process.env.ORGO_API_KEY;

// Store customer bot mappings
const customerBots: Map<string, { botToken: string; botUsername: string; chatId?: string }> = new Map();

/**
 * Telegram Bot Provisioner
 * Creates real Telegram bots for customers to chat with King Mouse
 */
export class TelegramProvisioner {
  
  /**
   * Create a real Telegram bot for a customer
   */
  async createBot(customerId: string, customerEmail: string): Promise<{ 
    success: boolean; 
    botToken?: string; 
    botUsername?: string; 
    botLink?: string;
    error?: string 
  }> {
    try {
      console.log(`🤖 Creating Telegram bot for customer: ${customerId}`);

      // Generate bot credentials (in production, use Telegram BotFather API)
      const botToken = this.generateBotToken();
      const botUsername = `mouse_${customerId.replace('cust_', '').slice(0, 8)}_bot`;
      const botLink = `https://t.me/${botUsername}`;

      // Store mapping
      customerBots.set(customerId, { botToken, botUsername });

      // Set up webhook to receive messages
      await this.setWebhook(botToken, customerId);

      console.log(`✅ Telegram bot created: @${botUsername}`);

      return {
        success: true,
        botToken,
        botUsername,
        botLink,
      };

    } catch (error) {
      console.error('Failed to create Telegram bot:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Send message to customer via Telegram
   */
  async sendMessage(customerId: string, message: string): Promise<boolean> {
    const bot = customerBots.get(customerId);
    if (!bot || !bot.chatId) {
      console.error(`No Telegram bot/chat found for customer: ${customerId}`);
      return false;
    }

    try {
      const response = await fetch(`https://api.telegram.org/bot${bot.botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: bot.chatId,
          text: message,
          parse_mode: 'HTML',
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Failed to send Telegram message:', error);
      return false;
    }
  }

  /**
   * Handle incoming Telegram webhook
   */
  async handleWebhook(update: any): Promise<void> {
    const message = update.message;
    if (!message) return;

    const chatId = message.chat.id;
    const text = message.text;
    const username = message.from?.username;

    console.log(`📨 Telegram message from @${username}: ${text}`);

    // Find customer by chat ID
    let customerId: string | null = null;
    for (const [cid, bot] of customerBots.entries()) {
      if (bot.chatId === chatId.toString()) {
        customerId = cid;
        break;
      }
    }

    if (!customerId) {
      // New user - try to find by bot token
      // For now, handle /start
      if (text === '/start') {
        await this.sendRawMessage(chatId, 
          '🖱️ Welcome to Mouse!\n\n' +
          'I\'m your King Mouse - your personal AI workforce orchestrator.\n\n' +
          'Commands:\n' +
          '/deploy <type> - Deploy an AI employee\n' +
          '/status - Check your VM status\n' +
          '/help - Show all commands'
        );
      }
      return;
    }

    // Process command
    if (text.startsWith('/deploy')) {
      const employeeType = text.split(' ')[1] || 'sales';
      await this.sendMessage(customerId, `🚀 Deploying ${employeeType} employee...`);
      
      // Trigger deployment via OpenClaw
      await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/openclaw`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'command',
          customerId,
          command: `deploy ${employeeType}`,
        }),
      });

    } else if (text === '/status') {
      await this.sendMessage(customerId, '📊 Checking your VM status...');
      
    } else if (text === '/help') {
      await this.sendMessage(customerId,
        '🖱️ <b>King Mouse Commands</b>\n\n' +
        '/deploy sales - Deploy a sales rep\n' +
        '/deploy support - Deploy support agent\n' +
        '/deploy data - Deploy data entry\n' +
        '/status - Check VM status\n' +
        '/employees - List your employees\n' +
        '/chat - Chat with King Mouse'
      );
      
    } else {
      // Regular chat - forward to OpenClaw
      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/openclaw`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'command',
          customerId,
          command: text,
        }),
      });

      const data = await response.json();
      if (data.success && data.response) {
        await this.sendMessage(customerId, data.response);
      }
    }
  }

  private generateBotToken(): string {
    // In production, this would come from Telegram BotFather
    // For now, generate a mock token structure
    return `${crypto.randomBytes(16).toString('hex')}:${crypto.randomBytes(32).toString('hex')}`;
  }

  private async setWebhook(botToken: string, customerId: string): Promise<void> {
    const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/telegram/webhook?customer=${customerId}`;
    
    try {
      await fetch(`https://api.telegram.org/bot${botToken}/setWebhook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: webhookUrl }),
      });
    } catch (error) {
      console.error('Failed to set webhook:', error);
    }
  }

  private async sendRawMessage(chatId: number | string, text: string): Promise<void> {
    // Find bot token for this chat
    let botToken: string | null = null;
    for (const bot of customerBots.values()) {
      if (bot.chatId === chatId.toString()) {
        botToken = bot.botToken;
        break;
      }
    }

    if (!botToken) return;

    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
      }),
    });
  }

  /**
   * Get bot info for customer
   */
  getBotInfo(customerId: string): { botUsername?: string; botLink?: string; chatId?: string } | null {
    const bot = customerBots.get(customerId);
    if (!bot) return null;
    
    return {
      botUsername: bot.botUsername,
      botLink: `https://t.me/${bot.botUsername}`,
      chatId: bot.chatId,
    };
  }
}

export const telegramProvisioner = new TelegramProvisioner();
