'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wallet, TrendingUp, Users, Shield, Zap, 
  Lock, Eye, EyeOff, RefreshCw,
  ArrowDownRight, ArrowUpRight, Crown, Activity, Cpu, Gift,
  LogOut, Clock, Home, Copy, Check, X, AlertCircle, CheckCircle,
  ChevronRight, DollarSign, HelpCircle, MessageCircle, Settings, Server
} from 'lucide-react';
import { Input } from '@/components/ui/input';

// Types
interface User {
  id: string;
  walletAddress: string;
  balance: number;
  totalProfit: number;
  referralEarnings: number;
  referralCode: string;
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

// Animated Counter Component
function AnimatedCounter({ end, decimals = 0, duration = 2000 }: { end: number; decimals?: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeOutQuart * end));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [isVisible, end, duration]);

  return (
    <span ref={ref}>
      {count.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
    </span>
  );
}

export default function UsdtMiningLab() {
  // Loading Screen State
  const [isLoadingScreen, setIsLoadingScreen] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState(0);
  const [hashrateCounter, setHashrateCounter] = useState(0);
  
  const loadingMessages = [
    'Connecting Blockchain Nodes...',
    'Initializing Mining Servers...',
    'Launching Mining Engine...',
    'Synchronizing Network Data...'
  ];

  // Login Page State
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [walletInput, setWalletInput] = useState('');
  const [pinInput, setPinInput] = useState('');
  const [referralInput, setReferralInput] = useState('');
  const [showPinVisibility, setShowPinVisibility] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Dashboard State (after login)
  const [user, setUser] = useState<User | null>(null);
  const [miningData, setMiningData] = useState<MiningData | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showDashboard, setShowDashboard] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Live Stats
  const [liveHashrate, setLiveHashrate] = useState(128.45);
  const [onlineVisitors, setOnlineVisitors] = useState(1847);

  // Sequential Glow Effect State
  const [activePlatformGlow, setActivePlatformGlow] = useState(0);
  const [activeTodayGlow, setActiveTodayGlow] = useState(0);

  // FAQ State
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const particlesRef = useRef<HTMLDivElement>(null);

  // Additional Dashboard State
  const [currentProfit, setCurrentProfit] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [platformStats, setPlatformStats] = useState({
    totalUsers: 0,
    totalDeposits: 0,
    totalWithdrawals: 0,
    profitPaid: 0,
    activeMiners: 0,
    onlineUsers: 0
  });
  const [todayStats, setTodayStats] = useState({
    todayDeposits: 0,
    todayWithdrawals: 0,
    newUsers: 0,
    todayProfit: 0
  });
  const [calculatorAmount, setCalculatorAmount] = useState('');
  const [calculatorPlan, setCalculatorPlan] = useState<'starter' | 'pro'>('starter');
  const [depositHistory, setDepositHistory] = useState<Array<{ wallet: string; amount: number; status: string; date: string }>>([]);
  const [withdrawalHistory, setWithdrawalHistory] = useState<Array<{ wallet: string; amount: number; status: string; date: string }>>([]);
  const [miningTimer, setMiningTimer] = useState({ elapsed: 0, remaining: 2592000 });
  const [startMiningLoading, setStartMiningLoading] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  
  const depositScrollRef = useRef<HTMLDivElement>(null);
  const withdrawalScrollRef = useRef<HTMLDivElement>(null);

  // Sequential Glow Effect - Platform Statistics (6 cards)
  useEffect(() => {
    const interval = setInterval(() => {
      setActivePlatformGlow(prev => (prev + 1) % 6);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  // Sequential Glow Effect - Today Statistics (4 cards)
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTodayGlow(prev => (prev + 1) % 4);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  // Real-time mining profit update
  useEffect(() => {
    if (miningData && miningData.status === 'active') {
      const interval = setInterval(() => {
        // Calculate profit per second (daily profit / 86400)
        const profitPerSecond = miningData.dailyProfit / 86400;
        setCurrentProfit(prev => prev + profitPerSecond);
        setElapsedSeconds(prev => prev + 1);
        
        // Update timer
        const started = new Date(miningData.startedAt).getTime();
        const expires = new Date(miningData.expiresAt).getTime();
        const now = Date.now();
        const elapsed = Math.floor((now - started) / 1000);
        const remaining = Math.max(0, Math.floor((expires - now) / 1000));
        setMiningTimer({ elapsed, remaining });
        
        // Call update API every second
        fetch('/api/mining/update', { method: 'POST' }).catch(() => {});
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [miningData]);

  // Fetch platform stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/stats');
        if (res.ok) {
          const data = await res.json();
          setPlatformStats({
            totalUsers: data.totalUsers || 0,
            totalDeposits: data.totalDeposits || 0,
            totalWithdrawals: data.totalWithdrawals || 0,
            profitPaid: data.totalProfitDistributed || 0,
            activeMiners: data.activeMiners || 0,
            onlineUsers: data.onlineUsers || 0
          });
          setTodayStats({
            todayDeposits: data.todayDeposits || 0,
            todayWithdrawals: data.todayWithdrawals || 0,
            newUsers: data.newUsersToday || 0,
            todayProfit: data.todayProfit || 0
          });
        }
      } catch { /* ignore */ }
    };
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  // Fetch deposit/withdrawal history
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch('/api/history');
        if (res.ok) {
          const data = await res.json();
          if (data.hasRealData) {
            setDepositHistory(data.deposits);
            setWithdrawalHistory(data.withdrawals);
          }
        }
      } catch { /* ignore */ }
    };
    fetchHistory();
    const interval = setInterval(fetchHistory, 30000);
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll deposit history
  useEffect(() => {
    const container = depositScrollRef.current;
    if (!container) return;
    
    const scroll = () => {
      container.scrollTop += 1;
      if (container.scrollTop >= container.scrollHeight - container.clientHeight) {
        container.scrollTop = 0;
      }
    };
    
    const interval = setInterval(scroll, 50);
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll withdrawal history
  useEffect(() => {
    const container = withdrawalScrollRef.current;
    if (!container) return;
    
    const scroll = () => {
      container.scrollTop += 1;
      if (container.scrollTop >= container.scrollHeight - container.clientHeight) {
        container.scrollTop = 0;
      }
    };
    
    const interval = setInterval(scroll, 50);
    return () => clearInterval(interval);
  }, []);

  // ==================== LOADING SCREEN ====================
  useEffect(() => {
    if (isLoadingScreen) {
      const progressInterval = setInterval(() => {
        setLoadingProgress(prev => prev >= 100 ? 100 : prev + 1.2);
      }, 35);

      const messageInterval = setInterval(() => {
        setLoadingMessage(prev => (prev + 1) % loadingMessages.length);
      }, 2000);

      const hashrateInterval = setInterval(() => {
        setHashrateCounter(prev => prev >= 120 ? 120 : prev + 3);
      }, 40);

      const completeTimeout = setTimeout(() => {
        setIsLoadingScreen(false);
        if (typeof window !== 'undefined') {
          const savedUser = localStorage.getItem('usdt_user');
          if (savedUser) {
            setUser(JSON.parse(savedUser));
            fetchUserData();
            setShowDashboard(true);
          }
        }
      }, 3000);

      // Create particles
      if (particlesRef.current) {
        for (let i = 0; i < 50; i++) {
          const particle = document.createElement('div');
          particle.className = 'absolute rounded-full';
          particle.style.background = `rgba(0, 212, 255, ${Math.random() * 0.3 + 0.1})`;
          particle.style.width = `${Math.random() * 6 + 2}px`;
          particle.style.height = particle.style.width;
          particle.style.left = `${Math.random() * 100}%`;
          particle.style.top = `${Math.random() * 100}%`;
          particle.style.animation = `float ${Math.random() * 10 + 5}s ease-in-out infinite`;
          particle.style.animationDelay = `${Math.random() * 5}s`;
          particlesRef.current.appendChild(particle);
        }
      }

      return () => {
        clearInterval(progressInterval);
        clearInterval(messageInterval);
        clearInterval(hashrateInterval);
        clearTimeout(completeTimeout);
      };
    }
  }, [isLoadingScreen]);

  // Live Hashrate fluctuation
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveHashrate(prev => {
        const change = (Math.random() - 0.5) * 0.1;
        return Math.max(128, Math.min(129, prev + change));
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Online visitors fluctuation
  useEffect(() => {
    const interval = setInterval(() => {
      setOnlineVisitors(prev => {
        const change = Math.floor(Math.random() * 5) - 2;
        return Math.max(1800, Math.min(1900, prev + change));
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Fetch User Data
  const fetchUserData = async () => {
    try {
      const res = await fetch('/api/user/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setMiningData(data.mining);
        setUserStats(data.stats || null);
        setTransactions(data.transactions || []);
        if (typeof window !== 'undefined') {
          localStorage.setItem('usdt_user', JSON.stringify(data.user));
        }
      }
    } catch {}
  };

  // Login Handler
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
      if (typeof window !== 'undefined') {
        localStorage.setItem('usdt_user', JSON.stringify(data.user));
      }
      setShowDashboard(true);
      setSuccess('Welcome back!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Register Handler
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
      if (typeof window !== 'undefined') {
        localStorage.setItem('usdt_user', JSON.stringify(data.user));
      }
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
    if (typeof window !== 'undefined') {
      localStorage.removeItem('usdt_user');
    }
    setUser(null);
    setMiningData(null);
    setShowDashboard(false);
    setWalletInput('');
    setPinInput('');
    setSuccess('Logged out successfully');
  };

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
    { q: 'How does USDT mining work?', a: 'USDT mining uses your deposited funds to generate daily profits through our cloud mining infrastructure. You earn 4-4.5% daily returns on your investment.' },
    { q: 'What is the minimum deposit?', a: 'The minimum deposit is 10 USDT for the Starter Plan and 100 USDT for the Pro Plan.' },
    { q: 'How do I withdraw my profits?', a: 'You can withdraw your profits anytime through the Withdraw section. Withdrawals are processed within 24 hours.' },
    { q: 'Is my investment safe?', a: 'Yes, we use 256-bit SSL encryption and smart contracts for automated payouts. Your funds are secure with us.' },
    { q: 'How does the referral program work?', a: 'Share your referral code and earn 7% commission on every deposit made by your referrals.' },
  ];

  // Recent Withdrawals Data - Fetch from API
  const [recentWithdrawals, setRecentWithdrawals] = useState<Array<{
    user: string;
    amount: number;
    time: string;
  }>>([]);

  // Withdraw State
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawWallet, setWithdrawWallet] = useState('');
  const [withdrawPin, setWithdrawPin] = useState('');
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);
  const [withdrawSuccess, setWithdrawSuccess] = useState<string | null>(null);

  // Fetch recent withdrawals from API
  useEffect(() => {
    const fetchWithdrawals = async () => {
      try {
        const res = await fetch('/api/activities');
        const data = await res.json();
        if (data.activities && data.activities.length > 0) {
          const withdrawals = data.activities
            .filter((a: { type: string }) => a.type === 'withdraw')
            .slice(0, 5)
            .map((a: { message: string; amount?: number; createdAt?: Date }) => {
              // Extract username from message like "0x1234...abcd just withdrew 120 USDT"
              const match = a.message.match(/^(.+?)\s+just withdrew/);
              const user = match ? match[1] : 'User';
              return {
                user,
                amount: a.amount || 0,
                time: 'Just now'
              };
            });
          if (withdrawals.length > 0) {
            setRecentWithdrawals(withdrawals);
          }
        }
      } catch {
        // Keep demo data on error
      }
    };
    fetchWithdrawals();
  }, []);

  // Handle Withdraw
  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!withdrawAmount || parseFloat(withdrawAmount) < 10) {
      setWithdrawError('Minimum withdrawal is 10 USDT');
      return;
    }
    if (!withdrawWallet || withdrawWallet.length !== 42 || !withdrawWallet.startsWith('0x')) {
      setWithdrawError('Invalid BEP20 wallet address');
      return;
    }
    if (!withdrawPin || withdrawPin.length !== 6) {
      setWithdrawError('PIN must be 6 digits');
      return;
    }
    
    setWithdrawLoading(true);
    setWithdrawError(null);
    
    try {
      const res = await fetch('/api/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(withdrawAmount),
          walletAddress: withdrawWallet,
          pin: withdrawPin
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Withdrawal failed');
      
      setWithdrawSuccess('Withdrawal request submitted! Awaiting approval.');
      setWithdrawAmount('');
      setWithdrawWallet('');
      setWithdrawPin('');
      fetchUserData(); // Refresh user data
    } catch (err) {
      setWithdrawError(err instanceof Error ? err.message : 'Withdrawal failed');
    } finally {
      setWithdrawLoading(false);
    }
  };

  // Live Activity Ticker State
  const [tickerActivities, setTickerActivities] = useState<Array<{
    type: string;
    message: string;
    amount?: number;
  }>>([]);

  // Fetch live activities for ticker
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const res = await fetch('/api/activities');
        const data = await res.json();
        if (data.hasRealData && data.activities.length > 0) {
          setTickerActivities(data.activities);
        } else {
          setTickerActivities([]);
        }
      } catch {
        setTickerActivities([]);
      }
    };
    fetchActivities();
    // Refresh activities every 30 seconds
    const interval = setInterval(fetchActivities, 30000);
    return () => clearInterval(interval);
  }, []);

  // Start mining handler
  const handleStartMining = async (planType: 'starter' | 'pro') => {
    const minAmount = planType === 'starter' ? 10 : 100;
    if ((user?.balance || 0) < minAmount) {
      setError(`Insufficient balance. Minimum ${minAmount} USDT required for ${planType} plan.`);
      return;
    }
    
    setStartMiningLoading(planType);
    try {
      const res = await fetch('/api/mining/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planType })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to start mining');
      
      setMiningData(data.mining);
      fetchUserData();
      setSuccess(`${planType === 'starter' ? 'Starter' : 'Pro'} Plan activated successfully!`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start mining');
    } finally {
      setStartMiningLoading(null);
    }
  };

  // Format time helper
  const formatTime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return { days, hours, mins, secs };
  };

  // Calculator earnings helper
  const getCalculatorEarnings = () => {
    const amount = parseFloat(calculatorAmount) || 0;
    const dailyRate = calculatorPlan === 'starter' ? 0.04 : 0.045;
    const daily = amount * dailyRate;
    return {
      second: daily / 86400,
      minute: daily / 1440,
      hour: daily / 24,
      day: daily,
      week: daily * 7,
      month: daily * 30,
      total: amount * (calculatorPlan === 'starter' ? 1.2 : 1.35)
    };
  };

  // ==================== LOADING SCREEN ====================
  if (isLoadingScreen) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center overflow-hidden">
        <div ref={particlesRef} className="absolute inset-0 pointer-events-none" />
        
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full blur-3xl animate-pulse" style={{ background: 'rgba(0, 212, 255, 0.1)' }} />
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full blur-3xl animate-pulse" style={{ background: 'rgba(138, 43, 226, 0.1)', animationDelay: '1s' }} />
        </div>

        <div className="relative z-10 text-center px-4">
          {/* Logo */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: [1, 1.05, 1], opacity: 1 }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="mb-8"
          >
            <div className="relative inline-block">
              <div className="w-28 h-28 rounded-3xl flex items-center justify-center relative" style={{ background: 'linear-gradient(135deg, #00d4ff, #8a2be2)', boxShadow: '0 0 60px rgba(0, 212, 255, 0.5)' }}>
                <svg className="w-16 h-16 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H11.1v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.24c.1 1.7 1.36 2.66 2.86 2.97V19h2.13v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.65-3.42z"/>
                </svg>
              </div>
            </div>
          </motion.div>

          {/* Brand Name */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl md:text-5xl font-bold mb-2"
            style={{ background: 'linear-gradient(90deg, #00d4ff, #8a2be2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
          >
            USDT Mining Lab
          </motion.h1>
          <motion.p className="text-gray-400 mb-8">Premium Cloud Mining Platform</motion.p>

          {/* Loading Message */}
          <AnimatePresence mode="wait">
            <motion.div
              key={loadingMessage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 h-6 font-medium"
              style={{ color: '#00d4ff' }}
            >
              {loadingMessages[loadingMessage]}
            </motion.div>
          </AnimatePresence>

          {/* Progress Bar */}
          <div className="w-72 mx-auto mb-4">
            <div className="h-3 rounded-full overflow-hidden border border-white/10 bg-slate-800/80">
              <motion.div
                className="h-full rounded-full"
                style={{ width: `${loadingProgress}%`, background: 'linear-gradient(90deg, #00d4ff, #8a2be2)' }}
              />
            </div>
            <div className="text-white mt-3 text-lg font-semibold">{Math.round(loadingProgress)}%</div>
          </div>

          {/* Hashrate */}
          <div className="mb-4">
            <span className="text-gray-500 text-sm">Hashrate: </span>
            <span className="font-mono text-lg font-bold" style={{ color: '#00d4ff' }}>{hashrateCounter} TH/s</span>
          </div>

          {/* Security */}
          <div className="flex items-center justify-center gap-4 text-gray-500 text-xs">
            <span className="flex items-center gap-1"><Shield className="w-3 h-3 text-emerald-400" />SSL Secured</span>
            <span>|</span>
            <span className="flex items-center gap-1"><Lock className="w-3 h-3" style={{ color: '#00d4ff' }} />256-bit Encryption</span>
          </div>
        </div>

        <style jsx>{`@keyframes float { 0%, 100% { transform: translateY(0) translateX(0); } 50% { transform: translateY(-20px) translateX(10px); } }`}</style>
      </div>
    );
  }

  // ==================== LOGIN PAGE ====================
  if (!showDashboard) {
    return (
      <div className="min-h-screen bg-black flex flex-col">
        {/* Toast Messages */}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -50 }} className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
              <div className="bg-red-500/90 backdrop-blur-xl text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                {error}
              </div>
            </motion.div>
          )}
          {success && (
            <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -50 }} className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
              <div className="bg-emerald-500/90 backdrop-blur-xl text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                {success}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/5">
          <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #00d4ff, #8a2be2)' }}>
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H11.1v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.24c.1 1.7 1.36 2.66 2.86 2.97V19h2.13v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.65-3.42z"/>
                </svg>
              </div>
              <span className="font-bold text-base" style={{ background: 'linear-gradient(90deg, #00d4ff, #8a2be2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>USDT Mining Lab</span>
            </div>
            <div className="flex items-center gap-2 text-gray-500 text-xs">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span>BEP20 Secure</span>
              <span className="text-gray-700">|</span>
              <span>256-bit SSL</span>
              <span className="text-gray-700">|</span>
              <span>Smart Contract</span>
            </div>
          </div>
        </header>

        {/* Live Activity Ticker */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-white/5 overflow-hidden">
          <div className="py-2.5">
            <div className="flex items-center">
              <div className="flex items-center gap-2 px-4 py-1 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border-r border-white/10">
                <div className="relative">
                  <div className="w-2 h-2 bg-green-400 rounded-full" />
                  <div className="absolute inset-0 w-2 h-2 bg-green-400 rounded-full animate-ping" />
                </div>
                <span className="text-green-400 text-xs font-bold uppercase tracking-wider whitespace-nowrap">LIVE</span>
              </div>
              <div className="flex-1 overflow-hidden">
                <motion.div
                  className="flex gap-8 whitespace-nowrap"
                  animate={{ x: ['0%', '-50%'] }}
                  transition={{
                    x: {
                      duration: tickerActivities.length * 2,
                      repeat: Infinity,
                      ease: 'linear',
                    },
                  }}
                >
                  {[...tickerActivities, ...tickerActivities].map((activity, i) => (
                    <div key={i} className="flex items-center gap-2 px-3">
                      {activity.type === 'withdraw' && (
                        <ArrowUpRight className="w-4 h-4 text-red-400" />
                      )}
                      {activity.type === 'deposit' && (
                        <ArrowDownRight className="w-4 h-4 text-green-400" />
                      )}
                      {activity.type === 'plan' && (
                        <Zap className="w-4 h-4 text-cyan-400" />
                      )}
                      <span className={`text-sm font-medium ${
                        activity.type === 'withdraw' ? 'text-red-300' :
                        activity.type === 'deposit' ? 'text-green-300' : 'text-cyan-300'
                      }`}>
                        {activity.message}
                      </span>
                    </div>
                  ))}
                </motion.div>
              </div>
            </div>
          </div>
        </div>

        <main className="flex-1 px-4 py-6">
          <div className="max-w-lg mx-auto space-y-6">
            
            {/* Mining Plans */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <h2 className="text-white font-bold text-xl mb-4">Mining Plans</h2>
              <div className="grid grid-cols-2 gap-3">
                {/* Starter Plan */}
                <motion.div 
                  whileHover={{ 
                    scale: 1.02, 
                    boxShadow: '0 0 30px rgba(0, 212, 255, 0.4), 0 0 60px rgba(0, 212, 255, 0.2)',
                    borderColor: 'rgba(0, 212, 255, 0.8)'
                  }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="bg-gradient-to-br from-slate-900 to-slate-800 border-2 border-cyan-500/30 rounded-2xl p-4 relative overflow-hidden cursor-pointer"
                >
                  <div className="absolute top-0 right-0 w-20 h-20 bg-cyan-500/10 rounded-full blur-xl" />
                  <div className="relative">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center mb-3">
                      <Zap className="w-5 h-5 text-cyan-400" />
                    </div>
                    <h3 className="text-white font-bold mb-1">Starter Plan</h3>
                    <p className="text-gray-500 text-xs mb-3">Perfect for beginners</p>
                    <div className="space-y-1.5 text-xs mb-4">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Minimum</span>
                        <span className="text-white font-medium">10 USDT</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Daily Profit</span>
                        <span className="text-cyan-400 font-bold">4%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Duration</span>
                        <span className="text-white">30 Days</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Total Return</span>
                        <span className="text-green-400 font-bold">120%</span>
                      </div>
                    </div>
                    <motion.button 
                      whileHover={{ 
                        scale: 1.05, 
                        boxShadow: '0 0 25px rgba(0, 212, 255, 0.6), 0 0 50px rgba(0, 212, 255, 0.3)'
                      }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-600 text-white text-sm font-bold transition-all"
                    >
                      Start Mining
                    </motion.button>
                  </div>
                </motion.div>

                {/* Pro Plan */}
                <motion.div 
                  whileHover={{ 
                    scale: 1.02, 
                    boxShadow: '0 0 30px rgba(138, 43, 226, 0.4), 0 0 60px rgba(138, 43, 226, 0.2)',
                    borderColor: 'rgba(138, 43, 226, 0.8)'
                  }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="bg-gradient-to-br from-slate-900 to-slate-800 border-2 border-purple-500/30 rounded-2xl p-4 relative overflow-hidden cursor-pointer"
                >
                  <div className="absolute top-2 right-2">
                    <span className="px-2 py-0.5 bg-purple-500 text-white text-xs font-bold rounded-full">POPULAR</span>
                  </div>
                  <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full blur-xl" />
                  <div className="relative">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center mb-3">
                      <Crown className="w-5 h-5 text-purple-400" />
                    </div>
                    <h3 className="text-white font-bold mb-1">Pro Plan</h3>
                    <p className="text-gray-500 text-xs mb-3">Maximum returns</p>
                    <div className="space-y-1.5 text-xs mb-4">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Minimum</span>
                        <span className="text-white font-medium">100 USDT</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Daily Profit</span>
                        <span className="text-purple-400 font-bold">4.5%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Duration</span>
                        <span className="text-white">30 Days</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Total Return</span>
                        <span className="text-green-400 font-bold">135%</span>
                      </div>
                    </div>
                    <motion.button 
                      whileHover={{ 
                        scale: 1.05, 
                        boxShadow: '0 0 25px rgba(138, 43, 226, 0.6), 0 0 50px rgba(138, 43, 226, 0.3)'
                      }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 text-white text-sm font-bold transition-all"
                    >
                      Start Mining
                    </motion.button>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            {/* Infrastructure Banner */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="relative rounded-2xl overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900" />
              <div className="absolute inset-0 opacity-20">
                <div className="absolute inset-0" style={{ background: 'repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(0,212,255,0.1) 2px, rgba(0,212,255,0.1) 4px)' }} />
              </div>
              <div className="relative p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
                    <Server className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold">State-of-the-Art Mining Infrastructure</h3>
                    <p className="text-gray-400 text-xs">Powered by latest ASIC technology</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-slate-800/50 rounded-xl p-2 text-center">
                    <div className="text-green-400 font-bold text-sm">99.9%</div>
                    <div className="text-gray-500 text-xs">Uptime</div>
                  </div>
                  <div className="bg-slate-800/50 rounded-xl p-2 text-center">
                    <div className="text-cyan-400 font-bold text-sm">24/7</div>
                    <div className="text-gray-500 text-xs">Operation</div>
                  </div>
                  <div className="bg-slate-800/50 rounded-xl p-2 text-center">
                    <div className="text-purple-400 font-bold text-sm">Auto</div>
                    <div className="text-gray-500 text-xs">Payouts</div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* LIVE MINING POWER */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-r from-slate-900 to-slate-800 border border-white/10 rounded-2xl p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-gray-400 text-xs font-medium uppercase tracking-wider">LIVE MINING POWER</span>
                </div>
              </div>
              <div className="mt-2">
                <span className="text-3xl font-bold" style={{ color: '#00d4ff' }}>{liveHashrate.toFixed(2)} TH/s</span>
              </div>
              <p className="text-gray-500 text-xs mt-1">Global Hashrate • Real-time Network Speed</p>
            </motion.div>

            {/* Platform Statistics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
                    <Activity className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-white font-bold text-lg">Platform Statistics</h2>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-green-400 text-xs font-medium">LIVE DATA</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                {/* Total Deposits - Green - Index 0 */}
                <motion.div 
                  animate={{
                    boxShadow: activePlatformGlow === 0 
                      ? '0 0 40px rgba(16, 185, 129, 0.4), 0 0 80px rgba(16, 185, 129, 0.2), inset 0 0 30px rgba(16, 185, 129, 0.05)'
                      : '0 4px 20px rgba(0, 0, 0, 0.3)',
                    y: activePlatformGlow === 0 ? -4 : 0
                  }}
                  whileHover={{ 
                    scale: 1.02, 
                    y: -6,
                    boxShadow: '0 0 40px rgba(16, 185, 129, 0.5), 0 0 80px rgba(16, 185, 129, 0.2)'
                  }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.4, type: "spring", stiffness: 300 }}
                  className="relative overflow-hidden rounded-2xl cursor-pointer"
                  style={{
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.08) 50%, rgba(6, 78, 59, 0.12) 100%)',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  {/* Animated border */}
                  <div className="absolute inset-0 rounded-2xl pointer-events-none"
                    style={{
                      background: activePlatformGlow === 0 
                        ? 'linear-gradient(90deg, rgba(16, 185, 129, 0.8), rgba(52, 211, 153, 0.4), rgba(16, 185, 129, 0.8))'
                        : 'linear-gradient(90deg, rgba(16, 185, 129, 0.3), rgba(52, 211, 153, 0.1), rgba(16, 185, 129, 0.3))',
                      padding: '1px',
                      WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                      WebkitMaskComposite: 'xor',
                      maskComposite: 'exclude'
                    }}
                  />
                  
                  {/* Shine effect */}
                  <motion.div 
                    className="absolute top-0 left-0 w-full h-full pointer-events-none"
                    animate={{
                      background: activePlatformGlow === 0 
                        ? 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.1) 45%, transparent 50%)'
                        : 'transparent',
                      x: activePlatformGlow === 0 ? ['-100%', '200%'] : '0%'
                    }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                  />
                  
                  <div className="relative p-4">
                    {/* Header with icon */}
                    <div className="flex items-center justify-between mb-3">
                      <motion.div 
                        animate={{ scale: activePlatformGlow === 0 ? [1, 1.1, 1] : 1 }}
                        transition={{ duration: 0.5 }}
                        className="w-12 h-12 rounded-xl flex items-center justify-center relative"
                        style={{
                          background: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
                          boxShadow: activePlatformGlow === 0 ? '0 0 20px rgba(16, 185, 129, 0.5)' : 'none'
                        }}
                      >
                        <ArrowDownRight className="w-6 h-6 text-white" />
                        <div className="absolute inset-0 rounded-xl" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 50%)' }} />
                      </motion.div>
                      <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
                        style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#34d399' }}>
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        DEPOSITS
                      </div>
                    </div>
                    
                    {/* Value */}
                    <div className="mb-1">
                      <span className="text-3xl font-black text-transparent bg-clip-text"
                        style={{ backgroundImage: 'linear-gradient(135deg, #34d399 0%, #10b981 50%, #059669 100%)' }}>
                        $<AnimatedCounter end={4589620} prefix="" decimals={0} />
                      </span>
                    </div>
                    
                    {/* Label */}
                    <div className="text-gray-400 text-sm font-medium mb-2">Total Deposits</div>
                    
                    {/* Progress bar */}
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(16, 185, 129, 0.15)' }}>
                      <motion.div 
                        className="h-full rounded-full"
                        style={{ background: 'linear-gradient(90deg, #10b981, #34d399)' }}
                        initial={{ width: 0 }}
                        animate={{ width: activePlatformGlow === 0 ? '100%' : '85%' }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                </motion.div>

                {/* Total Withdrawals - Red - Index 1 */}
                <motion.div 
                  animate={{
                    boxShadow: activePlatformGlow === 1 
                      ? '0 0 40px rgba(239, 68, 68, 0.4), 0 0 80px rgba(239, 68, 68, 0.2), inset 0 0 30px rgba(239, 68, 68, 0.05)'
                      : '0 4px 20px rgba(0, 0, 0, 0.3)',
                    y: activePlatformGlow === 1 ? -4 : 0
                  }}
                  whileHover={{ 
                    scale: 1.02, 
                    y: -6,
                    boxShadow: '0 0 40px rgba(239, 68, 68, 0.5), 0 0 80px rgba(239, 68, 68, 0.2)'
                  }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.4, type: "spring", stiffness: 300 }}
                  className="relative overflow-hidden rounded-2xl cursor-pointer"
                  style={{
                    background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.08) 50%, rgba(185, 28, 28, 0.12) 100%)',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  <div className="absolute inset-0 rounded-2xl pointer-events-none"
                    style={{
                      background: activePlatformGlow === 1 
                        ? 'linear-gradient(90deg, rgba(239, 68, 68, 0.8), rgba(248, 113, 113, 0.4), rgba(239, 68, 68, 0.8))'
                        : 'linear-gradient(90deg, rgba(239, 68, 68, 0.3), rgba(248, 113, 113, 0.1), rgba(239, 68, 68, 0.3))',
                      padding: '1px',
                      WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                      WebkitMaskComposite: 'xor',
                      maskComposite: 'exclude'
                    }}
                  />
                  <motion.div 
                    className="absolute top-0 left-0 w-full h-full pointer-events-none"
                    animate={{
                      background: activePlatformGlow === 1 
                        ? 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.1) 45%, transparent 50%)'
                        : 'transparent',
                      x: activePlatformGlow === 1 ? ['-100%', '200%'] : '0%'
                    }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                  />
                  
                  <div className="relative p-4">
                    <div className="flex items-center justify-between mb-3">
                      <motion.div 
                        animate={{ scale: activePlatformGlow === 1 ? [1, 1.1, 1] : 1 }}
                        transition={{ duration: 0.5 }}
                        className="w-12 h-12 rounded-xl flex items-center justify-center relative"
                        style={{
                          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #b91c1c 100%)',
                          boxShadow: activePlatformGlow === 1 ? '0 0 20px rgba(239, 68, 68, 0.5)' : 'none'
                        }}
                      >
                        <ArrowUpRight className="w-6 h-6 text-white" />
                        <div className="absolute inset-0 rounded-xl" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 50%)' }} />
                      </motion.div>
                      <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
                        style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#f87171' }}>
                        <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                        WITHDRAWALS
                      </div>
                    </div>
                    <div className="mb-1">
                      <span className="text-3xl font-black text-transparent bg-clip-text"
                        style={{ backgroundImage: 'linear-gradient(135deg, #f87171 0%, #ef4444 50%, #dc2626 100%)' }}>
                        $<AnimatedCounter end={2824530} prefix="" decimals={0} />
                      </span>
                    </div>
                    <div className="text-gray-400 text-sm font-medium mb-2">Total Withdrawals</div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(239, 68, 68, 0.15)' }}>
                      <motion.div 
                        className="h-full rounded-full"
                        style={{ background: 'linear-gradient(90deg, #ef4444, #f87171)' }}
                        initial={{ width: 0 }}
                        animate={{ width: activePlatformGlow === 1 ? '100%' : '75%' }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                </motion.div>

                {/* Active Miners - Blue - Index 2 */}
                <motion.div 
                  animate={{
                    boxShadow: activePlatformGlow === 2 
                      ? '0 0 40px rgba(59, 130, 246, 0.4), 0 0 80px rgba(59, 130, 246, 0.2), inset 0 0 30px rgba(59, 130, 246, 0.05)'
                      : '0 4px 20px rgba(0, 0, 0, 0.3)',
                    y: activePlatformGlow === 2 ? -4 : 0
                  }}
                  whileHover={{ 
                    scale: 1.02, 
                    y: -6,
                    boxShadow: '0 0 40px rgba(59, 130, 246, 0.5), 0 0 80px rgba(59, 130, 246, 0.2)'
                  }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.4, type: "spring", stiffness: 300 }}
                  className="relative overflow-hidden rounded-2xl cursor-pointer"
                  style={{
                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(37, 99, 235, 0.08) 50%, rgba(30, 64, 175, 0.12) 100%)',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  <div className="absolute inset-0 rounded-2xl pointer-events-none"
                    style={{
                      background: activePlatformGlow === 2 
                        ? 'linear-gradient(90deg, rgba(59, 130, 246, 0.8), rgba(96, 165, 250, 0.4), rgba(59, 130, 246, 0.8))'
                        : 'linear-gradient(90deg, rgba(59, 130, 246, 0.3), rgba(96, 165, 250, 0.1), rgba(59, 130, 246, 0.3))',
                      padding: '1px',
                      WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                      WebkitMaskComposite: 'xor',
                      maskComposite: 'exclude'
                    }}
                  />
                  <motion.div 
                    className="absolute top-0 left-0 w-full h-full pointer-events-none"
                    animate={{
                      background: activePlatformGlow === 2 
                        ? 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.1) 45%, transparent 50%)'
                        : 'transparent',
                      x: activePlatformGlow === 2 ? ['-100%', '200%'] : '0%'
                    }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                  />
                  
                  <div className="relative p-4">
                    <div className="flex items-center justify-between mb-3">
                      <motion.div 
                        animate={{ scale: activePlatformGlow === 2 ? [1, 1.1, 1] : 1 }}
                        transition={{ duration: 0.5 }}
                        className="w-12 h-12 rounded-xl flex items-center justify-center relative"
                        style={{
                          background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #1d4ed8 100%)',
                          boxShadow: activePlatformGlow === 2 ? '0 0 20px rgba(59, 130, 246, 0.5)' : 'none'
                        }}
                      >
                        <Users className="w-6 h-6 text-white" />
                        <div className="absolute inset-0 rounded-xl" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 50%)' }} />
                      </motion.div>
                      <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
                        style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa' }}>
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                        MINERS
                      </div>
                    </div>
                    <div className="mb-1">
                      <span className="text-3xl font-black text-transparent bg-clip-text"
                        style={{ backgroundImage: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 50%, #2563eb 100%)' }}>
                        <AnimatedCounter end={35847} prefix="" decimals={0} />
                      </span>
                    </div>
                    <div className="text-gray-400 text-sm font-medium mb-2">Active Miners</div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(59, 130, 246, 0.15)' }}>
                      <motion.div 
                        className="h-full rounded-full"
                        style={{ background: 'linear-gradient(90deg, #3b82f6, #60a5fa)' }}
                        initial={{ width: 0 }}
                        animate={{ width: activePlatformGlow === 2 ? '100%' : '70%' }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                </motion.div>

                {/* Profit Paid - Purple - Index 3 */}
                <motion.div 
                  animate={{
                    boxShadow: activePlatformGlow === 3 
                      ? '0 0 40px rgba(139, 92, 246, 0.4), 0 0 80px rgba(139, 92, 246, 0.2), inset 0 0 30px rgba(139, 92, 246, 0.05)'
                      : '0 4px 20px rgba(0, 0, 0, 0.3)',
                    y: activePlatformGlow === 3 ? -4 : 0
                  }}
                  whileHover={{ 
                    scale: 1.02, 
                    y: -6,
                    boxShadow: '0 0 40px rgba(139, 92, 246, 0.5), 0 0 80px rgba(139, 92, 246, 0.2)'
                  }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.4, type: "spring", stiffness: 300 }}
                  className="relative overflow-hidden rounded-2xl cursor-pointer"
                  style={{
                    background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(124, 58, 237, 0.08) 50%, rgba(109, 40, 217, 0.12) 100%)',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  <div className="absolute inset-0 rounded-2xl pointer-events-none"
                    style={{
                      background: activePlatformGlow === 3 
                        ? 'linear-gradient(90deg, rgba(139, 92, 246, 0.8), rgba(167, 139, 250, 0.4), rgba(139, 92, 246, 0.8))'
                        : 'linear-gradient(90deg, rgba(139, 92, 246, 0.3), rgba(167, 139, 250, 0.1), rgba(139, 92, 246, 0.3))',
                      padding: '1px',
                      WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                      WebkitMaskComposite: 'xor',
                      maskComposite: 'exclude'
                    }}
                  />
                  <motion.div 
                    className="absolute top-0 left-0 w-full h-full pointer-events-none"
                    animate={{
                      background: activePlatformGlow === 3 
                        ? 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.1) 45%, transparent 50%)'
                        : 'transparent',
                      x: activePlatformGlow === 3 ? ['-100%', '200%'] : '0%'
                    }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                  />
                  
                  <div className="relative p-4">
                    <div className="flex items-center justify-between mb-3">
                      <motion.div 
                        animate={{ scale: activePlatformGlow === 3 ? [1, 1.1, 1] : 1 }}
                        transition={{ duration: 0.5 }}
                        className="w-12 h-12 rounded-xl flex items-center justify-center relative"
                        style={{
                          background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 50%, #6d28d9 100%)',
                          boxShadow: activePlatformGlow === 3 ? '0 0 20px rgba(139, 92, 246, 0.5)' : 'none'
                        }}
                      >
                        <TrendingUp className="w-6 h-6 text-white" />
                        <div className="absolute inset-0 rounded-xl" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 50%)' }} />
                      </motion.div>
                      <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
                        style={{ background: 'rgba(139, 92, 246, 0.2)', color: '#a78bfa' }}>
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                        PROFIT
                      </div>
                    </div>
                    <div className="mb-1">
                      <span className="text-3xl font-black text-transparent bg-clip-text"
                        style={{ backgroundImage: 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 50%, #7c3aed 100%)' }}>
                        $<AnimatedCounter end={1654280} prefix="" decimals={0} />
                      </span>
                    </div>
                    <div className="text-gray-400 text-sm font-medium mb-2">Profit Paid</div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(139, 92, 246, 0.15)' }}>
                      <motion.div 
                        className="h-full rounded-full"
                        style={{ background: 'linear-gradient(90deg, #8b5cf6, #a78bfa)' }}
                        initial={{ width: 0 }}
                        animate={{ width: activePlatformGlow === 3 ? '100%' : '65%' }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                </motion.div>

                {/* Online Users - Yellow/Gold - Index 4 */}
                <motion.div 
                  animate={{
                    boxShadow: activePlatformGlow === 4 
                      ? '0 0 40px rgba(245, 158, 11, 0.4), 0 0 80px rgba(245, 158, 11, 0.2), inset 0 0 30px rgba(245, 158, 11, 0.05)'
                      : '0 4px 20px rgba(0, 0, 0, 0.3)',
                    y: activePlatformGlow === 4 ? -4 : 0
                  }}
                  whileHover={{ 
                    scale: 1.02, 
                    y: -6,
                    boxShadow: '0 0 40px rgba(245, 158, 11, 0.5), 0 0 80px rgba(245, 158, 11, 0.2)'
                  }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.4, type: "spring", stiffness: 300 }}
                  className="relative overflow-hidden rounded-2xl cursor-pointer"
                  style={{
                    background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(217, 119, 6, 0.08) 50%, rgba(180, 83, 9, 0.12) 100%)',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  <div className="absolute inset-0 rounded-2xl pointer-events-none"
                    style={{
                      background: activePlatformGlow === 4 
                        ? 'linear-gradient(90deg, rgba(245, 158, 11, 0.8), rgba(251, 191, 36, 0.4), rgba(245, 158, 11, 0.8))'
                        : 'linear-gradient(90deg, rgba(245, 158, 11, 0.3), rgba(251, 191, 36, 0.1), rgba(245, 158, 11, 0.3))',
                      padding: '1px',
                      WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                      WebkitMaskComposite: 'xor',
                      maskComposite: 'exclude'
                    }}
                  />
                  <motion.div 
                    className="absolute top-0 left-0 w-full h-full pointer-events-none"
                    animate={{
                      background: activePlatformGlow === 4 
                        ? 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.1) 45%, transparent 50%)'
                        : 'transparent',
                      x: activePlatformGlow === 4 ? ['-100%', '200%'] : '0%'
                    }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                  />
                  
                  <div className="relative p-4">
                    <div className="flex items-center justify-between mb-3">
                      <motion.div 
                        animate={{ scale: activePlatformGlow === 4 ? [1, 1.1, 1] : 1 }}
                        transition={{ duration: 0.5 }}
                        className="w-12 h-12 rounded-xl flex items-center justify-center relative"
                        style={{
                          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%)',
                          boxShadow: activePlatformGlow === 4 ? '0 0 20px rgba(245, 158, 11, 0.5)' : 'none'
                        }}
                      >
                        <Activity className="w-6 h-6 text-white" />
                        <div className="absolute inset-0 rounded-xl" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 50%)' }} />
                      </motion.div>
                      <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
                        style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24' }}>
                        <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
                        ONLINE
                      </div>
                    </div>
                    <div className="mb-1">
                      <span className="text-3xl font-black text-transparent bg-clip-text"
                        style={{ backgroundImage: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)' }}>
                        <AnimatedCounter end={onlineVisitors} prefix="" decimals={0} />
                      </span>
                    </div>
                    <div className="text-gray-400 text-sm font-medium mb-2">Online Users</div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(245, 158, 11, 0.15)' }}>
                      <motion.div 
                        className="h-full rounded-full"
                        style={{ background: 'linear-gradient(90deg, #f59e0b, #fbbf24)' }}
                        initial={{ width: 0 }}
                        animate={{ width: activePlatformGlow === 4 ? '100%' : '80%' }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                </motion.div>

                {/* Visitors Today - Cyan - Index 5 */}
                <motion.div 
                  animate={{
                    boxShadow: activePlatformGlow === 5 
                      ? '0 0 40px rgba(0, 212, 255, 0.4), 0 0 80px rgba(0, 212, 255, 0.2), inset 0 0 30px rgba(0, 212, 255, 0.05)'
                      : '0 4px 20px rgba(0, 0, 0, 0.3)',
                    y: activePlatformGlow === 5 ? -4 : 0
                  }}
                  whileHover={{ 
                    scale: 1.02, 
                    y: -6,
                    boxShadow: '0 0 40px rgba(0, 212, 255, 0.5), 0 0 80px rgba(0, 212, 255, 0.2)'
                  }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.4, type: "spring", stiffness: 300 }}
                  className="relative overflow-hidden rounded-2xl cursor-pointer"
                  style={{
                    background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.15) 0%, rgba(14, 165, 233, 0.08) 50%, rgba(2, 132, 199, 0.12) 100%)',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  <div className="absolute inset-0 rounded-2xl pointer-events-none"
                    style={{
                      background: activePlatformGlow === 5 
                        ? 'linear-gradient(90deg, rgba(0, 212, 255, 0.8), rgba(34, 211, 238, 0.4), rgba(0, 212, 255, 0.8))'
                        : 'linear-gradient(90deg, rgba(0, 212, 255, 0.3), rgba(34, 211, 238, 0.1), rgba(0, 212, 255, 0.3))',
                      padding: '1px',
                      WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                      WebkitMaskComposite: 'xor',
                      maskComposite: 'exclude'
                    }}
                  />
                  <motion.div 
                    className="absolute top-0 left-0 w-full h-full pointer-events-none"
                    animate={{
                      background: activePlatformGlow === 5 
                        ? 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.1) 45%, transparent 50%)'
                        : 'transparent',
                      x: activePlatformGlow === 5 ? ['-100%', '200%'] : '0%'
                    }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                  />
                  
                  <div className="relative p-4">
                    <div className="flex items-center justify-between mb-3">
                      <motion.div 
                        animate={{ scale: activePlatformGlow === 5 ? [1, 1.1, 1] : 1 }}
                        transition={{ duration: 0.5 }}
                        className="w-12 h-12 rounded-xl flex items-center justify-center relative"
                        style={{
                          background: 'linear-gradient(135deg, #00d4ff 0%, #0ea5e9 50%, #0284c7 100%)',
                          boxShadow: activePlatformGlow === 5 ? '0 0 20px rgba(0, 212, 255, 0.5)' : 'none'
                        }}
                      >
                        <Cpu className="w-6 h-6 text-white" />
                        <div className="absolute inset-0 rounded-xl" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 50%)' }} />
                      </motion.div>
                      <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
                        style={{ background: 'rgba(0, 212, 255, 0.2)', color: '#22d3ee' }}>
                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                        VISITORS
                      </div>
                    </div>
                    <div className="mb-1">
                      <span className="text-3xl font-black text-transparent bg-clip-text"
                        style={{ backgroundImage: 'linear-gradient(135deg, #22d3ee 0%, #00d4ff 50%, #0ea5e9 100%)' }}>
                        <AnimatedCounter end={8452} prefix="" decimals={0} />
                      </span>
                    </div>
                    <div className="text-gray-400 text-sm font-medium mb-2">Visitors Today</div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(0, 212, 255, 0.15)' }}>
                      <motion.div 
                        className="h-full rounded-full"
                        style={{ background: 'linear-gradient(90deg, #00d4ff, #22d3ee)' }}
                        initial={{ width: 0 }}
                        animate={{ width: activePlatformGlow === 5 ? '100%' : '60%' }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            {/* Today Statistics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-white font-bold text-lg">Today Statistics</h2>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-green-400 text-xs font-medium">24H DATA</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                {/* Today Deposits - Green - Index 0 */}
                <motion.div 
                  animate={{
                    boxShadow: activeTodayGlow === 0 
                      ? '0 0 35px rgba(16, 185, 129, 0.35), 0 0 70px rgba(16, 185, 129, 0.15)'
                      : '0 4px 15px rgba(0, 0, 0, 0.25)',
                    y: activeTodayGlow === 0 ? -3 : 0
                  }}
                  whileHover={{ 
                    scale: 1.02, 
                    y: -5,
                    boxShadow: '0 0 35px rgba(16, 185, 129, 0.4), 0 0 70px rgba(16, 185, 129, 0.2)'
                  }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.4, type: "spring", stiffness: 300 }}
                  className="relative overflow-hidden rounded-2xl cursor-pointer"
                  style={{
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(5, 150, 105, 0.06) 50%, rgba(6, 78, 59, 0.1) 100%)',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  <div className="absolute inset-0 rounded-2xl pointer-events-none"
                    style={{
                      background: activeTodayGlow === 0 
                        ? 'linear-gradient(90deg, rgba(16, 185, 129, 0.6), rgba(52, 211, 153, 0.3), rgba(16, 185, 129, 0.6))'
                        : 'linear-gradient(90deg, rgba(16, 185, 129, 0.2), rgba(52, 211, 153, 0.08), rgba(16, 185, 129, 0.2))',
                      padding: '1px',
                      WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                      WebkitMaskComposite: 'xor',
                      maskComposite: 'exclude'
                    }}
                  />
                  <motion.div 
                    className="absolute top-0 left-0 w-full h-full pointer-events-none"
                    animate={{
                      background: activeTodayGlow === 0 
                        ? 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.08) 45%, transparent 50%)'
                        : 'transparent',
                      x: activeTodayGlow === 0 ? ['-100%', '200%'] : '0%'
                    }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                  />
                  
                  <div className="relative p-4">
                    <div className="flex items-center justify-between mb-2">
                      <motion.div 
                        animate={{ scale: activeTodayGlow === 0 ? [1, 1.08, 1] : 1 }}
                        transition={{ duration: 0.5 }}
                        className="w-10 h-10 rounded-xl flex items-center justify-center relative"
                        style={{
                          background: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
                          boxShadow: activeTodayGlow === 0 ? '0 0 15px rgba(16, 185, 129, 0.4)' : 'none'
                        }}
                      >
                        <ArrowDownRight className="w-5 h-5 text-white" />
                      </motion.div>
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
                        <div className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                        DEPOSITS
                      </div>
                    </div>
                    <div className="mb-0.5">
                      <span className="text-2xl font-black text-transparent bg-clip-text"
                        style={{ backgroundImage: 'linear-gradient(135deg, #34d399 0%, #10b981 50%, #059669 100%)' }}>
                        $<AnimatedCounter end={42580} prefix="" decimals={0} />
                      </span>
                    </div>
                    <div className="text-gray-400 text-xs font-medium">Today Deposits</div>
                  </div>
                </motion.div>

                {/* Today Withdrawals - Red - Index 1 */}
                <motion.div 
                  animate={{
                    boxShadow: activeTodayGlow === 1 
                      ? '0 0 35px rgba(239, 68, 68, 0.35), 0 0 70px rgba(239, 68, 68, 0.15)'
                      : '0 4px 15px rgba(0, 0, 0, 0.25)',
                    y: activeTodayGlow === 1 ? -3 : 0
                  }}
                  whileHover={{ 
                    scale: 1.02, 
                    y: -5,
                    boxShadow: '0 0 35px rgba(239, 68, 68, 0.4), 0 0 70px rgba(239, 68, 68, 0.2)'
                  }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.4, type: "spring", stiffness: 300 }}
                  className="relative overflow-hidden rounded-2xl cursor-pointer"
                  style={{
                    background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, rgba(220, 38, 38, 0.06) 50%, rgba(185, 28, 28, 0.1) 100%)',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  <div className="absolute inset-0 rounded-2xl pointer-events-none"
                    style={{
                      background: activeTodayGlow === 1 
                        ? 'linear-gradient(90deg, rgba(239, 68, 68, 0.6), rgba(248, 113, 113, 0.3), rgba(239, 68, 68, 0.6))'
                        : 'linear-gradient(90deg, rgba(239, 68, 68, 0.2), rgba(248, 113, 113, 0.08), rgba(239, 68, 68, 0.2))',
                      padding: '1px',
                      WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                      WebkitMaskComposite: 'xor',
                      maskComposite: 'exclude'
                    }}
                  />
                  <motion.div 
                    className="absolute top-0 left-0 w-full h-full pointer-events-none"
                    animate={{
                      background: activeTodayGlow === 1 
                        ? 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.08) 45%, transparent 50%)'
                        : 'transparent',
                      x: activeTodayGlow === 1 ? ['-100%', '200%'] : '0%'
                    }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                  />
                  
                  <div className="relative p-4">
                    <div className="flex items-center justify-between mb-2">
                      <motion.div 
                        animate={{ scale: activeTodayGlow === 1 ? [1, 1.08, 1] : 1 }}
                        transition={{ duration: 0.5 }}
                        className="w-10 h-10 rounded-xl flex items-center justify-center relative"
                        style={{
                          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #b91c1c 100%)',
                          boxShadow: activeTodayGlow === 1 ? '0 0 15px rgba(239, 68, 68, 0.4)' : 'none'
                        }}
                      >
                        <ArrowUpRight className="w-5 h-5 text-white" />
                      </motion.div>
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171' }}>
                        <div className="w-1 h-1 rounded-full bg-red-400 animate-pulse" />
                        WITHDRAW
                      </div>
                    </div>
                    <div className="mb-0.5">
                      <span className="text-2xl font-black text-transparent bg-clip-text"
                        style={{ backgroundImage: 'linear-gradient(135deg, #f87171 0%, #ef4444 50%, #dc2626 100%)' }}>
                        $<AnimatedCounter end={18200} prefix="" decimals={0} />
                      </span>
                    </div>
                    <div className="text-gray-400 text-xs font-medium">Today Withdrawals</div>
                  </div>
                </motion.div>

                {/* New Users Today - Blue - Index 2 */}
                <motion.div 
                  animate={{
                    boxShadow: activeTodayGlow === 2 
                      ? '0 0 35px rgba(59, 130, 246, 0.35), 0 0 70px rgba(59, 130, 246, 0.15)'
                      : '0 4px 15px rgba(0, 0, 0, 0.25)',
                    y: activeTodayGlow === 2 ? -3 : 0
                  }}
                  whileHover={{ 
                    scale: 1.02, 
                    y: -5,
                    boxShadow: '0 0 35px rgba(59, 130, 246, 0.4), 0 0 70px rgba(59, 130, 246, 0.2)'
                  }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.4, type: "spring", stiffness: 300 }}
                  className="relative overflow-hidden rounded-2xl cursor-pointer"
                  style={{
                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.12) 0%, rgba(37, 99, 235, 0.06) 50%, rgba(30, 64, 175, 0.1) 100%)',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  <div className="absolute inset-0 rounded-2xl pointer-events-none"
                    style={{
                      background: activeTodayGlow === 2 
                        ? 'linear-gradient(90deg, rgba(59, 130, 246, 0.6), rgba(96, 165, 250, 0.3), rgba(59, 130, 246, 0.6))'
                        : 'linear-gradient(90deg, rgba(59, 130, 246, 0.2), rgba(96, 165, 250, 0.08), rgba(59, 130, 246, 0.2))',
                      padding: '1px',
                      WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                      WebkitMaskComposite: 'xor',
                      maskComposite: 'exclude'
                    }}
                  />
                  <motion.div 
                    className="absolute top-0 left-0 w-full h-full pointer-events-none"
                    animate={{
                      background: activeTodayGlow === 2 
                        ? 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.08) 45%, transparent 50%)'
                        : 'transparent',
                      x: activeTodayGlow === 2 ? ['-100%', '200%'] : '0%'
                    }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                  />
                  
                  <div className="relative p-4">
                    <div className="flex items-center justify-between mb-2">
                      <motion.div 
                        animate={{ scale: activeTodayGlow === 2 ? [1, 1.08, 1] : 1 }}
                        transition={{ duration: 0.5 }}
                        className="w-10 h-10 rounded-xl flex items-center justify-center relative"
                        style={{
                          background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #1d4ed8 100%)',
                          boxShadow: activeTodayGlow === 2 ? '0 0 15px rgba(59, 130, 246, 0.4)' : 'none'
                        }}
                      >
                        <Users className="w-5 h-5 text-white" />
                      </motion.div>
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' }}>
                        <div className="w-1 h-1 rounded-full bg-blue-400 animate-pulse" />
                        USERS
                      </div>
                    </div>
                    <div className="mb-0.5">
                      <span className="text-2xl font-black text-transparent bg-clip-text"
                        style={{ backgroundImage: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 50%, #2563eb 100%)' }}>
                        <AnimatedCounter end={134} prefix="" decimals={0} />
                      </span>
                    </div>
                    <div className="text-gray-400 text-xs font-medium">New Users Today</div>
                  </div>
                </motion.div>

                {/* Today Profit - Yellow - Index 3 */}
                <motion.div 
                  animate={{
                    boxShadow: activeTodayGlow === 3 
                      ? '0 0 35px rgba(245, 158, 11, 0.35), 0 0 70px rgba(245, 158, 11, 0.15)'
                      : '0 4px 15px rgba(0, 0, 0, 0.25)',
                    y: activeTodayGlow === 3 ? -3 : 0
                  }}
                  whileHover={{ 
                    scale: 1.02, 
                    y: -5,
                    boxShadow: '0 0 35px rgba(245, 158, 11, 0.4), 0 0 70px rgba(245, 158, 11, 0.2)'
                  }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.4, type: "spring", stiffness: 300 }}
                  className="relative overflow-hidden rounded-2xl cursor-pointer"
                  style={{
                    background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(217, 119, 6, 0.06) 50%, rgba(180, 83, 9, 0.1) 100%)',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  <div className="absolute inset-0 rounded-2xl pointer-events-none"
                    style={{
                      background: activeTodayGlow === 3 
                        ? 'linear-gradient(90deg, rgba(245, 158, 11, 0.6), rgba(251, 191, 36, 0.3), rgba(245, 158, 11, 0.6))'
                        : 'linear-gradient(90deg, rgba(245, 158, 11, 0.2), rgba(251, 191, 36, 0.08), rgba(245, 158, 11, 0.2))',
                      padding: '1px',
                      WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                      WebkitMaskComposite: 'xor',
                      maskComposite: 'exclude'
                    }}
                  />
                  <motion.div 
                    className="absolute top-0 left-0 w-full h-full pointer-events-none"
                    animate={{
                      background: activeTodayGlow === 3 
                        ? 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.08) 45%, transparent 50%)'
                        : 'transparent',
                      x: activeTodayGlow === 3 ? ['-100%', '200%'] : '0%'
                    }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                  />
                  
                  <div className="relative p-4">
                    <div className="flex items-center justify-between mb-2">
                      <motion.div 
                        animate={{ scale: activeTodayGlow === 3 ? [1, 1.08, 1] : 1 }}
                        transition={{ duration: 0.5 }}
                        className="w-10 h-10 rounded-xl flex items-center justify-center relative"
                        style={{
                          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%)',
                          boxShadow: activeTodayGlow === 3 ? '0 0 15px rgba(245, 158, 11, 0.4)' : 'none'
                        }}
                      >
                        <TrendingUp className="w-5 h-5 text-white" />
                      </motion.div>
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
                        <div className="w-1 h-1 rounded-full bg-yellow-400 animate-pulse" />
                        PROFIT
                      </div>
                    </div>
                    <div className="mb-0.5">
                      <span className="text-2xl font-black text-transparent bg-clip-text"
                        style={{ backgroundImage: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)' }}>
                        $<AnimatedCounter end={7820} prefix="" decimals={0} />
                      </span>
                    </div>
                    <div className="text-gray-400 text-xs font-medium">Today Profit</div>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            {/* Login/Register Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-gradient-to-br from-slate-900 to-slate-800 border border-white/10 rounded-2xl p-4"
            >
              {/* Tab Switcher */}
              <div className="flex bg-slate-800/80 rounded-xl p-1 mb-4">
                <motion.button
                  onClick={() => setAuthMode('login')}
                  whileHover={{ 
                    scale: authMode !== 'login' ? 1.02 : 1,
                    boxShadow: authMode === 'login' ? '0 0 20px rgba(34, 197, 94, 0.5)' : 'none'
                  }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                    authMode === 'login' ? 'bg-green-500 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Login
                </motion.button>
                <motion.button
                  onClick={() => setAuthMode('register')}
                  whileHover={{ 
                    scale: authMode !== 'register' ? 1.02 : 1,
                    boxShadow: authMode === 'register' ? '0 0 20px rgba(139, 92, 246, 0.5)' : 'none'
                  }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                    authMode === 'register' ? 'bg-purple-500 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Create Account
                </motion.button>
              </div>

              {/* Form */}
              <form onSubmit={authMode === 'login' ? handleLogin : handleRegister} className="space-y-3">
                {/* Wallet Address */}
                <div>
                  <label className="text-gray-400 text-xs mb-1 block">USDT BEP20 Wallet Address</label>
                  <div className="relative">
                    <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <Input
                      placeholder="0x..."
                      value={walletInput}
                      onChange={(e) => setWalletInput(e.target.value)}
                      className="bg-slate-800 border-white/10 text-white placeholder:text-gray-600 h-11 pl-10 rounded-xl text-sm"
                    />
                  </div>
                </div>

                {/* PIN Code */}
                <div>
                  <label className="text-gray-400 text-xs mb-1 block">6 Digit PIN Code</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <Input
                      type={showPinVisibility ? "text" : "password"}
                      maxLength={6}
                      placeholder="••••••"
                      value={pinInput}
                      onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
                      className="bg-slate-800 border-white/10 text-white placeholder:text-gray-600 h-11 pl-10 pr-10 rounded-xl text-center text-lg tracking-widest"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPinVisibility(!showPinVisibility)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-cyan-400"
                    >
                      {showPinVisibility ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Referral Code (Register Only) */}
                {authMode === 'register' && (
                  <div>
                    <label className="text-gray-400 text-xs mb-1 block">Referral Code (Optional)</label>
                    <Input
                      placeholder="Enter referral code"
                      value={referralInput}
                      onChange={(e) => setReferralInput(e.target.value.toUpperCase())}
                      className="bg-slate-800 border-white/10 text-white placeholder:text-gray-600 h-11 rounded-xl text-sm"
                    />
                  </div>
                )}

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={isLoading}
                  whileHover={{ 
                    scale: 1.02, 
                    boxShadow: authMode === 'login' 
                      ? '0 0 25px rgba(34, 197, 94, 0.6), 0 0 50px rgba(34, 197, 94, 0.3)' 
                      : '0 0 25px rgba(139, 92, 246, 0.6), 0 0 50px rgba(139, 92, 246, 0.3)'
                  }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full h-11 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all"
                  style={{ background: authMode === 'login' ? 'linear-gradient(to right, #22c55e, #16a34a)' : 'linear-gradient(to right, #8b5cf6, #7c3aed)' }}
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      {authMode === 'login' ? 'Login' : 'Create Account'}
                    </>
                  )}
                </motion.button>
              </form>

              {/* Network Info */}
              <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                <span>USDT Network: BEP20</span>
                <span>Minimum Deposit: 10 USDT</span>
              </div>
            </motion.div>

            {/* Recent Withdrawals */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <h2 className="text-white font-bold text-base">Recent Withdrawals</h2>
                <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs font-medium rounded-full">Live</span>
              </div>
              <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-3 space-y-2">
                {recentWithdrawals.map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-slate-800/50 rounded-xl">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                        <ArrowUpRight className="w-4 h-4 text-purple-400" />
                      </div>
                      <div>
                        <span className="text-white text-sm font-medium">{item.user}</span>
                        <span className="text-gray-500 text-xs ml-2">{item.time}</span>
                      </div>
                    </div>
                    <span className="text-purple-400 font-bold text-sm">+{item.amount} USDT</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Referral Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-2xl p-4"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                  <Gift className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold">Earn 7% Referral Commission</h3>
                  <p className="text-gray-400 text-xs">Invite friends and earn on every deposit!</p>
                </div>
              </div>
              <motion.button 
                whileHover={{ 
                  scale: 1.03, 
                  boxShadow: '0 0 25px rgba(168, 85, 247, 0.6), 0 0 50px rgba(236, 72, 153, 0.3)'
                }}
                whileTap={{ scale: 0.97 }}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold text-sm transition-all"
              >
                Get Started
              </motion.button>
            </motion.div>

            {/* Why Trust Us */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <h2 className="text-white font-bold text-base mb-3">Why Trust Us</h2>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { icon: Shield, label: 'Secure', color: 'from-cyan-500 to-blue-600', glow: 'rgba(0, 212, 255, 0.4)' },
                  { icon: Zap, label: 'Smart Contract', color: 'from-purple-500 to-violet-600', glow: 'rgba(139, 92, 246, 0.4)' },
                  { icon: Clock, label: '24/7 Support', color: 'from-orange-500 to-amber-600', glow: 'rgba(249, 115, 22, 0.4)' },
                  { icon: TrendingUp, label: 'Daily Profits', color: 'from-green-500 to-emerald-600', glow: 'rgba(34, 197, 94, 0.4)' },
                ].map((item) => (
                  <motion.div 
                    key={item.label} 
                    whileHover={{ 
                      scale: 1.08, 
                      boxShadow: `0 0 20px ${item.glow}, 0 0 40px ${item.glow.replace('0.4', '0.2')}`,
                      borderColor: item.glow.replace('0.4', '0.8')
                    }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-slate-900/80 border-2 border-white/10 rounded-xl p-3 text-center cursor-pointer transition-all"
                  >
                    <div className={`w-10 h-10 mx-auto rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-2`}>
                      <item.icon className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-gray-400 text-xs">{item.label}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* FAQ Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
            >
              <h2 className="text-white font-bold text-base mb-3">Frequently Asked Questions</h2>
              <div className="space-y-2">
                {faqs.map((faq, i) => (
                  <div key={i} className="bg-slate-900/80 border border-white/10 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="w-full flex items-center justify-between p-3 text-left"
                    >
                      <span className="text-white text-sm font-medium flex items-center gap-2">
                        <HelpCircle className="w-4 h-4 text-cyan-400" />
                        {faq.q}
                      </span>
                      <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${openFaq === i ? 'rotate-90' : ''}`} />
                    </button>
                    {openFaq === i && (
                      <div className="px-3 pb-3 text-gray-400 text-xs">
                        {faq.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>

          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-white/5 py-4 bg-black">
          <div className="max-w-lg mx-auto px-4 text-center">
            <div className="flex items-center justify-center gap-4 text-gray-500 text-xs mb-3">
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <span>|</span>
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <span>|</span>
              <a href="#" className="hover:text-white transition-colors">Support</a>
              <span>|</span>
              <a href="#" className="hover:text-white transition-colors">Telegram</a>
            </div>
            <div className="flex items-center justify-center gap-3 text-gray-600 text-xs">
              <span className="flex items-center gap-1"><Shield className="w-3 h-3 text-emerald-400" />SSL</span>
              <span className="flex items-center gap-1"><Lock className="w-3 h-3 text-cyan-400" />256-bit</span>
              <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-amber-400" />Verified</span>
            </div>
            <p className="text-gray-600 text-xs mt-2">© 2025 USDT Mining Lab</p>
          </div>
        </footer>
      </div>
    );
  }

  // ==================== DASHBOARD ====================
  return (
    <div className="min-h-screen bg-black flex flex-col relative overflow-hidden">
      {/* Floating Crypto Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute opacity-5"
            initial={{ 
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
              y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800)
            }}
            animate={{
              x: [null, Math.random() * 100 - 50],
              y: [null, Math.random() * 100 - 50],
            }}
            transition={{
              duration: 20 + Math.random() * 20,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'easeInOut'
            }}
          >
            {i % 3 === 0 ? (
              <svg className="w-16 h-16 text-cyan-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H11.1v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.24c.1 1.7 1.36 2.66 2.86 2.97V19h2.13v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.65-3.42z"/>
              </svg>
            ) : i % 3 === 1 ? (
              <svg className="w-12 h-12 text-purple-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            ) : (
              <svg className="w-14 h-14 text-green-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
              </svg>
            )}
          </motion.div>
        ))}
      </div>

      {/* Toast */}
      <AnimatePresence>
        {success && (
          <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -50 }} className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
            <div className="bg-emerald-500/90 backdrop-blur-xl text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              {success}
            </div>
          </motion.div>
        )}
        {error && (
          <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -50 }} className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
            <div className="bg-red-500/90 backdrop-blur-xl text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              {error}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #00d4ff, #8a2be2)' }}>
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H11.1v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.24c.1 1.7 1.36 2.66 2.86 2.97V19h2.13v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.65-3.42z"/>
              </svg>
            </div>
            <span className="font-bold text-base" style={{ background: 'linear-gradient(90deg, #00d4ff, #8a2be2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>USDT Mining Lab</span>
          </div>
          <div className="flex items-center gap-3">
            {user && (
              <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/80 rounded-lg border border-white/10">
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-gray-400 text-xs font-mono">{user.walletAddress.slice(0, 6)}...{user.walletAddress.slice(-4)}</span>
              </div>
            )}
            <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Left Sidebar - Desktop Only */}
        <aside className="hidden lg:flex w-56 flex-col bg-slate-900/50 border-r border-white/5">
          <nav className="flex-1 p-3 space-y-1">
            {[
              { id: 'dashboard', icon: Home, label: 'Dashboard', color: '#00d4ff' },
              { id: 'deposit', icon: ArrowDownRight, label: 'Deposit', color: '#22c55e' },
              { id: 'plans', icon: Zap, label: 'Plans', color: '#f59e0b' },
              { id: 'withdraw', icon: ArrowUpRight, label: 'Withdraw', color: '#ef4444' },
              { id: 'referral', icon: Gift, label: 'Referral', color: '#8b5cf6' },
              { id: 'transactions', icon: Clock, label: 'Transactions', color: '#06b6d4' },
              { id: 'support', icon: MessageCircle, label: 'Support', color: '#ec4899' },
            ].map(item => (
              <motion.button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all relative ${
                  activeTab === item.id 
                    ? 'text-white' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
                style={activeTab === item.id ? {
                  background: `linear-gradient(135deg, ${item.color}20, transparent)`,
                  borderLeft: `3px solid ${item.color}`,
                  boxShadow: `0 0 20px ${item.color}20`
                } : {}}
              >
                <item.icon className="w-4 h-4" style={{ color: activeTab === item.id ? item.color : 'currentColor' }} />
                <span>{item.label}</span>
              </motion.button>
            ))}
          </nav>
          
          {/* User Balance Card */}
          <div className="p-3 border-t border-white/5">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-3 border border-white/10">
              <div className="text-gray-500 text-xs mb-1">Your Balance</div>
              <div className="text-xl font-bold text-white">${formatNumber(user?.balance || 0)}</div>
              <div className="text-green-400 text-xs flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3" />
                +${formatNumber(user?.totalProfit || 0)} profit
              </div>
            </div>
          </div>
          
          <div className="p-3 border-t border-white/5">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 text-sm font-medium border border-red-500/20 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto pb-20 lg:pb-4">
          <div className="max-w-6xl mx-auto p-4 space-y-5">

          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <>
              {/* Real-time Mining Display */}
              {miningData && miningData.status === 'active' ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="relative overflow-hidden rounded-2xl"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 via-slate-900 to-cyan-500/20" />
                  <div className="absolute inset-0" style={{
                    background: 'radial-gradient(circle at 50% 50%, rgba(0, 212, 255, 0.1), transparent 70%)'
                  }} />
                  
                  {/* Animated border */}
                  <div className="absolute inset-0 rounded-2xl" style={{
                    background: 'linear-gradient(90deg, #00d4ff, #8b5cf6, #00d4ff)',
                    backgroundSize: '200% 100%',
                    animation: 'gradientShift 3s linear infinite',
                    padding: '2px',
                    WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                    WebkitMaskComposite: 'xor',
                    maskComposite: 'exclude'
                  }} />
                  
                  <div className="relative p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <motion.div 
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                          className="w-3 h-3 bg-green-400 rounded-full"
                          style={{ boxShadow: '0 0 20px rgba(34, 197, 94, 0.8)' }}
                        />
                        <span className="text-green-400 font-bold text-lg uppercase tracking-wider">Mining Active</span>
                      </div>
                      <div className="px-3 py-1 bg-green-500/20 rounded-full border border-green-500/30">
                        <span className="text-green-400 text-sm font-medium">LIVE</span>
                      </div>
                    </div>
                    
                    {/* Profit Counter */}
                    <div className="text-center mb-6">
                      <div className="text-gray-400 text-sm mb-2">Current Session Profit</div>
                      <motion.div 
                        key={currentProfit}
                        initial={{ scale: 1.05 }}
                        animate={{ scale: 1 }}
                        className="text-5xl md:text-6xl font-bold"
                        style={{ 
                          color: '#00d4ff',
                          textShadow: '0 0 40px rgba(0, 212, 255, 0.5)'
                        }}
                      >
                        ${(miningData.totalEarned + currentProfit).toFixed(6)}
                      </motion.div>
                      <div className="flex items-center justify-center gap-2 mt-2">
                        <span className="text-green-400 text-sm">+${(miningData.dailyProfit / 86400).toFixed(6)}/sec</span>
                      </div>
                    </div>
                    
                    {/* Timer */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-800/50 rounded-xl p-4 border border-white/10">
                        <div className="text-gray-400 text-xs mb-2 uppercase tracking-wider">Elapsed Time</div>
                        <div className="flex gap-2">
                          {[
                            { value: formatTime(miningTimer.elapsed).days, label: 'D' },
                            { value: formatTime(miningTimer.elapsed).hours, label: 'H' },
                            { value: formatTime(miningTimer.elapsed).mins, label: 'M' },
                            { value: formatTime(miningTimer.elapsed).secs, label: 'S' },
                          ].map((t, i) => (
                            <div key={i} className="flex-1 text-center">
                              <div className="text-2xl font-bold text-white">{t.value}</div>
                              <div className="text-gray-500 text-xs">{t.label}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="bg-slate-800/50 rounded-xl p-4 border border-white/10">
                        <div className="text-gray-400 text-xs mb-2 uppercase tracking-wider">Remaining Time</div>
                        <div className="flex gap-2">
                          {[
                            { value: formatTime(miningTimer.remaining).days, label: 'D' },
                            { value: formatTime(miningTimer.remaining).hours, label: 'H' },
                            { value: formatTime(miningTimer.remaining).mins, label: 'M' },
                            { value: formatTime(miningTimer.remaining).secs, label: 'S' },
                          ].map((t, i) => (
                            <div key={i} className="flex-1 text-center">
                              <div className="text-2xl font-bold text-cyan-400">{t.value}</div>
                              <div className="text-gray-500 text-xs">{t.label}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    {/* Mining Stats */}
                    <div className="grid grid-cols-3 gap-3 mt-4">
                      <div className="bg-slate-800/50 rounded-xl p-3 text-center border border-white/10">
                        <div className="text-gray-400 text-xs">Investment</div>
                        <div className="text-lg font-bold text-white">${formatNumber(miningData.investment)}</div>
                      </div>
                      <div className="bg-slate-800/50 rounded-xl p-3 text-center border border-white/10">
                        <div className="text-gray-400 text-xs">Daily Profit</div>
                        <div className="text-lg font-bold text-green-400">${formatNumber(miningData.dailyProfit)}</div>
                      </div>
                      <div className="bg-slate-800/50 rounded-xl p-3 text-center border border-white/10">
                        <div className="text-gray-400 text-xs">Total Earned</div>
                        <div className="text-lg font-bold text-cyan-400">${formatNumber(miningData.totalEarned + currentProfit)}</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                /* Plan Activation Cards */
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="text-center mb-4">
                    <h2 className="text-2xl font-bold text-white mb-2">Activate Your Mining Plan</h2>
                    <p className="text-gray-400">Choose a plan to start earning daily profits</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Starter Plan */}
                    <motion.div
                      whileHover={{ scale: 1.02, y: -4 }}
                      whileTap={{ scale: 0.98 }}
                      className="relative overflow-hidden rounded-2xl cursor-pointer group"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-slate-900 to-slate-900" />
                      <div className="absolute inset-0 border-2 border-cyan-500/30 rounded-2xl group-hover:border-cyan-500/60 transition-colors" />
                      
                      <div className="relative p-5">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                            <Zap className="w-6 h-6 text-cyan-400" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-white">Starter Plan</h3>
                            <p className="text-gray-400 text-sm">Perfect for beginners</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 mb-4">
                          <div className="bg-slate-800/50 rounded-lg p-2 text-center">
                            <div className="text-gray-400 text-xs">Daily Profit</div>
                            <div className="text-cyan-400 font-bold">4%</div>
                          </div>
                          <div className="bg-slate-800/50 rounded-lg p-2 text-center">
                            <div className="text-gray-400 text-xs">Total Return</div>
                            <div className="text-green-400 font-bold">120%</div>
                          </div>
                          <div className="bg-slate-800/50 rounded-lg p-2 text-center">
                            <div className="text-gray-400 text-xs">Duration</div>
                            <div className="text-white font-bold">30 Days</div>
                          </div>
                          <div className="bg-slate-800/50 rounded-lg p-2 text-center">
                            <div className="text-gray-400 text-xs">Minimum</div>
                            <div className="text-white font-bold">10 USDT</div>
                          </div>
                        </div>
                        
                        {((user?.balance || 0) >= 10) ? (
                          <motion.button
                            onClick={() => handleStartMining('starter')}
                            disabled={startMiningLoading !== null}
                            whileHover={{ boxShadow: '0 0 30px rgba(0, 212, 255, 0.5)' }}
                            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-600 text-white font-bold transition-all"
                          >
                            {startMiningLoading === 'starter' ? (
                              <span className="flex items-center justify-center gap-2">
                                <RefreshCw className="w-4 h-4 animate-spin" />
                                Activating...
                              </span>
                            ) : 'Activate Starter Plan'}
                          </motion.button>
                        ) : (
                          <div className="relative group/tooltip">
                            <button disabled className="w-full py-3 rounded-xl bg-slate-700 text-gray-400 font-bold cursor-not-allowed">
                              Insufficient Balance
                            </button>
                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover/tooltip:opacity-100 transition-opacity whitespace-nowrap border border-white/10">
                              Deposit at least 10 USDT to activate
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>

                    {/* Pro Plan */}
                    <motion.div
                      whileHover={{ scale: 1.02, y: -4 }}
                      whileTap={{ scale: 0.98 }}
                      className="relative overflow-hidden rounded-2xl cursor-pointer group"
                      style={{ boxShadow: '0 0 40px rgba(139, 92, 246, 0.2)' }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-slate-900 to-slate-900" />
                      <div className="absolute inset-0 border-2 border-purple-500/30 rounded-2xl group-hover:border-purple-500/60 transition-colors" style={{ boxShadow: 'inset 0 0 30px rgba(139, 92, 246, 0.1)' }} />
                      
                      <div className="absolute top-3 right-3">
                        <span className="px-2 py-1 bg-purple-500 text-white text-xs font-bold rounded-full">POPULAR</span>
                      </div>
                      
                      <div className="relative p-5">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                            <Crown className="w-6 h-6 text-purple-400" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-white">Pro Plan</h3>
                            <p className="text-gray-400 text-sm">Maximum returns</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 mb-4">
                          <div className="bg-slate-800/50 rounded-lg p-2 text-center">
                            <div className="text-gray-400 text-xs">Daily Profit</div>
                            <div className="text-purple-400 font-bold">4.5%</div>
                          </div>
                          <div className="bg-slate-800/50 rounded-lg p-2 text-center">
                            <div className="text-gray-400 text-xs">Total Return</div>
                            <div className="text-green-400 font-bold">135%</div>
                          </div>
                          <div className="bg-slate-800/50 rounded-lg p-2 text-center">
                            <div className="text-gray-400 text-xs">Duration</div>
                            <div className="text-white font-bold">30 Days</div>
                          </div>
                          <div className="bg-slate-800/50 rounded-lg p-2 text-center">
                            <div className="text-gray-400 text-xs">Minimum</div>
                            <div className="text-white font-bold">100 USDT</div>
                          </div>
                        </div>
                        
                        {((user?.balance || 0) >= 100) ? (
                          <motion.button
                            onClick={() => handleStartMining('pro')}
                            disabled={startMiningLoading !== null}
                            whileHover={{ boxShadow: '0 0 30px rgba(139, 92, 246, 0.5)' }}
                            className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 text-white font-bold transition-all"
                          >
                            {startMiningLoading === 'pro' ? (
                              <span className="flex items-center justify-center gap-2">
                                <RefreshCw className="w-4 h-4 animate-spin" />
                                Activating...
                              </span>
                            ) : 'Activate Pro Plan'}
                          </motion.button>
                        ) : (
                          <div className="relative group/tooltip">
                            <button disabled className="w-full py-3 rounded-xl bg-slate-700 text-gray-400 font-bold cursor-not-allowed">
                              Insufficient Balance
                            </button>
                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover/tooltip:opacity-100 transition-opacity whitespace-nowrap border border-white/10">
                              Deposit at least 100 USDT to activate
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              )}

              {/* Profit Calculation Cards */}
              {miningData && miningData.status === 'active' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <h3 className="text-white font-bold text-lg mb-3">Profit Calculations</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
                    {[
                      { label: 'Per Second', value: miningData.dailyProfit / 86400, color: '#00d4ff' },
                      { label: 'Per Minute', value: miningData.dailyProfit / 1440, color: '#22c55e' },
                      { label: 'Per Hour', value: miningData.dailyProfit / 24, color: '#8b5cf6' },
                      { label: 'Per Day', value: miningData.dailyProfit, color: '#f59e0b' },
                      { label: 'Per Week', value: miningData.dailyProfit * 7, color: '#ef4444' },
                      { label: 'Per Month', value: miningData.dailyProfit * 30, color: '#ec4899' },
                      { label: 'Total Return', value: miningData.investment * 1.2, color: '#06b6d4' },
                    ].map((card, i) => (
                      <motion.div
                        key={card.label}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 + i * 0.05 }}
                        whileHover={{ scale: 1.05, y: -4 }}
                        className="bg-slate-800/50 rounded-xl p-3 border border-white/10 text-center relative overflow-hidden"
                      >
                        <div className="absolute inset-0 opacity-10" style={{ background: `linear-gradient(135deg, ${card.color}, transparent)` }} />
                        <div className="relative">
                          <div className="text-gray-400 text-xs mb-1">{card.label}</div>
                          <motion.div 
                            animate={{ opacity: [0.7, 1, 0.7] }}
                            transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                            className="text-sm font-bold"
                            style={{ color: card.color }}
                          >
                            ${card.value.toFixed(card.value < 1 ? 6 : 2)}
                          </motion.div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Live Mining Power */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="relative overflow-hidden rounded-2xl"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-cyan-900/20 to-slate-900" />
                <div className="absolute inset-0 border border-cyan-500/20 rounded-2xl" />
                
                <div className="relative p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center"
                      style={{ boxShadow: '0 0 30px rgba(0, 212, 255, 0.3)' }}
                    >
                      <Cpu className="w-6 h-6 text-cyan-400" />
                    </motion.div>
                    <div>
                      <div className="text-gray-400 text-xs uppercase tracking-wider">Live Mining Power</div>
                      <motion.div 
                        animate={{ opacity: [0.7, 1, 0.7] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="text-2xl font-bold"
                        style={{ color: '#00d4ff', textShadow: '0 0 20px rgba(0, 212, 255, 0.5)' }}
                      >
                        {liveHashrate.toFixed(2)} TH/s
                      </motion.div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-green-400 text-sm font-medium">Network Active</span>
                  </div>
                </div>
              </motion.div>

              {/* Platform Statistics */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Activity className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-white font-bold text-lg">Platform Statistics</h3>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  {[
                    { label: 'Total Users', value: platformStats.totalUsers, icon: Users, color: '#00d4ff' },
                    { label: 'Total Deposits', value: platformStats.totalDeposits, prefix: '$', icon: ArrowDownRight, color: '#22c55e' },
                    { label: 'Total Withdrawals', value: platformStats.totalWithdrawals, prefix: '$', icon: ArrowUpRight, color: '#ef4444' },
                    { label: 'Profit Paid', value: platformStats.profitPaid, prefix: '$', icon: TrendingUp, color: '#f59e0b' },
                    { label: 'Active Miners', value: platformStats.activeMiners, icon: Cpu, color: '#8b5cf6' },
                    { label: 'Online Users', value: platformStats.onlineUsers, icon: Activity, color: '#06b6d4' },
                  ].map((stat, i) => (
                    <motion.div
                      key={stat.label}
                      animate={{
                        boxShadow: activePlatformGlow === i 
                          ? `0 0 30px ${stat.color}40, 0 0 60px ${stat.color}20`
                          : '0 4px 20px rgba(0, 0, 0, 0.3)',
                        y: activePlatformGlow === i ? -4 : 0
                      }}
                      whileHover={{ scale: 1.05, y: -6 }}
                      className="relative overflow-hidden rounded-xl cursor-pointer"
                      style={{
                        background: `linear-gradient(135deg, ${stat.color}15, transparent)`,
                        border: `1px solid ${stat.color}30`
                      }}
                    >
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
                          <motion.div
                            animate={{ scale: activePlatformGlow === i ? [1, 1.2, 1] : 1 }}
                            transition={{ duration: 0.5 }}
                            className="w-2 h-2 rounded-full"
                            style={{ background: stat.color, boxShadow: activePlatformGlow === i ? `0 0 10px ${stat.color}` : 'none' }}
                          />
                        </div>
                        <div className="text-gray-400 text-xs mb-1">{stat.label}</div>
                        <div className="text-lg font-bold text-white">
                          {stat.prefix}{(stat.value ?? 0).toLocaleString()}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Today Statistics */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-5 h-5 text-purple-400" />
                  <h3 className="text-white font-bold text-lg">Today Statistics</h3>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: 'Today Deposits', value: todayStats.todayDeposits, prefix: '$', color: '#22c55e' },
                    { label: 'Today Withdrawals', value: todayStats.todayWithdrawals, prefix: '$', color: '#ef4444' },
                    { label: 'New Users Today', value: todayStats.newUsers, color: '#00d4ff' },
                    { label: 'Today Profit', value: todayStats.todayProfit, prefix: '$', color: '#f59e0b' },
                  ].map((stat, i) => (
                    <motion.div
                      key={stat.label}
                      animate={{
                        boxShadow: activeTodayGlow === i 
                          ? `0 0 30px ${stat.color}40, 0 0 60px ${stat.color}20`
                          : '0 4px 20px rgba(0, 0, 0, 0.3)',
                        y: activeTodayGlow === i ? -4 : 0
                      }}
                      whileHover={{ scale: 1.05, y: -6 }}
                      className="relative overflow-hidden rounded-xl cursor-pointer"
                      style={{
                        background: `linear-gradient(135deg, ${stat.color}15, transparent)`,
                        border: `1px solid ${stat.color}30`
                      }}
                    >
                      <div className="p-4 text-center">
                        <div className="text-gray-400 text-xs mb-1">{stat.label}</div>
                        <div className="text-xl font-bold" style={{ color: stat.color }}>
                          {stat.prefix}{(stat.value ?? 0).toLocaleString()}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Mining Profit Calculator */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-white/10 p-5"
              >
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-white font-bold text-lg">Profit Calculator</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">Investment Amount (USDT)</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <Input
                        type="number"
                        placeholder="Enter amount"
                        value={calculatorAmount}
                        onChange={(e) => setCalculatorAmount(e.target.value)}
                        className="bg-slate-800 border-white/10 text-white placeholder:text-gray-600 h-12 pl-10 rounded-xl"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">Select Plan</label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setCalculatorPlan('starter')}
                        className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                          calculatorPlan === 'starter'
                            ? 'bg-cyan-500 text-white'
                            : 'bg-slate-800 text-gray-400 hover:bg-slate-700'
                        }`}
                      >
                        Starter (4%)
                      </button>
                      <button
                        onClick={() => setCalculatorPlan('pro')}
                        className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                          calculatorPlan === 'pro'
                            ? 'bg-purple-500 text-white'
                            : 'bg-slate-800 text-gray-400 hover:bg-slate-700'
                        }`}
                      >
                        Pro (4.5%)
                      </button>
                    </div>
                  </div>
                </div>
                
                {parseFloat(calculatorAmount) > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {[
                      { label: 'Per Hour', value: getCalculatorEarnings().hour, color: '#00d4ff' },
                      { label: 'Per Day', value: getCalculatorEarnings().day, color: '#22c55e' },
                      { label: 'Per Week', value: getCalculatorEarnings().week, color: '#8b5cf6' },
                      { label: 'Total Return', value: getCalculatorEarnings().total, color: '#f59e0b' },
                    ].map((item, i) => (
                      <motion.div
                        key={item.label}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-slate-800/50 rounded-xl p-3 text-center border border-white/10"
                      >
                        <div className="text-gray-400 text-xs">{item.label}</div>
                        <div className="text-lg font-bold" style={{ color: item.color }}>
                          ${item.value.toFixed(2)}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>

              {/* History Boards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Deposit History */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="bg-slate-900/50 rounded-2xl border border-green-500/20 overflow-hidden"
                >
                  <div className="flex items-center gap-2 p-4 border-b border-white/10 bg-green-500/5">
                    <ArrowDownRight className="w-5 h-5 text-green-400" />
                    <h3 className="text-white font-bold">Deposit History</h3>
                    <div className="ml-auto flex items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                      <span className="text-green-400 text-xs">LIVE</span>
                    </div>
                  </div>
                  
                  <div 
                    ref={depositScrollRef}
                    className="h-48 overflow-hidden"
                    style={{ scrollbarWidth: 'none' }}
                  >
                    <div className="space-y-1 p-2">
                      {[...depositHistory, ...depositHistory].map((item, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex items-center justify-between p-2 bg-slate-800/30 rounded-lg border border-green-500/10"
                          style={{ boxShadow: '0 0 10px rgba(34, 197, 94, 0.1)' }}
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                              <ArrowDownRight className="w-4 h-4 text-green-400" />
                            </div>
                            <div>
                              <div className="text-white text-sm font-mono">{item.wallet}</div>
                              <div className="text-gray-500 text-xs">{item.date}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-green-400 font-bold">${item.amount}</div>
                            <div className="text-green-400/60 text-xs uppercase">{item.status}</div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>

                {/* Withdrawal History */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="bg-slate-900/50 rounded-2xl border border-red-500/20 overflow-hidden"
                >
                  <div className="flex items-center gap-2 p-4 border-b border-white/10 bg-red-500/5">
                    <ArrowUpRight className="w-5 h-5 text-red-400" />
                    <h3 className="text-white font-bold">Withdrawal History</h3>
                    <div className="ml-auto flex items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse" />
                      <span className="text-red-400 text-xs">LIVE</span>
                    </div>
                  </div>
                  
                  <div 
                    ref={withdrawalScrollRef}
                    className="h-48 overflow-hidden"
                    style={{ scrollbarWidth: 'none' }}
                  >
                    <div className="space-y-1 p-2">
                      {[...withdrawalHistory, ...withdrawalHistory].map((item, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex items-center justify-between p-2 bg-slate-800/30 rounded-lg border border-red-500/10"
                          style={{ boxShadow: '0 0 10px rgba(239, 68, 68, 0.1)' }}
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
                              <ArrowUpRight className="w-4 h-4 text-red-400" />
                            </div>
                            <div>
                              <div className="text-white text-sm font-mono">{item.wallet}</div>
                              <div className="text-gray-500 text-xs">{item.date}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-red-400 font-bold">${item.amount}</div>
                            <div className="text-red-400/60 text-xs uppercase">{item.status}</div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </div>
            </>
          )}

          {/* Withdraw Tab */}
          {activeTab === 'withdraw' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-5"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center">
                  <ArrowUpRight className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Withdraw Funds</h2>
                  <p className="text-gray-400 text-sm">Withdraw your USDT to your BEP20 wallet</p>
                </div>
              </div>

              {/* Balance Card */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-white/10 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-gray-400 text-sm mb-1">Available Balance</div>
                    <div className="text-3xl font-bold text-white">${formatNumber(user?.balance || 0)}</div>
                  </div>
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500/20 to-pink-500/20 flex items-center justify-center">
                    <Wallet className="w-8 h-8 text-red-400" />
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Shield className="w-4 h-4 text-green-400" />
                  <span>Minimum withdrawal: 10 USDT</span>
                </div>
              </div>

              {/* Withdraw Form */}
              <form onSubmit={handleWithdraw} className="bg-slate-900/80 border border-white/10 rounded-2xl p-5 space-y-4">
                {withdrawError && (
                  <div className="bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl flex items-center gap-2 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {withdrawError}
                  </div>
                )}
                {withdrawSuccess && (
                  <div className="bg-green-500/20 border border-green-500/30 text-green-400 px-4 py-3 rounded-xl flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4" />
                    {withdrawSuccess}
                  </div>
                )}

                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Amount (USDT)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      className="bg-slate-800 border-white/10 text-white placeholder:text-gray-600 h-12 pl-10 pr-20 rounded-xl text-lg"
                    />
                    <button
                      type="button"
                      onClick={() => setWithdrawAmount(String(user?.balance || 0))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-cyan-400 hover:text-cyan-300 font-medium"
                    >
                      MAX
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-gray-400 text-sm mb-2 block">BEP20 Wallet Address</label>
                  <div className="relative">
                    <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <Input
                      placeholder="0x..."
                      value={withdrawWallet}
                      onChange={(e) => setWithdrawWallet(e.target.value)}
                      className="bg-slate-800 border-white/10 text-white placeholder:text-gray-600 h-12 pl-10 rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Security PIN</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <Input
                      type="password"
                      maxLength={6}
                      placeholder="••••••"
                      value={withdrawPin}
                      onChange={(e) => setWithdrawPin(e.target.value.replace(/\D/g, ''))}
                      className="bg-slate-800 border-white/10 text-white placeholder:text-gray-600 h-12 pl-10 rounded-xl text-center text-xl tracking-widest"
                    />
                  </div>
                </div>

                <motion.button
                  type="submit"
                  disabled={withdrawLoading}
                  whileHover={{ scale: 1.02, boxShadow: '0 0 25px rgba(239, 68, 68, 0.6)' }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full h-12 rounded-xl font-bold text-white flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-pink-600"
                >
                  {withdrawLoading ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <ArrowUpRight className="w-5 h-5" />
                      Request Withdrawal
                    </>
                  )}
                </motion.button>

                <div className="text-center text-xs text-gray-500">
                  Withdrawals are processed within 24 hours
                </div>
              </form>
            </motion.div>
          )}

          {/* Deposit Tab */}
          {activeTab === 'deposit' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-5"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                  <ArrowDownRight className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Deposit Funds</h2>
                  <p className="text-gray-400 text-sm">Send USDT to activate your mining plan</p>
                </div>
              </div>

              <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-5 text-center">
                <div className="text-gray-400 text-sm mb-3">Deposit Address (BEP20)</div>
                <div className="bg-slate-800 rounded-xl p-4 mb-4 relative group">
                  <div className="text-cyan-400 font-mono text-sm break-all">
                    0x742d35Cc6634C0532925a3b844Bc454e4438f44e
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText('0x742d35Cc6634C0532925a3b844Bc454e4438f44e');
                      setSuccess('Address copied!');
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-slate-700 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Copy className="w-4 h-4 text-white" />
                  </button>
                </div>
                <p className="text-gray-500 text-xs">
                  Send USDT (BEP20) to this address. Your deposit will be credited automatically after 3 confirmations.
                </p>
              </div>
            </motion.div>
          )}

          {/* Plans Tab */}
          {activeTab === 'plans' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <h2 className="text-xl font-bold text-white mb-4">Mining Plans</h2>
              
              {/* Starter Plan */}
              <motion.div 
                whileHover={{ scale: 1.01 }}
                className="bg-gradient-to-br from-slate-900 to-slate-800 border-2 border-cyan-500/30 rounded-2xl p-5 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl" />
                <div className="relative">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                      <Zap className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Starter Plan</h3>
                      <p className="text-gray-400 text-sm">Perfect for beginners</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                    <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                      <div className="text-gray-400 text-xs">Minimum</div>
                      <div className="text-white font-bold">10 USDT</div>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                      <div className="text-gray-400 text-xs">Daily Profit</div>
                      <div className="text-cyan-400 font-bold">4%</div>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                      <div className="text-gray-400 text-xs">Duration</div>
                      <div className="text-white font-bold">30 Days</div>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                      <div className="text-gray-400 text-xs">Total Return</div>
                      <div className="text-green-400 font-bold">120%</div>
                    </div>
                  </div>
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleStartMining('starter')}
                    disabled={startMiningLoading !== null || (user?.balance || 0) < 10}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-600 text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {startMiningLoading === 'starter' ? 'Activating...' : 'Activate Plan'}
                  </motion.button>
                </div>
              </motion.div>

              {/* Pro Plan */}
              <motion.div 
                whileHover={{ scale: 1.01 }}
                className="bg-gradient-to-br from-slate-900 to-slate-800 border-2 border-purple-500/30 rounded-2xl p-5 relative overflow-hidden"
                style={{ boxShadow: '0 0 40px rgba(139, 92, 246, 0.2)' }}
              >
                <div className="absolute top-3 right-3">
                  <span className="px-2 py-1 bg-purple-500 text-white text-xs font-bold rounded-full">POPULAR</span>
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl" />
                <div className="relative">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                      <Crown className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Pro Plan</h3>
                      <p className="text-gray-400 text-sm">Maximum returns</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                    <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                      <div className="text-gray-400 text-xs">Minimum</div>
                      <div className="text-white font-bold">100 USDT</div>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                      <div className="text-gray-400 text-xs">Daily Profit</div>
                      <div className="text-purple-400 font-bold">4.5%</div>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                      <div className="text-gray-400 text-xs">Duration</div>
                      <div className="text-white font-bold">30 Days</div>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                      <div className="text-gray-400 text-xs">Total Return</div>
                      <div className="text-green-400 font-bold">135%</div>
                    </div>
                  </div>
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleStartMining('pro')}
                    disabled={startMiningLoading !== null || (user?.balance || 0) < 100}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {startMiningLoading === 'pro' ? 'Activating...' : 'Activate Plan'}
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Transactions Tab */}
          {activeTab === 'transactions' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2 className="text-xl font-bold text-white mb-4">Transaction History</h2>
              <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-4">
                {transactions.length > 0 ? (
                  <div className="space-y-2">
                    {transactions.map((tx) => (
                      <div key={tx.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl border border-white/10">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            tx.type === 'withdrawal' ? 'bg-red-500/20' : 'bg-green-500/20'
                          }`}>
                            {tx.type === 'withdrawal' ? (
                              <ArrowUpRight className="w-5 h-5 text-red-400" />
                            ) : (
                              <ArrowDownRight className="w-5 h-5 text-green-400" />
                            )}
                          </div>
                          <div>
                            <div className="text-white font-medium capitalize">{tx.type}</div>
                            <div className="text-gray-500 text-xs">{new Date(tx.createdAt).toLocaleDateString()}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`font-bold ${tx.type === 'withdrawal' ? 'text-red-400' : 'text-green-400'}`}>
                            {tx.type === 'withdrawal' ? '-' : '+'}${formatNumber(tx.amount)}
                          </div>
                          <div className={`text-xs ${
                            tx.status === 'approved' ? 'text-green-400' : 
                            tx.status === 'pending' ? 'text-amber-400' : 'text-red-400'
                          }`}>
                            {tx.status}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No transactions yet</p>
                )}
              </div>
            </motion.div>
          )}

          {/* Referral Tab */}
          {activeTab === 'referral' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-5"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                  <Gift className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Referral Program</h2>
                  <p className="text-gray-400 text-sm">Earn 7% commission on every deposit</p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-2xl p-5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl" />
                <div className="relative">
                  <div className="text-center mb-4">
                    <div className="text-gray-400 text-sm mb-2">Your Referral Code</div>
                    <div className="bg-slate-800 rounded-xl p-4 inline-block">
                      <span className="text-2xl font-bold text-purple-400 font-mono">
                        {user?.referralCode || 'LOADING'}
                      </span>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      navigator.clipboard.writeText(user?.referralCode || '');
                      setCopied(true);
                      setSuccess('Referral code copied!');
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold flex items-center justify-center gap-2"
                  >
                    {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                    {copied ? 'Copied!' : 'Copy Code'}
                  </motion.button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-5 text-center">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mx-auto mb-3">
                    <Users className="w-6 h-6 text-purple-400" />
                  </div>
                  <div className="text-3xl font-bold text-white">{userStats?.referralCount || 0}</div>
                  <div className="text-gray-400 text-sm">Total Referrals</div>
                </div>
                <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-5 text-center">
                  <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center mx-auto mb-3">
                    <DollarSign className="w-6 h-6 text-green-400" />
                  </div>
                  <div className="text-3xl font-bold text-green-400">${formatNumber(user?.referralEarnings || 0)}</div>
                  <div className="text-gray-400 text-sm">Total Earnings</div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-xl p-4">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-lg mb-1">
                  <Gift className="w-5 h-5" />
                  7% Commission
                </div>
                <p className="text-gray-400 text-sm">Share your referral code and earn 7% commission on every deposit made by your referrals!</p>
              </div>
            </motion.div>
          )}

          {/* Support Tab */}
          {activeTab === 'support' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-10"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Need Help?</h2>
              <p className="text-gray-400 mb-6">Our support team is available 24/7</p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold"
              >
                Contact Support
              </motion.button>
            </motion.div>
          )}
        </div>
      </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-xl border-t border-white/10 z-50">
        <div className="flex justify-around py-2">
          {[
            { id: 'dashboard', icon: Home, color: '#00d4ff' },
            { id: 'deposit', icon: ArrowDownRight, color: '#22c55e' },
            { id: 'withdraw', icon: ArrowUpRight, color: '#ef4444' },
            { id: 'referral', icon: Gift, color: '#8b5cf6' },
            { id: 'transactions', icon: Clock, color: '#06b6d4' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center py-2 px-3 rounded-xl transition-all ${
                activeTab === item.id ? 'scale-110' : ''
              }`}
            >
              <item.icon 
                className="w-5 h-5" 
                style={{ color: activeTab === item.id ? item.color : '#6b7280' }} 
              />
              <span 
                className="text-xs mt-1"
                style={{ color: activeTab === item.id ? item.color : '#6b7280' }}
              >
                {item.id.charAt(0).toUpperCase() + item.id.slice(1)}
              </span>
            </button>
          ))}
        </div>
      </nav>

      {/* Footer */}
      <footer className="hidden lg:block border-t border-white/5 py-3 bg-black">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-600 text-xs">© 2025 USDT Mining Lab. All rights reserved.</p>
        </div>
      </footer>

      <style jsx>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
      `}</style>
    </div>
  );
}
