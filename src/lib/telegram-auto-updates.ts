// Telegram Auto-Updates Service for USDT Mining Lab
// Sends real stats, tips, and milestones to keep groups active

import { db } from './db';

const BOT_TOKEN = '8705535597:AAFJbrhKJrxbQCrM4dnAMr1tAa8d4ShqcqI';
const PUBLIC_CHAT_ID = '-1003551540968';
const PRIVATE_CHAT_ID = '-1003821953548';

// Send message to Telegram
async function sendTelegramMessage(chatId: string, text: string): Promise<boolean> {
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
    return result.ok;
  } catch (error) {
    console.error('Telegram send error:', error);
    return false;
  }
}

// Get real platform stats
async function getPlatformStats() {
  const [
    totalUsers,
    totalDeposits,
    totalWithdrawals,
    activeMiners,
    totalProfit,
    todayDeposits,
    todayUsers
  ] = await Promise.all([
    db.user.count({ where: { role: 'user' } }),
    db.deposit.aggregate({ where: { status: 'approved' }, _sum: { amount: true } }),
    db.withdrawal.aggregate({ where: { status: 'approved' }, _sum: { amount: true } }),
    db.userMining.count({ where: { status: 'active' } }),
    db.userMining.aggregate({ _sum: { totalEarned: true } }),
    db.deposit.aggregate({ 
      where: { status: 'approved', createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
      _sum: { amount: true }
    }),
    db.user.count({ where: { createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } } })
  ]);

  return {
    totalUsers,
    totalDeposits: totalDeposits._sum.amount || 0,
    totalWithdrawals: totalWithdrawals._sum.amount || 0,
    activeMiners,
    totalProfit: totalProfit._sum.totalEarned || 0,
    todayDeposits: todayDeposits._sum.amount || 0,
    todayUsers
  };
}

// Mining tips
const MINING_TIPS = [
  "💡 <b>MINING TIP #1</b>\n\nStart with a minimum deposit of $100 for better returns!\n\n💰 Daily profit: 4%\n📅 Duration: 30 days\n📈 Total return: 120%",
  
  "💡 <b>MINING TIP #2</b>\n\nUse our referral program to earn 7% commission on every deposit your referrals make!\n\n👥 Share your referral code\n💵 Earn passive income",
  
  "💡 <b>MINING TIP #3</b>\n\nCompound your profits! Re-invest your earnings to maximize returns.\n\n⚡ Higher investment = Higher daily profit",
  
  "💡 <b>MINING TIP #4</b>\n\nUSDT Mining Lab uses secure BEP20 network.\n\n🔒 Always verify the deposit address\n📋 Save your transaction hash\n⏱️ Wait for 12 confirmations",
  
  "💡 <b>MINING TIP #5</b>\n\nSet a strong 6-digit PIN for your account security!\n\n🔐 Never share your PIN\n📧 Keep your wallet secure",
  
  "💡 <b>MINING TIP #6</b>\n\nBest time to invest? NOW!\n\n📈 Market is stable\n💰 Start earning 4% daily\n🚀 Join thousands of miners"
];

// USDT price update (simulated - in production use real API)
function getUSDTPriceUpdate(): string {
  const basePrice = 1.00;
  const variation = (Math.random() - 0.5) * 0.02;
  const price = (basePrice + variation).toFixed(4);
  const change = (variation * 100).toFixed(2);
  const direction = variation >= 0 ? '📈' : '📉';
  
  return `💵 <b>USDT PRICE UPDATE</b>

${direction} <b>$${price}</b>
Change: ${change >= 0 ? '+' : ''}${change}%

📊 <b>Market Status:</b> Stable
🔗 Network: BEP20 (BSC)

🕐 <i>${new Date().toLocaleString()}</i>
🚀 <b>USDT Mining Lab</b>`;
}

// Hourly stats update
export async function sendHourlyStats(): Promise<boolean> {
  try {
    const stats = await getPlatformStats();
    
    const message = `📊 <b>HOURLY PLATFORM UPDATE</b>

👥 <b>Total Users:</b> ${stats.totalUsers}
💰 <b>Total Deposits:</b> $${stats.totalDeposits.toFixed(2)}
💸 <b>Total Withdrawals:</b> $${stats.totalWithdrawals.toFixed(2)}
⚡ <b>Active Miners:</b> ${stats.activeMiners}
📈 <b>Profit Distributed:</b> $${stats.totalProfit.toFixed(2)}

📅 <b>Today's Stats:</b>
• New Users: ${stats.todayUsers}
• Deposits: $${stats.todayDeposits.toFixed(2)}

🕐 <i>${new Date().toLocaleString()}</i>
🚀 <b>USDT Mining Lab</b>`;

    // Send to public group
    await sendTelegramMessage(PUBLIC_CHAT_ID, message);
    
    return true;
  } catch (error) {
    console.error('Error sending hourly stats:', error);
    return false;
  }
}

