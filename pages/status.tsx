import React, { useState, useEffect } from 'react';
import { 
  Monitor, 
  Activity, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Server,
  Database,
  Wifi,
  Zap,
  Shield,
  Globe
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { backend } from '@/lib/simulateBackend';
import { SystemStatus } from '@/types';
import { mockSystemStatus } from '@/lib/mockData';

const SystemStatusPage: React.FC = () => {
  const [systemStatus, setSystemStatus] = useState<SystemStatus[]>(mockSystemStatus);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState('1h');

  // Mock performance data
  const performanceData = [
    { time: '00:00', responseTime: 120, throughput: 850, errors: 2 },
    { time: '00:15', responseTime: 110, throughput: 920, errors: 1 },
    { time: '00:30', responseTime: 95, throughput: 1100, errors: 0 },
    { time: '00:45', responseTime: 130, throughput: 980, errors: 3 },
    { time: '01:00', responseTime: 85, throughput: 1200, errors: 1 },
    { time: '01:15', responseTime: 100, throughput: 1050, errors: 0 },
    { time: '01:30', responseTime: 115, throughput: 960, errors: 2 },
    { time: '01:45', responseTime: 90, throughput: 1150, errors: 1 },
  ];

  const systemMetrics = [
    { name: 'CPU Usage', value: 45, unit: '%', status: 'good' },
    { name: 'Memory', value: 62, unit: '%', status: 'warning' },
    { name: 'Disk I/O', value: 78, unit: '%', status: 'critical' },
    { name: 'Network', value: 23, unit: '%', status: 'good' },
  ];

  useEffect(() => {
    const loadSystemStatus = async () => {
      const status = await backend.getSystemStatus();
      setSystemStatus(status);
    };

    loadSystemStatus();
    const interval = setInterval(loadSystemStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  const refreshStatus = async () => {
    setIsRefreshing(true);
    try {
      const status = await backend.getSystemStatus();
      setSystemStatus(status);
    } finally {
      setIsRefreshing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-600';
      case 'degraded': return 'text-yellow-600';
      case 'offline': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-50 border-green-200';
      case 'degraded': return 'bg-yellow-50 border-yellow-200';
      case 'offline': return 'bg-red-50 border-red-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const getStatusIndicator = (status: string) => {
    switch (status) {
      case 'online': return 'status-active';
      case 'degraded': return 'status-warning';
      case 'offline': return 'status-error';
      default: return 'status-inactive';
    }
  };

  const getMetricColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getMetricBg = (status: string) => {
    switch (status) {
      case 'good': return 'bg-green-600';
      case 'warning': return 'bg-yellow-600';
      case 'critical': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  const overallStats = {
    totalSystems: systemStatus.length,
    online: systemStatus.filter(s => s.status === 'online').length,
    degraded: systemStatus.filter(s => s.status === 'degraded').length,
    offline: systemStatus.filter(s => s.status === 'offline').length,
    avgResponseTime: Math.round(systemStatus.reduce((acc, s) => acc + (s.responseTime || 0), 0) / systemStatus.length),
    totalErrors: systemStatus.reduce((acc, s) => acc + s.errorCount, 0)
  };

  const uptime = ((overallStats.online / overallStats.totalSystems) * 100).toFixed(1);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">System Status</h1>
          <p className="text-gray-600 mt-2">
            Real-time monitoring of all system components and integrations
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="status-indicator status-active"></div>
            <span className="text-sm text-gray-600">Auto-refresh: 10s</span>
          </div>
          <button
            onClick={refreshStatus}
            disabled={isRefreshing}
            className="btn btn-primary flex items-center space-x-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="card">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{uptime}%</p>
            <p className="text-sm text-gray-600">Uptime</p>
          </div>
        </div>
        <div className="card">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{overallStats.online}</p>
            <p className="text-sm text-gray-600">Online</p>
          </div>
        </div>
        <div className="card">
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-600">{overallStats.degraded}</p>
            <p className="text-sm text-gray-600">Degraded</p>
          </div>
        </div>
        <div className="card">
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">{overallStats.offline}</p>
            <p className="text-sm text-gray-600">Offline</p>
          </div>
        </div>
        <div className="card">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{overallStats.avgResponseTime}ms</p>
            <p className="text-sm text-gray-600">Avg Response</p>
          </div>
        </div>
        <div className="card">
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">{overallStats.totalErrors}</p>
            <p className="text-sm text-gray-600">Total Errors</p>
          </div>
        </div>
      </div>

      {/* System Status Grid */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-xl font-semibold text-gray-900">System Components</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {systemStatus.map((system) => (
            <div
              key={system.name}
              className={`p-4 rounded-lg border-2 ${getStatusBg(system.status)}`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className={`status-indicator ${getStatusIndicator(system.status)}`}></div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{system.name}</h3>
                    <p className="text-sm text-gray-600">
                      {system.responseTime ? `${system.responseTime}ms` : 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-sm font-medium ${getStatusColor(system.status)}`}>
                    {system.status}
                  </span>
                  {system.status === 'online' && system.responseTime && system.responseTime < 200 && (
                    <TrendingUp className="h-4 w-4 text-green-600 mt-1" />
                  )}
                  {system.status === 'degraded' && (
                    <TrendingDown className="h-4 w-4 text-yellow-600 mt-1" />
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Last check:</span>
                  <span className="text-gray-900">
                    {new Date(system.lastCheck).toLocaleTimeString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Errors:</span>
                  <span className={`${system.errorCount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {system.errorCount}
                  </span>
                </div>
                
                {/* Response Time Indicator */}
                {system.responseTime && (
                  <div className="mt-2">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Response Time</span>
                      <span>{system.responseTime}ms</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1">
                      <div
                        className={`h-1 rounded-full transition-all duration-300 ${
                          system.responseTime < 200 ? 'bg-green-600' :
                          system.responseTime < 500 ? 'bg-yellow-600' : 'bg-red-600'
                        }`}
                        style={{ width: `${Math.min(100, (system.responseTime / 1000) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Response Time</h2>
              <select
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value)}
                className="text-sm border border-gray-300 rounded px-2 py-1"
              >
                <option value="1h">Last Hour</option>
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
              </select>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="responseTime" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="text-xl font-semibold text-gray-900">Throughput</h2>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="throughput" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* System Metrics */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-xl font-semibold text-gray-900">System Metrics</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {systemMetrics.map((metric) => (
            <div key={metric.name} className="text-center">
              <div className="relative w-24 h-24 mx-auto mb-4">
                <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke="#e5e7eb"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke={getMetricBg(metric.status).replace('bg-', '')}
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${metric.value * 2.83} 283`}
                    className="transition-all duration-500"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`text-lg font-bold ${getMetricColor(metric.status)}`}>
                    {metric.value}{metric.unit}
                  </span>
                </div>
              </div>
              <h3 className="font-medium text-gray-900">{metric.name}</h3>
              <p className={`text-sm ${getMetricColor(metric.status)}`}>
                {metric.status}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Alerts & Notifications */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-xl font-semibold text-gray-900">Recent Alerts</h2>
        </div>
        <div className="space-y-3">
          {[
            { 
              type: 'warning', 
              message: 'Redox API response time increased to 1.2s', 
              time: '2 minutes ago',
              system: 'Redox API'
            },
            { 
              type: 'error', 
              message: 'Clinical AI service temporarily unavailable', 
              time: '15 minutes ago',
              system: 'Clinical AI'
            },
            { 
              type: 'info', 
              message: 'Epic EHR connection restored', 
              time: '1 hour ago',
              system: 'Epic EHR'
            },
            { 
              type: 'success', 
              message: 'All systems operating normally', 
              time: '2 hours ago',
              system: 'System'
            }
          ].map((alert, index) => (
            <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0">
                {alert.type === 'error' && <AlertCircle className="h-5 w-5 text-red-600" />}
                {alert.type === 'warning' && <AlertCircle className="h-5 w-5 text-yellow-600" />}
                {alert.type === 'info' && <Activity className="h-5 w-5 text-blue-600" />}
                {alert.type === 'success' && <CheckCircle className="h-5 w-5 text-green-600" />}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{alert.message}</p>
                <p className="text-xs text-gray-500">{alert.system} • {alert.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SystemStatusPage;