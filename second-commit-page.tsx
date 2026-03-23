'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wallet, TrendingUp, Users, Shield, Zap, 
  Menu, X, Copy, Check, Clock, DollarSign, Gift, 
  LogOut, LayoutDashboard, Settings as SettingsIcon,
  ArrowUpRight, ArrowDownRight, RefreshCw,
  Timer, Percent, Calendar, AlertCircle, CheckCircle2,
  Eye, EyeOff, Hash, Pickaxe, Globe, ChevronDown,
  Headphones, ArrowUp, Play, History, Key, User,
  ChevronRight, WalletCards, Landmark, Coins
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

interface Transaction {
  id: string;
  type: string;
  amount: number;
  status: string;
  description: string | null;
  createdAt: string;
}

interface Referral {
  id: string;
  level: number;
  commission: number;
  referred: {
    walletAddress: string;
    createdAt: string;
  };
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
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showTransactionsModal, setShowTransactionsModal] = useState(false);
  const [calculatorAmount, setCalculatorAmount] = useState<string>('1000');
  const [showPin, setShowPin] = useState(false);
  const [showNewPin, setShowNewPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);
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
  const [settingsForm, setSettingsForm] = useState({ currentPin: '', newPin: '', confirmPin: '' });
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
      register: `${name} just joined Usdt Mining Lab`
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

  // Fetch transactions
  const fetchTransactions = async () => {
    try {
      const res = await fetch('/api/user/transactions');
      if (res.ok) {
        const data = await res.json();
        setTransactions(data.transactions);
      }
    } catch {
      // Handle error
    }
  };

  // Fetch referrals
  const fetchReferrals = async () => {
    try {
      const res = await fetch('/api/user/referrals');
      if (res.ok) {
        const data = await res.json();
        setReferrals(data.referrals);
      }
    } catch {
      // Handle error
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
      const res = await fetch('/api/auth/wallet-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: walletInput })
      });

      const data = await res.json();

      if (data.exists) {
        setUser(data.user);
        setMiningData(data.mining);
        if (data.mining) {
          setRealTimeBalance(data.mining.totalEarned);
        }
        setShowWalletModal(false);
        setSuccess('Welcome back!');
      } else {
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
      setSuccess('Account created successfully! Welcome to Usdt Mining Lab!');
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
    setActiveSection('home');
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
      fetchUserData();
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

  // Settings handler
  const handleSettingsUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (settingsForm.newPin !== settingsForm.confirmPin) {
      setError('New PINs do not match');
      setIsLoading(false);
      return;
    }

    if (settingsForm.newPin.length !== 4) {
      setError('New PIN must be 4 digits');
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/user/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPin: settingsForm.currentPin,
          newPin: settingsForm.newPin
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Settings update failed');
      }

      setShowSettingsModal(false);
      setSuccess('PIN updated successfully!');
      setSettingsForm({ currentPin: '', newPin: '', confirmPin: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Settings update failed');
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

  // Clear messages
  useEffect(() => {
    if (error) setTimeout(() => setError(null), 5000);
    if (success) setTimeout(() => setSuccess(null), 5000);
  }, [error, success]);

  // Load data when modals open
  useEffect(() => {
    if (showTransactionsModal) fetchTransactions();
    if (activeSection === 'referral') fetchReferrals();
  }, [showTransactionsModal, activeSection]);

  return (
    <div className="min-h-screen bg-white flex flex-col">
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

      {/* Toast Messages */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50"
          >
            <div className="bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              {error}
            </div>
          </motion.div>
        )}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50"
          >
            <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              {success}
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
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#26a17b] to-[#f59e0b] flex items-center justify-center shadow-lg ring-2 ring-white/30">
                <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H11.1v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.24c.1 1.7 1.36 2.66 2.86 2.97V19h2.13v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.65-3.42z"/>
                </svg>
              </div>
              <div>
                <span className="text-white font-bold text-lg">Usdt Mining Lab</span>
                <p className="text-white/70 text-xs">Premium Cloud Mining</p>
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
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      activeSection === 'dashboard' 
                        ? 'bg-white/20 text-white' 
                        : 'text-white hover:bg-white/10'
                    }`}
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() => setShowSettingsModal(true)}
                    className="px-4 py-2 text-white hover:bg-white/10 rounded-lg text-sm font-medium transition-all"
                  >
                    Settings
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
                {user && (
                  <>
                    <button
                      onClick={() => {
                        setActiveSection('dashboard');
                        setIsMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-3 rounded-lg text-white hover:bg-white/10 text-sm font-medium transition-all"
                    >
                      Dashboard
                    </button>
                    <button
                      onClick={() => {
                        setShowSettingsModal(true);
                        setIsMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-3 rounded-lg text-white hover:bg-white/10 text-sm font-medium transition-all"
                    >
                      Settings
                    </button>
                  </>
                )}
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

      <main className="flex-1">
        {/* Dashboard Section */}
        {user && activeSection === 'dashboard' && (
          <section className="py-8 px-4 bg-gray-50">
            <div className="max-w-7xl mx-auto">
              {/* Dashboard Header */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Welcome back!</h1>
                  <p className="text-gray-600 mt-1">
                    Wallet: {user.walletAddress.slice(0, 6)}...{user.walletAddress.slice(-4)}
                  </p>
                </div>
                <div className="flex gap-3 mt-4 md:mt-0">
                  <button
                    onClick={() => setShowDepositModal(true)}
                    className="px-6 py-2 bg-gradient-to-r from-[#7c3aed] to-[#f59e0b] text-white rounded-lg font-medium flex items-center gap-2"
                  >
                    <ArrowDownRight className="w-4 h-4" />
                    Deposit
                  </button>
                  <button
                    onClick={() => setShowWithdrawModal(true)}
                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium flex items-center gap-2 hover:bg-gray-300"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                    Withdraw
                  </button>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-[#7c3aed]/10 flex items-center justify-center">
                      <Wallet className="w-5 h-5 text-[#7c3aed]" />
                    </div>
                    <span className="text-gray-500 text-sm">Balance</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">${formatNumber(user.balance)}</div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-[#f59e0b]/10 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-[#f59e0b]" />
                    </div>
                    <span className="text-gray-500 text-sm">Total Profit</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">${formatNumber(user.totalProfit)}</div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <Gift className="w-5 h-5 text-green-600" />
                    </div>
                    <span className="text-gray-500 text-sm">Referral Earnings</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">${formatNumber(user.referralEarnings)}</div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                      <Users className="w-5 h-5 text-purple-600" />
                    </div>
                    <span className="text-gray-500 text-sm">Referral Code</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-gray-900">{user.referralCode}</span>
                    <button
                      onClick={() => copyToClipboard(user.referralCode)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-gray-400" />}
                    </button>
                  </div>
                </motion.div>
              </div>

              {/* Mining Status Card */}
              {miningData && miningData.status === 'active' ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-br from-[#7c3aed] to-[#f59e0b] rounded-3xl p-8 mb-8"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                        <span className="text-white/80 text-sm font-medium">MINING ACTIVE</span>
                      </div>
                      <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                        ${formatNumber(realTimeBalance, 6)}
                      </h2>
                      <p className="text-white/70">Real-time mining profit</p>
                    </div>
                    <div className="mt-6 md:mt-0 grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-white">{miningTimer.days}</div>
                        <div className="text-white/60 text-sm">Days</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-white">{miningTimer.hours}</div>
                        <div className="text-white/60 text-sm">Hours</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-white">{miningTimer.minutes}</div>
                        <div className="text-white/60 text-sm">Minutes</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-white">{miningTimer.seconds}</div>
                        <div className="text-white/60 text-sm">Seconds</div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/20">
                    <div>
                      <div className="text-white/60 text-sm">Investment</div>
                      <div className="text-xl font-bold text-white">${formatNumber(miningData.investment)}</div>
                    </div>
                    <div>
                      <div className="text-white/60 text-sm">Daily Profit</div>
                      <div className="text-xl font-bold text-white">${formatNumber(miningData.dailyProfit)}</div>
                    </div>
                    <div>
                      <div className="text-white/60 text-sm">Total Earned</div>
                      <div className="text-xl font-bold text-white">${formatNumber(miningData.totalEarned)}</div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-3xl p-8 mb-8 border-2 border-dashed border-gray-200 text-center"
                >
                  <Pickaxe className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No Active Mining</h3>
                  <p className="text-gray-500 mb-6">Deposit USDT to start mining and earn 4% daily profit</p>
                  <button
                    onClick={() => setShowDepositModal(true)}
                    className="px-8 py-3 bg-gradient-to-r from-[#7c3aed] to-[#f59e0b] text-white font-medium rounded-xl"
                  >
                    Start Mining Now
                  </button>
                </motion.div>
              )}

              {/* Quick Actions */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button
                  onClick={() => setShowDepositModal(true)}
                  className="bg-white rounded-xl p-4 flex items-center gap-3 hover:shadow-md transition-all border border-gray-100"
                >
                  <div className="w-10 h-10 rounded-full bg-[#7c3aed]/10 flex items-center justify-center">
                    <ArrowDownRight className="w-5 h-5 text-[#7c3aed]" />
                  </div>
                  <span className="font-medium text-gray-900">Deposit</span>
                </button>
                <button
                  onClick={() => setShowWithdrawModal(true)}
                  className="bg-white rounded-xl p-4 flex items-center gap-3 hover:shadow-md transition-all border border-gray-100"
                >
                  <div className="w-10 h-10 rounded-full bg-[#f59e0b]/10 flex items-center justify-center">
                    <ArrowUpRight className="w-5 h-5 text-[#f59e0b]" />
                  </div>
                  <span className="font-medium text-gray-900">Withdraw</span>
                </button>
                <button
                  onClick={() => setShowTransactionsModal(true)}
                  className="bg-white rounded-xl p-4 flex items-center gap-3 hover:shadow-md transition-all border border-gray-100"
                >
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <History className="w-5 h-5 text-green-600" />
                  </div>
                  <span className="font-medium text-gray-900">History</span>
                </button>
                <button
                  onClick={() => setShowSettingsModal(true)}
                  className="bg-white rounded-xl p-4 flex items-center gap-3 hover:shadow-md transition-all border border-gray-100"
                >
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <SettingsIcon className="w-5 h-5 text-purple-600" />
                  </div>
                  <span className="font-medium text-gray-900">Settings</span>
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Hero Section - DogeLab Style */}
        {activeSection === 'home' && (
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
                  Enter your BEP20 wallet address to start mining today.
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
                        value={walletInput}
                        onChange={(e) => setWalletInput(e.target.value)}
                        placeholder="Enter your BEP20 wallet address"
                        className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder-white/50 focus:outline-none focus:border-white/60"
                      />
                    </div>
                    <button
                      onClick={() => {
                        if (user) {
                          setShowDepositModal(true);
                        } else {
                          handleWalletConnect();
                        }
                      }}
                      disabled={isLoading}
                      className="px-8 py-4 bg-gradient-to-r from-[#7c3aed] to-[#f59e0b] text-white font-semibold rounded-xl hover:opacity-90 transition-all disabled:opacity-50"
                    >
                      {isLoading ? 'Loading...' : user ? 'START MINING' : 'CONNECT WALLET'}
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
        )}

        {/* Statistics Section - DogeLab Style */}
        {activeSection === 'home' && (
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
        )}

        {/* Working Process Section - DogeLab Style */}
        {(activeSection === 'home' || activeSection === 'about') && (
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
                    title: 'Enter Wallet',
                    description: 'Enter your USDT BEP20 wallet address to login or register'
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
        )}

        {/* Mining Plan Section */}
        {(activeSection === 'home' || activeSection === 'mining') && (
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
        )}

        {/* Calculator Section */}
        {(activeSection === 'home' || activeSection === 'calculator') && (
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
        )}

        {/* Deposit Section */}
        {(activeSection === 'home' || activeSection === 'deposit') && (
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
                  {/* Left Side - Wallet Address & Instructions */}
                  <div>
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Deposit Wallet Address</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={DEPOSIT_WALLET}
                          readOnly
                          className="flex-1 px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 font-mono text-xs"
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
                      <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-yellow-50 border-2 border-yellow-400">
                        <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center text-sm font-bold text-white">B</div>
                        <div>
                          <span className="font-bold text-gray-900">BEP20</span>
                          <span className="text-gray-600 ml-1">(BNB Smart Chain)</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-4">
                      <div className="flex gap-3">
                        <AlertCircle className="w-6 h-6 text-red-600 shrink-0" />
                        <div>
                          <p className="font-bold text-red-700">⚠️ IMPORTANT</p>
                          <p className="text-sm text-red-600 mt-1">
                            Only send <strong>USDT</strong> on <strong>BEP20</strong> network. Other networks will result in PERMANENT loss of funds!
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#7c3aed]/5 border border-[#7c3aed]/20 rounded-xl p-4">
                      <h4 className="font-bold text-gray-900 mb-2">📋 Deposit Instructions:</h4>
                      <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                        <li>Copy the wallet address above</li>
                        <li>Send USDT via BEP20 network</li>
                        <li>Click "Submit Deposit" below</li>
                        <li>Enter amount and transaction hash</li>
                        <li>Wait for admin approval</li>
                      </ol>
                    </div>
                  </div>

                  {/* Right Side - QR Code */}
                  <div className="flex flex-col items-center justify-center">
                    <div className="bg-white p-6 rounded-2xl border-2 border-[#7c3aed]/20 shadow-lg mb-4">
                      <div className="w-56 h-56 bg-white flex items-center justify-center rounded-xl">
                        {/* QR Code Image */}
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${DEPOSIT_WALLET}&bgcolor=ffffff&color=7c3aed`}
                          alt="Deposit QR Code"
                          className="w-48 h-48"
                        />
                      </div>
                    </div>
                    <p className="text-gray-600 font-medium">📱 Scan QR code to deposit</p>
                    <p className="text-xs text-gray-400 mt-1">USDT BEP20 Only</p>
                    
                    {/* Quick Copy Button */}
                    <button
                      onClick={() => copyToClipboard(DEPOSIT_WALLET)}
                      className="mt-4 px-6 py-2 bg-gradient-to-r from-[#7c3aed] to-[#f59e0b] text-white rounded-lg font-medium flex items-center gap-2 hover:opacity-90 transition-all"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {copied ? 'Copied!' : 'Copy Address'}
                    </button>
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
        )}

        {/* Withdraw Section */}
        {(activeSection === 'home' || activeSection === 'withdraw') && (
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
                {user ? (
                  <div className="max-w-md mx-auto">
                    <div className="mb-6 p-4 bg-white rounded-xl border border-gray-200">
                      <div className="text-sm text-gray-500 mb-1">Available Balance</div>
                      <div className="text-2xl font-bold text-[#7c3aed]">${formatNumber(user.balance)}</div>
                    </div>

                    <button
                      onClick={() => setShowWithdrawModal(true)}
                      className="w-full py-4 bg-gradient-to-r from-[#7c3aed] to-[#f59e0b] text-white font-semibold rounded-xl hover:opacity-90 transition-all"
                    >
                      Request Withdrawal
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <Wallet className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500 mb-6">Connect your wallet to withdraw funds</p>
                    <button
                      onClick={() => setShowWalletModal(true)}
                      className="px-8 py-4 bg-gradient-to-r from-[#7c3aed] to-[#f59e0b] text-white font-semibold rounded-xl hover:opacity-90 transition-all"
                    >
                      Connect Wallet
                    </button>
                  </div>
                )}
              </motion.div>
            </div>
          </section>
        )}

        {/* Referral Section */}
        {activeSection === 'referral' && (
          <section id="referral" className="py-16 px-4 bg-gray-50">
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-12"
              >
                <span className="inline-block bg-[#7c3aed] text-white text-sm font-medium px-4 py-2 rounded-full mb-4">
                  Referral Program
                </span>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Earn 5% - 2% - 1% Commission
                </h2>
                <p className="text-gray-600">
                  Invite friends and earn commission on their deposits
                </p>
              </motion.div>

              {user ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="space-y-6"
                >
                  {/* Referral Link */}
                  <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Your Referral Link</h3>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={`https://usdtmining.io/ref/${user.referralCode}`}
                        readOnly
                        className="flex-1 px-4 py-3 rounded-xl bg-gray-50 border border-gray-200"
                      />
                      <button
                        onClick={() => copyToClipboard(`https://usdtmining.io/ref/${user.referralCode}`)}
                        className="px-4 py-3 bg-[#7c3aed] text-white rounded-xl hover:bg-[#6d28d9] transition-all"
                      >
                        {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Commission Levels */}
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-[#7c3aed] to-[#a855f7] rounded-2xl p-6 text-center">
                      <div className="text-4xl font-bold text-white mb-2">5%</div>
                      <div className="text-white/80">Level 1</div>
                      <div className="text-white/60 text-sm mt-2">Direct referrals</div>
                    </div>
                    <div className="bg-gradient-to-br from-[#a855f7] to-[#f59e0b] rounded-2xl p-6 text-center">
                      <div className="text-4xl font-bold text-white mb-2">2%</div>
                      <div className="text-white/80">Level 2</div>
                      <div className="text-white/60 text-sm mt-2">Referrals of referrals</div>
                    </div>
                    <div className="bg-gradient-to-br from-[#f59e0b] to-[#f97316] rounded-2xl p-6 text-center">
                      <div className="text-4xl font-bold text-white mb-2">1%</div>
                      <div className="text-white/80">Level 3</div>
                      <div className="text-white/60 text-sm mt-2">Extended network</div>
                    </div>
                  </div>

                  {/* Referral Stats */}
                  <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Your Referrals</h3>
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="text-center p-4 bg-gray-50 rounded-xl">
                        <div className="text-2xl font-bold text-[#7c3aed]">
                          {referrals.filter(r => r.level === 1).length}
                        </div>
                        <div className="text-sm text-gray-500">Level 1</div>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-xl">
                        <div className="text-2xl font-bold text-[#7c3aed]">
                          {referrals.filter(r => r.level === 2).length}
                        </div>
                        <div className="text-sm text-gray-500">Level 2</div>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-xl">
                        <div className="text-2xl font-bold text-[#7c3aed]">
                          {referrals.filter(r => r.level === 3).length}
                        </div>
                        <div className="text-sm text-gray-500">Level 3</div>
                      </div>
                    </div>
                    <div className="p-4 bg-[#7c3aed]/5 rounded-xl">
                      <div className="text-sm text-gray-500 mb-1">Total Earnings</div>
                      <div className="text-2xl font-bold text-[#7c3aed]">${formatNumber(user.referralEarnings)}</div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="bg-white rounded-2xl p-8 text-center">
                  <Users className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500 mb-6">Connect your wallet to access the referral program</p>
                  <button
                    onClick={() => setShowWalletModal(true)}
                    className="px-8 py-4 bg-gradient-to-r from-[#7c3aed] to-[#f59e0b] text-white font-semibold rounded-xl hover:opacity-90 transition-all"
                  >
                    Connect Wallet
                  </button>
                </div>
              )}
            </div>
          </section>
        )}

        {/* FAQ Section */}
        {activeSection === 'faq' && (
          <section id="faq" className="py-16 px-4 bg-white">
            <div className="max-w-4xl mx-auto">
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
              </motion.div>

              <div className="space-y-4">
                {[
                  {
                    q: 'What is Shiba Mining Lab?',
                    a: 'Shiba Mining Lab is a cloud mining platform that allows you to earn passive income through USDT mining on the BNB Smart Chain network.'
                  },
                  {
                    q: 'How much can I earn?',
                    a: 'You earn 4% daily profit on your investment. Over 30 days, this totals 120% return. For example, a $1000 investment yields $40 daily and $1200 total profit.'
                  },
                  {
                    q: 'What is the minimum deposit?',
                    a: 'The minimum deposit is $10 USDT. There is no maximum limit for investments.'
                  },
                  {
                    q: 'How does the referral program work?',
                    a: 'Share your referral link and earn commissions on 3 levels: 5% for direct referrals, 2% for level 2, and 1% for level 3 referrals.'
                  },
                  {
                    q: 'How long does withdrawal take?',
                    a: 'Withdrawal requests are processed within 24-48 hours after admin approval.'
                  },
                  {
                    q: 'Which network should I use for deposits?',
                    a: 'Only use BEP20 (BNB Smart Chain) network for deposits. Other networks will result in permanent loss of funds.'
                  }
                ].map((faq, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gray-50 rounded-2xl p-6"
                  >
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{faq.q}</h3>
                    <p className="text-gray-600">{faq.a}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[#7c3aed] text-white py-12 px-4 mt-auto">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#26a17b] to-[#f59e0b] flex items-center justify-center shadow-lg ring-2 ring-white/30">
                  <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H11.1v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.24c.1 1.7 1.36 2.66 2.86 2.97V19h2.13v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.65-3.42z"/>
                  </svg>
                </div>
                <span className="font-bold text-lg">Usdt Mining Lab</span>
              </div>
              <p className="text-white/70 text-sm">
                The next generation cloud mining platform for passive income through USDT mining.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-white/70 text-sm">
                <li>
                  <button 
                    onClick={() => {
                      setActiveSection('home');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }} 
                    className="hover:text-white transition-colors"
                  >
                    Home
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => {
                      setActiveSection('about');
                      document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
                    }} 
                    className="hover:text-white transition-colors"
                  >
                    About
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => {
                      setActiveSection('mining');
                      document.getElementById('mining')?.scrollIntoView({ behavior: 'smooth' });
                    }} 
                    className="hover:text-white transition-colors"
                  >
                    Mining Plan
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => {
                      setActiveSection('faq');
                      document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' });
                    }} 
                    className="hover:text-white transition-colors"
                  >
                    FAQ
                  </button>
                </li>
              </ul>
            </div>

            {/* Services */}
            <div>
              <h4 className="font-bold mb-4">Services</h4>
              <ul className="space-y-2 text-white/70 text-sm">
                <li>
                  <button 
                    onClick={() => {
                      setActiveSection('deposit');
                      document.getElementById('deposit')?.scrollIntoView({ behavior: 'smooth' });
                    }} 
                    className="hover:text-white transition-colors"
                  >
                    Deposit
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => {
                      setActiveSection('withdraw');
                      document.getElementById('withdraw')?.scrollIntoView({ behavior: 'smooth' });
                    }} 
                    className="hover:text-white transition-colors"
                  >
                    Withdraw
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => {
                      setActiveSection('referral');
                      document.getElementById('referral')?.scrollIntoView({ behavior: 'smooth' });
                    }} 
                    className="hover:text-white transition-colors"
                  >
                    Referral
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => {
                      setActiveSection('calculator');
                      document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth' });
                    }} 
                    className="hover:text-white transition-colors"
                  >
                    Calculator
                  </button>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-bold mb-4">Support</h4>
              <ul className="space-y-3 text-white/70 text-sm">
                <li className="flex items-center gap-2">
                  <Headphones className="w-4 h-4 text-[#f59e0b]" />
                  <span>24/7 Live Support</span>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#f59e0b]" />
                  <span>support@usdtmining.io</span>
                </li>
                <li>
                  <a 
                    href="https://t.me/usdtmininglab" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 hover:text-white transition-colors"
                  >
                    <svg className="w-4 h-4 text-[#f59e0b]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .37z"/>
                    </svg>
                    <span>Telegram Group</span>
                  </a>
                </li>
                <li>
                  <a 
                    href="https://t.me/usdtmininglab" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 mt-2 px-4 py-2 bg-[#f59e0b] text-white rounded-lg text-xs font-medium hover:bg-[#f59e0b]/90 transition-colors"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .37z"/>
                    </svg>
                    Join Telegram
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/20 pt-8 text-center text-white/60 text-sm">
            © 2024 Usdt Mining Lab. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Wallet Modal */}
      <Dialog open={showWalletModal} onOpenChange={setShowWalletModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-bold">Connect Wallet</DialogTitle>
            <DialogDescription className="text-center">
              Enter your BEP20 wallet address to login or register
            </DialogDescription>
          </DialogHeader>
          <div className="p-4">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Wallet Address</label>
              <div className="relative">
                <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={walletInput}
                  onChange={(e) => setWalletInput(e.target.value)}
                  placeholder="0x..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/20"
                />
              </div>
            </div>
            <button
              onClick={handleWalletConnect}
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-[#7c3aed] to-[#f59e0b] text-white font-semibold rounded-xl hover:opacity-90 transition-all disabled:opacity-50"
            >
              {isLoading ? 'Loading...' : 'Continue'}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Setup Modal */}
      <Dialog open={showSetupModal} onOpenChange={setShowSetupModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-bold">Create Account</DialogTitle>
            <DialogDescription className="text-center">
              Set up your security PIN to complete registration
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSetupAccount} className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Security PIN (4 digits)</label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPin ? 'text' : 'password'}
                  value={setupForm.securityPin}
                  onChange={(e) => setSetupForm({...setupForm, securityPin: e.target.value.replace(/\D/g, '').slice(0, 4)})}
                  placeholder="****"
                  maxLength={4}
                  className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirm PIN</label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={setupForm.confirmPasswordPin}
                  onChange={(e) => setSetupForm({...setupForm, confirmPasswordPin: e.target.value.replace(/\D/g, '').slice(0, 4)})}
                  placeholder="****"
                  maxLength={4}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Referral Code (Optional)</label>
              <input
                type="text"
                value={setupForm.referralCode}
                onChange={(e) => setSetupForm({...setupForm, referralCode: e.target.value.toUpperCase()})}
                placeholder="Enter referral code"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/20"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-[#7c3aed] to-[#f59e0b] text-white font-semibold rounded-xl hover:opacity-90 transition-all disabled:opacity-50"
            >
              {isLoading ? 'Creating...' : 'Create Account'}
            </button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Deposit Modal */}
      <Dialog open={showDepositModal} onOpenChange={setShowDepositModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-bold">💰 Deposit USDT</DialogTitle>
            <DialogDescription className="text-center">
              Send USDT via BEP20 network to start mining
            </DialogDescription>
          </DialogHeader>
          <div className="p-4 space-y-4">
            {/* QR Code Section */}
            <div className="flex flex-col items-center bg-gray-50 rounded-xl p-4">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${DEPOSIT_WALLET}&bgcolor=ffffff&color=7c3aed`}
                alt="Deposit QR Code"
                className="w-36 h-36"
              />
              <p className="text-sm text-gray-500 mt-2">Scan to get wallet address</p>
            </div>

            {/* Wallet Address */}
            <div className="bg-[#7c3aed]/5 rounded-xl p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Deposit Wallet Address</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={DEPOSIT_WALLET}
                  readOnly
                  className="flex-1 px-3 py-2 rounded-lg bg-white border border-gray-200 font-mono text-xs"
                />
                <button
                  type="button"
                  onClick={() => copyToClipboard(DEPOSIT_WALLET)}
                  className="px-3 py-2 bg-[#7c3aed] text-white rounded-lg hover:bg-[#6d28d9] transition-all"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Warning */}
            <div className="bg-red-50 border border-red-200 rounded-xl p-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <p className="text-sm text-red-700 font-medium">
                  ⚠️ Only send USDT on BEP20 network!
                </p>
              </div>
            </div>

            <form onSubmit={handleDeposit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount (USDT)</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    value={depositForm.amount}
                    onChange={(e) => setDepositForm({...depositForm, amount: e.target.value})}
                    placeholder="Minimum $10"
                    min="10"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/20"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Transaction Hash</label>
                <input
                  type="text"
                  value={depositForm.txHash}
                  onChange={(e) => setDepositForm({...depositForm, txHash: e.target.value})}
                  placeholder="0x..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/20 font-mono text-sm"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-[#7c3aed] to-[#f59e0b] text-white font-semibold rounded-xl hover:opacity-90 transition-all disabled:opacity-50"
              >
                {isLoading ? 'Submitting...' : 'Submit Deposit'}
              </button>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      {/* Withdraw Modal */}
      <Dialog open={showWithdrawModal} onOpenChange={setShowWithdrawModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-bold">Withdraw USDT</DialogTitle>
            <DialogDescription className="text-center">
              Available: ${formatNumber(user?.balance || 0)}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleWithdraw} className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Amount (USDT)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  value={withdrawForm.amount}
                  onChange={(e) => setWithdrawForm({...withdrawForm, amount: e.target.value})}
                  placeholder="Minimum $10"
                  min="10"
                  max={user?.balance || 0}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/20"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Wallet Address</label>
              <input
                type="text"
                value={withdrawForm.walletAddress}
                onChange={(e) => setWithdrawForm({...withdrawForm, walletAddress: e.target.value})}
                placeholder="0x..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/20"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Security PIN</label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={withdrawForm.pin}
                  onChange={(e) => setWithdrawForm({...withdrawForm, pin: e.target.value.replace(/\D/g, '').slice(0, 4)})}
                  placeholder="****"
                  maxLength={4}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/20"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-[#7c3aed] to-[#f59e0b] text-white font-semibold rounded-xl hover:opacity-90 transition-all disabled:opacity-50"
            >
              {isLoading ? 'Processing...' : 'Request Withdrawal'}
            </button>
          </form>
        </DialogContent>
      </Dialog>

      {/* PIN Verification Modal */}
      <Dialog open={showPinModal} onOpenChange={setShowPinModal}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold">Confirm Withdrawal</DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <p className="text-center text-gray-600 mb-4">
              Withdraw ${pendingWithdraw?.amount} USDT to {pendingWithdraw?.walletAddress.slice(0, 6)}...{pendingWithdraw?.walletAddress.slice(-4)}?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowPinModal(false);
                  setPendingWithdraw(null);
                }}
                className="flex-1 py-3 bg-gray-200 text-gray-700 font-medium rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={confirmWithdraw}
                disabled={isLoading}
                className="flex-1 py-3 bg-gradient-to-r from-[#7c3aed] to-[#f59e0b] text-white font-medium rounded-xl disabled:opacity-50"
              >
                {isLoading ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Settings Modal */}
      <Dialog open={showSettingsModal} onOpenChange={setShowSettingsModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-bold">Settings</DialogTitle>
            <DialogDescription className="text-center">
              Update your account security settings
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSettingsUpdate} className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Current PIN</label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={settingsForm.currentPin}
                  onChange={(e) => setSettingsForm({...settingsForm, currentPin: e.target.value.replace(/\D/g, '').slice(0, 4)})}
                  placeholder="****"
                  maxLength={4}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/20"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">New PIN</label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showNewPin ? 'text' : 'password'}
                  value={settingsForm.newPin}
                  onChange={(e) => setSettingsForm({...settingsForm, newPin: e.target.value.replace(/\D/g, '').slice(0, 4)})}
                  placeholder="****"
                  maxLength={4}
                  className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/20"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPin(!showNewPin)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showNewPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New PIN</label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={settingsForm.confirmPin}
                  onChange={(e) => setSettingsForm({...settingsForm, confirmPin: e.target.value.replace(/\D/g, '').slice(0, 4)})}
                  placeholder="****"
                  maxLength={4}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/20"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-[#7c3aed] to-[#f59e0b] text-white font-semibold rounded-xl hover:opacity-90 transition-all disabled:opacity-50"
            >
              {isLoading ? 'Updating...' : 'Update PIN'}
            </button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Transactions History Modal */}
      <Dialog open={showTransactionsModal} onOpenChange={setShowTransactionsModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-bold">Transaction History</DialogTitle>
          </DialogHeader>
          <div className="p-4 max-h-96 overflow-y-auto">
            {transactions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <History className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No transactions yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        tx.type === 'deposit' ? 'bg-green-100 text-green-600' :
                        tx.type === 'withdrawal' ? 'bg-red-100 text-red-600' :
                        tx.type === 'mining_profit' ? 'bg-[#7c3aed]/10 text-[#7c3aed]' :
                        'bg-[#f59e0b]/10 text-[#f59e0b]'
                      }`}>
                        {tx.type === 'deposit' ? <ArrowDownRight className="w-5 h-5" /> :
                         tx.type === 'withdrawal' ? <ArrowUpRight className="w-5 h-5" /> :
                         tx.type === 'mining_profit' ? <TrendingUp className="w-5 h-5" /> :
                         <Gift className="w-5 h-5" />}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 capitalize">{tx.type.replace('_', ' ')}</div>
                        <div className="text-xs text-gray-500">{new Date(tx.createdAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-bold ${tx.type === 'withdrawal' ? 'text-red-600' : 'text-green-600'}`}>
                        {tx.type === 'withdrawal' ? '-' : '+'}${formatNumber(tx.amount)}
                      </div>
                      <div className={`text-xs px-2 py-0.5 rounded ${
                        tx.status === 'completed' ? 'bg-green-100 text-green-600' :
                        tx.status === 'pending' ? 'bg-yellow-100 text-yellow-600' :
                        'bg-red-100 text-red-600'
                      }`}>
                        {tx.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Import Mail icon for footer
function Mail({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}
