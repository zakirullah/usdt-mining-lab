'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wallet, TrendingUp, Users, Shield, Zap, 
  Lock, Eye, EyeOff, RefreshCw,
  ArrowDownRight, ArrowUpRight, Crown, Activity, Cpu, Gift,
  LogOut, Clock, Home, Copy, Check, X, AlertCircle, CheckCircle,
  ChevronRight, DollarSign, HelpCircle, MessageCircle, Settings, Server, Upload,
  Coins, Hash, Image, Send, Flame, Diamond, Sparkles, Rocket, Target,
  Thermometer, Power, Wifi, CpuIcon, Timer, Gauge, BarChart3, PieChart, Play
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { 
  USDTCoin, PremiumUSDCoin, FloatingCoinsBackground, 
  PremiumMiningRig, LiveParticles, NetworkPulseIndicator,
  HashRateBar, LiveStatCard, ProfitCounter,
  PremiumMiningPlanCard, LiveProfitChart, TemperatureGauge,
  MiningStatItem, MiningSessionCard
} from '@/components/ui/mining-animations';

// Types
interface User {
  id: string;
  walletAddress: string;
  balance: number;
  depositBalance: number;
  miningBalance: number;
  totalProfit: number;
  totalWithdrawn: number;
  totalInvested: number;
  referralEarnings: number;
  referralCode: string;
  referredBy?: string;
}

interface MiningSession {
  id: string;
  planType: string;
  planName: string;
  investment: number;
  dailyPercent: number;
  dailyProfit: number;
  profitPerSecond: number;
  totalEarned: number;
  status: string;
  startedAt: string;
  expiresAt: string;
  progressPercent: number;
  remainingTime?: { days: number; hours: number; minutes: number; seconds: number };
}

interface UserStats {
  totalDeposits: number;
  totalWithdrawals: number;
  depositCount: number;
  withdrawalCount: number;
  referralCount: number;
  activeMiningCount: number;
  totalProfitPerSecond: number;
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  status: string;
  createdAt: string;
  description?: string;
}

interface DepositRecord {
  id: string;
  amount: number;
  txHash: string;
  status: string;
  createdAt: string;
}

interface WithdrawalRecord {
  id: string;
  amount: number;
  walletAddress: string;
  status: string;
  createdAt: string;
}

interface ActivityItem {
  type: string;
  message: string;
  amount?: number;
}

