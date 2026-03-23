'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wallet, TrendingUp, Users, Shield, Zap, 
  Lock, Eye, EyeOff, RefreshCw,
  ArrowDownRight, ArrowUpRight, Crown, Cpu, Gift,
  LogOut, Clock, Home, Copy, Check, AlertCircle, CheckCircle,
  Calculator, Percent, DollarSign, ChevronDown, ChevronUp, Clipboard,
  Bell, X, Settings, UserCheck, UserX, Send, MessageSquare
} from 'lucide-react';
import { Input } from '@/components/ui/input';

// Types
interface User {
  id: string;
  email?: string;
  walletAddress: string;
  balance: number;
  totalProfit: number;
  referralEarnings: number;
  referralCode: string;
  role?: string;
  createdAt?: string;
}

interface MiningData {
  id: string;
  investment: number;
  dailyProfit: number;
  totalEarned: number;
  status: string;
  startedAt: string;
  expiresAt: string;
}

interface UserStats {
  totalDeposits: number;
  totalWithdrawals: number;
  depositCount: number;
  withdrawalCount: number;
  referralCount: number;
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  status: string;
  createdAt: string;
}

interface PlatformStats {
  totalUsers: number;
  totalDeposits: number;
  totalWithdrawals: number;
  activeMining: number;
  onlineUsers: number;
}

