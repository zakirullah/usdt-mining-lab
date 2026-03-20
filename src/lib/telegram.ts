// Telegram Notification Service for USDT Mining Lab

const BOT_TOKEN = '8705535597:AAH3CT-aZlChDG_4NZeqGRwVObDfieFVz7k';
const PRIVATE_CHAT_ID = '8582959779'; // Admin private chat
const PUBLIC_GROUP_ID = '-1003551540968'; // Public group

interface TelegramMessage {
  text: string;
  parse_mode?: 'HTML' | 'Markdown';
}

// Send notification to a specific chat
async function sendToChat(chatId: string, message: string): Promise<boolean> {
  try {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
      }),
    });

    const data = await response.json();
    
    if (!data.ok) {
      console.error('Telegram API error:', data);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Failed to send Telegram notification:', error);
    return false;
  }
}

// Send notification to both private and public
export async function sendTelegramNotification(message: string): Promise<boolean> {
  return sendToChat(PRIVATE_CHAT_ID, message);
}

// Send notification to public group only (anonymous)
export async function sendPublicNotification(message: string): Promise<boolean> {
  return sendToChat(PUBLIC_GROUP_ID, message);
}

// Send to both - private with full details, public with anonymous
export async function sendDualNotifications(privateMessage: string, publicMessage: string): Promise<void> {
  // Send to private (full details)
  sendToChat(PRIVATE_CHAT_ID, privateMessage).catch(err => 
    console.error('Failed to send private notification:', err)
  );
  
  // Send to public group (anonymous)
  sendToChat(PUBLIC_GROUP_ID, publicMessage).catch(err => 
    console.error('Failed to send public notification:', err)
  );
}

