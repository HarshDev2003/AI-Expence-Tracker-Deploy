import { useEffect, useMemo, useState } from 'react';
import { Lightbulb, TrendingUp, AlertCircle, Target, DollarSign, Loader2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';
import apiClient from '../lib/apiClient';
import { formatCurrency, formatPercent } from '../utils/formatters';

const buildForecast = (monthly = []) =>
  monthly.map((entry, index) => {
    const previous = monthly[index - 1];
    const trend = previous ? entry.expenses - previous.expenses : 0;
    return {
      month: entry.month,
      actual: entry.expenses,
      forecast: Math.max(entry.expenses + trend * 0.5, 0)
    };
  });

export default function FinancialInsights() {
  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const [analyticsRes, transactionsRes] = await Promise.all([
          apiClient.get('/analytics/summary'),
          apiClient.get('/transactions')
        ]);
        setSummary(analyticsRes.data.data);
        setTransactions(transactionsRes.data.data || []);
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, []);

  const totals = summary?.totals || { totalIncome: 0, totalExpenses: 0 };
  const monthly = summary?.monthlyPerformance || [];
  const forecastData = buildForecast(monthly);
  const spendingRatio = totals.totalIncome ? totals.totalExpenses / totals.totalIncome : 0;

  const categoryTrends = useMemo(() => {
    const current = transactions.reduce((acc, trx) => {
      if (!trx.category) return acc;
      acc[trx.category] = (acc[trx.category] || 0) + trx.amount;
      return acc;
    }, {});
    return Object.entries(current)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([category, amount]) => ({ category, amount }));
  }, [transactions]);

  const insights = [
    {
      title: 'Potential Monthly Savings',
      description: 'Difference between income and expenses this period.',
      value: formatCurrency(totals.totalIncome - totals.totalExpenses),
      icon: DollarSign,
      color: 'bg-green-100 text-green-600'
    },
    {
      title: 'Spending Efficiency',
      description: 'Portion of income consumed by expenses.',
      value: formatPercent(spendingRatio * 100),
      icon: TrendingUp,
      color: 'bg-yellow-100 text-yellow-600'
    },
    {
      title: 'Budget Alert',
      description: spendingRatio > 0.8 ? 'You are nearing your spending threshold.' : 'Spending remains within the target range.',
      value: spendingRatio > 0.8 ? 'High Risk' : 'Healthy',
      icon: AlertCircle,
      color: spendingRatio > 0.8 ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
    },
    {
      title: 'Top Spending Category',
      description: categoryTrends[0]
        ? `${categoryTrends[0].category} accounted for ${formatCurrency(categoryTrends[0].amount)}.`
        : 'Categorize more transactions for richer insights.',
      value: categoryTrends[0]?.category || '—',
      icon: Target,
      color: 'bg-purple-100 text-purple-600'
    }
  ];

  const recommendations = [
    categoryTrends[0]
      ? `Review ${categoryTrends[0].category.toLowerCase()} purchases and consider capping at ${formatCurrency(
          categoryTrends[0].amount * 0.9
        )}.`
      : 'Upload more categorized receipts to unlock targeted advice.',
    spendingRatio > 0.8
      ? 'Pause discretionary spending for a week to bring expenses below 80% of income.'
      : 'Great job keeping spending lean. Consider auto-transferring the surplus to savings.',
    `Document automation processed ${summary?.totals?.documentCount || 0} files. Keep digitizing invoices for continuous AI monitoring.`
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-12 text-gray-500">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        Compiling insights...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Financial Insights</h1>
        <p className="text-gray-600 mt-1">AI-powered insights and recommendations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {insights.map((insight) => {
          const Icon = insight.icon;
          return (
            <div key={insight.title} className="card">
              <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-lg ${insight.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{insight.title}</h3>
                    <span className="text-lg font-bold text-gray-900">{insight.value}</span>
                  </div>
                  <p className="text-sm text-gray-600">{insight.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Spending Forecast</h2>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={forecastData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="actual" stroke="#3b82f6" strokeWidth={2} name="Actual Spend" />
            <Line type="monotone" dataKey="forecast" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" name="Projected" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="card">
        <div className="flex items-center space-x-2 mb-4">
          <Lightbulb className="h-6 w-6 text-yellow-500" />
          <h2 className="text-xl font-semibold text-gray-900">AI Recommendations</h2>
        </div>
        <div className="space-y-4">
          {recommendations.map((recommendation, idx) => (
            <div key={idx} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="h-2 w-2 bg-primary-600 rounded-full mt-2"></div>
              <p className="text-gray-700">{recommendation}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

