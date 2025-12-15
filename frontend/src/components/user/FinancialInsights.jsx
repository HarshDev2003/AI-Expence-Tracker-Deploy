import { Lightbulb, TrendingUp, AlertCircle, Target, DollarSign } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const insights = [
  {
    type: 'savings',
    title: 'Potential Monthly Savings',
    description: 'Based on your spending patterns, you could save up to $450/month by reducing dining out expenses.',
    value: '$450',
    icon: DollarSign,
    color: 'bg-green-100 text-green-600',
  },
  {
    type: 'trend',
    title: 'Spending Trend',
    description: 'Your grocery spending has increased by 15% compared to last month. Consider reviewing your shopping habits.',
    value: '+15%',
    icon: TrendingUp,
    color: 'bg-yellow-100 text-yellow-600',
  },
  {
    type: 'alert',
    title: 'Budget Alert',
    description: 'You\'ve spent 85% of your monthly budget. Consider reducing non-essential expenses.',
    value: '85%',
    icon: AlertCircle,
    color: 'bg-red-100 text-red-600',
  },
  {
    type: 'goal',
    title: 'Savings Goal Progress',
    description: 'You\'re 60% towards your annual savings goal. Keep up the good work!',
    value: '60%',
    icon: Target,
    color: 'bg-blue-100 text-blue-600',
  },
];

const forecastData = [
  { month: 'Jan', actual: 3200, forecast: 3400 },
  { month: 'Feb', actual: 3800, forecast: 3600 },
  { month: 'Mar', actual: 3500, forecast: 3500 },
  { month: 'Apr', actual: 4200, forecast: 3800 },
  { month: 'May', forecast: 4000 },
  { month: 'Jun', forecast: 3900 },
];

export default function FinancialInsights() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Financial Insights</h1>
        <p className="text-gray-600 mt-1">AI-powered insights and recommendations</p>
      </div>

      {/* Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {insights.map((insight, idx) => {
          const Icon = insight.icon;
          return (
            <div key={idx} className="card">
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

      {/* Forecast Chart */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Spending Forecast</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={forecastData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="actual" stroke="#3b82f6" strokeWidth={2} name="Actual" />
            <Line type="monotone" dataKey="forecast" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" name="Forecast" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Recommendations */}
      <div className="card">
        <div className="flex items-center space-x-2 mb-4">
          <Lightbulb className="h-6 w-6 text-yellow-500" />
          <h2 className="text-xl font-semibold text-gray-900">AI Recommendations</h2>
        </div>
        <div className="space-y-4">
          {[
            'Consider setting up automatic savings transfers to reach your goals faster.',
            'Your electricity bill is typically due around the 15th of each month. Set a reminder to avoid late fees.',
            'Based on your patterns, you usually buy groceries around the 10th. Time to restock!',
            'You\'ve been spending more on dining out. Consider meal prepping to save money.',
          ].map((recommendation, idx) => (
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