// Notification templates
export const TelegramNotifications = {
  newUser: (walletAddress: string, referralCode: string) => ({
    private: `
<b>🔔 New User Registered!</b>

<b>Wallet:</b> <code>${walletAddress}</code>
<b>Referral Code:</b> <code>${referralCode}</code>
<b>Time:</b> ${new Date().toLocaleString('en-US', { timeZone: 'Asia/Karachi' })}

<i>USDT Mining Lab</i>
    `,
    public: `
<b>🔔 New Miner Joined!</b>

<b>Time:</b> ${new Date().toLocaleString('en-US', { timeZone: 'Asia/Karachi' })}

<i>Welcome to USDT Mining Lab! 🚀</i>
    `
  }),

  newDeposit: (walletAddress: string, amount: number, txHash: string) => ({
    private: `
<b>💰 New Deposit Request!</b>

<b>Wallet:</b> <code>${walletAddress.slice(0, 8)}...${walletAddress.slice(-6)}</code>
<b>Amount:</b> <b>${amount.toLocaleString()} USDT</b>
<b>TX Hash:</b> <code>${txHash}</code>
<b>Time:</b> ${new Date().toLocaleString('en-US', { timeZone: 'Asia/Karachi' })}

<i>Approve in Admin Panel</i>
<i>USDT Mining Lab</i>
    `,
    public: `
<b>💰 New Deposit Received!</b>

<b>Amount:</b> <b>${amount.toLocaleString()} USDT</b>
<b>Time:</b> ${new Date().toLocaleString('en-US', { timeZone: 'Asia/Karachi' })}

<i>USDT Mining Lab</i>
    `
  }),

  depositApproved: (walletAddress: string, amount: number) => ({
    private: `
<b>✅ Deposit Approved!</b>

<b>Wallet:</b> <code>${walletAddress.slice(0, 8)}...${walletAddress.slice(-6)}</code>
<b>Amount:</b> <b>${amount.toLocaleString()} USDT</b>
<b>Time:</b> ${new Date().toLocaleString('en-US', { timeZone: 'Asia/Karachi' })}

<i>USDT Mining Lab</i>
    `,
    public: `
<b>✅ Deposit Approved!</b>

<b>Amount:</b> <b>${amount.toLocaleString()} USDT</b>
<b>Time:</b> ${new Date().toLocaleString('en-US', { timeZone: 'Asia/Karachi' })}

<i>USDT Mining Lab</i>
    `
  }),

  newWithdrawal: (walletAddress: string, amount: number) => ({
    private: `
<b>🏦 New Withdrawal Request!</b>

<b>Wallet:</b> <code>${walletAddress.slice(0, 8)}...${walletAddress.slice(-6)}</code>
<b>Amount:</b> <b>${amount.toLocaleString()} USDT</b>
<b>Time:</b> ${new Date().toLocaleString('en-US', { timeZone: 'Asia/Karachi' })}

<i>Approve in Admin Panel</i>
<i>USDT Mining Lab</i>
    `,
    public: `
<b>🏦 Withdrawal Request!</b>

<b>Amount:</b> <b>${amount.toLocaleString()} USDT</b>
<b>Time:</b> ${new Date().toLocaleString('en-US', { timeZone: 'Asia/Karachi' })}

<i>USDT Mining Lab</i>
    `
  }),

  withdrawalApproved: (walletAddress: string, amount: number) => ({
    private: `
<b>✅ Withdrawal Approved!</b>

<b>Wallet:</b> <code>${walletAddress.slice(0, 8)}...${walletAddress.slice(-6)}</code>
<b>Amount:</b> <b>${amount.toLocaleString()} USDT</b>
<b>Time:</b> ${new Date().toLocaleString('en-US', { timeZone: 'Asia/Karachi' })}

<i>USDT Mining Lab</i>
    `,
    public: `
<b>✅ Withdrawal Processed!</b>

<b>Amount:</b> <b>${amount.toLocaleString()} USDT</b>
<b>Time:</b> ${new Date().toLocaleString('en-US', { timeZone: 'Asia/Karachi' })}

<i>USDT Mining Lab</i>
    `
  }),

  newMiningPlan: (walletAddress: string, planName: string, investment: number, dailyProfit: number) => ({
    private: `
<b>⚡ New Mining Plan Activated!</b>

<b>Wallet:</b> <code>${walletAddress.slice(0, 8)}...${walletAddress.slice(-6)}</code>
<b>Plan:</b> ${planName}
<b>Investment:</b> <b>${investment.toLocaleString()} USDT</b>
<b>Daily Profit:</b> ${dailyProfit.toLocaleString()} USDT
<b>Time:</b> ${new Date().toLocaleString('en-US', { timeZone: 'Asia/Karachi' })}

<i>USDT Mining Lab</i>
    `,
    public: `
<b>⚡ Mining Plan Activated!</b>

<b>Plan:</b> ${planName}
<b>Investment:</b> <b>${investment.toLocaleString()} USDT</b>
<b>Daily Profit:</b> ${dailyProfit.toLocaleString()} USDT
<b>Time:</b> ${new Date().toLocaleString('en-US', { timeZone: 'Asia/Karachi' })}

<i>USDT Mining Lab</i>
    `
  }),

  dailyStats: (stats: {
    newUsers: number;
    totalDeposits: number;
    totalWithdrawals: number;
    activeMiners: number;
  }) => ({
    private: `
<b>📊 Daily Statistics Report</b>

<b>📅 Date:</b> ${new Date().toLocaleDateString('en-US', { timeZone: 'Asia/Karachi' })}

<b>👥 New Users:</b> ${stats.newUsers}
<b>💰 Total Deposits:</b> ${stats.totalDeposits.toLocaleString()} USDT
<b>🏦 Total Withdrawals:</b> ${stats.totalWithdrawals.toLocaleString()} USDT
<b>⛏️ Active Miners:</b> ${stats.activeMiners}

<i>USDT Mining Lab</i>
    `,
    public: `
<b>📊 Daily Statistics</b>

<b>📅 Date:</b> ${new Date().toLocaleDateString('en-US', { timeZone: 'Asia/Karachi' })}

<b>👥 New Users:</b> ${stats.newUsers}
<b>💰 Deposits:</b> ${stats.totalDeposits.toLocaleString()} USDT
<b>⛏️ Active Miners:</b> ${stats.activeMiners}

<i>USDT Mining Lab</i>
    `
  }),
};
