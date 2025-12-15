import { useEffect, useMemo, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { TrendingUp, DollarSign, Activity, Loader2, FileText, Plus, Send, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import apiClient from '../lib/apiClient';
import { formatCurrency } from '../utils/formatters';

export default function Analytics() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [participants, setParticipants] = useState([{ name: '', phone: '', amount: '' }]);
  const [description, setDescription] = useState('');
  const [sending, setSending] = useState(false);

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

  const addParticipant = () => {
    setParticipants([...participants, { name: '', phone: '', amount: '' }]);
  };

  const updateParticipant = (index, field, value) => {
    const updated = [...participants];
    updated[index][field] = value;
    setParticipants(updated);
  };

  const removeParticipant = (index) => {
    if (participants.length > 1) {
      const updated = [...participants];
      updated.splice(index, 1);
      setParticipants(updated);
    }
  };

  const calculateSplit = () => {
    const total = participants.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
    return total;
  };

  const sendSplitNotifications = async () => {
    if (!description.trim()) {
      toast.error('Please enter a description for the split');
      return;
    }

    const invalidParticipants = participants.some(p => !p.name.trim() || !p.phone.trim() || isNaN(parseFloat(p.amount)));
    if (invalidParticipants) {
      toast.error('Please fill in all participant names, phone numbers, and valid amounts');
      return;
    }

    setSending(true);
    try {
      await apiClient.post('/analytics/split-notifications', {
        description,
        participants,
        total: calculateSplit()
      });
      toast.success('Split notifications sent successfully!');
      // Reset form
      setParticipants([{ name: '', phone: '', amount: '' }]);
      setDescription('');
    } catch (error) {
      toast.error(error.message || 'Failed to send notifications');
    } finally {
      setSending(false);
    }
  };

  const monthlyData = summary?.monthlyPerformance || [];

  const metrics = useMemo(() => {
    const totals = summary?.totals || { totalIncome: 0, totalExpenses: 0, documentCount: 0 };
    const latest = monthlyData.at(-1) || {};
    const recentTransactions = summary?.recentTransactions || [];
    return [
      {
        label: 'Total Income',
        value: formatCurrency(totals.totalIncome),
        trailing: latest.income,
        icon: DollarSign,
        color: 'text-green-600'
      },
      {
        label: 'Total Expenses',
        value: formatCurrency(totals.totalExpenses),
        trailing: latest.expenses,
        icon: Activity,
        color: 'text-red-600'
      },
      {
        label: 'Net Profit',
        value: formatCurrency(totals.totalIncome - totals.totalExpenses),
        trailing: latest.profit,
        icon: TrendingUp,
        color: 'text-blue-600'
      },
      {
        label: 'Documents Processed',
        value: totals.documentCount?.toString() || '0',
        trailing: recentTransactions.length,
        icon: FileText,
        color: 'text-purple-600'
      }
    ];
  }, [monthlyData, summary]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-12 text-gray-500">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        Loading analytics...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600 mt-1">Comprehensive financial analytics and insights</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div key={metric.label} className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{metric.label}</p>
                  <p className={`text-2xl font-bold text-gray-900 mt-2 ${metric.color}`}>{metric.value}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Last month: {metric.trailing ? formatCurrency(metric.trailing) : '—'}
                  </p>
                </div>
                <Icon className={`h-8 w-8 ${metric.color}`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Keep Monthly Performance Chart */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Monthly Performance</h2>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} />
            <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Add Money Split Functionality */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Money Split Calculator</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Dinner bill, Trip expenses"
              className="input-field w-full"
            />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-medium text-gray-900">Participants</h3>
              <button
                type="button"
                onClick={addParticipant}
                className="btn-secondary flex items-center space-x-1 text-sm"
              >
                <Plus className="h-4 w-4" />
                <span>Add Person</span>
              </button>
            </div>

            {participants.map((participant, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                <div className="md:col-span-4">
                  <label className="block text-xs text-gray-500 mb-1">Name</label>
                  <input
                    type="text"
                    value={participant.name}
                    onChange={(e) => updateParticipant(index, 'name', e.target.value)}
                    placeholder="Participant name"
                    className="input-field w-full"
                  />
                </div>
                <div className="md:col-span-4">
                  <label className="block text-xs text-gray-500 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={participant.phone}
                    onChange={(e) => updateParticipant(index, 'phone', e.target.value)}
                    placeholder="+1234567890"
                    className="input-field w-full"
                  />
                </div>
                <div className="md:col-span-3">
                  <label className="block text-xs text-gray-500 mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    value={participant.amount}
                    onChange={(e) => updateParticipant(index, 'amount', e.target.value)}
                    placeholder="0.00"
                    className="input-field w-full"
                    step="0.01"
                  />
                </div>
                <div className="md:col-span-1">
                  {participants.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeParticipant(index)}
                      className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}

            <div className="pt-2 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-900">Total:</span>
                <span className="text-lg font-bold text-gray-900">{formatCurrency(calculateSplit())}</span>
              </div>
            </div>

            <button
              onClick={sendSplitNotifications}
              disabled={sending}
              className="btn-primary flex items-center justify-center space-x-2 w-full"
            >
              <Send className={`h-4 w-4 ${sending ? 'animate-spin' : ''}`} />
              <span>{sending ? 'Sending...' : 'Send Split Notifications via SMS'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}