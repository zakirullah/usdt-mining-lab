'use client';

import { useState, useEffect } from 'react';
import { 
  ArrowDownRight, ArrowUpRight, Users, Clock, Shield, 
  AlertCircle, CheckCircle, Settings, MessageSquare, RefreshCw,
  DollarSign, Activity, Power, LogOut
} from 'lucide-react';

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminWallet, setAdminWallet] = useState('');
  const [adminPin, setAdminPin] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [userData, setUserData] = useState<any>(null);

  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState<any>(null);
  const [deposits, setDeposits] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [miningSessions, setMiningSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Settings state
  const [depositWallet, setDepositWallet] = useState('0x33cb374635ab51fc669c1849b21b589a17475fc3');
  const [minDeposit, setMinDeposit] = useState('10');
  const [minWithdraw, setMinWithdraw] = useState('10');

  // Broadcast state
  const [broadcastMessage, setBroadcastMessage] = useState('');

  // Admin Login
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: adminWallet, pin: adminPin })
      });

      const data = await res.json();

      if (!res.ok) {
        setAuthError(data.error || 'Login failed');
        return;
      }

      if (data.user.role !== 'admin') {
        setAuthError('Access denied. Admin privileges required.');
        return;
      }

      setUserData(data.user);
      setIsAuthenticated(true);
      localStorage.setItem('admin_session', JSON.stringify(data.user));
      fetchAllData();
    } catch (err) {
      console.error(err);
      setAuthError('Login failed. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Fetch all data
  const fetchAllData = async () => {
    setLoading(true);
    try {
      // Fetch stats
      const statsRes = await fetch('/api/stats');
      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data);
      }

      // Fetch activities (deposits, withdrawals, users)
      const activitiesRes = await fetch('/api/activities');
      if (activitiesRes.ok) {
        const data = await activitiesRes.json();
        setDeposits(data.deposits || []);
        setWithdrawals(data.withdrawals || []);
        setUsers(data.users || []);
      }

      // Fetch admin data
      const adminRes = await fetch('/api/admin');
      if (adminRes.ok) {
        const data = await adminRes.json();
        setMiningSessions(data.miningSessions || []);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  // Admin action
  const adminAction = async (action: string, id: string, extraData?: any) => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, id, data: extraData })
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result.error || 'Action failed');
        return;
      }

      setSuccess(result.message || 'Action completed');
      fetchAllData();
    } catch (err) {
      console.error(err);
      setError('Action failed');
    } finally {
      setLoading(false);
    }
  };

  // Update settings
  const updateSettings = async () => {
    setSuccess('Settings saved (demo)');
  };

  // Send broadcast
  const sendBroadcast = async () => {
    if (!broadcastMessage.trim()) return;
    setSuccess('Broadcast sent (demo)');
    setBroadcastMessage('');
  };

  // Clear messages
  useEffect(() => {
    if (success) setTimeout(() => setSuccess(''), 5000);
    if (error) setTimeout(() => setError(''), 5000);
  }, [success, error]);

  // Check for existing session
  useEffect(() => {
    const existingSession = localStorage.getItem('admin_session');
    if (existingSession) {
      try {
        const user = JSON.parse(existingSession);
        if (user.role === 'admin') {
          setUserData(user);
          setIsAuthenticated(true);
          fetchAllData();
        }
      } catch (e) {
        localStorage.removeItem('admin_session');
      }
    }
  }, []);

  // Logout
  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserData(null);
    localStorage.removeItem('admin_session');
  };

  // Login Page
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-black flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center shadow-lg shadow-red-500/30">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Admin Panel</h1>
            <p className="text-gray-400">USDT Mining Lab Administration</p>
          </div>

          <form onSubmit={handleAdminLogin} className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-2xl">
            <div className="space-y-4">
              <div>
                <label className="text-gray-300 text-sm mb-2 block font-medium">Admin Wallet Address</label>
                <input
                  type="text"
                  value={adminWallet}
                  onChange={(e) => setAdminWallet(e.target.value)}
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition-all placeholder:text-gray-500"
                  placeholder="0x..."
                  required
                />
              </div>
              <div>
                <label className="text-gray-300 text-sm mb-2 block font-medium">PIN (6 digits)</label>
                <input
                  type="password"
                  value={adminPin}
                  onChange={(e) => setAdminPin(e.target.value)}
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition-all placeholder:text-gray-500"
                  placeholder="Enter 6-digit PIN"
                  maxLength={6}
                  required
                />
              </div>

              {authError && (
                <div className="bg-red-500/20 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {authError}
                </div>
              )}

              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-red-500 to-orange-600 text-white font-bold text-lg disabled:opacity-50 hover:opacity-90 transition-opacity shadow-lg shadow-red-500/30"
              >
                {authLoading ? 'Authenticating...' : '🔐 Login as Admin'}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-500 text-xs">
              Only authorized administrators can access this panel
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-black">
      {/* Toast Messages */}
      {success && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-pulse">
          <div className="bg-emerald-500/90 backdrop-blur-xl text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            {success}
          </div>
        </div>
      )}
      {error && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-pulse">
          <div className="bg-red-500/90 backdrop-blur-xl text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center shadow-lg shadow-red-500/30">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-white text-lg">Admin Panel</span>
              <span className="ml-2 text-xs px-2 py-0.5 bg-red-500/20 text-red-400 rounded-full">ADMIN</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => fetchAllData()} 
              className="p-2.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button 
              onClick={handleLogout} 
              className="p-2.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="sticky top-16 z-30 bg-slate-900/50 backdrop-blur-xl border-b border-white/5 overflow-x-auto">
        <div className="max-w-7xl mx-auto px-4 flex gap-1">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: Activity },
            { id: 'deposits', label: 'Deposits', icon: ArrowDownRight },
            { id: 'withdrawals', label: 'Withdrawals', icon: ArrowUpRight },
            { id: 'users', label: 'Users', icon: Users },
            { id: 'mining', label: 'Mining', icon: DollarSign },
            { id: 'settings', label: 'Settings', icon: Settings },
            { id: 'broadcast', label: 'Broadcast', icon: MessageSquare }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-all ${
                activeTab === tab.id
                  ? 'text-red-400 border-red-400 bg-red-500/5'
                  : 'text-gray-400 border-transparent hover:text-white hover:bg-white/5'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto p-4">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && stats && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-5 border border-white/5">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-cyan-400" />
                <span className="text-gray-400 text-xs">Total Users</span>
              </div>
              <div className="text-3xl font-bold text-white">{stats.totalUsers || 0}</div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-5 border border-white/5">
              <div className="flex items-center gap-2 mb-2">
                <ArrowDownRight className="w-5 h-5 text-green-400" />
                <span className="text-gray-400 text-xs">Total Deposits</span>
              </div>
              <div className="text-3xl font-bold text-green-400">${(stats.totalDeposits || 0).toLocaleString()}</div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-5 border border-white/5">
              <div className="flex items-center gap-2 mb-2">
                <ArrowUpRight className="w-5 h-5 text-red-400" />
                <span className="text-gray-400 text-xs">Total Withdrawals</span>
              </div>
              <div className="text-3xl font-bold text-red-400">${(stats.totalWithdrawals || 0).toLocaleString()}</div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-5 border border-white/5">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-yellow-400" />
                <span className="text-gray-400 text-xs">Pending Deposits</span>
              </div>
              <div className="text-3xl font-bold text-yellow-400">{stats.pendingDeposits || 0}</div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-5 border border-white/5">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-orange-400" />
                <span className="text-gray-400 text-xs">Pending Withdrawals</span>
              </div>
              <div className="text-3xl font-bold text-orange-400">{stats.pendingWithdrawals || 0}</div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-5 border border-white/5">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-purple-400" />
                <span className="text-gray-400 text-xs">Active Mining</span>
              </div>
              <div className="text-3xl font-bold text-purple-400">{stats.activeMining || 0}</div>
            </div>
          </div>
        )}

        {/* Deposits Tab */}
        {activeTab === 'deposits' && (
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-white/5 overflow-hidden">
            <div className="p-5 border-b border-white/5">
              <h2 className="text-white font-bold text-lg">Pending Deposits</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-700/30">
                  <tr>
                    <th className="text-left text-gray-400 text-xs font-medium px-5 py-4">User</th>
                    <th className="text-left text-gray-400 text-xs font-medium px-5 py-4">Amount</th>
                    <th className="text-left text-gray-400 text-xs font-medium px-5 py-4">TXID</th>
                    <th className="text-left text-gray-400 text-xs font-medium px-5 py-4">Date</th>
                    <th className="text-left text-gray-400 text-xs font-medium px-5 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {deposits.filter(d => d.status === 'pending').map(deposit => (
                    <tr key={deposit.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-5 py-4 text-white text-sm font-mono">{deposit.wallet?.slice(0, 8)}...{deposit.wallet?.slice(-4)}</td>
                      <td className="px-5 py-4 text-green-400 font-bold text-lg">${deposit.amount}</td>
                      <td className="px-5 py-4 text-gray-400 text-xs font-mono">{deposit.txHash?.slice(0, 16)}...</td>
                      <td className="px-5 py-4 text-gray-400 text-sm">{new Date(deposit.createdAt).toLocaleString()}</td>
                      <td className="px-5 py-4">
                        <div className="flex gap-2">
                          <button 
                            onClick={() => adminAction('approveDeposit', deposit.id)} 
                            className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg text-sm font-medium hover:bg-green-500/30 transition-colors"
                          >
                            ✓ Approve
                          </button>
                          <button 
                            onClick={() => adminAction('rejectDeposit', deposit.id)} 
                            className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg text-sm font-medium hover:bg-red-500/30 transition-colors"
                          >
                            ✗ Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {deposits.filter(d => d.status === 'pending').length === 0 && (
                    <tr><td colSpan={5} className="px-5 py-12 text-center text-gray-500">No pending deposits</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Withdrawals Tab */}
        {activeTab === 'withdrawals' && (
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-white/5 overflow-hidden">
            <div className="p-5 border-b border-white/5">
              <h2 className="text-white font-bold text-lg">Pending Withdrawals</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-700/30">
                  <tr>
                    <th className="text-left text-gray-400 text-xs font-medium px-5 py-4">User</th>
                    <th className="text-left text-gray-400 text-xs font-medium px-5 py-4">Amount</th>
                    <th className="text-left text-gray-400 text-xs font-medium px-5 py-4">To Wallet</th>
                    <th className="text-left text-gray-400 text-xs font-medium px-5 py-4">Date</th>
                    <th className="text-left text-gray-400 text-xs font-medium px-5 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {withdrawals.filter(w => w.status === 'pending').map(withdrawal => (
                    <tr key={withdrawal.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-5 py-4 text-white text-sm font-mono">{withdrawal.wallet?.slice(0, 8)}...{withdrawal.wallet?.slice(-4)}</td>
                      <td className="px-5 py-4 text-red-400 font-bold text-lg">${withdrawal.amount}</td>
                      <td className="px-5 py-4 text-gray-400 text-xs font-mono">{withdrawal.walletAddress?.slice(0, 10)}...{withdrawal.walletAddress?.slice(-6)}</td>
                      <td className="px-5 py-4 text-gray-400 text-sm">{new Date(withdrawal.createdAt).toLocaleString()}</td>
                      <td className="px-5 py-4">
                        <div className="flex gap-2">
                          <button 
                            onClick={() => adminAction('approveWithdrawal', withdrawal.id)} 
                            className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg text-sm font-medium hover:bg-green-500/30 transition-colors"
                          >
                            ✓ Approve
                          </button>
                          <button 
                            onClick={() => adminAction('rejectWithdrawal', withdrawal.id)} 
                            className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg text-sm font-medium hover:bg-red-500/30 transition-colors"
                          >
                            ✗ Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {withdrawals.filter(w => w.status === 'pending').length === 0 && (
                    <tr><td colSpan={5} className="px-5 py-12 text-center text-gray-500">No pending withdrawals</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-white/5 overflow-hidden">
            <div className="p-5 border-b border-white/5">
              <h2 className="text-white font-bold text-lg">All Users</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-700/30">
                  <tr>
                    <th className="text-left text-gray-400 text-xs font-medium px-5 py-4">Wallet</th>
                    <th className="text-left text-gray-400 text-xs font-medium px-5 py-4">Status</th>
                    <th className="text-left text-gray-400 text-xs font-medium px-5 py-4">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {users.map(user => (
                    <tr key={user.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-5 py-4 text-white text-sm font-mono">{user.wallet?.slice(0, 10)}...{user.wallet?.slice(-6)}</td>
                      <td className="px-5 py-4">
                        <span className="px-3 py-1 rounded-full text-xs bg-green-500/20 text-green-400">Active</span>
                      </td>
                      <td className="px-5 py-4 text-gray-400 text-sm">{new Date(user.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr><td colSpan={3} className="px-5 py-12 text-center text-gray-500">No users found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Mining Tab */}
        {activeTab === 'mining' && (
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-white/5 overflow-hidden">
            <div className="p-5 border-b border-white/5">
              <h2 className="text-white font-bold text-lg">Mining Sessions</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-700/30">
                  <tr>
                    <th className="text-left text-gray-400 text-xs font-medium px-5 py-4">Plan</th>
                    <th className="text-left text-gray-400 text-xs font-medium px-5 py-4">Investment</th>
                    <th className="text-left text-gray-400 text-xs font-medium px-5 py-4">Daily Profit</th>
                    <th className="text-left text-gray-400 text-xs font-medium px-5 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {miningSessions.map((session: any) => (
                    <tr key={session.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-5 py-4 text-white">{session.planName}</td>
                      <td className="px-5 py-4 text-cyan-400 font-bold">${session.investment}</td>
                      <td className="px-5 py-4 text-green-400">${session.dailyProfit?.toFixed(4)}</td>
                      <td className="px-5 py-4">
                        <span className="px-3 py-1 rounded-full text-xs bg-green-500/20 text-green-400">
                          {session.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {miningSessions.length === 0 && (
                    <tr><td colSpan={4} className="px-5 py-12 text-center text-gray-500">No mining sessions found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="max-w-xl">
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-white/5 p-6">
              <h2 className="text-white font-bold text-lg mb-6">Platform Settings</h2>
              <div className="space-y-5">
                <div>
                  <label className="text-gray-300 text-sm mb-2 block font-medium">Deposit Wallet Address</label>
                  <input
                    type="text"
                    value={depositWallet}
                    onChange={(e) => setDepositWallet(e.target.value)}
                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-sm focus:border-red-500 focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-300 text-sm mb-2 block font-medium">Min Deposit (USDT)</label>
                    <input
                      type="number"
                      value={minDeposit}
                      onChange={(e) => setMinDeposit(e.target.value)}
                      className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-red-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-gray-300 text-sm mb-2 block font-medium">Min Withdrawal (USDT)</label>
                    <input
                      type="number"
                      value={minWithdraw}
                      onChange={(e) => setMinWithdraw(e.target.value)}
                      className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-red-500 focus:outline-none"
                    />
                  </div>
                </div>
                <button
                  onClick={updateSettings}
                  disabled={loading}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold disabled:opacity-50"
                >
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Broadcast Tab */}
        {activeTab === 'broadcast' && (
          <div className="max-w-xl">
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-white/5 p-6">
              <h2 className="text-white font-bold text-lg mb-2">Broadcast Message</h2>
              <p className="text-gray-400 text-sm mb-6">Send a message that will appear on all users&apos; dashboard</p>
              <textarea
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-4 text-white focus:border-red-500 focus:outline-none resize-none"
                rows={5}
                placeholder="Enter your message..."
              />
              <button
                onClick={sendBroadcast}
                disabled={loading || !broadcastMessage.trim()}
                className="w-full mt-4 py-4 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold disabled:opacity-50"
              >
                Send Broadcast
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto py-6 text-center text-gray-500 text-sm border-t border-white/5">
        USDT Mining Lab Admin Panel © 2025
      </footer>
    </div>
  );
}
