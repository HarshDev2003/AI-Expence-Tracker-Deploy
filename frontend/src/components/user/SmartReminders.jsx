import { Bell, Calendar, DollarSign, ShoppingCart, Zap, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

const mockReminders = [
  {
    id: 1,
    type: 'purchase',
    title: 'Grocery Shopping Reminder',
    description: 'You usually buy groceries around the 10th of each month. Time to restock!',
    date: '2024-03-10',
    category: 'Groceries',
    icon: ShoppingCart,
    color: 'bg-blue-100 text-blue-600',
    status: 'active',
  },
  {
    id: 2,
    type: 'bill',
    title: 'Electricity Bill Due',
    description: 'Your electricity bill is due next week. Don\'t forget to pay!',
    date: '2024-03-22',
    category: 'Utilities',
    icon: Zap,
    color: 'bg-yellow-100 text-yellow-600',
    status: 'active',
  },
  {
    id: 3,
    type: 'purchase',
    title: 'Monthly Subscription',
    description: 'Your Netflix subscription will renew in 3 days.',
    date: '2024-03-18',
    category: 'Subscriptions',
    icon: DollarSign,
    color: 'bg-purple-100 text-purple-600',
    status: 'active',
  },
  {
    id: 4,
    type: 'bill',
    title: 'Credit Card Payment',
    description: 'Credit card payment due on March 25th.',
    date: '2024-03-25',
    category: 'Payments',
    icon: Calendar,
    color: 'bg-red-100 text-red-600',
    status: 'completed',
  },
];

export default function SmartReminders() {
  const [reminders, setReminders] = useState(mockReminders);

  const handleComplete = (id) => {
    setReminders(reminders.map(r => 
      r.id === id ? { ...r, status: 'completed' } : r
    ));
    toast.success('Reminder marked as completed');
  };

  const activeReminders = reminders.filter(r => r.status === 'active');
  const completedReminders = reminders.filter(r => r.status === 'completed');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Smart Reminders</h1>
        <p className="text-gray-600 mt-1">AI-powered spending pattern reminders</p>
      </div>

      {/* Stats */}
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
              <p className="text-2xl font-bold text-orange-600 mt-2">
                {reminders.filter(r => {
                  const reminderDate = new Date(r.date);
                  const today = new Date();
                  const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
                  return reminderDate >= today && reminderDate <= weekFromNow && r.status === 'active';
                }).length}
              </p>
            </div>
            <Calendar className="h-8 w-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Active Reminders */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Active Reminders</h2>
        <div className="space-y-4">
          {activeReminders.map((reminder) => {
            const Icon = reminder.icon;
            return (
              <div key={reminder.id} className="card">
                <div className="flex items-start space-x-4">
                  <div className={`p-3 rounded-lg ${reminder.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{reminder.title}</h3>
                      <span className="text-sm text-gray-500">{reminder.date}</span>
                    </div>
                    <p className="text-gray-600 mb-3">{reminder.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                        {reminder.category}
                      </span>
                      <button
                        onClick={() => handleComplete(reminder.id)}
                        className="btn-primary text-sm"
                      >
                        Mark Complete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Completed Reminders */}
      {completedReminders.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Completed Reminders</h2>
          <div className="space-y-4">
            {completedReminders.map((reminder) => {
              const Icon = reminder.icon;
              return (
                <div key={reminder.id} className="card opacity-75">
                  <div className="flex items-start space-x-4">
                    <div className={`p-3 rounded-lg ${reminder.color}`}>
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

