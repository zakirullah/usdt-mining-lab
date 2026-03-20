// Telegram Notification Service for USDT Mining Lab

interface TelegramMessage {
  type: 'deposit' | 'withdrawal' | 'register' | 'mining_started';
  data: {
    wallet?: string;
    amount?: number;
    status?: string;
    plan?: string;
    txHash?: string;
  };
}

// Telegram Bot Configuration
// Bot Token and Chat ID are stored in AdminSettings database

export async function sendTelegramNotification(message: TelegramMessage): Promise<boolean> {
  try {
    const { db } = await import('./db');
    
    // Get Telegram settings from database
    const settings = await db.adminSettings.findFirst();
    
    if (!settings?.telegramEnabled || !settings.telegramBotToken || !settings.telegramChatId) {
      console.log('Telegram notifications not configured');
      return false;
    }
    
    const { telegramBotToken: botToken, telegramChatId: chatId } = settings;
    
    // Format message based on type
    let text = '';
    const emoji = {
      deposit: '💰',
      withdrawal: '💸',
      register: '👤',
      mining_started: '⚡'
    };
    
    const walletShort = message.data.wallet 
      ? `${message.data.wallet.slice(0, 8)}...${message.data.wallet.slice(-4)}`
      : 'Unknown';
    
    switch (message.type) {
      case 'deposit':
        text = `
${emoji.deposit} <b>NEW DEPOSIT</b>

<b>Wallet:</b> <code>${walletShort}</code>
<b>Amount:</b> $${message.data.amount?.toFixed(2) || '0'} USDT
<b>Status:</b> ${message.data.status || 'Pending'}
${message.data.txHash ? `<b>TxHash:</b> <code>${message.data.txHash}</code>` : ''}

🕐 <i>${new Date().toLocaleString()}</i>
🚀 <b>USDT Mining Lab</b>
        `;
        break;
        
      case 'withdrawal':
        text = `
${emoji.withdrawal} <b>NEW WITHDRAWAL REQUEST</b>

<b>Wallet:</b> <code>${walletShort}</code>
<b>Amount:</b> $${message.data.amount?.toFixed(2) || '0'} USDT
<b>Status:</b> ${message.data.status || 'Pending'}

🕐 <i>${new Date().toLocaleString()}</i>
🚀 <b>USDT Mining Lab</b>
        `;
        break;
        
      case 'register':
        text = `
${emoji.register} <b>NEW USER REGISTERED</b>

<b>Wallet:</b> <code>${walletShort}</code>

🕐 <i>${new Date().toLocaleString()}</i>
🚀 <b>USDT Mining Lab</b>
        `;
        break;
        
      case 'mining_started':
        text = `
${emoji.mining_started} <b>MINING STARTED</b>

<b>Wallet:</b> <code>${walletShort}</code>
<b>Plan:</b> ${message.data.plan || 'Unknown'}
<b>Investment:</b> $${message.data.amount?.toFixed(2) || '0'} USDT

🕐 <i>${new Date().toLocaleString()}</i>
🚀 <b>USDT Mining Lab</b>
        `;
        break;
    }
    
    // Send message to Telegram
    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
      console.error('Telegram API error:', result);
      return false;
    }
    
    console.log('Telegram notification sent successfully');
    return true;
  } catch (error) {
    console.error('Failed to send Telegram notification:', error);
    return false;
  }
}

// Helper functions for common notifications
export async function notifyNewDeposit(wallet: string, amount: number, txHash?: string, status: string = 'Pending') {
  return sendTelegramNotification({
    type: 'deposit',
    data: { wallet, amount, txHash, status }
  });
}

export async function notifyNewWithdrawal(wallet: string, amount: number, status: string = 'Pending') {
  return sendTelegramNotification({
    type: 'withdrawal',
    data: { wallet, amount, status }
  });
}

export async function notifyNewUser(wallet: string) {
  return sendTelegramNotification({
    type: 'register',
    data: { wallet }
  });
}

export async function notifyMiningStarted(wallet: string, plan: string, amount: number) {
  return sendTelegramNotification({
    type: 'mining_started',
    data: { wallet, plan, amount }
  });
}

// Function to test Telegram connection
export async function testTelegramConnection(botToken: string, chatId: string): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: '🚀 *USDT Mining Lab*\n\n✅ Telegram notifications connected successfully!\n\nYou will receive notifications for:\n• New user registrations\n• New deposits\n• Withdrawal requests\n• Mining activations',
          parse_mode: 'Markdown',
        }),
      }
    );
    
    const result = await response.json();
    
    if (result.ok) {
      return { success: true, message: 'Telegram notification sent successfully!' };
    } else {
      return { success: false, message: `Telegram error: ${result.description}` };
    }
  } catch (error) {
    return { success: false, message: `Failed to connect: ${error}` };
  }
}