// ==================== MINING CALCULATOR COMPONENT ====================
function MiningCalculator() {
  const [investment, setInvestment] = useState(100);
  const [selectedPlan, setSelectedPlan] = useState<'starter' | 'pro'>('starter');
  const [showResults, setShowResults] = useState(false);
  const [animatedValues, setAnimatedValues] = useState({
    perSecond: 0, perMinute: 0, perHour: 0, perDay: 0, perWeek: 0, perMonth: 0, totalReturn: 0
  });

  const plans = {
    starter: { name: 'Starter Plan', daily: 4, duration: 30, totalReturn: 120, min: 10, max: 99 },
    pro: { name: 'Pro Plan', daily: 4.5, duration: 30, totalReturn: 135, min: 100, max: 99999 }
  };

  const selectedPlanData = plans[selectedPlan];

  const calculateProfits = () => {
    const daily = (investment * selectedPlanData.daily) / 100;
    const results = {
      perSecond: daily / 86400,
      perMinute: daily / 1440,
      perHour: daily / 24,
      perDay: daily,
      perWeek: daily * 7,
      perMonth: daily * 30,
      totalReturn: investment * (selectedPlanData.totalReturn / 100)
    };

    const duration = 1500;
    const steps = 60;
    const interval = duration / steps;
    let step = 0;

    const animate = setInterval(() => {
      step++;
      const progress = step / steps;
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setAnimatedValues({
        perSecond: results.perSecond * easeOut,
        perMinute: results.perMinute * easeOut,
        perHour: results.perHour * easeOut,
        perDay: results.perDay * easeOut,
        perWeek: results.perWeek * easeOut,
        perMonth: results.perMonth * easeOut,
        totalReturn: results.totalReturn * easeOut
      });
      if (step >= steps) clearInterval(animate);
    }, interval);
    setShowResults(true);
  };

  const formatCrypto = (num: number) => {
    if (num < 0.01) return num.toFixed(6);
    if (num < 1) return num.toFixed(4);
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const resultCards = [
    { label: 'Per Second', value: animatedValues.perSecond, color: 'cyan' },
    { label: 'Per Minute', value: animatedValues.perMinute, color: 'violet' },
    { label: 'Per Hour', value: animatedValues.perHour, color: 'orange' },
    { label: 'Per Day', value: animatedValues.perDay, color: 'emerald' },
    { label: 'Per Week', value: animatedValues.perWeek, color: 'rose' },
    { label: 'Per Month', value: animatedValues.perMonth, color: 'amber' },
    { label: 'Total Return', value: animatedValues.totalReturn, color: 'yellow', isTotal: true }
  ];

  const getColorClass = (color: string) => {
    const colors: Record<string, string> = {
      cyan: 'border-cyan-400/30 text-cyan-400 bg-cyan-500/5',
      violet: 'border-violet-400/30 text-violet-400 bg-violet-500/5',
      orange: 'border-orange-400/30 text-orange-400 bg-orange-500/5',
      emerald: 'border-emerald-400/30 text-emerald-400 bg-emerald-500/5',
      rose: 'border-rose-400/30 text-rose-400 bg-rose-500/5',
      amber: 'border-amber-400/30 text-amber-400 bg-amber-500/5',
      yellow: 'border-yellow-400/30 text-yellow-400 bg-yellow-500/5'
    };
    return colors[color] || 'border-gray-400/30 text-gray-400 bg-gray-500/5';
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 mb-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
          <Calculator className="w-5 h-5 text-emerald-400" />
        </div>
        <h2 className="text-xl font-semibold text-white">Mining Profit Calculator</h2>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="text-zinc-400 text-sm mb-2 block">Select Mining Plan</label>
            <div className="grid grid-cols-2 gap-2">
              {(['starter', 'pro'] as const).map((plan) => (
                <button key={plan} onClick={() => setSelectedPlan(plan)}
                  className={`py-3 px-4 rounded-xl text-sm font-medium transition-all border ${
                    selectedPlan === plan ? 'border-emerald-500/50 text-emerald-400 bg-emerald-500/10' : 'border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'}`}>
                  {plans[plan].name.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-zinc-400 text-sm mb-2 block">Investment Amount (USDT)</label>
            <div className="relative">
              <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
              <Input type="number" value={investment} onChange={(e) => setInvestment(Number(e.target.value))} min={selectedPlanData.min}
                className="bg-zinc-800/50 border-zinc-700 text-white h-14 pl-12 rounded-xl text-lg font-medium focus:border-emerald-500" />
            </div>
            <p className="text-zinc-500 text-xs mt-1">Min: ${selectedPlanData.min} | Daily: {selectedPlanData.daily}%</p>
          </div>
          <div className="p-4 bg-zinc-800/30 rounded-xl border border-zinc-800 space-y-2">
            <div className="flex justify-between text-sm"><span className="text-zinc-400">Daily Profit</span><span className="text-white font-medium">{selectedPlanData.daily}%</span></div>
            <div className="flex justify-between text-sm"><span className="text-zinc-400">Duration</span><span className="text-white font-medium">{selectedPlanData.duration} Days</span></div>
            <div className="flex justify-between text-sm"><span className="text-zinc-400">Total Return</span><span className="text-emerald-400 font-medium">{selectedPlanData.totalReturn}%</span></div>
          </div>
          <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} onClick={calculateProfits}
            className="w-full py-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-lg transition-all">Calculate Profit</motion.button>
        </div>
        <div>
          {showResults ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-2 gap-3">
              {resultCards.map((card, i) => (
                <motion.div key={card.label} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
                  className={`p-4 rounded-xl border ${getColorClass(card.color)} ${card.isTotal ? 'col-span-2' : ''}`}>
                  <div className="text-zinc-400 text-xs mb-1">{card.label}</div>
                  <div className={`text-lg font-semibold ${getColorClass(card.color).split(' ')[1]}`}>{formatCrypto(card.value)} USDT</div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="h-full flex items-center justify-center text-zinc-500 text-center p-8">
              <div><Calculator className="w-12 h-12 mx-auto mb-3 opacity-20" /><p>Enter investment amount and click Calculate</p></div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ==================== REFERRAL SYSTEM COMPONENT ====================
function ReferralSystem({ user }: { user: User | null }) {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const referralCode = user?.referralCode || 'USDT' + Math.random().toString(36).substring(2, 6).toUpperCase();
  const referralLink = `https://usdtmininglab.com/?ref=${referralCode}`;

  const copyCode = async () => { await navigator.clipboard.writeText(referralCode); setCopiedCode(true); setTimeout(() => setCopiedCode(false), 2000); };
  const copyLink = async () => { await navigator.clipboard.writeText(referralLink); setCopiedLink(true); setTimeout(() => setCopiedLink(false), 2000); };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 mb-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center"><Gift className="w-5 h-5 text-violet-400" /></div>
        <div><h2 className="text-xl font-semibold text-white">Referral Program</h2><p className="text-zinc-500 text-sm">Earn 7% commission on every deposit</p></div>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-zinc-800/30 rounded-xl p-4 border border-zinc-800">
          <label className="text-zinc-400 text-sm mb-2 block">Your Referral Code</label>
          <div className="flex gap-2">
            <div className="flex-1 bg-zinc-900/50 rounded-lg px-4 py-3 text-emerald-400 font-mono text-lg text-center border border-zinc-700">{referralCode}</div>
            <motion.button whileTap={{ scale: 0.95 }} onClick={copyCode} className={`px-4 py-3 rounded-lg transition-all ${copiedCode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`}>{copiedCode ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}</motion.button>
          </div>
        </div>
        <div className="bg-zinc-800/30 rounded-xl p-4 border border-zinc-800">
          <label className="text-zinc-400 text-sm mb-2 block">Your Referral Link</label>
          <div className="flex gap-2">
            <div className="flex-1 bg-zinc-900/50 rounded-lg px-3 py-3 text-violet-400 text-xs truncate border border-zinc-700">{referralLink}</div>
            <motion.button whileTap={{ scale: 0.95 }} onClick={copyLink} className={`px-4 py-3 rounded-lg transition-all ${copiedLink ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`}>{copiedLink ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}</motion.button>
          </div>
        </div>
      </div>
      <div className="mt-4 p-4 bg-amber-500/5 rounded-xl border border-amber-500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center"><Percent className="w-4 h-4 text-amber-400" /></div>
            <div><p className="text-white text-sm font-medium">Direct Referral Commission</p><p className="text-zinc-500 text-xs">Earn from every deposit your referrals make</p></div>
          </div>
          <div className="text-2xl font-bold text-amber-400">7%</div>
        </div>
      </div>
    </motion.div>
  );
}

// Live Activity Names
const activityNames = ['Ahmed', 'Ali', 'John', 'Sara', 'Michael', 'David', 'Emma', 'Omar', 'Lisa', 'Khalid', 'Mohammed', 'Anna'];
const activityTypes: { type: string; template: (name: string, amt?: number) => string }[] = [
  { type: 'deposit', template: (name, amt = 0) => `${name} deposited ${amt} USDT` },
  { type: 'withdraw', template: (name, amt = 0) => `${name} withdrew ${amt} USDT` },
  { type: 'plan', template: (name) => `${name} activated Pro Plan` },
  { type: 'join', template: (name) => `${name} joined the mining platform` }
];

export default function UsdtMiningLab() {
  // ==================== STATE ====================
  const [isLoadingScreen, setIsLoadingScreen] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState(0);
  
  const loadingMessages = [
    'Initializing Mining Network',
    'Connecting Blockchain Nodes',
    'Securing Wallet Access',
    'Launching Platform'
  ];

  // Login State
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [walletInput, setWalletInput] = useState('');
  const [pinInput, setPinInput] = useState('');
  const [confirmPinInput, setConfirmPinInput] = useState('');
  const [referralInput, setReferralInput] = useState('');
  const [showPinVisibility, setShowPinVisibility] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Dashboard State
  const [user, setUser] = useState<User | null>(null);
  const [miningData, setMiningData] = useState<MiningData | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showDashboard, setShowDashboard] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [platformStats, setPlatformStats] = useState<PlatformStats | null>(null);

  // Animated Counters
  const [activeMiners, setActiveMiners] = useState(0);
  const [totalDeposited, setTotalDeposited] = useState(0);
  const [totalWithdrawn, setTotalWithdrawn] = useState(0);
  const [globalHashRate, setGlobalHashRate] = useState(0);
  const [onlineUsers, setOnlineUsers] = useState(0);
  const [totalProfitPaid, setTotalProfitPaid] = useState(0);

  // Today Statistics (NEW)
  const [todayDeposits, setTodayDeposits] = useState(0);
  const [todayWithdrawals, setTodayWithdrawals] = useState(0);
  const [todayRegistered, setTodayRegistered] = useState(0);
  const [todayProfitPaid, setTodayProfitPaid] = useState(0);

  // Visitors Counter (NEW)
  const [visitorsToday, setVisitorsToday] = useState(0);
  const [liveMiningPower, setLiveMiningPower] = useState(0);

  // Live indicator pulse for each counter
  const [pulseActive, setPulseActive] = useState(false);
  const [flashCounter, setFlashCounter] = useState<string | null>(null);
  const [counterChanged, setCounterChanged] = useState<Record<string, boolean>>({});

  // Recent Withdrawals (NEW)
  const [recentWithdrawals, setRecentWithdrawals] = useState<{name: string, amount: number, time: string}[]>([
    { name: 'Ali', amount: 120, time: '2 min ago' },
    { name: 'Ahmed', amount: 90, time: '5 min ago' },
    { name: 'John', amount: 75, time: '8 min ago' },
    { name: 'Sara', amount: 60, time: '12 min ago' },
    { name: 'Michael', amount: 150, time: '15 min ago' }
  ]);

  // Live Activity Popups
  const [liveActivities, setLiveActivities] = useState<{id: number, message: string}[]>([]);
  const [activityId, setActivityId] = useState(0);

  // FAQ State
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Dashboard Additional State
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<{id: string; message: string; isRead: boolean; createdAt: string}[]>([]);
  const [broadcasts, setBroadcasts] = useState<{id: string; title: string; message: string; type: string}[]>([]);
  const [liveEarnings, setLiveEarnings] = useState(0);
  const [lastEarned, setLastEarned] = useState(0);
  
  // Deposit/Withdraw State
  const [depositAmount, setDepositAmount] = useState('');
  const [depositTxHash, setDepositTxHash] = useState('');
  const [isDepositing, setIsDepositing] = useState(false);
  const [copiedDeposit, setCopiedDeposit] = useState(false);
  const [pendingDeposits, setPendingDeposits] = useState<{id: string; amount: number; createdAt: string}[]>([]);
  
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawWallet, setWithdrawWallet] = useState('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [pendingWithdrawals, setPendingWithdrawals] = useState<{id: string; amount: number; walletAddress: string; createdAt: string}[]>([]);
  
  // Admin Panel State
  const [adminStats, setAdminStats] = useState({ pendingDeposits: 0, pendingWithdrawals: 0, totalUsers: 0, totalDeposits: 0 });
  const [adminDeposits, setAdminDeposits] = useState<{id: string; amount: number; txHash: string; status: string; user?: {email: string}}[]>([]);
  const [adminWithdrawals, setAdminWithdrawals] = useState<{id: string; amount: number; walletAddress: string; status: string; user?: {email: string}}[]>([]);
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastType, setBroadcastType] = useState('info');
  const [isSendingBroadcast, setIsSendingBroadcast] = useState(false);

  // ==================== LOADING SCREEN - 2 SECONDS ====================
  useEffect(() => {
    if (isLoadingScreen) {
      const progressInterval = setInterval(() => {
        setLoadingProgress(prev => prev >= 100 ? 100 : prev + 2);
      }, 20);

      const messageInterval = setInterval(() => {
        setLoadingMessage(prev => (prev + 1) % loadingMessages.length);
      }, 500);

      const completeTimeout = setTimeout(() => {
        setIsLoadingScreen(false);
        const savedUser = localStorage.getItem('usdt_user');
        if (savedUser) {
          setUser(JSON.parse(savedUser));
          fetchUserData();
          setShowDashboard(true);
        }
      }, 2000);

      return () => { clearInterval(progressInterval); clearInterval(messageInterval); clearTimeout(completeTimeout); };
    }
  }, [isLoadingScreen]);

  // Animate Counters - Initial load animation (from 0 to target)
  useEffect(() => {
    const targets = {
      miners: 35847,
      deposited: 4589620,
      withdrawn: 2824530,
      hashRate: 128.45,
      online: 1847,
      profitPaid: 1654280,
      visitors: 8452,
      todayDeposits: 42580,
      todayWithdrawals: 18200,
      todayRegistered: 134,
      todayProfit: 7820
    };
    
    const intervals: NodeJS.Timeout[] = [];
    
    // Initial count-up animation (fast)
    const minerInterval = setInterval(() => {
      setActiveMiners(prev => prev >= targets.miners ? targets.miners : prev + Math.ceil(targets.miners / 40));
    }, 30);
    intervals.push(minerInterval);
    
    const depositInterval = setInterval(() => {
      setTotalDeposited(prev => prev >= targets.deposited ? targets.deposited : prev + Math.ceil(targets.deposited / 40));
    }, 30);
    intervals.push(depositInterval);
    
    const withdrawInterval = setInterval(() => {
      setTotalWithdrawn(prev => prev >= targets.withdrawn ? targets.withdrawn : prev + Math.ceil(targets.withdrawn / 40));
    }, 30);
    intervals.push(withdrawInterval);
    
    const hashInterval = setInterval(() => {
      setGlobalHashRate(prev => prev >= targets.hashRate ? targets.hashRate : Number((prev + targets.hashRate / 40).toFixed(2)));
    }, 30);
    intervals.push(hashInterval);
    
    const onlineInterval = setInterval(() => {
      setOnlineUsers(prev => prev >= targets.online ? targets.online : prev + Math.ceil(targets.online / 40));
    }, 30);
    intervals.push(onlineInterval);
    
    const profitInterval = setInterval(() => {
      setTotalProfitPaid(prev => prev >= targets.profitPaid ? targets.profitPaid : prev + Math.ceil(targets.profitPaid / 40));
    }, 30);
    intervals.push(profitInterval);

    const visitorsInterval = setInterval(() => {
      setVisitorsToday(prev => prev >= targets.visitors ? targets.visitors : prev + Math.ceil(targets.visitors / 40));
    }, 30);
    intervals.push(visitorsInterval);

    const todayDepositInterval = setInterval(() => {
      setTodayDeposits(prev => prev >= targets.todayDeposits ? targets.todayDeposits : prev + Math.ceil(targets.todayDeposits / 40));
    }, 30);
    intervals.push(todayDepositInterval);

    const todayWithdrawInterval = setInterval(() => {
      setTodayWithdrawals(prev => prev >= targets.todayWithdrawals ? targets.todayWithdrawals : prev + Math.ceil(targets.todayWithdrawals / 40));
    }, 30);
    intervals.push(todayWithdrawInterval);

    const todayRegInterval = setInterval(() => {
      setTodayRegistered(prev => prev >= targets.todayRegistered ? targets.todayRegistered : prev + Math.ceil(targets.todayRegistered / 30));
    }, 30);
    intervals.push(todayRegInterval);

    const todayProfitInterval = setInterval(() => {
      setTodayProfitPaid(prev => prev >= targets.todayProfit ? targets.todayProfit : prev + Math.ceil(targets.todayProfit / 40));
    }, 30);
    intervals.push(todayProfitInterval);

    return () => intervals.forEach(clearInterval);
  }, []);

  // Helper function to trigger flash effect
  const triggerFlash = (counterName: string) => {
    setFlashCounter(counterName);
    setCounterChanged(prev => ({ ...prev, [counterName]: true }));
    setTimeout(() => {
      setFlashCounter(null);
      setCounterChanged(prev => ({ ...prev, [counterName]: false }));
    }, 600);
  };

  // LIVE STATISTICS - Continuous Updates with Flash Effects
  useEffect(() => {
    if (showDashboard) return;
    
    // Active Miners: increase every 10 seconds
    const minersInterval = setInterval(() => {
      setActiveMiners(prev => prev + Math.floor(Math.random() * 5) + 1);
      triggerFlash('miners');
    }, 10000);

    // Total Deposits: increase every 5 seconds
    const depositsInterval = setInterval(() => {
      setTotalDeposited(prev => prev + Math.floor(Math.random() * 500) + 100);
      triggerFlash('deposits');
    }, 5000);

    // Total Withdrawals: increase every 6 seconds
    const withdrawalsInterval = setInterval(() => {
      setTotalWithdrawn(prev => prev + Math.floor(Math.random() * 300) + 50);
      triggerFlash('withdrawals');
    }, 6000);

    // Online Users: goes up/down between 1,820-1,890 every 3 seconds
    const onlineInterval = setInterval(() => {
      setOnlineUsers(prev => {
        const change = Math.floor(Math.random() * 15) - 7; // -7 to +7
        const newValue = prev + change;
        return Math.max(1820, Math.min(1890, newValue));
      });
      triggerFlash('online');
    }, 3000);

    // Profit Paid: increase every 7 seconds
    const profitInterval = setInterval(() => {
      setTotalProfitPaid(prev => prev + Math.floor(Math.random() * 200) + 50);
      triggerFlash('profit');
    }, 7000);

    // Visitors Today: +1 every 4 seconds
    const visitorsInterval = setInterval(() => {
      setVisitorsToday(prev => prev + 1);
      triggerFlash('visitors');
    }, 4000);

    // Today Deposits: increase every 8 seconds
    const todayDepositsInterval = setInterval(() => {
      setTodayDeposits(prev => prev + Math.floor(Math.random() * 100) + 20);
      triggerFlash('todayDeposits');
    }, 8000);

    // Today Withdrawals: increase every 10 seconds
    const todayWithdrawalsInterval = setInterval(() => {
      setTodayWithdrawals(prev => prev + Math.floor(Math.random() * 50) + 10);
      triggerFlash('todayWithdrawals');
    }, 10000);

    // Registered Today: increase every 20 seconds
    const todayRegisteredInterval = setInterval(() => {
      setTodayRegistered(prev => prev + 1);
      triggerFlash('todayRegistered');
    }, 20000);

    // Today Profit Paid: increase every 12 seconds
    const todayProfitInterval = setInterval(() => {
      setTodayProfitPaid(prev => prev + Math.floor(Math.random() * 30) + 10);
      triggerFlash('todayProfit');
    }, 12000);

    return () => {
      clearInterval(minersInterval);
      clearInterval(depositsInterval);
      clearInterval(withdrawalsInterval);
      clearInterval(onlineInterval);
      clearInterval(profitInterval);
      clearInterval(visitorsInterval);
      clearInterval(todayDepositsInterval);
      clearInterval(todayWithdrawalsInterval);
      clearInterval(todayRegisteredInterval);
      clearInterval(todayProfitInterval);
    };
  }, [showDashboard]);

  // Auto-updating Recent Withdrawals (NEW)
  useEffect(() => {
    if (showDashboard) return;
    
    const withdrawalNames = ['Ali', 'Ahmed', 'John', 'Sara', 'Michael', 'David', 'Emma', 'Omar', 'Lisa', 'Khalid', 'Mohammed', 'Anna', 'Fatima', 'Hassan', 'Aisha'];
    
    const addNewWithdrawal = () => {
      const newName = withdrawalNames[Math.floor(Math.random() * withdrawalNames.length)];
      const newAmount = Math.floor(Math.random() * 200) + 30; // 30-230 USDT
      
      setRecentWithdrawals(prev => {
        const updated = [{ name: newName, amount: newAmount, time: 'Just now' }, ...prev.slice(0, 4)];
        return updated;
      });
    };

    const interval = setInterval(addNewWithdrawal, 6000);
    return () => clearInterval(interval);
  }, [showDashboard]);

  // Live Mining Power Animation (updates dynamically)
  useEffect(() => {
    if (showDashboard) return;
    
    const updateMiningPower = () => {
      setGlobalHashRate(prev => {
        const change = (Math.random() - 0.5) * 0.1;
        const newValue = Number((prev + change).toFixed(2));
        return Math.max(120, Math.min(135, newValue));
      });
    };

    const interval = setInterval(updateMiningPower, 3000);
    return () => clearInterval(interval);
  }, [showDashboard]);

  // Live Activity Popups
  useEffect(() => {
    if (showDashboard) return;
    
    const generateActivity = () => {
      const name = activityNames[Math.floor(Math.random() * activityNames.length)];
      const activityType = activityTypes[Math.floor(Math.random() * activityTypes.length)];
      let message = '';
      
      if (activityType.type === 'deposit' || activityType.type === 'withdraw') {
        const amount = Math.floor(Math.random() * 200) + 20;
        message = activityType.template(name, amount);
      } else {
        message = activityType.template(name);
      }
      
      const id = Date.now();
      setActivityId(id);
      setLiveActivities(prev => [...prev, { id, message }]);
      
      setTimeout(() => {
        setLiveActivities(prev => prev.filter(a => a.id !== id));
      }, 5000);
    };

    const interval = setInterval(generateActivity, 8000);
    setTimeout(generateActivity, 3000);
    
    return () => clearInterval(interval);
  }, [showDashboard]);

  // Fetch Stats
  useEffect(() => { fetchStats(); }, []);
  
  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats');
      if (res.ok) setPlatformStats(await res.json());
    } catch {}
  };

  // ==================== LIVE MINING EARNINGS - Updates every second ====================
  useEffect(() => {
    if (!showDashboard || !miningData || miningData.status !== 'active') return;

    // Calculate earnings per second from daily profit
    // Daily profit / seconds in a day (86400)
    const earningsPerSecond = miningData.dailyProfit / 86400;

    const updateEarnings = async () => {
      try {
        // Call mining update API to sync with backend
        const res = await fetch('/api/mining/update', { method: 'POST' });
        if (res.ok) {
          const data = await res.json();
          if (data.mining) {
            setMiningData(prev => prev ? {
              ...prev,
              totalEarned: data.mining.totalEarned,
              status: data.mining.status
            } : null);
            
            // Update user balance
            if (data.mining.earnedThisUpdate) {
              setLastEarned(data.mining.earnedThisUpdate);
              setTimeout(() => setLastEarned(0), 1000);
            }
          }
        }
      } catch (error) {
        console.error('Mining update error:', error);
      }
    };

    // Update every 1 second for real-time feel
    const interval = setInterval(updateEarnings, 1000);
    
    return () => clearInterval(interval);
  }, [showDashboard, miningData?.id, miningData?.status]);

  // Fetch broadcasts
  useEffect(() => {
    if (!showDashboard) return;

    const fetchBroadcasts = async () => {
      try {
        const res = await fetch('/api/broadcast');
        if (res.ok) {
          const data = await res.json();
          setBroadcasts(data.broadcasts || []);
        }
      } catch {}
    };

    fetchBroadcasts();
    const interval = setInterval(fetchBroadcasts, 30000);
    return () => clearInterval(interval);
  }, [showDashboard]);

  // Fetch notifications
  useEffect(() => {
    if (!showDashboard || !user) return;

    const fetchNotifications = async () => {
      try {
        const res = await fetch('/api/user/notifications');
        if (res.ok) {
          const data = await res.json();
          setNotifications(data.notifications || []);
        }
      } catch {}
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, [showDashboard, user?.id]);

  const fetchUserData = async () => {
    try {
      const res = await fetch('/api/user/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setMiningData(data.mining);
        setUserStats(data.stats || null);
        setTransactions(data.transactions || []);
        localStorage.setItem('usdt_user', JSON.stringify(data.user));
      }
    } catch {}
  };

  // Paste wallet from clipboard
  const pasteWallet = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text && text.startsWith('0x')) {
        setWalletInput(text);
      }
    } catch {}
  };

  // ==================== LOGIN HANDLER ====================
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletInput || walletInput.length !== 42 || !walletInput.startsWith('0x')) {
      setError('Please enter a valid BEP20 wallet address');
      return;
    }
    if (!pinInput || pinInput.length !== 6) {
      setError('PIN must be exactly 6 digits');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/login-wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: walletInput, pin: pinInput })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      setUser(data.user);
      setMiningData(data.mining);
      setUserStats(data.stats || null);
      setTransactions(data.transactions || []);
      localStorage.setItem('usdt_user', JSON.stringify(data.user));
      setShowDashboard(true);
      setSuccess('Welcome back!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  // ==================== REGISTER HANDLER ====================
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletInput || walletInput.length !== 42 || !walletInput.startsWith('0x')) {
      setError('Please enter a valid BEP20 wallet address');
      return;
    }
    if (!pinInput || pinInput.length !== 6) {
      setError('PIN must be exactly 6 digits');
      return;
    }
    if (pinInput !== confirmPinInput) {
      setError('PIN codes do not match');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/register-wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: walletInput, pin: pinInput, referralCode: referralInput || undefined })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');
      setUser(data.user);
      localStorage.setItem('usdt_user', JSON.stringify(data.user));
      setShowDashboard(true);
      setSuccess('Account created successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Logout Handler
  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    localStorage.removeItem('usdt_user');
    setUser(null);
    setMiningData(null);
    setShowDashboard(false);
    setWalletInput('');
    setPinInput('');
    setConfirmPinInput('');
    setSuccess('Logged out successfully');
  };

  // ==================== DEPOSIT HANDLER ====================
  const handleDeposit = async () => {
    const amount = parseFloat(depositAmount);
    if (!amount || amount < 10) {
      setError('Minimum deposit is $10 USDT');
      return;
    }
    if (!depositTxHash || depositTxHash.length < 10) {
      setError('Please enter a valid transaction hash');
      return;
    }
    setIsDepositing(true);
    setError(null);
    try {
      const res = await fetch('/api/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, txHash: depositTxHash })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Deposit failed');
      setSuccess('Deposit submitted! Awaiting admin confirmation.');
      setDepositAmount('');
      setDepositTxHash('');
      // Add to pending deposits
      setPendingDeposits(prev => [...prev, {
        id: Date.now().toString(),
        amount,
        createdAt: new Date().toISOString()
      }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Deposit failed');
    } finally {
      setIsDepositing(false);
    }
  };

  // ==================== WITHDRAW HANDLER ====================
  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount < 5) {
      setError('Minimum withdrawal is $5 USDT');
      return;
    }
    if (!withdrawWallet || withdrawWallet.length !== 42 || !withdrawWallet.startsWith('0x')) {
      setError('Please enter a valid TRC20 wallet address');
      return;
    }
    if (amount > (user?.balance || 0)) {
      setError('Insufficient balance');
      return;
    }
    setIsWithdrawing(true);
    setError(null);
    try {
      const res = await fetch('/api/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, walletAddress: withdrawWallet, pin: '123456' })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Withdrawal failed');
      setSuccess('Withdrawal request submitted! Awaiting admin approval.');
      setWithdrawAmount('');
      setWithdrawWallet('');
      setPendingWithdrawals(prev => [...prev, {
        id: Date.now().toString(),
        amount,
        walletAddress: withdrawWallet,
        createdAt: new Date().toISOString()
      }]);
      if (user) {
        setUser({ ...user, balance: user.balance - amount });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Withdrawal failed');
    } finally {
      setIsWithdrawing(false);
    }
  };

  // ==================== ADMIN HANDLERS ====================
  const handleAdminAction = async (action: string, id: string) => {
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, id })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Action failed');
      
      setSuccess(`Action completed successfully!`);
      
      // Refresh admin data
      fetchAdminData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed');
    }
  };

  const handleSendBroadcast = async () => {
    if (!broadcastTitle || !broadcastMessage) {
      setError('Title and message are required');
      return;
    }
    setIsSendingBroadcast(true);
    try {
      const res = await fetch('/api/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: broadcastTitle, message: broadcastMessage, type: broadcastType })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Broadcast failed');
      
      setSuccess('Broadcast sent to all users!');
      setBroadcastTitle('');
      setBroadcastMessage('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Broadcast failed');
    } finally {
      setIsSendingBroadcast(false);
    }
  };

  const fetchAdminData = async () => {
    try {
      const [statsRes, depositsRes, withdrawalsRes] = await Promise.all([
        fetch('/api/admin?type=stats'),
        fetch('/api/admin?type=deposits'),
        fetch('/api/admin?type=withdrawals')
      ]);
      
      if (statsRes.ok) {
        const data = await statsRes.json();
        setAdminStats(data.stats);
      }
      if (depositsRes.ok) {
        const data = await depositsRes.json();
        setAdminDeposits(data.deposits);
      }
      if (withdrawalsRes.ok) {
        const data = await withdrawalsRes.json();
        setAdminWithdrawals(data.withdrawals);
      }
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
    }
  };

  // Fetch admin data when admin tab is active
  useEffect(() => {
    if (showDashboard && user?.role === 'admin') {
      fetchAdminData();
      const interval = setInterval(fetchAdminData, 30000);
      return () => clearInterval(interval);
    }
  }, [showDashboard, user?.role]);

  // Clear messages
  useEffect(() => {
    if (error) setTimeout(() => setError(null), 5000);
    if (success) setTimeout(() => setSuccess(null), 5000);
  }, [error, success]);

  const formatNumber = (num: number, decimals: number = 2) => {
    return num.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  };

  // FAQ Data
  const faqs = [
    { q: 'How does USDT mining work?', a: 'USDT mining works through our automated trading and staking systems. Your deposit is allocated to various yield-generating protocols, generating daily profits of 4-4.5%.' },
    { q: 'What is the minimum deposit?', a: 'The minimum deposit is 10 USDT for the Starter Plan. You can upgrade to Pro Plan with a minimum of 100 USDT for higher returns.' },
    { q: 'When can I withdraw profits?', a: 'You can withdraw your available balance anytime. Minimum withdrawal is 10 USDT. Withdrawals are processed within 24 hours.' },
    { q: 'Is the platform secure?', a: 'Yes, we use 256-bit SSL encryption, smart contract protection, and secure blockchain infrastructure to protect your assets and data.' }
  ];

  // Ticker Items
  const tickerItems = [
    'Ali withdrew 120 USDT',
    'Ahmed deposited 90 USDT',
    'John activated Starter Plan',
    'Sara deposited 75 USDT',
    'Michael withdrew 40 USDT',
    'Emma activated Pro Plan',
    'Omar deposited 150 USDT',
    'Lisa withdrew 85 USDT'
  ];

  // ==================== LOADING SCREEN ====================
  if (isLoadingScreen) {
    return (
      <div className="fixed inset-0 bg-zinc-950 flex items-center justify-center overflow-hidden">
        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                width: Math.random() * 4 + 1,
                height: Math.random() * 4 + 1,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                background: i % 3 === 0 ? 'rgba(16, 185, 129, 0.3)' : i % 3 === 1 ? 'rgba(139, 92, 246, 0.3)' : 'rgba(59, 130, 246, 0.3)'
              }}
              animate={{ y: [-15, 15, -15], x: [-5, 5, -5], opacity: [0.2, 0.6, 0.2] }}
              transition={{ duration: 4 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 2 }}
            />
          ))}
        </div>

        <div className="relative z-10 text-center px-4">
          {/* Glowing Logo */}
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.4 }} className="mb-6">
            <div className="w-24 h-24 mx-auto rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <span className="text-4xl font-bold text-white">₮</span>
            </div>
          </motion.div>

          {/* Brand Name */}
          <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-3xl font-bold text-white mb-1">
            USDT Mining Lab
          </motion.h1>
          
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="text-zinc-500 mb-6 text-sm">
            Earn passive USDT through smart mining technology.
          </motion.p>

          {/* Loading Message */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mb-4">
            <p className="text-emerald-400 text-sm">{loadingMessages[loadingMessage]}</p>
          </motion.div>

          {/* Progress Bar */}
          <div className="w-64 mx-auto">
            <div className="h-1.5 rounded-full overflow-hidden bg-zinc-900">
              <motion.div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500" style={{ width: `${loadingProgress}%` }} />
            </div>
            <div className="text-zinc-400 mt-2 text-sm">{Math.round(loadingProgress)}%</div>
          </div>
        </div>
      </div>
    );
  }

  // ==================== LOGIN & LANDING PAGE ====================
  if (!showDashboard) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col">
        {/* Live Activity Popups - Left Bottom Corner */}
        <div className="fixed left-4 bottom-4 z-50 space-y-2 max-w-xs">
          <AnimatePresence>
            {liveActivities.map((activity) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -100, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -100, scale: 0.9 }}
                className="bg-zinc-900/95 backdrop-blur border border-zinc-800 rounded-lg px-4 py-3 shadow-lg"
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                  <p className="text-zinc-300 text-sm">{activity.message}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Mining Rigs Background Animation */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          {/* GPU Mining Rig 1 - Left Side */}
          <motion.div
            className="absolute left-4 top-1/4 opacity-10"
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 0.1 }}
            transition={{ duration: 2 }}
          >
            <svg width="120" height="80" viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Rig Frame */}
              <rect x="5" y="10" width="110" height="60" rx="4" stroke="#10b981" strokeWidth="2" fill="none"/>
              {/* GPUs */}
              {[0, 1, 2, 3].map((i) => (
                <g key={i}>
                  <rect x={12 + i * 26} y="18" width="22" height="44" rx="2" stroke="#10b981" strokeWidth="1.5" fill="none"/>
                  {/* Spinning Fans */}
                  <motion.circle
                    cx={23 + i * 26}
                    cy="32"
                    r="6"
                    stroke="#10b981"
                    strokeWidth="1"
                    fill="none"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1 + i * 0.2, repeat: Infinity, ease: "linear" }}
                    style={{ transformOrigin: `${23 + i * 26}px 32px` }}
                  />
                  <motion.circle
                    cx={23 + i * 26}
                    cy="48"
                    r="6"
                    stroke="#10b981"
                    strokeWidth="1"
                    fill="none"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.2 + i * 0.1, repeat: Infinity, ease: "linear" }}
                    style={{ transformOrigin: `${23 + i * 26}px 48px` }}
                  />
                </g>
              ))}
              {/* LED Lights */}
              <motion.circle cx="12" cy="14" r="2" fill="#10b981" animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 0.5, repeat: Infinity }}/>
              <motion.circle cx="20" cy="14" r="2" fill="#f59e0b" animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 0.7, repeat: Infinity }}/>
            </svg>
          </motion.div>

          {/* GPU Mining Rig 2 - Right Side */}
          <motion.div
            className="absolute right-4 top-1/3 opacity-10"
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 0.1 }}
            transition={{ duration: 2, delay: 0.5 }}
          >
            <svg width="100" height="70" viewBox="0 0 100 70" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="5" y="8" width="90" height="54" rx="4" stroke="#8b5cf6" strokeWidth="2" fill="none"/>
              {[0, 1, 2].map((i) => (
                <g key={i}>
                  <rect x={12 + i * 28} y="14" width="22" height="42" rx="2" stroke="#8b5cf6" strokeWidth="1.5" fill="none"/>
                  <motion.circle
                    cx={23 + i * 28}
                    cy="28"
                    r="5"
                    stroke="#8b5cf6"
                    strokeWidth="1"
                    fill="none"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.8 + i * 0.15, repeat: Infinity, ease: "linear" }}
                    style={{ transformOrigin: `${23 + i * 28}px 28px` }}
                  />
                  <motion.circle
                    cx={23 + i * 28}
                    cy="42"
                    r="5"
                    stroke="#8b5cf6"
                    strokeWidth="1"
                    fill="none"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1 + i * 0.1, repeat: Infinity, ease: "linear" }}
                    style={{ transformOrigin: `${23 + i * 28}px 42px` }}
                  />
                </g>
              ))}
              <motion.circle cx="12" cy="12" r="2" fill="#8b5cf6" animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 0.6, repeat: Infinity }}/>
            </svg>
          </motion.div>

          {/* ASIC Miner - Bottom Left */}
          <motion.div
            className="absolute left-8 bottom-32 opacity-10"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 0.1 }}
            transition={{ duration: 2, delay: 1 }}
          >
            <svg width="140" height="60" viewBox="0 0 140 60" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* ASIC Body */}
              <rect x="5" y="5" width="130" height="50" rx="3" stroke="#f59e0b" strokeWidth="2" fill="none"/>
              {/* Hashboards */}
              <rect x="15" y="12" width="40" height="36" rx="2" stroke="#f59e0b" strokeWidth="1" fill="none"/>
              <rect x="60" y="12" width="40" height="36" rx="2" stroke="#f59e0b" strokeWidth="1" fill="none"/>
              <rect x="105" y="12" width="25" height="36" rx="2" stroke="#f59e0b" strokeWidth="1" fill="none"/>
              {/* Cooling Fans */}
              {[0, 1].map((i) => (
                <motion.g key={i}>
                  <motion.circle
                    cx={35 + i * 45}
                    cy="30"
                    r="10"
                    stroke="#f59e0b"
                    strokeWidth="1"
                    fill="none"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.5, repeat: Infinity, ease: "linear" }}
                    style={{ transformOrigin: `${35 + i * 45}px 30px` }}
                  />
                </motion.g>
              ))}
              {/* Status LEDs */}
              <motion.circle cx="115" cy="20" r="2" fill="#10b981" animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 0.3, repeat: Infinity }}/>
              <motion.circle cx="122" cy="20" r="2" fill="#10b981" animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 0.4, repeat: Infinity, delay: 0.1 }}/>
              <motion.circle cx="115" cy="40" r="2" fill="#f59e0b" animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 0.5, repeat: Infinity, delay: 0.2 }}/>
              <motion.circle cx="122" cy="40" r="2" fill="#ef4444" animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }}/>
            </svg>
          </motion.div>

          {/* Server Rack - Bottom Right */}
          <motion.div
            className="absolute right-8 bottom-40 opacity-10"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 0.1 }}
            transition={{ duration: 2, delay: 1.5 }}
          >
            <svg width="80" height="120" viewBox="0 0 80 120" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Rack Frame */}
              <rect x="5" y="5" width="70" height="110" rx="2" stroke="#06b6d4" strokeWidth="2" fill="none"/>
              {/* Server Units */}
              {[0, 1, 2, 3].map((i) => (
                <g key={i}>
                  <rect x="10" y={12 + i * 26} width="60" height="22" rx="1" stroke="#06b6d4" strokeWidth="1" fill="none"/>
                  {/* Blinking LEDs */}
                  <motion.circle
                    cx="18"
                    cy={23 + i * 26}
                    r="2"
                    fill="#10b981"
                    animate={{ opacity: [1, 0.2, 1] }}
                    transition={{ duration: 0.4 + i * 0.1, repeat: Infinity }}
                  />
                  <motion.circle
                    cx="26"
                    cy={23 + i * 26}
                    r="2"
                    fill="#06b6d4"
                    animate={{ opacity: [1, 0.2, 1] }}
                    transition={{ duration: 0.6 + i * 0.1, repeat: Infinity, delay: 0.1 }}
                  />
                  {/* Activity Dots */}
                  {[0, 1, 2, 3, 4].map((j) => (
                    <motion.rect
                      key={j}
                      x={35 + j * 7}
                      y={20 + i * 26}
                      width="4"
                      height="6"
                      fill="#06b6d4"
                      animate={{ opacity: [0.2, 1, 0.2] }}
                      transition={{ duration: 0.3, repeat: Infinity, delay: j * 0.1 + i * 0.2 }}
                    />
                  ))}
                </g>
              ))}
            </svg>
          </motion.div>

          {/* Data Flow Lines */}
          <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
            {[0, 1, 2, 3, 4].map((i) => (
              <motion.line
                key={i}
                x1="0%"
                y1={`${20 + i * 15}%`}
                x2="100%"
                y2={`${25 + i * 12}%`}
                stroke="url(#gradient-line)"
                strokeWidth="1"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.15 }}
                transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
              />
            ))}
            <defs>
              <linearGradient id="gradient-line" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="transparent" />
                <stop offset="50%" stopColor="#10b981" />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>
            </defs>
          </svg>

          {/* Floating Mining Particles */}
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={`particle-${i}`}
              className="absolute w-1 h-1 bg-emerald-400/30 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [-20, 20, -20],
                x: [-10, 10, -10],
                opacity: [0.2, 0.6, 0.2],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 4 + Math.random() * 3,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}

          {/* Hash Rate Display - Floating */}
          <motion.div
            className="absolute right-1/4 top-1/4 opacity-5"
            animate={{ opacity: [0.03, 0.08, 0.03] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <div className="text-emerald-400 font-mono text-xs">
              <motion.span animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 0.5, repeat: Infinity }}>
                ▓▓▓▓▓▓▓▓▓▓
              </motion.span>
              <br />
              <span className="text-[10px]">HASH: {Math.random().toString(16).substr(2, 8).toUpperCase()}</span>
            </div>
          </motion.div>

          {/* Floating USDT Coins */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={`usdt-${i}`}
              className="absolute text-4xl text-emerald-500/10 font-bold"
              style={{ left: `${10 + i * 12}%`, top: `${15 + (i % 3) * 25}%` }}
              animate={{ y: [-20, 20, -20], rotate: [0, 360] }}
              transition={{ duration: 12 + i * 2, repeat: Infinity, ease: "linear" }}
            >₮</motion.div>
          ))}
          
          {/* Floating Bitcoin Icons */}
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={`btc-${i}`}
              className="absolute text-3xl text-amber-500/15 font-bold"
              style={{ left: `${5 + i * 25}%`, top: `${20 + i * 20}%` }}
              animate={{ y: [15, -15, 15], x: [-10, 10, -10] }}
              transition={{ duration: 15 + i * 3, repeat: Infinity, ease: "linear" }}
            >
              <span className="drop-shadow-[0_0_8px_rgba(251,191,36,0.3)]">₿</span>
            </motion.div>
          ))}

          {/* Floating Ethereum Icons */}
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={`eth-${i}`}
              className="absolute text-3xl text-violet-500/15 font-bold"
              style={{ left: `${15 + i * 22}%`, top: `${40 + i * 15}%` }}
              animate={{ y: [-15, 15, -15], rotate: [360, 0] }}
              transition={{ duration: 18 + i * 2, repeat: Infinity, ease: "linear" }}
            >
              <span className="drop-shadow-[0_0_8px_rgba(139,92,246,0.3)]">Ξ</span>
            </motion.div>
          ))}
          
          {/* Particle Lines */}
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={`line-${i}`}
              className="absolute h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent"
              style={{ width: '30%', left: `${i * 20}%`, top: `${30 + i * 10}%` }}
              animate={{ opacity: [0, 0.5, 0], scaleX: [0.5, 1, 0.5] }}
              transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
            />
          ))}
          
          {/* Soft Glow Particles */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-amber-500/3 rounded-full blur-3xl animate-pulse" />
        </div>

        {/* Live Ticker */}
        <div className="relative z-10 bg-zinc-900/50 border-b border-zinc-800 py-2 overflow-hidden">
          <motion.div
            className="flex gap-8 whitespace-nowrap"
            animate={{ x: ['100%', '-100%'] }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          >
            {[...tickerItems, ...tickerItems].map((item, i) => (
              <span key={i} className="text-zinc-500 text-xs flex items-center gap-2">
                <span className="w-1 h-1 bg-emerald-400 rounded-full" />
                {item}
              </span>
            ))}
          </motion.div>
        </div>

        {/* Toast Messages */}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
              <div className="bg-red-500 text-white px-5 py-2.5 rounded-lg shadow-lg flex items-center gap-2 text-sm"><AlertCircle className="w-4 h-4" />{error}</div>
            </motion.div>
          )}
          {success && (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
              <div className="bg-emerald-500 text-white px-5 py-2.5 rounded-lg shadow-lg flex items-center gap-2 text-sm"><CheckCircle className="w-4 h-4" />{success}</div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <header className="relative z-10 p-4 lg:p-6">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <span className="text-xl font-bold text-white">₮</span>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-white">USDT Mining Lab</h1>
                <p className="text-zinc-500 text-xs">Cloud Mining Platform</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={() => setAuthMode('login')} className={`px-5 py-2 rounded-lg font-medium text-sm transition-all ${authMode === 'login' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-zinc-900 text-zinc-400 hover:text-white'}`}>Login</button>
              <button onClick={() => setAuthMode('register')} className={`px-5 py-2 rounded-lg font-medium text-sm transition-all ${authMode === 'register' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'bg-zinc-900 text-zinc-400 hover:text-white'}`}>Register</button>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative z-10 px-4 pt-6 pb-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Start USDT Cloud Mining Today</h1>
            <p className="text-zinc-400 mb-1">Earn stable daily USDT rewards through automated mining technology.</p>
          </motion.div>
        </section>

        {/* Login Card */}
        <main className="flex-1 flex flex-col items-center px-4 py-4 relative z-10">
          <div className="w-full max-w-md">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-zinc-900/80 backdrop-blur border border-zinc-800 rounded-2xl p-5 shadow-xl shadow-black/20">
              {/* Tab Switcher */}
              <div className="flex bg-zinc-800/50 rounded-lg p-1 mb-5">
                <button onClick={() => setAuthMode('login')} className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${authMode === 'login' ? 'bg-emerald-500 text-white' : 'text-zinc-400 hover:text-white'}`}>Login</button>
                <button onClick={() => setAuthMode('register')} className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${authMode === 'register' ? 'bg-amber-500 text-white' : 'text-zinc-400 hover:text-white'}`}>Create Account</button>
              </div>

              {/* Form */}
              <form onSubmit={authMode === 'login' ? handleLogin : handleRegister} className="space-y-3">
                <div>
                  <label className="text-zinc-400 text-sm mb-1.5 block">USDT BEP20 Wallet Address</label>
                  <div className="relative">
                    <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <Input placeholder="0x..." value={walletInput} onChange={(e) => setWalletInput(e.target.value)}
                      className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-600 h-11 pl-10 pr-10 rounded-lg text-sm focus:border-emerald-500" />
                    <button type="button" onClick={pasteWallet} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-zinc-500 hover:text-emerald-400 transition-colors" title="Paste from clipboard">
                      <Clipboard className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-zinc-400 text-sm mb-1.5 block">6 Digit PIN Code</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <Input type={showPinVisibility ? "text" : "password"} maxLength={6} placeholder="••••••" value={pinInput}
                      onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
                      className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-600 h-11 pl-10 pr-10 rounded-lg text-center text-xl tracking-[0.3em] focus:border-emerald-500" />
                    <button type="button" onClick={() => setShowPinVisibility(!showPinVisibility)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors">
                      {showPinVisibility ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {authMode === 'register' && (
                  <>
                    <div>
                      <label className="text-zinc-400 text-sm mb-1.5 block">Confirm PIN Code</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <Input type="password" maxLength={6} placeholder="••••••" value={confirmPinInput}
                          onChange={(e) => setConfirmPinInput(e.target.value.replace(/\D/g, ''))}
                          className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-600 h-11 pl-10 rounded-lg text-center text-xl tracking-[0.3em] focus:border-emerald-500" />
                      </div>
                    </div>

                    <div>
                      <label className="text-zinc-400 text-sm mb-1.5 block">Referral Code (Optional)</label>
                      <div className="relative">
                        <Gift className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <Input placeholder="USDTxxxx" value={referralInput} onChange={(e) => setReferralInput(e.target.value.toUpperCase())}
                          className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-600 h-11 pl-10 rounded-lg text-sm focus:border-emerald-500" />
                      </div>
                    </div>
                  </>
                )}

                <motion.button type="submit" disabled={isLoading} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                  className={`w-full h-11 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${authMode === 'login' ? 'bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/20' : 'bg-amber-500 hover:bg-amber-600 shadow-lg shadow-amber-500/20'}`}>
                  {isLoading ? <><RefreshCw className="w-4 h-4 animate-spin" />Processing...</> : 
                   authMode === 'login' ? <><Wallet className="w-4 h-4" />Login</> : <><Zap className="w-4 h-4" />Create Account</>}
                </motion.button>
              </form>

              {/* Network Information */}
              <div className="mt-4 p-3 bg-zinc-800/30 rounded-lg border border-zinc-700/50">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-500">USDT Network:</span>
                  <span className="text-emerald-400 font-medium">BEP20</span>
                </div>
                <div className="flex items-center justify-between text-xs mt-1">
                  <span className="text-zinc-500">Minimum Deposit:</span>
                  <span className="text-white">10 USDT</span>
                </div>
              </div>

              {/* Security Badges */}
              <div className="mt-3 flex items-center justify-center gap-4 text-zinc-500 text-xs">
                <span className="flex items-center gap-1"><Shield className="w-3 h-3 text-emerald-400" />BEP20 Secure</span>
                <span className="flex items-center gap-1"><Lock className="w-3 h-3 text-violet-400" />256-bit SSL</span>
                <span className="flex items-center gap-1"><Cpu className="w-3 h-3 text-cyan-400" />Smart Contract</span>
              </div>
            </motion.div>
          </div>
        </main>

        {/* Mining Plans */}
        <section className="relative z-10 px-4 py-6">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-xl font-semibold text-white text-center mb-4">Mining Plans</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {/* Starter Plan */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="bg-gradient-to-br from-zinc-900 to-zinc-900/50 border border-zinc-700 rounded-2xl p-5 relative overflow-hidden group hover:border-cyan-500/50 hover:shadow-[0_0_30px_rgba(34,211,238,0.15)] transition-all duration-300">
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl group-hover:bg-cyan-500/10 transition-all" />
                <div className="relative">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center group-hover:shadow-[0_0_15px_rgba(34,211,238,0.3)] transition-all"><Zap className="w-5 h-5 text-cyan-400" /></div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">Starter Plan</h3>
                      <p className="text-zinc-500 text-xs">Perfect for beginners</p>
                    </div>
                  </div>
                  <div className="space-y-2 mb-4 text-sm">
                    <div className="flex justify-between"><span className="text-zinc-500">Minimum Deposit</span><span className="text-white font-medium">10 USDT</span></div>
                    <div className="flex justify-between"><span className="text-zinc-500">Daily Profit</span><span className="text-cyan-400 font-medium">4%</span></div>
                    <div className="flex justify-between"><span className="text-zinc-500">Duration</span><span className="text-white font-medium">30 Days</span></div>
                    <div className="flex justify-between"><span className="text-zinc-500">Total Return</span><span className="text-emerald-400 font-medium">120%</span></div>
                  </div>
                  <button onClick={() => setAuthMode('register')} className="w-full py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-600 text-white font-medium text-sm transition-all hover:shadow-[0_0_20px_rgba(34,211,238,0.4)]">Start Mining</button>
                </div>
              </motion.div>

              {/* Pro Plan */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-zinc-900 to-zinc-900/50 border border-violet-500/30 rounded-2xl p-5 relative overflow-hidden group hover:border-violet-500/70 hover:shadow-[0_0_30px_rgba(139,92,246,0.2)] transition-all duration-300">
                <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/10 rounded-full blur-2xl group-hover:bg-violet-500/20 transition-all" />
                <div className="absolute -top-2 right-4 bg-violet-500 text-white text-xs font-medium px-3 py-0.5 rounded-full">POPULAR</div>
                <div className="relative">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center group-hover:shadow-[0_0_15px_rgba(139,92,246,0.3)] transition-all"><Crown className="w-5 h-5 text-violet-400" /></div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">Pro Plan</h3>
                      <p className="text-zinc-500 text-xs">Maximum returns</p>
                    </div>
                  </div>
                  <div className="space-y-2 mb-4 text-sm">
                    <div className="flex justify-between"><span className="text-zinc-500">Minimum Deposit</span><span className="text-white font-medium">100 USDT</span></div>
                    <div className="flex justify-between"><span className="text-zinc-500">Daily Profit</span><span className="text-violet-400 font-medium">4.5%</span></div>
                    <div className="flex justify-between"><span className="text-zinc-500">Duration</span><span className="text-white font-medium">30 Days</span></div>
                    <div className="flex justify-between"><span className="text-zinc-500">Total Return</span><span className="text-emerald-400 font-medium">135%</span></div>
                  </div>
                  <button onClick={() => setAuthMode('register')} className="w-full py-2.5 rounded-lg bg-violet-500 hover:bg-violet-600 text-white font-medium text-sm transition-all hover:shadow-[0_0_20px_rgba(139,92,246,0.4)]">Start Mining</button>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Mining Rig Visual */}
        <section className="relative z-10 px-4 py-6">
          <div className="max-w-3xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }}
              className="relative rounded-2xl overflow-hidden border border-zinc-800"
            >
              {/* Image */}
              <img 
                src="/mining-rig.png" 
                alt="USDT Mining Rig" 
                className="w-full h-48 md:h-64 object-cover"
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/50 to-transparent" />
              
              {/* Content Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                    <Cpu className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">State-of-the-Art Mining Infrastructure</h3>
                    <p className="text-zinc-400 text-sm">Powered by latest ASIC technology</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div className="text-center">
                    <div className="text-emerald-400 font-bold text-lg">99.9%</div>
                    <div className="text-zinc-500 text-xs">Uptime</div>
                  </div>
                  <div className="text-center">
                    <div className="text-cyan-400 font-bold text-lg">24/7</div>
                    <div className="text-zinc-500 text-xs">Operation</div>
                  </div>
                  <div className="text-center">
                    <div className="text-violet-400 font-bold text-lg">Auto</div>
                    <div className="text-zinc-500 text-xs">Payouts</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Global Mining Power - Live Counter */}
        <section className="relative z-10 px-4 py-6">
          <div className="max-w-2xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="bg-gradient-to-r from-emerald-500/10 via-cyan-500/10 to-violet-500/10 border border-emerald-500/20 rounded-2xl p-6 text-center relative overflow-hidden"
            >
              {/* Animated Glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-cyan-500/5 to-violet-500/5 animate-pulse" />
              
              <div className="relative">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse shadow-lg shadow-emerald-400/50" />
                  <span className="text-emerald-400 text-sm font-medium">LIVE MINING POWER</span>
                  <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse shadow-lg shadow-emerald-400/50" />
                </div>
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-400 via-cyan-400 to-violet-400 bg-clip-text text-transparent">
                  {globalHashRate.toFixed(2)} TH/s
                </div>
                <p className="text-zinc-500 text-sm mt-2">Global Hashrate • Real-time Network Speed</p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Platform Statistics - 6 Items with Neon Colors */}
        <section className="relative z-10 px-4 py-6">
          <div className="max-w-4xl mx-auto">
            <motion.h2 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="text-xl font-semibold text-white text-center mb-4 flex items-center justify-center gap-2"
            >
              Platform Statistics
              <span className="text-xs text-green-400 flex items-center gap-1">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50" />
                LIVE
              </span>
            </motion.h2>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {/* Stat 1 - Active Miners - Neon Cyan */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }} 
                animate={{ opacity: 1, scale: 1 }} 
                transition={{ delay: 0.1 }}
                className={`bg-zinc-900/80 border rounded-xl p-5 text-center transition-all duration-300 relative overflow-hidden group ${
                  flashCounter === 'miners' ? 'border-cyan-300 shadow-[0_0_40px_rgba(34,211,238,0.5)] scale-105' : 'border-cyan-500/30 hover:border-cyan-400/70 hover:shadow-[0_0_25px_rgba(34,211,238,0.2)]'
                }`}
              >
                <div className={`absolute inset-0 transition-all ${flashCounter === 'miners' ? 'bg-cyan-400/20' : 'bg-cyan-500/5 group-hover:bg-cyan-500/15'}`} />
                {flashCounter === 'miners' && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent animate-pulse" />}
                <div className="relative">
                  <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center mx-auto mb-3 group-hover:shadow-[0_0_15px_rgba(34,211,238,0.3)] transition-all">
                    <Users className="w-5 h-5 text-cyan-400" />
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  </div>
                  <motion.div 
                    key={activeMiners}
                    initial={{ scale: 1.2, opacity: 0.5 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-2xl font-bold text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]"
                  >
                    {activeMiners.toLocaleString()}
                  </motion.div>
                  <div className="text-zinc-400 text-sm mt-1">Active Miners</div>
                </div>
              </motion.div>

              {/* Stat 2 - Total Deposits - Neon Emerald */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }} 
                animate={{ opacity: 1, scale: 1 }} 
                transition={{ delay: 0.15 }}
                className={`bg-zinc-900/80 border rounded-xl p-5 text-center transition-all duration-300 relative overflow-hidden group ${
                  flashCounter === 'deposits' ? 'border-emerald-300 shadow-[0_0_40px_rgba(16,185,129,0.5)] scale-105' : 'border-emerald-500/30 hover:border-emerald-400/70 hover:shadow-[0_0_25px_rgba(16,185,129,0.2)]'
                }`}
              >
                <div className={`absolute inset-0 transition-all ${flashCounter === 'deposits' ? 'bg-emerald-400/20' : 'bg-emerald-500/5 group-hover:bg-emerald-500/15'}`} />
                {flashCounter === 'deposits' && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-400/30 to-transparent animate-pulse" />}
                <div className="relative">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center mx-auto mb-3 group-hover:shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all">
                    <ArrowDownRight className="w-5 h-5 text-emerald-400" />
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  </div>
                  <motion.div 
                    key={totalDeposited}
                    initial={{ scale: 1.2, opacity: 0.5 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-2xl font-bold text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                  >
                    ${totalDeposited.toLocaleString()}
                  </motion.div>
                  <div className="text-zinc-400 text-sm mt-1">Total Deposits</div>
                </div>
              </motion.div>

              {/* Stat 3 - Total Withdrawals - Neon Violet */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }} 
                animate={{ opacity: 1, scale: 1 }} 
                transition={{ delay: 0.2 }}
                className={`bg-zinc-900/80 border rounded-xl p-5 text-center transition-all duration-300 relative overflow-hidden group ${
                  flashCounter === 'withdrawals' ? 'border-violet-300 shadow-[0_0_40px_rgba(139,92,246,0.5)] scale-105' : 'border-violet-500/30 hover:border-violet-400/70 hover:shadow-[0_0_25px_rgba(139,92,246,0.2)]'
                }`}
              >
                <div className={`absolute inset-0 transition-all ${flashCounter === 'withdrawals' ? 'bg-violet-400/20' : 'bg-violet-500/5 group-hover:bg-violet-500/15'}`} />
                {flashCounter === 'withdrawals' && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-violet-400/30 to-transparent animate-pulse" />}
                <div className="relative">
                  <div className="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center mx-auto mb-3 group-hover:shadow-[0_0_15px_rgba(139,92,246,0.3)] transition-all">
                    <ArrowUpRight className="w-5 h-5 text-violet-400" />
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  </div>
                  <motion.div 
                    key={totalWithdrawn}
                    initial={{ scale: 1.2, opacity: 0.5 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-2xl font-bold text-violet-400 drop-shadow-[0_0_10px_rgba(139,92,246,0.5)]"
                  >
                    ${totalWithdrawn.toLocaleString()}
                  </motion.div>
                  <div className="text-zinc-400 text-sm mt-1">Total Withdrawals</div>
                </div>
              </motion.div>

              {/* Stat 4 - Online Now - Neon Orange (Dynamic) */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }} 
                animate={{ opacity: 1, scale: 1 }} 
                transition={{ delay: 0.25 }}
                className={`bg-zinc-900/80 border rounded-xl p-5 text-center transition-all duration-300 relative overflow-hidden group ${
                  flashCounter === 'online' ? 'border-orange-300 shadow-[0_0_40px_rgba(251,146,60,0.5)] scale-105' : 'border-orange-500/30 hover:border-orange-400/70 hover:shadow-[0_0_25px_rgba(251,146,60,0.2)]'
                }`}
              >
                <div className={`absolute inset-0 transition-all ${flashCounter === 'online' ? 'bg-orange-400/20' : 'bg-orange-500/5 group-hover:bg-orange-500/15'}`} />
                {flashCounter === 'online' && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-400/30 to-transparent animate-pulse" />}
                <div className="relative">
                  <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center mx-auto mb-3 relative group-hover:shadow-[0_0_15px_rgba(251,146,60,0.3)] transition-all">
                    <Zap className="w-5 h-5 text-orange-400" />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50" />
                  </div>
                  <motion.div 
                    key={onlineUsers}
                    initial={{ scale: 1.2, opacity: 0.5 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-2xl font-bold text-orange-400 drop-shadow-[0_0_10px_rgba(251,146,60,0.5)]"
                  >
                    {onlineUsers.toLocaleString()}
                  </motion.div>
                  <div className="text-zinc-400 text-sm mt-1 flex items-center justify-center gap-1">
                    <span>Online Now</span>
                    <span className="text-green-400 text-xs animate-pulse">●</span>
                  </div>
                </div>
              </motion.div>

              {/* Stat 5 - Profit Paid - Neon Yellow */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }} 
                animate={{ opacity: 1, scale: 1 }} 
                transition={{ delay: 0.3 }}
                className={`bg-zinc-900/80 border rounded-xl p-5 text-center transition-all duration-300 relative overflow-hidden group ${
                  flashCounter === 'profit' ? 'border-yellow-300 shadow-[0_0_40px_rgba(250,204,21,0.5)] scale-105' : 'border-yellow-500/30 hover:border-yellow-400/70 hover:shadow-[0_0_25px_rgba(250,204,21,0.2)]'
                }`}
              >
                <div className={`absolute inset-0 transition-all ${flashCounter === 'profit' ? 'bg-yellow-400/20' : 'bg-yellow-500/5 group-hover:bg-yellow-500/15'}`} />
                {flashCounter === 'profit' && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-400/30 to-transparent animate-pulse" />}
                <div className="relative">
                  <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center mx-auto mb-3 group-hover:shadow-[0_0_15px_rgba(250,204,21,0.3)] transition-all">
                    <TrendingUp className="w-5 h-5 text-yellow-400" />
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  </div>
                  <motion.div 
                    key={totalProfitPaid}
                    initial={{ scale: 1.2, opacity: 0.5 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-2xl font-bold text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]"
                  >
                    ${totalProfitPaid.toLocaleString()}
                  </motion.div>
                  <div className="text-zinc-400 text-sm mt-1">Profit Paid</div>
                </div>
              </motion.div>

              {/* Stat 6 - Visitors Today - Neon Pink */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }} 
                animate={{ opacity: 1, scale: 1 }} 
                transition={{ delay: 0.35 }}
                className={`bg-zinc-900/80 border rounded-xl p-5 text-center transition-all duration-300 relative overflow-hidden group ${
                  flashCounter === 'visitors' ? 'border-pink-300 shadow-[0_0_40px_rgba(236,72,153,0.5)] scale-105' : 'border-pink-500/30 hover:border-pink-400/70 hover:shadow-[0_0_25px_rgba(236,72,153,0.2)]'
                }`}
              >
                <div className={`absolute inset-0 transition-all ${flashCounter === 'visitors' ? 'bg-pink-400/20' : 'bg-pink-500/5 group-hover:bg-pink-500/15'}`} />
                {flashCounter === 'visitors' && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-pink-400/30 to-transparent animate-pulse" />}
                <div className="relative">
                  <div className="w-10 h-10 rounded-lg bg-pink-500/20 flex items-center justify-center mx-auto mb-3 group-hover:shadow-[0_0_15px_rgba(236,72,153,0.3)] transition-all">
                    <Users className="w-5 h-5 text-pink-400" />
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  </div>
                  <motion.div 
                    key={visitorsToday}
                    initial={{ scale: 1.2, opacity: 0.5 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-2xl font-bold text-pink-400 drop-shadow-[0_0_10px_rgba(236,72,153,0.5)]"
                  >
                    {visitorsToday.toLocaleString()}
                  </motion.div>
                  <div className="text-zinc-400 text-sm mt-1">Visitors Today</div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Visitors Today - NEW */}
        <section className="relative z-10 px-4 py-6">
          <div className="max-w-md mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }}
              className={`bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border rounded-2xl p-5 text-center relative overflow-hidden transition-all duration-300 ${
                flashCounter === 'visitors' ? 'border-indigo-300 shadow-[0_0_40px_rgba(99,102,241,0.5)] scale-105' : 'border-indigo-500/30'
              }`}
            >
              {flashCounter === 'visitors' && <div className="absolute inset-0 bg-indigo-400/20 animate-pulse" />}
              <div className="relative flex items-center justify-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                  <Users className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                  <motion.div 
                    key={visitorsToday}
                    initial={{ scale: 1.2, opacity: 0.5 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-2xl font-bold text-white"
                  >
                    {visitorsToday.toLocaleString()}
                  </motion.div>
                  <div className="text-indigo-300 text-sm">Visitors Today</div>
                </div>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              </div>
            </motion.div>
          </div>
        </section>

        {/* Today Statistics - NEW */}
        <section className="relative z-10 px-4 py-6">
          <div className="max-w-4xl mx-auto">
            <motion.h2 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="text-xl font-semibold text-white text-center mb-4 flex items-center justify-center gap-2"
            >
              Today Statistics
              <span className="text-xs text-green-400 flex items-center gap-1">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50" />
                LIVE
              </span>
            </motion.h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Today Deposits - Neon Green with Glassmorphism */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 0.1 }}
                className={`backdrop-blur-xl bg-gradient-to-br from-green-500/10 to-emerald-500/5 border rounded-2xl p-5 text-center transition-all duration-300 relative overflow-hidden group ${
                  flashCounter === 'todayDeposits' ? 'border-green-300 shadow-[0_0_40px_rgba(34,197,94,0.5)] scale-105' : 'border-green-500/30 hover:border-green-400/60 hover:shadow-[0_0_30px_rgba(34,197,94,0.15)]'
                }`}
              >
                <div className="absolute top-2 right-2 w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50" />
                {flashCounter === 'todayDeposits' && <div className="absolute inset-0 bg-green-400/20 animate-pulse" />}
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center mx-auto mb-3 group-hover:shadow-[0_0_20px_rgba(34,197,94,0.3)] transition-all">
                    <ArrowDownRight className="w-6 h-6 text-green-400" />
                  </div>
                  <motion.div 
                    key={todayDeposits}
                    initial={{ scale: 1.2, opacity: 0.5 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-2xl font-bold text-green-400 drop-shadow-[0_0_15px_rgba(34,197,94,0.6)]"
                  >
                    ${todayDeposits.toLocaleString()}
                  </motion.div>
                  <div className="text-zinc-400 text-xs mt-1">Today Deposits</div>
                </div>
              </motion.div>

              {/* Today Withdrawals - Neon Red with Glassmorphism */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 0.15 }}
                className={`backdrop-blur-xl bg-gradient-to-br from-red-500/10 to-rose-500/5 border rounded-2xl p-5 text-center transition-all duration-300 relative overflow-hidden group ${
                  flashCounter === 'todayWithdrawals' ? 'border-red-300 shadow-[0_0_40px_rgba(239,68,68,0.5)] scale-105' : 'border-red-500/30 hover:border-red-400/60 hover:shadow-[0_0_30px_rgba(239,68,68,0.15)]'
                }`}
              >
                <div className="absolute top-2 right-2 w-2 h-2 bg-red-400 rounded-full animate-pulse shadow-lg shadow-red-400/50" />
                {flashCounter === 'todayWithdrawals' && <div className="absolute inset-0 bg-red-400/20 animate-pulse" />}
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center mx-auto mb-3 group-hover:shadow-[0_0_20px_rgba(239,68,68,0.3)] transition-all">
                    <ArrowUpRight className="w-6 h-6 text-red-400" />
                  </div>
                  <motion.div 
                    key={todayWithdrawals}
                    initial={{ scale: 1.2, opacity: 0.5 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-2xl font-bold text-red-400 drop-shadow-[0_0_15px_rgba(239,68,68,0.6)]"
                  >
                    ${todayWithdrawals.toLocaleString()}
                  </motion.div>
                  <div className="text-zinc-400 text-xs mt-1">Today Withdrawals</div>
                </div>
              </motion.div>

              {/* Today Registered - Neon Blue with Glassmorphism */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 0.2 }}
                className={`backdrop-blur-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/5 border rounded-2xl p-5 text-center transition-all duration-300 relative overflow-hidden group ${
                  flashCounter === 'todayRegistered' ? 'border-blue-300 shadow-[0_0_40px_rgba(59,130,246,0.5)] scale-105' : 'border-blue-500/30 hover:border-blue-400/60 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)]'
                }`}
              >
                <div className="absolute top-2 right-2 w-2 h-2 bg-blue-400 rounded-full animate-pulse shadow-lg shadow-blue-400/50" />
                {flashCounter === 'todayRegistered' && <div className="absolute inset-0 bg-blue-400/20 animate-pulse" />}
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mx-auto mb-3 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all">
                    <Users className="w-6 h-6 text-blue-400" />
                  </div>
                  <motion.div 
                    key={todayRegistered}
                    initial={{ scale: 1.2, opacity: 0.5 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-2xl font-bold text-blue-400 drop-shadow-[0_0_15px_rgba(59,130,246,0.6)]"
                  >
                    {todayRegistered}
                  </motion.div>
                  <div className="text-zinc-400 text-xs mt-1">Registered Today</div>
                </div>
              </motion.div>

              {/* Today Profit Paid - Neon Amber with Glassmorphism */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 0.25 }}
                className={`backdrop-blur-xl bg-gradient-to-br from-amber-500/10 to-yellow-500/5 border rounded-2xl p-5 text-center transition-all duration-300 relative overflow-hidden group ${
                  flashCounter === 'todayProfit' ? 'border-amber-300 shadow-[0_0_40px_rgba(245,158,11,0.5)] scale-105' : 'border-amber-500/30 hover:border-amber-400/60 hover:shadow-[0_0_30px_rgba(245,158,11,0.15)]'
                }`}
              >
                <div className="absolute top-2 right-2 w-2 h-2 bg-amber-400 rounded-full animate-pulse shadow-lg shadow-amber-400/50" />
                {flashCounter === 'todayProfit' && <div className="absolute inset-0 bg-amber-400/20 animate-pulse" />}
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center mx-auto mb-3 group-hover:shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all">
                    <TrendingUp className="w-6 h-6 text-amber-400" />
                  </div>
                  <motion.div 
                    key={todayProfitPaid}
                    initial={{ scale: 1.2, opacity: 0.5 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-2xl font-bold text-amber-400 drop-shadow-[0_0_15px_rgba(245,158,11,0.6)]"
                  >
                    ${todayProfitPaid.toLocaleString()}
                  </motion.div>
                  <div className="text-zinc-400 text-xs mt-1">Today Profit Paid</div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Recent Withdrawals Board */}
        <section className="relative z-10 px-4 py-6">
          <div className="max-w-2xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }}
              className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-violet-500/10 to-pink-500/10 px-5 py-4 border-b border-zinc-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center">
                      <ArrowUpRight className="w-4 h-4 text-violet-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">Recent Withdrawals</h3>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-zinc-400 text-xs">Live</span>
                  </div>
                </div>
              </div>
              
              {/* List */}
              <div className="p-4 space-y-2 max-h-64 overflow-y-auto">
                <AnimatePresence mode="popLayout">
                  {recentWithdrawals.map((withdrawal, index) => (
                    <motion.div
                      key={`${withdrawal.name}-${index}`}
                      initial={{ opacity: 0, x: -20, height: 0 }}
                      animate={{ opacity: 1, x: 0, height: 'auto' }}
                      exit={{ opacity: 0, x: 20, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex items-center justify-between p-3 bg-zinc-800/30 rounded-lg border border-zinc-700/50 hover:border-violet-500/30 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
                          {withdrawal.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium">{withdrawal.name}</p>
                          <p className="text-zinc-500 text-xs">{withdrawal.time}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-violet-400 font-semibold">+{withdrawal.amount} USDT</p>
                        <p className="text-zinc-500 text-xs">Withdrawn</p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Referral Promotion Section */}
        <section className="relative z-10 px-4 py-6">
          <div className="max-w-2xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-violet-500/10 to-pink-500/10 border border-violet-500/30 rounded-2xl p-6 relative overflow-hidden"
            >
              {/* Background Pattern */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-violet-500/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-pink-500/10 rounded-full blur-3xl" />
              
              <div className="relative flex flex-col md:flex-row items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center shadow-lg shadow-violet-500/30">
                  <Gift className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-xl font-bold text-white mb-1">Earn 7% Referral Commission</h3>
                  <p className="text-zinc-400 text-sm">Invite friends and earn 7% commission on every deposit they make. No limits on earnings!</p>
                </div>
                <motion.button 
                  whileHover={{ scale: 1.05 }} 
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setAuthMode('register')}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-pink-500 text-white font-semibold shadow-lg shadow-violet-500/30"
                >
                  Get Started
                </motion.button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Trust Section - 4 Features */}
        <section className="relative z-10 px-4 py-6">
          <div className="max-w-4xl mx-auto">
            <motion.h2 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="text-xl font-semibold text-white text-center mb-4"
            >
              Why Trust Us
            </motion.h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 0.1 }}
                className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 text-center hover:border-emerald-500/30 transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
                  <Shield className="w-6 h-6 text-emerald-400" />
                </div>
                <h4 className="text-white font-medium mb-1">Secure</h4>
                <p className="text-zinc-500 text-xs">256-bit SSL encryption</p>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 0.2 }}
                className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 text-center hover:border-cyan-500/30 transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center mx-auto mb-3">
                  <Cpu className="w-6 h-6 text-cyan-400" />
                </div>
                <h4 className="text-white font-medium mb-1">Smart Contract</h4>
                <p className="text-zinc-500 text-xs">Automated payouts</p>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 0.3 }}
                className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 text-center hover:border-violet-500/30 transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center mx-auto mb-3">
                  <Clock className="w-6 h-6 text-violet-400" />
                </div>
                <h4 className="text-white font-medium mb-1">24/7 Support</h4>
                <p className="text-zinc-500 text-xs">Always here to help</p>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 0.4 }}
                className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 text-center hover:border-amber-500/30 transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="w-6 h-6 text-amber-400" />
                </div>
                <h4 className="text-white font-medium mb-1">Daily Profits</h4>
                <p className="text-zinc-500 text-xs">4-4.5% guaranteed</p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="relative z-10 px-4 py-6">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-xl font-semibold text-white text-center mb-4">Frequently Asked Questions</h2>
            <div className="space-y-2">
              {faqs.map((faq, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i }}
                  className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full px-4 py-3 flex items-center justify-between text-left">
                    <span className="text-white text-sm font-medium">{faq.q}</span>
                    {openFaq === i ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
                  </button>
                  <AnimatePresence>
                    {openFaq === i && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <p className="px-4 pb-3 text-zinc-400 text-sm">{faq.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="relative z-10 border-t border-zinc-800 py-8 bg-zinc-950 mt-auto">
          <div className="max-w-6xl mx-auto px-4">
            {/* Brand Section */}
            <div className="flex flex-col items-center mb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <span className="text-xl font-bold text-white">₮</span>
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-bold text-white">USDT Mining Lab</h3>
                  <p className="text-zinc-500 text-xs">Secure Cloud Mining Platform</p>
                </div>
              </div>
            </div>

            {/* Links */}
            <div className="flex flex-wrap justify-center gap-6 mb-6">
              <a href="#" className="text-zinc-400 text-sm hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                <Shield className="w-4 h-4" />
                Terms of Service
              </a>
              <a href="#" className="text-zinc-400 text-sm hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                <Lock className="w-4 h-4" />
                Privacy Policy
              </a>
              <a href="#" className="text-zinc-400 text-sm hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" />
                Support
              </a>
              <a href="#" className="text-zinc-400 text-sm hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/></svg>
                Telegram
              </a>
            </div>

            {/* Social Icons */}
            <div className="flex justify-center gap-3 mb-6">
              <a href="#" className="w-10 h-10 rounded-xl bg-zinc-800/50 border border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/20 transition-all">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/></svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-xl bg-zinc-800/50 border border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/20 transition-all">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-xl bg-zinc-800/50 border border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white hover:border-violet-500/50 hover:shadow-lg hover:shadow-violet-500/20 transition-all">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03z"/></svg>
              </a>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap justify-center gap-4 mb-6">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800/30 rounded-lg border border-zinc-700/50">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span className="text-zinc-400 text-xs">SSL Secured</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800/30 rounded-lg border border-zinc-700/50">
                <Lock className="w-4 h-4 text-violet-400" />
                <span className="text-zinc-400 text-xs">256-bit Encryption</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800/30 rounded-lg border border-zinc-700/50">
                <CheckCircle className="w-4 h-4 text-cyan-400" />
                <span className="text-zinc-400 text-xs">Verified Platform</span>
              </div>
            </div>

            {/* Copyright */}
            <div className="text-center border-t border-zinc-800 pt-4">
              <p className="text-zinc-600 text-xs">© 2026 USDT Mining Lab. All Rights Reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  // ==================== DASHBOARD ====================
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      <AnimatePresence>
        {success && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
            <div className="bg-emerald-500 text-white px-5 py-2.5 rounded-lg shadow-lg text-sm">{success}</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-zinc-900/95 backdrop-blur border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <span className="text-lg font-bold text-white">₮</span>
            </div>
            <span className="font-semibold text-white">USDT Mining Lab</span>
          </div>
          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-all"
            >
              <Bell className="w-4 h-4" />
              {notifications.filter(n => !n.isRead).length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
                  {notifications.filter(n => !n.isRead).length}
                </span>
              )}
            </button>
            
            {user && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800 rounded-lg">
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                <span className="text-zinc-400 text-xs font-mono">{user.walletAddress.slice(0, 6)}...{user.walletAddress.slice(-4)}</span>
              </div>
            )}
            <button onClick={handleLogout} className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-all">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Notification Dropdown */}
        <AnimatePresence>
          {showNotifications && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute right-4 top-16 w-80 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl overflow-hidden z-50"
            >
              <div className="p-3 border-b border-zinc-800 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">Notifications</h3>
                <button onClick={() => setShowNotifications(false)} className="text-zinc-500 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.slice(0, 5).map((n) => (
                    <div key={n.id} className="p-3 border-b border-zinc-800/50 hover:bg-zinc-800/30">
                      <p className="text-sm text-zinc-300">{n.message}</p>
                      <p className="text-xs text-zinc-500 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-zinc-500 text-sm text-center py-6">No notifications</p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Broadcast Message Bar */}
        {broadcasts.length > 0 && (
          <div className={`px-4 py-2 text-sm text-center ${
            broadcasts[0].type === 'warning' ? 'bg-amber-500/10 text-amber-400 border-b border-amber-500/20' :
            broadcasts[0].type === 'error' ? 'bg-red-500/10 text-red-400 border-b border-red-500/20' :
            broadcasts[0].type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border-b border-emerald-500/20' :
            'bg-cyan-500/10 text-cyan-400 border-b border-cyan-500/20'
          }`}>
            <strong>{broadcasts[0].title}:</strong> {broadcasts[0].message}
          </div>
        )}
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="hidden lg:flex w-56 flex-col bg-zinc-900/50 border-r border-zinc-800">
          <nav className="flex-1 p-3 space-y-1">
            {[
              { id: 'dashboard', icon: Home, label: 'Dashboard' },
              { id: 'deposit', icon: ArrowDownRight, label: 'Deposit' },
              { id: 'plans', icon: Zap, label: 'Mining Plans' },
              { id: 'withdraw', icon: ArrowUpRight, label: 'Withdraw' },
              { id: 'referral', icon: Gift, label: 'Referral' },
              { id: 'transactions', icon: Clock, label: 'Transactions' },
              { id: 'support', icon: Shield, label: 'Support' },
              ...(user?.role === 'admin' ? [{ id: 'admin', icon: Settings, label: 'Admin Panel' }] : []),
            ].map(item => (
              <button key={item.id} onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-all ${activeTab === item.id ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'}`}>
                <item.icon className="w-4 h-4" /><span>{item.label}</span>
              </button>
            ))}
          </nav>
          <div className="p-3 border-t border-zinc-800">
            <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-all text-sm">Logout</button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          <div className="max-w-5xl mx-auto">
          
          {activeTab === 'dashboard' && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
              <h1 className="text-xl font-semibold text-white">Welcome Back</h1>
              <p className="text-zinc-500 text-sm mt-0.5 font-mono">{user?.walletAddress.slice(0, 10)}...{user?.walletAddress.slice(-6)}</p>
            </motion.div>
          )}
          
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1"><Wallet className="w-3.5 h-3.5 text-cyan-400" /><span className="text-zinc-500 text-xs">Balance</span></div>
              <div className="text-xl font-semibold text-white">${formatNumber(user?.balance || 0)}</div>
              <p className="text-zinc-600 text-xs mt-0.5">Available to withdraw</p>
            </motion.div>
            
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1"><ArrowDownRight className="w-3.5 h-3.5 text-emerald-400" /><span className="text-zinc-500 text-xs">Deposits</span></div>
              <div className="text-xl font-semibold text-white">${formatNumber(userStats?.totalDeposits || 0)}</div>
              <p className="text-zinc-600 text-xs mt-0.5">{userStats?.depositCount || 0} transactions</p>
            </motion.div>
            
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1"><ArrowUpRight className="w-3.5 h-3.5 text-orange-400" /><span className="text-zinc-500 text-xs">Withdrawals</span></div>
              <div className="text-xl font-semibold text-white">${formatNumber(userStats?.totalWithdrawals || 0)}</div>
              <p className="text-zinc-600 text-xs mt-0.5">{userStats?.withdrawalCount || 0} transactions</p>
            </motion.div>
            
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1"><TrendingUp className="w-3.5 h-3.5 text-amber-400" /><span className="text-zinc-500 text-xs">Total Profit</span></div>
              <div className="text-xl font-semibold text-amber-400">${formatNumber(user?.totalProfit || 0)}</div>
              <p className="text-zinc-600 text-xs mt-0.5">From mining</p>
            </motion.div>
          </div>

          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <>
              {miningData && miningData.status === 'active' ? (
                <div className="bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-cyan-500/10 border border-emerald-500/30 rounded-2xl p-6 mb-6 relative overflow-hidden">
                  {/* Animated background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-transparent to-cyan-500/5 animate-pulse" />
                  
                  {/* Live indicator */}
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-1 bg-emerald-500/20 rounded-full">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                    <span className="text-emerald-400 text-xs font-medium">LIVE MINING</span>
                  </div>
                  
                  <div className="relative">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                        <Cpu className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-white">Active Mining Package</h2>
                        <p className="text-emerald-400 text-sm">Mining in progress...</p>
                      </div>
                    </div>
                    
                    {/* Live Earnings Counter */}
                    <div className="bg-zinc-900/80 backdrop-blur rounded-xl p-4 mb-4 border border-emerald-500/20">
                      <div className="text-center">
                        <p className="text-zinc-500 text-xs mb-1">Total Earned (Live)</p>
                        <motion.div 
                          key={miningData.totalEarned}
                          initial={{ scale: 1.05 }}
                          animate={{ scale: 1 }}
                          className="text-3xl font-bold text-emerald-400"
                        >
                          ${formatNumber(miningData.totalEarned)}
                        </motion.div>
                        <p className="text-zinc-600 text-xs mt-1">
                          Earning ${(miningData.dailyProfit / 86400).toFixed(6)} per second
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                      <div className="bg-zinc-900/50 backdrop-blur rounded-xl p-3 text-center">
                        <div className="text-zinc-500 text-xs mb-1">Investment</div>
                        <div className="text-lg font-bold text-white">${formatNumber(miningData.investment)}</div>
                      </div>
                      <div className="bg-zinc-900/50 backdrop-blur rounded-xl p-3 text-center">
                        <div className="text-zinc-500 text-xs mb-1">Daily Profit</div>
                        <div className="text-lg font-bold text-emerald-400">${formatNumber(miningData.dailyProfit)}</div>
                      </div>
                      <div className="bg-zinc-900/50 backdrop-blur rounded-xl p-3 text-center">
                        <div className="text-zinc-500 text-xs mb-1">Daily Rate</div>
                        <div className="text-lg font-bold text-cyan-400">{miningData.investment >= 100 ? '4.5%' : '4%'}</div>
                      </div>
                      <div className="bg-zinc-900/50 backdrop-blur rounded-xl p-3 text-center">
                        <div className="text-zinc-500 text-xs mb-1">Plan</div>
                        <div className="text-lg font-bold text-violet-400">{miningData.investment >= 100 ? 'Pro' : 'Starter'}</div>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="bg-zinc-900/50 backdrop-blur rounded-xl p-4 border border-zinc-700/50">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-zinc-400 text-sm">Mining Progress</span>
                        <span className="text-white text-sm font-medium">
                          Day {Math.min(30, Math.floor((Date.now() - new Date(miningData.startedAt).getTime()) / (1000 * 60 * 60 * 24)) + 1)} / 30
                        </span>
                      </div>
                      <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, ((Date.now() - new Date(miningData.startedAt).getTime()) / (1000 * 60 * 60 * 24 * 30)) * 100)}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                        />
                      </div>
                      <div className="flex justify-between mt-2 text-xs text-zinc-500">
                        <span>Started: {new Date(miningData.startedAt).toLocaleDateString()}</span>
                        <span>Expires: {new Date(miningData.expiresAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-8 text-center mb-6">
                  <div className="w-14 h-14 rounded-xl bg-zinc-800 flex items-center justify-center mx-auto mb-3"><Cpu className="w-7 h-7 text-zinc-600" /></div>
                  <h3 className="text-lg font-semibold text-white mb-1">No Active Mining Package</h3>
                  <p className="text-zinc-500 text-sm mb-4">Deposit USDT to activate mining and earn 4% daily profit</p>
                  <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} onClick={() => setActiveTab('deposit')} className="px-6 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-medium text-sm transition-all">Start Mining</motion.button>
                </div>
              )}
              
              <div className="grid grid-cols-3 gap-3 mb-6">
                <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} onClick={() => setActiveTab('deposit')} className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 hover:border-emerald-500/40 transition-all text-center"><ArrowDownRight className="w-5 h-5 text-emerald-400 mx-auto mb-1" /><span className="text-white text-sm">Deposit</span></motion.button>
                <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} onClick={() => setActiveTab('withdraw')} className="p-3 rounded-xl bg-orange-500/5 border border-orange-500/20 hover:border-orange-500/40 transition-all text-center"><ArrowUpRight className="w-5 h-5 text-orange-400 mx-auto mb-1" /><span className="text-white text-sm">Withdraw</span></motion.button>
                <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} onClick={() => setActiveTab('transactions')} className="p-3 rounded-xl bg-violet-500/5 border border-violet-500/20 hover:border-violet-500/40 transition-all text-center"><Clock className="w-5 h-5 text-violet-400 mx-auto mb-1" /><span className="text-white text-sm">History</span></motion.button>
              </div>

              <MiningCalculator />
              <ReferralSystem user={user} />

              <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
                <h3 className="text-base font-semibold text-white mb-3">Recent Transactions</h3>
                {transactions.length > 0 ? (
                  <div className="space-y-2">
                    {transactions.slice(0, 5).map((tx) => (
                      <div key={tx.id} className="flex items-center justify-between p-3 bg-zinc-800/30 rounded-lg border border-zinc-800">
                        <div><div className="text-white text-sm font-medium capitalize">{tx.type}</div><div className="text-zinc-500 text-xs">{new Date(tx.createdAt).toLocaleDateString()}</div></div>
                        <div className="text-right"><div className={`font-semibold ${tx.type === 'withdrawal' ? 'text-red-400' : 'text-emerald-400'}`}>{tx.type === 'withdrawal' ? '-' : '+'}${formatNumber(tx.amount)}</div><div className={`text-xs ${tx.status === 'approved' ? 'text-emerald-400' : 'text-amber-400'}`}>{tx.status}</div></div>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-zinc-500 text-center py-6 text-sm">No transactions yet</p>}
              </div>
            </>
          )}

          {/* Plans Tab */}
          {activeTab === 'plans' && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white">Mining Plans</h2>
              <p className="text-zinc-500 text-sm">Choose a plan to start earning daily profits</p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 hover:border-cyan-500/30 transition-all">
                  <div className="text-center mb-4"><div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center mx-auto mb-2"><Zap className="w-6 h-6 text-cyan-400" /></div><h3 className="text-lg font-semibold text-white">Starter</h3><p className="text-zinc-500 text-xs">$10 - $99</p></div>
                  <div className="space-y-2 mb-4 text-sm"><div className="flex justify-between"><span className="text-zinc-500">Daily Profit</span><span className="text-white">4%</span></div><div className="flex justify-between"><span className="text-zinc-500">Duration</span><span className="text-white">30 Days</span></div><div className="flex justify-between"><span className="text-zinc-500">Total Return</span><span className="text-emerald-400">120%</span></div></div>
                  <button onClick={() => setActiveTab('deposit')} className="w-full py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-600 text-white font-medium text-sm transition-all">Start Mining</button>
                </div>

                <div className="bg-zinc-900/50 border border-violet-500/30 rounded-xl p-5 relative">
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-violet-500 text-white text-xs font-medium px-3 py-0.5 rounded-full">POPULAR</div>
                  <div className="text-center mb-4"><div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center mx-auto mb-2"><Crown className="w-6 h-6 text-violet-400" /></div><h3 className="text-lg font-semibold text-white">Pro</h3><p className="text-zinc-500 text-xs">$100+</p></div>
                  <div className="space-y-2 mb-4 text-sm"><div className="flex justify-between"><span className="text-zinc-500">Daily Profit</span><span className="text-white">4.5%</span></div><div className="flex justify-between"><span className="text-zinc-500">Duration</span><span className="text-white">30 Days</span></div><div className="flex justify-between"><span className="text-zinc-500">Total Return</span><span className="text-emerald-400">135%</span></div></div>
                  <button onClick={() => setActiveTab('deposit')} className="w-full py-2.5 rounded-lg bg-violet-500 hover:bg-violet-600 text-white font-medium text-sm transition-all">Start Mining</button>
                </div>
              </div>
            </div>
          )}

          {/* Deposit Tab */}
          {activeTab === 'deposit' && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white">Deposit USDT</h2>
              <p className="text-zinc-500 text-sm">Minimum deposit: $10 USDT (TRC20)</p>
              
              <div className="grid lg:grid-cols-2 gap-4">
                {/* Deposit Form */}
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
                  <h3 className="text-base font-semibold text-white mb-4">Make Deposit</h3>
                  
                  {/* Amount Input */}
                  <div className="mb-4">
                    <label className="text-zinc-500 text-xs mb-1.5 block">Deposit Amount (USDT)</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                      <Input
                        type="number"
                        placeholder="Enter amount"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        className="bg-zinc-800/50 border-zinc-700 text-white h-11 pl-9 rounded-lg"
                        min="10"
                      />
                    </div>
                    <p className="text-zinc-600 text-xs mt-1">Minimum: $10 USDT</p>
                  </div>
                  
                  {/* TX Hash Input */}
                  <div className="mb-4">
                    <label className="text-zinc-500 text-xs mb-1.5 block">Transaction Hash</label>
                    <Input
                      type="text"
                      placeholder="0x..."
                      value={depositTxHash}
                      onChange={(e) => setDepositTxHash(e.target.value)}
                      className="bg-zinc-800/50 border-zinc-700 text-white h-11 rounded-lg font-mono text-xs"
                    />
                    <p className="text-zinc-600 text-xs mt-1">Paste your transaction hash after sending USDT</p>
                  </div>
                  
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={handleDeposit}
                    disabled={isDepositing}
                    className="w-full py-3 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isDepositing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        I Have Deposited
                      </>
                    )}
                  </motion.button>
                </div>
                
                {/* Wallet Address */}
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
                  <h3 className="text-base font-semibold text-white mb-4">Deposit Wallet Address</h3>
                  
                  <div className="mb-4 p-4 bg-zinc-800/30 rounded-xl border border-zinc-700/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-zinc-500 text-xs">USDT TRC20 Wallet</span>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText('TKjdBbwMjVn3nU7WpLQzQvJjvqXhVzGmWd');
                          setCopiedDeposit(true);
                          setTimeout(() => setCopiedDeposit(false), 2000);
                        }}
                        className="text-emerald-400 text-xs flex items-center gap-1 hover:underline"
                      >
                        {copiedDeposit ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        {copiedDeposit ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                    <code className="text-emerald-400 text-sm break-all font-mono">TKjdBbwMjVn3nU7WpLQzQvJjvqXhVzGmWd</code>
                  </div>
                  
                  <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                    <p className="text-amber-400 text-xs">
                      ⚠️ <strong>Important:</strong> Only send USDT (TRC20) to this address. Sending other tokens may result in permanent loss.
                    </p>
                  </div>
                  
                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Network</span>
                      <span className="text-white">TRC20 (Tron)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Min. Deposit</span>
                      <span className="text-white">$10 USDT</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Confirmation</span>
                      <span className="text-white">Manual (1-24h)</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Pending Deposits */}
              {pendingDeposits.length > 0 && (
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
                  <h3 className="text-base font-semibold text-white mb-3">Pending Deposits</h3>
                  <div className="space-y-2">
                    {pendingDeposits.map((deposit) => (
                      <div key={deposit.id} className="flex items-center justify-between p-3 bg-zinc-800/30 rounded-lg border border-zinc-700/50">
                        <div>
                          <div className="text-white text-sm font-medium">${formatNumber(deposit.amount)} USDT</div>
                          <div className="text-zinc-500 text-xs">{new Date(deposit.createdAt).toLocaleString()}</div>
                        </div>
                        <span className="px-2 py-1 bg-amber-500/10 text-amber-400 text-xs rounded-full">Pending</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Withdraw Tab */}
          {activeTab === 'withdraw' && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white">Withdraw USDT</h2>
              <p className="text-zinc-500 text-sm">Minimum withdrawal: $5 USDT</p>
              
              <div className="grid lg:grid-cols-2 gap-4">
                {/* Withdrawal Form */}
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
                  <h3 className="text-base font-semibold text-white mb-4">Request Withdrawal</h3>
                  
                  {/* Available Balance */}
                  <div className="mb-4 p-4 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-xl border border-emerald-500/20">
                    <div className="text-zinc-500 text-xs mb-1">Available Balance</div>
                    <div className="text-2xl font-bold text-emerald-400">${formatNumber(user?.balance || 0)}</div>
                  </div>
                  
                  {/* Amount Input */}
                  <div className="mb-4">
                    <label className="text-zinc-500 text-xs mb-1.5 block">Withdrawal Amount (USDT)</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                      <Input
                        type="number"
                        placeholder="Enter amount"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        className="bg-zinc-800/50 border-zinc-700 text-white h-11 pl-9 rounded-lg"
                        min="5"
                      />
                    </div>
                    <div className="flex justify-between mt-1">
                      <p className="text-zinc-600 text-xs">Minimum: $5 USDT</p>
                      <button 
                        onClick={() => setWithdrawAmount(String(user?.balance || 0))}
                        className="text-emerald-400 text-xs hover:underline"
                      >
                        Max
                      </button>
                    </div>
                  </div>
                  
                  {/* Wallet Address Input */}
                  <div className="mb-4">
                    <label className="text-zinc-500 text-xs mb-1.5 block">Your Wallet Address (TRC20)</label>
                    <Input
                      type="text"
                      placeholder="Enter your USDT wallet address"
                      value={withdrawWallet}
                      onChange={(e) => setWithdrawWallet(e.target.value)}
                      className="bg-zinc-800/50 border-zinc-700 text-white h-11 rounded-lg font-mono text-xs"
                    />
                    <p className="text-zinc-600 text-xs mt-1">Enter the wallet where you want to receive USDT</p>
                  </div>
                  
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={handleWithdraw}
                    disabled={isWithdrawing}
                    className="w-full py-3 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isWithdrawing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <ArrowUpRight className="w-4 h-4" />
                        Request Withdrawal
                      </>
                    )}
                  </motion.button>
                </div>
                
                {/* Withdrawal Info */}
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
                  <h3 className="text-base font-semibold text-white mb-4">Withdrawal Information</h3>
                  
                  <div className="space-y-3">
                    <div className="p-3 bg-zinc-800/30 rounded-lg border border-zinc-700/50">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="w-4 h-4 text-amber-400" />
                        <span className="text-white text-sm font-medium">Processing Time</span>
                      </div>
                      <p className="text-zinc-500 text-xs">Withdrawals are processed manually within 1-24 hours</p>
                    </div>
                    
                    <div className="p-3 bg-zinc-800/30 rounded-lg border border-zinc-700/50">
                      <div className="flex items-center gap-2 mb-1">
                        <Shield className="w-4 h-4 text-emerald-400" />
                        <span className="text-white text-sm font-medium">Secure Transfer</span>
                      </div>
                      <p className="text-zinc-500 text-xs">All withdrawals are sent via secure TRC20 network</p>
                    </div>
                    
                    <div className="p-3 bg-zinc-800/30 rounded-lg border border-zinc-700/50">
                      <div className="flex items-center gap-2 mb-1">
                        <AlertCircle className="w-4 h-4 text-cyan-400" />
                        <span className="text-white text-sm font-medium">Important</span>
                      </div>
                      <p className="text-zinc-500 text-xs">Make sure your wallet address is correct. Wrong address = lost funds</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Pending Withdrawals */}
              {pendingWithdrawals.length > 0 && (
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
                  <h3 className="text-base font-semibold text-white mb-3">Pending Withdrawals</h3>
                  <div className="space-y-2">
                    {pendingWithdrawals.map((withdrawal) => (
                      <div key={withdrawal.id} className="flex items-center justify-between p-3 bg-zinc-800/30 rounded-lg border border-zinc-700/50">
                        <div>
                          <div className="text-white text-sm font-medium">${formatNumber(withdrawal.amount)} USDT</div>
                          <div className="text-zinc-500 text-xs font-mono truncate max-w-[200px]">{withdrawal.walletAddress}</div>
                        </div>
                        <span className="px-2 py-1 bg-amber-500/10 text-amber-400 text-xs rounded-full">Pending</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Referral Tab */}
          {activeTab === 'referral' && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white">Referral Program</h2>
              <p className="text-zinc-500 text-sm">Earn 7% commission on every deposit from your referrals</p>
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 max-w-md">
                <h3 className="text-base font-semibold text-white mb-3">Your Referral Code</h3>
                <div className="flex gap-2">
                  <div className="flex-1 bg-zinc-800/50 rounded-lg px-4 py-2.5 text-emerald-400 font-mono text-base text-center border border-zinc-700">{user?.referralCode || 'LOADING...'}</div>
                  <button onClick={() => navigator.clipboard.writeText(user?.referralCode || '')} className="px-3 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white transition-all"><Copy className="w-4 h-4" /></button>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4 max-w-md">
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4"><div className="text-zinc-500 text-xs mb-1">Total Referrals</div><div className="text-2xl font-semibold text-white">{userStats?.referralCount || 0}</div></div>
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4"><div className="text-zinc-500 text-xs mb-1">Referral Earnings</div><div className="text-2xl font-semibold text-emerald-400">${formatNumber(user?.referralEarnings || 0)}</div></div>
              </div>
            </div>
          )}

          {/* Transactions Tab */}
          {activeTab === 'transactions' && (
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
              <h3 className="text-base font-semibold text-white mb-3">All Transactions</h3>
              {transactions.length > 0 ? (
                <div className="space-y-2">
                  {transactions.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between p-3 bg-zinc-800/30 rounded-lg border border-zinc-800">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${tx.type === 'withdrawal' ? 'bg-red-500/10' : 'bg-emerald-500/10'}`}>{tx.type === 'withdrawal' ? <ArrowUpRight className="w-4 h-4 text-red-400" /> : <ArrowDownRight className="w-4 h-4 text-emerald-400" />}</div>
                        <div><div className="text-white text-sm font-medium capitalize">{tx.type}</div><div className="text-zinc-500 text-xs">{new Date(tx.createdAt).toLocaleString()}</div></div>
                      </div>
                      <div className="text-right"><div className={`font-semibold ${tx.type === 'withdrawal' ? 'text-red-400' : 'text-emerald-400'}`}>{tx.type === 'withdrawal' ? '-' : '+'}${formatNumber(tx.amount)}</div><div className={`text-xs px-2 py-0.5 rounded-full inline-block ${tx.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>{tx.status}</div></div>
                    </div>
                  ))}
                </div>
              ) : <p className="text-zinc-500 text-center py-6 text-sm">No transactions yet</p>}
            </div>
          )}

          {/* Support Tab */}
          {activeTab === 'support' && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white">Support</h2>
              <p className="text-zinc-500 text-sm">Need help? Contact our support team</p>
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 max-w-md">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center"><Shield className="w-5 h-5 text-emerald-400" /></div>
                  <div><h3 className="text-base font-semibold text-white">24/7 Support</h3><p className="text-zinc-500 text-xs">We're here to help you</p></div>
                </div>
                <div className="space-y-3">
                  <div className="p-3 bg-zinc-800/30 rounded-lg"><div className="text-zinc-500 text-xs">Email</div><div className="text-white text-sm">support@usdtmininglab.com</div></div>
                  <div className="p-3 bg-zinc-800/30 rounded-lg"><div className="text-zinc-500 text-xs">Telegram</div><div className="text-white text-sm">@usdtmininglab</div></div>
                </div>
              </div>
            </div>
          )}

          {/* Admin Panel Tab */}
          {activeTab === 'admin' && user?.role === 'admin' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-white">Admin Control Panel</h2>
                  <p className="text-zinc-500 text-sm">Manage deposits, withdrawals, and broadcast messages</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-violet-500/10 border border-violet-500/30 rounded-lg">
                  <Shield className="w-4 h-4 text-violet-400" />
                  <span className="text-violet-400 text-sm font-medium">Admin</span>
                </div>
              </div>

              {/* Admin Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
                  <div className="text-zinc-500 text-xs mb-1">Pending Deposits</div>
                  <div className="text-2xl font-bold text-amber-400">{adminStats.pendingDeposits}</div>
                </div>
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
                  <div className="text-zinc-500 text-xs mb-1">Pending Withdrawals</div>
                  <div className="text-2xl font-bold text-amber-400">{adminStats.pendingWithdrawals}</div>
                </div>
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
                  <div className="text-zinc-500 text-xs mb-1">Total Users</div>
                  <div className="text-2xl font-bold text-cyan-400">{adminStats.totalUsers}</div>
                </div>
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
                  <div className="text-zinc-500 text-xs mb-1">Total Deposits</div>
                  <div className="text-2xl font-bold text-emerald-400">${formatNumber(adminStats.totalDeposits)}</div>
                </div>
              </div>

              {/* Pending Deposits Section */}
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
                <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
                  <ArrowDownRight className="w-5 h-5 text-emerald-400" />
                  Pending Deposits
                </h3>
                {adminDeposits.filter(d => d.status === 'pending').length > 0 ? (
                  <div className="space-y-2">
                    {adminDeposits.filter(d => d.status === 'pending').map((deposit) => (
                      <div key={deposit.id} className="flex items-center justify-between p-3 bg-zinc-800/30 rounded-lg border border-zinc-700/50">
                        <div className="flex-1">
                          <div className="text-white text-sm font-medium">${formatNumber(deposit.amount)} USDT</div>
                          <div className="text-zinc-500 text-xs">{deposit.user?.email || 'Unknown'}</div>
                          <div className="text-zinc-600 text-xs font-mono truncate">{deposit.txHash}</div>
                        </div>
                        <div className="flex gap-2">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleAdminAction('approveDeposit', deposit.id)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-medium hover:bg-emerald-500/20 transition-all flex items-center gap-1"
                          >
                            <UserCheck className="w-3 h-3" />
                            Approve
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleAdminAction('rejectDeposit', deposit.id)}
                            className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 text-xs font-medium hover:bg-red-500/20 transition-all flex items-center gap-1"
                          >
                            <UserX className="w-3 h-3" />
                            Reject
                          </motion.button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-zinc-500 text-center py-6 text-sm">No pending deposits</p>
                )}
              </div>

              {/* Pending Withdrawals Section */}
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
                <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
                  <ArrowUpRight className="w-5 h-5 text-orange-400" />
                  Pending Withdrawals
                </h3>
                {adminWithdrawals.filter(w => w.status === 'pending').length > 0 ? (
                  <div className="space-y-2">
                    {adminWithdrawals.filter(w => w.status === 'pending').map((withdrawal) => (
                      <div key={withdrawal.id} className="flex items-center justify-between p-3 bg-zinc-800/30 rounded-lg border border-zinc-700/50">
                        <div className="flex-1">
                          <div className="text-white text-sm font-medium">${formatNumber(withdrawal.amount)} USDT</div>
                          <div className="text-zinc-500 text-xs">{withdrawal.user?.email || 'Unknown'}</div>
                          <div className="text-zinc-600 text-xs font-mono truncate">{withdrawal.walletAddress}</div>
                        </div>
                        <div className="flex gap-2">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleAdminAction('approveWithdrawal', withdrawal.id)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-medium hover:bg-emerald-500/20 transition-all flex items-center gap-1"
                          >
                            <UserCheck className="w-3 h-3" />
                            Approve
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleAdminAction('rejectWithdrawal', withdrawal.id)}
                            className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 text-xs font-medium hover:bg-red-500/20 transition-all flex items-center gap-1"
                          >
                            <UserX className="w-3 h-3" />
                            Reject
                          </motion.button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-zinc-500 text-center py-6 text-sm">No pending withdrawals</p>
                )}
              </div>

              {/* Broadcast Message Section */}
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
                <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-cyan-400" />
                  Broadcast Message
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-zinc-500 text-xs mb-1.5 block">Title</label>
                    <Input
                      type="text"
                      placeholder="Message title"
                      value={broadcastTitle}
                      onChange={(e) => setBroadcastTitle(e.target.value)}
                      className="bg-zinc-800/50 border-zinc-700 text-white h-10 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="text-zinc-500 text-xs mb-1.5 block">Message</label>
                    <textarea
                      placeholder="Enter your broadcast message..."
                      value={broadcastMessage}
                      onChange={(e) => setBroadcastMessage(e.target.value)}
                      className="w-full bg-zinc-800/50 border border-zinc-700 text-white rounded-lg p-3 text-sm resize-none h-24"
                    />
                  </div>
                  <div>
                    <label className="text-zinc-500 text-xs mb-1.5 block">Type</label>
                    <div className="flex gap-2">
                      {['info', 'warning', 'success', 'error'].map((type) => (
                        <button
                          key={type}
                          onClick={() => setBroadcastType(type)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            broadcastType === type 
                              ? type === 'warning' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                                type === 'error' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                                type === 'success' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                                'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                              : 'bg-zinc-800 text-zinc-400 hover:text-white'
                          }`}
                        >
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={handleSendBroadcast}
                    disabled={isSendingBroadcast}
                    className="w-full py-3 rounded-lg bg-cyan-500 hover:bg-cyan-600 text-white font-semibold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    {isSendingBroadcast ? 'Sending...' : 'Send Broadcast'}
                  </motion.button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      </div>

      <footer className="border-t border-zinc-900 py-3 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4 text-center"><p className="text-zinc-600 text-xs">© 2026 USDT Mining Lab</p></div>
      </footer>
    </div>
  );
}
