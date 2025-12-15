import { useEffect, useMemo, useState } from 'react';
import { DollarSign, TrendingUp, TrendingDown, FileText, Bell, AlertTriangle, Loader2 } from 'lucide-react';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import apiClient from '../lib/apiClient';
import { formatCurrency, formatDate } from '../utils/formatters';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#6366f1'];

const calcChange = (current = 0, previous = 0) => {
  if (!previous) return '0%';
  const diff = ((current - previous) / previous) * 100;
  return `${diff >= 0 ? '+' : ''}${diff.toFixed(1)}%`;
};

export default function DashboardHome() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await apiClient.get('/analytics/summary');
        setSummary(response.data.data);
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  const monthly = summary?.monthlyPerformance || [];
  const categoryData = (summary?.categoryBreakdown || []).map(item => ({
    name: item.category,
    value: item.amount
  }));
  const recentTransactions = summary?.recentTransactions || [];

  const stats = useMemo(() => {
    const totals = summary?.totals || { totalIncome: 0, totalExpenses: 0, documentCount: 0 };
    const latest = monthly[monthly.length - 1] || {};
    const previous = monthly[monthly.length - 2] || {};
    return [
      {
        name: 'Total Income',
        value: formatCurrency(totals.totalIncome),
        change: calcChange(latest.income, previous.income),
        icon: DollarSign,
        color: 'text-green-600'
      },
      {
        name: 'Monthly Expenses',
        value: formatCurrency(totals.totalExpenses),
        change: calcChange(latest.expenses, previous.expenses),
        icon: TrendingDown,
        color: 'text-red-600'
      },
      {
        name: 'Net Profit',
        value: formatCurrency(totals.totalIncome - totals.totalExpenses),
        change: calcChange(latest.profit, previous.profit),
        icon: TrendingUp,
        color: 'text-blue-600'
      },
      {
        name: 'Documents',
        value: totals.documentCount?.toString() || '0',
        change: `${(summary?.recentTransactions || []).length} transactions tracked`,
        icon: FileText,
        color: 'text-purple-600'
      }
    ];
  }, [monthly, summary]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-12 text-gray-500">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        Loading your dashboard...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here&apos;s your financial overview</p>
        </div>
        <Link to="/dashboard/reminders" className="btn-primary flex items-center space-x-2">
          <Bell className="h-5 w-5" />
          <span>View Reminders</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const changeClass =
            stat.change.startsWith('+') ? 'text-green-600' : stat.change.startsWith('-') ? 'text-red-600' : 'text-gray-600';
          return (
            <div key={stat.name} className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className={`text-2xl font-bold mt-2 ${stat.color}`}>{stat.value}</p>
                  <p className={`text-sm mt-1 ${changeClass}`}>{stat.change}</p>
                </div>
                <div className="bg-gray-100 p-3 rounded-lg">
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Monthly Performance</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthly}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} />
              <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} />
              <Line type="monotone" dataKey="profit" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Spending by Category</h2>
            <AlertTriangle className="h-5 w-5 text-orange-500" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={90}
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Recent Transactions</h2>
          <Link to="/dashboard/transactions" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
            View all
          </Link>
        </div>
        {recentTransactions.length === 0 ? (
          <p className="text-center text-gray-500 py-6">No recent transactions.</p>
        ) : (
          <div className="space-y-3">
            {recentTransactions.map((transaction) => (
              <div key={transaction._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="bg-primary-100 p-2 rounded-lg">
                    <FileText className="h-5 w-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{transaction.merchant || '—'}</p>
                    <p className="text-sm text-gray-500">
                      {transaction.category || 'Uncategorized'} • {formatDate(transaction.date)}
                    </p>
                  </div>
                </div>
                <p
                  className={`text-lg font-semibold ${
                    transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {transaction.type === 'income' ? '+' : '-'}
                  {formatCurrency(transaction.amount, transaction.currency)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

