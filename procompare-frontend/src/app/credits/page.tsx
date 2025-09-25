"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CreditCard, 
  Wallet, 
  Plus, 
  Minus, 
  Copy, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  RefreshCw,
  DollarSign,
  TrendingUp,
  History,
  Download
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

interface DepositRequest {
  id: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  reference_number: string;
  credits_to_activate: number;
  created_at: string;
  processed_at?: string;
  admin_notes?: string;
}

interface Transaction {
  id: string;
  amount: number;
  transaction_type: 'deposit' | 'withdrawal' | 'lead_purchase';
  status: 'completed' | 'pending' | 'failed';
  description: string;
  reference: string;
  created_at: string;
}

export default function CreditsPage() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [creditBalance, setCreditBalance] = useState(0);
  const [customerCode, setCustomerCode] = useState('');
  const [depositAmount, setDepositAmount] = useState(50);
  const [depositHistory, setDepositHistory] = useState<DepositRequest[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showTopUpModal, setShowTopUpModal] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (false) return;
    if (!session || user?.userType !== 'provider') {
      router.push('/login');
    }
  }, [session, status, router]);

  // Fetch credit data
  useEffect(() => {
    if (token) {
      fetchCreditData();
    }
  }, [session]);

  const fetchCreditData = async () => {
    try {
      setLoading(true);
      
      // Fetch profile for credit balance and customer code
      const profileResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.proconnectsa.co.za'}/api/auth/profile/`, {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        setCreditBalance(profileData.provider_profile?.credit_balance || 0);
        setCustomerCode(profileData.provider_profile?.customer_code || '');
      }

      // Fetch deposit history
      const depositsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.proconnectsa.co.za'}/api/payments/dashboard/deposits/`, {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (depositsResponse.ok) {
        const depositsData = await depositsResponse.json();
        setDepositHistory(depositsData.results || []);
      }

      // Fetch transaction history
      const transactionsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.proconnectsa.co.za'}/api/payments/dashboard/transactions/`, {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (transactionsResponse.ok) {
        const transactionsData = await transactionsResponse.json();
        setTransactions(transactionsData.results || []);
      }

    } catch (error) {
      toast.error('Error fetching credit data');
    } finally {
      setLoading(false);
    }
  };

  const handleTopUp = async () => {
    if (depositAmount < 50) {
      toast.error('Minimum deposit amount is R50');
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.proconnectsa.co.za'}/api/payments/dashboard/deposits/create/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: depositAmount,
          payment_method: 'manual_deposit'
        })
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(`Deposit request created! Reference: ${result.reference_number}`);
        setShowTopUpModal(false);
        fetchCreditData(); // Refresh data
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Failed to create deposit request');
      }
    } catch (error) {
      toast.error('Error creating deposit request');
    }
  };

  const copyCustomerCode = () => {
    navigator.clipboard.writeText(customerCode);
    toast.success('Customer code copied to clipboard');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'rejected':
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Credit Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your credits, deposits, and transactions
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="deposits">Deposits</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="topup">Top Up</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Credit Balance Card */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Available Credits
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{creditBalance}</div>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatCurrency(creditBalance * 50)} value
                  </p>
                </CardContent>
              </Card>

              {/* Customer Code Card */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Customer Code
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <code className="text-lg font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                      {customerCode}
                    </code>
                    <Button size="sm" variant="outline" onClick={copyCustomerCode}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Use for manual deposits
                  </p>
                </CardContent>
              </Card>

              {/* Quick Actions Card */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button 
                    className="w-full" 
                    onClick={() => setShowTopUpModal(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Credits
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={fetchCreditData}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {transactions.slice(0, 5).map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${
                          transaction.transaction_type === 'deposit' ? 'bg-green-100 dark:bg-green-900' :
                          transaction.transaction_type === 'lead_purchase' ? 'bg-blue-100 dark:bg-blue-900' :
                          'bg-gray-100 dark:bg-gray-800'
                        }`}>
                          {transaction.transaction_type === 'deposit' ? (
                            <Plus className="h-4 w-4 text-green-600 dark:text-green-400" />
                          ) : transaction.transaction_type === 'lead_purchase' ? (
                            <Minus className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          ) : (
                            <CreditCard className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {formatDate(transaction.created_at)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-medium ${
                          transaction.transaction_type === 'deposit' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.transaction_type === 'deposit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                        </p>
                        <Badge className={getStatusColor(transaction.status)}>
                          {transaction.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Deposits Tab */}
          <TabsContent value="deposits" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  Deposit History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {depositHistory.length === 0 ? (
                    <div className="text-center py-8">
                      <Wallet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 dark:text-gray-400">No deposits found</p>
                    </div>
                  ) : (
                    depositHistory.map((deposit) => (
                      <div key={deposit.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-full ${
                            deposit.status === 'approved' ? 'bg-green-100 dark:bg-green-900' :
                            deposit.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900' :
                            'bg-red-100 dark:bg-red-900'
                          }`}>
                            {deposit.status === 'approved' ? (
                              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                            ) : deposit.status === 'pending' ? (
                              <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                            ) : (
                              <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">Deposit Request</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Reference: {deposit.reference_number}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {formatDate(deposit.created_at)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatCurrency(deposit.amount)}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {deposit.credits_to_activate} credits
                          </p>
                          <Badge className={getStatusColor(deposit.status)}>
                            {deposit.status}
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Transaction History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {transactions.length === 0 ? (
                    <div className="text-center py-8">
                      <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 dark:text-gray-400">No transactions found</p>
                    </div>
                  ) : (
                    transactions.map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-full ${
                            transaction.transaction_type === 'deposit' ? 'bg-green-100 dark:bg-green-900' :
                            transaction.transaction_type === 'lead_purchase' ? 'bg-blue-100 dark:bg-blue-900' :
                            'bg-gray-100 dark:bg-gray-800'
                          }`}>
                            {transaction.transaction_type === 'deposit' ? (
                              <Plus className="h-4 w-4 text-green-600 dark:text-green-400" />
                            ) : transaction.transaction_type === 'lead_purchase' ? (
                              <Minus className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            ) : (
                              <CreditCard className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{transaction.description}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Ref: {transaction.reference}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {formatDate(transaction.created_at)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-medium ${
                            transaction.transaction_type === 'deposit' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.transaction_type === 'deposit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                          </p>
                          <Badge className={getStatusColor(transaction.status)}>
                            {transaction.status}
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Top Up Tab */}
          <TabsContent value="topup" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Add Credits
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600 mb-2">{creditBalance}</div>
                  <p className="text-gray-600 dark:text-gray-400">Current Credits</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="deposit_amount">Deposit Amount (R)</Label>
                    <Input
                      id="deposit_amount"
                      type="number"
                      min="50"
                      step="50"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(parseInt(e.target.value) || 50)}
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Minimum R50. You'll receive {Math.floor(depositAmount / 50)} credits.
                    </p>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                      Manual Deposit Instructions
                    </h3>
                    <div className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                      <p>1. Use your customer code: <code className="font-mono bg-blue-100 dark:bg-blue-800 px-1 rounded">{customerCode}</code></p>
                      <p>2. Make payment to the bank account provided</p>
                      <p>3. Include your customer code as reference</p>
                      <p>4. Credits will be activated after verification</p>
                    </div>
                  </div>

                  <Button 
                    onClick={handleTopUp} 
                    className="w-full"
                    disabled={depositAmount < 50}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Deposit Request
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}







