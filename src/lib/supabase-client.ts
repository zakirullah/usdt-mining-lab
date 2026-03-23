// Supabase REST API Client - Direct Database Operations
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bvqtrchbvptorbanmxey.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2cXRyY2hidnB0b3JiYW5teGV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzNDA3MTQsImV4cCI6MjA4ODkxNjcxNH0.CIVWwXcMN31aOUdSBOOVlLpmvJgo0kw4D3XaNpFRQd0';

// Service role key for admin operations (full access)
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2cXRyY2hidnB0b3JiYW5teGV5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzM0MDcxNCwiZXhwIjoyMDg4OTE2NzE0fQ.VdSVRvZGNYOjONNgxPdJ_wk_LlLLy_Xj-5-O3YBWLMY';

interface SupabaseResponse<T> {
  data: T | null;
  error: Error | null;
}

// Generic fetch function for Supabase REST API
async function supabaseFetch<T>(
  table: string,
  options: {
    method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
    body?: object;
    query?: Record<string, string>;
    select?: string;
    order?: string;
    limit?: number;
    offset?: number;
    single?: boolean;
    useServiceKey?: boolean;
  } = {}
): Promise<SupabaseResponse<T>> {
  const { method = 'GET', body, query = {}, select, order, limit, offset, single, useServiceKey = false } = options;

  const params = new URLSearchParams();
  if (select) params.append('select', select);
  if (order) params.append('order', order);
  if (limit) params.append('limit', String(limit));
  if (offset) params.append('offset', String(offset));
  
  Object.entries(query).forEach(([key, value]) => {
    params.append(key, value);
  });

  const url = `${SUPABASE_URL}/rest/v1/${table}?${params.toString()}`;
  
  const headers: Record<string, string> = {
    'apikey': useServiceKey ? SUPABASE_SERVICE_KEY : SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${useServiceKey ? SUPABASE_SERVICE_KEY : SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation',
  };

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const errorText = await response.text();
      return { data: null, error: new Error(errorText) };
    }

    const data = await response.json();
    return { data: single ? data[0] : data, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}

// ============ USER OPERATIONS ============

export async function getUserByWallet(walletAddress: string) {
  return supabaseFetch<{ id: string; walletaddress: string; securitypin: string; role: string; balance: number; totalprofit: number; totalinvested: number; totalwithdrawn: number; referralcode: string; referralearnings: number; isactive: boolean; createdat: string; updatedat: string }>(
    'umlab_users',
    {
      select: '*',
      query: { 'walletAddress': `eq.${walletAddress.toLowerCase()}` },
      single: true,
      useServiceKey: true
    }
  );
}

export async function createUser(userData: {
  walletAddress: string;
  securityPin: string;
  referralCode: string;
  role?: string;
  balance?: number;
  isActive?: boolean;
}) {
  return supabaseFetch<{ id: string }>(
    'umlab_users',
    {
      method: 'POST',
      body: {
        walletaddress: userData.walletAddress.toLowerCase(),
        securitypin: userData.securityPin,
        referralcode: userData.referralCode,
        role: userData.role || 'user',
        balance: userData.balance || 0,
        isactive: userData.isActive ?? true,
      },
      useServiceKey: true
    }
  );
}

export async function updateUser(userId: string, updates: Record<string, unknown>) {
  return supabaseFetch<Record<string, unknown>>(
    'umlab_users',
    {
      method: 'PATCH',
      body: updates,
      query: { 'id': `eq.${userId}` },
      useServiceKey: true
    }
  );
}

export async function getAllUsers(limit = 50, offset = 0) {
  return supabaseFetch<Array<{
    id: string;
    walletaddress: string;
    balance: number;
    totalprofit: number;
    totalinvested: number;
    role: string;
    isactive: boolean;
    createdat: string;
  }>>(
    'umlab_users',
    {
      select: 'id,walletaddress,balance,totalprofit,totalinvested,role,isactive,createdat',
      order: 'createdat.desc',
      limit,
      offset,
      useServiceKey: true
    }
  );
}

export async function getUserCount() {
  const result = await supabaseFetch<Array<{ count: number }>>(
    'umlab_users',
    {
      select: 'count',
      useServiceKey: true
    }
  );
  return result;
}

// ============ SESSION OPERATIONS ============

export async function createSession(sessionData: { id: string; userId: string; token: string; expiresAt: string }) {
  return supabaseFetch<{ id: string }>(
    'umlab_sessions',
    {
      method: 'POST',
      body: {
        id: sessionData.id,
        userid: sessionData.userId,
        token: sessionData.token,
        expiresat: sessionData.expiresAt,
      },
      useServiceKey: true
    }
  );
}

export async function getSessionByToken(token: string) {
  return supabaseFetch<{ id: string; userid: string; token: string; expiresat: string }>(
    'umlab_sessions',
    {
      select: '*',
      query: { 'token': `eq.${token}` },
      single: true,
      useServiceKey: true
    }
  );
}

// ============ DEPOSIT OPERATIONS ============

export async function createDeposit(depositData: { userId: string; amount: number; txHash: string; screenshotUrl?: string }) {
  return supabaseFetch<{ id: string }>(
    'umlab_deposits',
    {
      method: 'POST',
      body: {
        userid: depositData.userId,
        amount: depositData.amount,
        txhash: depositData.txHash,
        screenshoturl: depositData.screenshotUrl || null,
        status: 'pending',
      },
      useServiceKey: true
    }
  );
}

export async function getPendingDeposits() {
  return supabaseFetch<Array<{
    id: string;
    userid: string;
    amount: number;
    txhash: string;
    status: string;
    createdat: string;
  }>>(
    'umlab_deposits',
    {
      select: 'id,userid,amount,txhash,status,createdat',
      query: { 'status': 'eq.pending' },
      order: 'createdat.desc',
      useServiceKey: true
    }
  );
}

export async function updateDepositStatus(depositId: string, status: string, approvedBy?: string) {
  const updates: Record<string, unknown> = { status };
  if (approvedBy) {
    updates.approvedby = approvedBy;
    updates.approvedat = new Date().toISOString();
  }
  
  return supabaseFetch<Record<string, unknown>>(
    'umlab_deposits',
    {
      method: 'PATCH',
      body: updates,
      query: { 'id': `eq.${depositId}` },
      useServiceKey: true
    }
  );
}

export async function getApprovedDepositsSum() {
  const result = await supabaseFetch<Array<{ amount: number }>>(
    'umlab_deposits',
    {
      select: 'amount',
      query: { 'status': 'eq.approved' },
      useServiceKey: true
    }
  );
  
  if (result.data) {
    return result.data.reduce((sum, d) => sum + d.amount, 0);
  }
  return 0;
}

// ============ WITHDRAWAL OPERATIONS ============

export async function createWithdrawal(withdrawalData: { userId: string; amount: number; walletAddress: string }) {
  return supabaseFetch<{ id: string }>(
    'umlab_withdrawals',
    {
      method: 'POST',
      body: {
        userid: withdrawalData.userId,
        amount: withdrawalData.amount,
        walletaddress: withdrawalData.walletAddress,
        status: 'pending',
      },
      useServiceKey: true
    }
  );
}

export async function getPendingWithdrawals() {
  return supabaseFetch<Array<{
    id: string;
    userid: string;
    amount: number;
    walletaddress: string;
    status: string;
    createdat: string;
  }>>(
    'umlab_withdrawals',
    {
      select: 'id,userid,amount,walletaddress,status,createdat',
      query: { 'status': 'eq.pending' },
      order: 'createdat.desc',
      useServiceKey: true
    }
  );
}

export async function updateWithdrawalStatus(withdrawalId: string, status: string, approvedBy?: string) {
  const updates: Record<string, unknown> = { status };
  if (approvedBy) {
    updates.approvedby = approvedBy;
    updates.approvedat = new Date().toISOString();
  }
  
  return supabaseFetch<Record<string, unknown>>(
    'umlab_withdrawals',
    {
      method: 'PATCH',
      body: updates,
      query: { 'id': `eq.${withdrawalId}` },
      useServiceKey: true
    }
  );
}

// ============ MINING OPERATIONS ============

export async function createUserMining(miningData: {
  userId: string;
  planId: string;
  planType: string;
  planName: string;
  investment: number;
  dailyPercent: number;
  dailyProfit: number;
  expiresAt: string;
}) {
  return supabaseFetch<{ id: string }>(
    'umlab_user_mining',
    {
      method: 'POST',
      body: {
        userid: miningData.userId,
        planid: miningData.planId,
        plantype: miningData.planType,
        planname: miningData.planName,
        investment: miningData.investment,
        dailypercent: miningData.dailyPercent,
        dailyprofit: miningData.dailyProfit,
        profitpersecond: miningData.dailyProfit / 86400,
        expiresat: miningData.expiresAt,
        status: 'active',
      },
      useServiceKey: true
    }
  );
}

export async function getActiveMiningSessions() {
  return supabaseFetch<Array<{
    id: string;
    userid: string;
    plantype: string;
    planname: string;
    investment: number;
    dailyprofit: number;
    totalearned: number;
    status: string;
    startedat: string;
    expiresat: string;
  }>>(
    'umlab_user_mining',
    {
      select: '*',
      query: { 'status': 'eq.active' },
      useServiceKey: true
    }
  );
}

export async function getUserMiningSessions(userId: string) {
  return supabaseFetch<Array<{
    id: string;
    plantype: string;
    planname: string;
    investment: number;
    dailypercent: number;
    dailyprofit: number;
    profitpersecond: number;
    totalearned: number;
    status: string;
    startedat: string;
    expiresat: string;
  }>>(
    'umlab_user_mining',
    {
      select: '*',
      query: { 'userid': `eq.${userId}`, 'status': 'eq.active' },
      useServiceKey: true
    }
  );
}

// ============ TRANSACTION OPERATIONS ============

export async function createTransaction(txData: { userId: string; type: string; amount: number; description?: string }) {
  return supabaseFetch<{ id: string }>(
    'umlab_transactions',
    {
      method: 'POST',
      body: {
        userid: txData.userId,
        type: txData.type,
        amount: txData.amount,
        description: txData.description || null,
        status: 'completed',
      },
      useServiceKey: true
    }
  );
}

// ============ ADMIN SETTINGS ============

export async function getAdminSettings() {
  return supabaseFetch<{
    id: string;
    sitename: string;
    depositwallet: string;
    mindeposit: number;
    minwithdraw: number;
  }>(
    'umlab_admin_settings',
    {
      select: '*',
      limit: 1,
      single: true,
      useServiceKey: true
    }
  );
}

export async function initAdminSettings() {
  const existing = await getAdminSettings();
  if (existing.data) return existing;
  
  return supabaseFetch<{ id: string }>(
    'umlab_admin_settings',
    {
      method: 'POST',
      body: {
        sitename: 'USDT Mining Lab',
        depositwallet: '0x33cb374635ab51fc669c1849b21b589a17475fc3',
        mindeposit: 10,
        minwithdraw: 10,
        maintenancemode: false,
      },
      useServiceKey: true
    }
  );
}

// ============ MINING PLAN ============

export async function getMiningPlan() {
  return supabaseFetch<{
    id: string;
    name: string;
    dailyprofit: number;
    duration: number;
    mininvest: number;
    maxinvest: number;
  }>(
    'umlab_mining_plans',
    {
      select: '*',
      limit: 1,
      single: true,
      useServiceKey: true
    }
  );
}

export async function initMiningPlan() {
  const existing = await getMiningPlan();
  if (existing.data) return existing;
  
  return supabaseFetch<{ id: string }>(
    'umlab_mining_plans',
    {
      method: 'POST',
      body: {
        name: 'Starter Mining Plan',
        dailyprofit: 4,
        duration: 30,
        mininvest: 10,
        maxinvest: 100000,
        isactive: true,
      },
      useServiceKey: true
    }
  );
}

// ============ NOTIFICATION ============

export async function createNotification(notificationData: { type: string; message: string; amount?: number }) {
  return supabaseFetch<{ id: string }>(
    'umlab_notifications',
    {
      method: 'POST',
      body: {
        type: notificationData.type,
        message: notificationData.message,
        amount: notificationData.amount || null,
        isread: false,
      },
      useServiceKey: true
    }
  );
}

export async function getRecentNotifications(limit = 20) {
  return supabaseFetch<Array<{
    id: string;
    type: string;
    message: string;
    amount: number;
    createdat: string;
  }>>(
    'umlab_notifications',
    {
      select: 'id,type,message,amount,createdat',
      order: 'createdat.desc',
      limit,
      useServiceKey: true
    }
  );
}
