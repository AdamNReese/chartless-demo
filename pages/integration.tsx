import React, { useState, useEffect } from 'react';
import { 
  Share2, 
  Database, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  RefreshCw,
  Settings,
  Send,
  Eye,
  Download,
  Upload,
  Zap,
  Server,
  Activity,
  FileText,
  Shield
} from 'lucide-react';
import { backend } from '@/lib/simulateBackend';
import { SystemStatus, IntegrationResult } from '@/types';
import { mockSystemStatus, mockNote } from '@/lib/mockData';

const Integration: React.FC = () => {
  const [systemStatus, setSystemStatus] = useState<SystemStatus[]>(mockSystemStatus);
  const [integrationResults, setIntegrationResults] = useState<IntegrationResult[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedSystems, setSelectedSystems] = useState<string[]>(['Epic EHR', 'Cerner EHR']);
  const [isTestingConnections, setIsTestingConnections] = useState(false);
  const [showFhirViewer, setShowFhirViewer] = useState(false);

  useEffect(() => {
    const loadSystemStatus = async () => {
      const status = await backend.getSystemStatus();
      setSystemStatus(status);
    };

    const handleIntegrationResults = (results: IntegrationResult[]) => {
      setIntegrationResults(results);
    };

    loadSystemStatus();
    backend.on('integration-results', handleIntegrationResults);

    return () => {
      backend.off('integration-results', handleIntegrationResults);
    };
  }, []);

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

  const testConnections = async () => {
    setIsTestingConnections(true);
    
    // Simulate connection tests
    const updatedStatus = await Promise.all(
      systemStatus.map(async (system) => {
        const isConnected = await backend.testConnection(system.name);
        return {
          ...system,
          status: isConnected ? 'online' : 'offline',
          lastCheck: Date.now(),
          responseTime: isConnected ? Math.random() * 300 + 100 : 0
        } as SystemStatus;
      })
    );

    setSystemStatus(updatedStatus);
    setIsTestingConnections(false);
  };

  const submitNote = async () => {
    setIsSubmitting(true);
    
    try {
      await backend.finalizeNote(mockNote.id, selectedSystems);
    } catch (error) {
      console.error('Failed to submit note:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleSystem = (systemName: string) => {
    setSelectedSystems(prev => 
      prev.includes(systemName) 
        ? prev.filter(s => s !== systemName)
        : [...prev, systemName]
    );
  };

  const fhirExample = `{
  "resourceType": "DocumentReference",
  "id": "note_${mockNote.id}",
  "status": "current",
  "type": {
    "coding": [{
      "system": "http://loinc.org",
      "code": "11506-3",
      "display": "Progress note"
    }]
  },
  "subject": {
    "reference": "Patient/${mockNote.patientId}"
  },
  "author": [{
    "reference": "Practitioner/${mockNote.providerId}"
  }],
  "date": "${new Date().toISOString()}",
  "content": [{
    "attachment": {
      "contentType": "text/plain",
      "data": "UGF0aWVudCByZXBvcnRzIGNoZXN0IHBhaW4uLi4="
    }
  }]
}`;

  const integrationStats = {
    totalSubmissions: integrationResults.length,
    successful: integrationResults.filter(r => r.status === 'success').length,
    failed: integrationResults.filter(r => r.status === 'error').length,
    pending: integrationResults.filter(r => r.status === 'pending').length,
    onlineSystems: systemStatus.filter(s => s.status === 'online').length
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Integration Layer</h1>
          <p className="text-gray-600 mt-2">
            Seamless integration with EHR systems and FHIR-compliant data exchange
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={testConnections}
            disabled={isTestingConnections}
            className="btn btn-secondary flex items-center space-x-2"
          >
            <RefreshCw className={`h-4 w-4 ${isTestingConnections ? 'animate-spin' : ''}`} />
            <span>{isTestingConnections ? 'Testing...' : 'Test Connections'}</span>
          </button>
          <button
            onClick={() => setShowFhirViewer(!showFhirViewer)}
            className="btn btn-primary flex items-center space-x-2"
          >
            <Eye className="h-4 w-4" />
            <span>View FHIR</span>
          </button>
        </div>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="card">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{integrationStats.onlineSystems}</p>
            <p className="text-sm text-gray-600">Systems Online</p>
          </div>
        </div>
        <div className="card">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{integrationStats.successful}</p>
            <p className="text-sm text-gray-600">Successful</p>
          </div>
        </div>
        <div className="card">
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">{integrationStats.failed}</p>
            <p className="text-sm text-gray-600">Failed</p>
          </div>
        </div>
        <div className="card">
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-600">{integrationStats.pending}</p>
            <p className="text-sm text-gray-600">Pending</p>
          </div>
        </div>
        <div className="card">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{integrationStats.totalSubmissions}</p>
            <p className="text-sm text-gray-600">Total Submissions</p>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-xl font-semibold text-gray-900">System Status</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {systemStatus.map((system) => (
            <div
              key={system.name}
              className={`p-4 rounded-lg border-2 transition-colors ${getStatusBg(system.status)}`}
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
                <span className={`text-sm font-medium ${getStatusColor(system.status)}`}>
                  {system.status}
                </span>
              </div>
              
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Last check: {new Date(system.lastCheck).toLocaleTimeString()}</span>
                <span>Errors: {system.errorCount}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Note Submission */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card">
          <div className="card-header">
            <h2 className="text-xl font-semibold text-gray-900">Submit Clinical Note</h2>
          </div>
          
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3 mb-2">
                <FileText className="h-5 w-5 text-gray-600" />
                <span className="font-medium text-gray-900">Note #{mockNote.id}</span>
              </div>
              <p className="text-sm text-gray-600">
                {mockNote.structuredData.chiefComplaint} - {mockNote.status}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Created: {new Date(mockNote.timestamp).toLocaleString()}
              </p>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-3">Target Systems</h3>
              <div className="space-y-2">
                {systemStatus.filter(s => s.status === 'online').map((system) => (
                  <label key={system.name} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedSystems.includes(system.name)}
                      onChange={() => toggleSystem(system.name)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-gray-900">{system.name}</span>
                    <span className="text-xs text-gray-500">({system.responseTime}ms)</span>
                  </label>
                ))}
              </div>
            </div>

            <button
              onClick={submitNote}
              disabled={isSubmitting || selectedSystems.length === 0}
              className="btn btn-primary w-full flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>Submit to {selectedSystems.length} Systems</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Integration Results */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-xl font-semibold text-gray-900">Integration Results</h2>
          </div>
          
          <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-thin">
            {integrationResults.length === 0 ? (
              <div className="text-center py-8">
                <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No submissions yet</p>
              </div>
            ) : (
              integrationResults.map((result, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">{result.system}</span>
                      {result.status === 'success' && <CheckCircle className="h-4 w-4 text-green-600" />}
                      {result.status === 'error' && <AlertCircle className="h-4 w-4 text-red-600" />}
                      {result.status === 'pending' && <Clock className="h-4 w-4 text-yellow-600" />}
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(result.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  
                  {result.status === 'success' && result.result && (
                    <p className="text-sm text-green-700 bg-green-50 p-2 rounded">
                      {result.result}
                    </p>
                  )}
                  
                  {result.status === 'error' && result.error && (
                    <p className="text-sm text-red-700 bg-red-50 p-2 rounded">
                      {result.error}
                    </p>
                  )}
                  
                  {result.status === 'pending' && (
                    <p className="text-sm text-yellow-700 bg-yellow-50 p-2 rounded">
                      Processing submission...
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* FHIR Viewer */}
      {showFhirViewer && (
        <div className="card">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">FHIR Document Preview</h2>
              <button
                onClick={() => setShowFhirViewer(false)}
                className="btn btn-secondary"
              >
                Hide
              </button>
            </div>
          </div>
          
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
            <pre>{fhirExample}</pre>
          </div>
          
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4 text-green-600" />
              <span className="text-sm text-gray-600">FHIR R4 Compliant</span>
            </div>
            <div className="flex items-center space-x-2">
              <button className="btn btn-secondary btn-sm">
                <Download className="h-3 w-3 mr-1" />
                Download
              </button>
              <button className="btn btn-primary btn-sm">
                <Upload className="h-3 w-3 mr-1" />
                Validate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Integration Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Shield className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900">FHIR R4</h3>
          </div>
          <p className="text-sm text-gray-600">
            Full compliance with FHIR R4 standards for seamless healthcare data exchange.
          </p>
        </div>
        
        <div className="card">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <Zap className="h-5 w-5 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Real-time Sync</h3>
          </div>
          <p className="text-sm text-gray-600">
            Instant synchronization with multiple EHR systems for immediate data availability.
          </p>
        </div>
        
        <div className="card">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Server className="h-5 w-5 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Multi-EHR</h3>
          </div>
          <p className="text-sm text-gray-600">
            Support for Epic, Cerner, and other major EHR systems with unified API.
          </p>
        </div>
        
        <div className="card">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Activity className="h-5 w-5 text-orange-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Monitoring</h3>
          </div>
          <p className="text-sm text-gray-600">
            Comprehensive monitoring and alerting for integration health and performance.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Integration;