// Animated Counter Component
function AnimatedCounter({ end, decimals = 0, duration = 2000, prefix = '' }: { end: number; decimals?: number; duration?: number; prefix?: string }) {
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
      {prefix}{count.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
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

  // Tutorial Animation Component - Defined inline
  const TutorialAnimation = () => {
    const [currentStep, setCurrentStep] = useState(0);
    const [stepProgress, setStepProgress] = useState(0);
    
    const steps = [
      { title: 'How to Register', subtitle: 'Create Your Account', icon: '👤', color: 'from-cyan-500 to-blue-600' },
      { title: 'How to Deposit', subtitle: 'Add USDT Funds', icon: '💰', color: 'from-green-500 to-emerald-600' },
      { title: 'Buy Mining Plan', subtitle: 'Start Earning', icon: '⚡', color: 'from-purple-500 to-violet-600' },
      { title: 'How to Withdraw', subtitle: 'Get Your Profits', icon: '🏦', color: 'from-amber-500 to-orange-600' }
    ];
    
    useEffect(() => {
      const stepInterval = setInterval(() => {
        setCurrentStep((prev) => (prev + 1) % 4);
      }, 3000);
      
      const progressInterval = setInterval(() => {
        setStepProgress((prev) => (prev + 1) % 100);
      }, 30);
      
      return () => {
        clearInterval(stepInterval);
        clearInterval(progressInterval);
      };
    }, []);
    
    const step = steps[currentStep];
    
    return (
      <div className="text-center">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center"
        >
          <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-4 shadow-lg`}>
            <span className="text-3xl">{step.icon}</span>
          </div>
          <h3 className="text-white text-xl font-bold mb-1">{step.title}</h3>
          <p className="text-gray-400 text-sm">{step.subtitle}</p>
          
          {/* Progress bar */}
          <div className="mt-4 w-64 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-cyan-500 via-purple-500 to-amber-500"
              initial={{ width: '0%' }}
              animate={{ width: `${stepProgress}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
          
          {/* Step indicators */}
          <div className="flex gap-2 mt-3">
            {steps.map((_, i) => (
              <div 
                key={i} 
                className={`w-2 h-2 rounded-full transition-all ${
                  i === currentStep ? 'bg-white scale-125' : i < currentStep ? 'bg-cyan-500' : 'bg-white/20'
                }`}
              />
            ))}
          </div>
        </motion.div>
      </div>
    );
  };

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
  const [miningSessions, setMiningSessions] = useState<MiningSession[]>([]);
  const [miningData, setMiningData] = useState<MiningSession | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [userDeposits, setUserDeposits] = useState<DepositRecord[]>([]);
  const [userWithdrawals, setUserWithdrawals] = useState<WithdrawalRecord[]>([]);
  const [showDashboard, setShowDashboard] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Modal States
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'starter' | 'pro'>('starter');
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [startMiningLoading, setStartMiningLoading] = useState<string | null>(null);
  const [planModalError, setPlanModalError] = useState<string | null>(null);

  // Deposit State
  const [depositAmount, setDepositAmount] = useState('');
  const [depositTxHash, setDepositTxHash] = useState('');
  const [depositScreenshot, setDepositScreenshot] = useState<string | null>(null);
  const [depositLoading, setDepositLoading] = useState(false);
  const [depositError, setDepositError] = useState<string | null>(null);
  const [depositSuccess, setDepositSuccess] = useState<string | null>(null);

  // Withdraw State
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawWallet, setWithdrawWallet] = useState('');
  const [withdrawPin, setWithdrawPin] = useState('');
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);
  const [withdrawSuccess, setWithdrawSuccess] = useState<string | null>(null);

  // Referral State
  const [copied, setCopied] = useState(false);

  // Platform Settings
  const [depositWallet, setDepositWallet] = useState('0x33cb374635ab51fc669c1849b21b589a17475fc3');

  // Broadcast Message
  const [broadcastMessage, setBroadcastMessage] = useState<string | null>(null);
  const [showBroadcast, setShowBroadcast] = useState(true);

  // Session Profits (for real-time tracking)
  const [sessionProfits, setSessionProfits] = useState<Record<string, number>>({});

  // Live profit tracking for all sessions
  const [liveTotalProfitPerSecond, setLiveTotalProfitPerSecond] = useState(0);
  const [liveSessionProfits, setLiveSessionProfits] = useState<Record<string, number>>({});
  const [profitHistory, setProfitHistory] = useState<Array<{ time: string; amount: number; total: number }>>([]);
  const [totalLiveEarned, setTotalLiveEarned] = useState(0);

  // Enhanced Mining Stats
  const [miningStats, setMiningStats] = useState({
    totalInvestment: 0,
    expectedTotalReturn: 0,
    totalDailyProfit: 0,
    totalWeeklyProfit: 0,
    totalMonthlyProfit: 0,
    averageROI: 0,
    sessionsCount: 0
  });

  // Session countdown timers
  const [sessionTimers, setSessionTimers] = useState<Record<string, { days: number; hours: number; minutes: number; seconds: number }>>({});

  // Live Stats
  const [liveHashrate, setLiveHashrate] = useState(128.45);
  const [onlineVisitors, setOnlineVisitors] = useState(1847);

  // Mining Animation
  const [miningAnimationIndex, setMiningAnimationIndex] = useState(0);
  const [profitFlash, setProfitFlash] = useState(false);

  // Sequential Glow Effect State
  const [activePlatformGlow, setActivePlatformGlow] = useState(0);
  const [activeTodayGlow, setActiveTodayGlow] = useState(0);

  // FAQ State
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Video Tutorial State
  const [showVideoModal, setShowVideoModal] = useState(false);

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
    onlineUsers: 1
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

  // Real-time mining profit update - works with ALL active sessions
  useEffect(() => {
    if (!miningSessions || miningSessions.length === 0) return;

    // Calculate total profit per second from all active sessions
    const totalPPS = miningSessions
      .filter(s => s.status === 'active')
      .reduce((sum, s) => sum + (s.dailyProfit / 86400), 0);

    setLiveTotalProfitPerSecond(totalPPS);

    // Calculate mining stats
    const activeSessions = miningSessions.filter(s => s.status === 'active');
    const totalInv = activeSessions.reduce((sum, s) => sum + s.investment, 0);
    const totalDaily = activeSessions.reduce((sum, s) => sum + s.dailyProfit, 0);
    const avgROI = activeSessions.length > 0
      ? activeSessions.reduce((sum, s) => sum + s.dailyPercent, 0) / activeSessions.length
      : 0;

    setMiningStats({
      totalInvestment: totalInv,
      expectedTotalReturn: totalInv * (avgROI / 100 * 30), // 30 days
      totalDailyProfit: totalDaily,
      totalWeeklyProfit: totalDaily * 7,
      totalMonthlyProfit: totalDaily * 30,
      averageROI: avgROI,
      sessionsCount: activeSessions.length
    });

    // Initialize live session profits
    const initialProfits: Record<string, number> = {};
    const initialTimers: Record<string, { days: number; hours: number; minutes: number; seconds: number }> = {};

    miningSessions.forEach(s => {
      if (s.status === 'active') {
        initialProfits[s.id] = 0;
        // Calculate initial timer
        const now = Date.now();
        const expires = new Date(s.expiresAt).getTime();
        const remainingMs = Math.max(0, expires - now);
        const totalSeconds = Math.floor(remainingMs / 1000);
        initialTimers[s.id] = {
          days: Math.floor(totalSeconds / 86400),
          hours: Math.floor((totalSeconds % 86400) / 3600),
          minutes: Math.floor((totalSeconds % 3600) / 60),
          seconds: totalSeconds % 60
        };
      }
    });
    setLiveSessionProfits(initialProfits);
    setSessionTimers(initialTimers);

    let secondsCounter = 0;

    const interval = setInterval(() => {
      secondsCounter++;

      // Mining animation
      setMiningAnimationIndex(prev => (prev + 1) % 4);

      // Flash effect every second
      setProfitFlash(true);
      setTimeout(() => setProfitFlash(false), 200);

      // Update live profits for each session
      setLiveSessionProfits(prev => {
        const updated = { ...prev };
        miningSessions.forEach(s => {
          if (s.status === 'active') {
            const pps = s.dailyProfit / 86400;
            updated[s.id] = (updated[s.id] || 0) + pps;
          }
        });
        return updated;
      });

      // Update total live earned
      setTotalLiveEarned(prev => prev + totalPPS);

      // Update session countdown timers
      setSessionTimers(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(id => {
          const timer = updated[id];
          if (timer.seconds > 0) {
            timer.seconds--;
          } else if (timer.minutes > 0) {
            timer.minutes--;
            timer.seconds = 59;
          } else if (timer.hours > 0) {
            timer.hours--;
            timer.minutes = 59;
            timer.seconds = 59;
          } else if (timer.days > 0) {
            timer.days--;
            timer.hours = 23;
            timer.minutes = 59;
            timer.seconds = 59;
          }
        });
        return updated;
      });

      // Add to profit history every second (keep last 60 entries)
      const now = new Date();
      const timeStr = now.toLocaleTimeString();
      setProfitHistory(prev => {
        const newEntry = {
          time: timeStr,
          amount: totalPPS,
          total: totalPPS * secondsCounter
        };
        const updated = [...prev, newEntry];
        return updated.slice(-60); // Keep last 60 entries
      });

      // Update timer if there's miningData (for backwards compatibility)
      if (miningData && miningData.status === 'active') {
        const started = new Date(miningData.startedAt).getTime();
        const expires = new Date(miningData.expiresAt).getTime();
        const nowMs = Date.now();
        const elapsed = Math.floor((nowMs - started) / 1000);
        const remaining = Math.max(0, Math.floor((expires - nowMs) / 1000));
        setMiningTimer({ elapsed, remaining });
      }

      // Call update API every 10 seconds (reduce server load)
      if (secondsCounter % 10 === 0) {
        fetch('/api/mining/update', { method: 'POST' })
          .then(res => res.json())
          .then(data => {
            if (data.miningSessions) {
              setMiningSessions(data.miningSessions);
            }
          })
          .catch(() => {});
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [miningSessions, miningData]);

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
            onlineUsers: Math.max(data.onlineUsers || 1, 1)
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

  // Fetch settings (deposit wallet)
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/settings');
        if (res.ok) {
          const data = await res.json();
          if (data.depositWallet) setDepositWallet(data.depositWallet);
        }
      } catch { /* ignore */ }
    };
    fetchSettings();
  }, []);

  // Fetch broadcast message
  useEffect(() => {
    const fetchBroadcast = async () => {
      try {
        const res = await fetch('/api/broadcast');
        if (res.ok) {
          const data = await res.json();
          if (data.hasBroadcast && data.message) {
            setBroadcastMessage(data.message);
            // Check if user has dismissed this broadcast
            const dismissed = localStorage.getItem('broadcast_dismissed');
            if (dismissed === data.message) {
              setShowBroadcast(false);
            }
          }
        }
      } catch { /* ignore */ }
    };
    fetchBroadcast();
  }, []);

  // Fetch deposit and withdrawal history
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch('/api/history');
        if (res.ok) {
          const data = await res.json();
          if (data.deposits && data.deposits.length > 0) {
            setDepositHistory(data.deposits);
          }
          if (data.withdrawals && data.withdrawals.length > 0) {
            setWithdrawalHistory(data.withdrawals);
          }
        }
      } catch { /* ignore */ }
    };
    fetchHistory();
    const interval = setInterval(fetchHistory, 60000);
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
        setMiningSessions(data.activeMiningSessions || []);
        // Set first active session as miningData for backwards compatibility
        if (data.activeMiningSessions && data.activeMiningSessions.length > 0) {
          setMiningData(data.activeMiningSessions[0]);
        } else {
          setMiningData(null);
        }
        setUserStats(data.stats || null);
        setTransactions(data.transactions || []);
        setUserDeposits(data.deposits || []);
        setUserWithdrawals(data.withdrawals || []);
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
      setMiningSessions(data.activeMiningSessions || []);
      if (data.activeMiningSessions && data.activeMiningSessions.length > 0) {
        setMiningData(data.activeMiningSessions[0]);
      } else {
        setMiningData(null);
      }
      setUserStats(data.stats || null);
      setTransactions(data.transactions || []);
      setUserDeposits(data.deposits || []);
      setUserWithdrawals(data.withdrawals || []);
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
  }>>([
    { user: 'Khalid', amount: 82, time: 'Just now' },
    { user: 'Ahmed', amount: 42, time: 'Just now' },
    { user: 'Michael', amount: 144, time: 'Just now' },
    { user: 'Aisha', amount: 95, time: '2 min ago' },
    { user: 'Ali', amount: 120, time: '5 min ago' },
  ]);

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

  // Demo activities for ticker
  const demoTickerActivities = [
    { type: 'withdraw', message: 'Ali withdrew 120 USDT', amount: 120 },
    { type: 'deposit', message: 'Ahmed deposited 90 USDT', amount: 90 },
    { type: 'plan', message: 'John activated Starter Plan' },
    { type: 'plan', message: 'Emma activated Pro Plan' },
    { type: 'deposit', message: 'Lucas deposited 200 USDT', amount: 200 },
    { type: 'withdraw', message: 'Sarah withdrew 85 USDT', amount: 85 },
    { type: 'deposit', message: 'Mike deposited 150 USDT', amount: 150 },
    { type: 'plan', message: 'David activated Pro Plan' },
    { type: 'withdraw', message: 'Lisa withdrew 95 USDT', amount: 95 },
    { type: 'deposit', message: 'James deposited 75 USDT', amount: 75 },
    { type: 'plan', message: 'Sophie activated Starter Plan' },
    { type: 'withdraw', message: 'Omar withdrew 180 USDT', amount: 180 },
    { type: 'deposit', message: 'Nina deposited 300 USDT', amount: 300 },
    { type: 'plan', message: 'Carlos activated Pro Plan' },
    { type: 'withdraw', message: 'Fatima withdrew 65 USDT', amount: 65 },
  ];

  // Fetch live activities for ticker
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const res = await fetch('/api/activities');
        const data = await res.json();
        if (data.hasRealData && data.activities.length > 0) {
          setTickerActivities(data.activities);
        } else {
          setTickerActivities(demoTickerActivities);
        }
      } catch {
        setTickerActivities(demoTickerActivities);
      }
    };
    fetchActivities();
    // Refresh activities every 30 seconds
    const interval = setInterval(fetchActivities, 30000);
    return () => clearInterval(interval);
  }, []);

  // Open plan purchase modal
  const openPlanModal = (planType: 'starter' | 'pro') => {
    setSelectedPlan(planType);
    setInvestmentAmount('');
    setPlanModalError(null);
    setShowPlanModal(true);
  };

  // Start mining handler with custom amount
  const handleStartMining = async () => {
    const minAmount = selectedPlan === 'starter' ? 10 : 100;
    const amount = parseFloat(investmentAmount);
    
    if (!investmentAmount || isNaN(amount)) {
      setPlanModalError('Please enter a valid investment amount');
      return;
    }
    
    if (amount < minAmount) {
      setPlanModalError(`Minimum investment for ${selectedPlan === 'starter' ? 'Starter' : 'Pro'} Plan is ${minAmount} USDT`);
      return;
    }
    
    if ((user?.balance || 0) < amount) {
      setPlanModalError('Insufficient balance. Please deposit more funds.');
      return;
    }
    
    setStartMiningLoading(selectedPlan);
    setPlanModalError(null);
    
    try {
      const res = await fetch('/api/mining/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planType: selectedPlan, amount: amount })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to start mining');
      
      setShowPlanModal(false);
      setInvestmentAmount('');
      fetchUserData();
      setSuccess(`${selectedPlan === 'starter' ? 'Starter' : 'Pro'} Plan activated with ${amount} USDT!`);
    } catch (err) {
      setPlanModalError(err instanceof Error ? err.message : 'Failed to start mining');
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

        {/* Broadcast Banner - Shows on top of login */}
        <AnimatePresence>
          {broadcastMessage && showBroadcast && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -20 }}
              className="sticky top-0 z-[60] bg-gradient-to-r from-cyan-600 via-purple-600 to-pink-600 px-4 py-3"
            >
              <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center animate-pulse">
                    <MessageCircle className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-white text-sm md:text-base font-medium">
                    {broadcastMessage}
                  </p>
                </div>
                <button 
                  onClick={() => {
                    setShowBroadcast(false);
                    localStorage.setItem('broadcast_dismissed', broadcastMessage);
                  }}
                  className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-white/70 hover:text-white" />
                </button>
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

        {/* Footer with Professional UK Certificate & Team Overlay */}
        <footer className="border-t border-white/5 py-6 bg-black">
          <div className="max-w-lg mx-auto px-4 text-center">
            {/* Combined Certificate with Team Overlay */}
            <div className="mb-5 rounded-xl overflow-hidden shadow-2xl border-2 border-amber-600/30 relative">
              {/* Certificate Header with UK Flag Colors */}
              <div className="bg-gradient-to-r from-blue-900 via-red-800 to-blue-900 py-3 px-4">
                <div className="flex items-center justify-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="11" fill="#1e3a5f"/>
                      <text x="12" y="16" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">UK</text>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-base tracking-wide">COMPANIES HOUSE</h3>
                    <p className="text-blue-200 text-[10px]">United Kingdom Government Agency</p>
                  </div>
                </div>
              </div>
              
              {/* Certificate Body - White Background */}
              <div className="bg-white p-4 text-gray-900 relative">
                {/* Royal Crown */}
                <div className="flex justify-center mb-2">
                  <svg className="w-10 h-8" viewBox="0 0 50 40">
                    <path d="M25 2L20 15H5L15 25L10 38H40L35 25L45 15H30L25 2Z" fill="#c9a227" stroke="#8b6914" strokeWidth="1"/>
                    <circle cx="25" cy="8" r="3" fill="#dc143c"/>
                    <circle cx="12" cy="20" r="2" fill="#dc143c"/>
                    <circle cx="38" cy="20" r="2" fill="#dc143c"/>
                  </svg>
                </div>
                
                <h4 className="text-center font-bold text-base text-gray-800 mb-1">CERTIFICATE OF INCORPORATION</h4>
                <p className="text-center text-[10px] text-gray-500 mb-3">Companies Act 2006 - Private Limited Company</p>
                
                {/* Company Details */}
                <div className="border-2 border-double border-gray-400 p-3 mb-3 bg-gray-50">
                  <div className="grid grid-cols-2 gap-2 text-left text-[10px]">
                    <div>
                      <span className="text-gray-500">Company Name:</span>
                      <p className="font-bold text-gray-800">USDT MINING LAB LTD</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Company Number:</span>
                      <p className="font-bold text-gray-800">15628479</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Date of Incorporation:</span>
                      <p className="font-bold text-gray-800">18 March 2024</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Jurisdiction:</span>
                      <p className="font-bold text-gray-800">England & Wales</p>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-500">Registered Office:</span>
                      <p className="font-bold text-gray-800 text-[10px]">10 Downing Street, London, SW1A 2AA, UK</p>
                    </div>
                  </div>
                </div>
                
                {/* UK Leadership Team Section - CENTER of Certificate - v2 */}
                <div className="my-4 bg-gradient-to-r from-blue-50 via-white to-blue-50 rounded-xl p-4 border-2 border-blue-300 shadow-lg">
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center">
                      <Crown className="w-4 h-4 text-amber-600" />
                    </div>
                    <h5 className="text-gray-800 font-bold text-sm tracking-wide">
                      UK LEADERSHIP TEAM
                    </h5>
                    <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center">
                      <Crown className="w-4 h-4 text-amber-600" />
                    </div>
                  </div>
                  
                  {/* Sliding Team Carousel - Right to Left */}
                  <div className="relative overflow-hidden rounded-lg bg-white/80 py-2">
                    <div className="flex animate-slide-left gap-4" style={{ width: 'max-content' }}>
                      {/* CEO - William Charles Anderson */}
                      <div className="flex-shrink-0 w-24 p-3 bg-white rounded-xl border-2 border-cyan-300 shadow-lg team-card-glow">
                        <div className="w-16 h-16 mx-auto mb-2 rounded-full overflow-hidden border-3 border-cyan-500 shadow-lg">
                          <img 
                            src="https://i.pravatar.cc/150?img=68" 
                            alt="William Anderson - CEO" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <p className="text-gray-800 text-[10px] font-bold text-center">William C. Anderson</p>
                        <p className="text-cyan-600 text-[9px] text-center font-semibold">CEO & Founder</p>
                        <p className="text-gray-400 text-[7px] text-center">London, UK</p>
                      </div>
                      
                      {/* CTO - Oliver James Thompson */}
                      <div className="flex-shrink-0 w-24 p-3 bg-white rounded-xl border-2 border-purple-300 shadow-lg team-card-glow">
                        <div className="w-16 h-16 mx-auto mb-2 rounded-full overflow-hidden border-3 border-purple-500 shadow-lg">
                          <img 
                            src="https://i.pravatar.cc/150?img=52" 
                            alt="Oliver Thompson - CTO" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <p className="text-gray-800 text-[10px] font-bold text-center">Oliver J. Thompson</p>
                        <p className="text-purple-600 text-[9px] text-center font-semibold">Chief Technology Officer</p>
                        <p className="text-gray-400 text-[7px] text-center">Manchester, UK</p>
                      </div>
                      
                      {/* CFO - Charlotte Elizabeth Wright */}
                      <div className="flex-shrink-0 w-24 p-3 bg-white rounded-xl border-2 border-amber-300 shadow-lg team-card-glow">
                        <div className="w-16 h-16 mx-auto mb-2 rounded-full overflow-hidden border-3 border-amber-500 shadow-lg">
                          <img 
                            src="https://i.pravatar.cc/150?img=45" 
                            alt="Charlotte Wright - CFO" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <p className="text-gray-800 text-[10px] font-bold text-center">Charlotte E. Wright</p>
                        <p className="text-amber-600 text-[9px] text-center font-semibold">Chief Financial Officer</p>
                        <p className="text-gray-400 text-[7px] text-center">Edinburgh, UK</p>
                      </div>
                      
                      {/* COO - Henry George Mitchell */}
                      <div className="flex-shrink-0 w-24 p-3 bg-white rounded-xl border-2 border-emerald-300 shadow-lg team-card-glow">
                        <div className="w-16 h-16 mx-auto mb-2 rounded-full overflow-hidden border-3 border-emerald-500 shadow-lg">
                          <img 
                            src="https://i.pravatar.cc/150?img=59" 
                            alt="Henry Mitchell - COO" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <p className="text-gray-800 text-[10px] font-bold text-center">Henry G. Mitchell</p>
                        <p className="text-emerald-600 text-[9px] text-center font-semibold">Chief Operating Officer</p>
                        <p className="text-gray-400 text-[7px] text-center">Birmingham, UK</p>
                      </div>
                      
                      {/* Legal Advisor - Victoria Anne Roberts */}
                      <div className="flex-shrink-0 w-24 p-3 bg-white rounded-xl border-2 border-rose-300 shadow-lg team-card-glow">
                        <div className="w-16 h-16 mx-auto mb-2 rounded-full overflow-hidden border-3 border-rose-500 shadow-lg">
                          <img 
                            src="https://i.pravatar.cc/150?img=32" 
                            alt="Victoria Roberts - Legal" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <p className="text-gray-800 text-[10px] font-bold text-center">Victoria A. Roberts</p>
                        <p className="text-rose-600 text-[9px] text-center font-semibold">Legal Advisor</p>
                        <p className="text-gray-400 text-[7px] text-center">London, UK</p>
                      </div>
                      
                      {/* Head of Security - Edward Thomas Davis */}
                      <div className="flex-shrink-0 w-24 p-3 bg-white rounded-xl border-2 border-indigo-300 shadow-lg team-card-glow">
                        <div className="w-16 h-16 mx-auto mb-2 rounded-full overflow-hidden border-3 border-indigo-500 shadow-lg">
                          <img 
                            src="https://i.pravatar.cc/150?img=61" 
                            alt="Edward Davis - Security" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <p className="text-gray-800 text-[10px] font-bold text-center">Edward T. Davis</p>
                        <p className="text-indigo-600 text-[9px] text-center font-semibold">Head of Security</p>
                        <p className="text-gray-400 text-[7px] text-center">Cambridge, UK</p>
                      </div>
                      
                      {/* Head of Operations - Amelia Sarah Clarke */}
                      <div className="flex-shrink-0 w-24 p-3 bg-white rounded-xl border-2 border-pink-300 shadow-lg team-card-glow">
                        <div className="w-16 h-16 mx-auto mb-2 rounded-full overflow-hidden border-3 border-pink-500 shadow-lg">
                          <img 
                            src="https://i.pravatar.cc/150?img=26" 
                            alt="Amelia Clarke - Operations" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <p className="text-gray-800 text-[10px] font-bold text-center">Amelia S. Clarke</p>
                        <p className="text-pink-600 text-[9px] text-center font-semibold">Head of Operations</p>
                        <p className="text-gray-400 text-[7px] text-center">Oxford, UK</p>
                      </div>
                      
                      {/* Duplicate cards for infinite scroll */}
                      <div className="flex-shrink-0 w-24 p-3 bg-white rounded-xl border-2 border-cyan-300 shadow-lg team-card-glow">
                        <div className="w-16 h-16 mx-auto mb-2 rounded-full overflow-hidden border-3 border-cyan-500 shadow-lg">
                          <img src="https://i.pravatar.cc/150?img=68" alt="William Anderson - CEO" className="w-full h-full object-cover"/>
                        </div>
                        <p className="text-gray-800 text-[10px] font-bold text-center">William C. Anderson</p>
                        <p className="text-cyan-600 text-[9px] text-center font-semibold">CEO & Founder</p>
                        <p className="text-gray-400 text-[7px] text-center">London, UK</p>
                      </div>
                      
                      <div className="flex-shrink-0 w-24 p-3 bg-white rounded-xl border-2 border-purple-300 shadow-lg team-card-glow">
                        <div className="w-16 h-16 mx-auto mb-2 rounded-full overflow-hidden border-3 border-purple-500 shadow-lg">
                          <img src="https://i.pravatar.cc/150?img=52" alt="Oliver Thompson - CTO" className="w-full h-full object-cover"/>
                        </div>
                        <p className="text-gray-800 text-[10px] font-bold text-center">Oliver J. Thompson</p>
                        <p className="text-purple-600 text-[9px] text-center font-semibold">CTO</p>
                        <p className="text-gray-400 text-[7px] text-center">Manchester, UK</p>
                      </div>
                      
                      <div className="flex-shrink-0 w-24 p-3 bg-white rounded-xl border-2 border-amber-300 shadow-lg team-card-glow">
                        <div className="w-16 h-16 mx-auto mb-2 rounded-full overflow-hidden border-3 border-amber-500 shadow-lg">
                          <img src="https://i.pravatar.cc/150?img=45" alt="Charlotte Wright - CFO" className="w-full h-full object-cover"/>
                        </div>
                        <p className="text-gray-800 text-[10px] font-bold text-center">Charlotte E. Wright</p>
                        <p className="text-amber-600 text-[9px] text-center font-semibold">CFO</p>
                        <p className="text-gray-400 text-[7px] text-center">Edinburgh, UK</p>
                      </div>
                      
                      <div className="flex-shrink-0 w-24 p-3 bg-white rounded-xl border-2 border-emerald-300 shadow-lg team-card-glow">
                        <div className="w-16 h-16 mx-auto mb-2 rounded-full overflow-hidden border-3 border-emerald-500 shadow-lg">
                          <img src="https://i.pravatar.cc/150?img=59" alt="Henry Mitchell - COO" className="w-full h-full object-cover"/>
                        </div>
                        <p className="text-gray-800 text-[10px] font-bold text-center">Henry G. Mitchell</p>
                        <p className="text-emerald-600 text-[9px] text-center font-semibold">COO</p>
                        <p className="text-gray-400 text-[7px] text-center">Birmingham, UK</p>
                      </div>
                      
                      <div className="flex-shrink-0 w-24 p-3 bg-white rounded-xl border-2 border-rose-300 shadow-lg team-card-glow">
                        <div className="w-16 h-16 mx-auto mb-2 rounded-full overflow-hidden border-3 border-rose-500 shadow-lg">
                          <img src="https://i.pravatar.cc/150?img=32" alt="Victoria Roberts - Legal" className="w-full h-full object-cover"/>
                        </div>
                        <p className="text-gray-800 text-[10px] font-bold text-center">Victoria A. Roberts</p>
                        <p className="text-rose-600 text-[9px] text-center font-semibold">Legal Advisor</p>
                        <p className="text-gray-400 text-[7px] text-center">London, UK</p>
                      </div>
                      
                      <div className="flex-shrink-0 w-24 p-3 bg-white rounded-xl border-2 border-indigo-300 shadow-lg team-card-glow">
                        <div className="w-16 h-16 mx-auto mb-2 rounded-full overflow-hidden border-3 border-indigo-500 shadow-lg">
                          <img src="https://i.pravatar.cc/150?img=61" alt="Edward Davis - Security" className="w-full h-full object-cover"/>
                        </div>
                        <p className="text-gray-800 text-[10px] font-bold text-center">Edward T. Davis</p>
                        <p className="text-indigo-600 text-[9px] text-center font-semibold">Head of Security</p>
                        <p className="text-gray-400 text-[7px] text-center">Cambridge, UK</p>
                      </div>
                      
                      <div className="flex-shrink-0 w-24 p-3 bg-white rounded-xl border-2 border-pink-300 shadow-lg team-card-glow">
                        <div className="w-16 h-16 mx-auto mb-2 rounded-full overflow-hidden border-3 border-pink-500 shadow-lg">
                          <img src="https://i.pravatar.cc/150?img=26" alt="Amelia Clarke - Operations" className="w-full h-full object-cover"/>
                        </div>
                        <p className="text-gray-800 text-[10px] font-bold text-center">Amelia S. Clarke</p>
                        <p className="text-pink-600 text-[9px] text-center font-semibold">Head of Operations</p>
                        <p className="text-gray-400 text-[7px] text-center">Oxford, UK</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* FCA Authorization */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 mb-3">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <svg className="w-4 h-4 text-blue-700" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>
                    </svg>
                    <span className="text-blue-800 font-bold text-[10px]">FCA Authorized & Regulated</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-[8px]">
                    <div className="text-left">
                      <span className="text-gray-500">FCA Register:</span>
                      <span className="font-bold text-gray-800 ml-1">928463</span>
                    </div>
                    <div className="text-left">
                      <span className="text-gray-500">Status:</span>
                      <span className="font-bold text-green-700 ml-1">✓ Authorized</span>
                    </div>
                  </div>
                </div>
                
                {/* Verification Badges */}
                <div className="flex justify-center gap-2 mb-3">
                  <div className="flex items-center gap-0.5 bg-green-100 px-1.5 py-0.5 rounded-full">
                    <CheckCircle className="w-2.5 h-2.5 text-green-600" />
                    <span className="text-[8px] text-green-700 font-medium">Licensed</span>
                  </div>
                  <div className="flex items-center gap-0.5 bg-blue-100 px-1.5 py-0.5 rounded-full">
                    <Shield className="w-2.5 h-2.5 text-blue-600" />
                    <span className="text-[8px] text-blue-700 font-medium">Insured</span>
                  </div>
                  <div className="flex items-center gap-0.5 bg-purple-100 px-1.5 py-0.5 rounded-full">
                    <CheckCircle className="w-2.5 h-2.5 text-purple-600" />
                    <span className="text-[8px] text-purple-700 font-medium">Audited</span>
                  </div>
                  <div className="flex items-center gap-0.5 bg-amber-100 px-1.5 py-0.5 rounded-full">
                    <Shield className="w-2.5 h-2.5 text-amber-600" />
                    <span className="text-[8px] text-amber-700 font-medium">Verified</span>
                  </div>
                </div>
                
                {/* CEO Signature Section */}
                <div className="border-t border-gray-300 pt-2">
                  <div className="flex justify-between items-end">
                    <div className="text-left">
                      <p className="text-[8px] text-gray-500 mb-0.5">Authorised Signatory</p>
                      {/* Professional Handwritten Signature SVG */}
                      <svg className="w-28 h-10" viewBox="0 0 140 45">
                        <path d="M5 30 Q15 10 30 25 T55 18 Q70 12 85 24 T115 15 Q125 10 135 22" 
                              fill="none" stroke="#1e3a5f" strokeWidth="2.5" strokeLinecap="round"/>
                        <path d="M40 32 Q52 27 62 35" fill="none" stroke="#1e3a5f" strokeWidth="1.8"/>
                        <path d="M85 26 L90 38 L95 26" fill="none" stroke="#1e3a5f" strokeWidth="1.5"/>
                      </svg>
                      <p className="text-[9px] font-bold text-gray-800">William C. Anderson</p>
                      <p className="text-[7px] text-gray-500">Chief Executive Officer</p>
                    </div>
                    <div className="text-center">
                      {/* Official Seal */}
                      <div className="w-14 h-14 rounded-full border-3 border-red-700 flex items-center justify-center bg-red-50 shadow-inner">
                        <div className="text-center">
                          <p className="text-[6px] font-bold text-red-800">COMPANIES</p>
                          <p className="text-[6px] font-bold text-red-800">HOUSE</p>
                          <p className="text-[5px] text-red-600">OFFICIAL SEAL</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Certificate Footer */}
              <div className="bg-gray-100 py-2 px-4 border-t border-gray-300">
                <p className="text-[7px] text-gray-500 text-center">
                  This certificate is issued under the authority of the Registrar of Companies for England and Wales.
                  <br />Verify at: find-and-update.company-information.service.gov.uk
                </p>
              </div>
            </div>

            {/* Footer Links */}
            <div className="flex items-center justify-center gap-4 text-gray-500 text-xs mb-3">
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <span>|</span>
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <span>|</span>
              <a href="#" className="hover:text-white transition-colors">Support</a>
              <span>|</span>
              <a href="https://t.me/usdtmininglab" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-1">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
                Telegram
              </a>
            </div>
            <div className="flex items-center justify-center gap-3 text-gray-600 text-xs">
              <span className="flex items-center gap-1"><Shield className="w-3 h-3 text-emerald-400" />SSL</span>
              <span className="flex items-center gap-1"><Lock className="w-3 h-3 text-cyan-400" />256-bit</span>
              <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-amber-400" />Verified</span>
            </div>
            <p className="text-gray-600 text-xs mt-2">© 2025 USDT Mining Lab - UK Registered</p>
            <p className="text-gray-700 text-[10px] mt-1">Build: v2.0.0 | {new Date().toISOString().split('T')[0]}</p>
          </div>
        </footer>

        {/* Floating Telegram Button - Login Page */}
        <a 
          href="https://t.me/usdtmininglab" 
          target="_blank" 
          rel="noopener noreferrer"
          className="fixed bottom-6 right-4 z-50 flex items-center justify-center w-14 h-14 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300"
          title="Join Telegram Group"
        >
          <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
          </svg>
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-cyan-500"></span>
          </span>
        </a>

        {/* Video Tutorial Modal */}
        <AnimatePresence>
          {showVideoModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4"
              onClick={() => setShowVideoModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative w-full max-w-4xl bg-slate-900 rounded-2xl overflow-hidden border border-white/10"
                onClick={e => e.stopPropagation()}
              >
                <VideoTutorial onClose={() => setShowVideoModal(false)} />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Video Tutorial Component - Animated step-by-step guide
  function VideoTutorial({ onClose }: { onClose: () => void }) {
    const [currentStep, setCurrentStep] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const [progress, setProgress] = useState(0);
    const [cursorPos, setCursorPos] = useState({ x: 50, y: 50 });
    const [typedText, setTypedText] = useState('');
    const [showCheck, setShowCheck] = useState(false);

    const steps = [
      {
        title: 'Step 1: Register Account',
        duration: 8000,
        description: 'Enter your BEP20 wallet address and create a 6-digit PIN',
        actions: [
          { time: 0, cursor: { x: 50, y: 30 }, text: '' },
          { time: 1000, cursor: { x: 50, y: 45 }, text: '' },
          { time: 2000, cursor: { x: 50, y: 50 }, text: '0x', type: 'wallet' },
          { time: 5000, cursor: { x: 50, y: 60 }, text: '' },
          { time: 6000, cursor: { x: 50, y: 65 }, text: '123456', type: 'pin' },
        ],
        content: (
          <div className="flex flex-col items-center justify-center h-full p-8 bg-gradient-to-br from-slate-900 to-slate-800">
            <h3 className="text-cyan-400 text-xl font-bold mb-6">📝 Create Account</h3>
            <div className="w-full max-w-sm space-y-4">
              <div className="relative">
                <label className="text-gray-400 text-xs mb-1 block">Wallet Address (BEP20)</label>
                <div className="bg-slate-800 border border-cyan-500/30 rounded-lg p-3 text-cyan-300 font-mono text-sm">
                  {typedText.includes('0x') ? '0x742d35Cc6634C0532925a3b844Bc9e7595f8bDe7' : 'Enter your wallet...'}
                </div>
              </div>
              <div className="relative">
                <label className="text-gray-400 text-xs mb-1 block">Create 6-Digit PIN</label>
                <div className="flex gap-2 justify-center">
                  {[1,2,3,4,5,6].map((_, i) => (
                    <div key={i} className="w-10 h-12 bg-slate-800 border border-purple-500/30 rounded-lg flex items-center justify-center text-white font-bold">
                      {typedText.includes('123456') ? '•' : ''}
                    </div>
                  ))}
                </div>
              </div>
              <button className="w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-lg text-white font-bold">
                Register Now
              </button>
            </div>
          </div>
        )
      },
      {
        title: 'Step 2: Deposit USDT',
        duration: 10000,
        description: 'Send USDT to the deposit address and upload screenshot',
        actions: [
          { time: 0, cursor: { x: 50, y: 30 }, text: '' },
          { time: 2000, cursor: { x: 50, y: 50 }, text: '' },
          { time: 5000, cursor: { x: 50, y: 70 }, text: 'copy', copy: true },
          { time: 7000, cursor: { x: 50, y: 85 }, text: '' },
        ],
        content: (
          <div className="flex flex-col items-center justify-center h-full p-8 bg-gradient-to-br from-slate-900 to-slate-800">
            <h3 className="text-green-400 text-xl font-bold mb-6">💰 Deposit USDT</h3>
            <div className="w-full max-w-sm space-y-4">
              <div className="bg-slate-800/50 rounded-xl p-4 border border-green-500/30">
                <label className="text-gray-400 text-xs mb-2 block">Deposit Wallet Address</label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-slate-900 p-2 rounded text-green-300 text-xs font-mono truncate">
                    0x33cb374635ab51fc669c1849b21b589a17475fc3
                  </code>
                  <button className="p-2 bg-green-500/20 rounded-lg">
                    <Copy className="w-4 h-4 text-green-400" />
                  </button>
                </div>
              </div>
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                <p className="text-yellow-400 text-xs">⚠️ Send only USDT (BEP20) to this address</p>
              </div>
              <div className="bg-slate-800/50 rounded-xl p-4 border border-white/10">
                <label className="text-gray-400 text-xs mb-2 block">Upload Screenshot</label>
                <div className="border-2 border-dashed border-white/20 rounded-lg p-4 text-center">
                  <Upload className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                  <p className="text-gray-400 text-xs">Click to upload</p>
                </div>
              </div>
            </div>
          </div>
        )
      },
      {
        title: 'Step 3: Buy Mining Plan',
        duration: 8000,
        description: 'Choose Starter (4% daily) or Pro (4.5% daily) plan',
        actions: [
          { time: 0, cursor: { x: 30, y: 50 }, text: '' },
          { time: 3000, cursor: { x: 70, y: 50 }, text: '' },
          { time: 6000, cursor: { x: 50, y: 80 }, text: 'buy' },
        ],
        content: (
          <div className="flex flex-col items-center justify-center h-full p-8 bg-gradient-to-br from-slate-900 to-slate-800">
            <h3 className="text-purple-400 text-xl font-bold mb-6">⚡ Choose Mining Plan</h3>
            <div className="w-full max-w-md grid grid-cols-2 gap-4">
              <div className="bg-slate-800/50 rounded-xl p-4 border-2 border-cyan-500/50">
                <div className="text-cyan-400 font-bold mb-2">Starter Plan</div>
                <div className="text-3xl font-bold text-white mb-2">4%</div>
                <div className="text-gray-400 text-xs mb-3">Daily Profit</div>
                <div className="space-y-1 text-xs text-gray-400">
                  <div>Min: 10 USDT</div>
                  <div>30 Days</div>
                  <div>120% Return</div>
                </div>
                <button className="w-full mt-3 py-2 bg-cyan-500 rounded-lg text-white text-sm font-bold">
                  Start Mining
                </button>
              </div>
              <div className="bg-slate-800/50 rounded-xl p-4 border-2 border-purple-500 relative">
                <span className="absolute -top-2 right-2 bg-yellow-500 text-black text-xs px-2 py-0.5 rounded-full font-bold">POPULAR</span>
                <div className="text-purple-400 font-bold mb-2">Pro Plan</div>
                <div className="text-3xl font-bold text-white mb-2">4.5%</div>
                <div className="text-gray-400 text-xs mb-3">Daily Profit</div>
                <div className="space-y-1 text-xs text-gray-400">
                  <div>Min: 100 USDT</div>
                  <div>30 Days</div>
                  <div>135% Return</div>
                </div>
                <button className="w-full mt-3 py-2 bg-purple-500 rounded-lg text-white text-sm font-bold">
                  Start Mining
                </button>
              </div>
            </div>
          </div>
        )
      },
      {
        title: 'Step 4: Withdraw Profits',
        duration: 8000,
        description: 'Withdraw your earnings anytime (5% fee applies)',
        actions: [
          { time: 0, cursor: { x: 50, y: 40 }, text: '' },
          { time: 2000, cursor: { x: 50, y: 55 }, text: '100' },
          { time: 4000, cursor: { x: 50, y: 75 }, text: '' },
          { time: 6000, cursor: { x: 50, y: 90 }, text: 'withdraw' },
        ],
        content: (
          <div className="flex flex-col items-center justify-center h-full p-8 bg-gradient-to-br from-slate-900 to-slate-800">
            <h3 className="text-amber-400 text-xl font-bold mb-6">🏦 Withdraw Profits</h3>
            <div className="w-full max-w-sm space-y-4">
              <div className="bg-slate-800/50 rounded-xl p-4 border border-amber-500/30">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-400 text-sm">Available Balance</span>
                  <span className="text-amber-400 font-bold">$250.00</span>
                </div>
              </div>
              <div>
                <label className="text-gray-400 text-xs mb-1 block">Amount to Withdraw</label>
                <div className="bg-slate-800 border border-white/10 rounded-lg p-3">
                  <span className="text-white font-bold">100 USDT</span>
                </div>
                <p className="text-gray-500 text-xs mt-1">Min: 10 USDT | Fee: 5%</p>
              </div>
              <div>
                <label className="text-gray-400 text-xs mb-1 block">Wallet Address</label>
                <div className="bg-slate-800 border border-white/10 rounded-lg p-3 font-mono text-xs text-gray-300">
                  0x742d...bDe7
                </div>
              </div>
              <button className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-600 rounded-lg text-white font-bold">
                Withdraw Now
              </button>
            </div>
          </div>
        )
      }
    ];

    // Auto-advance through steps
    useEffect(() => {
      if (!isPlaying) return;

      const step = steps[currentStep];
      const startTime = Date.now();
      
      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const newProgress = (elapsed / step.duration) * 100;
        
        if (newProgress >= 100) {
          setCurrentStep(prev => (prev + 1) % steps.length);
          setProgress(0);
          setTypedText('');
          setShowCheck(false);
        } else {
          setProgress(newProgress);
          
          // Animate cursor and typing based on actions
          const action = step.actions.find((a, i) => {
            const nextAction = step.actions[i + 1];
            return elapsed >= a.time && (!nextAction || elapsed < nextAction.time);
          });
          
          if (action) {
            setCursorPos(action.cursor);
            if (action.text && action.type) {
              setTypedText(action.text);
            }
            if (action.copy) {
              setShowCheck(true);
            }
          }
        }
      }, 50);

      return () => clearInterval(interval);
    }, [isPlaying, currentStep]);

    // No more blinking - cursor stays visible with just pulse animation

    const step = steps[currentStep];

    return (
      <>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 flex items-center justify-center">
              <Play className="w-5 h-5 text-white" fill="white" />
            </div>
            <div>
              <h3 className="text-white font-bold">Video Tutorial</h3>
              <p className="text-gray-400 text-xs">{step.title}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              {isPlaying ? (
                <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="4" width="4" height="16" rx="1" />
                  <rect x="14" y="4" width="4" height="16" rx="1" />
                </svg>
              ) : (
                <Play className="w-4 h-4 text-white" fill="white" />
              )}
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {/* Video Content */}
        <div className="relative aspect-video bg-black overflow-hidden">
          {/* Step Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0"
            >
              {step.content}
            </motion.div>
          </AnimatePresence>

          {/* Animated Cursor */}
          {isPlaying && (
            <motion.div
              className="absolute pointer-events-none z-50"
              animate={{ x: cursorPos.x + '%', y: cursorPos.y + '%' }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              style={{ transform: 'translate(-50%, -50%)' }}
            >
              <div className="w-4 h-4 bg-white rounded-full shadow-lg" />
              <div className="w-3 h-3 bg-cyan-400 rounded-full absolute top-0.5 left-0.5 animate-ping" />
            </motion.div>
          )}

          {/* Description Overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4">
            <p className="text-white text-sm font-medium">{step.description}</p>
          </div>

          {/* Step Indicator */}
          <div className="absolute top-4 right-4 bg-black/50 rounded-full px-3 py-1">
            <span className="text-white text-sm">{currentStep + 1} / {steps.length}</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-1 bg-slate-800">
          <motion.div
            className="h-full bg-gradient-to-r from-cyan-500 to-purple-600"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Step Navigation */}
        <div className="p-4 bg-slate-800/30">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {steps.map((s, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setCurrentStep(i);
                    setProgress(0);
                    setTypedText('');
                    setShowCheck(false);
                  }}
                  className={`h-2 rounded-full transition-all ${
                    i === currentStep 
                      ? 'w-8 bg-gradient-to-r from-cyan-500 to-purple-600' 
                      : 'w-2 bg-white/20 hover:bg-white/40'
                  }`}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setCurrentStep(prev => prev === 0 ? steps.length - 1 : prev - 1);
                  setProgress(0);
                  setTypedText('');
                  setShowCheck(false);
                }}
                className="px-4 py-2 rounded-lg bg-slate-700 text-white text-sm hover:bg-slate-600 transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => {
                  setCurrentStep(prev => (prev + 1) % steps.length);
                  setProgress(0);
                  setTypedText('');
                  setShowCheck(false);
                }}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-600 text-white text-sm hover:opacity-90 transition-opacity"
              >
                {currentStep === steps.length - 1 ? 'Restart' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }
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
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-5"
            >
              {/* Premium Welcome Hero Section */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative overflow-hidden rounded-3xl"
              >
                {/* Animated Background with Particle Field */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
                  <LiveParticles count={20} />
                  
                  <motion.div
                    className="absolute inset-0"
                    style={{
                      background: 'radial-gradient(circle at 50% 50%, rgba(0, 212, 255, 0.15) 0%, transparent 50%)'
                    }}
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 0.8, 0.5]
                    }}
                    transition={{ duration: 4, repeat: Infinity }}
                  />
                  <motion.div
                    className="absolute inset-0"
                    style={{
                      background: 'radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.15) 0%, transparent 40%)'
                    }}
                    animate={{
                      scale: [1.2, 1, 1.2],
                      opacity: [0.3, 0.6, 0.3]
                    }}
                    transition={{ duration: 5, repeat: Infinity }}
                  />
                  <motion.div
                    className="absolute inset-0"
                    style={{
                      background: 'radial-gradient(circle at 20% 80%, rgba(16, 185, 129, 0.15) 0%, transparent 40%)'
                    }}
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [0.4, 0.7, 0.4]
                    }}
                    transition={{ duration: 6, repeat: Infinity }}
                  />
                </div>

                {/* Grid Pattern Overlay */}
                <div className="absolute inset-0 opacity-10" style={{
                  backgroundImage: 'linear-gradient(rgba(0, 212, 255, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 212, 255, 0.3) 1px, transparent 1px)',
                  backgroundSize: '50px 50px'
                }} />

                <div className="relative p-6 md:p-8">
                  {/* ===== PREMIUM TOP STATS BAR - BIG & BOLD ===== */}
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
                  >
                    {/* MAIN BALANCE - Big Card */}
                    <motion.div
                      whileHover={{ scale: 1.02, y: -4 }}
                      className="relative overflow-hidden rounded-3xl p-5 border-2 border-cyan-500/50"
                      style={{ 
                        background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.15) 0%, rgba(0, 0, 0, 0.8) 100%)',
                        boxShadow: '0 0 40px rgba(0, 212, 255, 0.2), inset 0 0 30px rgba(0, 212, 255, 0.05)'
                      }}
                    >
                      <motion.div
                        className="absolute top-0 left-0 w-full h-1.5"
                        style={{ background: 'linear-gradient(90deg, transparent, #00d4ff, #00ffe7, #00d4ff, transparent)' }}
                        animate={{ x: ['-100%', '100%'] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                      <div className="flex items-center gap-3 mb-3">
                        <motion.div
                          animate={{ rotateY: [0, 360] }}
                          transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                        >
                          <USDTCoin size={44} />
                        </motion.div>
                        <div>
                          <span className="text-cyan-300 text-sm font-bold tracking-wider">MAIN BALANCE</span>
                          <p className="text-gray-500 text-xs">Available for withdrawal</p>
                        </div>
                      </div>
                      <motion.p
                        key={(user?.balance || 0).toFixed(2)}
                        initial={{ scale: 1.1 }}
                        animate={{ scale: 1 }}
                        className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-cyan-400 to-blue-400"
                        style={{ textShadow: '0 0 40px rgba(0, 212, 255, 0.5)' }}
                      >
                        ${formatNumber(user?.balance || 0)}
                      </motion.p>
                      <p className="text-gray-400 text-sm mt-2">USDT</p>
                    </motion.div>

                    {/* ACTIVE INVESTMENT - Big Card */}
                    <motion.div
                      whileHover={{ scale: 1.02, y: -4 }}
                      className="relative overflow-hidden rounded-3xl p-5 border-2 border-purple-500/50"
                      style={{ 
                        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(0, 0, 0, 0.8) 100%)',
                        boxShadow: '0 0 40px rgba(139, 92, 246, 0.2), inset 0 0 30px rgba(139, 92, 246, 0.05)'
                      }}
                    >
                      <motion.div
                        className="absolute top-0 left-0 w-full h-1.5"
                        style={{ background: 'linear-gradient(90deg, transparent, #8b5cf6, #a78bfa, #8b5cf6, transparent)' }}
                        animate={{ x: ['-100%', '100%'] }}
                        transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
                      />
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-11 h-11 rounded-xl bg-purple-500/20 flex items-center justify-center">
                          <TrendingUp className="w-6 h-6 text-purple-400" />
                        </div>
                        <div>
                          <span className="text-purple-300 text-sm font-bold tracking-wider">ACTIVE INVESTMENT</span>
                          <p className="text-gray-500 text-xs">{miningStats.sessionsCount} active plan(s)</p>
                        </div>
                      </div>
                      <motion.p
                        key={miningStats.totalInvestment}
                        initial={{ scale: 1.1 }}
                        animate={{ scale: 1 }}
                        className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-purple-400 to-pink-400"
                        style={{ textShadow: '0 0 40px rgba(139, 92, 246, 0.5)' }}
                      >
                        ${formatNumber(miningStats.totalInvestment)}
                      </motion.p>
                      <p className="text-gray-400 text-sm mt-2">USDT Invested</p>
                    </motion.div>

                    {/* LIVE PER SECOND MINING - Big Card with Pulse */}
                    <motion.div
                      whileHover={{ scale: 1.02, y: -4 }}
                      animate={{
                        boxShadow: [
                          '0 0 30px rgba(16, 185, 129, 0.3), inset 0 0 20px rgba(16, 185, 129, 0.05)',
                          '0 0 60px rgba(16, 185, 129, 0.5), inset 0 0 40px rgba(16, 185, 129, 0.1)',
                          '0 0 30px rgba(16, 185, 129, 0.3), inset 0 0 20px rgba(16, 185, 129, 0.05)'
                        ]
                      }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="relative overflow-hidden rounded-3xl p-5 border-2 border-emerald-500/50"
                      style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(0, 0, 0, 0.8) 100%)' }}
                    >
                      <motion.div
                        className="absolute top-0 left-0 w-full h-1.5"
                        style={{ background: 'linear-gradient(90deg, transparent, #10b981, #34d399, #10b981, transparent)' }}
                        animate={{ x: ['-100%', '100%'] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      />
                      <div className="flex items-center gap-3 mb-3">
                        <div className="relative">
                          <div className="w-11 h-11 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                            <Activity className="w-6 h-6 text-emerald-400" />
                          </div>
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
                          </div>
                        </div>
                        <div>
                          <span className="text-emerald-300 text-sm font-bold tracking-wider">LIVE MINING</span>
                          <p className="text-gray-500 text-xs">Per second profit</p>
                        </div>
                      </div>
                      <motion.p
                        key={liveTotalProfitPerSecond.toFixed(6)}
                        initial={{ scale: 1.2, color: '#10b981' }}
                        animate={{ scale: 1, color: '#10b981' }}
                        className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-green-400 to-cyan-400"
                        style={{ textShadow: '0 0 40px rgba(16, 185, 129, 0.6)' }}
                      >
                        +${liveTotalProfitPerSecond.toFixed(6)}
                      </motion.p>
                      <p className="text-emerald-400 text-sm mt-2 font-medium">USDT / SECOND</p>
                    </motion.div>
                  </motion.div>

                  {/* Top Row with USDT Coins */}
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                    <div className="flex items-center gap-4">
                      {/* Animated USDT Coin Logo */}
                      <motion.div
                        animate={{ rotateY: [0, 360] }}
                        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                      >
                        <USDTCoin size={56} />
                      </motion.div>
                      <div>
                        <motion.p
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="text-gray-400 text-sm mb-1"
                        >
                          Welcome back,
                        </motion.p>
                        <motion.h1
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 }}
                          className="text-2xl md:text-3xl font-bold text-white"
                        >
                          <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                            Crypto Miner
                          </span>
                        </motion.h1>
                      </div>
                    </div>

                    {/* Live Status Badge with Hash Rate */}
                    <div className="flex items-center gap-3">
                      <motion.div
                        animate={{ boxShadow: ['0 0 15px rgba(0, 212, 255, 0.3)', '0 0 30px rgba(0, 212, 255, 0.5)', '0 0 15px rgba(0, 212, 255, 0.3)'] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-full"
                      >
                        <Flame className="w-4 h-4 text-cyan-400" />
                        <span className="text-cyan-400 font-semibold text-sm">{liveHashrate.toFixed(1)} TH/s</span>
                      </motion.div>
                      
                      <motion.div
                        animate={{ boxShadow: ['0 0 20px rgba(16, 185, 129, 0.3)', '0 0 40px rgba(16, 185, 129, 0.5)', '0 0 20px rgba(16, 185, 129, 0.3)'] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full"
                      >
                        <div className="relative">
                          <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full" />
                          <div className="absolute inset-0 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
                        </div>
                        <span className="text-emerald-400 font-semibold text-sm">MINING ACTIVE</span>
                      </motion.div>
                    </div>
                  </div>

                  {/* Main Balance Display with Floating Coins */}
                  <div className="text-center mb-6 relative">
                    {/* Floating Coins Around Balance */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      {[...Array(4)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute"
                          style={{
                            left: `${20 + i * 20}%`,
                            top: `${10 + (i % 2) * 60}%`,
                          }}
                          animate={{
                            y: [0, -20, 0],
                            rotateY: [0, 180, 360],
                            opacity: [0.3, 0.6, 0.3]
                          }}
                          transition={{
                            duration: 4 + i,
                            repeat: Infinity,
                            delay: i * 0.5
                          }}
                        >
                          <USDTCoin size={36} delay={i * 0.2} />
                        </motion.div>
                      ))}
                    </div>
                    
                    <p className="text-gray-400 text-sm mb-2">Total Mining Balance</p>
                    <motion.div
                      key={totalLiveEarned.toFixed(6)}
                      initial={{ scale: 1.02 }}
                      animate={{ scale: 1 }}
                      className="relative inline-block"
                    >
                      <span
                        className="text-5xl md:text-6xl font-black tracking-tight"
                        style={{
                          background: 'linear-gradient(135deg, #00ffe7, #00d4ff, #8b5cf6)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          filter: 'drop-shadow(0 0 30px rgba(0, 255, 231, 0.5))'
                        }}
                      >
                        ${((miningData?.totalEarned || 0) + totalLiveEarned || user?.miningBalance || 0).toFixed(2)}
                      </span>
                      <span className="text-2xl md:text-3xl font-bold text-gray-400 ml-2">USDT</span>
                    </motion.div>
                  </div>

                  {/* Live Profit Per Second with Enhanced Style */}
                  {liveTotalProfitPerSecond > 0 && (
                    <motion.div
                      animate={{
                        boxShadow: profitFlash
                          ? ['0 0 20px rgba(16, 185, 129, 0.5)', '0 0 40px rgba(16, 185, 129, 0.8)', '0 0 20px rgba(16, 185, 129, 0.5)']
                          : '0 0 20px rgba(16, 185, 129, 0.2)'
                      }}
                      transition={{ duration: 0.3 }}
                      className="flex items-center justify-center gap-6 py-4 px-6 bg-gradient-to-r from-emerald-500/10 via-green-500/5 to-emerald-500/10 rounded-2xl border border-emerald-500/20"
                    >
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-2 mb-1">
                          <USDTCoin size={24} />
                          <p className="text-gray-500 text-xs">LIVE PROFIT</p>
                        </div>
                        <motion.p
                          key={liveTotalProfitPerSecond.toFixed(6)}
                          initial={{ scale: 1.1, color: '#10b981' }}
                          animate={{ scale: 1, color: '#10b981' }}
                          className="text-2xl font-bold text-emerald-400"
                        >
                          +${liveTotalProfitPerSecond.toFixed(6)}
                        </motion.p>
                        <p className="text-gray-500 text-xs">per second</p>
                      </div>
                      <div className="w-px h-16 bg-gradient-to-b from-transparent via-emerald-500/30 to-transparent" />
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-2 mb-1">
                          <Diamond className="w-4 h-4 text-purple-400" />
                          <p className="text-gray-500 text-xs">SESSION EARNED</p>
                        </div>
                        <motion.p
                          key={totalLiveEarned.toFixed(4)}
                          initial={{ scale: 1.05 }}
                          animate={{ scale: 1 }}
                          className="text-2xl font-bold text-cyan-400"
                        >
                          +${totalLiveEarned.toFixed(4)}
                        </motion.p>
                        <p className="text-gray-500 text-xs">this session</p>
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>

              {/* Enhanced Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  {
                    label: 'Main Balance',
                    value: `$${formatNumber(user?.balance || 0)}`,
                    icon: Wallet,
                    gradient: 'from-cyan-500 to-blue-600',
                    bgGradient: 'from-cyan-500/10 to-blue-500/5',
                    borderColor: 'border-cyan-500/20',
                    textColor: 'text-cyan-400',
                    glow: 'rgba(0, 212, 255, 0.3)'
                  },
                  {
                    label: 'Total Invested',
                    value: `$${formatNumber(user?.totalInvested || 0)}`,
                    icon: TrendingUp,
                    gradient: 'from-green-500 to-emerald-600',
                    bgGradient: 'from-green-500/10 to-emerald-500/5',
                    borderColor: 'border-green-500/20',
                    textColor: 'text-green-400',
                    glow: 'rgba(34, 197, 94, 0.3)'
                  },
                  {
                    label: 'Total Profit',
                    value: `$${formatNumber(user?.totalProfit || 0)}`,
                    icon: Activity,
                    gradient: 'from-purple-500 to-violet-600',
                    bgGradient: 'from-purple-500/10 to-violet-500/5',
                    borderColor: 'border-purple-500/20',
                    textColor: 'text-purple-400',
                    glow: 'rgba(139, 92, 246, 0.3)'
                  },
                  {
                    label: 'Active Plans',
                    value: String(miningStats.sessionsCount),
                    icon: Zap,
                    gradient: 'from-amber-500 to-orange-600',
                    bgGradient: 'from-amber-500/10 to-orange-500/5',
                    borderColor: 'border-amber-500/20',
                    textColor: 'text-amber-400',
                    glow: 'rgba(245, 158, 11, 0.3)'
                  }
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    whileHover={{
                      scale: 1.02,
                      boxShadow: `0 0 30px ${stat.glow}`
                    }}
                    className={`relative overflow-hidden bg-gradient-to-br ${stat.bgGradient} p-4 rounded-2xl border ${stat.borderColor}`}
                  >
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center mb-3`}>
                      <stat.icon className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-gray-500 text-xs mb-1">{stat.label}</p>
                    <p className={`text-xl font-bold ${stat.textColor}`}>{stat.value}</p>
                  </motion.div>
                ))}
              </div>

              {/* PREMIUM LIVE MINING CENTER - Enhanced */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-3xl border border-white/10"
                style={{
                  background: 'linear-gradient(135deg, #0c0c1d 0%, #1a1a2e 50%, #16213e 100%)',
                }}
              >
                {/* Animated Background Effects */}
                <div className="absolute inset-0 overflow-hidden">
                  <LiveParticles count={30} />
                  <motion.div
                    className="absolute inset-0"
                    style={{
                      background: 'linear-gradient(45deg, transparent 30%, rgba(0, 212, 255, 0.05) 50%, transparent 70%)',
                      backgroundSize: '200% 200%'
                    }}
                    animate={{ backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'] }}
                    transition={{ duration: 4, repeat: Infinity }}
                  />
                  <FloatingCoinsBackground isActive={liveTotalProfitPerSecond > 0 || miningSessions.length > 0} />
                </div>

                <div className="relative p-5">
                  {/* Premium Header */}
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <NetworkPulseIndicator />
                      <div>
                        <h3 className="text-white font-bold text-lg flex items-center gap-2">
                          <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                            Live Mining Center
                          </span>
                          <motion.span
                            animate={{ scale: [1, 1.3, 1] }}
                            transition={{ duration: 0.8, repeat: Infinity }}
                            className="text-green-400 text-xs"
                          >●</motion.span>
                        </h3>
                        <p className="text-gray-400 text-xs">{miningStats.sessionsCount} active plan(s) • ${formatNumber(miningStats.totalInvestment)} total invested</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <motion.div
                        animate={{ boxShadow: ['0 0 8px rgba(0, 212, 255, 0.3)', '0 0 20px rgba(0, 212, 255, 0.5)', '0 0 8px rgba(0, 212, 255, 0.3)'] }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/30 rounded-full"
                      >
                        <Flame className="w-3.5 h-3.5 text-cyan-400" />
                        <span className="text-cyan-400 font-semibold text-xs">{liveHashrate.toFixed(1)} TH/s</span>
                      </motion.div>
                      <motion.div
                        animate={{ boxShadow: ['0 0 8px rgba(16, 185, 129, 0.3)', '0 0 20px rgba(16, 185, 129, 0.5)', '0 0 8px rgba(16, 185, 129, 0.3)'] }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-full"
                      >
                        <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                        <span className="text-emerald-400 font-semibold text-xs">LIVE</span>
                      </motion.div>
                    </div>
                  </div>

                  {/* GPU Mining Rig Visualization */}
                  <PremiumMiningRig gpuCount={Math.min(miningStats.sessionsCount + 3, 6)} isMining={miningSessions.length > 0} />

                  {/* Live Profit Display - Enhanced */}
                  <div className="relative mb-5 overflow-hidden rounded-2xl border border-white/5"
                       style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(20,20,40,0.3) 100%)' }}>
                    <FloatingCoinsBackground count={4} />
                    <div className="relative p-4 flex items-center justify-between">
                      {/* Left: Total Session Earned */}
                      <div className="flex items-center gap-3">
                        <motion.div
                          animate={{ rotate: [0, 360] }}
                          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                        >
                          <USDTCoin size={42} />
                        </motion.div>
                        <div>
                          <p className="text-gray-500 text-xs mb-0.5">Session Earnings</p>
                          <motion.p
                            key={totalLiveEarned.toFixed(4)}
                            initial={{ scale: 1.1 }}
                            animate={{ scale: 1 }}
                            className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-400 to-cyan-400"
                          >
                            +${totalLiveEarned.toFixed(4)}
                          </motion.p>
                        </div>
                      </div>

                      {/* Center: Live Profit Per Second */}
                      <div className="text-center px-4 border-x border-white/5">
                        <div className="flex items-center justify-center gap-2 mb-0.5">
                          <Diamond className="w-3.5 h-3.5 text-purple-400" />
                          <p className="text-gray-500 text-xs">LIVE PROFIT</p>
                        </div>
                        <motion.p
                          key={liveTotalProfitPerSecond.toFixed(6)}
                          initial={{ scale: 1.2, color: '#10b981' }}
                          animate={{ scale: 1, color: '#10b981' }}
                          className="text-xl font-bold text-green-400"
                        >
                          +${liveTotalProfitPerSecond.toFixed(6)}/sec
                        </motion.p>
                      </div>

                      {/* Right: Temperature & Power */}
                      <div className="flex items-center gap-3">
                        <div className="text-center">
                          <p className="text-gray-500 text-xs mb-0.5">GPU Temp</p>
                          <div className="flex items-center gap-1">
                            <Thermometer className="w-4 h-4 text-amber-400" />
                            <span className="text-amber-400 font-bold">65°C</span>
                          </div>
                        </div>
                        <div className="text-center">
                          <p className="text-gray-500 text-xs mb-0.5">Power</p>
                          <div className="flex items-center gap-1">
                            <Power className="w-4 h-4 text-green-400" />
                            <span className="text-green-400 font-bold">850W</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Mining Stats Grid - 6 Cards */}
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-5">
                    {[
                      { icon: Target, label: 'Daily', value: `$${formatNumber(miningStats.totalDailyProfit)}`, color: 'green' },
                      { icon: Rocket, label: 'Weekly', value: `$${formatNumber(miningStats.totalWeeklyProfit)}`, color: 'cyan' },
                      { icon: Sparkles, label: 'Monthly', value: `$${formatNumber(miningStats.totalMonthlyProfit)}`, color: 'purple' },
                      { icon: TrendingUp, label: 'ROI', value: `${miningStats.averageROI}%`, color: 'amber' },
                      { icon: Activity, label: 'Hashrate', value: `${liveHashrate.toFixed(1)} TH`, color: 'cyan' },
                      { icon: Users, label: 'Online', value: String(onlineVisitors), color: 'green' },
                    ].map((stat, i) => (
                      <motion.div
                        key={stat.label}
                        whileHover={{ scale: 1.03, y: -2 }}
                        className="relative overflow-hidden rounded-xl p-3 text-center border border-white/5 bg-black/30"
                      >
                        <motion.div
                          className="absolute top-0 left-0 w-full h-0.5"
                          style={{ background: `linear-gradient(90deg, transparent, ${stat.color === 'green' ? '#10b981' : stat.color === 'cyan' ? '#00d4ff' : stat.color === 'purple' ? '#8b5cf6' : '#f59e0b'}, transparent)` }}
                          animate={{ x: ['-100%', '100%'] }}
                          transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                        />
                        <stat.icon className={`w-4 h-4 mx-auto mb-1 ${stat.color === 'green' ? 'text-green-400' : stat.color === 'cyan' ? 'text-cyan-400' : stat.color === 'purple' ? 'text-purple-400' : 'text-amber-400'}`} />
                        <p className="text-gray-500 text-[10px] mb-0.5">{stat.label}</p>
                        <p className={`font-bold text-sm ${stat.color === 'green' ? 'text-green-400' : stat.color === 'cyan' ? 'text-cyan-400' : stat.color === 'purple' ? 'text-purple-400' : 'text-amber-400'}`}>{stat.value}</p>
                      </motion.div>
                    ))}
                  </div>

                  {/* Active Mining Sessions - Enhanced Cards */}
                  {miningSessions && miningSessions.length > 0 && (
                    <div className="space-y-3 mb-5">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-white font-bold text-sm">Active Mining Plans</h4>
                        <span className="text-xs text-cyan-400 font-medium">{miningSessions.length} Active</span>
                      </div>
                      {miningSessions.map((session, index) => {
                        const liveProfit = liveSessionProfits[session.id] || 0;
                        const timer = sessionTimers[session.id] || { days: 0, hours: 0, minutes: 0, seconds: 0 };
                        const isPro = session.planType === 'pro';

                        return (
                          <motion.div
                            key={session.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`relative overflow-hidden rounded-2xl border ${isPro ? 'border-purple-500/30 bg-purple-900/10' : 'border-cyan-500/30 bg-cyan-900/10'}`}
                          >
                            <motion.div
                              className="absolute inset-0"
                              animate={{ opacity: [0.3, 0.6, 0.3] }}
                              transition={{ duration: 3, repeat: Infinity }}
                              style={{ boxShadow: `inset 0 0 30px ${isPro ? 'rgba(139, 92, 246, 0.1)' : 'rgba(0, 212, 255, 0.1)'}` }}
                            />
                            <div className="relative p-4">
                              {/* Session Header */}
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2.5">
                                  <motion.div
                                    animate={{ boxShadow: [`0 0 8px ${isPro ? 'rgba(139, 92, 246, 0.4)' : 'rgba(0, 212, 255, 0.4)'}`, `0 0 20px ${isPro ? 'rgba(139, 92, 246, 0.6)' : 'rgba(0, 212, 255, 0.6)'}`, `0 0 8px ${isPro ? 'rgba(139, 92, 246, 0.4)' : 'rgba(0, 212, 255, 0.4)'}`] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${isPro ? 'bg-purple-500/20' : 'bg-cyan-500/20'}`}
                                  >
                                    {isPro ? <Crown className="w-5 h-5 text-purple-400" /> : <Zap className="w-5 h-5 text-cyan-400" />}
                                  </motion.div>
                                  <div>
                                    <h5 className="text-white font-bold text-sm">{session.planName}</h5>
                                    <span className={`text-xs font-medium ${isPro ? 'text-purple-400' : 'text-cyan-400'}`}>{session.dailyPercent}% Daily</span>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="flex items-center gap-1.5">
                                    <USDTCoin size={22} />
                                    <motion.p
                                      key={(session.totalEarned + liveProfit).toFixed(4)}
                                      initial={{ scale: 1.1 }}
                                      animate={{ scale: 1 }}
                                      className={`text-lg font-bold ${isPro ? 'text-purple-400' : 'text-cyan-400'}`}
                                    >
                                      +${(session.totalEarned + liveProfit).toFixed(4)}
                                    </motion.p>
                                  </div>
                                  <p className="text-gray-500 text-[10px]">total earned</p>
                                </div>
                              </div>

                              {/* Stats Row */}
                              <div className="grid grid-cols-4 gap-2 mb-3">
                                <div className="text-center p-2 rounded-lg bg-black/30">
                                  <p className="text-gray-500 text-[9px]">Invested</p>
                                  <p className="text-white font-bold text-xs">${session.investment}</p>
                                </div>
                                <div className="text-center p-2 rounded-lg bg-black/30">
                                  <p className="text-gray-500 text-[9px]">Daily</p>
                                  <p className="text-green-400 font-bold text-xs">${session.dailyProfit.toFixed(2)}</p>
                                </div>
                                <div className="text-center p-2 rounded-lg bg-black/30">
                                  <p className="text-gray-500 text-[9px]">Per Sec</p>
                                  <p className="text-cyan-400 font-bold text-xs">${(session.dailyProfit / 86400).toFixed(6)}</p>
                                </div>
                                <div className="text-center p-2 rounded-lg bg-black/30">
                                  <p className="text-gray-500 text-[9px]">Progress</p>
                                  <p className="text-amber-400 font-bold text-xs">{Math.round(session.progressPercent || 0)}%</p>
                                </div>
                              </div>

                              {/* Countdown Timer */}
                              <div className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-black/30 mb-3">
                                {[{ v: timer.days, l: 'D' }, { v: timer.hours, l: 'H' }, { v: timer.minutes, l: 'M' }, { v: timer.seconds, l: 'S' }].map((t, i) => (
                                  <div key={i} className="flex items-center gap-1">
                                    <motion.div
                                      className="rounded px-2 py-1 min-w-[32px] text-center bg-slate-800 border border-white/5"
                                      animate={t.l === 'S' ? { scale: [1, 0.95, 1] } : {}}
                                      transition={{ duration: 1, repeat: Infinity }}
                                    >
                                      <span className={`font-bold text-xs ${isPro ? 'text-purple-400' : 'text-cyan-400'}`}>{String(t.v).padStart(2, '0')}</span>
                                    </motion.div>
                                    {i < 3 && <span className="text-gray-600 font-bold text-xs">:</span>}
                                  </div>
                                ))}
                              </div>

                              {/* Progress Bar */}
                              <div className="relative h-2 rounded-full overflow-hidden bg-slate-800">
                                <motion.div
                                  className="absolute inset-y-0 left-0 rounded-full"
                                  style={{ width: `${session.progressPercent || 0}%`, background: isPro ? 'linear-gradient(90deg, #8b5cf6, #a78bfa)' : 'linear-gradient(90deg, #00d4ff, #22d3ee)' }}
                                  animate={{ opacity: [0.7, 1, 0.7] }}
                                  transition={{ duration: 2, repeat: Infinity }}
                                />
                              </div>
                              <div className="flex justify-between text-[9px] text-gray-500 mt-1.5">
                                <span>Start: {new Date(session.startedAt).toLocaleDateString()}</span>
                                <span>End: {new Date(session.expiresAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}

                  {/* No Active Mining - Show CTA */}
                  {(!miningSessions || miningSessions.length === 0) && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-8"
                    >
                      <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="mb-4"
                      >
                        <USDTCoin size={60} />
                      </motion.div>
                      <h4 className="text-white font-bold text-lg mb-2">No Active Mining Plans</h4>
                      <p className="text-gray-400 text-sm mb-4">Deposit USDT and activate a mining plan to start earning!</p>
                      <motion.button
                        onClick={() => setActiveTab('deposit')}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-6 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-bold text-sm"
                      >
                        Deposit Now
                      </motion.button>
                    </motion.div>
                  )}
                </div>
              </motion.div>

              {/* Available Mining Plans - Enhanced */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                    <Crown className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-white font-bold text-lg">Available Mining Plans</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Starter Plan */}
                  <motion.div
                    whileHover={{ scale: 1.02, boxShadow: '0 0 40px rgba(0, 212, 255, 0.3)' }}
                    className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 border-2 border-cyan-500/30 p-5"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl" />
                    <div className="relative">
                      <div className="flex items-center gap-3 mb-4">
                        <motion.div
                          animate={{ boxShadow: ['0 0 10px rgba(0, 212, 255, 0.3)', '0 0 25px rgba(0, 212, 255, 0.5)', '0 0 10px rgba(0, 212, 255, 0.3)'] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="w-14 h-14 rounded-xl bg-cyan-500/20 flex items-center justify-center"
                        >
                          <Zap className="w-7 h-7 text-cyan-400" />
                        </motion.div>
                        <div>
                          <h3 className="text-white font-bold text-xl">Starter Plan</h3>
                          <p className="text-gray-400 text-sm">Perfect for beginners</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3 mb-4">
                        <div className="text-center p-3 rounded-xl bg-black/30">
                          <p className="text-gray-500 text-xs mb-1">Daily Profit</p>
                          <p className="text-cyan-400 font-bold text-2xl">4%</p>
                        </div>
                        <div className="text-center p-3 rounded-xl bg-black/30">
                          <p className="text-gray-500 text-xs mb-1">Min Invest</p>
                          <p className="text-white font-bold text-2xl">$10</p>
                        </div>
                        <div className="text-center p-3 rounded-xl bg-black/30">
                          <p className="text-gray-500 text-xs mb-1">Total Return</p>
                          <p className="text-green-400 font-bold text-2xl">120%</p>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        {['30 Days Duration', 'Instant Profit Updates', '7% Referral Bonus', 'Auto Compound Option'].map((feature, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-cyan-400" />
                            <span className="text-gray-300">{feature}</span>
                          </div>
                        ))}
                      </div>

                      <motion.button
                        onClick={() => {
                          if ((user?.balance || 0) >= 10) {
                            setSelectedPlan('starter');
                            setInvestmentAmount('');
                            setPlanModalError(null);
                            setShowPlanModal(true);
                          }
                        }}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={(user?.balance || 0) < 10}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-600 text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        <Zap className="w-5 h-5" />
                        {(user?.balance || 0) >= 10 ? 'Start Mining Now' : 'Deposit Required'}
                      </motion.button>
                    </div>
                  </motion.div>

                  {/* Pro Plan */}
                  <motion.div
                    whileHover={{ scale: 1.02, boxShadow: '0 0 40px rgba(139, 92, 246, 0.3)' }}
                    className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 border-2 border-purple-500/30 p-5"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl" />
                    <div className="absolute top-4 right-4 px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-white text-xs font-bold shadow-lg animate-pulse">
                      PRO
                    </div>
                    <div className="relative">
                      <div className="flex items-center gap-3 mb-4">
                        <motion.div
                          animate={{ boxShadow: ['0 0 10px rgba(139, 92, 246, 0.3)', '0 0 25px rgba(139, 92, 246, 0.5)', '0 0 10px rgba(139, 92, 246, 0.3)'] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="w-14 h-14 rounded-xl bg-purple-500/20 flex items-center justify-center"
                        >
                          <Crown className="w-7 h-7 text-purple-400" />
                        </motion.div>
                        <div>
                          <h3 className="text-white font-bold text-xl">Pro Plan</h3>
                          <p className="text-gray-400 text-sm">Maximum returns</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3 mb-4">
                        <div className="text-center p-3 rounded-xl bg-black/30">
                          <p className="text-gray-500 text-xs mb-1">Daily Profit</p>
                          <p className="text-purple-400 font-bold text-2xl">4.5%</p>
                        </div>
                        <div className="text-center p-3 rounded-xl bg-black/30">
                          <p className="text-gray-500 text-xs mb-1">Min Invest</p>
                          <p className="text-white font-bold text-2xl">$100</p>
                        </div>
                        <div className="text-center p-3 rounded-xl bg-black/30">
                          <p className="text-gray-500 text-xs mb-1">Total Return</p>
                          <p className="text-green-400 font-bold text-2xl">135%</p>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        {['30 Days Duration', 'Higher Profit Rate', 'Priority Support', 'Exclusive Features'].map((feature, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-purple-400" />
                            <span className="text-gray-300">{feature}</span>
                          </div>
                        ))}
                      </div>

                      <motion.button
                        onClick={() => {
                          if ((user?.balance || 0) >= 100) {
                            setSelectedPlan('pro');
                            setInvestmentAmount('');
                            setPlanModalError(null);
                            setShowPlanModal(true);
                          }
                        }}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={(user?.balance || 0) < 100}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        <Crown className="w-5 h-5" />
                        {(user?.balance || 0) >= 100 ? 'Start Pro Mining' : 'Deposit Required'}
                      </motion.button>
                    </div>
                  </motion.div>
                </div>
              </motion.div>

              {/* Network Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-3"
              >
                {[
                  { label: 'Network Hashrate', value: `${liveHashrate.toFixed(1)} TH/s`, color: 'cyan' },
                  { label: 'Online Miners', value: String(onlineVisitors), color: 'green' },
                  { label: 'Block Height', value: '19,845,231', color: 'purple' },
                  { label: 'Network Fee', value: '0.001 USDT', color: 'amber' }
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-slate-800/50 rounded-xl p-3 border border-white/5"
                  >
                    <p className="text-gray-500 text-xs">{stat.label}</p>
                    <p className={`text-lg font-bold text-${stat.color}-400`}>{stat.value}</p>
                  </motion.div>
                ))}
              </motion.div>

            </motion.div>
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
                  <p className="text-gray-400 text-sm">Send USDT (BEP20) to activate your mining plan</p>
                </div>
              </div>

              {/* Step 1: Deposit Address */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-white/10 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-full bg-cyan-500 text-white text-xs font-bold flex items-center justify-center">1</div>
                  <span className="text-white font-semibold">Send USDT to this address</span>
                </div>
                <div className="bg-slate-800/80 rounded-xl p-4 mb-3 relative group border border-white/5">
                  <div className="text-gray-400 text-xs mb-2">Deposit Address (BEP20 Network)</div>
                  <div className="flex items-center gap-2">
                    <div className="text-cyan-400 font-mono text-sm break-all flex-1">
                      {depositWallet}
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(depositWallet);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className="p-2.5 bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-lg hover:from-cyan-400 hover:to-cyan-500 transition-all"
                    >
                      {copied ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4 text-white" />}
                    </button>
                  </div>
                </div>
                <div className="flex items-start gap-2 text-amber-400 text-xs bg-amber-500/10 rounded-lg p-3">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>Only send USDT (BEP20/BSC) to this address. Sending other tokens may result in permanent loss.</span>
                </div>
              </div>

              {/* Step 2: Submit Deposit Details */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-white/10 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 rounded-full bg-green-500 text-white text-xs font-bold flex items-center justify-center">2</div>
                  <span className="text-white font-semibold">Submit deposit details</span>
                </div>

                {depositSuccess && (
                  <div className="mb-4 p-3 bg-green-500/20 border border-green-500/30 rounded-xl flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-green-400 text-sm">{depositSuccess}</span>
                  </div>
                )}

                {depositError && (
                  <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-400" />
                    <span className="text-red-400 text-sm">{depositError}</span>
                  </div>
                )}

                <form onSubmit={async (e) => {
                  e.preventDefault();
                  if (!depositAmount || parseFloat(depositAmount) < 10) {
                    setDepositError('Minimum deposit is 10 USDT');
                    return;
                  }
                  if (!depositTxHash || depositTxHash.trim() === '') {
                    setDepositError('Please enter transaction hash');
                    return;
                  }
                  setDepositLoading(true);
                  setDepositError(null);
                  try {
                    const res = await fetch('/api/deposit', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        amount: parseFloat(depositAmount),
                        txHash: depositTxHash.trim(),
                        screenshotUrl: depositScreenshot
                      })
                    });
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.error || 'Deposit failed');
                    setDepositSuccess('Deposit submitted successfully! Awaiting admin approval.');
                    setDepositAmount('');
                    setDepositTxHash('');
                    setDepositScreenshot(null);
                    fetchUserData();
                  } catch (err) {
                    setDepositError(err instanceof Error ? err.message : 'Deposit failed');
                  } finally {
                    setDepositLoading(false);
                  }
                }} className="space-y-4">
                  {/* Amount Input */}
                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">Deposit Amount (USDT)</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input
                        type="number"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        placeholder="Minimum 10 USDT"
                        className="w-full bg-slate-800/80 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none transition-colors"
                        min="10"
                        step="0.01"
                      />
                    </div>
                  </div>

                  {/* Transaction Hash Input */}
                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">Transaction Hash (TXID)</label>
                    <div className="relative">
                      <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input
                        type="text"
                        value={depositTxHash}
                        onChange={(e) => setDepositTxHash(e.target.value)}
                        placeholder="Enter your transaction hash"
                        className="w-full bg-slate-800/80 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none transition-colors font-mono text-sm"
                      />
                    </div>
                    <p className="text-gray-500 text-xs mt-1">Enter the transaction hash from your wallet (Admin will verify manually)</p>
                  </div>

                  {/* Screenshot Upload */}
                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">Payment Screenshot (Optional)</label>
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setDepositScreenshot(reader.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="hidden"
                        id="screenshot-upload"
                      />
                      <label
                        htmlFor="screenshot-upload"
                        className="flex items-center justify-center gap-2 w-full bg-slate-800/80 border border-dashed border-white/20 rounded-xl py-4 cursor-pointer hover:border-cyan-500 transition-colors"
                      >
                        {depositScreenshot ? (
                          <>
                            <CheckCircle className="w-5 h-5 text-green-400" />
                            <span className="text-green-400 text-sm">Screenshot uploaded</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-5 h-5 text-gray-500" />
                            <span className="text-gray-500 text-sm">Click to upload screenshot</span>
                          </>
                        )}
                      </label>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <motion.button
                    type="submit"
                    disabled={depositLoading || !depositAmount || !depositTxHash}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {depositLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Submit Deposit
                      </>
                    )}
                  </motion.button>
                </form>
              </div>

              {/* Recent Deposits */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-white/10 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-semibold">Your Recent Deposits</h3>
                  <span className="text-xs text-gray-500">Last 5 deposits</span>
                </div>
                {userDeposits && userDeposits.length > 0 ? (
                  <div className="space-y-2">
                    {userDeposits.slice(0, 5).map((dep) => (
                      <div key={dep.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl border border-white/5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                            <ArrowDownRight className="w-5 h-5 text-green-400" />
                          </div>
                          <div>
                            <div className="text-white font-medium">${formatNumber(dep.amount)} USDT</div>
                            <div className="text-gray-500 text-xs font-mono">{dep.txHash.slice(0, 10)}...{dep.txHash.slice(-6)}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            dep.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                            dep.status === 'pending' ? 'bg-amber-500/20 text-amber-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {dep.status.charAt(0).toUpperCase() + dep.status.slice(1)}
                          </span>
                          <div className="text-gray-500 text-xs mt-1">
                            {new Date(dep.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Coins className="w-10 h-10 text-gray-600 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">No deposits yet</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Plans Tab */}
          {activeTab === 'plans' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-5"
            >
              {/* Active Mining Sessions */}
              {miningSessions && miningSessions.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      Your Active Plans
                      <div className="relative ml-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full" />
                        <div className="absolute inset-0 w-2 h-2 bg-green-400 rounded-full animate-ping" />
                      </div>
                    </h3>
                    <div className="text-right">
                      <span className="text-xs text-cyan-400 font-medium">{miningSessions.length} Active</span>
                      <span className="text-xs text-green-400 block">+${liveTotalProfitPerSecond.toFixed(6)}/sec</span>
                    </div>
                  </div>
                  {miningSessions.map((session, index) => {
                    const liveProfit = liveSessionProfits[session.id] || 0;
                    const profitPerSecond = session.dailyProfit / 86400;
                    return (
                      <motion.div
                        key={session.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-gradient-to-br from-slate-900 to-slate-800 border border-white/10 rounded-2xl p-4 relative overflow-hidden"
                      >
                        <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl" />
                        <div className="relative">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                session.planType === 'pro' ? 'bg-purple-500/20' : 'bg-cyan-500/20'
                              }`}>
                                {session.planType === 'pro' ? (
                                  <Crown className="w-4 h-4 text-purple-400" />
                                ) : (
                                  <Zap className="w-4 h-4 text-cyan-400" />
                                )}
                              </div>
                              <div>
                                <span className="text-white font-semibold">{session.planName}</span>
                                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${
                                  session.planType === 'pro' ? 'bg-purple-500/20 text-purple-400' : 'bg-cyan-500/20 text-cyan-400'
                                }`}>
                                  {session.dailyPercent}% Daily
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <motion.div 
                                key={(session.totalEarned + liveProfit).toFixed(4)}
                                initial={{ scale: 1.1 }}
                                animate={{ scale: 1 }}
                                className="text-green-400 font-bold text-sm"
                              >
                                +${(session.totalEarned + liveProfit).toFixed(4)}
                              </motion.div>
                              <div className="text-cyan-400 text-xs">${profitPerSecond.toFixed(6)}/sec</div>
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-2 mb-3 text-center">
                            <div className="bg-slate-800/50 rounded-lg p-2">
                              <div className="text-gray-400 text-xs">Investment</div>
                              <div className="text-white font-bold">${formatNumber(session.investment)}</div>
                            </div>
                            <div className="bg-slate-800/50 rounded-lg p-2">
                              <div className="text-gray-400 text-xs">Daily Profit</div>
                              <div className="text-green-400 font-bold">${formatNumber(session.dailyProfit)}</div>
                            </div>
                            <div className="bg-slate-800/50 rounded-lg p-2">
                              <div className="text-gray-400 text-xs">Remaining</div>
                              <div className="text-cyan-400 font-bold text-sm">
                                {(() => {
                                  const timer = sessionTimers[session.id];
                                  if (timer) {
                                    return `${timer.days}d ${timer.hours}h ${timer.minutes}m`;
                                  }
                                  return `${session.remainingTime?.days || 0}d ${session.remainingTime?.hours || 0}h`;
                                })()}
                              </div>
                            </div>
                          </div>

                          {/* Countdown Timer */}
                          {sessionTimers[session.id] && (
                            <div className="flex items-center justify-center gap-1 mb-3">
                              {[
                                { value: sessionTimers[session.id].days, label: 'd' },
                                { value: sessionTimers[session.id].hours, label: 'h' },
                                { value: sessionTimers[session.id].minutes, label: 'm' },
                                { value: sessionTimers[session.id].seconds, label: 's' },
                              ].map((item, i) => (
                                <div key={i} className="flex items-center gap-0.5">
                                  <motion.div
                                    className="bg-slate-700/50 rounded px-1.5 py-0.5 text-center min-w-[24px]"
                                    animate={item.label === 's' ? { scale: [1, 0.95, 1] } : {}}
                                    transition={{ duration: 1, repeat: Infinity }}
                                  >
                                    <span className="text-white font-bold text-xs">{String(item.value).padStart(2, '0')}</span>
                                  </motion.div>
                                  {i < 3 && <span className="text-gray-600 text-xs">:</span>}
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Progress Bar */}
                          <div className="h-2 rounded-full overflow-hidden bg-slate-800">
                            <motion.div
                              className="h-full rounded-full"
                            style={{
                              background: session.planType === 'pro'
                                ? 'linear-gradient(90deg, #8b5cf6, #a78bfa)'
                                : 'linear-gradient(90deg, #00d4ff, #22d3ee)',
                              width: `${session.progressPercent || 0}%`
                            }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>Started: {new Date(session.startedAt).toLocaleDateString()}</span>
                          <span>Expires: {new Date(session.expiresAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </motion.div>
                  );
                  })}
                </div>
              )}

              {/* Professional Plan Purchase Section */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-white/10 rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-cyan-500/5 to-purple-500/5 rounded-full blur-3xl" />
                
                {/* Header with Balance */}
                <div className="relative mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <Zap className="w-5 h-5 text-cyan-400" />
                      Invest in Mining Plan
                    </h2>
                    <div className="text-right">
                      <div className="text-gray-400 text-xs">Available Balance</div>
                      <div className="text-2xl font-bold text-green-400">${formatNumber(user?.balance || 0)}</div>
                    </div>
                  </div>
                  
                  {(user?.balance || 0) < 10 && (
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />
                      <div>
                        <div className="text-amber-400 font-medium text-sm">Insufficient Balance</div>
                        <div className="text-gray-400 text-xs">Deposit at least 10 USDT to start mining</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Plan Selection Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {/* Starter Plan Card */}
                  <motion.div
                    onClick={() => {
                      if ((user?.balance || 0) >= 10) {
                        setSelectedPlan('starter');
                        setInvestmentAmount('');
                        setPlanModalError(null);
                        setShowPlanModal(true);
                      }
                    }}
                    whileHover={{ scale: (user?.balance || 0) >= 10 ? 1.02 : 1 }}
                    className={`relative rounded-2xl p-5 cursor-pointer transition-all ${
                      (user?.balance || 0) >= 10
                        ? 'bg-gradient-to-br from-cyan-500/10 to-slate-900 border-2 border-cyan-500/30 hover:border-cyan-500/60'
                        : 'bg-slate-800/50 border border-white/5 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl" />
                    <div className="relative">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-14 h-14 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                          <Zap className="w-7 h-7 text-cyan-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-white">Starter Plan</h3>
                          <div className="flex items-center gap-2">
                            <span className="text-cyan-400 font-bold text-lg">4%</span>
                            <span className="text-gray-400 text-sm">daily profit</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Min Investment</span>
                          <span className="text-white font-medium">10 USDT</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Duration</span>
                          <span className="text-white font-medium">30 Days</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Total Return</span>
                          <span className="text-green-400 font-bold">120%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Total Profit</span>
                          <span className="text-green-400 font-medium">+20%</span>
                        </div>
                      </div>
                      
                      <div className="h-px bg-white/10 my-3" />
                      
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-500">
                          Perfect for beginners
                        </div>
                        <div className="px-3 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 text-sm font-medium">
                          Select Plan →
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Pro Plan Card */}
                  <motion.div
                    onClick={() => {
                      if ((user?.balance || 0) >= 100) {
                        setSelectedPlan('pro');
                        setInvestmentAmount('');
                        setPlanModalError(null);
                        setShowPlanModal(true);
                      }
                    }}
                    whileHover={{ scale: (user?.balance || 0) >= 100 ? 1.02 : 1 }}
                    className={`relative rounded-2xl p-5 cursor-pointer transition-all ${
                      (user?.balance || 0) >= 100
                        ? 'bg-gradient-to-br from-purple-500/10 to-slate-900 border-2 border-purple-500/30 hover:border-purple-500/60'
                        : 'bg-slate-800/50 border border-white/5 opacity-50 cursor-not-allowed'
                    }`}
                    style={{ boxShadow: (user?.balance || 0) >= 100 ? '0 0 40px rgba(139, 92, 246, 0.15)' : 'none' }}
                  >
                    <div className="absolute top-3 right-3">
                      <span className="px-2 py-1 bg-purple-500 text-white text-xs font-bold rounded-full">RECOMMENDED</span>
                    </div>
                    <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl" />
                    <div className="relative">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-14 h-14 rounded-xl bg-purple-500/20 flex items-center justify-center">
                          <Crown className="w-7 h-7 text-purple-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-white">Pro Plan</h3>
                          <div className="flex items-center gap-2">
                            <span className="text-purple-400 font-bold text-lg">4.5%</span>
                            <span className="text-gray-400 text-sm">daily profit</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Min Investment</span>
                          <span className="text-white font-medium">100 USDT</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Duration</span>
                          <span className="text-white font-medium">30 Days</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Total Return</span>
                          <span className="text-green-400 font-bold">135%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Total Profit</span>
                          <span className="text-green-400 font-medium">+35%</span>
                        </div>
                      </div>
                      
                      <div className="h-px bg-white/10 my-3" />
                      
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-500">
                          Maximum returns
                        </div>
                        <div className="px-3 py-1.5 rounded-lg bg-purple-500/20 text-purple-400 text-sm font-medium">
                          Select Plan →
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Investment Calculator */}
                <div className="bg-slate-800/50 rounded-xl p-4 border border-white/5">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-4 h-4 text-cyan-400" />
                    <span className="text-white font-medium">Quick Calculator</span>
                  </div>
                  <div className="text-gray-400 text-sm mb-2">
                    Example: If you invest <span className="text-cyan-400 font-medium">$100</span> in <span className="text-purple-400 font-medium">Pro Plan</span>:
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div className="bg-slate-700/50 rounded-lg p-2">
                      <div className="text-gray-500 text-xs">Daily</div>
                      <div className="text-green-400 font-bold text-sm">$4.50</div>
                    </div>
                    <div className="bg-slate-700/50 rounded-lg p-2">
                      <div className="text-gray-500 text-xs">Weekly</div>
                      <div className="text-green-400 font-bold text-sm">$31.50</div>
                    </div>
                    <div className="bg-slate-700/50 rounded-lg p-2">
                      <div className="text-gray-500 text-xs">Monthly</div>
                      <div className="text-green-400 font-bold text-sm">$135</div>
                    </div>
                    <div className="bg-slate-700/50 rounded-lg p-2">
                      <div className="text-gray-500 text-xs">Profit</div>
                      <div className="text-green-400 font-bold text-sm">+$35</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Professional Plan Purchase Modal */}
          <AnimatePresence>
            {showPlanModal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4"
                onClick={() => setShowPlanModal(false)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.9, opacity: 0, y: 20 }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-gradient-to-br from-slate-900 to-slate-800 border border-white/10 rounded-3xl w-full max-w-lg relative overflow-hidden"
                  style={{ boxShadow: selectedPlan === 'pro' ? '0 0 60px rgba(139, 92, 246, 0.3)' : '0 0 60px rgba(0, 212, 255, 0.3)' }}
                >
                  {/* Background Effects */}
                  <div className="absolute inset-0 overflow-hidden">
                    <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl ${
                      selectedPlan === 'pro' ? 'bg-purple-500/20' : 'bg-cyan-500/20'
                    }`} />
                    <div className={`absolute bottom-0 left-0 w-48 h-48 rounded-full blur-3xl ${
                      selectedPlan === 'pro' ? 'bg-purple-500/10' : 'bg-cyan-500/10'
                    }`} />
                  </div>
                  
                  {/* Close Button */}
                  <button
                    onClick={() => setShowPlanModal(false)}
                    className="absolute top-4 right-4 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 transition-colors z-10"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>

                  <div className="relative p-6">
                    {/* Plan Header */}
                    <div className="text-center mb-6">
                      <div className={`w-20 h-20 rounded-2xl mx-auto mb-4 flex items-center justify-center ${
                        selectedPlan === 'pro' ? 'bg-purple-500/20' : 'bg-cyan-500/20'
                      }`}>
                        {selectedPlan === 'pro' ? (
                          <Crown className="w-10 h-10 text-purple-400" />
                        ) : (
                          <Zap className="w-10 h-10 text-cyan-400" />
                        )}
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-1">
                        {selectedPlan === 'pro' ? 'Pro Plan' : 'Starter Plan'}
                      </h3>
                      <div className="flex items-center justify-center gap-2">
                        <span className={`text-2xl font-bold ${
                          selectedPlan === 'pro' ? 'text-purple-400' : 'text-cyan-400'
                        }`}>
                          {selectedPlan === 'pro' ? '4.5%' : '4%'}
                        </span>
                        <span className="text-gray-400">Daily Profit • 30 Days</span>
                      </div>
                    </div>

                    {/* Error Message */}
                    {planModalError && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-xl flex items-center gap-2"
                      >
                        <AlertCircle className="w-5 h-5 text-red-400" />
                        <span className="text-red-400 text-sm">{planModalError}</span>
                      </motion.div>
                    )}

                    {/* Investment Input */}
                    <div className="mb-4">
                      <label className="text-gray-400 text-sm mb-2 block">Enter Investment Amount</label>
                      <div className="relative">
                        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-500" />
                        <input
                          type="number"
                          value={investmentAmount}
                          onChange={(e) => setInvestmentAmount(e.target.value)}
                          placeholder="0.00"
                          className="w-full bg-slate-800/80 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-gray-600 focus:border-cyan-500 focus:outline-none transition-colors text-3xl font-bold text-center"
                          min={selectedPlan === 'pro' ? 100 : 10}
                          step="0.01"
                          autoFocus
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">USDT</div>
                      </div>
                      <div className="flex justify-between mt-2 text-sm">
                        <span className="text-gray-500">Min: {selectedPlan === 'pro' ? '100' : '10'} USDT</span>
                        <button 
                          onClick={() => setInvestmentAmount((user?.balance || 0).toString())}
                          className="text-cyan-400 hover:text-cyan-300"
                        >
                          Max: {formatNumber(user?.balance || 0)} USDT
                        </button>
                      </div>
                    </div>

                    {/* Quick Amount Buttons */}
                    <div className="flex gap-2 mb-4">
                      {[10, 50, 100, 250, 500].map((amt) => (
                        <button
                          key={amt}
                          onClick={() => setInvestmentAmount(amt.toString())}
                          className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
                            investmentAmount === amt.toString()
                              ? selectedPlan === 'pro' 
                                ? 'bg-purple-500 text-white' 
                                : 'bg-cyan-500 text-white'
                              : 'bg-slate-800 text-gray-400 hover:bg-slate-700'
                          }`}
                        >
                          ${amt}
                        </button>
                      ))}
                    </div>

                    {/* Live Calculator */}
                    {investmentAmount && !isNaN(parseFloat(investmentAmount)) && parseFloat(investmentAmount) > 0 && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-slate-800/50 rounded-2xl p-4 border border-white/5 mb-4"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-gray-400 text-sm">Investment Summary</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            selectedPlan === 'pro' ? 'bg-purple-500/20 text-purple-400' : 'bg-cyan-500/20 text-cyan-400'
                          }`}>
                            {selectedPlan === 'pro' ? 'Pro Plan' : 'Starter Plan'}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="bg-slate-700/30 rounded-xl p-3 text-center">
                            <div className="text-gray-500 text-xs mb-1">You Invest</div>
                            <div className="text-white font-bold text-lg">${formatNumber(parseFloat(investmentAmount))}</div>
                          </div>
                          <div className="bg-green-500/10 rounded-xl p-3 text-center border border-green-500/20">
                            <div className="text-gray-500 text-xs mb-1">Total Return</div>
                            <div className="text-green-400 font-bold text-lg">
                              ${formatNumber(parseFloat(investmentAmount) * (selectedPlan === 'pro' ? 1.35 : 1.2))}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Daily Profit</span>
                            <span className="text-green-400 font-medium">
                              +${formatNumber(parseFloat(investmentAmount) * (selectedPlan === 'pro' ? 0.045 : 0.04))}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Weekly Profit</span>
                            <span className="text-green-400 font-medium">
                              +${formatNumber(parseFloat(investmentAmount) * (selectedPlan === 'pro' ? 0.045 : 0.04) * 7)}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Monthly Profit (30 Days)</span>
                            <span className="text-green-400 font-bold">
                              +${formatNumber(parseFloat(investmentAmount) * (selectedPlan === 'pro' ? 0.045 : 0.04) * 30)}
                            </span>
                          </div>
                          <div className="h-px bg-white/10 my-2" />
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Profit per Second</span>
                            <span className="text-cyan-400 font-mono text-xs">
                              +${((parseFloat(investmentAmount) * (selectedPlan === 'pro' ? 0.045 : 0.04)) / 86400).toFixed(6)}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Balance Info */}
                    <div className="bg-slate-800/30 rounded-xl p-3 mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Wallet className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-400 text-sm">Your Balance</span>
                      </div>
                      <span className="text-green-400 font-bold">${formatNumber(user?.balance || 0)} USDT</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => setShowPlanModal(false)}
                        className="flex-1 py-4 rounded-xl bg-slate-800 text-gray-400 font-medium hover:bg-slate-700 transition-colors"
                      >
                        Cancel
                      </button>
                      <motion.button
                        onClick={handleStartMining}
                        disabled={startMiningLoading !== null || !investmentAmount || parseFloat(investmentAmount) < (selectedPlan === 'pro' ? 100 : 10)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`flex-1 py-4 rounded-xl text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all ${
                          selectedPlan === 'pro'
                            ? 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-400 hover:to-purple-500'
                            : 'bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500'
                        }`}
                      >
                        {startMiningLoading ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Zap className="w-5 h-5" />
                            Confirm Investment
                          </>
                        )}
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

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
        <div className="max-w-7xl mx-auto px-4 text-center flex items-center justify-center gap-4">
          <p className="text-gray-600 text-xs">© 2025 USDT Mining Lab. All rights reserved.</p>
          <a 
            href="https://t.me/usdtmininglab" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 rounded-full transition-all"
          >
            <svg className="w-4 h-4 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
            </svg>
            <span className="text-blue-400 text-xs font-medium">Join Telegram</span>
          </a>
        </div>
      </footer>

      {/* Floating Telegram Button */}
      <a 
        href="https://t.me/usdtmininglab" 
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed bottom-24 right-4 z-50 lg:bottom-8 flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300"
        title="Join Telegram Group"
      >
        <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
        </svg>
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
        </span>
      </a>

      <style jsx>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
        @keyframes slide-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-slide-left {
          animation: slide-left 20s linear infinite;
        }
        .animate-slide-left:hover {
          animation-play-state: paused;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.5);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 212, 255, 0.3);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 212, 255, 0.5);
        }
      `}</style>
    </div>
  );
}
// Cache bust: 1773868729
