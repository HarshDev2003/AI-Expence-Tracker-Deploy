import { DollarSign, TrendingUp, TrendingDown, FileText, Bell } from 'lucide-react';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router-dom';

const stats = [
  { name: 'Total Balance', value: '$12,450.50', change: '+5.2%', icon: DollarSign, color: 'text-green-600' },
  { name: 'Monthly Income', value: '$5,000.00', change: '+0%', icon: TrendingUp, color: 'text-blue-600' },
  { name: 'Monthly Expenses', value: '$3,250.00', change: '-8.1%', icon: TrendingDown, color: 'text-red-600' },
  { name: 'Documents', value: '24', change: '+3', icon: FileText, color: 'text-purple-600' },
];

const spendingData = [
  { month: 'Jan', amount: 3200 },
  { month: 'Feb', amount: 3800 },
  { month: 'Mar', amount: 3500 },
  { month: 'Apr', amount: 4200 },
  { month: 'May', amount: 4000 },
  { month: 'Jun', amount: 3250 },
];

const categoryData = [
  { name: 'Groceries', value: 35, color: '#3b82f6' },
  { name: 'Shopping', value: 25, color: '#10b981' },
  { name: 'Food', value: 20, color: '#f59e0b' },
  { name: 'Gas', value: 12, color: '#ef4444' },
  { name: 'Utilities', value: 8, color: '#8b5cf6' },
];

const recentTransactions = [
  { id: 1, merchant: 'Walmart', amount: 125.50, category: 'Groceries', date: '2024-03-15' },
  { id: 2, merchant: 'Amazon', amount: 89.99, category: 'Shopping', date: '2024-03-14' },
  { id: 3, merchant: 'Starbucks', amount: 12.50, category: 'Food', date: '2024-03-13' },
];

export default function UserDashboardHome() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's your financial overview</p>
        </div>
        <Link to="/user/reminders" className="btn-primary flex items-center space-x-2">
          <Bell className="h-5 w-5" />
          <span>View Reminders</span>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className={`text-2xl font-bold mt-2 ${stat.color}`}>{stat.value}</p>
                  <p className={`text-sm mt-1 ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.change}
                  </p>
                </div>
                <div className="bg-gray-100 p-3 rounded-lg">
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Monthly Spending</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={spendingData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Spending by Category</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Recent Transactions</h2>
          <Link to="/user/transactions" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
            View all
          </Link>
        </div>
        <div className="space-y-3">
          {recentTransactions.map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="bg-primary-100 p-2 rounded-lg">
                  <FileText className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{transaction.merchant}</p>
                  <p className="text-sm text-gray-500">{transaction.category} • {transaction.date}</p>
                </div>
              </div>
              <p className="text-lg font-semibold text-red-600">-${transaction.amount.toFixed(2)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

