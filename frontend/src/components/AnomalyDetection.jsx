import { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle, XCircle, Eye, Shield, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import apiClient from '../lib/apiClient';
import { formatCurrency, formatDate } from '../utils/formatters';

const severityMap = {
  high: 'bg-red-100 text-red-800 border-red-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  low: 'bg-blue-100 text-blue-800 border-blue-200'
};

export default function AnomalyDetection() {
  const [anomalies, setAnomalies] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const fetchAnomalies = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/anomalies');
      const anomalies = response.data.data || [];
      setAnomalies(anomalies);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnomalies();
  }, [fetchAnomalies]);

  const handleStatusChange = async (id, status) => {
    try {
      await apiClient.put(`/anomalies/${id}`, { status });
      setAnomalies((prev) => prev.map((item) => (item._id === id ? { ...item, status } : item)));
      toast.success(`Anomaly marked as ${status}`);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const filteredAnomalies = useMemo(
    () => anomalies.filter((anomaly) => (filter === 'all' ? true : anomaly.status === filter)),
    [anomalies, filter]
  );

  const stats = {
    total: anomalies.length,
    pending: anomalies.filter((a) => a.status === 'new').length,
    resolved: anomalies.filter((a) => a.status === 'resolved').length,
    high: anomalies.filter((a) => a.severity === 'high').length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-12 text-gray-500">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        Running anomaly detection...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Anomaly Detection</h1>
        <p className="text-gray-600 mt-1">AI-powered fraud and anomaly detection</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Anomalies</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{stats.total}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-orange-500" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600 mt-2">{stats.pending}</p>
            </div>
            <XCircle className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Resolved</p>
              <p className="text-2xl font-bold text-green-600 mt-2">{stats.resolved}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">High Severity</p>
              <p className="text-2xl font-bold text-red-600 mt-2">{stats.high}</p>
            </div>
            <Shield className="h-8 w-8 text-red-500" />
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center space-x-4">
          {['all', 'new', 'resolved'].map((value) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={`px-4 py-2 rounded-lg transition-colors capitalize ${
                filter === value ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {value}
            </button>
          ))}
        </div>
      </div>

      {filteredAnomalies.length === 0 ? (
        <div className="card text-center text-gray-500 py-8">No anomalies in this filter.</div>
      ) : (
        <div className="space-y-4">
          {filteredAnomalies.map((anomaly) => (
            <div key={anomaly._id} className="card">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center flex-wrap gap-2 mb-3">
                    <AlertTriangle
                      className={`h-5 w-5 ${
                        anomaly.severity === 'high' ? 'text-red-500' : anomaly.severity === 'medium' ? 'text-yellow-500' : 'text-blue-500'
                      }`}
                    />
                    <h3 className="font-semibold text-gray-900">{anomaly.type}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${severityMap[anomaly.severity] || 'bg-gray-100'}`}>
                      {anomaly.severity}
                    </span>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        anomaly.status === 'resolved'
                          ? 'bg-green-100 text-green-800'
                          : anomaly.status === 'ignored'
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {anomaly.status}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-3">{anomaly.description}</p>
                  {anomaly.transaction ? (
                    <div className="flex items-center flex-wrap gap-2 text-sm text-gray-500">
                      <span>Merchant: {anomaly.transaction.merchant || '—'}</span>
                      <span>•</span>
                      <span>Amount: {formatCurrency(anomaly.transaction.amount, anomaly.transaction.currency)}</span>
                      <span>•</span>
                      <span>Date: {formatDate(anomaly.transaction.date)}</span>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No transaction details available.</p>
                  )}
                  {anomaly.metadata?.recommendation && (
                    <p className="text-sm text-blue-600 mt-2">💡 {anomaly.metadata.recommendation}</p>
                  )}
                </div>
                {anomaly.status === 'new' && (
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleStatusChange(anomaly._id, 'resolved')}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
                    >
                      Resolve
                    </button>
                    <button
                      onClick={() => handleStatusChange(anomaly._id, 'ignored')}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm font-medium"
                    >
                      Ignore
                    </button>
                    <button className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200">
                      <Eye className="h-5 w-5 text-gray-600" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

