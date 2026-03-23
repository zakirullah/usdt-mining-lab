// Telegram Notification Service for USDT Mining Lab
// Sends to TWO groups:
// 1. Private Channel (-1003821953548) - Full details (wallet, amount, etc.)
// 2. Public Group (-1003551540968) - Secure info (hidden wallet)

const BOT_TOKEN = '8705535597:AAFJbrhKJrxbQCrM4dnAMr1tAa8d4ShqcqI';
const PRIVATE_CHAT_ID = '-1003821953548'; // Private channel - full details
const PUBLIC_GROUP_ID = '-1003551540968'; // Public group - secure info

// Send message to Telegram
async function sendToChat(chatId: string, text: string): Promise<boolean> {
  try {
    const response = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: text,
          parse_mode: 'HTML',
          disable_web_page_preview: true,
        }),
      }
    );
    
    const result = await response.json();
    if (!result.ok) {
      console.error('Telegram error:', result);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Telegram send error:', error);
    return false;
  }
}

// Send notifications to both groups
export async function sendDualNotifications(privateMsg: string, publicMsg: string): Promise<void> {
  // Send to private (full details)
  sendToChat(PRIVATE_CHAT_ID, privateMsg).catch(console.error);
  // Send to public (secure info)
  sendToChat(PUBLIC_GROUP_ID, publicMsg).catch(console.error);
}

// Notification helpers
export const TelegramNotifications = {
  newUser: (wallet: string) => {
    const time = new Date().toLocaleString();
    sendDualNotifications(
      `🔒 <b>NEW USER REGISTERED</b>\n\n<b>Wallet:</b> <code>${wallet}</code>\n<b>Time:</b> ${time}\n\n🚀 USDT Mining Lab`,
      `👤 <b>NEW MINER JOINED!</b>\n\n🎉 Welcome to USDT Mining Lab!\n<b>Time:</b> ${time}\n\n🚀 Happy Mining!`
    );
  },

  newDeposit: (wallet: string, amount: number, txHash?: string) => {
    const time = new Date().toLocaleString();
    sendDualNotifications(
      `💰 <b>NEW DEPOSIT</b>\n\n<b>Wallet:</b> <code>${wallet}</code>\n<b>Amount:</b> $${amount.toFixed(2)} USDT\n${txHash ? `<b>TxHash:</b> <code>${txHash}</code>\n` : ''}<b>Status:</b> Pending\n<b>Time:</b> ${time}\n\n🚀 USDT Mining Lab`,
      `💰 <b>NEW DEPOSIT</b>\n\n<b>User:</b> <code>****${wallet.slice(-4)}</code>\n<b>Amount:</b> $${amount.toFixed(2)} USDT\n<b>Time:</b> ${time}\n\n✅ USDT Mining Lab`
    );
  },

  newWithdrawal: (wallet: string, amount: number) => {
    const time = new Date().toLocaleString();
    sendDualNotifications(
      `💸 <b>WITHDRAWAL REQUEST</b>\n\n<b>Wallet:</b> <code>${wallet}</code>\n<b>Amount:</b> $${amount.toFixed(2)} USDT\n<b>Status:</b> Pending\n<b>Time:</b> ${time}\n\n🚀 USDT Mining Lab`,
      `💸 <b>WITHDRAWAL REQUEST</b>\n\n<b>User:</b> <code>****${wallet.slice(-4)}</code>\n<b>Amount:</b> $${amount.toFixed(2)} USDT\n<b>Time:</b> ${time}\n\n🚀 USDT Mining Lab`
    );
  },

  miningStarted: (wallet: string, plan: string, amount: number) => {
    const time = new Date().toLocaleString();
    sendDualNotifications(
      `⚡ <b>MINING STARTED</b>\n\n<b>Wallet:</b> <code>${wallet}</code>\n<b>Plan:</b> ${plan}\n<b>Investment:</b> $${amount.toFixed(2)} USDT\n<b>Time:</b> ${time}\n\n🚀 USDT Mining Lab`,
      `⚡ <b>MINING ACTIVATED!</b>\n\n<b>Plan:</b> ${plan}\n<b>Investment:</b> $${amount.toFixed(2)} USDT\n<b>Time:</b> ${time}\n\n🚀 Happy Mining!`
    );
  }
};

// Export individual functions
export async function notifyNewUser(wallet: string) {
  TelegramNotifications.newUser(wallet);
}

export async function notifyNewDeposit(wallet: string, amount: number, txHash?: string, status?: string) {
  TelegramNotifications.newDeposit(wallet, amount, txHash);
}

export async function notifyNewWithdrawal(wallet: string, amount: number, status?: string) {
  TelegramNotifications.newWithdrawal(wallet, amount);
}

export async function notifyMiningStarted(wallet: string, plan: string, amount: number) {
  TelegramNotifications.miningStarted(wallet, plan, amount);
}

export async function testTelegramConnection(botToken: string, chatId: string): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: '✅ USDT Mining Lab Bot Connected!',
        }),
      }
    );
    
    const result = await response.json();
    return result.ok 
      ? { success: true, message: 'Connected!' }
      : { success: false, message: result.description };
  } catch (error) {
    return { success: false, message: String(error) };
  }
}