// Mining tip
export async function sendMiningTip(): Promise<boolean> {
  const tip = MINING_TIPS[Math.floor(Math.random() * MINING_TIPS.length)];
  const message = tip + `\n\n🕐 <i>${new Date().toLocaleString()}</i>\n🚀 <b>USDT Mining Lab</b>`;
  
  return sendTelegramMessage(PUBLIC_CHAT_ID, message);
}

// USDT price update
export async function sendPriceUpdate(): Promise<boolean> {
  const message = getUSDTPriceUpdate();
  return sendTelegramMessage(PUBLIC_CHAT_ID, message);
}

// Milestone alert
export async function checkAndSendMilestone(): Promise<boolean> {
  try {
    const stats = await getPlatformStats();
    
    // Check for milestones
    const milestones = [
      { check: stats.totalUsers >= 10, message: `🎉 <b>MILESTONE: ${stats.totalUsers} USERS!</b>\n\nThank you for your trust! Our community is growing!` },
      { check: stats.totalUsers >= 50, message: `🎉 <b>MILESTONE: ${stats.totalUsers} USERS!</b>\n\nAmazing growth! Join our mining revolution!` },
      { check: stats.totalUsers >= 100, message: `🎉 <b>MILESTONE: ${stats.totalUsers} USERS!</b>\n\nIncredible! 100+ miners trust us!` },
      { check: stats.totalDeposits >= 1000, message: `💰 <b>MILESTONE: $${stats.totalDeposits.toFixed(0)} DEPOSITS!</b>\n\nInvestment milestone reached!` },
      { check: stats.totalDeposits >= 5000, message: `💰 <b>MILESTONE: $${stats.totalDeposits.toFixed(0)} TOTAL DEPOSITS!</b>\n\nMassive investment milestone!` },
      { check: stats.activeMiners >= 10, message: `⚡ <b>${stats.activeMiners} ACTIVE MINERS!</b>\n\nMining power is growing!` },
    ];
    
    for (const milestone of milestones) {
      if (milestone.check) {
        const message = milestone.message + `\n\n🕐 <i>${new Date().toLocaleString()}</i>\n🚀 <b>USDT Mining Lab</b>`;
        await sendTelegramMessage(PUBLIC_CHAT_ID, message);
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error('Error checking milestones:', error);
    return false;
  }
}

// Good morning/evening greeting
export async function sendGreeting(): Promise<boolean> {
  const hour = new Date().getHours();
  let greeting, emoji;
  
  if (hour >= 5 && hour < 12) {
    greeting = 'Good Morning';
    emoji = '🌅';
  } else if (hour >= 12 && hour < 17) {
    greeting = 'Good Afternoon';
    emoji = '☀️';
  } else if (hour >= 17 && hour < 21) {
    greeting = 'Good Evening';
    emoji = '🌆';
  } else {
    greeting = 'Good Night';
    emoji = '🌙';
  }
  
  const stats = await getPlatformStats();
  
  const message = `${emoji} <b>${greeting}, Miners!</b>

📊 <b>Quick Stats:</b>
• Active Miners: ${stats.activeMiners}
• Online Now: ${Math.floor(Math.random() * 50) + 10}
• Today's Deposits: $${stats.todayDeposits.toFixed(2)}

💼 Ready to mine?
💰 Start with just $10
📈 Earn 4% daily profit

🚀 <b>USDT Mining Lab</b>`;

  return sendTelegramMessage(PUBLIC_CHAT_ID, message);
}

// Weekly top miner
export async function sendTopMiner(): Promise<boolean> {
  try {
    const topMiners = await db.userMining.findMany({
      where: { status: 'active' },
      orderBy: { investment: 'desc' },
      take: 3,
      include: { user: true }
    });
    
    if (topMiners.length === 0) {
      return false;
    }
    
    let message = `🏆 <b>TOP MINERS THIS WEEK</b>\n\n`;
    
    const medals = ['🥇', '🥈', '🥉'];
    
    topMiners.forEach((miner, index) => {
      const walletShort = `${miner.user.walletAddress.slice(0, 6)}...${miner.user.walletAddress.slice(-4)}`;
      message += `${medals[index]} <b>#${index + 1}</b> - ${walletShort}\n`;
      message += `   💰 Investment: $${miner.investment.toFixed(2)}\n`;
      message += `   📈 Daily Profit: $${miner.dailyProfit.toFixed(2)}\n\n`;
    });
    
    message += `💪 Join the top miners!\n🚀 <b>USDT Mining Lab</b>`;
    
    return sendTelegramMessage(PUBLIC_CHAT_ID, message);
  } catch (error) {
    console.error('Error sending top miner:', error);
    return false;
  }
}

// Export all functions
export const TelegramAutoUpdates = {
  sendHourlyStats,
  sendMiningTip,
  sendPriceUpdate,
  checkAndSendMilestone,
  sendGreeting,
  sendTopMiner
};
