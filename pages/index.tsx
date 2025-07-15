import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Brain, 
  CheckCircle, 
  Share2, 
  Users, 
  FileText,
  Clock,
  TrendingUp,
  AlertCircle,
  CheckSquare
} from 'lucide-react';
import { backend } from '@/lib/simulateBackend';
import { SystemStatus } from '@/types';

const Dashboard: React.FC = () => {
  const [systemStatus, setSystemStatus] = useState<SystemStatus[]>([]);
  const [stats, setStats] = useState({
    activeSessions: 3,
    notesGenerated: 47,
    avgProcessingTime: 2.4,
    accuracy: 94.7
  });

  useEffect(() => {
    const loadSystemStatus = async () => {
      const status = await backend.getSystemStatus();
      setSystemStatus(status);
    };

    loadSystemStatus();
    const interval = setInterval(loadSystemStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      title: 'Ambient Listening',
      description: 'Real-time audio capture and transcription with speaker identification',
      icon: Activity,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      href: '/ambient'
    },
    {
      title: 'Clinical Understanding',
      description: 'AI-powered extraction of medical entities and structured documentation',
      icon: Brain,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      href: '/clinical'
    },
    {
      title: 'Smart Review',
      description: 'Intelligent suggestions for completeness and accuracy',
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      href: '/review'
    },
    {
      title: 'Integration Layer',
      description: 'Seamless integration with EHR systems and FHIR compliance',
      icon: Share2,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      href: '/integration'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-600';
      case 'degraded': return 'text-yellow-600';
      case 'offline': return 'text-red-600';
      default: return 'text-gray-600';
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Hospital Charting Automation</h1>
        <p className="text-primary-100 text-lg">
          Demonstrating AI-powered clinical documentation with ambient listening, 
          clinical understanding, smart review, and seamless integration.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Sessions</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeSessions}</p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Notes Generated</p>
              <p className="text-2xl font-bold text-gray-900">{stats.notesGenerated}</p>
            </div>
            <FileText className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Processing Time</p>
              <p className="text-2xl font-bold text-gray-900">{stats.avgProcessingTime}s</p>
            </div>
            <Clock className="h-8 w-8 text-purple-600" />
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Accuracy</p>
              <p className="text-2xl font-bold text-gray-900">{stats.accuracy}%</p>
            </div>
            <TrendingUp className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <div key={feature.title} className="card hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-lg ${feature.bgColor}`}>
                  <Icon className={`h-6 w-6 ${feature.color}`} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 mb-4">{feature.description}</p>
                  <a
                    href={feature.href}
                    className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Try Demo →
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* System Status */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-xl font-semibold text-gray-900">System Status</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {systemStatus.map((system) => (
            <div key={system.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`status-indicator ${getStatusIndicator(system.status)}`}></div>
                <div>
                  <p className="font-medium text-gray-900">{system.name}</p>
                  <p className="text-sm text-gray-600">
                    {system.responseTime ? `${system.responseTime}ms` : 'N/A'}
                  </p>
                </div>
              </div>
              <span className={`text-sm font-medium ${getStatusColor(system.status)}`}>
                {system.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
        </div>
        <div className="space-y-4">
          {[
            { time: '2 minutes ago', action: 'Session started for Patient #1234', type: 'session' },
            { time: '5 minutes ago', action: 'Note finalized and submitted to Epic EHR', type: 'integration' },
            { time: '8 minutes ago', action: 'Clinical entities extracted from transcription', type: 'clinical' },
            { time: '12 minutes ago', action: 'Review suggestions generated for Note #5678', type: 'review' },
            { time: '15 minutes ago', action: 'Ambient listening session completed', type: 'ambient' }
          ].map((activity, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0">
                {activity.type === 'session' && <Users className="h-5 w-5 text-blue-600" />}
                {activity.type === 'integration' && <Share2 className="h-5 w-5 text-orange-600" />}
                {activity.type === 'clinical' && <Brain className="h-5 w-5 text-purple-600" />}
                {activity.type === 'review' && <CheckSquare className="h-5 w-5 text-green-600" />}
                {activity.type === 'ambient' && <Activity className="h-5 w-5 text-blue-600" />}
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">{activity.action}</p>
                <p className="text-xs text-gray-500">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;