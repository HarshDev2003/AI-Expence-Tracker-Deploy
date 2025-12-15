import { useEffect, useMemo, useState } from 'react';
import { Bell, Calendar, DollarSign, ShoppingCart, Zap, CheckCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import apiClient from '../lib/apiClient';
import { formatDate } from '../utils/formatters';

const ICON_MAP = {
  groceries: { icon: ShoppingCart, color: 'bg-blue-100 text-blue-600' },
  utilities: { icon: Zap, color: 'bg-yellow-100 text-yellow-600' },
  subscriptions: { icon: DollarSign, color: 'bg-purple-100 text-purple-600' },
  payments: { icon: Calendar, color: 'bg-red-100 text-red-600' },
  default: { icon: Bell, color: 'bg-primary-100 text-primary-600' }
};

const buildReminders = (transactions = []) => {
  const categoryMap = transactions.reduce((acc, trx) => {
    if (!trx.category) return acc;
    const key = trx.category.toLowerCase();
    acc[key] = acc[key] || { category: trx.category, dates: [], amounts: [], merchants: [] };
    acc[key].dates.push(new Date(trx.date));
    acc[key].amounts.push(trx.amount);
    acc[key].merchants.push(trx.merchant);
    return acc;
  }, {});

  return Object.values(categoryMap)
    .map((entry) => {
      entry.dates.sort((a, b) => a - b);
      if (entry.dates.length < 2) return null;
      const intervals = [];
      for (let i = 1; i < entry.dates.length; i += 1) {
        intervals.push(entry.dates[i] - entry.dates[i - 1]);
      }
      const avgInterval = intervals.reduce((acc, val) => acc + val, 0) / intervals.length || 30 * 24 * 60 * 60 * 1000;
      const lastDate = entry.dates[entry.dates.length - 1];
      const nextDate = new Date(lastDate.getTime() + avgInterval);
      const merchant = entry.merchants[entry.merchants.length - 1];
      const amount = entry.amounts[entry.amounts.length - 1];
      return {
        id: `${entry.category}-${nextDate.toISOString()}`,
        title: `${entry.category} reminder`,
        description: `You last spent ${amount ? `$${amount.toFixed(2)}` : ''} at ${merchant || 'this category'} on ${formatDate(
          lastDate
        )}. Expect the next spend soon.`,
        date: nextDate,
        category: entry.category,
        status: nextDate < new Date() ? 'due' : 'active'
      };
    })
    .filter(Boolean);
};

export default function SmartReminders() {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReminders = async () => {
      try {
        const response = await apiClient.get('/transactions');
        const generated = buildReminders(response.data.data || []);
        setReminders(generated);
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReminders();
  }, []);

  const handleComplete = (id) => {
    setReminders((prev) => prev.map((reminder) => (reminder.id === id ? { ...reminder, status: 'completed' } : reminder)));
    toast.success('Reminder marked as completed');
  };

  const activeReminders = useMemo(() => reminders.filter((r) => r.status === 'active' || r.status === 'due'), [reminders]);
  const completedReminders = useMemo(() => reminders.filter((r) => r.status === 'completed'), [reminders]);

  const upcomingThisWeek = useMemo(() => {
    const today = new Date();
    const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    return activeReminders.filter((reminder) => reminder.date >= today && reminder.date <= weekFromNow).length;
  }, [activeReminders]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Smart Reminders</h1>
        <p className="text-gray-600 mt-1">AI-powered spending pattern reminders</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Reminders</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{activeReminders.length}</p>
            </div>
            <Bell className="h-8 w-8 text-primary-500" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600 mt-2">{completedReminders.length}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Upcoming This Week</p>
              <p className="text-2xl font-bold text-orange-600 mt-2">{upcomingThisWeek}</p>
            </div>
            <Calendar className="h-8 w-8 text-orange-500" />
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Active Reminders</h2>
        {loading ? (
          <div className="card text-center py-10 text-gray-500">
            <Loader2 className="h-5 w-5 animate-spin inline mr-2" />
            Building reminders...
          </div>
        ) : activeReminders.length === 0 ? (
          <div className="card text-center py-10 text-gray-500">No reminders yet. Upload more transactions.</div>
        ) : (
          <div className="space-y-4">
            {activeReminders.map((reminder) => {
              const iconConfig = ICON_MAP[reminder.category?.toLowerCase()] || ICON_MAP.default;
              const Icon = iconConfig.icon;
              return (
                <div key={reminder.id} className="card">
                  <div className="flex items-start space-x-4">
                    <div className={`p-3 rounded-lg ${iconConfig.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900 capitalize">{reminder.title}</h3>
                        <span className="text-sm text-gray-500">{formatDate(reminder.date)}</span>
                      </div>
                      <p className="text-gray-600 mb-3">{reminder.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700 capitalize">
                          {reminder.category}
                        </span>
                        <button onClick={() => handleComplete(reminder.id)} className="btn-primary text-sm">
                          Mark Complete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {completedReminders.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Completed Reminders</h2>
          <div className="space-y-4">
            {completedReminders.map((reminder) => {
              const iconConfig = ICON_MAP[reminder.category?.toLowerCase()] || ICON_MAP.default;
              const Icon = iconConfig.icon;
              return (
                <div key={reminder.id} className="card opacity-75">
                  <div className="flex items-start space-x-4">
                    <div className={`p-3 rounded-lg ${iconConfig.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900 line-through">{reminder.title}</h3>
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      </div>
                      <p className="text-gray-600">{reminder.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

